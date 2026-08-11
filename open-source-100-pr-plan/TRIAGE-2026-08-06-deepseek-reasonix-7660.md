# Triage: esengine/DeepSeek-Reasonix issue #7660

## Candidate

- **Repository:** [esengine/DeepSeek-Reasonix](https://github.com/esengine/DeepSeek-Reasonix)
- **Issue:** [#7660](https://github.com/esengine/DeepSeek-Reasonix/issues/7660)
- **Title:** `[Feature]: [Reasonix] 会话内 mockup/文件链接行无交互：点击无法在浏览器打开，hover 无文件路径提示`
- **Selected:** 2026-08-06 from the live [GitHub Trending weekly set](https://github.com/trending?since=weekly)
- **Owner:** `esengine`, external to `aryansk`
- **Default/base branch:** `main-v2`
- **License evidence:** Root `LICENSE` identifies MIT; GitHub API `license` metadata was null, so the license must be rechecked immediately before publication.

## Live issue and duplicate gates

The issue was rechecked immediately before implementation:

- State: `OPEN`.
- Labels: `enhancement`, `rendering`, `tui`, `v2`.
- Assignee: none.
- Comments: 0.
- Issue-specific PR search: no matching PR was returned.
- Body describes Markdown mockup/file rows such as
  `.omc/research/baseline-import-modal-qait-v1.html` being rendered without a
  browser action or hover path feedback in the Go `main-v2` TUI.

## Repository instructions

`CONTRIBUTING.md` says to branch from `main-v2`, use Go 1.25+, run Go
formatting, add documentation for exported identifiers, and submit a PR back
to `main-v2`. The issue is confined to `internal/cli` Markdown rendering and
does not change cache-sensitive paths, so no cache metadata update is needed.

## Local implementation

- **Checkout:** `/Users/aryansingh/Downloads/Projects/Automation/deepseek-reasonix-7660`
- **Branch:** `codex/issue-7660-tui-file-links`
- **Base snapshot:** `44f749e` (`main-v2`)
- **Commit:** `c698142848690b0cb1b6b81d81a5fd05f994240f`
- **DCO:** Signed-off-by trailer present.

The implementation:

- Emits terminal-native OSC 8 hyperlinks for Markdown links and autolinks.
- Resolves workspace-relative paths to `file://` URLs, including the issue's
  `.omc/...html` shape, using the controller workspace root in the TUI and the
  explicit `--dir` root in headless runs.
- Preserves the existing visible label and destination text.
- Allows only browser-oriented URI schemes (`http`, `https`, `file`, `mailto`,
  and `tel`) and rejects terminal-control characters and unsupported schemes.
- Handles Windows drive-path destinations.
- Omits OSC 8 controls from copy rendering so clipboard text remains plain.

## Validation evidence

Passed:

- Focused OSC 8/local-path/copy/safety tests in `internal/cli`.
- `mise exec go@1.26.5 -- go test ./internal/cli -count=1`.
- `mise exec go@1.26.5 -- go vet ./internal/cli`.
- `mise exec go@1.26.5 -- go test ./... -count=1`.
- `mise exec go@1.26.5 -- gofmt -w` on the four changed Go files.
- `git diff --check` before commit and on the committed tree.

## Publication state

- No fork, push, or pull request was created.
- The refined-github maintainer explicitly requested no additional PRs until
  PR #9941's human-tested screenshot/video gate is resolved.
- This candidate is locally prepared but publication-gated. It does not count
  toward the merged-PR total and is not an open PR.

## Next action

When the account-level gate clears, recheck issue #7660, `main-v2`, the root
license/API metadata, and issue-specific PR state. If the issue remains
unclaimed, publish one draft PR against the maintainer-confirmed base branch;
otherwise discard or revise the local candidate according to maintainer state.
