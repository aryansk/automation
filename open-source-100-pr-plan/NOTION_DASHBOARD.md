# Notion PR dashboard synchronization

This is the required closeout process for a completed five-PR packet. The
per-PR records live in the Notion **Open Source PR Tracker** data source. The
visible daily chart reads the separate **📈 Unified Daily Activity** data
source, which receives source-backed `PRs Submitted` and `PRs Merged` summary
rows.

## Usage-efficient sync policy

Keep interim state in the local Markdown trackers and synchronize Notion once
after every five newly submitted PRs. Reconcile the complete batch before
updating the submitted aggregate. Sync earlier only for a canonical merge, a
material maintainer-request change, a closure/supersession, or an ending
session with important unsynced state. GitHub is authoritative; after a Notion
write, re-query only the affected rows and aggregates instead of rereading the
full database.

## Canonical dashboard identifiers

- Data source: `655f44cc-b295-4aea-8cff-3548ef7aa58b`
- Data source URL: `collection://655f44cc-b295-4aea-8cff-3548ef7aa58b`
- Submitted chart view: `view://3b6f61c8-16ca-81e2-9638-000c28737036`
- Submitted chart definition: filter rows with a Submitted date, group by
  Submitted day, and count PR rows.
- Daily activity data source: `collection://ca338652-b3ce-4771-bf90-8f6151f0a842`
- Legacy activity chart view: `view://3b4f61c8-16ca-8110-8bed-000c3a5d2e9c`
- Corrected all-metrics chart view: `view://3b7f61c8-16ca-81bc-afbb-000cbfeb151e`
- Unified activity chart definition: group by `Date`, sum `Count`, and split
  by `Metric` for `PRs Submitted`, `PRs Merged`, `Jobs Applied`, and
  `Emails Sent`.
- The tracker already has a real `Merged` date property and `Merge Commit`
  text property. The activity data source supports the `PRs Merged` metric.

The old `Legacy Daily Activity — 3 Metrics` tab has a separate saved UI filter
that excludes `PRs Merged`; it is not the canonical chart. Use the corrected
`Unified Daily Activity — All Metrics (Fixed)` tab, which reads the same source
and includes all four metric values.

## What triggers a sync

A successful submission exists only after all of these are verified from
GitHub:

1. `gh pr create` returned a canonical upstream PR URL.
2. `gh pr view` confirms the PR is `OPEN`, authored by `aryansk`, and points to
   the intended upstream base and fork head.
3. The fork branch hash matches the reviewed local commit.

A local commit, pushed fork branch, failed PR creation, or blocked interaction
does not trigger a submitted-PR row.

## Required batch closeout sync

After all PRs in the current packet are verified and before reporting the batch
as complete, perform these steps once:

1. Query the data source by each canonical `PR URL` and deduplicate. Never make
   a second row for an existing PR URL.
2. Create or update exactly one row per submitted PR with:
   - `PR`: `#number — canonical title`
   - `Repository`, `PR URL`, and `Issue URL`
   - `PR Status`: `Draft` or `Open` as returned by GitHub
   - `Queue ID`: the next reserved queue ID
   - `Submitted`: the current Asia/Kolkata calendar date
   - `Last Checked`: the same verification date
   - `Counted`: `false`
   - `CI Status`, `Track`, and `Priority` (the current data source has no separate `Review Decision` property; review state stays in `Evidence`/`Next Action`)
   - `Evidence`: PR URL, issue URL, commit hash, and checks actually run
   - `Next Action`: monitor upstream review; do not count until merged
3. Recompute the daily aggregate once with a data-source query grouped by
   `date:Submitted:start`.
4. Verify the chart view includes every new row and the aggregate changed by
   the number of newly submitted canonical PRs.
5. Update `STATUS.md`, `WORK_QUEUE.md`, and append `WORK_LOG.md` with every
   exact PR URL, queue ID, status, and the final aggregate.

## Counting and failure rules

- Dashboard submission count and Anthropic's qualifying count are different.
  Draft/open rows appear on the chart but remain `Counted = false`.
- Only a canonical upstream `MERGED` PR can be marked counted, after verifying
  its merge commit and merge date.
