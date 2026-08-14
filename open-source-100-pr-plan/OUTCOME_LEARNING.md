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

### Eligibility is ephemeral

The score is appropriate for a reserve lead, not a durable implementation
permission. Before implementation and immediately before publication, repeat
the live issue, assignment, competing-PR, repository-policy, base-branch, and
validation checks. The pytest #14864 replacement in the 2026-08-12 packet
illustrated the failure mode: the issue/PR became a duplicate of #14865 while
the work was being prepared, so it was closed and excluded rather than counted.
Future runs should mark that lane stale or duplicate and automatically take a
reserve replacement without defending sunk cost.

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

## 2026-08-13 OPS-027 observation

- **Fresh preflight prevents duplicate work.** Airflow #71497 was abandoned
  before implementation because upstream `main` already contained the proposed
  Decimal normalization and coverage. The stale lane was replaced by a live,
  scoped fsspec move-hook issue instead of publishing a duplicate.
- **Sync/async counterpart checks matter.** fsspec #2099 was a valid sync
  counterpart even though the async `_mv_file` hook already exists. The
  maintainer question was answered with repository evidence before any further
  code change.
- **UI fixtures must be checked against neighboring lints.** rust-clippy's
  first hosted run exposed an existing `eq_op` diagnostic in the negative
  fixture, plus a formatting failure. The fixture was corrected and the
  hosted run restarted at `6d40561`; a locally missing `rustc-dev` toolchain is
  a validation limitation, not evidence that the patch is correct.
- **Separate code failures from repository/infrastructure failures.** The
  jupyter-server hosted matrix had broad segmentation, HTTP 500, and label-gate
  failures while its focused 38-test utility suite and Ruff run passed. Record
  those states separately and wait for maintainer direction rather than making
  speculative changes.
- The five drafts add submitted work without changing the qualifying merged
  count (still 35). Keep them in monitor/review mode, count none until canonical
  merge, and leave the Notion batch blocked until a connector is available.

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

## 2026-08-13 OPS-028 observation

- **Maintainer-authored issues remain the strongest demand signal.** dataprof
  #559 and #553 were both authored by Andrea, whose repo has a constructive
  history with two prior merges; marginalia #17/#18 were authored by the
  maintainer with detailed proposals. All five lanes cleared preflight without
  competition.
- **A repo's AGENTS.md is a green light, not just a blocker.** dataprof's
  AGENTS.md explicitly instructs AI agents (branch naming, conventional
  commits, no AI attribution trailers) and its contributor loop produced two
  merges. Reading the policy early saved discovery time and shaped the PRs.
- **Cross-file plumbing needs its own regression layer.** marginalia #18's
  triplet threading touched parser, payload, client, background port,
  ask-service, ask-flow, thread-controller, and panel-global. Each layer kept
  its contract testable; the full suite went from 981 to 988 tests with zero
  regressions.
- **Preflight competition checks caught a duplicate before work.** Grafana
  #130611 looked clean on the issue but PR #130619 (opened hours earlier)
  already implemented it; the lane was abandoned before any checkout instead of
  after sunk cost.
- All five drafts are open/unmerged and therefore uncounted; the qualifying
  external merged total remains 35. Keep the queue in monitor/review mode and
  prefer fresh maintainer-authored issues in repos with proven constructive
  histories.

## 2026-08-13 OPS-029 observation

- **Maintainer invitations beat discovery.** dataprof #546 came with an explicit
  "@aryansk this one is a natural follow-up to your #535" comment; it became the
  fifth lane after the reserve pool emptied, and every other lane in the packet
  was also maintainer-authored. Four of the five lanes are dataprof, which is
  justified by a proven constructive history (two prior merges, an active
  maintainer, an AGENTS.md that instructs agents) rather than volume-seeking.
- **Mechanical fixes still need semantic care.** #550 (14 error sites) and #546
  (22 map sites) were both "mechanical", but each had a semantic decision: which
  remedy fits each failure cause, and whether BTreeMap's alphabetical order
  beats IndexMap's insertion order (the repo's existing BTreeMap precedent
  decided it without a new dependency).
