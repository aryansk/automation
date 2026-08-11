# Triage — AirLLM #330

## Live selection gate — 2026-08-06

- Issue [#330](https://github.com/lyogavin/airllm/issues/330), “3x speedup
  compression claim is false/outdated,” is open.
- The current issue-specific PR search returned no matching PR. The issue
  thread has unrelated current comments, so its discussion must be rechecked
  immediately before publication.
- `lyogavin/airllm` is public, externally owned, on `main`, and reports the
  Apache-2.0 license through GitHub.

## Scope

The README presented compression speedups as unconditional guarantees. The
patch changes the claim to explain that compression can reduce storage while
adding decompression and transfer work, and that performance depends on the
model, hardware, and benchmark configuration. The API docstring receives the
same correction so the public documentation is consistent.

## Local implementation

- Checkout: `/Users/aryansingh/Downloads/Projects/Automation/airllm-330`
- Branch: `codex/issue-330-compression-claims`
- Commit: `ee3a1f8` — `Clarify compression performance tradeoffs`
- Validation: `python3 -m py_compile air_llm/airllm/utils.py` and
  `git diff --check` passed. No dependency-heavy runtime benchmark was
  claimed because the issue is documentation/API-doc scope.

## Publication state

Created the `aryansk/airllm` fork, pushed
`codex/issue-330-compression-claims`, verified the fork branch hash matches
`ee3a1f8c60a56dbec193d5d45bcc2c3c963bb8c3`, and opened draft [PR #334](https://github.com/lyogavin/airllm/pull/334)
against `main`. GitGuardian is pending and the PR remains uncounted until
canonical upstream merge. Recheck the noisy issue discussion before responding
to review; refined-github #9941 is excluded and does not govern this repository.
