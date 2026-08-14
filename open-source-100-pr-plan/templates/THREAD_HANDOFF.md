# Thread handoff

Complete this at the end of every meaningful thread. Copy the completed facts
into `STATUS.md`, update `WORK_QUEUE.md`, and append a short entry to
`WORK_LOG.md`. This template is not evidence of a merged PR by itself.

## Identity

- Date/time and timezone:
- Thread/task:
- Agent or contributor:

## State at handoff

- Current phase:
- Active queue item:
- Repository and checkout:
- Branch:
- Issue URL:
- PR URL and state:
- What is true now:
- Lane state (`RESERVE` / `PREFLIGHTING` / `CLAIMED` / `IMPLEMENTING` /
  `VALIDATING` / `FINAL_PREFLIGHT` / `PUBLISHED` / `ABANDONED_STALE` /
  `BLOCKED`):
- Initial preflight, claim/work-start, final preflight, and publication
  timestamps (UTC):
- Reserve replacement to take next, if any:

## Completed this thread

-

Evidence links or command results:

-

## Still in progress

-

## Single next action

Write one concrete action a new thread can execute without reconstructing the
conversation:

-

## Blockers and decisions needed

-

## Files changed

-

## Checks and commands run

- Command:
  - Result:

## Closeout checklist

- [ ] `STATUS.md` updated with current truth and next action.
- [ ] `WORK_QUEUE.md` updated with status, dependency, and evidence.
- [ ] `WORK_LOG.md` received an append-only entry.
- [ ] `LANE_STATE.json` was verified and the lane timestamps/status were
      updated through `scripts/lane_state.py`.
- [ ] All open PRs authored by `aryansk` were scanned for human comments and
      review threads; every actionable item has a reply URL or a documented
      blocker in `REVIEW_AUDIT.md`.
- [ ] At batch closeout, every verified submitted PR has exactly one Notion
      tracker row with its
      canonical URL, status, queue ID, evidence, and `Counted = false`.
- [ ] The Notion Submitted-per-day aggregate and chart view were recomputed and
      verified once for the complete five-PR packet.
- [ ] No planned or open work was described as merged or complete.
- [ ] Unrelated worktree changes were left untouched.
