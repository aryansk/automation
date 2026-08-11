# Triage: EbookFoundation/free-programming-books #13336

- **Repository:** [EbookFoundation/free-programming-books](https://github.com/EbookFoundation/free-programming-books)
- **Issue:** [#13336](https://github.com/EbookFoundation/free-programming-books/issues/13336), “Missing book file”
- **Ownership:** Externally owned repository; the repository license is CC BY 4.0 and the target branch is `main`.
- **Duplicate gate:** The issue was open, unassigned, and had no linked pull request when selected.
- **Reproduction:** `curl -IL` on the listed Armenian Python PDF returned a `301` redirect to `https://armath.am/`, then the publisher homepage with no downloadable PDF.
- **Scope:** Remove only the dead resource. The repository linter then required removing the now-empty `Python` section and index; the resulting zero-byte list file is consistent with the existing `books/free-programming-books-cs-cp.md` state.
- **Implementation:** Branch `codex/issue-13336-remove-dead-armath-link` in `/Users/aryansingh/Downloads/Projects/Automation/free-programming-books-13336`; commit `381bfe203dc22c2e908af1a31d7b33ad87763cdc`.
- **Validation:** `npx --yes free-programming-books-lint books casts courses more`, manual redirect verification, and `git diff --check` passed.
- **Publication:** Reused `aryansk/free-programming-books-top10`, verified the pushed branch hash matches local, and opened draft [PR #13395](https://github.com/EbookFoundation/free-programming-books/pull/13395) against `main`.
- **State:** Draft PR #13395 is open and clean; hosted `Get changed files`, `build`, `lint`, and GitHub report checks pass. It is not countable until canonical upstream merge.
- **Next action:** Monitor maintainer feedback; respond only within the dead-link cleanup scope because all current hosted checks pass.
