# Contribution operating rules

This document governs work performed under the 100-PR plan. The target
repository's own contribution guide always takes precedence.

## Before coding

- Confirm the canonical repository, default branch, license, and contribution
  guide.
- Check open issues and pull requests for duplicates or existing ownership.
- Reproduce the bug or state the user problem precisely.
- Record the plan in `templates/ISSUE_TRIAGE.md`.

## During coding

- Keep one coherent scope per PR.
- Prefer a test or fixture that would fail before the change.
- Preserve public APIs unless the issue explicitly calls for a breaking change.
- Avoid generated files, vendored dependencies, secrets, personal assets, and
  unrelated formatting churn.
- Follow upstream naming, formatting, commit, and test conventions.

## Before opening a PR

- Run the project's required build, typecheck, lint, and test commands.
- Review `git diff --stat`, `git diff --check`, and the exact changed paths.
- Confirm the base/head repository pair.
- Use `templates/PR_DESCRIPTION.md`.
- Request a draft PR unless the user explicitly authorizes a ready PR.

## After review and merge

- Respond to every substantive reviewer comment.
- After each five-PR packet, run the saved review-cursor delta audit in
  `scripts/review_audit_delta.sh`. It checks PRs updated at or after the last
  pass, suppresses already processed event IDs, and rechecks unresolved items
  from `REVIEW_AUDIT_STATE.json`; use a full
  open/merged/closed sweep only when the cursor is missing, stale, or
  incomplete. Reply to questions, requests, approvals, and blockers with
  evidence; do not reply to routine bot noise.
- Inspect automated review suggestions and policy checks as well. Apply an
  automated suggestion only when the exact lines, repository rules, and tests
  justify it; record the decision and validation, and treat legal, identity,
  cryptographic, or maintainer-only bot requests as blockers.
- Implement requested code/docs/tests only after rechecking the current base
  branch and the exact thread. Run validation before replying. Mark a draft
  ready only when the requested work is complete.
- Do not accept CLAs, make legal/identity attestations, create human evidence,
  or manufacture cryptographic signatures. Record those as explicit blockers
  and tell the maintainer what must be done by the contributor.
- Record every actionable thread's reply URL, resulting state, or blocker in
  `REVIEW_AUDIT.md`.
- Do not count the contribution before GitHub reports `MERGED`.
- Record the merge commit, date, checks, reviewer, and release impact in
  `templates/POST_MERGE_RECORD.md`.
- Add the final row to `PR_TRACKER.md` and update the evidence ledger.

## Handoff checkpoint

At the end of every contribution session, even when no PR was opened:

- update `STATUS.md` with the verified state and one exact next action;
- update `WORK_QUEUE.md` with the item's current status and evidence;
- append the outcome to `WORK_LOG.md`;
- record blockers and user decisions in the thread-handoff template.

## Prohibited shortcuts

- No meaningless documentation padding.
- No splitting one feature into many PRs to inflate the number.
- No duplicate PRs across forks.
- No claims based on stars or local commits.
- No force-push or history rewrite.
