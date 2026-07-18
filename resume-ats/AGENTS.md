# AGENTS.md — Resume ATS project

Instructions for any coding agent (Claude Code, Codex, etc.) working in this folder.

## What this is

Aryan Singh's LaTeX resume, tailored per job listing for ATS keyword match and
compiled to a **one-page** PDF.

- `resume.tex` — resume source (master copy = the content).
- `resume.cls` — Aryan's real Overleaf class (v1.3, 10.5pt, custom spacing).
  Do NOT replace with a generic `resume.cls` from GitHub — they have different
  spacing and crash on the Education entry.
- `build.sh` — compile + one-page enforcement (use this, not bare `tectonic`).
- `out/` — generated PDFs and `*_preview.png`.

## How to build

```bash
./build.sh                 # builds resume.tex
./build.sh resume_foo.tex  # builds a tailored variant
```

Prints `✅ … 1 page, no real errors.` or a clear failure. Requires Tectonic +
poppler (`brew install tectonic poppler`), found under `/opt/homebrew/bin` or
`/usr/local/bin`.

## Two things that will trip you up

1. **Education "missing \item":** this class opens a bulleted list in every
   `rSubsection`, but Education has no `\item`, so LaTeX throws a *recoverable*
   `Something's wrong--perhaps a missing \item.` Overleaf ignores it; plain
   `tectonic` halts. So build with `tectonic -Z continue-on-errors` (build.sh
   does this) and treat only THAT error as benign — fail on any other. Do not
   "fix" it with `\item[]` (adds blank space) or `hidelinks` — keep the files as
   they are so output matches Overleaf exactly.
2. **One page is a hard rule.** If a change makes it 2 pages, trim content — don't
   loosen spacing. build.sh fails on page count.

## Tailoring for a job (ATS)

Copy `resume.tex` → `resume_<company>.tex`, then reword bullets/skills to mirror
the job's exact terms where Aryan genuinely has that experience (never fabricate),
reorder for relevance, keep it one page, and summarize what changed. Given an
Excel/CSV of jobs, loop rows (confirm which column is the job description first).

## Boundary

Prepare applications to one click from done — never auto-submit (logins,
CAPTCHAs, irreversible outward actions). Aryan submits.
