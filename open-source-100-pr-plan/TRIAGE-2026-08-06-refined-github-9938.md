# Triage: refined-github/refined-github #9938

- **Repository:** [refined-github/refined-github](https://github.com/refined-github/refined-github)
- **Issue:** [#9938](https://github.com/refined-github/refined-github/issues/9938), “`restore-file` doesn't work on Enterprise Server”
- **Ownership:** Externally owned, public MIT repository; target branch `main`.
- **Duplicate gate:** The issue was open and unassigned at selection. Maintainer @fregante asked for investigation at the branch parser, and no competing open PR was found for the issue.
- **Scope:** When the adjacent absolute PR branch-reference element is empty on GitHub Enterprise Server, use the reference element's existing `title` value while preserving the current GitHub.com path.
- **Implementation:** Branch `codex/issue-9938-ghes-branch-reference` in `/Users/aryansingh/Downloads/Projects/Automation/refined-github-9938`; commit `c2caea6feb9ad077ea95be5d2597abd0cf538031`.
- **Validation:** Focused parser tests, the full Vitest suite (565 passed, 28 skipped), TypeScript, Svelte, bundle, Biome, dprint, changed-file ESLint, and diff checks passed. The repository-wide ESLint scan was stopped after more than ten minutes without diagnostics and is not counted as a pass. GitHub's Ubuntu/Windows builds, Format, Lint, Types, Vitest, Security, Title, Verify, manifest-version, and sync checks all passed.
- **Publication:** Fork `aryansk/refined-github`, remote hash verified, draft [PR #9941](https://github.com/refined-github/refined-github/pull/9941) targeted `main`.
- **State:** The maintainer closed PR #9941 on 2026-08-05 as “AI SPAM” despite the hosted checks passing, stating that a human-tested screenshot/video is required before reopening. It is not countable, and the issue remains unresolved by this PR.
- **Next action:** Do not open additional PRs until this maintainer request is resolved. Reopen only with the requested human evidence, and keep any follow-up within issue #9938's Enterprise Server branch-reference scope.
