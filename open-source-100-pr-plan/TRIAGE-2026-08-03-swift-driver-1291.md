# Swift Driver issue #1291 triage

## Selection

- **Repository:** `swiftlang/swift-driver`
- **Issue:** [#1291 — Group CLI options for easier navigation](https://github.com/swiftlang/swift-driver/issues/1291)
- **Canonical owner:** `swiftlang`, not Aryan
- **Default branch:** `main`
- **License:** Apache-2.0
- **Issue state at selection:** Open, unassigned, labeled `good first issue`,
  `enhancement`, and `documentation`
- **Related canonical PR search:** no result for issue #1291 in title/body at
  the final pre-edit check

## Scope decision

The issue describes a real help-navigation problem: compiler options are
defined with group metadata but are rendered as one flat `OPTIONS` section.
The focused change is to use that existing metadata in `OptionTable.printHelp`:
keep modes and ungrouped options in their current sections, then print each
visible option group under its own heading. Hidden-only groups remain omitted
unless `-show-hidden` is requested.

This does not redesign option definitions, alter parsing, or add new compiler
flags.

## Implementation evidence

- **Checkout:** `/Users/aryansingh/Downloads/Projects/Automation/swift-driver-1291`
- **Branch:** `codex/issue-1291-group-options`
- **Commit:** `0b13d91e`
- **Changed source:** `Sources/SwiftOptions/OptionTable.swift`
- **PR:** [#2167](https://github.com/swiftlang/swift-driver/pull/2167), draft,
  targeting `swiftlang/swift-driver:main`

## Validation

- `swift test --parallel`: 469 tests in 40 suites passed
- `swift build --product swift-help`: passed
- `swift-help swiftc` and `swift-help swiftc -show-hidden`: grouped headings,
  modes, ungrouped options, and retained tail options verified
- `git diff --check`: passed

## Counting boundary

PR #2167 is open and unmerged. It contributes **zero** to the qualifying
external merged-PR count until the canonical upstream PR is merged.
