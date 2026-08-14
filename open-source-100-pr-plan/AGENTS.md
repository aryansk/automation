# Agent instructions: open-source 100-PR plan

This folder is the source of truth for the external-contribution plan and its
evidence. Read this file before changing the plan, tracker, or templates.

## Scope

The plan has two distinct outcomes:

1. Build a truthful record of pull requests merged into repositories Aryan
   does not own.
2. Build a separate maintainer/adoption record for an owned open-source
   project.

Never mix those outcomes. Work in `aryansk/*` repositories can support the
maintainer track but cannot be counted as external PRs for the Anthropic
100-PR route.

## Memory and thread-resume process

Keep the project resumable for a new agent or thread. Use these files for these
purposes:

| File | Role | Update rule |
| --- | --- | --- |
| `STATUS.md` | Current state, completed work, active work, blockers, and exact next pickup | Rewrite the snapshot at the start and end of meaningful work |
| `WORK_QUEUE.md` | Prioritized work that still needs to be done | Change status only when evidence or a decision changes it |
| `WORK_LOG.md` | Append-only history of actions and outcomes | Append an entry at each handoff; do not rewrite old entries |
| `PLAN.md` | Long-term strategy and decision gates | Change only when the strategy changes |
| `PR_TRACKER.md` | Merged evidence plus open-submission reconciliation | Keep open/draft rows separate from the merged count |
| `REVIEW_AUDIT.md` | Human and automated PR-comment audit across every authored PR state | Append each batch's scan, action, reply URL, and unresolved blocker |
| `NOTION_DASHBOARD.md` | Notion per-PR tracker, daily submission chart, and daily merge chart contract | Sync submissions once after the complete five-PR packet; sync merge dates and daily merge counts whenever a canonical merge is verified |
| `OUTCOME_LEARNING.md` | Evidence-based selection rules from merged, open, closed, and commented PRs | Recalculate after each complete packet or weekly; never use it to override live repository policy |
| `LANE_STATE.json` | Current sequential packet state, reserve pool, lane statuses, and timestamps | Update through `scripts/lane_state.py`; never treat a stale reserve entry as current eligibility |
| `scripts/lane_state.py` | Small local state-machine guard for one active lane and canonical publication counting | Verify before and after every lane transition; live GitHub remains authoritative |

### New-thread startup

1. Read `AGENTS.md`, `NOTION_DASHBOARD.md`, `OUTCOME_LEARNING.md`,
   `REVIEW_AUDIT.md`, `STATUS.md`, and `WORK_QUEUE.md`.
2. Read the relevant section of `PLAN.md`, `REPO_MATRIX.md`, and the target
   repository's own instructions.
3. Verify that the active queue item, branch, issue, PR, and external state are
   still current. Treat stale notes as leads, not facts.
4. Verify `LANE_STATE.json` with `python3 scripts/lane_state.py --state
   LANE_STATE.json verify`, then select at most one reserve lane for fresh
   preflight. Mark that queue item `IN PROGRESS` and record the thread's exact
   scope in `STATUS.md` before making changes.

### Handoff and recovery

Before pausing or ending a thread, use `templates/THREAD_HANDOFF.md` and update
`STATUS.md`, `WORK_QUEUE.md`, and `WORK_LOG.md`. The handoff must state:

- what was completed and the evidence for it;
- what is currently in progress, including repository, branch, issue, and PR;
- the single next concrete action a new thread should take;
- blockers, user decisions, failed checks, and unresolved uncertainty;
- exact files changed and commands/checks run.

Never describe planned work as completed. If a thread stops mid-task, leave the
queue item `IN PROGRESS` or `BLOCKED`, not `DONE`. If an assumption becomes
false, append a correction to `WORK_LOG.md` and update `STATUS.md`.

## Review and comment response gate

After the initial baseline, and whenever a review-oriented thread is
continued, use the saved review cursor in `REVIEW_AUDIT_STATE.json` and run
`scripts/review_audit_delta.sh`. It queries authored PRs updated at or after
the last cursor (with processed event IDs preventing duplicate replies) and
rechecks saved unresolved items. Run the full all-state sweep (open, merged, and recently closed) when the cursor is
missing/corrupt, older than seven days, or pagination/coverage cannot be
proven. This preserves the all-state safety guarantee without re-reading every
unchanged PR on every packet.

- Classify each item as automated noise, automated actionable check, human
  acknowledgement, human question, requested change, approval, or blocker.
