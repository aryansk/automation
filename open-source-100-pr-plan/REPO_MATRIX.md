# Repository matrix

## External repository portfolio

The 100-PR route does not require 100 repositories, but a broader portfolio
reduces dependence on one maintainer team and gives the contribution record more
credibility. These are candidate repositories, not permission to create
simultaneous or artificial PRs. Every issue must still pass the live duplicate,
ownership, scope, and reproduction checks.

| Tier | Repository | Local checkout | Contribution surface | Current next gate |
| --- | --- | --- | --- | --- |
| Active | [tuist/tuist](https://github.com/tuist/tuist) | Historical checkout moved to recoverable Trash | Swift CLI, project generation, dependency/platform compatibility, acceptance tests | Maintain draft [PR #12203](https://github.com/tuist/tuist/pull/12203) for [#11693](https://github.com/tuist/tuist/issues/11693) |
| Active | [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) | `/Users/aryansingh/Downloads/Projects/hyperframes-upstream` | Core, engine, producer, CLI, Studio, registry, docs | Re-triage one deterministic user-facing issue before selecting work |
| Active | [vercel-labs/skills](https://github.com/vercel-labs/skills) | Historical checkouts moved to recoverable Trash | Install/update flows, source parsing, lockfiles, agent detection, cross-platform tests | Maintain draft [PR #1850](https://github.com/vercel-labs/skills/pull/1850); #1849 was closed as superseded by upstream #1864 |
| Candidate | [vapor/vapor](https://github.com/vapor/vapor) | Not currently checked out | Swift server routing, middleware, async behavior, docs, tests | Find a small open issue with a reproducible test case |
| Candidate | [apple/swift-argument-parser](https://github.com/apple/swift-argument-parser) | Not currently checked out | Swift CLI parsing, help output, completion, platform tests | Recheck issue/PR state and select a focused parser edge case |
| Candidate | [apple/swift-nio](https://github.com/apple/swift-nio) | Not currently checked out | Event loops, networking, concurrency, platform compatibility | Prefer a regression test or documentation fix before deeper internals |
| Active | [realm/SwiftLint](https://github.com/realm/SwiftLint) | Historical checkouts moved to recoverable Trash | Rule diagnostics, autocorrection, configuration, fixture tests | Maintain draft [PR #6854](https://github.com/realm/SwiftLint/pull/6854) for [#6828](https://github.com/realm/SwiftLint/issues/6828) and [#6856](https://github.com/realm/SwiftLint/pull/6856) for [#6831](https://github.com/realm/SwiftLint/issues/6831) |
| Active | [swiftlang/swift-driver](https://github.com/swiftlang/swift-driver) | Historical checkout moved to recoverable Trash | Swift driver option parsing, help generation, diagnostics, and tests | Maintain draft [PR #2167](https://github.com/swiftlang/swift-driver/pull/2167) for [#1291](https://github.com/swiftlang/swift-driver/issues/1291) |
| Candidate | [pointfreeco/swift-composable-architecture](https://github.com/pointfreeco/swift-composable-architecture) | Not currently checked out | Reducer/state behavior, navigation, testing, documentation | Follow maintainer conventions and avoid speculative API redesigns |
| Candidate | [Alamofire/Alamofire](https://github.com/Alamofire/Alamofire) | Not currently checked out | Networking, concurrency, serializers, docs, tests | Select a reproducible compatibility or regression issue |
| Candidate | [swiftlang/swift-format](https://github.com/swiftlang/swift-format) | Historical checkout moved to recoverable Trash | Formatting edge cases, diagnostics, regression fixtures | Maintain draft [PR #1257](https://github.com/swiftlang/swift-format/pull/1257); PR #1258 was closed after maintainer feedback |
| Candidate | [swiftlang/swift-syntax](https://github.com/swiftlang/swift-syntax) | Not currently checked out | Syntax APIs, diagnostics, source compatibility, tests | Start with a test/documentation issue unless a maintainer requests API work |
| Blocked | [swift-server/swift-service-lifecycle](https://github.com/swift-server/swift-service-lifecycle) | `/Users/aryansingh/Downloads/Projects/Automation/swift-service-lifecycle-163` | Shutdown, signal handling, lifecycle state, async tests, cancellation wrappers | Issue [#163](https://github.com/swift-server/swift-service-lifecycle/issues/163) is implemented locally at commits `cfab3a6` and `893037f`, including the proposed `CancellableService` abstraction; focused and full tests pass, but maintainers requested waiting for user reports and publication is also gated by EXT-031. Existing draft [PR #250](https://github.com/swift-server/swift-service-lifecycle/pull/250) is a separate review lane |
| Waiting | [microsoft/AI-For-Beginners](https://github.com/microsoft/AI-For-Beginners) | `/Users/aryansingh/Downloads/Projects/Automation/ai-for-beginners-706` | AI tutorials, translated learning material, Markdown content quality | Issue [#706](https://github.com/microsoft/AI-For-Beginners/issues/706) is implemented at commit `07e0602`; draft [PR #729](https://github.com/microsoft/AI-For-Beginners/pull/729) targets `main` with matching fork hash and restores the Tamil README; 102 Tamil-script lines, zero Devanagari characters, and clean diff checks; MIT/public repository; not countable until merged |
| Waiting | [lyogavin/airllm](https://github.com/lyogavin/airllm) | `/Users/aryansingh/Downloads/Projects/Automation/airllm-330` | Python LLM inference, model loading, compression tradeoffs, and documentation | Issue [#330](https://github.com/lyogavin/airllm/issues/330) is implemented at commit `ee3a1f8`; draft [PR #334](https://github.com/lyogavin/airllm/pull/334) targets `main` with matching fork hash; README/API-doc claims now describe storage-versus-performance tradeoffs; Python compilation and diff checks pass; Apache-2.0/public repository; not countable until merged |
| Waiting | [grpc/grpc-go](https://github.com/grpc/grpc-go) | `/Users/aryansingh/Downloads/Projects/Automation/grpc-go-9235` | Go RPC transport, stats, observability, and HTTP/2 behavior | Issue [#9235](https://github.com/grpc/grpc-go/issues/9235) is implemented at commits `3ffedf3` and `df0c780`; draft [PR #9296](https://github.com/grpc/grpc-go/pull/9296) targets `master` with matching fork hash; client authority is sourced from maintainer-requested `callHdr.Host`, changed files are gofmt-clean, and focused tests pass through Go 1.26.5 via mise; EasyCLA reports missing CLA authorization; not countable until merged |
| Waiting | [apple/swift-distributed-tracing](https://github.com/apple/swift-distributed-tracing) | `/Users/aryansingh/Downloads/Projects/Automation/swift-distributed-tracing-232` | Swift tracing APIs, span lifecycle, context propagation, and instrumentation | Issue [#232](https://github.com/apple/swift-distributed-tracing/issues/232) is implemented at commit `603da5b`; draft [PR #235](https://github.com/apple/swift-distributed-tracing/pull/235) targets `main` with matching fork hash; `MultiplexTracer`/`MultiplexSpan` fan out lifecycle operations to every tracer, and all 58 package tests plus Swift format lint pass; Apache-2.0/public repository with explicit maintainer agreement; not countable until merged |
| Active | [apple/swift-nio](https://github.com/apple/swift-nio) | `/Users/aryansingh/Downloads/Projects/Automation/swift-nio-2434` | Event loops, networking, DNS resolution, concurrency, platform compatibility | Maintain draft [PR #3692](https://github.com/apple/swift-nio/pull/3692) for [#2434](https://github.com/apple/swift-nio/issues/2434) |
| Active | [alibaba/open-code-review](https://github.com/alibaba/open-code-review) | `/Users/aryansingh/Downloads/Projects/Automation/open-code-review-730` | Go CLI, Pages web UI, provider integrations, review automation, CI | [PR #731](https://github.com/alibaba/open-code-review/pull/731) for [#730](https://github.com/alibaba/open-code-review/issues/730) merged at `3966d33a`; keep the repository in the maintenance portfolio |
| Active | [virgiliojr94/book-to-skill](https://github.com/virgiliojr94/book-to-skill) | `/Users/aryansingh/Downloads/Projects/Automation/book-to-skill-111` | Python document extraction, multilingual structure detection, generated agent skills, parser fallbacks | Maintain draft [PR #112](https://github.com/virgiliojr94/book-to-skill/pull/112) for [#111](https://github.com/virgiliojr94/book-to-skill/issues/111); 267 tests passed, 1 skipped, Ruff/compileall/diff checks pass, no hosted checks yet |
| Waiting | [EbookFoundation/free-programming-books](https://github.com/EbookFoundation/free-programming-books) | `/Users/aryansingh/Downloads/Projects/Automation/free-programming-books-13336` | Curated free programming books and learning resources, Markdown lists, URL hygiene, and automated linting | Issue [#13336](https://github.com/EbookFoundation/free-programming-books/issues/13336) is implemented at commit `381bfe2`; draft [PR #13395](https://github.com/EbookFoundation/free-programming-books/pull/13395) targets `main`; the full list linter, diff checks, and hosted `Get changed files`, `build`, `lint`, and GitHub report checks pass; existing draft [PR #13390](https://github.com/EbookFoundation/free-programming-books/pull/13390) is tracked separately |
| Merged | [RailtownAI/railtracks](https://github.com/RailtownAI/railtracks) | `/Users/aryansingh/Downloads/Projects/Automation/railtracks-1342` | Python agent framework, CLI skill installers, Codex/Claude/Copilot/Cursor integration | Issue [#1342](https://github.com/RailtownAI/railtracks/issues/1342) was implemented at commit `5eb38a6`; [PR #1344](https://github.com/RailtownAI/railtracks/pull/1344) merged to `main` at `e1eb14ed834885a0c2300277237191141bc8f4c7`; focused CLI tests, Ruff, diff checks, and strict MkDocs build passed |
| Waiting | [apache/beam](https://github.com/apache/beam) | Temporary checkout moved to recoverable quarantine | Dataflow runner portability and Go SDK documentation | Issues [#18734](https://github.com/apache/beam/issues/18734) and [#19226](https://github.com/apache/beam/issues/19226); draft [PRs #39688](https://github.com/apache/beam/pull/39688) and [#39689](https://github.com/apache/beam/pull/39689) | Both drafts are open and uncounted; Beam hosted checks are in progress, and #39688's local Java test is blocked by the environment |
| Waiting | [open-telemetry/opentelemetry-specification](https://github.com/open-telemetry/opentelemetry-specification) | Temporary checkout moved to recoverable quarantine | Trace, configuration, and Logs SDK specification documentation | Issues [#4641](https://github.com/open-telemetry/opentelemetry-specification/issues/4641), [#4232](https://github.com/open-telemetry/opentelemetry-specification/issues/4232), and [#4434](https://github.com/open-telemetry/opentelemetry-specification/issues/4434); draft [PRs #5259](https://github.com/open-telemetry/opentelemetry-specification/pull/5259), [#5260](https://github.com/open-telemetry/opentelemetry-specification/pull/5260), and [#5261](https://github.com/open-telemetry/opentelemetry-specification/pull/5261) | All three drafts are open and uncounted; diff checks pass, #5261 passes markdownlint, and all three EasyCLA checks pass |
| Blocked | [refined-github/refined-github](https://github.com/refined-github/refined-github) | `/Users/aryansingh/Downloads/Projects/Automation/refined-github-9938` | GitHub browser extension, pull-request workflows, Enterprise Server compatibility, TypeScript/Svelte tooling | Issue [#9938](https://github.com/refined-github/refined-github/issues/9938) is implemented at commit `c2caea6`; draft [PR #9941](https://github.com/refined-github/refined-github/pull/9941) was closed by the maintainer as “AI SPAM”; reopen only with the requested human-tested screenshot/video and do not publish additional PRs until resolved |
| Waiting | [cmu-sei/Polar](https://github.com/cmu-sei/Polar) | `/Users/aryansingh/Downloads/Projects/Automation/polar-218` | Secure DevSecOps knowledge graph, OCI registry resolution, Rust agents, and security-focused tests | Issue [#218](https://github.com/cmu-sei/Polar/issues/218) is implemented at DCO-signed commit `e08287b`; draft [PR #243](https://github.com/cmu-sei/Polar/pull/243) targets `main` from `aryansk:codex/issue-218-remove-http-registry-candidates`; resolver tests, package check, changed-file rustfmt, and no-dependency strict Clippy pass; no hosted checks reported |
| Deferred | [TencentCloud/TencentDB-Agent-Memory](https://github.com/TencentCloud/TencentDB-Agent-Memory) | `/Users/aryansingh/Downloads/Projects/Automation/tencentdb-agent-memory-817` | Node/TypeScript agent memory services, Docker deployment, cross-platform host networking, and deployment tests | Issue [#817](https://github.com/TencentCloud/TencentDB-Agent-Memory/issues/817) is implemented locally at DCO-signed commit `89531bef`; Linux, macOS, and Windows Git Bash host-IP regression cases, Bash 3.2 syntax, and diff checks pass; open [PR #816](https://github.com/TencentCloud/TencentDB-Agent-Memory/pull/816) independently changes the same deployment scripts and covers the same host-IP behavior, so no duplicate fork/PR was created |
| Waiting | [esengine/DeepSeek-Reasonix](https://github.com/esengine/DeepSeek-Reasonix) | `/Users/aryansingh/Downloads/Projects/Automation/deepseek-reasonix-7660` | Go terminal UI, Markdown rendering, workspace links, browser integration, and cross-platform CLI behavior | Issue [#7660](https://github.com/esengine/DeepSeek-Reasonix/issues/7660) is implemented at DCO-signed commit `c698142848690b0cb1b6b81d81a5fd05f994240f` on `main-v2`; draft [PR #7692](https://github.com/esengine/DeepSeek-Reasonix/pull/7692) is authored by `aryansk`, targets `main-v2`, and has a matching fork hash; OSC 8 link tests, full `internal/cli`, `go vet ./internal/cli`, repository-wide Go tests, gofmt, and diff checks pass; root `LICENSE` is MIT; hosted checks are pending and the PR is not countable until merged |
| Deferred | [block/buzz](https://github.com/block/buzz) | `/Users/aryansingh/Downloads/Projects/Automation/buzz-4864` | Rust relay, Nostr event lifecycle, workflow persistence, CLI, desktop/mobile clients | Issue [#4864](https://github.com/block/buzz/issues/4864) is implemented at DCO-signed commits `83969f1` and `368aab1`, with wire-level deletion/resurrection coverage; external [PR #4882](https://github.com/block/buzz/pull/4882) overlaps the same fix; do not duplicate, re-triage if it closes without resolving the issue |
| Waiting | [different-ai/openwork](https://github.com/different-ai/openwork) | `/Users/aryansingh/Downloads/Projects/Automation/openwork-3555` | OpenCode sidecar lifecycle, desktop packaging, model picker, server/app integration | Issue [#3555](https://github.com/different-ai/openwork/issues/3555) is implemented at DCO-signed commit `9d67c94`; draft [PR #3572](https://github.com/different-ai/openwork/pull/3572) targets `dev` with matching remote hash; local sidecar validation passes, while Vercel preview checks require upstream authorization |
| Deferred | [rtk-ai/rtk](https://github.com/rtk-ai/rtk) | `/Users/aryansingh/Downloads/Projects/Automation/rtk-3448` | Rust CLI token compression, GitHub CLI passthrough behavior, generated agent instructions, documentation, and tests | Issue [#3448](https://github.com/rtk-ai/rtk/issues/3448) is implemented at DCO-signed commit `0316260`; external [PR #3450](https://github.com/rtk-ai/rtk/pull/3450) overlaps the same two-file docs fix; do not duplicate, re-triage if it closes without resolving the issue |
| Blocked | [1jehuang/jcode](https://github.com/1jehuang/jcode) | `/Users/aryansingh/Downloads/Projects/Automation/jcode-795` | Rust provider routing, auth status, model catalogs, runtime transport identity | Issue [#795](https://github.com/1jehuang/jcode/issues/795) is implemented on pushed commit `67d35889a38bab8a4a04ae62c88d81fd02162e02`; GitHub rejects external PR creation, so do not count or duplicate until the permission path changes |
| Blocked | [ayghri/i-have-adhd](https://github.com/ayghri/i-have-adhd) | `/Users/aryansingh/Downloads/Projects/Automation/i-have-adhd-96` | Agent skill rules, mirrored platform docs, installer consistency | Issue [#96](https://github.com/ayghri/i-have-adhd/issues/96) is implemented at pushed commit `cbabfe6e68dc96cb9b8c5e980649ca6cd9817676`; GitHub restricts PR creation to prior contributors, so no PR/count exists |
| Waiting | [Boeing/config-file-validator](https://github.com/Boeing/config-file-validator) | `/Users/aryansingh/Downloads/Projects/Automation/config-file-validator-634` | Go config validation, TOML/YAML formatting, CLI, and regression tests | Issue [#631](https://github.com/Boeing/config-file-validator/issues/631) is implemented at commit `5dc532fc5c1dd589c2b9876b809b76fb5fa76ffe`; draft [PR #643](https://github.com/Boeing/config-file-validator/pull/643) targets `feat/3.0`; focused/full tests, vet, gofmt, and diff checks pass; no hosted checks reported |
| Waiting | [pascalorg/editor](https://github.com/pascalorg/editor) | `/Users/aryansingh/Downloads/Projects/Automation/pascalorg-editor-308` | TypeScript editor, 2D/3D wall drafting, measurement input, tests | Issue [#308](https://github.com/pascalorg/editor/issues/308) is implemented at commit `d16ca11c76a35540d066b07a933effdd51f7a087`; draft [PR #602](https://github.com/pascalorg/editor/pull/602) targets `main` with matching remote hash; 596 tests and build/typecheck validation pass; no hosted checks reported yet |

On 2026-08-02, the candidate repositories above were verified through GitHub
as public repositories with external owners and current default branches. That
does not verify any particular issue; issue and PR state must be checked again
immediately before coding.

On 2026-08-03, `swiftlang/swift-driver` was added after issue #1291 passed the
live duplicate, ownership, scope, and reproduction gates.

## High-star README portfolio

The live top-10 README discovery and its repository-specific gates are recorded
in [TOP10-README-PORTFOLIO-2026-08-02.md](TOP10-README-PORTFOLIO-2026-08-02.md).
The completed README publication lane is `vinta/awesome-python#3273`, which
merged on 2026-08-05. The current README/list review lanes are
`EbookFoundation/free-programming-books#13390` and
`EbookFoundation/free-programming-books#13395`; the other repositories remain
triage candidates until licensing, maintainer direction, and duplicate-PR
checks pass.

These repositories are not owned by Aryan. A PR to their canonical base may
count after it is merged, subject to the program's current interpretation.

## Contribution-focused high-impact portfolio

The separate high-impact portfolio is recorded in
[HIGH-IMPACT-PORTFOLIO-2026-08-03.md](HIGH-IMPACT-PORTFOLIO-2026-08-03.md).
It covers Kubernetes, CPython, Rust, Node.js, React, VS Code, PyTorch, Moby,
Ansible, and Grafana. Ansible #64016 is the first selected lane; its draft
[PR #87345](https://github.com/ansible/ansible/pull/87345) is open and not yet
countable. PostgreSQL and Git remain high-impact projects but are excluded from
the normal GitHub-PR lane because their official repositories use native patch
workflows.

## Recent merged external evidence

| Status | Repository | Issue / PR | Evidence |
| --- | --- | --- | --- |
| Merged | [jayqi/failed-build-issue-action](https://github.com/jayqi/failed-build-issue-action) | [#155](https://github.com/jayqi/failed-build-issue-action/issues/155) / [#157](https://github.com/jayqi/failed-build-issue-action/pull/157) | Merged 2026-08-10 at `275f97540e9fec8dec0fe61bada563765f1a4dad`; 34 tests, 100% coverage, lint, Codecov, and maintainer approval; Notion EXT-106 reconciled |

## Owned repositories for the separate maintainer track

| Repository | Proposed feature program | Evidence to build |
| --- | --- | --- |
| [StoryTime](https://github.com/aryansk/StoryTime) | Extract a reusable `StoryGraphKit` model/validator; add versioned schema, examples, CI, releases, and contributor docs | Package downloads, dependents, issues, external PRs, releases |
| [Automation](https://github.com/aryansk/automation) | Extract a clean daily-news HyperFrames starter with provenance, deterministic validation, provider interfaces, and credential-free examples | Users, forks, downloads, releases, external contributors |
| [SolarPunk City](https://github.com/aryansk/city-builder) | Mobile export, real-device performance, balance, save migrations, validated content packs | Public builds, issue activity, releases, external contributors |
| [HousePlants.ai](https://github.com/aryansk/HousePlants.ai) | CloudKit/SwiftData sync, HealthKit/HomeKit, AR completion, and a reusable plant-care package | Package adoption, releases, user feedback |
| [HousePlants Android](https://github.com/aryansk/houseplants-android) | Platform parity, notifications, watering history, UI tests, Health Connect, and release hygiene | Builds, releases, users, issues |
| [HousePlants web](https://github.com/aryansk/houseplants-ai-website) | PWA/offline support, shared catalog pipeline, accessibility, SEO, and test coverage | Usage, deploys, contributors |

Work in these repositories can strengthen the OpenAI maintainer case but does
not count toward the external 100-PR number.

## Maintenance or hold repositories

- `Indiehouse`: maintain storefront, catalog, accessibility, and deployment
  reliability; not an external-PR source.
- `Deal No Mercy`: keep the original-mechanics/IP boundary ahead of public
  release; do not use it as an OSS evidence vehicle yet.
- `Games`: improve provenance and deterministic release tooling; unverified
  assets remain a release blocker.
- `Research` and `Books`: keep focused on reproducibility and publication,
  not contribution volume.
- `Brand Deals`, `ilisha pr`, and `work`: private document/business work,
  not active OSS tracks.
- Makoro-related excluded repositories: do not access or modify them.