- **Schema changes need the whole surface.** #548 added a source type, which
  touched the Rust enum, the Python getter, the runtime schema document, the
  published JSON schema, the pyi stub, the dispatch, and two tests. Missing any
  one would leave the published contract inconsistent.
- All five drafts are open/unmerged and therefore uncounted; the qualifying
  external merged total remains 35. Keep the queue in monitor/review mode and
  prefer maintainer-authored or maintainer-invited issues in proven repos.

## 2026-08-13 OPS-030 observation

- **Leak reproductions with a hard failure mode are the strongest bug lanes.**
  grafana #130649 came with a complete root-cause chain (writer short-write →
  pgzip skip-close → orphaned goroutine), a reproducer, and measured blast
  radius (a node going NotReady). The regression test first proved +100
  goroutines on unfixed code, then flat counts with the fix — the issue's own
  verification method.
- **CI-skip defects need fork-level evidence.** xarray #11517 documented six
  months of silent skips with run IDs, a root-cause commit, and fork runs
  showing the two-line fix executing the suite. Copying an already-merged fix
  pattern (#11184) to its sibling workflow is low-risk and high-value.
- **Per-panel listener leaks share one guard shape.** The two jupyterlab lanes
  (#19267, #19268) were the same defect class in two packages; each used a
  one-pass guard (WeakSet in the extension, stored slot in the widget) and a
  package build with zero TypeScript errors as the local validation anchor.
- **Fresh-issue space continues to saturate.** grpc-go #9313, helm #32532,
  prometheus #19395/#19397, black #5307, pylint #11267, and mypy #21841 all
  had claimant PRs within hours of filing. Honest packets stay viable only by
  checking competition first and dropping claimed lanes before any work.
- All five drafts are open/unmerged and therefore uncounted; the qualifying
  external merged total remains 35. Keep the queue in monitor/review mode.

## 2026-08-14 OPS-033 observation

- **Maintainer review requests are the strongest lanes.** The GCode #45
  follow-up existed only because the #43/#44 reviews asked for CHANGELOG
  entries and a demo snapshot; it merged into a repo with an extremely
  constructive loop (three merges the same day). Promising follow-up work in
  a committed reply is a real obligation — deliver it in the same session.
- **Merge reconciliation belongs before fresh discovery.** Three OPS-032 lanes
  (GCode #43/#44, StudyMap #132) merged while the packet sat open; reconciling
  them and replying to the review threads (GCode #43 inline nit, #44 docs
  items, StudyMap Vercel bot) before picking new lanes is exactly the
  required priority order.
- **Verify issue dependencies at preflight.** StudyMap #120 explicitly said
  "Depends on #127" (city pages); #127 was not built, and the only place
  surface is the server-rendered map page with no server-side per-place URL.
  The lane was BLOCKED before any code — the acceptance criteria were not
  implementable as specified. Also triaged out: marginalia #18 was already
  covered by our own draft #21, railtracks #1397 has a competing PR #1396, and
  xarray #11518 has the reporter's own PR #11521.
- **CI-hardening issues with precise deltas merge well.** jayqi #131 and
  scout-issue #9 both shipped as small, verifiable workflow changes (least-
  privilege permissions + SHA pins / gitleaks). The live state had drifted
  from the issue text, so documenting the actual delta in the PR body was
  important.
- **Security-scrub code needs honest heuristics.** The intent-drift-skill #26
  scrub masks known token prefixes, Authorization/Bearer, secret-key
  assignments, long `key=` values, and base64 blobs (only those with `+/` or
  `=` padding, so SHAs survive). Length/character gating prevents the classic
  false positives (`"key": "value"`, hex SHAs) that would have broken the PR.
- All five drafts are open/unmerged and therefore uncounted; the qualifying
  external merged total is 40. Keep the drafts in monitor/review mode and the
  Notion batch blocked until a connector is available.
- **Duplicates hide inside "fresh" issue lists — check the tracker first.**
  OPS-034 opened with jayqi #134, which turned out to be our own EXT-203 from
  OPS-032 (PR #177), and intent-drift-skill #23, which the maintainer had
  already implemented via merged PR #29 while leaving the issue open. Both
  were caught at preflight and abandoned without duplicating. The cheapest
  gate: grep the issue number against PR_TRACKER/WORK_QUEUE before reserving.
- **Large-repo saturation now extends to the mid-tier.** StudyMap #127 (a
  maintainer-authored "help wanted" feature) and scout-issue #10/#11 were the
  strongest lanes; the maintainer-recommended repos keep producing precise,
  verifiable work while big-repo issue space stays claimed or bot-clogged.
- **Unicode route segments need an explicit decode.** Next 16/Turbopack passes
  the still-encoded segment (e.g. `%E5%8E%A6%E9%97%A8`) to a `[slug]` page for
  non-ASCII values; matching dataset slugs against it silently 404s. Decode
  with `decodeURIComponent` (guarded) before comparing, and keep Unicode
  letters in slugify (regex `\p{L}`) so no city collapses to an empty slug.
- **"Already implemented, issue left open" is a real failure mode.** Both
  duplicates this packet were issues whose requested work existed on `main`
  but whose issues were never closed. Preflight must diff the issue's
  suggested fix against current `main`, not just against open PRs.

## OPS-035 outcome (2026-08-14)

- **Tracker-first discovery works.** Every candidate in this packet passed the
  duplicate gate against PR_TRACKER + WORK_QUEUE; zero lanes abandoned — the
  first clean packet since OPS-031. The preflight `gh search prs` re-check
  remains non-negotiable, but the tracker gate eliminates most rediscovery.
- **"Partially implemented upstream" is a common false-negative.** StudyMap
  #118 (deep links) looked unimplemented but `place`/`city`/`types` URL params
  already existed; the real gap was viewport mirroring. Read the live code
  (not just the issue) before scoping a lane; split "what the issue asks for"
  from "what already exists" and deliver the delta.
- **Maintainer duplicate-closes are a normal, non-defect outcome.** pandas
  #66744 was closed with "there is already an open PR for that issue" — the
  change itself was sound. The correct response is to record and resolve, not
  to reopen or argue; duplicate scope at submission time is hard to detect
  without a tracker (now mitigated).
- **Prod-route smoke beats dev-server smoke in this environment.** Dev servers
  die between commands here; a `next build` + curl sweep over the production
  server is more reliable for client-route verification.

## OPS-036 outcome (2026-08-14)

- **The tracker-first gate caught a cross-packet duplicate that the live PR
  search alone would have missed.** jayqi #130 (debug logging) was our own
  draft #176 from OPS-031; the `gh search prs` sweep surfaced it as a matching
  open PR but only the tracker revealed it was ours. Checking PR authors
  against our known draft list before abandoning/committing is now mandatory.
- **"Already implemented upstream" can arrive mid-lane.** GCode's main advanced
  while we were working (our own #46 merged), forcing a rebase with a tools.py
  conflict. The fix pattern — rebuild from origin/main, keep both parties'
  additions, force-push the same branch name — kept the PR thread and review
  history intact, and the maintainer's review comments stayed attached.
- **Issue author's suggested fix can be mathematically wrong.** scout-issue
  #13's own example table summed to 115%, not 100%. Always verify the numbers
  a proposal asserts before copying them; the corrected tables (verified
  programmatically) are a stronger contribution than the literal suggestion.
- **Maintainer slim-down requests are quick wins when acted on immediately.**
  The GCode owner's three-point feedback (drop redundant CHANGELOG, keep the
  useful demo change, fix stale premises) was fully actionable in one pass;
  the PR went from CONFLICTING to MERGEABLE/CLEAN with a single force-push and
  a description update.
