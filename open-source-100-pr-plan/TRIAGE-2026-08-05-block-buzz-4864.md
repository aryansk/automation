# Triage: `block/buzz#4864`

## Selection evidence

- Repository: [block/buzz](https://github.com/block/buzz)
- Issue: [#4864](https://github.com/block/buzz/issues/4864)
- The issue reports that deleting a workflow is accepted, but the definition
  still appears in `workflows list`/`workflows get`, and a later update
  resurrects the same workflow UUID.
- The repository is Apache-2.0 licensed, externally owned, and the issue was
  open, unassigned, and without a competing PR at selection.
- The issue provided precise root-cause pointers in the CLI, relay side-effect,
  and workflow database paths, making this a bounded bug fix rather than a
  speculative feature.

## Implementation

- Checkout: `/Users/aryansingh/Downloads/Projects/Automation/buzz-4864`
- Branch: `codex/issue-4864-workflow-delete`
- Code commit: `83969f130373847188566cc3620a28cc2432b0e3`
- Regression-coverage commit: `368aab1`
- Current branch head: `368aab1`
- The event-driven deletion path now archives the workflow row as a durable
  tombstone and soft-deletes its kind:30620 definition event.
- Normal workflow reads hide archived rows, and the upsert conflict guard
  rejects late updates instead of recreating a deleted UUID.
- Added a PostgreSQL-backed regression test for archive-then-upsert behavior.
- Added an ignored wire-level conformance test covering create, query, delete,
  query-empty, and rejected same-UUID resurrection.

## Validation

- `cargo fmt --all -- --check` passed.
- `cargo test -p buzz-db workflow_status --lib` passed: 4 tests.
- `cargo check -p buzz-relay --tests` passed.
- `cargo clippy -p buzz-relay --tests -- -D warnings` passed.
- `cargo check -p buzz-test-client --tests` passed.
- `cargo clippy -p buzz-test-client --tests -- -D warnings` passed.
- `git diff --check` passed.
- The ignored PostgreSQL regression test compiled but could not execute because
  no local test database was reachable (`PoolTimedOut`).
- The commit includes a DCO sign-off; the local SSH signing key was
  passphrase-locked in this noninteractive session, so cryptographic signature
  verification is not claimed.

## Publication state

An external contributor opened [PR #4882](https://github.com/block/buzz/pull/4882)
after the local implementation was completed. Its title and diff overlap the
same workflow-definition tombstone fix and it is currently open and non-draft.
No `aryansk/buzz` fork or PR was created; the local contribution is not merged
or countable and must not be submitted as a duplicate.

## Next action

Monitor [PR #4882](https://github.com/block/buzz/pull/4882). If it closes
without resolving issue #4864, re-check the live issue and PR state before
considering any distinct follow-up; do not create a duplicate.
