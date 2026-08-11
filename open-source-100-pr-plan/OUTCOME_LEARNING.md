# Outcome learning for upstream PR selection

Last reconciled: 2026-08-10

This file turns verified GitHub outcomes into selection rules. It is evidence
for better decisions, not a promise that any repository or PR will merge.
GitHub remains the source of truth; this file records the conclusions that
should influence the next preflight.

## Current baseline

- Authored PRs: **128** total — 85 open, 25 merged, and 18 closed without
  merge.
- Qualifying external merges: **24**. The 25th merged PR is the owned
  `aryansk/indiehouse#1` and is excluded.
- Among resolved external PRs, the observed result is 24 merged versus 18
  closed without merge (**57.1%** merged). This is not a predictive acceptance
  rate: 85 PRs remain open, and several closures were caused by policy,
  duplication, or maintainer scope decisions rather than code quality.
- Merged scope mix: **6 bug fixes, 6 documentation changes, 6 features,
  4 CI changes, and 2 README/list changes**.
- **23 of 24** merged external PRs had a concrete issue or maintainer-linked
  problem. The one exception was a narrowly scoped README contribution that
  was still useful and accepted by the maintainer.

## What has worked repeatedly

| Observed signal | Evidence | Rule for future selection |
| --- | --- | --- |
| Concrete upstream demand | 21/22 merged PRs were issue-backed or maintainer-linked | Prefer an open issue, a reproducible defect, or a direct maintainer request. Do not invent a feature just to create a PR. |
| Narrow, testable scope | Bug fixes, docs, CI, and small features make up every merged lane | Choose one subsystem and one user-visible outcome. Reject broad architecture or multi-package work for a quick packet. |
| Useful documentation/CI | Merged examples include platform paths, profiling flags, README resources, Pages tests, and broken-link enforcement | Documentation and CI count when they remove a real source of confusion or failure; cosmetic README redesigns do not qualify by default. |
| Reviewable validation | Merged lanes had focused tests, lint, build, generated-output, or diff evidence | Select projects where the required checks can actually run and be explained before publication. |
| Constructive maintainer loop | gortex accepted a requested sandbox follow-up; Swift Service Lifecycle, StudyMap, and other maintainers reviewed or merged focused changes | Reuse repositories with a demonstrated constructive response only when a new issue is independently valid; do not spam the same project. |
| Exact preflight | Merges came from canonical upstream PRs with verified base/head, policy, and merge evidence | Recheck the issue, duplicate PRs, base branch, license, contribution rules, and current maintainer direction immediately before editing and again before opening the PR. |

## What has not worked or must be treated as a hard stop

| Signal | Observed examples | Future decision |
| --- | --- | --- |
| Repository rejects autonomous or drive-by work | refined-github #9941, NumPy #32230, Virtle #69 | Do not open, reopen, or continue a lane unless the maintainer explicitly changes the policy or invites a new scoped contribution. |
| Existing or maintainer-owned implementation | Vercel Skills #1849, NemoClaw #8526, and other overlapping candidate PRs | Do not duplicate. Close or defer the candidate and record the competing PR. |
| Missing repository gate | GitHub CLI #14111 required a `help wanted` issue label; CLA/DCO gates blocked other lanes | Treat missing labels, CLA/DCO, identity, signing, or maintainer-only actions as blockers. Never satisfy them by impersonation or fabrication. |
| Unresolved design or breaking scope | Swift Format #1258 was closed after breaking-change feedback; Swift Distributed Tracing #235 remains draft pending API direction | Ask for design direction first. Do not mark ready or expand code while the architecture is unresolved. |
| Hosted validation failure | pre-commit #3740 was automatically closed after hosted failures | Prefer candidates with a reproducible local validation path and inspect repository-native CI requirements before reserving work. A local pass is not a hosted pass. |
| Volume without evidence | Earlier README sweeps produced drafts that remained open or were gated by overlap, license, or scope | Never fill a five-PR packet with weak candidates. Fewer legitimate submissions are better than artificial volume. |

## Candidate scoring gate

Apply hard gates first. A candidate is rejected if any hard gate fails:

1. The issue is open, current, and not already implemented or covered by an
   existing PR.
