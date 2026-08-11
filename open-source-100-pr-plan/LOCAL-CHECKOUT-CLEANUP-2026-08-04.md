# Local checkout cleanup — 2026-08-04

## Kept

- `open-source-100-pr-plan/` — canonical resumable ledger and evidence, about
  220 KB.
- `ansible-64016/` was retained during the 2026-08-04 cleanup as an active
  clean checkout for draft ansible/ansible#87345; it was later moved to the
  2026-08-09 recoverable cleanup folder below.

## Moved out of the workspace

The following clean working copies were moved to the recoverable folder
`/Users/aryansingh/.Trash/codex-oss-checkouts-2026-08-04`:

- `awesome-python-top10/`
- `coding-interview-university-top10/`
- `free-programming-books-top10/`
- `swift-argument-parser-780/`
- `swift-driver-1291/`
- `swift-format-1250/`
- `swift-service-lifecycle-248/`
- `swiftlint-6828/`
- `system-design-primer-top10/`
- `tuist-11693/`
- `vskills/`

The linked worktree directories `swift-format-1033/`, `swiftlint-6831/`, and
`vskills-1812/` were first removed with `git worktree remove`; their parent
repositories are in the same Trash folder.

## Safety and recovery

- Every removed Git checkout was clean before cleanup; no uncommitted files were
  discarded.
- Remote forks, branches, commits, and pull requests were not changed.
- The folders are recoverable from the Trash path, or can be re-cloned using
  the branch and PR details in `PR_TRACKER.md`.
- The cleanup removed about 5.8 GB from the active workspace, but the Trash
  still occupies that space until it is emptied.

## Supplemental cleanup — 2026-08-05

- The clean, superseded Vercel Skills review checkout `vskills-1848/` was moved
  to the recoverable folder
  `/Users/aryansingh/.Trash/codex-oss-checkouts-2026-08-05/vskills-1848/`.
- The SwiftNIO checkout for draft PR #3692 was intentionally retained during
  the 2026-08-05 cleanup; it was later moved to the 2026-08-09 recoverable
  cleanup folder below after its working tree was verified clean.

## Supplemental cleanup — 2026-08-09

Exactly 41 Git checkouts were audited. Thirty-nine clean, superseded research
and contribution checkouts were moved from
`/Users/aryansingh/Downloads/Projects/Automation/` to the recoverable folder
`/Users/aryansingh/.Trash/oss-checkouts-next5-cleanup-2026-08-09/`:

`ai-for-beginners-706`, `airllm-330`, `alamofire-3965`, `ansible-64016`,
`book-to-skill-111`, `buzz-4864`, `claude-session-sync-3`,
`config-file-validator-634`, `dataprof-500`, `deepseek-reasonix-7660`,
`free-programming-books-13336`, `gh-14086`, `go-git-436`, `grpc-go-9235`,
`i-have-adhd-96`, `jcode-795`, `lazygit-5893`, `licensedb-220`,
`linguist-6353`, `mlx-4001`, `nemoclaw-8349`, `openuni-61`, `openwork-3555`,
`oras-go-1286`, `pascalorg-editor-308`, `polar-218`, `railtracks-1342`,
`refined-github-9938`, `release-plz-2941`, `release-plz-2957`, `rtk-3448`,
`sleeper-1852`, `sphinx-12308`, `spikard-117`, `swift-distributed-tracing-232`,
`swift-nio-2434`, `tca-3950`, `tencentdb-agent-memory-817`, and
`vscode-vhs-6353`.

The two previously retained checkouts, `vhs-sample-6353` and
`swift-service-lifecycle-163`, were subsequently moved to the same Trash
folder at the user's explicit request. All 41 audited checkouts are now out of
the active workspace. The moved checkouts occupy about 14 GiB in Trash and
remain recoverable until Trash is emptied. No remotes, branches, PRs, or plan
files were changed.
