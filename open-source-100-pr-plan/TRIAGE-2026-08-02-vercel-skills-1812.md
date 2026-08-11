# Issue triage: `vercel-labs/skills#1812`

## Snapshot

- **Checked:** 2026-08-02
- **Issue:** [#1812](https://github.com/vercel-labs/skills/issues/1812)
- **Title:** `skills update --global` cannot repair a skill whose files drifted
  from the lock
- **State:** Open; no assignee; no issue comments; no related open PR found in
  the canonical `vercel-labs/skills` repository at verification
- **Queue state:** Draft PR [#1850](https://github.com/vercel-labs/skills/pull/1850)
  open; awaiting checks and maintainer review

## Source finding

The global updater in `src/update.ts` decides whether a GitHub-backed skill needs
an update by comparing the remote tree-derived hash from
`getSkillFolderHashFromTree(...)` with the lock entry's `skillFolderHash`. It
does not read or hash the installed global skill directory before declaring the
skill current.

The global lock schema in `src/skill-lock.ts` stores the remote tree hash, while
`src/local-lock.ts` already provides a content hash helper for project-scoped
locks. This makes the reported drift case plausible: if installed files change
but the upstream tree does not, the current global update gate sees no change.

## Selected implementation path

Add an explicit `--repair` option to `skills update`. The option implies global
scope, queues tracked repository-backed global skills for the existing
`skills add` re-materialization flow, and bypasses the remote hash check. This
keeps normal update behavior unchanged and lets the reinstall command report a
source failure instead of silently declaring a drifted installation current.

It does not silently remove missing skills, and it does not alter project-scope
updates or well-known provider handling. Those remain on their existing paths.

## Evidence and limits

- The issue body provides a concrete global-install reproduction and identifies
  the update gate.
- Local source inspection confirms the remote-tree comparison in
  `src/update.ts` and the current global lock shape.
- Changed files: `src/update.ts`, `src/cli.ts`, `src/cli.test.ts`,
  `tests/update.test.ts`, `README.md`, and `AGENTS.md`.
- Commit: `b67404a` on `codex/skills-repair-global-drift`.
- Draft PR: [#1850](https://github.com/vercel-labs/skills/pull/1850).
- This record is implementation/PR evidence, not merged-PR evidence.

## Next exact action

Monitor PR #1850's checks and maintainer feedback. If the draft scope is
accepted, make it ready only after review; if feedback requires a different
design, update the branch without expanding beyond global-update drift repair.
After merge, verify the canonical PR state before recording it in the 100-PR
tracker.