- Reply once to every new non-self bot or human comment when GitHub provides a
  reply surface, including deployment previews, routine welcome messages, bot
  summaries, CI results, labels, and policy notices. Keep the reply concise,
  truthful, and specific: acknowledge the recorded state, identify any
  contributor action, and link the relevant commit, test, or PR. Do not repeat
  a reply for the same processed event ID.
- When a human requests code, docs, tests, or a PR-state change, inspect the
  current base branch, implement the smallest justified change, run the
  requested validation, push only the reviewed paths, and reply with the exact
  result. Mark a draft ready only when the current validation is complete and
  the maintainer's request supports that state.
- When a comment requires a CLA, DCO/legal acceptance, cryptographic identity
  signing, human evidence, or an action only the maintainer can perform, do
  not impersonate, accept, sign, or claim completion. Record the blocker,
  explain the exact user action needed, and reply truthfully that the action is
  outstanding when GitHub permits a response.
- Automated policy/CI comments still affect the workflow state. Record every
  one, reply once when possible with the exact state or blocker, follow safe
  repository commands only when authorized by repository policy, and never
  use maintainer-only commands such as `/approve` or `/ok-to-test`.
- For automated review suggestions, inspect the exact changed lines and apply
  them only when they are relevant, non-duplicative, and safe under the
  repository contribution rules. Re-run validation and record the decision or
  reply with evidence; if the bot asks for a legal, identity, cryptographic,
  or maintainer-only action, record the blocker instead of satisfying it.
- At closeout, verify every emitted human or bot item has a reply URL, a
  resulting state, or an explicit non-replyable blocker/decision. Append the
  open items and next check to `STATUS.md`, `WORK_QUEUE.md`, and `WORK_LOG.md`.

## Usage-efficient Notion synchronization

Optimize model usage by keeping operational state locally and treating Notion
as a reporting layer rather than the primary source of truth.

- GitHub is authoritative for PR state, merge status, merge commit, reviews,
  maintainer comments, and CI status.
- Keep interim progress in `STATUS.md`, `WORK_QUEUE.md`, `PR_TRACKER.md`,
  `WORK_LOG.md`, and `REVIEW_AUDIT.md`. Do not update Notion after every
  individual edit, test, comment, or small status change.
- Synchronize Notion once after every five newly submitted canonical PRs.
  Reconcile all five individual rows first, then update the daily submitted
  aggregate once and re-query the result.
- Perform an earlier minimum sync only when a PR merges, a maintainer request
  materially changes the contribution, a PR is closed or superseded, or the
  session is ending with important unsynced state.
- Do not repeatedly query the full Notion database when the needed state is
  already recorded locally. Fetch the schema only when required, use bulk
  create/update operations where supported, and verify only the affected rows
  and aggregates after writing.
- Never delay actionable GitHub feedback while waiting for a Notion batch.
  Respond, test, and record it locally first; synchronize the reporting layer
  afterward.
- Prioritize usage in this order: legitimate issue discovery, repository
  understanding, correct implementation, tests, maintainer responses,
  high-quality PR publication, local tracking, then Notion administration.

Standard cycle: PRs 1–4 use local tracking only; PR 5 triggers the consolidated
GitHub audit and one Notion sync. Merge reconciliation remains immediate when a
canonical merge is verified so the exact merge date and daily graph stay
accurate.

## Non-negotiable rules

- Never create artificial, duplicate, trivial, or meaningless pull requests.
- One PR should represent one coherent bug fix, test improvement, documentation
  correction, compatibility fix, or useful feature.
- Search current issues and pull requests before proposing work.
- Use the canonical base repository and branch. Do not count a PR against a
  personal fork as an external contribution if the base repository is owned by
  Aryan.
- A PR counts only after it is actually merged. Open, closed, draft, reverted,
  or abandoned PRs do not count.
- Record the canonical PR URL, base repository, merge commit, merge date,
  reviewer/maintainer interaction, and verification in `PR_TRACKER.md`.
- When a canonical PR merges, update the existing Notion tracker row with the
  exact GitHub `merged_at` date, `Merge Commit`, `PR Status = Merged`, and
  `Counted = true`; then create or update the matching `PRs Merged` daily row
  in `📈 Unified Daily Activity`. Never infer the merge date from check time.
- Never claim eligibility from stars, local commits, generated QA, or an
  unsubmitted PR.
- Treat AI-assisted code as the contributor's responsibility. Do not submit
  code or tests that cannot be explained during review.
- Preserve licenses, attribution, security boundaries, and upstream project
  conventions.
- Do not access or modify the excluded Makoro-Mobile checkout.

## Repository selection priority

