# Top-10 README contribution portfolio — 2026-08-02

## Discovery method

This is a live GitHub snapshot, not a permanent ranking. The discovery query
was `stars:>250000 fork:false`, sorted by stars descending, followed by direct
repository metadata checks for visibility, archive state, default branch, and
license signal. Star counts and issue/PR state must be rechecked immediately
before any edit.

The list is a candidate portfolio, not permission to open ten simultaneous
pull requests. A repository with an unclear license, no contribution path, a
stale issue, or an existing competing PR stays in triage.

## Snapshot

| Rank | Repository | Stars | License signal | README/contribution surface | Disposition |
| --- | --- | ---: | --- | --- | --- |
| 1 | [codecrafters-io/build-your-own-x](https://github.com/codecrafters-io/build-your-own-x) | 534,473 | API has no SPDX signal | `README.md` | HOLD: issue [#1599](https://github.com/codecrafters-io/build-your-own-x/issues/1599) describes a TOC that is already present; issue [#1750](https://github.com/codecrafters-io/build-your-own-x/issues/1750) has several competing open PRs. |
| 2 | [sindresorhus/awesome](https://github.com/sindresorhus/awesome) | 491,452 | CC0-1.0 | `readme.md`, `contributing.md` | HOLD: issue [#2097](https://github.com/sindresorhus/awesome/issues/2097) already has open [PR #4170](https://github.com/sindresorhus/awesome/pull/4170); issue [#1063](https://github.com/sindresorhus/awesome/issues/1063) lacks maintainer-directed implementation and open [PR #3374](https://github.com/sindresorhus/awesome/pull/3374) touches `contributing.md`. |
| 3 | [public-apis/public-apis](https://github.com/public-apis/public-apis) | 454,051 | MIT | `README.md`, `CONTRIBUTING.md` | HOLD: broken-link issue [#6592](https://github.com/public-apis/public-apis/issues/6592) has competing open PRs [#6748](https://github.com/public-apis/public-apis/pull/6748) and [#6744](https://github.com/public-apis/public-apis/pull/6744); current new API issues fail the anti-marketing gate. |
| 4 | [freeCodeCamp/freeCodeCamp](https://github.com/freeCodeCamp/freeCodeCamp) | 453,346 | BSD-3-Clause | `README.md` | RESEARCH: the root README is mature; current documentation search results did not identify a narrow, unclaimed README task. |
| 5 | [EbookFoundation/free-programming-books](https://github.com/EbookFoundation/free-programming-books) | 393,541 | CC-BY-4.0 | `README.md`, `docs/CONTRIBUTING.md` | SUBMITTED: issue [#6153](https://github.com/EbookFoundation/free-programming-books/issues/6153) cleanup is in draft [PR #13390](https://github.com/EbookFoundation/free-programming-books/pull/13390). |
| 6 | [openclaw/openclaw](https://github.com/openclaw/openclaw) | 384,905 | NOASSERTION | `README.md`, `CONTRIBUTING.md`, many `AGENTS.md` files | HOLD: license signal is unresolved and documentation issues [#62529](https://github.com/openclaw/openclaw/issues/62529) and [#106452](https://github.com/openclaw/openclaw/issues/106452) already have linked PRs. |
| 7 | [nilbuild/developer-roadmap](https://github.com/nilbuild/developer-roadmap) | 363,380 | NOASSERTION | `readme.md`, `contributing.md` | HOLD: verify licensing and current maintainer direction before proposing README work. |
| 8 | [donnemartin/system-design-primer](https://github.com/donnemartin/system-design-primer) | 360,061 | CC-BY-4.0 | `README.md`, `CONTRIBUTING.md`, `LICENSE.txt` | SELECTED: issue [#1026](https://github.com/donnemartin/system-design-primer/issues/1026) requests progress tracking; no related open PR was found, and draft [#1347](https://github.com/donnemartin/system-design-primer/pull/1347) adds an accessible checklist. |
| 9 | [jwasham/coding-interview-university](https://github.com/jwasham/coding-interview-university) | 357,661 | CC-BY-SA-4.0 | `README.md` | SELECTED: issue [#657](https://github.com/jwasham/coding-interview-university/issues/657) explicitly requests an optional GitHub Gist workflow; no related open PR was found, and draft [#2145](https://github.com/jwasham/coding-interview-university/pull/2145) adds it. |
| 10 | [vinta/awesome-python](https://github.com/vinta/awesome-python) | 311,694 | API says NOASSERTION; `LICENSE` file present | `README.md`, `CONTRIBUTING.md`, `AGENTS.md` | SELECTED: explicit acceptance rules, active curation, no current `msgspec` entry, and no dedicated duplicate PR found. [#3273](https://github.com/vinta/awesome-python/pull/3273) merged on 2026-08-05. |

## Submitted contribution

The first README contribution adds `msgspec` alphabetically to the
Serialization section of `vinta/awesome-python`:

- Branch: `codex/awesome-python-add-msgspec`
- Commit: `c4ac2f4`
- Change: one repository-specific entry in `README.md`
- Pull request: [vinta/awesome-python#3273](https://github.com/vinta/awesome-python/pull/3273)
- State: open, draft, mergeable; the repository `test` check passed at the
  latest verification
- Validation: 121 tests passed, website build passed, Ruff passed, `ty` passed,
  `git diff --check` passed, and the GitHub/PyPI links returned HTTP 200

This is an open PR and therefore contributes **zero** to the merged-PR count
until the canonical upstream PR state is `MERGED`.

## Second submitted contribution

The next issue-backed cleanup removes the remaining Riptutorials HTML landing
page from the subject index in `EbookFoundation/free-programming-books` while
leaving all direct PDF resources unchanged:

- Issue: [#6153](https://github.com/EbookFoundation/free-programming-books/issues/6153)
- Branch: `codex/issue-6153-riptutorials`
- Commit: `af6d53b8`
- Change: one deletion in `books/free-programming-books-subjects.md`
- Pull request: [EbookFoundation/free-programming-books#13390](https://github.com/EbookFoundation/free-programming-books/pull/13390)
- State: open, draft, mergeable
- Validation: `fpb-lint books`, `git diff --check`, `build`, `lint`, and changed-file discovery passed; the per-file URL check was pending at handoff

This PR is also an open PR and contributes **zero** to the merged-PR count
until the canonical upstream PR state is `MERGED`.

## Third submitted contribution

The third README contribution addresses `donnemartin/system-design-primer#1026`
with a copyable learning-progress checklist that links to the existing primer
sections and groups them into a suggested sequence:

- Issue: [#1026](https://github.com/donnemartin/system-design-primer/issues/1026)
- Branch: `codex/issue-1026-learning-progress`
- Commit: `90d217a`
- Change: 37 new lines in `README.md`; no external dependencies or generated assets
- Pull request: [donnemartin/system-design-primer#1347](https://github.com/donnemartin/system-design-primer/pull/1347)
- State: open, draft, with no checks reported at handoff
- Validation: Pandoc GFM parsing, `git diff --check`, and all 17 checklist anchors passed

This PR is also an open PR and contributes **zero** to the merged-PR count
until the canonical upstream PR state is `MERGED`.

## Fourth submitted contribution

The fourth README contribution addresses `jwasham/coding-interview-university#657`
with an optional browser-based GitHub Gist workflow for readers who want to
track checklist progress separately from the canonical guide:

- Issue: [#657](https://github.com/jwasham/coding-interview-university/issues/657)
- Branch: `codex/issue-657-gist-progress`
- Commit: `86dc009`
- Change: 10 new lines in `README.md`; no source or curriculum content changed
- Pull request: [jwasham/coding-interview-university#2145](https://github.com/jwasham/coding-interview-university/pull/2145)
- State: open, draft, with no checks reported at handoff
- Validation: Pandoc GFM parsing, `git diff --check`, and the GitHub Gist URL check passed

This PR is also an open PR and contributes **zero** to the merged-PR count
until the canonical upstream PR state is `MERGED`.

## Next-five sweep gates

The remaining four repositories in this sweep are queued but not forced into
PRs:

- `codecrafters-io/build-your-own-x`: hold until the repository's license is clear.
- `sindresorhus/awesome`: hold while issue #2097's existing PR is open and no maintainer-directed alternative is available.
- `public-apis/public-apis`: hold while issue #6592 has competing PRs and the new API submissions fail the anti-marketing rule.
- `freeCodeCamp/freeCodeCamp`: hold until a narrow, unclaimed root README task appears.

## Next pickup

1. Preserve PR #3273's merge evidence; it merged on 2026-08-05 after its CI
   check passed.
2. Recheck PR #13390's passing checks and maintainer feedback.
3. Recheck [donnemartin/system-design-primer#1347](https://github.com/donnemartin/system-design-primer/pull/1347)
   and respond only to maintainer feedback within issue #1026's scope.
4. Recheck [jwasham/coding-interview-university#2145](https://github.com/jwasham/coding-interview-university/pull/2145)
   and respond only to maintainer feedback within issue #657's scope.
5. Revisit the four gated candidates only after their blockers change; keep the
   README lane limited to concrete, non-duplicate changes and do not mass-open
   cosmetic changes across the remaining repositories.
