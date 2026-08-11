# Issue triage: `swift-server/swift-service-lifecycle#248`

## Snapshot

- **Checked:** 2026-08-02
- **Issue:** [#248](https://github.com/swift-server/swift-service-lifecycle/issues/248)
- **Title:** `ServiceGroup` silently discards the entire run when
  `triggerGracefulShutdown()` arrives before `run()`
- **State:** Open; unassigned
- **Repository:** Public `swift-server/swift-service-lifecycle`, default branch
  `main`
- **Related open PRs:** None found by the exact issue search at verification

## Maintainer and scope gate

- A maintainer comment explicitly welcomes a PR that starts services and then
  immediately shuts them down, with tests.
- The issue includes a race reproduction and explains the lifecycle/resource
  cleanup impact. It is larger than the SwiftLint fix and requires a focused
  state-machine test before implementation.
- `CONTRIBUTING.md` asks for concise, tested changes, API documentation where
  needed, and a strong commit message. Non-trivial public API changes should
  use the proposal process first.

## Next exact action

Clone current `main` into an isolated checkout, inspect `ServiceGroup` and its
existing tests, reproduce the pre-start shutdown ordering, and implement the
smallest behavior consistent with the maintainer invitation. Do not publish a
PR until the failing test, passing regression, full relevant test target, and
canonical duplicate check are recorded.
