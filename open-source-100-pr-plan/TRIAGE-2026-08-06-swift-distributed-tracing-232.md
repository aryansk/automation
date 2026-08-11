# Triage — Swift Distributed Tracing #232

## Live selection gate — 2026-08-06

- Issue [#232](https://github.com/apple/swift-distributed-tracing/issues/232),
  “`MultiplexInstrument` does not fan out to all tracers,” is open.
- The current issue-specific PR search returned no matching PR.
- Maintainers agreed that the current first-tracer behavior is accidental and
  that span creation should fan out to every tracer in the multiplex. The issue
  discussion also identifies the need to forward span updates and error
  recording.
- `apple/swift-distributed-tracing` is public, externally owned, on `main`, and
  reports the Apache-2.0 license through GitHub. Its contribution guide asks for
  concise, tested, documented patches and uses the Apache 2.0 contribution
  license.

## Scope

Add a package-scoped type-erased `MultiplexTracer` and `MultiplexSpan`. Global
tracer lookup now returns the fan-out wrapper when multiple legacy/modern
tracers are configured. Span creation, context propagation, attributes, status,
events, links, errors, ending, and force flush are forwarded to each underlying
tracer. A focused test covers both direct tracer access and the global
`withSpan` path.

## Local implementation

- Checkout: `/Users/aryansingh/Downloads/Projects/Automation/swift-distributed-tracing-232`
- Branch: `codex/issue-232-multiplex-tracer`
- Commit: `603da5b` — `Fix MultiplexInstrument tracer fan-out`
- Validation: focused global-instrumentation tests passed; the full package
  suite passed 58 tests with 0 failures; Swift format lint and
  `git diff --check` passed.

## Publication state

Created the `aryansk/swift-distributed-tracing` fork, pushed
`codex/issue-232-multiplex-tracer`, verified the fork branch hash matches
`603da5bd36cfb6c8825b077cf1f305e6b9a6eb44`, and opened draft [PR #235](https://github.com/apple/swift-distributed-tracing/pull/235)
against `main`. It is authored by `aryansk`, the full 58-test suite and format
checks pass, and no hosted checks are reported. The PR remains uncounted until
canonical upstream merge; refined-github #9941 is excluded and does not govern
this independent repository.