The default next-packet filter is **large, impactful, active, and currently
relevant open-source projects**. Prefer repositories with meaningful adoption,
strong contributor activity, an active release or issue cadence, and a
maintainer-reviewed issue that maps to a useful change. Use live popularity or
ecosystem evidence as a selection signal, but never treat stars alone as
proof of impact or acceptance probability.

Small or niche repositories are not the default target. A direct maintainer
invitation may justify an exception when the issue is concrete and useful;
label that exception in the queue and return to the high-impact portfolio for
the next packet. Do not open several low-impact PRs merely to increase the
submission count.

Within the high-impact portfolio, prefer medium-to-easy issue-backed work that
can be implemented and validated in a short session: focused documentation,
small regression fixes, narrow tests, and contained developer-experience
changes. Reject a lane when the likely implementation is broad, architectural,
or dependent on an unresolved design decision. Popularity does not justify
choosing a contribution that is too difficult for the current packet.

## Outcome-driven selection and learning

Use `OUTCOME_LEARNING.md` before reserving every issue. The purpose is to
increase the probability of useful upstream work being accepted while keeping
the record truthful; it is not permission to manufacture volume or to treat
past merges as a guarantee.

- Apply the hard gates first: current open issue, no competing implementation,
  clear repository policy, clear base branch/ownership, and a focused
  validation path.
- Score surviving candidates using maintainer demand, scope clarity,
  validation fit, repository impact, prior constructive response, and concrete
  user benefit. Reserve only candidates scoring at least 9/13 with no hard-gate
  failure.
- Prefer the observed successful shape: concrete issue-backed bug fixes,
  focused docs, CI improvements, narrow tests, and contained features. A README
  change must solve a real documentation problem; visual polish alone is not a
  default selection.
- Treat anti-automation/drive-by policy, duplicate or maintainer-owned work,
  unresolved design, missing labels, and CLA/DCO/identity requirements as
  selection blockers. Do not try to overcome them with a comment, star, signed
  claim, or fabricated evidence.
- Do not fill a five-PR packet with weak candidates. If fewer than five pass
  the gate, keep the smaller legitimate set and record why the remaining slots
  were deferred.
- After each packet, classify every meaningful state change as merged, open,
  closed-policy, closed-duplicate, closed-design, closed-CI, closed-scope,
  or unknown. Update the ledger only from live GitHub evidence and promote a
  selection rule only after at least two independent examples support it.
- Handle new human feedback before choosing fresh issues. Constructive reviews
  and resolved requested changes are positive maintainer signals; an
  architecture question or a drive-by rejection is a reason to pause or defer,
  not to push harder.

## Repository safety

- Inspect `git status`, remotes, branch, contribution instructions, and current
  diffs before editing a repository.
- The parent Automation worktree may contain unrelated user changes. Keep this
  folder's work isolated and never clean, reset, overwrite, or stage unrelated
  files.
- Never use `git add -A`, `git add .`, force-push, history rewrite, or remote
  changes.
- Branch creation, commits, pushes, and PR creation each require explicit
  authorization. A request to prepare a plan does not authorize publication.
- For a PR, resolve the exact base/head repositories and branches. Reuse an
  existing matching PR rather than creating a duplicate.
- Default new PRs to draft unless the user explicitly asks for a ready PR.
- Keep the resumable state files synchronized before handing work back to the
  user or another thread.
- After the complete five-PR packet is verified, sync one deduplicated Notion
  row per submitted PR and recompute the daily chart once. Do not pause between
  lanes for dashboard work. If the batch closeout sync fails, leave the task
  visibly blocked rather than claiming the dashboard is current.

## Sequential five-PR publication loop (mandatory)

The target is five valid, canonical, open upstream draft PRs, not five issues
researched or five local commits prepared. Never select five implementation
lanes up front. Work one lane from `RESERVE` through `PUBLISHED`, then perform
the next lane. A review request or maintainer response takes priority over
fresh discovery; return to this loop only after the review action is answered
or explicitly blocked.

Use `LANE_STATE.json` and `scripts/lane_state.py` as the lightweight local
state machine. The allowed operational statuses are:

`RESERVE -> PREFLIGHTING -> CLAIMED -> IMPLEMENTING -> VALIDATING ->
FINAL_PREFLIGHT -> PUBLISHED`, with `ABANDONED_STALE` or `BLOCKED` exits.
`CLOSED_DUPLICATE` records a publication that later became invalid and
decrements the valid-published total. Record `initial_preflight_at`,
`claim_or_work_start_at`, `final_preflight_at`, and `published_at` when those
events occur. Only one lane may be outside `RESERVE`, `PUBLISHED`,
`ABANDONED_STALE`, `BLOCKED`, or `CLOSED_DUPLICATE` at a time.

