# Triage: swift-server/swift-service-lifecycle #163

## Live selection evidence

- Repository: [swift-server/swift-service-lifecycle](https://github.com/swift-server/swift-service-lifecycle)
- Issue: [#163 — Provide a `CancelOnGracefulShutdownService`](https://github.com/swift-server/swift-service-lifecycle/issues/163)
- Issue state at latest recheck: open, unassigned, labelled `good first issue`
- Existing issue-specific PR at latest recheck: none
- Repository contribution guide: [CONTRIBUTING.md](https://github.com/swift-server/swift-service-lifecycle/blob/main/CONTRIBUTING.md)
- License: Apache-2.0
- Maintainer context: `adam-fowler` proposed a separate `CancellableService`
  protocol for this wrapper; `FranzBusch` later asked to wait for user reports
  after graceful-to-cancellation escalation support shipped. This is an open
  issue with design interest, not current maintainer approval to publish.

## Local implementation

- Checkout: `/Users/aryansingh/Downloads/Projects/Automation/swift-service-lifecycle-163`
- Branch: `codex/issue-163-cancel-on-graceful-shutdown`
- Commits: `cfab3a6`, followed by `893037f`
- Change: added generic `CancelOnGracefulShutdownService` that delegates to the existing `cancelWhenGracefulShutdown` primitive, introduced the maintainer-proposed `CancellableService` abstraction, documented it in the DocC index, and added focused cancellation and error-propagation tests.

## Validation

- `swift test --filter CancelOnGracefulShutdownServiceTests`: 2 passed
- `swift test`: 71 passed, 0 failures
- `git diff --check`: passed
- `git diff --cached --check`: passed before commit `893037f`

## Publication state

No fork, push, or PR exists. Publication is blocked both by the account-level refined-github maintainer request in [PR #9941](https://github.com/refined-github/refined-github/pull/9941) and by the issue's latest maintainer request to wait for user reports. Resolve both conditions before opening anything. This local branch is evidence of preparation only and does not count toward the merged external-PR total.