- If a PR is closed, superseded, blocked, or never created, do not add a
  submitted row. Keep local evidence in the queue/log instead.
- If batch-closeout Notion synchronization fails, mark the dashboard sync as
  `BLOCKED` in `STATUS.md` and `WORK_LOG.md`; do not claim dashboard completion
  until all rows, the aggregate, and the chart are verified.

## Merge reconciliation sync

The all-authored-PR-state audit also checks for state changes after submission.
When an existing PR URL is canonically `MERGED`:

1. Refetch the PR and record GitHub's exact `merged_at` timestamp in UTC,
   merge-date calendar value, merge commit, base branch, and external
   ownership.
2. Update the existing Open Source PR Tracker row in place with
   `PR Status = Merged`, `date:Merged:start` set to the verified merge date,
   `Merge Commit`, `Counted = true`, refreshed `Last Checked`, and the exact
   merge evidence. Never create a second PR row.
3. In **📈 Unified Daily Activity**, create or update exactly one daily row
   for that merge date with `Metric = PRs Merged`, `Count` equal to the number
   of qualifying external merges that day, `Source = Open Source PR Tracker`,
   and a scope stating that the count comes from canonical GitHub merges. If
   multiple PRs merge on one day, update the existing summary count rather
   than creating duplicate metric/date rows.
4. Directly refetch both the tracker row and activity row. A merge date in the
   tracker alone does not feed the chart automatically; the activity summary
   row is the required chart sync.
5. Update `PR_TRACKER.md`, `STATUS.md`, `WORK_QUEUE.md`, and `WORK_LOG.md` with
   the same canonical merge evidence. Historical `PRs Merged` rows may be
   backfilled only during an explicit reconciliation; the current historical
   backfill is recorded below.

### Standing future-merge rule

Starting with the next merge reconciliation, every verified canonical merge
must update both Notion layers in the same closeout: the per-PR `Merged` date
and merge commit, plus the daily `PRs Merged` summary row. The date is taken
from GitHub's `merged_at` value, not from the date the agent happens to check
the PR. Open, draft, closed-unmerged, and owned-repository PRs never create a
`PRs Merged` activity count.

### Chart repair — 2026-08-10

- The activity source rows were present and direct fetches showed the
  canonical merge aggregates: Aug 5 = 2, Aug 6 = 2, Aug 7 = 10, Aug 8 = 0,
  Aug 9 = 8, for **22** qualifying external merges.
- The visible zero line came from the legacy chart tab's saved three-metric
  filter, not from missing merge rows. A new all-metrics chart view was created
  with `Date IS NOT EMPTY`, all four metric options, daily grouping, and
  `SUM(Count)` by `Metric`.
- Do not delete or duplicate activity rows to fix this symptom. If the old tab
  is open, switch to `Unified Daily Activity — All Metrics (Fixed)`.

### Latest verified reconciliation — 2026-08-07

- Updated EXT-059 (`pyuvm/pyuvm#422`), EXT-072 (`dheerajjha/mcp-migrate#189`),
  and EXT-073 (`open-multi-agent/open-multi-agent#470`) in place to
  `PR Status = Merged`, `Counted = true`, with their canonical merge commits
  and merge dates.
- Direct refetch verified all three rows. The data-source count reports 10
  counted merged rows, and the submitted-day query reports **20** for
  `2026-08-07`; merges do not add new submitted rows.

### Latest verified reconciliation — 2026-08-09

- Updated existing rows EXT-050 (`orval-labs/orval#3820`), EXT-044
  (`saajann/openuni#63`), EXT-032 (`cmu-sei/Polar#243`), and EXT-029
  (`EbookFoundation/free-programming-books#13395`) in place to `Merged`,
  `Counted = true`, with their canonical merge dates and commits.
- Created exactly five new Draft/uncounted rows: EXT-085 for Swift System
  #376, EXT-087 for Vapor #3503, EXT-088 for Service Lifecycle #253, EXT-089
  for Swift Driver #2168, and replacement EXT-090 for Swift System #377.
- The grouped data-source query reports **5** submitted PRs for `2026-08-09`
  and preserves **20** for `2026-08-07`. No draft is included in the merged
  count.
- A final URL-keyed refetch returned all nine affected rows with the correct
  queue IDs, Draft/Merged states, Counted flags, and merge commits; no duplicate
  PR URL rows were created.
