# Merged PR tracker

Only merged PRs against repositories Aryan does not own belong in this table.
Do not fill future rows in advance. One row represents one actual merged PR.

## Summary

| Metric | Value | Last verified |
| --- | ---: | --- |
| Valid merged PRs in rolling 12 months | 35 | 2026-08-11 live verification; one owned PR excluded |
| Valid merged PRs in current calendar year | 35 | 2026-08-11 live verification; one owned PR excluded |
| External repositories with merged work | 30 | 2026-08-11 live verification |
| Human conversation items | 34 | 2026-08-10 all-authored-PR-state comment audit; failed-build-issue-action merge follow-up replied |
| Releases containing contributed work | 0 | Update when verified |

Open PRs are tracked in the work queue but are deliberately absent from the
merged-PR table. Submitted and unmerged draft PRs are recorded in the work
queue and the dated reconciliation sections below; they do not affect the
merged total until a canonical upstream merge is verified.

- pre-commit issue #3410 via submitted draft [PR #3740](https://github.com/pre-commit/pre-commit/pull/3740) (closed by CI);
- SwiftSyntax issue #3397 via draft [PR #3398](https://github.com/swiftlang/swift-syntax/pull/3398);
- jupyter_core issue #409 via draft [PR #462](https://github.com/jupyter/jupyter_core/pull/462);
- importlib_metadata issue #526 via draft [PR #544](https://github.com/python/importlib_metadata/pull/544); and
- nbformat issue #406 via draft [PR #451](https://github.com/jupyter/nbformat/pull/451).

