# Preferred five publication packet

This file is the resumable handoff for five legitimate upstream pull requests.
The refined-github PR is excluded from this campaign and will not be touched;
its maintainer request remains respected within that repository. Each
independent repository still requires its own live preflight.

## Current operating protocol

The historical tables in this handoff are leads and evidence, not a
preselected five-lane work order. The active workflow uses
`LANE_STATE.json`: keep at most a small reserve pool, select one candidate,
perform a fresh live preflight immediately before implementation, and repeat
that preflight immediately before publication. Use the next reserve candidate
when the issue closes, is claimed, overlaps another PR, or fails a policy or
validation gate. Record the four lane timestamps and count only canonical,
head-verified open drafts in `PUBLISHED`. Do not use a historical table entry
as current eligibility without both fresh checks.

## Current handoff — 2026-08-10

The latest five-PR packet is complete: Apache Beam #39688 and #39689 plus
OpenTelemetry Specification #5259, #5260, and #5261 are open drafts and
uncounted. Notion has exactly EXT-131 through EXT-135, with `PRs Submitted =
15` and `PRs Merged = 1` for 2026-08-10. An earlier packet PR,
failed-build-issue-action #157, merged during closeout and was reconciled
separately; the five current packet rows remain unmerged and uncounted. The
duplicate SQL query was blocked by the exhausted Query Data Source quota, but
all five rows and the submitted aggregate were directly refetched. The next
selection must use both gates in
`PLAN.md`: high-impact, active, currently relevant repositories and
medium-to-easy issue-backed scopes that can be implemented and validated
quickly.

Temporary checkouts for this packet are moved to recoverable quarantine after
closeout. A new thread must create fresh isolated clones and must not assume
the temporary local paths exist.

### Current packet records