A reserve pool of roughly 8–10 lightweight leads is allowed to keep discovery
efficient, but reserve entries are only leads. Do not implement, branch, or
claim them until the selected lane receives a fresh live preflight. Candidate
eligibility expires as soon as the issue, PR list, assignment, maintainer
policy, or base branch changes; there is no 20-minute validity window.

Before implementation, transition the selected lane to `PREFLIGHTING` and
recheck the canonical issue and repository live. The preflight must establish:

- the issue is open, unassigned or legitimately available, and has no claim
  comment or active overlapping PR;
- no recent unlinked PR already implements the same change, including work in
  the current packet;
- the contribution policy, assignment/CLA/DCO/AI-assistance and identity gates
  permit the intended action;
- the scope is bounded, issue-backed, reproducible, and has a concrete local
  validation path; and
- the candidate is not being chosen merely because a packet slot is empty or
  because the same repository is currently concentrated in the batch.

Where repository norms permit it, claim or signal intent immediately after
this preflight and record the exact comment or assignment URL. Then implement
only that lane. If the issue is stale, claimed, duplicated, closed, policy
blocked, or no longer bounded, transition it to `ABANDONED_STALE` or `BLOCKED`
with the reason and automatically take the next reserve candidate; do not
justify continuing because work has already started.

After local validation, transition to `FINAL_PREFLIGHT` and repeat the live
issue/PR/policy/overlap checks immediately before pushing or opening the PR.
If any final check fails, abandon the lane, preserve its evidence, and move to
the reserve pool. Only after a successful final preflight may the lane be
pushed and opened as a draft. Verify the canonical URL, author, intended base,
fork head hash, open/draft state, and any required policy/CI evidence. Then
transition to `PUBLISHED` with `--verified`; the script counts it only when
those canonical fields and the publication timestamp are present.

If a PR is closed, superseded, or found to be a duplicate after publication,
record `CLOSED_DUPLICATE` or `ABANDONED_STALE` with the canonical evidence and
replace it while the run is active when a reserve candidate can pass both fresh
preflights. Do not count a closed or invalid PR, and do not ask for permission
to use an obvious reserve replacement unless a real ambiguity or blocker
requires a decision. Stop after five `PUBLISHED` lanes, then run the review
cursor audit and the single Notion closeout for those five canonical rows.

## Detailed contribution checklist for the current sequential lane

0. Select one `RESERVE` lane and run the mandatory live preflight before
   creating a branch or implementing anything.
1. Record the initial preflight timestamp and exact issue/PR/policy evidence in
   `templates/ISSUE_TRIAGE.md`.
2. Claim or signal intent when the repository permits it, then record the
   claim/work-start timestamp and URL.
3. Reproduce the issue on the current supported branch.
4. Create a focused branch and implement the smallest complete fix with
   meaningful regression coverage.
5. Run the repository's required checks and capture commands/results.
6. Transition through `VALIDATING` to `FINAL_PREFLIGHT`; repeat the live
   overlap, issue, policy, base, and assignment checks immediately before
   publication.
7. Prepare the draft using `templates/PR_DESCRIPTION.md`, push only reviewed
   paths, and verify the canonical URL, author, intended base, fork head, open
   state, and required checks.
8. Mark the lane `PUBLISHED` only through the verified state transition. If
   the final preflight fails, mark it stale/blocked and use the next reserve
   lane automatically.
9. Update `STATUS.md`, `WORK_QUEUE.md`, and append `WORK_LOG.md` after each
   lane; do not wait until five unrelated lanes are simultaneously in flight.
10. Prioritize reviewer feedback and maintainer requests before fresh issue
    discovery. After five valid `PUBLISHED` lanes, run the review audit and
    the one deduplicated Notion closeout.
11. After merge, complete `templates/POST_MERGE_RECORD.md`, update the
    per-PR tracker row, update the daily `PRs Merged` activity row, and update
    both local trackers.
12. At packet closeout, append outcome, closure reason, maintainer signal, and
    selection lesson to `OUTCOME_LEARNING.md`.

## Evidence commands

For a merged PR, verify the state from the canonical repository before recording
it. The exact command may vary by host, but the evidence must show the PR URL,
base repository, merged state, exact `merged_at` timestamp/date, and merge
commit. The date written to Notion must come from that GitHub value.

Do not treat a locally created commit, a pushed branch, or an uploaded patch as
merged evidence.

## Program sources

- [Claude for Open Source](https://claude.com/contact-sales/claude-for-oss)
- [Codex for Open Source](https://developers.openai.com/community/codex-for-oss)

Re-check both pages immediately before an application because program wording
and thresholds can change.
