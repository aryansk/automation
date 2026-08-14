# Open-source 100-PR plan

This folder is the operating plan for building a truthful record of pull
requests merged into public repositories that Aryan does not own.

It is aimed at the active-contributor route in the [Claude for Open Source
Program](https://claude.com/contact-sales/claude-for-oss), which currently lists
100 or more pull requests merged into repositories the applicant does not own
during the previous 12 months.

This folder itself does **not** count. Pull requests merged into `aryansk/*`
repositories do **not** count toward that Anthropic route.

## Start here

1. Read [AGENTS.md](AGENTS.md) before doing contribution work.
2. Read [STATUS.md](STATUS.md) for the current resumable snapshot.
3. Read [REVIEW_AUDIT.md](REVIEW_AUDIT.md) for outstanding human review
   requests and blockers.
4. Read [WORK_QUEUE.md](WORK_QUEUE.md) and pick up the highest-priority item
   that is `READY` or `IN PROGRESS`.
5. Read [PLAN.md](PLAN.md) for the phases, targets, and decision gates.
6. Use [REPO_MATRIX.md](REPO_MATRIX.md) to choose legitimate upstream work.
7. Use the [top-10 README portfolio](TOP10-README-PORTFOLIO-2026-08-02.md) for
   the live high-star repository snapshot and README-specific triage gates.
8. Record every actual PR in [PR_TRACKER.md](PR_TRACKER.md).
9. Record ownership, reviewer, merge, release, and adoption evidence in
   [EVIDENCE_LEDGER.md](EVIDENCE_LEDGER.md).
10. After every five valid `PUBLISHED` PR lanes, run the review cursor delta audit in
    [`scripts/review_audit_delta.sh`](scripts/review_audit_delta.sh) and reply
    to new or still-unresolved actionable human comments with verified
    evidence. Re-run the full all-state baseline only when the cursor contract
    requires it.
11. Before ending a thread, update `STATUS.md`, `WORK_QUEUE.md`, and
   [WORK_LOG.md](WORK_LOG.md) using
   [templates/THREAD_HANDOFF.md](templates/THREAD_HANDOFF.md).

For new work, follow the sequential publication protocol in `AGENTS.md` and
`LANE_STATE.json`: reserve leads may support efficient discovery, but only one
candidate is deeply preflighted and implemented at a time. Recheck live before
implementation and immediately before publication; count only canonical,
head-verified open drafts. Run
`python3 scripts/lane_state.py --state LANE_STATE.json verify` when resuming.

`STATUS.md` is the current truth, `WORK_QUEUE.md` is the pickup list, and
`WORK_LOG.md` is the append-only history. A new thread should verify that
snapshot against GitHub and the relevant checkout before continuing.

## Incremental review cursor

After the initial all-state baseline, run:

```sh
bash scripts/review_audit_delta.sh
```

Classify every emitted event and record its reply URL, resulting state, or
blocker. Then advance the cursor:

```sh
bash scripts/review_audit_delta.sh --advance
```

`REVIEW_AUDIT_STATE.json` stores the inclusive cutoff, processed GitHub event
IDs, and intentionally unresolved items. The script rechecks only newly
updated authored PRs plus those unresolved items, suppresses already processed
events, and refuses malformed or over-seven-day state so a full baseline is
required when coverage is uncertain.

## External repository portfolio

The active portfolio and candidate pool are maintained in
[REPO_MATRIX.md](REPO_MATRIX.md). Current active targets are [Tuist](https://github.com/tuist/tuist),
[HyperFrames](https://github.com/heygen-com/hyperframes), [Vercel skills](https://github.com/vercel-labs/skills),
and [SwiftLint](https://github.com/realm/SwiftLint). The pool also includes
Vapor, Swift Argument Parser, Swift NIO, The Composable Architecture, Alamofire,
swift-format, swift-syntax, and Swift Service Lifecycle.

The portfolio broadens discovery; it does not authorize duplicate, trivial, or
simultaneous PR volume. Each issue must be rechecked against the canonical
repository before implementation.

## Separate maintainer track

The owned-project track is separate from the 100-PR count. The strongest
candidate is a reusable StoryTime-derived story graph package; Automation can
later provide a clean, credential-free HyperFrames news template. See
[REPO_MATRIX.md](REPO_MATRIX.md).

## Baseline snapshot

On 2026-08-02, the `aryansk` GitHub search used for this plan returned no merged
PRs whose base repository was outside the `aryansk` account. Re-run the query
before using this number in an application, and account for any other GitHub
identities or email addresses.

The local HyperFrames checkout is at
`/Users/aryansingh/Downloads/Projects/hyperframes-upstream`; the Vercel skills
checkout is at `/Users/aryansingh/Downloads/Projects/Automation/vskills`.
The active Tuist checkout is at
`/Users/aryansingh/Downloads/Projects/Automation/tuist-11693`, with draft PR
[#12203](https://github.com/tuist/tuist/pull/12203) awaiting review. The active
SwiftLint checkout is at
`/Users/aryansingh/Downloads/Projects/Automation/swiftlint-6828`, with draft PR
[#6854](https://github.com/realm/SwiftLint/pull/6854) awaiting review.