All five lanes remain uncounted until canonical upstream merge. Existing open
candidates include:
[realm/SwiftLint#6856](https://github.com/realm/SwiftLint/pull/6856),
[swiftlang/swift-format#1257](https://github.com/swiftlang/swift-format/pull/1257),
[apple/swift-argument-parser#940](https://github.com/apple/swift-argument-parser/pull/940),
[swift-server/swift-service-lifecycle#250](https://github.com/swift-server/swift-service-lifecycle/pull/250),
[tuist/tuist#12203](https://github.com/tuist/tuist/pull/12203),
[vercel-labs/skills#1850](https://github.com/vercel-labs/skills/pull/1850),
[realm/SwiftLint#6854](https://github.com/realm/SwiftLint/pull/6854),
[EbookFoundation/free-programming-books#13390](https://github.com/EbookFoundation/free-programming-books/pull/13390),
[EbookFoundation/free-programming-books#13395](https://github.com/EbookFoundation/free-programming-books/pull/13395),
[donnemartin/system-design-primer#1347](https://github.com/donnemartin/system-design-primer/pull/1347), and
[jwasham/coding-interview-university#2145](https://github.com/jwasham/coding-interview-university/pull/2145), and
[swiftlang/swift-driver#2167](https://github.com/swiftlang/swift-driver/pull/2167), and
[ansible/ansible#87345](https://github.com/ansible/ansible/pull/87345), and
[apple/swift-nio#3692](https://github.com/apple/swift-nio/pull/3692), and
[virgiliojr94/book-to-skill#112](https://github.com/virgiliojr94/book-to-skill/pull/112),
[different-ai/openwork#3572](https://github.com/different-ai/openwork/pull/3572),
[pascalorg/editor#602](https://github.com/pascalorg/editor/pull/602), and
[Boeing/config-file-validator#643](https://github.com/Boeing/config-file-validator/pull/643), and
[cmu-sei/Polar#243](https://github.com/cmu-sei/Polar/pull/243),
[esengine/DeepSeek-Reasonix#7692](https://github.com/esengine/DeepSeek-Reasonix/pull/7692),
[lyogavin/airllm#334](https://github.com/lyogavin/airllm/pull/334),
[microsoft/AI-For-Beginners#729](https://github.com/microsoft/AI-For-Beginners/pull/729),
[grpc/grpc-go#9296](https://github.com/grpc/grpc-go/pull/9296), and
[apple/swift-distributed-tracing#235](https://github.com/apple/swift-distributed-tracing/pull/235).

The current packet's GCode lanes [#36](https://github.com/shauryagangrade/GCode/pull/36),
[#37](https://github.com/shauryagangrade/GCode/pull/37), and
[#38](https://github.com/shauryagangrade/GCode/pull/38), plus StudyMap #130 and
#131, are no longer open because they merged during this packet closeout.

The latest packet above is in addition to earlier open drafts. Navi issue #636
was rechecked after implementation began and was closed before publication, so
no Navi branch or PR was created.

`1jehuang/jcode#795` is not listed as an open PR because GitHub rejected both
CLI creation paths for the external fork. Its tested branch is recorded in the
queue and triage log, but it has no countable PR state.

No PR exists for `ayghri/i-have-adhd#96`; it is recorded in the queue and triage
logs but is not an open PR or countable record because GitHub restricts
interactions to prior contributors. `pascalorg/editor#308` is represented by
open draft PR #602, and `Boeing/config-file-validator#631` by open draft PR
#643; both remain uncounted until canonical upstream merge.

`TencentCloud/TencentDB-Agent-Memory#817` is implemented locally at commit
`89531bef` but is deferred because open [PR #816](https://github.com/TencentCloud/TencentDB-Agent-Memory/pull/816)
independently changes the same deployment scripts and covers the same
Windows/Git Bash host-IP behavior. No duplicate fork or PR was created; it is
not an open or countable record.

`esengine/DeepSeek-Reasonix#7660` is implemented at DCO-signed commit
`c698142848690b0cb1b6b81d81a5fd05f994240f` and published as draft [PR #7692](https://github.com/esengine/DeepSeek-Reasonix/pull/7692)
against `main-v2`. The fork branch hash matches local and hosted checks are
pending; it is open but not countable until canonical upstream merge.

`swift-server/swift-service-lifecycle#163` is implemented locally at commits
`cfab3a6` and `893037f` in `/Users/aryansingh/Downloads/Projects/Automation/swift-service-lifecycle-163`
but has no fork or PR because its issue maintainer requested waiting for user
reports.
The local patch now includes the maintainer-proposed `CancellableService`
abstraction, but the issue maintainer also requested waiting for user reports.
It is recorded in the queue and triage log only; it is not an open or countable
PR. Existing draft PR #250 is a separate issue and remains independently
tracked.

The remaining five-candidate publication lanes are now open as drafts:

- `microsoft/AI-For-Beginners#706` at `07e0602` via draft [PR #729](https://github.com/microsoft/AI-For-Beginners/pull/729);
- `grpc/grpc-go#9235` at `3ffedf3` plus formatting commit `df0c780` via draft [PR #9296](https://github.com/grpc/grpc-go/pull/9296); and
- `apple/swift-distributed-tracing#232` at `603da5b` via draft [PR #235](https://github.com/apple/swift-distributed-tracing/pull/235).

Each fork branch hash matches its tested local commit; none is countable until
canonical upstream merge. AirLLM #330 is open as draft PR #334 alongside
DeepSeek-Reasonix #7692.

TencentDB-Agent-Memory #817 is deferred because of overlapping PR #816. Swift
Service Lifecycle #163 remains a conditional alternative because its issue
maintainer requested waiting for user reports.

Refined GitHub PR #9941 is excluded from the open-candidate list because the
maintainer closed it as “AI SPAM” and requested a human-tested screenshot/video
before reopening. It remains uncounted and will not be reopened or modified;
that repository-specific request does not block the independent draft PRs
listed above.

The following five independent issue-backed lanes were the latest five at the
time of the 2026-08-06 snapshot:

- `go-git/go-git#436` at `73db539` via draft [PR #2299](https://github.com/go-git/go-git/pull/2299);
- `Goldziher/spikard#117` at `f6d5be9` via draft [PR #120](https://github.com/Goldziher/spikard/pull/120);
- `AndreaBozzo/dataprof#500` at `2c52e4a` via [PR #535](https://github.com/AndreaBozzo/dataprof/pull/535), later merged and recorded as tracker row 7;
- `defi0x1/claude-session-sync#3` at `6705a72` via draft [PR #5](https://github.com/defi0x1/claude-session-sync/pull/5); and
- `saajann/openuni#61` at `7f8de5f` via draft [PR #63](https://github.com/saajann/openuni/pull/63).

The other four snapshot lanes were authored by `aryansk`, pointed at verified
default branches, and remained uncounted at that time. Dataprof later merged;
Spikard had hosted checks in progress, while the remaining lanes reported no
hosted checks.

## Counting rules

- `Status` must be `MERGED`.
- `Base repository owned by Aryan?` must be `No`.
- `Counted in rolling 12 months?` must be `Yes` only when the merge date is
  within the current 12-month window.
- If a PR is reverted, record the fact in `Notes`; do not erase history.
- If GitHub identity or author attribution is ambiguous, leave it uncounted
  until resolved.

## Tracker

| # | Base repository | Issue URL | PR URL | Title | Category | Submitted | Merged | Merge commit | Checks | Reviewer/maintainer | Counted? | Notes |
| ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | [alibaba/open-code-review](https://github.com/alibaba/open-code-review) | [#730](https://github.com/alibaba/open-code-review/issues/730) | [#731](https://github.com/alibaba/open-code-review/pull/731) | Add Pages `npm test` to CI | CI | 2026-08-05 | 2026-08-05 | `3966d33ac7056f2a1319e5b4151dd0442b2a54d3` | `test`, CodeQL, cross-compile, `code-review`, `license/cla` passed | GitHub review decision `APPROVED` | Yes | Canonical upstream merge verified; contributing commit `d98b9e2` carries DCO sign-off but is not cryptographically signed |
| 2 | [vinta/awesome-python](https://github.com/vinta/awesome-python) | — | [#3273](https://github.com/vinta/awesome-python/pull/3273) | Add `msgspec` to serialization libraries | README | 2026-08-02 | 2026-08-05 | `94159a8d53665a41a7894dff5a134e353c769df2` | `test` passed | GitHub review decision `APPROVED` | Yes | Canonical upstream merge verified; README-only change, merged after maintainer update commit |
| 3 | [nivaas219/ossfind](https://github.com/nivaas219/ossfind) | [#7](https://github.com/nivaas219/ossfind/issues/7) | [#11](https://github.com/nivaas219/ossfind/pull/11) | Fix trending command fall-through | Bug fix | 2026-08-06 | 2026-08-06 | `3bd823b06592079c3c985758c2865790daf7fd80` | `test`, `build` passed | Maintainer merge by `nivaas219` | Yes | Canonical upstream merge verified; contributing commit `e76b1df`; hosted checks passed |
| 4 | [tsouth89/toolport](https://github.com/tsouth89/toolport) | [#631](https://github.com/tsouth89/toolport/issues/631) | [#640](https://github.com/tsouth89/toolport/pull/640) | List public gateway environment overrides in `--help` | Docs | 2026-08-07 | 2026-08-07 | `2efd0f38a7fb9ae50e92973749ca684ae068a146` | Build + test, image, and gateway-binary checks passed | Canonical upstream merge verified | Yes | Contributing commit `5c3aff8`; externally owned base repository; Notion EXT-071 reconciled |
| 5 | [Kc1t/alethe-agents](https://github.com/Kc1t/alethe-agents) | [#49](https://github.com/Kc1t/alethe-agents/issues/49) | [#53](https://github.com/Kc1t/alethe-agents/pull/53) | Enforce frontend lint and formatting checks in CI | CI | 2026-08-07 | 2026-08-07 | `73eaf9f4bcabc43b30d72c9ef95e6907fc808f06` | No hosted checks reported | Canonical upstream merge verified | Yes | Contributing commit `9eb5785`; externally owned base repository; Notion EXT-074 reconciled |
| 6 | [danhnm1203/scrollytelling](https://github.com/danhnm1203/scrollytelling) | [#64](https://github.com/danhnm1203/scrollytelling/issues/64) | [#71](https://github.com/danhnm1203/scrollytelling/pull/71) | List generated preview frames | Feature | 2026-08-07 | 2026-08-07 | `104fc6a4b84d67d9cc60f044c1e8e4daa06fe41b` | `npm test` passed 454/454 across 71 suites | Maintainer requested ready state; canonical merge verified | Yes | Contributing commit `bbaebbe`; externally owned base repository; Notion EXT-084 reconciled |
| 7 | [AndreaBozzo/dataprof](https://github.com/AndreaBozzo/dataprof) | [#500](https://github.com/AndreaBozzo/dataprof/issues/500) | [#535](https://github.com/AndreaBozzo/dataprof/pull/535) | Add recipes for validating saved ProfileReport JSON | Docs | 2026-08-06 | 2026-08-07 | `84e98ea9e8b58f307306b7983607ed4c0001891e` | Rust schema test 7/7; Python validation example passed | AndreaBozzo review fixes; canonical merge verified | Yes | Contributing commit `7da869b`; externally owned base repository; Notion EXT-042 reconciled |
| 8 | [pyuvm/pyuvm](https://github.com/pyuvm/pyuvm) | [#421](https://github.com/pyuvm/pyuvm/issues/421) | [#422](https://github.com/pyuvm/pyuvm/pull/422) | Add non-blocking sequence-item polling | Feature | 2026-08-06 | 2026-08-07 | `e6078886030bf66ccd58d19fca2a573125c52e54` | Full pytest passed 607 tests with 7 expected xfails; Ruff passed | Maintainer approved the edge-case coverage; canonical merge verified | Yes | Contributing commit `856f6bf`; externally owned base repository; Notion EXT-059 reconciled |
| 9 | [dheerajjha/mcp-migrate](https://github.com/dheerajjha/mcp-migrate) | [#149](https://github.com/dheerajjha/mcp-migrate/issues/149) | [#189](https://github.com/dheerajjha/mcp-migrate/pull/189) | Load JavaScript source files during scanning | Bug fix | 2026-08-07 | 2026-08-07 | `1a2fa9d947211fdf6d696ca69d111c7f8b425c1d` | Initial full pytest passed 411 tests; maintainer later reported 454 after rebase | Maintainer verified the behavior and merged the rebased branch | Yes | Contributing commit `e4db981`; externally owned base repository; Notion EXT-072 reconciled |
| 10 | [open-multi-agent/open-multi-agent](https://github.com/open-multi-agent/open-multi-agent) | [#467](https://github.com/open-multi-agent/open-multi-agent/issues/467) | [#470](https://github.com/open-multi-agent/open-multi-agent/pull/470) | Restore persisted conversation history | Feature | 2026-08-07 | 2026-08-07 | `32d5e8cf518e54dfac24c4c86341c7ce3c37d97d` | Focused agent-hooks suite passed 21 tests; TypeScript lint passed | Canonical upstream merge verified | Yes | Contributing commit `e0243bf`; externally owned base repository; Notion EXT-073 reconciled |
| 11 | [orval-labs/orval](https://github.com/orval-labs/orval) | [#3818](https://github.com/orval-labs/orval/issues/3818) | [#3820](https://github.com/orval-labs/orval/pull/3820) | Make the Fetch playground example generate fetch code | Docs | 2026-08-07 | 2026-08-07 | `1f06e5d33ee5d0ca133f08da56dd413b9e97d2d6` | Ubuntu and Windows PR checks, preview publish, Socket Security, and Continuous Releases passed | Melloware approved and merged the canonical upstream PR | Yes | Final head `76d7048d`; externally owned base repository; Notion EXT-050 reconciled |
| 12 | [saajann/openuni](https://github.com/saajann/openuni) | [#61](https://github.com/saajann/openuni/issues/61) | [#63](https://github.com/saajann/openuni/pull/63) | Pull the Ollama generation model before API startup | Bug fix | 2026-08-06 | 2026-08-07 | `c9fc1ddf190194e4a1198f4215135ce0d41850d4` | `lint-and-test` passed | Saajan Saini merged the canonical upstream PR | Yes | Final head `e5361f94`; externally owned base repository; Notion EXT-044 reconciled |
| 13 | [cmu-sei/Polar](https://github.com/cmu-sei/Polar) | [#218](https://github.com/cmu-sei/Polar/issues/218) | [#243](https://github.com/cmu-sei/Polar/pull/243) | Remove insecure HTTP credential candidates | Bug fix | 2026-08-06 | 2026-08-07 | `e08287bb650cc51b0497eeeecf464956e270d606` | No hosted checks reported; local resolver tests and static checks were the available evidence | David Shepard merged the canonical upstream PR | Yes | Final head equals merge commit; externally owned base repository; Notion EXT-032 reconciled |
| 14 | [EbookFoundation/free-programming-books](https://github.com/EbookFoundation/free-programming-books) | [#13336](https://github.com/EbookFoundation/free-programming-books/issues/13336) | [#13395](https://github.com/EbookFoundation/free-programming-books/pull/13395) | Remove dead Armenian Python resource link | README | 2026-08-05 | 2026-08-07 | `ef1ed02b423e9fc3f0b41ccbcf55e887001ea1b0` | Changed-files URL checks, conflict detection, Markdown lint, build, README checks, and GitHub report passed | Eric Hellman merged the canonical upstream PR | Yes | Final head `4c555714`; externally owned base repository; Notion EXT-029 reconciled |
| 15 | [wemake-services/django-modern-rest](https://github.com/wemake-services/django-modern-rest) | [#1225](https://github.com/wemake-services/django-modern-rest/issues/1225) | [#1227](https://github.com/wemake-services/django-modern-rest/pull/1227) | Add `--skip-validation` to schema export | Feature | 2026-08-09 | 2026-08-09 | `6f4b8aa166038a5ffb61fa05f7406ad5cd6769ec` | Targeted integration tests 58/58 and Ruff passed | Maintainer-authored test updates followed by canonical merge | Yes | Externally owned base repository; Notion EXT-098 reconciled |
| 16 | [Avenx-JS/avenx-js](https://github.com/Avenx-JS/avenx-js) | [#888](https://github.com/Avenx-JS/avenx-js/issues/888) | [#892](https://github.com/Avenx-JS/avenx-js/pull/892) | Document `enableProfiling` option and global flag | Docs | 2026-08-09 | 2026-08-09 | `0e16044fd4643d26cb0a4471e1e90f40777ce18c` | npm tests 96/96, lint, and diff checks passed | Canonical upstream merge verified | Yes | Externally owned base repository; Notion EXT-099 reconciled |
| 17 | [shauryagangrade/scout-issue](https://github.com/shauryagangrade/scout-issue) | [#8](https://github.com/shauryagangrade/scout-issue/issues/8) | [#14](https://github.com/shauryagangrade/scout-issue/pull/14) | Enforce broken-link checks in CI | CI | 2026-08-09 | 2026-08-09 | `6d2e183d941ac48a69745bec843d8d0ca0e0a3f1` | Hosted validate, test-skill, and lint passed | Owner merge verified | Yes | Externally owned base repository; Notion EXT-107 reconciled |
| 18 | [StudentSuite/StudyMap](https://github.com/StudentSuite/StudyMap) | [#125](https://github.com/StudentSuite/StudyMap/issues/125) | [#130](https://github.com/StudentSuite/StudyMap/pull/130) | Make empty and offline states actionable | Feature | 2026-08-09 | 2026-08-09 | `d726fe1db223b53c0ac5b402fc6744c816814c1d` | ESLint, 38 Vitest tests, TypeScript, Next build, and diff check passed; Vercel authorization gate failed | Maintainer merge verified | Yes | Canonical merge `2026-08-09T11:03:39Z`; externally owned base repository; Notion EXT-114 reconciled |
| 19 | [StudentSuite/StudyMap](https://github.com/StudentSuite/StudyMap) | [#121](https://github.com/StudentSuite/StudyMap/issues/121) | [#131](https://github.com/StudentSuite/StudyMap/pull/131) | Add README screenshots and walkthrough | Docs | 2026-08-09 | 2026-08-09 | `04bea59f92d6c8326ca8a4dd021f2b7c6e09c2a7` | 1440x900 screenshots, 14-second GIF, relative links, and diff check passed; Vercel authorization gate failed | Maintainer merge verified | Yes | Canonical merge `2026-08-09T11:03:42Z`; externally owned base repository; Notion EXT-115 reconciled |
| 20 | [swift-server/swift-service-lifecycle](https://github.com/swift-server/swift-service-lifecycle) | [#248](https://github.com/swift-server/swift-service-lifecycle/issues/248) | [#250](https://github.com/swift-server/swift-service-lifecycle/pull/250) | Remember graceful shutdown requested before run | Bug fix | 2026-08-03 | 2026-08-09 | `7f9326b0326ff86e3646295ea6e891f68c471c5e` | All 70 local package tests and diff checks passed; no hosted checks reported | Review decision `APPROVED`; canonical merge verified | Yes | Merged 2026-08-09T15:17:00Z; externally owned base repository; Notion EXT-009 reconciled |
| 21 | [zzet/gortex](https://github.com/zzet/gortex) | [#518](https://github.com/zzet/gortex/issues/518) | [#520](https://github.com/zzet/gortex/pull/520) | Test: sandbox MCP query logs | Bug fix | 2026-08-09 | 2026-08-09 | `d21a449f3feaac33e769ce87b6addf7048b948a5` | Targeted and full `internal/mcp` tests passed; gofmt and diff checks passed | Maintainer approved; canonical merge verified | Yes | Merged 2026-08-09T17:04:02Z; externally owned base repository; Notion EXT-109 reconciled |
| 22 | [roman-berlin/Zelqivo-Video-Program](https://github.com/roman-berlin/Zelqivo-Video-Program) | [#100](https://github.com/roman-berlin/Zelqivo-Video-Program/issues/100) | [#102](https://github.com/roman-berlin/Zelqivo-Video-Program/pull/102) | Docs: document platform log locations | Docs | 2026-08-09 | 2026-08-09 | `5b59828bb8d4683e0f8976f70c16a31e722a925d` | Focused logging test passed 1/1 and diff checks passed; README conflict resolved by maintainer | Maintainer approved; canonical merge verified | Yes | Merged 2026-08-09T18:09:40Z; externally owned base repository; Notion EXT-108 reconciled |
| 23 | [RailtownAI/railtracks](https://github.com/RailtownAI/railtracks) | [#1342](https://github.com/RailtownAI/railtracks/issues/1342) | [#1344](https://github.com/RailtownAI/railtracks/pull/1344) | feat(cli): add Codex skill installation support | Feature | 2026-08-02 | 2026-08-09 | `e1eb14ed834885a0c2300277237191141bc8f4c7` | 53 focused CLI tests, Ruff, strict MkDocs build, and diff checks passed; maintainer approved and confirmed merge after checks | Maintainer approved; canonical merge verified | Yes | Merged 2026-08-09T21:43:40Z; externally owned base repository; Notion EXT-030 reconciled |
| 24 | [jayqi/failed-build-issue-action](https://github.com/jayqi/failed-build-issue-action) | [#155](https://github.com/jayqi/failed-build-issue-action/issues/155) | [#157](https://github.com/jayqi/failed-build-issue-action/pull/157) | test: keep action tests in sync with action.yml | CI | 2026-08-09 | 2026-08-10 | `275f97540e9fec8dec0fe61bada563765f1a4dad` | 34 tests passed with 100% coverage; lint, Codecov, and diff checks passed | Maintainer approved; canonical merge verified; follow-up reply posted | Yes | Merged 2026-08-10T03:21:51Z; contributing commit `af6cd2e`; maintainer follow-up `02958c7`; Notion EXT-106 reconciled |
| 25 | [shauryagangrade/GCode](https://github.com/shauryagangrade/GCode) | [#28](https://github.com/shauryagangrade/GCode/issues/28) | [#38](https://github.com/shauryagangrade/GCode/pull/38) | Make invalid regex errors actionable | Bug fix | 2026-08-09 | 2026-08-10 | `91ebb888c9162b31fc5bd3a581e2e265d40acc22` | Python 3.10/3.11/3.12 CI passed; 16 local tests and diff check passed | Owner merge verified | Yes | Merged 2026-08-10T07:09:59Z; contributing head `497abd5c`; Notion merge reconciliation pending |
| 26 | [shauryagangrade/GCode](https://github.com/shauryagangrade/GCode) | [#30](https://github.com/shauryagangrade/GCode/issues/30) | [#37](https://github.com/shauryagangrade/GCode/pull/37) | Add case-insensitive grep | Feature | 2026-08-09 | 2026-08-10 | `4f2b9b93e2f8ecf3fd77773fb1d5d2deb3eb533a` | Python 3.10/3.11/3.12 CI passed; 18 local tests and diff check passed | Owner merge verified | Yes | Merged 2026-08-10T07:13:55Z; contributing head `4eedb0c8`; Notion merge reconciliation pending |
| 27 | [shauryagangrade/GCode](https://github.com/shauryagangrade/GCode) | [#32](https://github.com/shauryagangrade/GCode/issues/32) | [#36](https://github.com/shauryagangrade/GCode/pull/36) | Add `/diff` slash command | Feature | 2026-08-09 | 2026-08-10 | `768b5926ab1d9167b87efcad033c5191f6e9e950` | Python 3.10/3.11/3.12 CI passed; 18 local tests, compileall, and diff check passed | Owner merge verified | Yes | Merged 2026-08-10T07:17:42Z; contributing head `5ee21d19`; Notion merge reconciliation pending |
| 28 | [AndreaBozzo/dataprof](https://github.com/AndreaBozzo/dataprof) | [#526](https://github.com/AndreaBozzo/dataprof/issues/526) | [#556](https://github.com/AndreaBozzo/dataprof/pull/556) | Make LLM context null flags round-trip stable | Bug fix | 2026-08-09 | 2026-08-10 | `1d4c6bbfb2e9730e3f9bfe3b33655edb16991423` | 20 focused tests, 825 Python tests, Ruff, `ty`, and all hosted checks passed | AndreaBozzo approved and merged | Yes | Merged 2026-08-10T09:35:00Z; contributing head `5f3a26ae` |
| 29 | [github-linguist/linguist](https://github.com/github-linguist/linguist) | [#6353](https://github.com/github-linguist/linguist/issues/6353) | [#8103](https://github.com/github-linguist/linguist/pull/8103) | Add Tape language support | Feature | 2026-08-06 | 2026-08-10 | `4915247cedc8122af0bdc934e20b5676084eba93` | YAML ordering, submodule ordering, `git diff --check` passed; hosted Ruby checks passed after ordering fix `d9e8be47` | lildude/maaslalani approved | Yes | Merged 2026-08-10T11:37:33Z at `4915247c`; canonical state MERGED verified 2026-08-11 |
| 30 | [jupyter/nbformat](https://github.com/jupyter/nbformat) | [#406](https://github.com/jupyter/nbformat/issues/406) | [#451](https://github.com/jupyter/nbformat/pull/451) | Clarify normalize guidance in the changelog | Docs | 2026-08-06 | 2026-08-10 | `2e1272b76b6906d51cc235315107ab847371a751` | Validator suite 52 passed 2 skipped, pre-commit.ci/docs checks passed, bot formatting `c4bc6ab` | Canonical merge verified | Yes | Merged 2026-08-10T12:42:11Z at `2e1272b7` |
| 31 | [Brescou/langgraph-agent-stack](https://github.com/Brescou/langgraph-agent-stack) | [#121](https://github.com/Brescou/langgraph-agent-stack/issues/121) | [#124](https://github.com/Brescou/langgraph-agent-stack/pull/124) | feat: add Redis-backed idempotency store | Feature | 2026-08-06 | 2026-08-10 | `67ec21623b5716c27e7ee5529706848fae05c540` | 9 focused tests, Ruff/format/diff checks passed; maintainer-requested docs/ `get()` fix included | Brescou approved | Yes | Merged 2026-08-10T13:11:36Z at `67ec2162` |
| 32 | [open-telemetry/opentelemetry-specification](https://github.com/open-telemetry/opentelemetry-specification) | [#4232](https://github.com/open-telemetry/opentelemetry-specification/issues/4232) | [#5260](https://github.com/open-telemetry/opentelemetry-specification/pull/5260) | docs: restore configuration SDK alias | Docs | 2026-08-10 | 2026-08-10 | `3fee4b86092f7005afc613cf4c852e69bd03ee0a` | Diff check and EasyCLA authorization passed | Canonical merge verified | Yes | Merged 2026-08-10T16:51:24Z at `3fee4b86` |
| 33 | [virgiliojr94/book-to-skill](https://github.com/virgiliojr94/book-to-skill) | [#111](https://github.com/virgiliojr94/book-to-skill/issues/111) | [#112](https://github.com/virgiliojr94/book-to-skill/pull/112) | fix(extractor): detect whitespace-separated CJK ToC headers | Bug fix | 2026-08-05 | 2026-08-10 | `e7980f3fc97f8f44dcf61582065fd4c4f8816093` | 267 tests, 1 skipped, Ruff/compileall/diff passed; GitGuardian pending at submission | Canonical merge verified | Yes | Merged 2026-08-10T17:38:57Z at `e7980f3f` |
| 34 | [midhunkrishna/marginalia](https://github.com/midhunkrishna/marginalia) | [#7](https://github.com/midhunkrishna/marginalia/issues/7) | [#16](https://github.com/midhunkrishna/marginalia/pull/16) | docs: refresh current extension usage guidance | Docs | 2026-08-09 | 2026-08-10 | `7d716eae8409aa8e8e220555cf473ef7edfb61b3` | 931 tests, lint, format, diff passed; maintainer-requested follow-ups in `c270847` | midhunkrishna approved | Yes | Merged 2026-08-10T18:05:11Z at `7d716eae` |
| 35 | [atomize-lab/citeseal](https://github.com/atomize-lab/citeseal) | [#2](https://github.com/atomize-lab/citeseal/issues/2) | [#17](https://github.com/atomize-lab/citeseal/pull/17) | docs: add consolidated schema reference | Docs | 2026-08-09 | 2026-08-11 | `3826c0026e381dab204bdb12f5d8a79bdec4b96a` | 242 tests, lint, fixture validation 0 errors/0 warnings, schema/docs checks passed | atomize-lab approved | Yes | Merged 2026-08-11T03:43:45Z at `3826c002` |

## Verification query

### 2026-08-02 live baseline

- GitHub identity verified as `aryansk`.
- Window checked: 2025-08-02 through 2026-08-02.
- Query returned one merged PR: `aryansk/indiehouse#1`, which is excluded
  because the base repository is owned by Aryan.
- Qualifying external merged PRs: **0**.
- Re-run this query for every application and account for any other GitHub
  identities or author emails.

### 2026-08-03 live baseline

- The live authored-PR search returned one merged PR:
  `aryansk/indiehouse#1`.
- That base repository is owned by Aryan and remains excluded.
- Qualifying external merged-PR count remains **0**.

### 2026-08-05 live merge verification

- Canonical [PR #731](https://github.com/alibaba/open-code-review/pull/731) is
  `MERGED` at `3966d33ac7056f2a1319e5b4151dd0442b2a54d3` on 2026-08-05.
- The contributing commit `d98b9e2` is authored by `aryansk`, targets the
  externally owned `alibaba/open-code-review`, and changes only
  `.github/workflows/pages-ci.yml`.
- GitHub reports `test`, CodeQL, cross-compile, `code-review`, and
  `license/cla` successful; the CLA assistant says the agreement is signed.
- At that point the qualifying external merged-PR count was **1**. The
  additional verification below raises the current count to **2**; all
  remaining open/draft candidates, including book-to-skill #112, remain
  excluded until merged.

### 2026-08-05 live merge verification (additional result)

- Canonical [PR #3273](https://github.com/vinta/awesome-python/pull/3273) is
  `MERGED` on 2026-08-05 at `94159a8d53665a41a7894dff5a134e353c769df2`.
- The PR is authored by `aryansk`, targets the externally owned
  `vinta/awesome-python`, changes only `README.md`, and its hosted `test`
  check passed.
- Qualifying external merged-PR count is now **2** after excluding the owned
  `aryansk/indiehouse#1` result.

### 2026-08-05 implementation/publication blockers

- `ayghri/i-have-adhd#96` was implemented at commit
  `cbabfe6e68dc96cb9b8c5e980649ca6cd9817676` and pushed to
  `aryansk/i-have-adhd-96`. Nine focused tests, shell syntax, mirror
  consistency, and diff checks passed. GitHub rejected PR creation with an
  interaction restriction; no PR was created and the count remains unchanged.
- `pascalorg/editor#308` was implemented at commit
  `d16ca11c76a35540d066b07a933effdd51f7a087`. The full editor suite (596
  passed), editor typecheck, nodes build, Biome, and diff checks passed. The
  fork/PR could not be published because the CLI token is invalid and no
  signed-in browser session is available; no PR was created and the count
  remains unchanged.

## 2026-08-06 submission reconciliation

These are five submitted draft PRs, not merged records. Each row is tracked in
Notion as Draft with `Counted = false`; the Anthropic threshold only advances
when the canonical upstream repository merges the PR.

| Repository | Issue | Draft PR | Commit | Local validation | Counted |
| --- | --- | --- | --- | --- | --- |
| [fedify-dev/fedify](https://github.com/fedify-dev/fedify) | [#857](https://github.com/fedify-dev/fedify/issues/857) | [#983](https://github.com/fedify-dev/fedify/pull/983) | `10f7085` | Node regression, Deno format, Deno lint; repository-wide pinned bootstrap not completed | No |
| [teresaliu90/TARCS-Mem](https://github.com/teresaliu90/TARCS-Mem) | [#12](https://github.com/teresaliu90/TARCS-Mem/issues/12) | [#14](https://github.com/teresaliu90/TARCS-Mem/pull/14) | `92debb6` | 11-check smoke, strict TypeScript compilation, 2 Node tests | No |
| [UseVynix/vynix-mcp](https://github.com/UseVynix/vynix-mcp) | [#3](https://github.com/UseVynix/vynix-mcp/issues/3) | [#6](https://github.com/UseVynix/vynix-mcp/pull/6) | `f9ee2b6` | `npm run check`: lint, typecheck, build, 30 MCP smoke checks, 5 config examples | No |
| [mercadona/rele](https://github.com/mercadona/rele) | [#341](https://github.com/mercadona/rele/issues/341) | [#345](https://github.com/mercadona/rele/pull/345) | `3e7b34b` | 166 tests and Ruff | No |
| [pyuvm/pyuvm](https://github.com/pyuvm/pyuvm) | [#421](https://github.com/pyuvm/pyuvm/issues/421) | [#422](https://github.com/pyuvm/pyuvm/pull/422) | `68e4157` | 605 tests, 7 expected failures, and Ruff | No |

The daily Notion aggregate was recomputed from tracker rows after insertion:
2026-08-06 has **27 submitted PRs**. The merged count remains **2**.

Re-run a live GitHub search before an application. Adjust the GitHub identity or
date window if needed, and manually inspect each result because search results
alone do not establish that a base repository is outside the applicant's
ownership.

```sh
gh api 'search/issues?q=author%3Aaryansk%20is%3Apr%20is%3Amerged&per_page=100' \
  --jq '.total_count, (.items[] | [.html_url, .repository_url, .title, .closed_at] | @tsv)'
```

For each candidate, verify the canonical PR state, base repository owner, merge
commit, and merge date through GitHub before adding it to the table.

## 2026-08-07 submission reconciliation

These five submitted draft PRs are open records, not merged records. Each
Notion row is `Draft` with `Counted = false`; the qualifying merged total
remains **3**.

| Repository | Issue | Draft PR | Commit | Local validation | Counted |
| --- | --- | --- | --- | --- | --- |
| [pre-commit/pre-commit](https://github.com/pre-commit/pre-commit) | [#3410](https://github.com/pre-commit/pre-commit/issues/3410) | [#3740](https://github.com/pre-commit/pre-commit/pull/3740) (closed) | `e687bae` + repair `6a50ecb` | 6 focused Deno-language tests, autopep8, and flake8 pass; pre-commit.ci failed on the original draft and GitHub blocked reopening/replacement | No |
| [swiftlang/swift-syntax](https://github.com/swiftlang/swift-syntax) | [#3397](https://github.com/swiftlang/swift-syntax/issues/3397) | [#3398](https://github.com/swiftlang/swift-syntax/pull/3398) | `6dfdb3d` | Issue reproducer, strict Swift format lint, and diff checks pass | No |
| [jupyter/jupyter_core](https://github.com/jupyter/jupyter_core) | [#409](https://github.com/jupyter/jupyter_core/issues/409) | [#462](https://github.com/jupyter/jupyter_core/pull/462) | `aed312d` | 15 application tests and targeted Ruff checks; hosted pre-commit.ci passed | No |
| [python/importlib_metadata](https://github.com/python/importlib_metadata) | [#526](https://github.com/python/importlib_metadata/issues/526) | [#544](https://github.com/python/importlib_metadata/pull/544) | `7692202` | Python 3.14 API tests and strict Sphinx docs build pass | No |
| [jupyter/nbformat](https://github.com/jupyter/nbformat) | [#406](https://github.com/jupyter/nbformat/issues/406) | [#451](https://github.com/jupyter/nbformat/pull/451) | local `0c16fcc` + hosted bot `c4bc6ab` | Validator suite: 52 passed, 2 skipped; hosted docs/pre-commit.ci passed | No |

The Notion tracker was reconciled once after the complete five-PR batch. The
canonical tracker query returned exactly five rows for 2026-08-07, and the
`Unified Daily Activity` source row `PRs Submitted — 2026-08-07` was created
and refetched with `Count = 5`.

## 2026-08-07 next five submission reconciliation

These five replacement lanes were submitted as open draft PRs after live issue,
duplicate, ownership, and repository-policy preflight. Each Notion row is
`Draft` with `Counted = false`; the qualifying merged total remains **3** and
the daily submitted total is now **10**.

| Repository | Issue | Draft PR | Commit | Local validation | Counted |
| --- | --- | --- | --- | --- | --- |
| [rtk-ai/rtk](https://github.com/rtk-ai/rtk) | [#3459](https://github.com/rtk-ai/rtk/issues/3459) | [#3460](https://github.com/rtk-ai/rtk/pull/3460) | `d4417bf` | `cargo fmt --all --check`, clippy, full cargo test (2579 passed, 8 ignored), and focused regression pass | No |
| [tsouth89/toolport](https://github.com/tsouth89/toolport) | [#631](https://github.com/tsouth89/toolport/issues/631) | [#640](https://github.com/tsouth89/toolport/pull/640) | `5c3aff8` | Gateway-only no-default-feature regression test passes; default desktop build is blocked by the pre-existing duplicate `_EMBED_INFO_PLIST` symbol and unrelated formatter drift | No |
| [dheerajjha/mcp-migrate](https://github.com/dheerajjha/mcp-migrate) | [#149](https://github.com/dheerajjha/mcp-migrate/issues/149) | [#189](https://github.com/dheerajjha/mcp-migrate/pull/189) | `e4db981` | Full pytest suite passes 411 tests | No |
| [open-multi-agent/open-multi-agent](https://github.com/open-multi-agent/open-multi-agent) | [#467](https://github.com/open-multi-agent/open-multi-agent/issues/467) | [#470](https://github.com/open-multi-agent/open-multi-agent/pull/470) | `e0243bf` | Focused agent-hooks suite passes 21 tests and TypeScript lint passes | No |
| [Kc1t/alethe-agents](https://github.com/Kc1t/alethe-agents) | [#49](https://github.com/Kc1t/alethe-agents/issues/49) | [#53](https://github.com/Kc1t/alethe-agents/pull/53) | `9eb5785` | Lint, format check, 73 tests, and build pass; lint has existing warnings but no errors, and the formatter cleanup was mechanical per issue guidance | No |

The tracker was reconciled once after all five submissions. The canonical
Notion query returned exactly EXT-070 through EXT-074 with separate issue and
PR URLs, and `PRs Submitted — 2026-08-07` was updated from 5 to 10.

## 2026-08-07 merge reconciliation and next five submissions

ToolPort #640 and Alethe #53 were rechecked as canonical upstream merges and
added to the merged table above. Their externally owned base repositories and
merge commits were verified; the qualifying total is now **5**. The owned
`aryansk/indiehouse#1` merge remains excluded.

The next five issue-backed lanes were then completed and published as drafts.
They are submitted records, not merged records, and each remains uncounted:

| Repository | Issue | Draft PR | Commit | Local validation / hosted state | Counted |
| --- | --- | --- | --- | --- | --- |
| [prometheus/docs](https://github.com/prometheus/docs) | [#1795](https://github.com/prometheus/docs/issues/1795) | [#3056](https://github.com/prometheus/docs/pull/3056) | `5aebd512` | Lint and compilation/type checks pass; export stopped at 290/582 pages after temporary ENOSPC; Netlify pending | No |
| [terraform-aws-modules/terraform-aws-eks](https://github.com/terraform-aws-modules/terraform-aws-eks) | [#3733](https://github.com/terraform-aws-modules/terraform-aws-eks/issues/3733) | [#3740](https://github.com/terraform-aws-modules/terraform-aws-eks/pull/3740) | `a50d8fbf` | `git diff --check` passes; Terraform unavailable locally; corrected uppercase-subject title check passes | No |
| [spdx/spdx-license-diff](https://github.com/spdx/spdx-license-diff) | [#142](https://github.com/spdx/spdx-license-diff/issues/142) | [#179](https://github.com/spdx/spdx-license-diff/pull/179) | `f27c0fc5` | 4 focused Jest tests and changed-file ESLint pass; no hosted checks reported | No |
| [kubernetes-sigs/mcs-api](https://github.com/kubernetes-sigs/mcs-api) | [#21](https://github.com/kubernetes-sigs/mcs-api/issues/21) | [#164](https://github.com/kubernetes-sigs/mcs-api/pull/164) | `a473cb87` | Three YAML blocks parse and diff checks pass; EasyCLA reports Missing CLA Authorization | No |
| [kubernetes-sigs/network-policy-api](https://github.com/kubernetes-sigs/network-policy-api) | [#61](https://github.com/kubernetes-sigs/network-policy-api/issues/61) | [#399](https://github.com/kubernetes-sigs/network-policy-api/pull/399) | `471a2511` | Four YAML examples parse and MkDocs build passes; Go unavailable for API-doc generation; EasyCLA reports Missing CLA Authorization | No |

The Notion closeout was performed once after all five submissions: EXT-075
through EXT-079 were created as Draft/uncounted rows, and the daily source row
`PRs Submitted — 2026-08-07` was updated from 10 to **15**. Direct page fetches
confirmed the five rows and the count after the data-source query limit was
reached. No draft is included in the merged total.

## 2026-08-07 EXT-080 through EXT-084 submission reconciliation

These five issue-backed contributions were submitted as canonical open draft
PRs. The table records their state at batch submission time; later merges are
reconciled below and moved into the merged-PR table.

| Repository | Issue | Draft PR | Commit | Local validation / hosted state | Counted |
| --- | --- | --- | --- | --- | --- |
| [NVIDIA/NemoClaw](https://github.com/NVIDIA/NemoClaw) | [#8522](https://github.com/NVIDIA/NemoClaw/issues/8522) | [#8526](https://github.com/NVIDIA/NemoClaw/pull/8526) | `1e0c4ac` | Focused Vitest, nested build, CLI build, and CLI typecheck pass; selected upstream checks pending | No |
| [launchpad-26/rhizomorph](https://github.com/launchpad-26/rhizomorph) | [#276](https://github.com/launchpad-26/rhizomorph/issues/276) | [#279](https://github.com/launchpad-26/rhizomorph/pull/279) | `aabe550` | Focused 44 tests, typecheck, lint, and build pass; full Node 25 run has 44 existing localStorage failures; no upstream checks reported | No |
| [objectionary/lints](https://github.com/objectionary/lints) | [#1207](https://github.com/objectionary/lints/issues/1207) | [#1208](https://github.com/objectionary/lints/pull/1208) | `aacfce7` | New XSL passes xmllint; Java/Maven unavailable locally; upstream matrix pending | No |
| [moonbit-community/cmark.mbt](https://github.com/moonbit-community/cmark.mbt) | [#138](https://github.com/moonbit-community/cmark.mbt/issues/138) | [#139](https://github.com/moonbit-community/cmark.mbt/pull/139) | `12bfc40` | Regression assertion and diff checks pass; MoonBit unavailable locally; no upstream checks reported | No |
| [danhnm1203/scrollytelling](https://github.com/danhnm1203/scrollytelling) | [#64](https://github.com/danhnm1203/scrollytelling/issues/64) | [#71](https://github.com/danhnm1203/scrollytelling/pull/71) | `bbaebbe` | `npm test` passes 454/454 across 71 suites; no upstream checks reported | No |

Notion was updated once after all five submissions: EXT-080 through EXT-084
were created as Draft/uncounted rows, and `PRs Submitted — 2026-08-07` was
updated from 15 to **20**. The table above is historical; only canonical
upstream merges can raise the merged total.

## 2026-08-07 post-submission merge reconciliation

- `danhnm1203/scrollytelling#71` merged into `main` at
  `104fc6a4b84d67d9cc60f044c1e8e4daa06fe41b` on 2026-08-07. Notion EXT-084 is
  now `Merged`, `Counted = true`, with the merge date and commit recorded.
- `AndreaBozzo/dataprof#535` merged into `master` at
  `84e98ea9e8b58f307306b7983607ed4c0001891e` on 2026-08-07. Notion EXT-042 is
  now `Merged`, `Counted = true`, with the merge date and commit recorded.
- The submitted-per-day chart remains **20** for 2026-08-07 because merges do
  not create new submission rows. The qualifying external merged total is now
  **7**, excluding the owned `aryansk/indiehouse#1` merge.

## 2026-08-07 latest merge and comment reconciliation

- [pyuvm #422](https://github.com/pyuvm/pyuvm/pull/422) merged into `master` at
  `e6078886030bf66ccd58d19fca2a573125c52e54`.
- [mcp-migrate #189](https://github.com/dheerajjha/mcp-migrate/pull/189) merged
  into `main` at `1a2fa9d947211fdf6d696ca69d111c7f8b425c1d`.
- [open-multi-agent #470](https://github.com/open-multi-agent/open-multi-agent/pull/470)
  merged into `main` at `32d5e8cf518e54dfac24c4c86341c7ce3c37d97d`.
- All three base repositories are externally owned. Their Notion rows EXT-059,
  EXT-072, and EXT-073 are `Merged`/counted, and the qualifying external total
  is now **10**. The owned `aryansk/indiehouse#1` merge remains excluded.

## 2026-08-09 EXT-091 through EXT-095 submission reconciliation

These five issue-backed contributions were published as canonical upstream
draft PRs after final duplicate and issue-state checks. They are submitted
records, not merged records, and remain uncounted.

| Repository | Issue | Draft PR | Commit | Local validation / hosted state | Counted |
| --- | --- | --- | --- | --- | --- |
| [midhunkrishna/marginalia](https://github.com/midhunkrishna/marginalia) | [#7](https://github.com/midhunkrishna/marginalia/issues/7) | [#16](https://github.com/midhunkrishna/marginalia/pull/16) | `26080206083b2499e5918fcfb0debe392b698462` | `npm test` 931 passed across 82 files; lint, format, and diff checks pass; no hosted checks reported on the draft | No |
| [kouroshez/coding-os](https://github.com/kouroshez/coding-os) | [#40](https://github.com/kouroshez/coding-os/issues/40) | [#42](https://github.com/kouroshez/coding-os/pull/42) | `12b52bc01e3e3dfd3f1f6b733b2ac3b67ce7071d` | Entry-point smoke suite passes 27/27; stale bootstrap paths corrected; diff checks pass; no hosted checks reported on the draft | No |
| [cntryl/fitz](https://github.com/cntryl/fitz) | [#151](https://github.com/cntryl/fitz/issues/151) | [#176](https://github.com/cntryl/fitz/pull/176) | `93a140534995fddcb066d0f39e08819310162e50` | `cargo fmt --all -- --check`; locked workspace tests pass 1,424 unit, 93 integration, 7 doc; no hosted checks reported on the draft | No |
| [cntryl/fitz](https://github.com/cntryl/fitz) | [#150](https://github.com/cntryl/fitz/issues/150) | [#177](https://github.com/cntryl/fitz/pull/177) | `2d151ffb304d9f43500226f6aef14fbd1cda3368` | `cargo fmt --all -- --check`; locked workspace tests pass 1,424 unit, 93 integration, 7 doc; no hosted checks reported on the draft | No |
| [AnkitParekh007/contributorOps](https://github.com/AnkitParekh007/contributorOps) | [#5](https://github.com/AnkitParekh007/contributorOps/issues/5) | [#19](https://github.com/AnkitParekh007/contributorOps/pull/19) | `b0c5a866b4a14c1c309ec2cc37ce1b18ed1bc113` | Typecheck, build, diff checks, and site-quality checks pass 70/70; no hosted checks reported on the draft | No |

Notion rows EXT-091 through EXT-095 were created once after all five PRs were
verified. The grouped data-source query reports **10** submissions for
2026-08-09 and preserves **20** for 2026-08-07. The existing
`PRs Submitted Per Day` chart was reused; no draft was marked counted.

## 2026-08-09 EXT-096 through EXT-100 submission reconciliation

These five issue-backed contributions were implemented, validated, and
published as canonical upstream draft PRs. They remain submitted records, not
merged records, and are not eligible for the qualifying external merge count.

| Repository | Issue | Draft PR | Commit | Local validation / hosted state | Counted |
| --- | --- | --- | --- | --- | --- |
| [hibuka-labs/agent-base](https://github.com/hibuka-labs/agent-base) | [#1](https://github.com/hibuka-labs/agent-base/issues/1) | [#3](https://github.com/hibuka-labs/agent-base/pull/3) | `dcb4505e` | Session-store tests 5/5, `cargo fmt -- --check`, and diff checks pass; no hosted checks reported | No |
| [hibuka-labs/phi-agent](https://github.com/hibuka-labs/phi-agent) | [#14](https://github.com/hibuka-labs/phi-agent/issues/14) | [#15](https://github.com/hibuka-labs/phi-agent/pull/15) | `a9a02306` | `cargo fmt -- --check` and `cargo check --example custom_approval` pass; no hosted checks reported | No |
| [wemake-services/django-modern-rest](https://github.com/wemake-services/django-modern-rest) | [#1225](https://github.com/wemake-services/django-modern-rest/issues/1225) | [#1227](https://github.com/wemake-services/django-modern-rest/pull/1227) | `819dbc82` → live `87edfd3e` | Targeted integration tests 58/58 with documented extras and Ruff pass; maintainer sobolevn added two test-update commits and moved the PR out of draft; hosted matrix pending | No |
| [Avenx-JS/avenx-js](https://github.com/Avenx-JS/avenx-js) | [#888](https://github.com/Avenx-JS/avenx-js/issues/888) | [#892](https://github.com/Avenx-JS/avenx-js/pull/892) | `8fc4bcd7` | `npm test` 96/96, lint, and diff checks pass; no hosted checks reported | No |
| [santifer/career-ops](https://github.com/santifer/career-ops) | [#2477](https://github.com/santifer/career-ops/issues/2477) | [#2636](https://github.com/santifer/career-ops/pull/2636) | `c5c174c8` | Focused tests 22/22 and help output pass; hosted label/welcome/CodeRabbit checks passed and GitGuardian was pending | No |

Notion received exactly EXT-096 through EXT-100 after duplicate URL preflight.
Direct page fetches verified the five rows as Draft/uncounted with
`Last Checked = 2026-08-09`. The authoritative grouped query reports
**15** submissions for 2026-08-09 and **20** for 2026-08-07; the existing
`PRs Submitted Per Day` chart was reused.

## 2026-08-09 merge reconciliation for EXT-098 and EXT-099

The post-publication live sweep found two external PRs from the previous
packet had merged after their initial Notion reconciliation:

| Queue ID | Canonical PR | Merged at | Merge commit | Counted |
| --- | --- | --- | --- | --- |
| EXT-098 | [django-modern-rest #1227](https://github.com/wemake-services/django-modern-rest/pull/1227) | 2026-08-09 07:56:34 UTC | `6f4b8aa166038a5ffb61fa05f7406ad5cd6769ec` | Yes |
| EXT-099 | [avenx-js #892](https://github.com/Avenx-JS/avenx-js/pull/892) | 2026-08-09 08:24:11 UTC | `0e16044fd4643d26cb0a4471e1e90f40777ce18c` | Yes |

Both rows were updated in Notion to `Merged`/counted after direct GitHub
verification. The submitted aggregate is unchanged because these were
already submitted rows. The qualifying externally owned merged total is now
**16**; the owned `aryansk/indiehouse#1` merge remains excluded.

## 2026-08-09 EXT-101 through EXT-105 submission reconciliation

These five issue-backed contributions were implemented, locally validated,
and published as canonical upstream draft PRs. They are submitted records,
not merged records, and remain uncounted.

| Repository | Issue | Draft PR | Commit | Local validation / hosted state | Counted |
| --- | --- | --- | --- | --- | --- |
| [python/typeshed](https://github.com/python/typeshed) | [#16157](https://github.com/python/typeshed/issues/16157) | [#16170](https://github.com/python/typeshed/pull/16170) | `b4d72699547f1ab7a5f8c1c957368098a24c5c69` | Structure checks and asyncio targeted checks pass; ruff, black, flake8, pre-commit, mypy/pyright/ty/pyrefly checks pass; local stubtest has unrelated macOS runtime-export failures; hosted Typeshed checks are in progress | No |
| [JSONbored/loopover](https://github.com/JSONbored/loopover) | [#10306](https://github.com/JSONbored/loopover/issues/10306) | [#10349](https://github.com/JSONbored/loopover/pull/10349) | `7d563342da5eb7cb783d48d8188ae62d272487dc` | MCP build, targeted Vitest (11 existing plus new regression), Prettier, and MCP package test pass; hosted validate check passes; audit reports six existing transitive vulnerabilities | No |
| [atomize-lab/citeseal](https://github.com/atomize-lab/citeseal) | [#2](https://github.com/atomize-lab/citeseal/issues/2) | [#17](https://github.com/atomize-lab/citeseal/pull/17) | `c902e280199c67f68d9817b5d3ac7fe7dd9ee8f8` | Full test suite passes 242 tests and the repository lint command passes; no hosted checks reported on the draft | No |
| [maxoutlabs/cngx](https://github.com/maxoutlabs/cngx) | [#55](https://github.com/maxoutlabs/cngx/issues/55) | [#71](https://github.com/maxoutlabs/cngx/pull/71) | `93c1dc56284e9f011502cfb7e1d6d44d22ac198e` | Full suite passes 615 tests with one skip; Ruff and Black pass; no hosted checks reported on the draft | No |
| [shazow/virtle](https://github.com/shazow/virtle) | [#47](https://github.com/shazow/virtle/issues/47) | [#69](https://github.com/shazow/virtle/pull/69) | `89b665ff34f7a40a212d87fefecb592befccdd69` | Targeted Go help test and gofmt pass; full suite has three unrelated pre-existing macOS path/socket failures; no hosted checks reported on the draft | No |

Notion received exactly EXT-101 through EXT-105 after the five canonical
PRs were verified. Direct row fetches verified all five as Draft/uncounted
with `Last Checked = 2026-08-09`; the grouped submitted aggregate is **20**
for 2026-08-09. The existing `PRs Submitted Per Day` chart was reused.

## 2026-08-09 EXT-106 through EXT-110 submission reconciliation

These five issue-backed contributions were implemented, locally validated, and
published as canonical upstream draft PRs. They are submitted records, not
merged records, and remain uncounted.

| Repository | Issue | Draft PR | Commit | Local validation / hosted state | Counted |
| --- | --- | --- | --- | --- | --- |
| [jayqi/failed-build-issue-action](https://github.com/jayqi/failed-build-issue-action) | [#155](https://github.com/jayqi/failed-build-issue-action/issues/155) | [#157](https://github.com/jayqi/failed-build-issue-action/pull/157) | `af6cd2ec4055fc450e9bce928e0997c5b0c55d29` | Action metadata-derived input/default regression coverage; npm test 34/34 with 100% coverage, lint, and diff checks pass; npm required a Node 24 force override because the local runtime is Node 25 | No |
| [shauryagangrade/scout-issue](https://github.com/shauryagangrade/scout-issue) | [#8](https://github.com/shauryagangrade/scout-issue/issues/8) | [#14](https://github.com/shauryagangrade/scout-issue/pull/14) | `89d9cfcedfc2a156f3c1def44eefca9e13e0d295` | Removed the lychee CI escape hatch; merged 2026-08-09T10:01:43Z at `6d2e183d`; hosted validate/test-skill/lint passed; Notion EXT-107 is Merged/Counted | Yes |
| [roman-berlin/Zelqivo-Video-Program](https://github.com/roman-berlin/Zelqivo-Video-Program) | [#100](https://github.com/roman-berlin/Zelqivo-Video-Program/issues/100) | [#102](https://github.com/roman-berlin/Zelqivo-Video-Program/pull/102) | `64dc304500f6f69df2ff5eebf252a890419a4728` | README documents the current Windows, macOS, and Linux log paths; focused logging test passes 1/1 and diff checks pass; no hosted checks reported | No |
| [zzet/gortex](https://github.com/zzet/gortex) | [#518](https://github.com/zzet/gortex/issues/518) | [#520](https://github.com/zzet/gortex/pull/520) | `abab837cfe4918116584326ab1890a49ebb19c48` | Disposable cache/query-log isolation in `internal/mcp`; targeted MCP tests and full `internal/mcp` package tests pass, with gofmt and diff checks clean; no hosted checks reported | No |
| [AjnasNB/cockroach-browser](https://github.com/AjnasNB/cockroach-browser) | [#10](https://github.com/AjnasNB/cockroach-browser/issues/10) | [#40](https://github.com/AjnasNB/cockroach-browser/pull/40) | `565c85ed2550344722f6c16c79b5681540ee1745` | README and operator-install docs cover Fish completion; typecheck/build, package/site checks, audit, and pack pass; one unrelated ARM-specific local parity test fails under Node 25; no hosted checks reported | No |

Notion received exactly EXT-106 through EXT-110 after the five canonical PRs
were verified. Direct row fetches verified all five URLs and properties;
EXT-107 is now Merged/Counted and the other four remain Draft/uncounted, with
`Last Checked = 2026-08-09`. The grouped submitted aggregate is **25** for
2026-08-09. The separate `📈 Unified Daily Activity` chart source was then
synced with `PRs Submitted — 2026-08-08` = **0** and
`PRs Submitted — 2026-08-09` = **25**, both directly refetched and verified.
A live merged search now reports **18** authored merges in total, including
the owned `aryansk/indiehouse#1`; the qualifying external total is **17**.

The merged-activity chart was also backfilled from the live canonical GitHub
`merged_at` values. `📈 Unified Daily Activity` now has `PRs Merged` counts of
2 on 2026-08-05, 2 on 2026-08-06, 10 on 2026-08-07, 0 on 2026-08-08, and 3 on
2026-08-09, totaling the 17 qualifying external merges. The owned
`aryansk/indiehouse#1` merge remains excluded.

## 2026-08-09 EXT-107 merge reconciliation

The owner comment on [scout-issue #14](https://github.com/shauryagangrade/scout-issue/pull/14#issuecomment-5230917185)
requested a ready-for-review state and an optional star. Before any action was
needed, live GitHub state showed the PR had merged:

- `mergedAt`: `2026-08-09T10:01:43Z` UTC
- merge commit: `6d2e183d941ac48a69745bec843d8d0ca0e0a3f1`
- hosted `validate`, `test-skill`, and `lint`: successful
- Notion EXT-107 row: `PR Status = Merged`, `Counted = true`, exact `Merged`
  date and `Merge Commit` recorded
- owner acknowledgement: [issuecomment-5230961085](https://github.com/shauryagangrade/scout-issue/pull/14#issuecomment-5230961085)

The optional star was not added automatically because it does not affect PR
acceptance or contribution eligibility. The `2026-08-09` `PRs Merged` activity
row was updated to `Count = 3`.

## 2026-08-09 EXT-111 through EXT-115 submission and merge reconciliation

The five issue-backed contributions below were implemented, locally validated,
and published as canonical upstream PRs. StudyMap #130 and #131 and the three
GCode PRs merged during the closeout window; all five are now recorded as
counted canonical merges.

| Repository | Issue | Canonical PR | Head commit | Merge evidence / local validation | Counted |
| --- | --- | --- | --- | --- | --- |
| [shauryagangrade/GCode](https://github.com/shauryagangrade/GCode) | [#32](https://github.com/shauryagangrade/GCode/issues/32) | [#36](https://github.com/shauryagangrade/GCode/pull/36) | `768b5926ab1d9167b87efcad033c5191f6e9e950` | Merged 2026-08-10T07:17:42Z; Python 3.10/3.11/3.12 CI passed, 18 local tests, compileall, and diff checks passed | Yes |
| [shauryagangrade/GCode](https://github.com/shauryagangrade/GCode) | [#30](https://github.com/shauryagangrade/GCode/issues/30) | [#37](https://github.com/shauryagangrade/GCode/pull/37) | `4f2b9b93e2f8ecf3fd77773fb1d5d2deb3eb533a` | Merged 2026-08-10T07:13:55Z; Python 3.10/3.11/3.12 CI passed, 18 local tests, and diff check passed | Yes |
| [shauryagangrade/GCode](https://github.com/shauryagangrade/GCode) | [#28](https://github.com/shauryagangrade/GCode/issues/28) | [#38](https://github.com/shauryagangrade/GCode/pull/38) | `91ebb888c9162b31fc5bd3a581e2e265d40acc22` | Merged 2026-08-10T07:09:59Z; Python 3.10/3.11/3.12 CI passed, 16 local tests, and diff check passed | Yes |
| [StudentSuite/StudyMap](https://github.com/StudentSuite/StudyMap) | [#125](https://github.com/StudentSuite/StudyMap/issues/125) | [#130](https://github.com/StudentSuite/StudyMap/pull/130) | `6c20ee81235dc58983d7d918321c7c02bff0d295` | Merged 2026-08-09T11:03:39Z at `d726fe1db223b53c0ac5b402fc6744c816814c1d`; local ESLint, 38 tests, typecheck, build, and diff check passed | Yes |
| [StudentSuite/StudyMap](https://github.com/StudentSuite/StudyMap) | [#121](https://github.com/StudentSuite/StudyMap/issues/121) | [#131](https://github.com/StudentSuite/StudyMap/pull/131) | `c4b9cd2463e6f6a7be1d6d436060abf62520f789` | Merged 2026-08-09T11:03:42Z at `04bea59f92d6c8326ca8a4dd021f2b7c6e09c2a7`; 1440x900 media, 14-second GIF, relative links, and diff check passed | Yes |

Notion received exactly EXT-111 through EXT-115 after all five canonical PRs
were head-verified. Direct queries confirm EXT-114 and EXT-115 are
`Merged`/counted with their merge dates and commits; EXT-111 through EXT-113
are `Open`/uncounted. The submitted aggregate is **30** for 2026-08-09 and
the merged activity aggregate is **5** for that date.

The post-publication all-state audit enumerated 105 authored PRs: 73 open, 20
merged, and 12 closed. It found Vercel deployment messages plus two human
optional-star comments from `AnayDhawan`; both were acknowledged at
[PR #130](https://github.com/StudentSuite/StudyMap/pull/130#issuecomment-5231181660)
and [PR #131](https://github.com/StudentSuite/StudyMap/pull/131#issuecomment-5231181636).
No artificial star action was taken.

## 2026-08-09 EXT-116 through EXT-120 submission reconciliation

These five medium-to-easy issue-backed contributions were implemented in major
active repositories, head-verified on the user's forks, and opened as canonical
upstream PRs. They remain submission evidence only; none is merged or counted.

| Repository | Issue | Canonical PR | Head commit | Merge evidence / validation | Counted |
| --- | --- | --- | --- | --- | --- |
| [docker/docs](https://github.com/docker/docs) | [#13861](https://github.com/docker/docs/issues/13861) | [#25737](https://github.com/docker/docs/pull/25737) | `194e46beb84de71c710159468ac8dbdf63c04afd` | Open; hosted build, lint, Vale, tests, redirect, media, vendor, and Netlify preview checks pass; review required | No |
| [kubernetes-sigs/reference-docs](https://github.com/kubernetes-sigs/reference-docs) | [kubernetes/website #48717](https://github.com/kubernetes/website/issues/48717) | [#469](https://github.com/kubernetes-sigs/reference-docs/pull/469) | `646813eb1916cd51389e3f77ceaf6ef6f4799f42` | Open; `go test ./...`, generator build, generated `-v, --v int` output, and diff check pass; EasyCLA unsigned | No |
| [jupyter-server/jupyter_server](https://github.com/jupyter-server/jupyter_server) | [#250](https://github.com/jupyter-server/jupyter_server/issues/250) | [#1689](https://github.com/jupyter-server/jupyter_server/pull/1689) | `bed223ef219b7709813ceafe3bcaf57b7c15c618` | Open; maintainer template request handled; docs, links, lint, and several downstream checks pass, while label and broad unrelated matrix failures remain | No |
| [jupyter-server/jupyter-scheduler](https://github.com/jupyter-server/jupyter-scheduler) | [#499](https://github.com/jupyter-server/jupyter-scheduler/issues/499) | [#614](https://github.com/jupyter-server/jupyter-scheduler/pull/614) | `f89d076927ce9e9f50036d241092062cde82b9ac` | Open; build and isolated tests pass; label, missing `k8s_backend`, Read the Docs, and pre-commit failures remain | No |
| [jupyter/notebook](https://github.com/jupyter/notebook) | [#7149](https://github.com/jupyter/notebook/issues/7149) | [#8025](https://github.com/jupyter/notebook/pull/8025) | `904dd966db1a457692f69df2f2e02821ef330c9a` | Open; version-switcher config and manifest pushed; build/docs/tests and most platform checks pass, while `tests_check`, `check_links`, and `enforce-label` fail; Sphinx/Hatch unavailable locally | No |

Notion received exactly EXT-116 through EXT-120 after all five PRs were
verified. Direct readback confirms `PR Status = Open`, `Counted = false`, and
`Submitted = 2026-08-09` for every row. The submitted activity aggregate is
**35** for 2026-08-09; the merged activity aggregate remains **5**.

## 2026-08-10 EXT-121 through EXT-125 submission reconciliation

These five issue-backed contributions target large, active repositories and
were kept as drafts after exact base/head verification. They are submission
evidence only; none is merged or counted.

| Repository | Issue | Canonical PR | Head commit | Validation / hosted state | Queue | Counted |
| --- | --- | --- | --- | --- | --- | --- |
| [moby/moby](https://github.com/moby/moby) | [#53255](https://github.com/moby/moby/issues/53255) | [#53341](https://github.com/moby/moby/pull/53341) | `4aa8c15bb6c05ae115e062cca22857864ec7bb63` | Draft on `master`; removed the unnecessary `defer` requested by `thaJeztah`, gofmt and diff checks pass, and the reply is [discussion_r3747002551](https://github.com/moby/moby/pull/53341#discussion_r3747002551). Focused Go test remains blocked by unrelated missing macOS build symbols | EXT-121 | No |
| [pallets/flask](https://github.com/pallets/flask) | [#6065](https://github.com/pallets/flask/issues/6065) | [#6127](https://github.com/pallets/flask/pull/6127) | `d5227024e132d9b06a1e299755a8c0ee9f49b0a8` | Closed 2026-08-09T21:04:15Z by Pallets under its explicit LLM/AI contribution policy; two focused pytest tests and Ruff passed before closure | EXT-122 | No |
| [pandas-dev/pandas](https://github.com/pandas-dev/pandas) | [#66673](https://github.com/pandas-dev/pandas/issues/66673) | [#66683](https://github.com/pandas-dev/pandas/pull/66683) | `a50177d62fd7f7af343faf79041308b4c7230d24` | Draft on `main`; six focused regression tests passed against the built wheel, Ruff check/format passed, hosted matrix queued/in progress | EXT-123 | No |
| [jupyter/jupyter_client](https://github.com/jupyter/jupyter_client) | [#1131](https://github.com/jupyter/jupyter_client/issues/1131) | [#1136](https://github.com/jupyter/jupyter_client/pull/1136) | `05b67268a95bf4ebc58b07793365dd998242d235` | Draft on `main`; focused manager test passed and Ruff check/format passed, hosted docs/pre-commit checks pending | EXT-124 | No |
| [ipython/ipython](https://github.com/ipython/ipython) | [#15359](https://github.com/ipython/ipython/issues/15359) | [#15363](https://github.com/ipython/ipython/pull/15363) | `c1992452d15aae10b6efe905c672bdb6f197a8c8` | Draft on `main`; two focused tests passed, changed-file formatting passed, hosted formatting/tests queued/in progress; repository robot/eggplant policy followed | EXT-125 | No |

Notion received exactly EXT-121 through EXT-125 after all five canonical PRs
were head-verified. Direct page fetches confirm four rows remain `Draft` and
uncounted; EXT-122 is `Closed - not merged` and uncounted because Pallets'
policy blocked autonomous contributions. The `PRs Submitted — 2026-08-10`
activity row was previously 5; it is now 10 after the next complete packet.

## 2026-08-10 EXT-126 through EXT-130 submission reconciliation

These five issue-backed contributions target major, active repositories and
were kept as drafts after exact base/head verification. They are submission
evidence only; none is merged or counted.

| Repository | Issue | Canonical PR | Head commit | Validation / hosted state | Queue | Counted |
| --- | --- | --- | --- | --- | --- | --- |
| [jupyterlab/jupyterlab](https://github.com/jupyterlab/jupyterlab) | [#16192](https://github.com/jupyterlab/jupyterlab/issues/16192) | [#19255](https://github.com/jupyterlab/jupyterlab/pull/19255) | `50c3ea4d475a59fdb26122931d1271fd58eeb5ef` | Draft on `main`; focused filebrowser test added; pre-commit and Read the Docs pass; `enforce-label` fails because the PR lacks a required triage label and this account cannot add it | EXT-126 | No |
| [jupyterlab/jupyterlab](https://github.com/jupyterlab/jupyterlab) | [#18336](https://github.com/jupyterlab/jupyterlab/issues/18336) | [#19256](https://github.com/jupyterlab/jupyterlab/pull/19256) | `023c7e5d1edd37d5b5f537ac3b34ce2404831fb4` | Draft on `main`; plugin-editor layout refactor; pre-commit and Read the Docs pass; `enforce-label` fails for the same repository permission gate | EXT-127 | No |
| [rust-lang/rust-clippy](https://github.com/rust-lang/rust-clippy) | [#17494](https://github.com/rust-lang/rust-clippy/issues/17494) | [#17531](https://github.com/rust-lang/rust-clippy/pull/17531) | `7cfb11a1c303324cc13aa92ec18d02a8dbf54865` | Draft on `master`; match-arm expectation regression test added; all hosted checks passed after removing the stale unfulfilled expectation; local focused cargo test remains blocked by missing `rustc-dev` | EXT-128 | No |
| [remix-run/react-router](https://github.com/remix-run/react-router) | [#12821](https://github.com/remix-run/react-router/issues/12821) | [#15387](https://github.com/remix-run/react-router/pull/15387) | `fbb2a4d1432ccf07685d1b6c1a143004643ef30b` | Draft on `main`; promoted the hidden metadata stub into a findable SEO guide; diff check passed; no hosted checks reported | EXT-129 | No |
| [pypa/setuptools](https://github.com/pypa/setuptools) | [#5272](https://github.com/pypa/setuptools/issues/5272) | [#5295](https://github.com/pypa/setuptools/pull/5295) | `af77708011bd855b0763cb207958f171747c79fd` | Draft on `main`; compiler migration mappings and public API example added; diff and mapping checks passed; Read the Docs and Summary checks passed | EXT-130 | No |

Notion received exactly EXT-126 through EXT-130 after all five canonical PRs
were head-verified. Direct query readback confirms every row is `Draft`,
`Counted = false`, and dated 2026-08-10. The `PRs Submitted — 2026-08-10`
activity aggregate was updated from 5 to **10** and directly verified. The
`PRs Merged` aggregate remains 0 for 2026-08-10 because no new PR merged.

## 2026-08-09 human-feedback reconciliation after EXT-116 through EXT-120

- [gortex #520](https://github.com/zzet/gortex/pull/520) received a detailed
  maintainer request to sandbox the DataDir-backed global memory store. The
  existing `internal/testenv.SandboxProcess()` was adopted in `TestMain`, the
  ambient `GORTEX_QUERY_LOG` override was cleared, and the follow-up was pushed
  at `a9522775c1821e9cfb715a8e0ea0af02920049e8`. The full
  `go test ./internal/mcp/ -count=1` suite passed in 141.885 seconds. The reply
  is [issuecomment-5231875663](https://github.com/zzet/gortex/pull/520#issuecomment-5231875663).
- [virtle #69](https://github.com/shazow/virtle/pull/69) received a maintainer
  boundary against drive-by contributions. Because the contributor is not a
  virtle user, the reply at
  [issuecomment-5231878064](https://github.com/shazow/virtle/pull/69#issuecomment-5231878064)
  acknowledged that boundary and the unmerged PR was closed. It remains
  uncounted.
- NumPy #32230 was closed without a reply after its repository policy stated
  that autonomous agent-authored PRs are not permitted. GitHub CLI #14111 was
  closed because its issue lacked the required `help wanted` label. These were
  not counted as submissions in this packet.

## 2026-08-09 assigned GitHub issue implementation reconciliation

This pass is separate from the EXT-116 through EXT-120 five-PR batch. It
records the exact assigned-issue state without changing the merged total:

| Repository | Issue | Canonical PR | Head commit | State / validation | Counted |
| --- | --- | --- | --- | --- | --- |
| [atomize-lab/citeseal](https://github.com/atomize-lab/citeseal) | [#2](https://github.com/atomize-lab/citeseal/issues/2) | [#17](https://github.com/atomize-lab/citeseal/pull/17) | `c5a94f10f447f841cd90a2fc47d5b856427082cf` | Open ready; maintainer approved the requested example; 242 tests, lint, fixture validation, and schema/documentation checks pass; acknowledgement at [issuecomment-5241843635](https://github.com/atomize-lab/citeseal/pull/17#issuecomment-5241843635) | No |
| [AndreaBozzo/dataprof](https://github.com/AndreaBozzo/dataprof) | [#526](https://github.com/AndreaBozzo/dataprof/issues/526) | [#556](https://github.com/AndreaBozzo/dataprof/pull/556) | `1d4c6bbfb2e9730e3f9bfe3b33655edb16991423` | Merged 2026-08-10T09:35:00Z; 20 focused tests, 825 full Python tests, Ruff, `ty`, and all hosted checks passed; AndreaBozzo approved and merged | Yes |
| [NVIDIA/NemoClaw](https://github.com/NVIDIA/NemoClaw) | [#8522](https://github.com/NVIDIA/NemoClaw/issues/8522) | Maintainer [#8529](https://github.com/NVIDIA/NemoClaw/pull/8529) | `38d56ae9cb068ac0b36cc96f4e68bc362495c3f8` | Open maintainer-owned PR already covers the assigned defect; earlier user #8526 is closed/superseded; no duplicate created | No |

The assigned search returned three open issues, no open review requests, and
three authored PRs that are unrelated to this assignment queue. No PR from
this pass is merged or countable; the qualifying external total remains **19**.

## 2026-08-10 incremental merge reconciliation

LangGraph Agent Stack #124 (EXT-064) merged canonically at
`67ec21623b5716c27e7ee5529706848fae05c540` on 2026-08-10T13:11:36Z after the
requested Redis expiry documentation and `get()` docstring correction were
verified at head `fd4aa02b49869687d7cce5a7d485ae5f4fd95972`. The merge is now
reflected as `DONE` in `WORK_QUEUE.md`; GitHub remains authoritative for the
qualifying merged count.

## 2026-08-10 human-feedback reconciliation

- [Moby #53341](https://github.com/moby/moby/pull/53341) now points to
  `4aa8c15bb6c05ae115e062cca22857864ec7bb63` after the maintainer-requested
  removal of the unnecessary `defer`; the focused test remains blocked by
  unrelated macOS build symbols. The inline reply is
  [discussion_r3747002551](https://github.com/moby/moby/pull/53341#discussion_r3747002551).
- [dataprof #556](https://github.com/AndreaBozzo/dataprof/pull/556) was marked
  ready after all listed hosted checks passed, and the maintainer was answered
  at [issuecomment-5236480430](https://github.com/AndreaBozzo/dataprof/pull/556#issuecomment-5236480430).
- [langgraph-agent-stack #124](https://github.com/Brescou/langgraph-agent-stack/pull/124)
  was updated with the Redis expiry semantics and `get()` docstring requested
  by the maintainer, rebased onto upstream `main`, and pushed at final head
  `fd4aa02b49869687d7cce5a7d485ae5f4fd95972`. Nine focused tests, Ruff,
  format, and diff checks pass; the PR is ready and the reply is
  [issuecomment-5236504653](https://github.com/Brescou/langgraph-agent-stack/pull/124#issuecomment-5236504653).
- [Flask #6127](https://github.com/pallets/flask/pull/6127) remains closed under
  Pallets' policy. `davidism`'s policy-link comment was recorded; a truthful
  acknowledgement was attempted but GitHub returned `User is blocked
  (addComment)`, so no reply or reopen action was possible.

## 2026-08-10 EXT-131 through EXT-135 submission reconciliation

These five issue-backed contributions target Apache Beam and the OpenTelemetry
Specification. They were opened as canonical upstream drafts after exact
base/head and fork-commit verification. None is merged or countable.

| Repository | Issue | Canonical PR | Head commit | Validation / hosted state | Queue | Counted |
| --- | --- | --- | --- | --- | --- | --- |
| [apache/beam](https://github.com/apache/beam) | [#18734](https://github.com/apache/beam/issues/18734) | [#39688](https://github.com/apache/beam/pull/39688) | `46dcda5aa2efd99f7f77912a1921276d3b332101` | Draft on `master`; platform-independent absolute-path fix; `git diff --check` passes; local Gradle test is blocked because no Java runtime is installed; Beam Java/Dataflow/Spotless checks are in progress | EXT-131 | No |
| [apache/beam](https://github.com/apache/beam) | [#19226](https://github.com/apache/beam/issues/19226) | [#39689](https://github.com/apache/beam/pull/39689) | `47f41f04e9dcd798e2e0f831a9b9aad5c4130b7f` | Draft on `master`; Go SDK initialization docs and API comment; `git diff --check` passes; Beam Go and website checks are in progress | EXT-132 | No |
| [open-telemetry/opentelemetry-specification](https://github.com/open-telemetry/opentelemetry-specification) | [#4641](https://github.com/open-telemetry/opentelemetry-specification/issues/4641) | [#5259](https://github.com/open-telemetry/opentelemetry-specification/pull/5259) | `6e05a75d25b37e50ccc05633a8ffd49f70d0c675` | Draft on `main`; trace exception Event link; `git diff --check` and EasyCLA authorization pass | EXT-133 | No |
| [open-telemetry/opentelemetry-specification](https://github.com/open-telemetry/opentelemetry-specification) | [#4232](https://github.com/open-telemetry/opentelemetry-specification/issues/4232) | [#5260](https://github.com/open-telemetry/opentelemetry-specification/pull/5260) | `7cee0cb7e8ad0c9778b3c31c967d7b72f5c51409` | Draft on `main`; restored Configuration SDK Hugo alias; `git diff --check` and EasyCLA authorization pass | EXT-134 | No |
| [open-telemetry/opentelemetry-specification](https://github.com/open-telemetry/opentelemetry-specification) | [#4434](https://github.com/open-telemetry/opentelemetry-specification/issues/4434) | [#5261](https://github.com/open-telemetry/opentelemetry-specification/pull/5261) | `9546b4ff6bd2c8b56745a2d0f7b82da761342c08` | Draft on `main`; Logs SDK batching trigger details; `git diff --check`, `make markdownlint`, and EasyCLA authorization pass | EXT-135 | No |

Notion created and directly refetched exactly EXT-131 through EXT-135 as
Draft/uncounted with `Submitted = 2026-08-10`. The `PRs Submitted — 2026-08-10`
activity row was updated from 10 to **15** and directly refetched. The five
current packet PRs remain unmerged, while the separate EXT-106 merge
reconciliation makes the `PRs Merged — 2026-08-10` aggregate **1**. The
workspace Query Data Source quota prevented the URL-keyed duplicate SQL query; no duplicate row was
created based on the existing local/Notion queue handoff, and the limitation
is recorded as a dashboard verification caveat.

## 2026-08-10 EXT-106 merge reconciliation

The earlier `failed-build-issue-action` contribution merged after the current
five-PR packet was published:

| Repository | Issue | Canonical PR | Merge date | Merge commit | Validation / human evidence | Counted |
| --- | --- | --- | --- | --- | --- | --- |
| [jayqi/failed-build-issue-action](https://github.com/jayqi/failed-build-issue-action) | [#155](https://github.com/jayqi/failed-build-issue-action/issues/155) | [#157](https://github.com/jayqi/failed-build-issue-action/pull/157) | 2026-08-10 | `275f97540e9fec8dec0fe61bada563765f1a4dad` | 34 tests, 100% coverage, lint, Codecov, and diff checks passed; maintainer approved; follow-up reply at [issuecomment-5236186452](https://github.com/jayqi/failed-build-issue-action/pull/157#issuecomment-5236186452) | Yes |

Notion EXT-106 was updated in place to `Merged`/counted with the exact merge
date and commit, and the `PRs Merged — 2026-08-10` activity aggregate moved
from **0** to **1**. The live authored portfolio is now 128 total: 85 open,
25 merged including the excluded owned PR, and 18 closed; the qualifying
external merged total is **24**.

## 2026-08-10 EXT-136 through EXT-140 submission reconciliation

These five issue-backed contributions were published as canonical upstream
drafts after the live action-required, duplicate, repository-policy,
reproduction, and validation gates. None is merged or countable.

| Repository | Issue | Canonical PR | Head commit | Validation / hosted state | Queue | Counted |
| --- | --- | --- | --- | --- | --- | --- |
| [vercel-labs/skills](https://github.com/vercel-labs/skills) | [#1906](https://github.com/vercel-labs/skills/issues/1906) | [#1914](https://github.com/vercel-labs/skills/pull/1914) | `55ba16b2272312996f4e9b0ac08c752efd51aa7c` | Draft on `main`; existing-target conflict handling and non-TTY consent fix; 49 Vitest tests, TypeScript, and diff check pass; Vercel deployment authorization is required | EXT-136 | No |
| [python/mypy](https://github.com/python/mypy) | [#21825](https://github.com/python/mypy/issues/21825) | [#21831](https://github.com/python/mypy/pull/21831) | `55411e67fd19de3f33bf19f05868e8daeff0d470` | Draft on `master`; cached-property class-access type fix; focused 31 tests, 196-file self-check, pre-commit, and hosted checks pass | EXT-137 | No |
| [apple/swift-argument-parser](https://github.com/apple/swift-argument-parser) | [#938](https://github.com/apple/swift-argument-parser/issues/938) | [#941](https://github.com/apple/swift-argument-parser/pull/941) | `79a851c20bb5653cef53618839a34e8d42fc05c1` | Draft on `main`; plugin-managed output-directory rejection; plugin build, 10 filtered tests, integration probe, diff check, and hosted dependency check pass | EXT-138 | No |
| [pypa/setuptools](https://github.com/pypa/setuptools) | [#2532](https://github.com/pypa/setuptools/issues/2532) | [#5298](https://github.com/pypa/setuptools/pull/5298) | `6e3273dff919e1c218cd4ecdb0ec9f462c6bc48a` | Draft on `main`; editable source-install guide and news fragment; editable install, strict Sphinx build, sphinxlint, diff check, Summary, and Read the Docs pass | EXT-139 | No |
| [jupyter/nbconvert](https://github.com/jupyter/nbconvert) | [#2289](https://github.com/jupyter/nbconvert/issues/2289) | [#2300](https://github.com/jupyter/nbconvert/pull/2300) | `1fab6813f44f89017e7bcad27578571447b5b9c2` | Draft on `main`; Bleach-to-nh3 sanitizer replacement with tooling-compatible import path; Python 3.9 focused suite (23 passed), Ruff, strict mypy, format, diff check, and hosted pre-commit pass; remaining hosted tests pending and enforce-label needs a maintainer-controlled triage label | EXT-140 | No |

Notion created and directly refetched exactly EXT-136 through EXT-140 as
Draft/uncounted with exact URLs, final heads, evidence, and next actions. The
daily activity source still returns `object_not_found`, so the expected
`PRs Submitted — 2026-08-10` change from 15 to **20** is recorded as a
connector blocker rather than asserted as stored. GitHub's live authored
search is 133 total: 83 open, 31 merged including the owned PR, and 19 closed;
the qualifying external merged total is **30**.