2. The repository permits this kind of contribution and has no unresolved
   anti-automation, drive-by, license, CLA/DCO, identity, or maintainer-only
   blocker.
3. The base repository, default branch, expected contribution path, and
   ownership are clear.
4. The scope can be explained in one paragraph and validated with a focused
   check or a clearly available repository-native suite.

Then score the candidate out of 13:

| Dimension | Points |
| --- | ---: |
| Maintainer demand or explicit issue acceptance | 0–3 |
| Scope clarity and containment | 0–2 |
| Validation fit and reproducibility | 0–2 |
| Repository health, impact, and current relevance | 0–2 |
| Constructive prior response from this repository/maintainer | 0–2 |
| Concrete user benefit | 0–2 |

Reserve candidates scoring **9 or higher** with no hard-gate failure. A score
does not override a maintainer policy or guarantee a merge. If five candidates
do not pass, stop at the smaller set and keep researching rather than padding
the packet.

## Packet composition

- At least three candidates should come from the high-impact portfolio.
- A smaller or niche project is allowed only as a documented maintainer-
  invitation exception or a uniquely strong issue; use no more than two such
  exceptions in one packet.
- Do not submit two PRs to the same repository unless the issues are clearly
  independent, both pass duplicate checks, and the repository has shown a
  constructive response to the first lane.
- Keep one implementation lane active at a time. Do not open a difficult PR
  while a maintainer question or requested change is waiting elsewhere.
- Default new PRs to draft. Mark ready only after validation and an explicit
  maintainer request or a clearly supported repository convention.

## Feedback loop

Before selecting the next packet:

1. Audit every authored PR across open, merged, and closed states.
2. Separate human questions, requested changes, approvals, and policy blockers
   from CI/bot noise.
3. Handle actionable human feedback before fresh issue selection.
4. Record the outcome in the table below and update the candidate's future
   score. Do not generalize one repository's policy to unrelated projects.

After each complete five-PR packet, or at least weekly:

- recompute merged, open, and closed counts from live GitHub;
- group merges and closures by repository, scope, and reason;
- record time-to-first-human-response when available;
- promote a pattern to a default only after at least two independent examples;
- demote a repository or scope after a repeated policy, duplicate, design, or
  hosted-CI failure;
- update `STATUS.md`, `WORK_QUEUE.md`, `WORK_LOG.md`, and this file before
  handoff.

## Outcome record template

Add one row or a linked entry for every submitted PR that reaches a meaningful
state change:

| Date | PR | Scope | Issue-backed? | State | Maintainer signal | Checks | Reason / lesson | Selection update |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| YYYY-MM-DD | owner/repo#N | bug/docs/CI/feature/README | yes/no | merged/open/closed | invitation/request/approval/question/none | exact commands and result | policy, duplicate, design, CI, or acceptance evidence | boost/hold/defer/recheck |

Classify a closure before treating it as a failed implementation. Use one of:
`policy`, `duplicate/superseded`, `maintainer scope`, `design`, `hosted CI`,
`contributor error`, or `unknown`. Only the last category should trigger a
generic investigation; policy and duplicate closures should primarily improve
preflight selection.

## 2026-08-10 packet observation

The EXT-121 through EXT-125 packet followed the strongest current pattern:
five issue-backed changes in large, active repositories, each with a narrow
scope and a repository-native regression or documentation path. The packet
produced five valid open drafts and no merge yet, so it increases submission
evidence but does not change the qualifying merge total. The next selection
should preserve this repository-impact and scope balance while treating the
Moby macOS build limitation as a validation-risk signal and waiting for human
feedback before opening another packet.

## 2026-08-10 EXT-126 through EXT-130 observation

The next packet preserved the strongest selection pattern: five issue-backed
changes in major repositories with narrow, reviewable scopes. The two JupyterLab
lanes produced passing pre-commit and documentation checks but hit the
repository's required-label gate; because label changes are permission-gated,
that is a maintainer dependency rather than a reason to fabricate a label.
Rust Clippy's first hosted dogfood run exposed an unfulfilled old expectation;
removing that stale expectation and rerunning is the correct validation loop.
React Router and Setuptools were documentation lanes with direct user-facing
benefit, and the latter has a live documentation build pending. The packet
produced five valid open drafts and no merge, so it raises submission evidence
without changing the qualifying merged total. Keep the current portfolio in a
monitor/review phase before selecting another packet.

