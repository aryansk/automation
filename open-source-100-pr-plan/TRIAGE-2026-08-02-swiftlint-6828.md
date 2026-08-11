# Issue triage: `realm/SwiftLint#6828`

## Snapshot

- **Checked:** 2026-08-02
- **Issue:** [#6828](https://github.com/realm/SwiftLint/issues/6828)
- **Title:** `prefer_self_in_static_references` does not report violations in extensions
- **State at selection:** Open; unassigned; no comments; no related open PR
  found in the canonical `realm/SwiftLint` repository
- **Repository:** Public `realm/SwiftLint`, default branch `main`

## Scope gate

Reproduce the issue against the current `main` implementation, identify the
rule's extension traversal path, and add the smallest rule regression through
the repository's triggering/non-triggering examples. Include a concise
changelog entry because SwiftLint requests changelog coverage for user-facing
changes. Avoid changing unrelated `self` diagnostics or rule configuration.

## Outcome

- Implemented the narrow fix in
  `Source/SwiftLintBuiltInRules/Rules/Style/PreferSelfInStaticReferencesRule.swift`:
  return clauses of static functions in same-file struct/enum extensions are
  now visited, while class-like extensions remain conservative.
- Added triggering and non-triggering generated examples and the requested
  changelog entry.
- Commit: `61084d73` on
  `codex/swiftlint-prefer-self-extensions`.
- Draft PR: [#6854](https://github.com/realm/SwiftLint/pull/6854), open and
  mergeable, targeting `realm/SwiftLint:main`.
- Validation passed: focused generated rule test, integration lint/correction
  tests, the full 1,088-test Swift suite, strict lint of both changed Swift
  files, and a CLI reproduction.

## Next exact action

Monitor PR #6854 for checks and maintainer feedback. Do not count it toward the
100-PR total unless the canonical PR state becomes `MERGED`.
