# Codex instructions

Read [AGENTS.md](AGENTS.md), [NOTION_DASHBOARD.md](NOTION_DASHBOARD.md),
[OUTCOME_LEARNING.md](OUTCOME_LEARNING.md), [REVIEW_AUDIT.md](REVIEW_AUDIT.md),
[STATUS.md](STATUS.md), and [WORK_QUEUE.md](WORK_QUEUE.md). They are the
authoritative instructions and resumable state for this folder.

This folder is documentation and evidence infrastructure. Do not infer push,
commit, or PR authorization from the existence of the plan.

Before ending work on a five-PR packet, synchronize the Notion dashboard once
for the complete set of verified PR submissions, append to [WORK_LOG.md](WORK_LOG.md),
run the cursor-based authored-PR comment/review audit in [REVIEW_AUDIT.md](REVIEW_AUDIT.md)
and `scripts/review_audit_delta.sh` (falling back to a full all-state sweep only
when the cursor contract requires it),
and update [STATUS.md](STATUS.md) plus [WORK_QUEUE.md](WORK_QUEUE.md) so
another thread can resume without relying on conversation history.

During the packet, keep interim state in the local Markdown trackers. Do not
spend usage on repetitive Notion reads or writes after each PR action. Sync
once after five newly submitted PRs, or earlier only for a canonical merge,
material maintainer-request change, closure/supersession, or session handoff.
GitHub remains authoritative; re-query only the affected Notion rows and
aggregates after a write.

For new packet selection, prefer large, impactful, active, and currently
relevant repositories with substantial adoption or contributor activity. A
maintainer invitation can justify a smaller-project exception, but it must be
recorded as an exception and should not replace the next high-impact search.
Within that portfolio, choose medium-to-easy issue-backed scopes that can be
implemented and validated quickly; avoid broad architecture work, unresolved
design decisions, and difficult multi-subsystem changes.

Before reserving any candidate, apply the hard gates and 9/13 score in
`OUTCOME_LEARNING.md`. Use the verified merged/closed/comment history to
prioritize concrete issue-backed bug fixes, useful documentation, CI, focused
tests, and contained features. Do not fill a packet with weak candidates, and
handle actionable human feedback before selecting new issues.

Whenever a canonical PR is later verified as merged, update its existing
Open Source PR Tracker row with GitHub's exact `merged_at` date, merge commit,
`PR Status = Merged`, and `Counted = true`. Then create or update the matching
`PRs Merged` date/count row in `📈 Unified Daily Activity`; aggregate multiple
merges on the same date into one row and never infer the date from check time.