The same closeout audit also found the older Railtracks #1344 lane merged
after its checks passed. The maintainer's explicit approval/support loop and
successful focused validation reinforce the value of keeping narrow issue
work visible until review completes; it does not change the rule that drafts
remain uncounted until a canonical merge is verified.

## 2026-08-10 EXT-131 through EXT-135 observation

This packet preserved the strongest selection pattern: five issue-backed,
medium-to-easy changes in two major active ecosystems, with two focused Beam
lanes and three accepted editorial/specification lanes. The changes are narrow,
reviewable, and tied to explicit issue requests. Beam's hosted validation is
still running, while the OpenTelemetry drafts reached the repository's EasyCLA
gate immediately. That legal gate is a contributor prerequisite, not evidence
of an implementation failure and not something to simulate or bypass.

The packet produced five valid open drafts and no merge. An earlier packet PR
merged during closeout, so the qualifying external merged total is now **24**
and the authored portfolio is 128 (85 open, 25 merged including the owned PR,
and 18 closed). The three
OpenTelemetry docs lanes reinforce that small editorial/specification fixes can
be high-impact and quick to validate, but future selection should prioritize
repositories where the contributor authorization path is already clear when
the opportunity is otherwise comparable. Keep the current portfolio in a
monitor/review phase and do not add another packet until human feedback,
hosted checks, and EasyCLA state are reconciled.

## 2026-08-10 successful merge observation — failed-build-issue-action #157

The earlier EXT-106 lane merged after its maintainer incorporated a focused
follow-up. The successful sequence was: issue-backed test gap, narrow patch,
complete local coverage/lint evidence, maintainer review, maintainer follow-up,
then canonical merge. The explicit reply was posted only after verifying the
follow-up commit was present. This reinforces the rule that actionable human
feedback takes priority over a new packet and that the tracker must be updated
from GitHub's canonical merge date and commit.

The live portfolio is now 128 authored PRs (85 open, 25 merged including the
owned PR, and 18 closed), with **24** qualifying external merges. The five
current EXT-131 through EXT-135 drafts remain unmerged and uncounted.

## 2026-08-10 EXT-136 through EXT-140 observation

This packet met the hard gates with five narrow issue-backed changes across
Vercel Skills, mypy, Swift Argument Parser, Setuptools, and nbconvert. The
strongest evidence came from repository-native reproductions and focused tests:
49 Vitest tests, mypy self-check plus the cached-property fixture, 10 Swift
Argument Parser tests, strict Setuptools docs validation, and 23 nbconvert
sanitizer/string tests on Python 3.9. Hosted checks corroborate three lanes;
nbconvert's full functional/docs/link/pre-commit checks pass, but the
repository triage-label gate is outside contributor control, and Vercel's
deployment is team-authorized only.

The five drafts increase the submitted portfolio without changing the
qualifying merged count. The incremental review cursor prevented a full
rescan: it handled the new JupyterLab placement request with a verified remote
fix and held Swift Distributed Tracing on an explicit `MultiplexSpan` context
decision. Keep the queue in monitor/review mode until maintainers resolve these
authorization/design gates; do not select another packet on draft volume alone.

## 2026-08-11 EXT-145 through EXT-149 observation

This packet returned to the strongest selection pattern: five issue-backed,
narrow changes in active repositories with repository-native validation. The
selection lessons that held:

- **Real regressions are the most reliable lanes.** Setuptools #5296
  (executable-bit drop), hatch #2378 (readme outside project dir), and apm
  #2558 (orphaned Copilot hooks) were all recent regressions with clear,
  reproducible causes and direct user impact. Each had a maintainer-visible
  repro in the issue and a local validation path.
- **Docs fixes land when they remove a real contradiction.** jupyter_client
  #1137 was a help-text/code contradiction the reporter verified; tying the
  help text to the implemented behavior with a regression test strengthens the
  lane.
