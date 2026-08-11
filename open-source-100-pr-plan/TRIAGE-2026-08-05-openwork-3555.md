# Triage: `different-ai/openwork#3555`

## Selection evidence

- Repository: [different-ai/openwork](https://github.com/different-ai/openwork)
- Issue: [#3555](https://github.com/different-ai/openwork/issues/3555)
- The issue reports that OpenWork's model picker omits `longcat-2.0-free`,
  even though the model is available in the OpenCode catalog.
- The repository is public, externally owned, and MIT-licensed outside its
  separately licensed `/ee` directory. Its default branch is `dev`.
- The issue was open with one reporter update and no competing open PR
  referencing #3555 at selection.

## Implementation

- Checkout: `/Users/aryansingh/Downloads/Projects/Automation/openwork-3555`
- Branch: `codex/issue-3555-longcat-free`
- Commit: `9d67c94`
- Updated `constants.json` from OpenCode sidecar `v1.17.11` to `v1.18.13`.
  The existing `prepare-sidecar.mjs` script uses this shared pin to download
  the platform-specific OpenCode release.

## Validation

- `node --check apps/desktop/scripts/prepare-sidecar.mjs` passed.
- `git diff --check` passed.
- Running the repository's sidecar preparation script into a temporary output
  directory downloaded OpenCode `1.18.13`, produced valid `versions.json`, and
  reported `opencode/longcat-2.0-free` from `opencode models opencode`.
- This is a one-line sidecar-version configuration fix; full workspace tests
  were not run from the intentionally sparse checkout.
- The commit includes a DCO sign-off; no cryptographic signature claim is made.

## Publication state

The `aryansk/openwork` fork was created and the branch was pushed with remote
hash `9d67c940b82e988e7f04064a379743a4e5b85615`, matching the local commit.
Draft [PR #3572](https://github.com/different-ai/openwork/pull/3572) is open
against `different-ai/openwork:dev`, authored by `aryansk`, and currently
mergeable with review required. Its Vercel preview checks that require the
upstream team's authorization are failing; the local validation remains green.
This is not a merged or countable contribution.

## Next action

Monitor [PR #3572](https://github.com/different-ai/openwork/pull/3572) for
maintainer feedback and the upstream Vercel authorization/check state. Respond
only within issue #3555's sidecar-version scope and do not count it until the
canonical PR merges.