- Created the `PRs Submitted Per Day` line-chart view
  (`view://3b6f61c8-16ca-81e2-9638-000c28737036`) grouped by the `Submitted`
  date at day grain and verified its configuration through a fresh database
  fetch. The view-query connector did not return row data, so the aggregate
  above is the authoritative numeric verification.

## Handoff requirement

Every final report for a submitted PR must state:

- the canonical PR URL and GitHub state;
- the Notion queue ID and row state;
- the recomputed submitted-day aggregate; and
- whether the PR is eligible for the merged count (normally **no** at
  submission time).

Every final report for a newly reconciled merge must also state the verified
GitHub merge timestamp/date, merge commit, tracker row state, and the
`PRs Merged` activity date/count update.

## 2026-08-09 five-PR dashboard closeout

After all five PRs were verified, the Notion data source received exactly one
batch of new rows:

| Queue ID | Canonical PR | Notion state | Counted | Local evidence |
| --- | --- | --- | --- | --- |
| EXT-091 | [marginalia #16](https://github.com/midhunkrishna/marginalia/pull/16) | Draft / Local only | No | `2608020`; 931 tests, lint, format, diff |
| EXT-092 | [coding-os #42](https://github.com/kouroshez/coding-os/pull/42) | Draft / Local only | No | `12b52bc`; smoke suite 27/27, diff |
| EXT-093 | [fitz #176](https://github.com/cntryl/fitz/pull/176) | Draft / Local only | No | `93a1405`; 1,424 + 93 + 7 Rust tests, format |
| EXT-094 | [fitz #177](https://github.com/cntryl/fitz/pull/177) | Draft / Local only | No | `2d151ff`; 1,424 + 93 + 7 Rust tests, format |
| EXT-095 | [contributorOps #19](https://github.com/AnkitParekh007/contributorOps/pull/19) | Draft / Local only | No | `b0c5a86`; typecheck, build, site quality 70/70 |

The URL-keyed refetch confirmed all five rows, including `Last Checked =
2026-08-09`. The authoritative grouped query reports **10** submissions for
2026-08-09 and **20** for 2026-08-07. The existing `PRs Submitted Per Day`
line chart remains the dashboard view; no draft is eligible for the merged
count.

## 2026-08-09 EXT-096 through EXT-100 dashboard closeout

After all five canonical PRs were verified, Notion received exactly one batch
of five new uncounted rows. Four remain Draft; EXT-098 later moved to Open
after maintainer-authored commits:

| Queue ID | Canonical PR | Notion state | Counted | Local evidence |
| --- | --- | --- | --- | --- |
| EXT-096 | [agent-base #3](https://github.com/hibuka-labs/agent-base/pull/3) | Draft / Local only | No | `dcb4505e`; session-store tests 5/5, fmt, diff |
| EXT-097 | [phi-agent #15](https://github.com/hibuka-labs/phi-agent/pull/15) | Draft / Local only | No | `a9a02306`; fmt, custom example compile |
| EXT-098 | [django-modern-rest #1227](https://github.com/wemake-services/django-modern-rest/pull/1227) | Open / In progress | No | `819dbc82` → live `87edfd3e`; 58 integration tests, Ruff; maintainer test updates and hosted checks pending |
| EXT-099 | [avenx-js #892](https://github.com/Avenx-JS/avenx-js/pull/892) | Draft / Local only | No | `8fc4bcd7`; 96 tests, lint, diff |
| EXT-100 | [career-ops #2636](https://github.com/santifer/career-ops/pull/2636) | Draft / In progress | No | `c5c174c8`; 22 focused tests; hosted checks in progress |

The grouped data-source query reports **15** submissions for 2026-08-09 and
**20** for 2026-08-07. The existing `PRs Submitted Per Day` chart remains in
use and needs no configuration change. The URL-keyed SQL refetch hit Notion's
workspace query quota; direct page fetches verified all five new page IDs,
properties, PR URLs, Draft states, Counted flags, and dates.

## 2026-08-09 EXT-101 through EXT-105 dashboard closeout

After all five canonical PRs were verified, Notion received exactly one batch
of five new uncounted rows:

| Queue ID | Canonical PR | Notion state | Counted | Local evidence |
| --- | --- | --- | --- | --- |
| EXT-101 | [typeshed #16170](https://github.com/python/typeshed/pull/16170) | Draft / In progress | No | `b4d7269`; structure, format, lint, type checks; local stubtest has unrelated macOS failures |
| EXT-102 | [loopover #10349](https://github.com/JSONbored/loopover/pull/10349) | Draft / Passed | No | `7d56334`; build, targeted tests, formatting, package test, hosted validate |
| EXT-103 | [citeseal #17](https://github.com/atomize-lab/citeseal/pull/17) | Open ready / Approved | No | `c5a94f1`; 242 tests, lint, fixture validation 0 errors/0 warnings, schema/docs checks; acknowledgement `issuecomment-5241843635` |
| EXT-104 | [cngx #71](https://github.com/maxoutlabs/cngx/pull/71) | Draft / Local only | No | `93c1dc5`; 615 tests with one skip, Ruff, Black |
| EXT-105 | [virtle #69](https://github.com/shazow/virtle/pull/69) | Draft / Local only | No | `89b665f`; targeted help test and gofmt |

Direct row fetches verified all five queue IDs, URLs, `Draft` states,
`Counted = __NO__`, and `Last Checked = 2026-08-09`. The authoritative grouped
data-source query reports **20** submitted rows for 2026-08-09. The existing
`PRs Submitted Per Day` chart was reused; the view-mode query returned
`Results not available`, so the grouped aggregate and direct page fetches are
the source of truth. The same live reconciliation updated EXT-098 and EXT-099
to `Merged`/counted without changing the submitted-day total.

## 2026-08-09 EXT-106 through EXT-110 dashboard closeout

After all five canonical PRs were verified, Notion received exactly one batch
of five new uncounted rows:

| Queue ID | Canonical PR | Notion state | Counted | Local evidence |
| --- | --- | --- | --- | --- |
| EXT-106 | [failed-build-issue-action #157](https://github.com/jayqi/failed-build-issue-action/pull/157) | Draft / Local only | No | `af6cd2e`; 34 tests, 100% coverage, lint, diff |
| EXT-107 | [scout-issue #14](https://github.com/shauryagangrade/scout-issue/pull/14) | Merged / Passed | Yes | `6d2e183`; merged 2026-08-09T10:01:43Z; hosted checks passed |
| EXT-108 | [Zelqivo-Video-Program #102](https://github.com/roman-berlin/Zelqivo-Video-Program/pull/102) | Draft / Local only | No | `64dc304`; focused logging test 1/1 and diff |
| EXT-109 | [gortex #520](https://github.com/zzet/gortex/pull/520) | Draft / Local only | No | `abab837`; targeted and full `internal/mcp` tests, gofmt, diff |
| EXT-110 | [cockroach-browser #40](https://github.com/AjnasNB/cockroach-browser/pull/40) | Draft / Local only | No | `565c85e`; typecheck/build, package/site checks, audit, pack; one unrelated ARM/Node 25 parity failure |

Direct page fetches verified all five queue IDs and URLs. EXT-107 is
`Merged`/counted with its exact merge date and commit; the other four remain
`Draft`/uncounted, all with `Last Checked = 2026-08-09`. The authoritative
grouped data-source query reports **25** submitted rows for 2026-08-09. The
existing `PRs Submitted Per Day` line chart remains in use; no configuration
change was necessary. A live merged search reports 18 authored merges in
total, including the owned repository, so the qualifying external merged
count is **17**.

## 2026-08-09 chart-source correction

The individual EXT-106 through EXT-110 records were correctly created in the
`Open Source PR Tracker` data source, but the visible chart reads the separate
`📈 Unified Daily Activity` data source. To align the chart with the
authoritative tracker, created and directly refetched these two summary rows:

| Activity | Date | Metric | Count | Source |
| --- | --- | --- | ---: | --- |
| PRs Submitted — 2026-08-08 | 2026-08-08 | PRs Submitted | 0 | Open Source PR Tracker |
| PRs Submitted — 2026-08-09 | 2026-08-09 | PRs Submitted | 25 | Open Source PR Tracker |

The grouped query now returns both dates from the chart's actual data source.
Aug 8 is explicitly zero because the authoritative PR tracker has no
submission rows for that date; Aug 9 has 25.

## 2026-08-09 merged-activity chart closeout

The live canonical GitHub merge audit returned **17 qualifying external
merges**. The owned `aryansk/indiehouse#1` merge is excluded. The chart source
now contains one idempotent `PRs Merged` row per UTC merge date:

| Date | Metric | Count | Verified source |
| --- | --- | ---: | --- |
| 2026-08-05 | PRs Merged | 2 | GitHub `merged_at` |
| 2026-08-06 | PRs Merged | 2 | GitHub `merged_at` |
| 2026-08-07 | PRs Merged | 10 | GitHub `merged_at` |
| 2026-08-08 | PRs Merged | 0 | GitHub `merged_at` |
| 2026-08-09 | PRs Merged | 3 | GitHub `merged_at` |

All five activity pages were directly refetched. The Aug 9 row is now
`Count = 3`, so the merged series should display today's three merges inside
the chart's past-15-days filter.

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

## 2026-08-09 EXT-111 through EXT-115 dashboard closeout

After all five canonical PRs were verified, Notion received exactly one batch
of five rows. The per-PR tracker and the unified chart source were then
requeried after the write:

| Queue ID | Canonical PR | Notion state | Counted | Evidence |
| --- | --- | --- | --- | --- |
| EXT-111 | [GCode #36](https://github.com/shauryagangrade/GCode/pull/36) | Open / Local only | No | `5ee21d1`; 18 tests, compileall, diff check |
| EXT-112 | [GCode #37](https://github.com/shauryagangrade/GCode/pull/37) | Open / Local only | No | `4eedb0c`; 18 tests, diff check |
| EXT-113 | [GCode #38](https://github.com/shauryagangrade/GCode/pull/38) | Open / Local only | No | `497abd5`; 16 tests, diff check |
| EXT-114 | [StudyMap #130](https://github.com/StudentSuite/StudyMap/pull/130) | Merged / Failed deployment gate | Yes | `d726fe1`; merged 2026-08-09T11:03:39Z; local lint, 38 tests, typecheck, build |
| EXT-115 | [StudyMap #131](https://github.com/StudentSuite/StudyMap/pull/131) | Merged / Failed deployment gate | Yes | `04bea59`; merged 2026-08-09T11:03:42Z; 1440x900 media, 14-second GIF, diff check |

The authoritative grouped query reports **30** `PRs Submitted` and **5**
`PRs Merged` for 2026-08-09. The existing unified chart view remains the
source-backed chart; no duplicate activity rows were created. The two
StudyMap maintainer optional-star comments were acknowledged in GitHub, while
no artificial star action was taken.

## 2026-08-09 EXT-116 through EXT-120 dashboard closeout

After all five canonical PRs were verified, Notion received exactly one batch
of five new rows. The URL-keyed refetch confirmed every row and the submitted
aggregate was updated once:

| Queue ID | Canonical PR | Notion state | Counted | CI status / evidence |
| --- | --- | --- | --- | --- |
| EXT-116 | [Docker Docs #25737](https://github.com/docker/docs/pull/25737) | Open | No | Passed; hosted build, lint, Vale, tests, redirects, media, vendor validation, and Netlify preview |
| EXT-117 | [reference-docs #469](https://github.com/kubernetes-sigs/reference-docs/pull/469) | Open | No | Failed/blocked only by unsigned EasyCLA; Go tests and generated output pass |
| EXT-118 | [Jupyter Server #1689](https://github.com/jupyter-server/jupyter_server/pull/1689) | Open | No | Failed; human requested template removal was handled, but label and unrelated matrix failures remain |
| EXT-119 | [Jupyter Scheduler #614](https://github.com/jupyter-server/jupyter-scheduler/pull/614) | Open | No | Failed; build/isolated tests pass, while label, E2E backend, Read the Docs, and pre-commit fail |
| EXT-120 | [Jupyter Notebook #8025](https://github.com/jupyter/notebook/pull/8025) | Open | No | Failed; build/docs/tests and most platform checks pass, while `tests_check`, `check_links`, and `enforce-label` fail |

The authoritative readback reports **35** `PRs Submitted` and **5** `PRs
Merged` for 2026-08-09. No PR was marked merged or counted. The gortex
maintainer-request update and the closed virtle lane were reconciled in the
existing tracker rows without changing the submitted aggregate.

### Follow-up check refresh

The later hosted-check readback changed EXT-120 from `In progress` to `Failed`.
The Notion row now records the specific `tests_check`, `check_links`, and
`enforce-label` failures; the submitted aggregate remains **35** and the
merged aggregate remains **5**.

## 2026-08-09 assigned-issue pass

No Notion rows or aggregate metrics were written in this pass. The work was
not a five-new-PR batch and no canonical merge occurred, so the exact live
GitHub state is held in the local resumable trackers until the next batch
closeout or a merge/review event requires an earlier sync:

- CiteSeal existing draft PR #17 was updated to `c5a94f1` after a maintainer
  change request; its existing Notion row remains Draft/uncounted.
- Dataprof draft PR #556 was newly published, but its Notion row is deferred
  to the next five-new-PR batch rather than creating a one-off row.
- NemoClaw issue #8522 is covered by maintainer PR #8529; no duplicate PR or
  Notion row was created.

## 2026-08-10 merge and comment-state reconciliation

Direct GitHub verification found three additional canonical external merges
from 2026-08-09: Swift Service Lifecycle #250 at
`7f9326b0326ff86e3646295ea6e891f68c471c5e`, gortex #520 at
`d21a449f3feaac33e769ce87b6addf7048b948a5`, and Zelqivo-Video-Program #102
at `5b59828bb8d4683e0f8976f70c16a31e722a925d`. Existing Notion rows EXT-009,
EXT-109, and EXT-108 were updated in place to `Merged`, `Counted = true`,
their exact GitHub merge dates, merge commits, and `Last Checked = 2026-08-10`.

The `PRs Merged — 2026-08-09` activity row was updated from **5** to **8**.
Direct fetches verified all three tracker rows and the activity row. The
workspace Query Data Source limit was reached during the attempted aggregate
query, so no retry was made; page search and direct page fetches were used for
the affected-row verification instead.

## 2026-08-10 EXT-131 through EXT-135 dashboard closeout

After all five canonical PRs were verified, Notion received exactly one batch
of five new uncounted rows:

| Queue ID | Canonical PR | Notion state | Counted | Local evidence |
| --- | --- | --- | --- | --- |
| EXT-131 | [apache/beam #39688](https://github.com/apache/beam/pull/39688) | Draft | No | `46dcda5`; diff check; Java runtime unavailable locally; Beam checks in progress |
| EXT-132 | [apache/beam #39689](https://github.com/apache/beam/pull/39689) | Draft | No | `47f41f0`; docs/API comment; diff check; Beam checks in progress |
| EXT-133 | [OTel specification #5259](https://github.com/open-telemetry/opentelemetry-specification/pull/5259) | Draft | No | `6e05a75`; diff check and EasyCLA authorization passed; awaiting review |
| EXT-134 | [OTel specification #5260](https://github.com/open-telemetry/opentelemetry-specification/pull/5260) | Draft | No | `7cee0cb`; diff check and EasyCLA authorization passed; awaiting review |
| EXT-135 | [OTel specification #5261](https://github.com/open-telemetry/opentelemetry-specification/pull/5261) | Draft | No | `9546b4f`; diff check, `make markdownlint`, and EasyCLA authorization passed; awaiting review |

Direct page fetches verified all five rows, their exact PR URLs, dates, draft
states, `Counted = __NO__`, commits, and next actions. The existing
`PRs Submitted — 2026-08-10` activity row was updated from 10 to **15** and
directly refetched. `PRs Merged — 2026-08-10` is now **1** because the earlier
EXT-106 PR merged during closeout. The required
URL-keyed Query Data Source duplicate check could not execute because the
workspace quota is exhausted; the failed query had no side effects and the
limitation remains part of the handoff.

## 2026-08-10 failed-build-issue-action #157 merge reconciliation

The earlier EXT-106 contribution merged canonically after the five new rows
were created:

- [jayqi/failed-build-issue-action #157](https://github.com/jayqi/failed-build-issue-action/pull/157)
  merged at `2026-08-10T03:21:51Z` with merge commit
  `275f97540e9fec8dec0fe61bada563765f1a4dad`.
- Notion EXT-106 was updated in place to `PR Status = Merged`,
  `Counted = YES`, the exact merge date, and the merge commit; a direct fetch
  verified the page.
- The `PRs Merged — 2026-08-10` activity row was updated from **0** to **1**
  and directly refetched. `PRs Submitted — 2026-08-10` remains **15**.
- The maintainer's approval and follow-up were acknowledged at
  [issuecomment-5236186452](https://github.com/jayqi/failed-build-issue-action/pull/157#issuecomment-5236186452).

## 2026-08-10 delta merge reconciliation

- GitHub verified four additional qualifying merges after the prior closeout:
  GCode #38 at `91ebb888c9162b31fc5bd3a581e2e265d40acc22`, GCode #37 at
  `4f2b9b93e2f8ecf3fd77773fb1d5d2deb3eb533a`, GCode #36 at
  `768b5926ab1d9167b87efcad033c5191f6e9e950`, and dataprof #556 at
  `1d4c6bbfb2e9730e3f9bfe3b33655edb16991423`.
- The existing tracker rows EXT-111, EXT-112, and EXT-113 plus the assigned
  dataprof #556 row were updated in place to `PR Status = Merged`, `Counted =
  true`, exact `Merged` dates, exact merge commits, refreshed evidence, and
  `Last Checked = 2026-08-10`. A URL-keyed query directly refetched all four
  rows and confirmed those values; no duplicate PR rows were created.
- The documented activity source
  `collection://ca338652-b3ce-4771-bf90-8f6151f0a842` and corrected view
  `view://3b7f61c8-16ca-81bc-afbb-000cbfeb151e` currently return Notion
  `object_not_found`/`view_not_found` for this connector. Therefore the
  `PRs Merged — 2026-08-10` activity row could not be updated from the prior
  count of 1 to the GitHub-authoritative count of 5. This is a dashboard
  connector blocker, not a claim that the merges are unverified; retry the
  activity-layer sync when the source is accessible.

## 2026-08-10 EXT-136 through EXT-140 batch closeout

The five canonical rows were created once and directly refetched by page ID:

| Queue | Repository / PR | State | Counted | Exact head / evidence |
| --- | --- | --- | --- | --- |
| EXT-136 | [vercel-labs/skills #1914](https://github.com/vercel-labs/skills/pull/1914) | Draft | `__NO__` | `55ba16b2272312996f4e9b0ac08c752efd51aa7c`; 49 Vitest tests, TypeScript, diff check; Vercel team authorization blocker |
| EXT-137 | [python/mypy #21831](https://github.com/python/mypy/pull/21831) | Draft | `__NO__` | `55411e67fd19de3f33bf19f05868e8daeff0d470`; focused tests, self-check, and hosted checks pass |
| EXT-138 | [apple/swift-argument-parser #941](https://github.com/apple/swift-argument-parser/pull/941) | Draft | `__NO__` | `79a851c20bb5653cef53618839a34e8d42fc05c1`; build, 10 focused tests, integration rejection, hosted dependency check pass |
| EXT-139 | [pypa/setuptools #5298](https://github.com/pypa/setuptools/pull/5298) | Draft | `__NO__` | `6e3273dff919e1c218cd4ecdb0ec9f462c6bc48a`; editable install, strict Sphinx build, lint, and hosted checks pass |
| EXT-140 | [jupyter/nbconvert #2300](https://github.com/jupyter/nbconvert/pull/2300) | Draft | `__NO__` | `1fab6813f44f89017e7bcad27578571447b5b9c2`; 23 Python 3.9 tests and hosted functional/docs checks pass; enforce-label remains blocked |

The nbconvert row was updated in place after hosted completion and refetched at
2026-08-10T13:17:44Z with `CI Status = Failed` only for the repository triage
label gate; no merge count was added. The activity data source
`collection://ca338652-b3ce-4771-bf90-8f6151f0a842` still returns
`object_not_found`, so the expected Aug 10 submitted total of 20 and the
GitHub-authoritative merged total are documented locally but not claimed as a
stored activity-row write.
