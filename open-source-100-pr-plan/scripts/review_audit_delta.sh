#!/usr/bin/env bash
set -euo pipefail

# Incremental authored-PR review audit. A full all-state sweep is the
# baseline; later runs inspect PRs updated after the cursor and saved
# unresolved items. The cursor advances only with --advance.

plan_root="$(cd "$(dirname "$0")/.." && pwd)"
state_file="${OSS_REVIEW_AUDIT_STATE:-$plan_root/REVIEW_AUDIT_STATE.json}"
advance=0

usage() {
  printf 'Usage: %s [--state PATH] [--advance]\n' "$0" >&2
}

while (($#)); do
  case "$1" in
    --state)
      (($# >= 2)) || { usage; exit 2; }
      state_file="$2"
      shift 2
      ;;
    --advance)
      advance=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      usage
      exit 2
      ;;
  esac
done

command -v gh >/dev/null || { echo 'gh is required' >&2; exit 1; }
command -v jq >/dev/null || { echo 'jq is required' >&2; exit 1; }
[[ -f "$state_file" ]] || {
  echo "Missing audit cursor: $state_file. Run a full baseline first." >&2
  exit 1
}

jq -e '(.version == 1) and ((.unresolved_items // []) | type == "array") and ((.processed_item_ids // []) | type == "array")' "$state_file" >/dev/null || {
  echo "Invalid audit cursor schema: $state_file. Run a full baseline first." >&2
  exit 1
}

last_scan_at="$(jq -r '.last_scan_at // empty' "$state_file")"
[[ -n "$last_scan_at" ]] || {
  echo "Audit cursor has no last_scan_at: $state_file" >&2
  exit 1
}

cursor_epoch="$(date -u -j -f '%Y-%m-%dT%H:%M:%SZ' "$last_scan_at" '+%s' 2>/dev/null || true)"
if [[ -z "$cursor_epoch" ]]; then
  cursor_epoch="$(date -u -d "$last_scan_at" '+%s' 2>/dev/null || true)"
fi
[[ -n "$cursor_epoch" ]] || {
  echo "Unparseable audit cursor timestamp: $last_scan_at. Run a full baseline first." >&2
  exit 1
}
now_epoch="$(date -u '+%s')"
if (( now_epoch - cursor_epoch > 604800 )); then
  echo "Audit cursor is older than seven days ($last_scan_at). Run a full baseline first." >&2
  exit 1
fi

detail_query='query($owner:String!,$name:String!,$number:Int!){repository(owner:$owner,name:$name){pullRequest(number:$number){url number state isDraft updatedAt author{login} comments(first:100){nodes{id author{login} authorAssociation body createdAt url}} reviews(first:100){nodes{id author{login} authorAssociation state body submittedAt url commit{oid}}} reviewThreads(first:100){nodes{id isResolved comments(first:100){nodes{id author{login} authorAssociation body createdAt url}}}}}}}'
search_query="author:aryansk type:pr updated:>=$last_scan_at"
metadata_query='query($q:String!){search(query:$q,type:ISSUE,first:100){pageInfo{hasNextPage endCursor} nodes{... on PullRequest{url number state isDraft updatedAt repository{nameWithOwner}}}}}'

metadata="$(gh api graphql -f query="$metadata_query" -F q="$search_query")"
if [[ "$(jq -r '.data.search.pageInfo.hasNextPage' <<<"$metadata")" == "true" ]]; then
  echo 'Delta query returned more than 100 PRs; do not advance the cursor.' >&2
  exit 1
fi

unresolved_json="$(jq -c '[.unresolved_items[]?.id] // []' "$state_file")"
processed_json="$(jq -c '[.processed_item_ids[]?] // []' "$state_file")"
seen_prs='[]'
emitted_ids='[]'

emit_events() {
  local fullrepo="$1" number="$2"
  local owner="${fullrepo%%/*}" repo="${fullrepo#*/}"
  local detail
  detail="$(gh api graphql -f query="$detail_query" -F owner="$owner" -F name="$repo" -F number="$number")"
  local rows
  rows="$(jq -r --arg cutoff "$last_scan_at" --argjson unresolved "$unresolved_json" --argjson processed "$processed_json" \
    '.data.repository.pullRequest as $p |
     ([ $p.comments.nodes[]? |
        {kind:"COMMENT", id:.id, login:(.author.login // "unknown"), association:.authorAssociation,
         at:.createdAt, url:.url, body:(.body // "")} ] +
      [ $p.reviews.nodes[]? |
        {kind:"REVIEW", id:.id, login:(.author.login // "unknown"), association:.authorAssociation,
         at:.submittedAt, url:.url, body:(.body // "")} ] +
      [ $p.reviewThreads.nodes[]?.comments.nodes[]? |
        {kind:"INLINE", id:.id, login:(.author.login // "unknown"), association:.authorAssociation,
         at:.createdAt, url:.url, body:(.body // "")} ]) |
     map(select(.login != "aryansk" and .body != "" and
       (((.at // "") >= $cutoff and (.id as $id | ($processed | index($id)) == null)) or
        (.id as $id | ($unresolved | index($id)) != null)))) |
     .[]? |
     [$p.url,$p.state,(if $p.isDraft then "DRAFT" else "READY" end),$p.updatedAt,
      .kind,.id,.login,.association,.at,.url,(.body|gsub("\\r?\\n";" ")|.[0:1200])] |
     @tsv' <<<"$detail")"
  [[ -n "$rows" ]] || return 0
  printf '%s\n' "$rows"
  while IFS= read -r event_id; do
    [[ -n "$event_id" ]] || continue
    emitted_ids="$(jq --arg id "$event_id" '. + [$id] | unique' <<<"$emitted_ids")"
  done < <(printf '%s\n' "$rows" | cut -f6 | sort -u)
}

while IFS=$'\t' read -r url number state draft updated fullrepo; do
  [[ -n "${fullrepo:-}" ]] || continue
  emit_events "$fullrepo" "$number"
  seen_prs="$(jq --arg url "$url" '. + [$url] | unique' <<<"$seen_prs")"
done < <(jq -r '.data.search.nodes[] | [.url,.number,.state,(if .isDraft then "DRAFT" else "READY" end),.updatedAt,.repository.nameWithOwner] | @tsv' <<<"$metadata")

# Re-check unresolved PRs even if GitHub did not surface an updatedAt change.
while read -r unresolved_pr; do
  [[ -n "$unresolved_pr" ]] || continue
  if jq -e --arg url "$unresolved_pr" 'index($url) != null' <<<"$seen_prs" >/dev/null; then
    continue
  fi
  fullrepo="$(sed -E 's#https://github.com/([^/]+/[^/]+)/pull/[0-9]+#\1#' <<<"$unresolved_pr")"
  number="$(sed -E 's#.*/pull/([0-9]+).*#\1#' <<<"$unresolved_pr")"
  [[ "$fullrepo" != "$unresolved_pr" && "$number" != "$unresolved_pr" ]] || continue
  seen_prs="$(jq --arg url "$unresolved_pr" '. + [$url] | unique' <<<"$seen_prs")"
  emit_events "$fullrepo" "$number"
done < <(jq -r '.unresolved_items[]?.pr | select(. != null)' "$state_file" | sort -u)

if ((advance)); then
  now="$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
  tmp="$(mktemp "${state_file}.XXXXXX")"
  jq --arg now "$now" --argjson prs "$seen_prs" \
    --argjson emitted "$emitted_ids" \
    '.last_scan_at=$now | .last_scan_mode="delta" | .last_scan_prs=$prs |
     .processed_item_ids=((.processed_item_ids // []) + $emitted | unique) | .updated_at=$now' \
    "$state_file" >"$tmp"
  mv "$tmp" "$state_file"
  printf '# cursor advanced to %s (%s PRs rechecked)\n' "$now" "$(jq 'length' <<<"$seen_prs")" >&2
else
  printf '# cursor not advanced; pass --advance only after recording every result\n' >&2
fi