| Order | Repository and issue | Canonical PR | Head commit | State / validation |
| ---: | --- | --- | --- | --- |
| 1 | [Apache Beam #18734](https://github.com/apache/beam/issues/18734) | [#39688](https://github.com/apache/beam/pull/39688) | `46dcda5` | Open draft; `git diff --check` passes; focused Gradle test blocked by missing Java; Beam checks in progress |
| 2 | [Apache Beam #19226](https://github.com/apache/beam/issues/19226) | [#39689](https://github.com/apache/beam/pull/39689) | `47f41f0` | Open draft; docs/API-comment change and diff check pass; Beam Go/website checks in progress |
| 3 | [OpenTelemetry Specification #4641](https://github.com/open-telemetry/opentelemetry-specification/issues/4641) | [#5259](https://github.com/open-telemetry/opentelemetry-specification/pull/5259) | `6e05a75` | Open draft; diff check and EasyCLA authorization pass; awaiting review |
| 4 | [OpenTelemetry Specification #4232](https://github.com/open-telemetry/opentelemetry-specification/issues/4232) | [#5260](https://github.com/open-telemetry/opentelemetry-specification/pull/5260) | `7cee0cb` | Open draft; diff check and EasyCLA authorization pass; awaiting review |
| 5 | [OpenTelemetry Specification #4434](https://github.com/open-telemetry/opentelemetry-specification/issues/4434) | [#5261](https://github.com/open-telemetry/opentelemetry-specification/pull/5261) | `9546b4f` | Open draft; diff check, `make markdownlint`, and EasyCLA authorization pass; awaiting review |

The five records are also reconciled in `PR_TRACKER.md` and Notion rows
EXT-131 through EXT-135. Do not create duplicate PRs from this packet.

## Previous handoff — 2026-08-10 (EXT-126 through EXT-130)

That prior five-PR packet was complete: JupyterLab #19255 and #19256, Rust
Clippy #17531, React Router #15387, and Setuptools #5295 are open drafts and
uncounted. Notion has exactly EXT-126 through EXT-130, with `PRs Submitted =
10` and `PRs Merged = 0` for 2026-08-10. The next selection must use both gates
in `PLAN.md`: high-impact, active, currently relevant repositories and
medium-to-easy issue-backed scopes that can be implemented and validated
quickly.

Temporary checkouts for this packet were moved to recoverable Trash, so a new
thread must create fresh isolated clones and must not assume the old local
paths below still exist.

### Previous packet records

| Order | Repository and issue | Canonical PR | Head commit | State / validation |
| ---: | --- | --- | --- | --- |
| 1 | [JupyterLab #16192](https://github.com/jupyterlab/jupyterlab/issues/16192) | [#19255](https://github.com/jupyterlab/jupyterlab/pull/19255) | `50c3ea4` | Open draft; pre-commit/Read the Docs pass; required triage-label check fails and label permission is unavailable |
| 2 | [JupyterLab #18336](https://github.com/jupyterlab/jupyterlab/issues/18336) | [#19256](https://github.com/jupyterlab/jupyterlab/pull/19256) | `023c7e5` | Open draft; pre-commit/Read the Docs pass; required triage-label check fails and label permission is unavailable |
| 3 | [Rust Clippy #17494](https://github.com/rust-lang/rust-clippy/issues/17494) | [#17531](https://github.com/rust-lang/rust-clippy/pull/17531) | `7cfb11a` | Open draft; initial dogfood expectation failure fixed; all hosted checks pass; local cargo test lacks `rustc-dev` |
| 4 | [React Router #12821](https://github.com/remix-run/react-router/issues/12821) | [#15387](https://github.com/remix-run/react-router/pull/15387) | `fbb2a4d` | Open draft; focused docs diff check passes; no hosted checks reported |
| 5 | [Setuptools #5272](https://github.com/pypa/setuptools/issues/5272) | [#5295](https://github.com/pypa/setuptools/pull/5295) | `af77708` | Open draft; mapping/diff checks and Read the Docs pass |

The five records are also reconciled in `PR_TRACKER.md` and Notion rows
EXT-126 through EXT-130. Do not create duplicate PRs from the historical
slate below.

## Historical batch closeout — 2026-08-06

The active five-PR packet is complete and verified: Sphinx #14586, go-git
#2300, nbconvert #2299, VoteKit #383, and LangGraph Agent Stack #124. IPython
#11919 was not duplicated because current `main` already contains the exact
fix; VoteKit #380 became the replacement lane. Notion was synchronized once,
after all five PRs were published, with five deduplicated tracker rows and a
verified daily aggregate/chart-source count of 32 for 2026-08-06. Future
packets follow the same batch-closeout rule.

## Hard stop

- Excluded lane: [refined-github #9941](https://github.com/refined-github/refined-github/pull/9941)
- Current state: closed as `AI SPAM`
- Maintainer instruction: provide genuine human-tested screenshot/video
  evidence before reopening, and do not open more refined-github PRs until that
  is resolved.
- Required action: do not open or modify another refined-github PR. This does
  not block independent repositories in this packet.

## Excluded duplicate candidate

TencentDB-Agent-Memory #817 is not part of the five. Open upstream [PR
#816](https://github.com/TencentCloud/TencentDB-Agent-Memory/pull/816) changes
the same deployment scripts and explicitly covers the same Windows/Git Bash
host-IP behavior. Keep the local commit as evidence only and do not open a
duplicate unless #816 closes without resolving the issue.

## Historical publication slate — do not publish without fresh preflight

Use this order unless a live issue or maintainer response changes it. Publish
one draft PR at a time, verify its canonical state, then continue only if the
repository's maintainers have not asked contributors to stop.

| Order | Repository and issue | Local checkout | Base | Branch | Current commit | Validation | State |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [DeepSeek-Reasonix #7660](https://github.com/esengine/DeepSeek-Reasonix/issues/7660) | `/Users/aryansingh/Downloads/Projects/Automation/deepseek-reasonix-7660` | `main-v2` | `codex/issue-7660-tui-file-links` | `c698142` | `mise exec go@1.26.5 -- go test ./... -count=1`; `mise exec go@1.26.5 -- go vet ./internal/cli` | Draft [PR #7692](https://github.com/esengine/DeepSeek-Reasonix/pull/7692); checks pending |
| 2 | [AirLLM #330](https://github.com/lyogavin/airllm/issues/330) | `/Users/aryansingh/Downloads/Projects/Automation/airllm-330` | `main` | `codex/issue-330-compression-claims` | `ee3a1f8` | `python3 -m py_compile air_llm/airllm/utils.py`; `git diff --check` | Draft [PR #334](https://github.com/lyogavin/airllm/pull/334); GitGuardian pending |
| 3 | [AI-For-Beginners #706](https://github.com/microsoft/AI-For-Beginners/issues/706) | `/Users/aryansingh/Downloads/Projects/Automation/ai-for-beginners-706` | `main` | `codex/issue-706-tamil-translation` | `07e0602` | Tamil-script count 102; Devanagari count 0; `git diff --check` | Draft [PR #729](https://github.com/microsoft/AI-For-Beginners/pull/729); no hosted checks reported |
| 4 | [grpc-go #9235](https://github.com/grpc/grpc-go/issues/9235) | `/Users/aryansingh/Downloads/Projects/Automation/grpc-go-9235` | `master` | `codex/issue-9235-stats-authority` | `df0c780` | `mise exec go@1.26.5 -- gofmt -d stats/stats.go stats/stats_test.go internal/transport/http2_client.go`; `mise exec go@1.26.5 -- go test ./stats ./internal/transport` | Draft [PR #9296](https://github.com/grpc/grpc-go/pull/9296); EasyCLA reports missing authorization |
| 5 | [Swift Distributed Tracing #232](https://github.com/apple/swift-distributed-tracing/issues/232) | `/Users/aryansingh/Downloads/Projects/Automation/swift-distributed-tracing-232` | `main` | `codex/issue-232-multiplex-tracer` | `603da5b` | `swift test`; Swift format lint; `git diff --check` | Draft [PR #235](https://github.com/apple/swift-distributed-tracing/pull/235); no hosted checks reported |

## Preflight for every candidate

1. Leave refined-github #9941 untouched; it is excluded from this campaign.
2. Read the canonical issue, its newest comments, assignees, labels, and
   linked/competing pull requests.
3. Confirm the repository owner is external, the issue remains open, the base
   branch is still correct, and the license/contribution rules permit the
   change.
4. Reject broad architecture work and unresolved design issues. Prefer a
   medium-to-easy, issue-backed scope that can be implemented and validated in
   a short session.
5. Confirm the local checkout is clean, the exact branch and commit match this
   packet, and the relevant validation still passes.
6. Resolve the exact fork/head repository. Reuse a matching fork branch or PR
   if one already exists; never create a duplicate.
7. Push only the reviewed branch, compare the remote branch hash with the
   local commit, and stop if they differ.
8. Open one **draft** PR with exactly one base/head pair and link the issue.
9. Verify the canonical PR URL, author, base, head, draft state, and checks.
10. Continue through all five verified lanes without pausing for dashboard work.
11. After the complete packet is published, sync one deduplicated Notion row
    per PR and recompute/verify the **PRs Submitted Per Day** chart once. Then
    append the batch result to `WORK_LOG.md`, update `STATUS.md` and
    `WORK_QUEUE.md`, and keep open/draft work out of the merged count. Update
    `PR_TRACKER.md`'s open-submission reconciliation; add a merged evidence row
    only after the canonical upstream PR actually merges.

## PR body outlines

Use the matching triage file for full evidence. These outlines are intentionally
specific to the issue and should be updated if the live issue changes.

### TencentDB-Agent-Memory #817

Title: `fix: support Windows Git Bash host IP detection`

Summary: Fix host-IP discovery when Git Bash invokes Windows `ipconfig`, keep
Darwin-only syntax on macOS, validate single IPv4 results, and preserve Linux
fallbacks. Link `#817` and report the mocked platform regression test.

### DeepSeek-Reasonix #7660

Title: `fix: make local Markdown file links interactive in the TUI`

Summary: Add OSC 8 links for browser and local file targets, resolve workspace
paths from the controller/`--dir` root, preserve copy text, and reject unsafe
schemes/control characters. Link `#7660` and report focused plus full Go tests.

### AI-For-Beginners #706

Title: `fix: restore the Tamil translation in the translated README`

Summary: Restore the Tamil-language README content requested by #706, retain
the repository's translation structure, and report the Tamil-script,
Devanagari, and whitespace checks.

### grpc-go #9235

Title: `stats: expose client authority in OutHeader`

Summary: Add the effective client authority to `stats.OutHeader`, source it
from `callHdr.Host` as requested by the maintainer, and add unary client stats
regression coverage. Link `#9235` and report gofmt plus focused package tests.

### Swift Distributed Tracing #232

Title: `Fix MultiplexInstrument tracer fan-out`

Summary: Add type-erased multiplex tracer/span forwarding so every configured
tracer observes span lifecycle operations, with direct and global instrumentation
coverage. Link `#232` and report the full Swift test suite.

## Counting rule

None of these local commits, fork branches, open PRs, draft PRs, or closed PRs
counts toward the 100-merged-PR target. Add a row to `PR_TRACKER.md` only after
the canonical upstream PR is merged and its merge commit and checks are
verified.

## 2026-08-10 latest handoff — EXT-136 through EXT-140

The latest five were published and hash-verified as canonical upstream drafts:

- [Vercel Skills #1914](https://github.com/vercel-labs/skills/pull/1914) —
  `55ba16b2272312996f4e9b0ac08c752efd51aa7c`; 49 Vitest tests, TypeScript,
  and diff checks pass; Vercel team authorization is blocked.
- [mypy #21831](https://github.com/python/mypy/pull/21831) —
  `55411e67fd19de3f33bf19f05868e8daeff0d470`; focused tests, self-check, and
  hosted checks pass.
- [Swift Argument Parser #941](https://github.com/apple/swift-argument-parser/pull/941) —
  `79a851c20bb5653cef53618839a34e8d42fc05c1`; build, 10 focused tests, and
  the rejecting integration command pass.
- [Setuptools #5298](https://github.com/pypa/setuptools/pull/5298) —
  `6e3273dff919e1c218cd4ecdb0ec9f462c6bc48a`; editable install and strict
  Sphinx build pass, using the repository's [skeleton guidance](https://blog.jaraco.com/skeleton/).
- [nbconvert #2300](https://github.com/jupyter/nbconvert/pull/2300) —
  `1fab6813f44f89017e7bcad27578571447b5b9c2`; 23 Python 3.9 tests and all
  functional/docs/link/pre-commit hosted checks pass; the repository
  enforce-label gate remains maintainer-controlled.

All five are Draft/uncounted. No merge count is added until GitHub reports a
canonical upstream merge with its merge commit.
