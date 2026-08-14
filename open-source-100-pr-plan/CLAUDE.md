# Claude instructions

Read [AGENTS.md](AGENTS.md) first, then [REVIEW_AUDIT.md](REVIEW_AUDIT.md),
[STATUS.md](STATUS.md), and [WORK_QUEUE.md](WORK_QUEUE.md). They are the
authoritative instructions and resumable state for this folder.

Use [PLAN.md](PLAN.md) for strategy, [REPO_MATRIX.md](REPO_MATRIX.md) for
repository selection, and record only real merged contributions in
[PR_TRACKER.md](PR_TRACKER.md).

For a new packet, work one lane at a time. A reserve entry is only a lead:
run a fresh live preflight immediately before implementation and repeat it
immediately before publication. Use the state machine in `LANE_STATE.json`
(`RESERVE`, `PREFLIGHTING`, `CLAIMED`, `IMPLEMENTING`, `VALIDATING`,
`FINAL_PREFLIGHT`, `PUBLISHED`, `ABANDONED_STALE`, and `BLOCKED`) and record
the four lane timestamps. If an issue closes, is claimed, or duplicates an
existing PR, abandon it and use the next reserve candidate without sunk-cost
justification. Count only canonical, head-verified open drafts.

At the end of a thread, update `STATUS.md`, `WORK_QUEUE.md`, and
[WORK_LOG.md](WORK_LOG.md), and complete the all-open-PR comment audit. Leave a
precise next action and any unresolved human-review blocker for the next
thread.
