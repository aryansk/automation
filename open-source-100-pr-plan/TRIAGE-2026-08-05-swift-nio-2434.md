# Triage — apple/swift-nio issue #2434 — 2026-08-05

## Selection gate

- **Base repository:** `apple/swift-nio`, external to Aryan, public, Apache-2.0
  licensed, default branch `main`.
- **Issue:** [#2434](https://github.com/apple/swift-nio/issues/2434), still
  open and unassigned when rechecked immediately before implementation.
- **Requested behavior:** make a use-once resolver safe to configure on a
  reusable `ClientBootstrap` by creating a fresh resolver for each actual
  hostname resolution.
- **Duplicate gate:** no open PR referenced or found for #2434 at selection.
  The earlier [PR #2553](https://github.com/apple/swift-nio/pull/2553) is closed
  and unmerged.
- **Maintainer direction:** the issue discussion preferred a NIO-provided
  resolver wrapper. Review on #2553 identified shared-state/concurrent
  invocation problems and recommended avoiding that design.

## Implementation

- Checkout: `/Users/aryansingh/Downloads/Projects/Automation/swift-nio-2434`
- Branch: `codex/issue-2434-dynamic-resolver`
- Commit: `4e72f98d10d00984fde3cec717c95eb5314602d1`
- Change: add public `NIODynamicResolver`; overload `ClientBootstrap.resolver`
  to accept it; create one resolver per hostname connection in both sync and
  async connect paths; add a concurrent connection regression test.
- Design boundary: the factory creates a resolver before the Happy Eyeballs
  runner is constructed, so A/AAAA calls remain paired on one fresh resolver
  without shared mutable pairing state across concurrent connections.

## Validation

- Focused test passed:
  `swift test --filter NIODynamicResolverTest/testCreatesFreshResolverForConcurrentConnections`
- Full `swift test --parallel` completed without reported failures.
- `git diff --check` passed.
- `swift-format` was not run because the executable is not installed in the
  current environment.

## Publication and current state

- Fork: `aryansk/swift-nio`
- Remote branch: `codex/issue-2434-dynamic-resolver`
- Draft PR: [#3692](https://github.com/apple/swift-nio/pull/3692)
- GitHub commit verification: `verified: true`, `reason: valid`.
- Hosted checks: none reported at publication.
- Countable merged PRs from this work: `0`; the draft remains non-countable
  until the canonical PR is merged.

## Next action

Monitor PR #3692 checks and maintainer feedback. Respond only within the
per-connection dynamic-resolver scope; do not open a second PR for #2434.