- **Claimed/duplicate triage is a hard gate.** pandas #66699, scipy #25864 and
  the SHGO docs cluster, pytest #14839, beam #39710, react-router #15378,
  matplotlib #32186, OTel-python #5427, and jupyterlab #19258 were all excluded
  because a claimant or open PR existed. The scipy maintainer explicitly
  discouraged LLM-audit docs issues; that entire surface is a hard stop.
- **Scope clarity beats repository size.** VoteKit #384 (smaller repo) was the
  one non-high-impact lane, justified by a concrete additive utility with
  clear semantics and existing constructive history there (#383 review).
- All five drafts are uncounted; the packet raises submission evidence only.
  Notion batch sync is blocked by missing connector access and must be
  completed at handoff before the dashboard can be called current.


## 2026-08-11 EXT-150 through EXT-152 observation

This packet is a 3-PR honest packet. The selection lessons:

- **Fresh-issue space is saturated.** A ~45-lane live preflight found that most
  new bug issues in high-impact Python repos are claimed within hours of filing
  (VoteKit #381, networkx #8830, sqlalchemy #13485, astropy #20230, mitmproxy
  #8363, polars #28752, babel #1307, celery #10472, gradio #13722 all had open
  or in-flight competing PRs). The reliable lanes were ones with a precise
  root-cause analysis in the issue and no claimant: networkx #8833 (bug with
  repro + maintainer ack), networkx #8802 (maintainer-engaged docs inversion),
  fsspec #2095 (detailed mechanism analysis, no canonical PR).
- **AI-policy gates must be checked before implementing.** rich #4201 looked
  clean but rich's AI_POLICY.md requires a maintainer-approved solution on the
  linked issue and a prepared fix already existed — dropped after the fix was
  implemented, wasting effort. NetworkX's CONTRIBUTING requires stating AI use
  in the PR body; that was satisfied in both networkx PR descriptions.
- **Rust-core repos need the Rust toolchain.** dataprof #574/#573 are precise,
  well-scoped bugs in a repo with a strong constructive history (two prior
  merges), but validation requires cargo/maturin/uv which are unavailable
  locally; publishing unvalidated Rust is against the validation-fit gate.
- **Ambiguous-fix-direction lanes are weak.** setuptools #5294 reproduces
  cleanly (class identity split) but the fix direction (alias tree vs vendored
  tree) has no maintainer steer and three PRs are already open in that repo.
- The three drafts increase the submitted portfolio without changing the
  qualifying merged count (still 35). Notion batch sync remains blocked by the
  missing connector. Keep the queue in monitor/review mode; do not pad a packet
  to five when fewer strong lanes clear the gate.

## 2026-08-11 EXT-153 through EXT-156 observation

This packet published three drafts and hit one repository gate. The lessons:

- **Assign-first gates must be preflighted before implementation.** pydantic
  #13630 was a clean, reproducible bug (generated Decimal patterns use
  look-around, rejected by the validation regex engine) with a fully validated
  fix, but pydantic's CONTRIBUTING requires issue assignment before opening a
  PR and the bot auto-closes unassigned PRs. The effort was not wasted (the
  lane is publishable if a maintainer assigns the issue), but the gate should
  be checked in preflight: any repo whose CONTRIBUTING mentions assignment or
  auto-close is a conditional lane.
- **Perf bugs with a precise repro remain the most reliable lanes.**
  python-markdown #1619 (quadratic inline links, 7s → 0.27s at 8192 links)
  and the earlier black #5270 (competing PR) confirm maintainers engage with
  measured performance regressions.
- **Fuzzer-found crash bugs in linters are tractable when the root cause is a
  type assumption.** pylint #11229 (int class name reaching `re.Pattern.match`
  and string concatenation) was a two-line guard fix with a clean functional
  regression test.
- **Builder/subclass handler-fallback bugs are high-value docs-free fixes.**
  sphinx #14587 (dirhtml inheriting `format='html'` but dropping format
  handlers when name-specific handlers exist) had a complete repro in the
  issue and a deterministic unit test.
- **Fresh-issue saturation persists.** The ~50-lane sweep found no additional
  unclaimed bug in major Python repos; every candidate had a claimant,
  competing PR, policy gate, or missing toolchain. Honest packets of 3-4 are
  the norm; padding is against the rules.
