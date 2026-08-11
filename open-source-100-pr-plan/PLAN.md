# Plan: 100 legitimate external merged pull requests

## Objective

Build a rolling 12-month record of 100 useful pull requests merged into public
repositories that Aryan does not own, while developing enough maintainer trust
to pursue a longer-term contributor or committer role.

The 100-PR path is only one route in Anthropic's current program criteria. The
same work should also create evidence for the alternative routes: recognized
maintainer status, package adoption, external contributors, or critical
infrastructure. Reassess the best route at each gate instead of treating 100 as
a quota.

## Current criteria and interpretation

Anthropic's current page lists these possible signals:

- 100 or more pull requests merged into repositories the applicant does not own
  during the previous 12 months;
- listed committer or maintainer status on a recognized project;
- a package with at least 500 dependent repositories, 100 dependent packages,
  or 200,000 combined monthly downloads;
- a repository with at least 20 unique external contributors whose PRs merged
  in the previous 12 months; or
- a maintained repository with an OpenSSF criticality score of at least 0.4.

See the [official Anthropic program page](https://claude.com/contact-sales/claude-for-oss)
before applying. Thresholds and interpretation may change.

The [OpenAI Codex for Open Source program](https://developers.openai.com/community/codex-for-oss)
is a separate maintainer track. Owning a repository alone is not sufficient;
the project should show active maintenance, ecosystem importance, or meaningful
public use.

## Memory and thread-resume process

The project uses a small set of durable Markdown state files so progress does
not depend on one conversation:

- [STATUS.md](STATUS.md) answers “what is true now, what is done, what is
  active, and what is the next pickup?”
- [WORK_QUEUE.md](WORK_QUEUE.md) answers “what still needs to be done, in what
  order, and what is blocked?”
- [WORK_LOG.md](WORK_LOG.md) preserves the append-only history of actions,
  outcomes, evidence, and handoffs.
- [templates/THREAD_HANDOFF.md](templates/THREAD_HANDOFF.md) is completed at
  the end of each thread.
- [REVIEW_AUDIT.md](REVIEW_AUDIT.md) records the all-authored-PR-state
  human-comment audit across open, merged, and recently closed PRs, responses,
  requested changes, and unresolved identity/legal blockers.
- [OUTCOME_LEARNING.md](OUTCOME_LEARNING.md) turns verified merged, open,
  closed, and commented-PR outcomes into selection gates and a recalibrated
  candidate score.
- [PREFERRED-FIVE-PUBLICATION.md](PREFERRED-FIVE-PUBLICATION.md) contains the
  exact five-candidate order, base branches, validation commands, and draft PR
  outlines for the next allowed publication window.

Every new thread must verify the current snapshot against the live repository
and GitHub state. Every ending thread must leave one concrete next action,
updated statuses, exact changed paths, checks run, and unresolved decisions.

## What counts as one PR

A row can be added to `PR_TRACKER.md` only when all of the following are true:

- Aryan is the author, using a documented GitHub identity.
- The base repository is public and not owned by Aryan.
- The contribution is a coherent change with a real maintainer/user benefit.
- The PR is merged, not merely open or closed.
- The canonical PR URL, base repository, merge date, merge commit, checks, and
  reviewer interaction are recorded.
- The change remains attributable and was understood by the contributor.

These do not count:

- PRs into `aryansk/*` repositories;
- PRs opened only against a personal fork;
- duplicate PRs, empty changes, typo padding, or mechanically split work;
- closed, abandoned, draft, or reverted PRs;
- generated artifacts submitted without a meaningful project change;
- a local commit, branch, issue comment, or release without a merged PR.

## Throughput math

The minimum mathematical pace for 100 merged PRs in 12 months is about 8.4
merged PRs per month. A sustainable 3–5 merged PRs per month produces roughly
36–60 PRs in a year, so that pace should pursue maintainer trust or another
Anthropic route rather than pretending it reaches 100.

The targets below are planning bands, not quotas:

| Period | Primary target | Decision gate |
| --- | --- | --- |
| Days 1–7 | Confirm identity, remotes, project rules, and baseline count | No PR is selected until its canonical base is clear |
| Days 8–30 | Submit 2–4 well-scoped contributions; seek the first 1–3 merges | If maintainers reject the project or scope, switch targets |
| Days 31–90 | 3–5 merged PRs per month across two active repositories | Identify the project where reviewers respond constructively |
| Days 91–180 | 4–7 merged PRs per month, one deeper feature or regression series | Ask about regular-contributor or committer expectations |
| Months 7–12 | 6–10 merged PRs per month only if genuine backlog and maintainer demand exist | Apply through 100 PRs only if the count is real; otherwise use another route |

## Repository portfolio and concurrency limits

Use an 8–12 repository candidate pool, but keep implementation and review
capacity controlled:

1. Keep the current Vercel Skills PRs in the review lane.
2. When the review loop is stable, activate one non-Vercel repository at a time,
   starting with Tuist issue #11693.
3. Add a second implementation lane only after maintainers respond
   constructively; do not create three simultaneous PRs just to increase the
   count.
4. Rotate among Swift tooling, Swift server libraries, rendering/developer
   tools, and CLI infrastructure so the record reflects genuine breadth.

The expanded candidate pool is maintained in [REPO_MATRIX.md](REPO_MATRIX.md).
Every repository still requires a current issue, a non-duplicate scope, a
reproduction or testable hypothesis, and a contribution that the author can
explain during review.

### High-impact selection gate

The next packet should default to large, impactful, active, and currently
relevant repositories: projects with substantial adoption, active releases,
healthy contributor activity, or clear ecosystem importance. Verify this live
before reserving an issue, and balance impact with a realistic maintainer
acceptance path. Stars and trend signals are useful evidence, but they do not
replace a concrete issue, repository license, contribution rules, or a
testable scope.

If a maintainer directly invites work in a smaller repository, the invitation
may be accepted as an explicit exception when the issue is useful and
non-artificial. Record the exception, keep the PR focused, and return to the
high-impact portfolio for the next selection cycle.

### Difficulty and acceptance gate

Each packet should favor medium-to-easy, issue-backed work that can be
implemented and validated in a short session. Focused documentation, narrow
regressions, small tests, and contained developer-experience improvements are
preferred. Avoid broad architecture changes, multi-subsystem features, and
issues whose design is still unsettled. A repository's popularity is a
selection signal, not a reason to accept an unnecessarily difficult scope.

### Outcome-learning gate

Use [OUTCOME_LEARNING.md](OUTCOME_LEARNING.md) before reserving a candidate.
The live history currently shows 24 qualifying external merges, 18 closed
unmerged PRs, and 85 open PRs. The resolved ratio is useful context but is not
an acceptance guarantee because many open PRs are pending and several closures
were caused by policy, duplication, or maintainer scope decisions.

For each candidate:

1. Apply hard gates for current issue state, duplicate safety, contribution
   policy, ownership/base branch, and a runnable validation path.
2. Score maintainer demand, scope clarity, validation fit, repository impact,
   prior constructive response, and concrete user benefit.
3. Reserve only candidates scoring at least 9/13 with no hard-gate failure.
4. Prefer the demonstrated merged mix: narrow bug fixes, useful docs, CI,
   focused tests, and contained features. Do not choose a cosmetic README task
   merely because it is quick.
5. Handle new human feedback before fresh selection, and classify closures by
   policy, duplicate, design, CI, scope, contributor error, or unknown cause.

Do not pad a five-PR packet. A smaller set of well-supported contributions is
better evidence than five weak or artificial submissions. Promote a pattern to
a default only after at least two independent examples support it.

## Current five-candidate preparation batch — 2026-08-06

The current batch produced five legitimate issue-backed contributions with
tested branches and verified draft PRs: DeepSeek-Reasonix #7692, AirLLM #334,
Microsoft AI-For-Beginners #729, grpc-go #9296, and Swift Distributed Tracing
#235. TencentDB-Agent-Memory #817 was excluded from the batch after open PR
#816 was found to overlap the same Windows/Git Bash fix. Swift Service Lifecycle
#163 is locally tested, but its maintainer has asked contributors to wait for
user reports, so it remains a conditional alternative.

Refined-github #9941 is explicitly excluded and will not be reopened or
modified. Its human-evidence request remains recorded for repository history,
but it is repository-specific; independent repositories still require their
own live issue, duplicate, contribution-rule, license, base-branch, and local
validation checks. A local commit, fork branch, or open/draft PR does not count
toward the 100-PR criterion; only a canonical upstream merge does.

README-specific discovery is tracked separately in
[TOP10-README-PORTFOLIO-2026-08-02.md](TOP10-README-PORTFOLIO-2026-08-02.md).
README additions must still be repository-specific and maintainer-appropriate;
the top-10 ranking does not justify cosmetic or simultaneous PR volume.

## Initial issue-triage queue

These are starting points observed on 2026-08-02. Re-check status, existing PRs,
maintainer guidance, and current branch behavior before selecting any item.

### Tuist

- [#11693: expand paths starting with `~`](https://github.com/tuist/tuist/issues/11693)
- [#11534: exclude `.gitkeep` / `.DS_Store` from buildable folders](https://github.com/tuist/tuist/issues/11534)
- [#11512: visionOS UI-test target generation](https://github.com/tuist/tuist/issues/11512)

Prefer CLI or generated-project issues. Avoid server/Kura work until the project
maintainers specifically direct the contribution there.

### HyperFrames

- [#2663: variant manifest support](https://github.com/heygen-com/hyperframes/issues/2663)
- [#2775: audio pipeline seam/reuse behavior](https://github.com/heygen-com/hyperframes/issues/2775)
- [#2888: declarative conditional rendering](https://github.com/heygen-com/hyperframes/issues/2888)
- [#2830: data-bound video](https://github.com/heygen-com/hyperframes/issues/2830)

The last two are larger design features. Start with reproduction, a design
comment, tests, or a smaller adjacent issue rather than opening a speculative
implementation PR.

### Vercel skills

- [#1848: universal-agent frontmatter missing `name`](https://github.com/vercel-labs/skills/issues/1848)
- [#1812: global update cannot repair drifted skills](https://github.com/vercel-labs/skills/issues/1812)
- [#1802: same-name skills overwrite each other](https://github.com/vercel-labs/skills/issues/1802)
- [#1771: `remove --all` path collision](https://github.com/vercel-labs/skills/issues/1771)

Prefer a fixture, failing test, fix, and cross-platform verification as one PR.

## Weekly execution loop

### Monday: select and verify

- Read `OUTCOME_LEARNING.md` and audit current merged, open, closed, and
  commented PR outcomes before choosing new issues.
- Re-read the target repository's contribution and agent instructions.
- Inspect the current default branch and open PRs.
- Select one issue or reproduce one user-visible defect.
- Write the intended scope in `templates/ISSUE_TRIAGE.md`.

### Tuesday–Wednesday: implement

- Create a feature branch according to the upstream convention.
- Make the smallest complete change.
- Add a meaningful regression test or acceptance fixture.
- Run the exact checks required by the repository.

### Thursday: review preparation

- Check the diff for unrelated files, generated noise, secrets, and licensing
  problems.
- Prepare the PR using `templates/PR_DESCRIPTION.md`.
- Ask for scope feedback before expanding the PR.

### Friday: maintain the contribution

- Respond to review comments with evidence.
- Do not stack unrelated improvements into the PR.
- After the five-PR packet is complete, audit every authored `aryansk` PR
  across open, merged, and recently closed states, including older packets.
  Separate bot notifications from human requests, complete actionable
  code/docs/test/state requests, and record every reply or blocker in
  `REVIEW_AUDIT.md` before handoff.
- After merge, complete `templates/POST_MERGE_RECORD.md` and update the count.
- At packet closeout, update `OUTCOME_LEARNING.md` with the outcome, maintainer
  signal, closure reason when applicable, and the resulting selection change.

## Evidence requirements

For every merged PR, capture:

- canonical PR URL;
- base repository and branch;
- issue URL or problem reproduction;
- PR title and concise purpose;
- submission and merge dates;
- merge commit;
- tests/checks and their result;
- reviewer/maintainer interaction;
- whether the change was released or included in a published version;
- any user, download, dependent, or contributor signal.

Keep application evidence separate from internal QA. A passing local test does
not prove a PR merged, a release shipped, or a project became widely used.

## Six-month review

At month six, choose one of three paths:

1. **100-PR path:** maintainers are receptive and there is enough legitimate
   backlog to sustain 8–10 merged PRs per month.
2. **Maintainer path:** a project invites regular triage, review, or committer
   work; prioritize trust and ownership over volume.
3. **Adoption path:** the owned StoryTime-derived package or Automation tool has
   real dependents, downloads, external contributors, or ecosystem use; focus
   on OpenAI and Anthropic's alternative criteria.

Do not continue a failing PR-volume strategy merely to hit a number.
