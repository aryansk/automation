# Triage: virgiliojr94/book-to-skill issue #111

## Selection date

2026-08-05, Asia/Kolkata.

## Discovery and gates

- Source: [GitHub Trending, weekly](https://github.com/trending?since=weekly).
- Repository: [virgiliojr94/book-to-skill](https://github.com/virgiliojr94/book-to-skill),
  externally owned and MIT-licensed; default branch `master`; Python codebase.
- Issue [#111](https://github.com/virgiliojr94/book-to-skill/issues/111) was
  open and had no related PR at selection.
- Issue #91 was screened but skipped because open PR #92 already implements its
  Markdown-prefixed chapter-heading fix.
- The contribution guide requires one focused change, tests, a Conventional
  Commit title, and no hand-edited changelog.

## Issue scope

PDF extraction can insert ASCII or U+3000 ideographic whitespace between the
characters of a CJK table-of-contents heading. `detect_structure()` recognized
`目录`, `目錄`, and `目次` only when the characters were adjacent, causing a
real ToC to be reported as missing.

## Implementation

- Checkout: `/Users/aryansingh/Downloads/Projects/Automation/book-to-skill-111`
- Branch: `codex/issue-111-cjk-toc`
- Commit: `04d01824598cbdc1174e1676905dbbd09b6b6eee`
- Preserved the whole-line ToC guard and added a dedicated CJK alternative that
  accepts horizontal ASCII/ideographic whitespace between the characters.
- Added four parametrized regressions covering simplified/traditional/Japanese
  forms with ASCII and ideographic whitespace.

The commit includes DCO sign-off. It is not cryptographically signed because
the local SSH signing key was unavailable.

## Validation

- `pytest -q`: 267 passed, 1 skipped.
- `python3 -m ruff check .`: passed.
- `python3 -m compileall -q book_to_skill tests`: passed.
- `git diff --check`: passed.
- No hosted checks were reported immediately after publication.

## Publication

- Fork: `https://github.com/aryansk/book-to-skill`
- Remote branch hash was verified with `git ls-remote` at the commit above.
- Draft PR: [virgiliojr94/book-to-skill#112](https://github.com/virgiliojr94/book-to-skill/pull/112)
- Base: `virgiliojr94/book-to-skill:master`
- Head: `aryansk/book-to-skill:codex/issue-111-cjk-toc`
- State: open/draft, not merged, and therefore not countable.

## Resume instructions

1. Check PR #112 hosted checks and maintainer feedback.
2. Keep any follow-up limited to issue #111's CJK ToC detection behavior.
3. Do not create a second PR for issue #111.
4. Count this contribution only if the canonical upstream PR becomes `MERGED`.
