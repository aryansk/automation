# Triage — TencentCloud/TencentDB-Agent-Memory #817

Date: 2026-08-06  
Repository: [TencentCloud/TencentDB-Agent-Memory](https://github.com/TencentCloud/TencentDB-Agent-Memory)  
Issue: [#817](https://github.com/TencentCloud/TencentDB-Agent-Memory/issues/817)

## Selection gate

- The repository is publicly accessible and externally owned by `TencentCloud`.
- Issue #817 was live-checked as open, unassigned, comment-free, and without an
  issue-specific pull request before implementation.
- The issue has a concrete Windows/Git Bash reproduction: the script finds
  Windows' native `ipconfig` while executing the macOS-only `ipconfig
  getifaddr` syntax, then allows multiline command output to become the host
  address and break the generated container environment.
- The repository's root `LICENSE` is MIT. GitHub metadata does not identify an
  SPDX license, so the license signal should be rechecked before publication.
- The repository was selected from the live weekly GitHub Trending scan, but
  trend rank is discovery context only and is not evidence of acceptance or
  program eligibility.

## Implementation

Checkout: `/Users/aryansingh/Downloads/Projects/Automation/tencentdb-agent-memory-817`  
Branch: `codex/issue-817-windows-git-bash-ip`  
Base: `feat/server_team`  
Commit: `89531bef6da3d66c5f64a9fbce5aa4dc0fc283e7`

Moved host-IP discovery into `deploy/global-images/_host-ip.sh` so it can be
tested without Docker. The helper now:

- validates every candidate as a single IPv4 address with valid octets;
- only uses macOS `ipconfig getifaddr` on Darwin;
- parses standalone IPv4 tokens from Windows Git Bash's native `ipconfig`;
- preserves Linux `hostname -I`, Linux `ip route`, macOS interface probing, and
  the final `localhost` fallback;
- documents the Windows path and adds a regression test with mocked platform
  commands.

## Validation evidence

Passed:

- `deploy/global-images/tests/test-host-ip.sh` — mocked Linux, macOS, Windows
  Git Bash, malformed-output fallback, and invalid-IPv4 cases.
- `/bin/bash -n deploy/global-images/*.sh deploy/global-images/tests/*.sh`.
- `git diff --check` before commit and `git diff HEAD^ HEAD --check` after
  commit.
- DCO sign-off is present on commit `89531bef`.

Not run:

- Docker startup and the full application test suite; this change is isolated
  to deployment-shell host-IP discovery, and Docker is not required by the
  regression test.
- `shellcheck`; it is not installed in the local environment.

## Publication state

- No fork, push, or pull request was created.
- Open upstream [PR #816](https://github.com/TencentCloud/TencentDB-Agent-Memory/pull/816)
  targets `feat/server_team`, changes the same `deploy/global-images` scripts,
  and explicitly covers the Windows/Git Bash host-IP behavior. This candidate
  is deferred to avoid a duplicate; it does not count toward the merged-PR
  total and is not an open PR.

## Next action

If PR #816 closes without resolving issue #817, re-check the issue, target
branch, license, and competing PRs immediately before publication. Only if the
issue is still unclaimed should a fork, verified branch push, and one draft PR
be created against the maintainer-confirmed base branch.
