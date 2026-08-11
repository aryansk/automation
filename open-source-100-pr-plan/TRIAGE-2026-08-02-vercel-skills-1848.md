# Triage record: Vercel skills issue #1848

## Target

- Base repository: [vercel-labs/skills](https://github.com/vercel-labs/skills)
- Issue: [#1848](https://github.com/vercel-labs/skills/issues/1848)
- Issue title: Universal-agent `SKILL.md` loses required `name` frontmatter
- Checked: 2026-08-02
- Queue items: `EXT-002` and `EXT-003` complete; `EXT-004` waiting on PR review

## Current upstream state

- Issue state: open
- Assignee: none
- Related open PR search: none found at triage time
- Local checkout: clean `main`, `v1.5.14`, commit `2adcfe5`
- Remote `main` observed at `1164afa`
- The local checkout's sparse working tree does not currently materialize the
  source files required for implementation.

## Reproduction

In an isolated temporary Git project, run:

```sh
npx --yes skills@1.5.21 add kevocodes/stackgraft --all --project
npx --yes skills@1.5.21 list
```

Observed results:

- `.agents/skills/stackgraft/SKILL.md` preserves `name`, `description`,
  `compatibility`, `license`, `version`, and `metadata`.
- `agent/skills/stackgraft/SKILL.md` preserves only `description`, `license`,
  and `metadata`; `name`, `compatibility`, and `version` are lost.
- `skills list` reports the `agent/skills` copy as skipped because required
  frontmatter field `name` is missing.

The reproducible run used the temporary directory
`/tmp/skills-1848-repro.xHAoH5`; it is evidence for this session, not a
repository change.

## Source finding

Remote `main` currently contains `stripIgnoredEveFrontmatter` in
`src/installer.ts`. Eve intentionally derives packaged skill names from their
directory path, so the installer output remains name-free. The bug is that the
generic `skills list` scanner validates that Eve-specific output as if it were
a standard Agent Skills package and emits a false missing-name warning.

## Proposed contribution scope

1. Re-check issue #1848 and related PRs immediately before coding.
2. Add a focused listing regression test for a packaged Eve skill whose name is
   derived from its directory.
3. Make the smallest upstream-compatible change in the listing path: use the
   containing directory as a fallback name only for Eve, preserving the
   Eve-specific installer output.
4. Run the focused installer test, typecheck, format check, and the project's
   full required test suite.

Do not split this into multiple PRs or broaden it into an unrelated
frontmatter redesign.

## Next exact action

[PR #1849](https://github.com/vercel-labs/skills/pull/1849) is open from
`aryansk/skills` and must be maintained until the canonical upstream repository
reports `MERGED`. It is not yet evidence for the 100-PR count.
