#!/usr/bin/env python3
"""Track one-at-a-time upstream PR publication lanes.

The state file is intentionally small and local.  It records candidate
eligibility as a point-in-time workflow state; it does not replace the live
GitHub checks required before implementation or publication.
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


STATUSES = {
    "RESERVE",
    "PREFLIGHTING",
    "CLAIMED",
    "IMPLEMENTING",
    "VALIDATING",
    "FINAL_PREFLIGHT",
    "PUBLISHED",
    "ABANDONED_STALE",
    "BLOCKED",
    "CLOSED_DUPLICATE",
}

TRANSITIONS = {
    "RESERVE": {"PREFLIGHTING", "ABANDONED_STALE", "BLOCKED"},
    "PREFLIGHTING": {"CLAIMED", "ABANDONED_STALE", "BLOCKED"},
    "CLAIMED": {"IMPLEMENTING", "ABANDONED_STALE", "BLOCKED"},
    "IMPLEMENTING": {"VALIDATING", "ABANDONED_STALE", "BLOCKED"},
    "VALIDATING": {"FINAL_PREFLIGHT", "ABANDONED_STALE", "BLOCKED"},
    "FINAL_PREFLIGHT": {"PUBLISHED", "ABANDONED_STALE", "BLOCKED"},
    "PUBLISHED": {"ABANDONED_STALE", "CLOSED_DUPLICATE", "BLOCKED"},
    "ABANDONED_STALE": set(),
    "BLOCKED": {"PREFLIGHTING", "ABANDONED_STALE"},
    "CLOSED_DUPLICATE": set(),
}

ACTIVE_LANE_STATUSES = {"PREFLIGHTING", "CLAIMED", "IMPLEMENTING", "VALIDATING", "FINAL_PREFLIGHT"}


def now_utc() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def read_state(path: Path) -> dict[str, Any]:
    try:
        state = json.loads(path.read_text())
    except FileNotFoundError:
        raise SystemExit(f"state file does not exist: {path}")
    except json.JSONDecodeError as exc:
        raise SystemExit(f"invalid JSON in {path}: {exc}")
    if not isinstance(state, dict):
        raise SystemExit(f"state file must contain a JSON object: {path}")
    return state


def write_state(path: Path, state: dict[str, Any]) -> None:
    path.write_text(json.dumps(state, indent=2, sort_keys=False) + "\n")


def find_lane(state: dict[str, Any], lane_id: str) -> dict[str, Any]:
    for lane in state.get("lanes", []):
        if lane.get("id") == lane_id:
            return lane
    raise SystemExit(f"unknown lane id: {lane_id}")


def refresh_derived_state(state: dict[str, Any]) -> None:
    state["published_valid_count"] = sum(
        lane.get("status") == "PUBLISHED" for lane in state.get("lanes", [])
    )
    active = [lane["id"] for lane in state.get("lanes", []) if lane.get("status") in ACTIVE_LANE_STATUSES]
    if len(active) > 1:
        raise SystemExit(
            "sequential invariant failed: more than one lane is active: " + ", ".join(active)
        )
    state["active_lane"] = active[0] if active else None
    state["reserve_pool"] = [
        lane["id"] for lane in state.get("lanes", []) if lane.get("status") == "RESERVE"
    ]
    state["updated_at"] = now_utc()


def verify_state(state: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    lanes = state.get("lanes", [])
    ids = [lane.get("id") for lane in lanes]
    if len(ids) != len(set(ids)):
        errors.append("lane ids are not unique")
    active = [lane.get("id") for lane in lanes if lane.get("status") in ACTIVE_LANE_STATUSES]
    if len(active) > 1:
        errors.append("more than one lane is in the active sequential lane")
    for lane in lanes:
        status = lane.get("status")
        if status not in STATUSES:
            errors.append(f"{lane.get('id')}: unknown status {status!r}")
        if status == "PUBLISHED":
            for field in ("initial_preflight_at", "claim_or_work_start_at", "final_preflight_at", "published_at", "pr_url", "head_sha", "base", "canonical_verified"):
                if not lane.get(field):
                    errors.append(f"{lane.get('id')}: published lane missing {field}")
            if lane.get("canonical_verified") is not True:
                errors.append(f"{lane.get('id')}: published lane is not canonically verified")
        if status == "FINAL_PREFLIGHT" and not lane.get("final_preflight_at"):
            errors.append(f"{lane.get('id')}: final preflight timestamp is missing")
    expected_count = sum(lane.get("status") == "PUBLISHED" for lane in lanes)
    if state.get("published_valid_count") != expected_count:
        errors.append(
            f"published_valid_count={state.get('published_valid_count')} does not match {expected_count} PUBLISHED lanes"
        )
    expected_reserve = [lane.get("id") for lane in lanes if lane.get("status") == "RESERVE"]
    if state.get("reserve_pool") != expected_reserve:
        errors.append("reserve_pool does not match RESERVE lanes")
    expected_active = active[0] if active else None
    if state.get("active_lane") != expected_active:
        errors.append("active_lane does not match the sequential lane")
    return errors


def command_init(args: argparse.Namespace) -> None:
    if args.state.exists() and not args.force:
        raise SystemExit(f"refusing to overwrite existing state: {args.state} (use --force to replace)")
    state = {
        "version": 1,
        "workflow": "sequential-five-pr-publication",
        "packet_id": args.packet_id,
        "target_valid_published_prs": args.target,
        "published_valid_count": 0,
        "active_lane": None,
        "reserve_pool": [],
        "lanes": [],
        "rules": {
            "one_active_lane": True,
            "fresh_preflight_before_implementation": True,
            "fresh_preflight_before_publication": True,
            "count_only_canonical_verified_open_drafts": True,
            "replace_invalidated_publications_while_run_is_active": True,
        },
        "updated_at": now_utc(),
    }
    write_state(args.state, state)
    print(json.dumps(state, indent=2))


def command_add_reserve(args: argparse.Namespace) -> None:
    state = read_state(args.state)
    if any(lane.get("id") == args.id for lane in state.get("lanes", [])):
        raise SystemExit(f"lane already exists: {args.id}")
    state.setdefault("lanes", []).append(
        {
            "id": args.id,
            "repo": args.repo,
            "issue_url": args.issue_url,
            "title": args.title,
            "status": "RESERVE",
            "initial_preflight_at": None,
            "claim_or_work_start_at": None,
            "final_preflight_at": None,
            "published_at": None,
            "pr_url": None,
            "head_sha": None,
            "base": None,
            "canonical_verified": False,
            "reason": "",
        }
    )
    refresh_derived_state(state)
    write_state(args.state, state)
    print(f"added reserve lane {args.id}")


def command_transition(args: argparse.Namespace) -> None:
    state = read_state(args.state)
    lane = find_lane(state, args.id)
    old_status = lane.get("status")
    if args.status not in STATUSES:
        raise SystemExit(f"unknown status: {args.status}")
    if args.status == old_status:
        raise SystemExit(f"lane {args.id} is already {args.status}")
    if args.status not in TRANSITIONS.get(old_status, set()):
        raise SystemExit(f"invalid transition for {args.id}: {old_status} -> {args.status}")
    if args.status in {"ABANDONED_STALE", "BLOCKED", "CLOSED_DUPLICATE"} and not args.reason:
        raise SystemExit(f"{args.status} requires --reason so the replacement decision is auditable")
    timestamp = args.timestamp or now_utc()
    if args.status == "IMPLEMENTING":
        active_implementation = [
            other["id"] for other in state.get("lanes", []) if other.get("status") == "IMPLEMENTING"
        ]
        if active_implementation:
            raise SystemExit("only one lane may be IMPLEMENTING: " + ", ".join(active_implementation))
    if args.status == "PUBLISHED":
        missing = [name for name, value in {
            "--pr-url": args.pr_url,
            "--head": args.head,
            "--base": args.base,
        }.items() if not value]
        if missing or not args.verified:
            details = ", ".join(missing) if missing else "--verified"
            raise SystemExit(f"PUBLISHED requires canonical PR metadata and verification: {details}")
        lane.update(
            {
                "pr_url": args.pr_url,
                "head_sha": args.head,
                "base": args.base,
                "canonical_verified": True,
            }
        )
    lane["status"] = args.status
    if args.status == "PREFLIGHTING" and not lane.get("initial_preflight_at"):
        lane["initial_preflight_at"] = timestamp
    if args.status in {"CLAIMED", "IMPLEMENTING"} and not lane.get("claim_or_work_start_at"):
        lane["claim_or_work_start_at"] = timestamp
    if args.status == "FINAL_PREFLIGHT":
        lane["final_preflight_at"] = timestamp
    if args.status == "PUBLISHED":
        lane["published_at"] = timestamp
    if args.status in {"ABANDONED_STALE", "BLOCKED", "CLOSED_DUPLICATE"} and args.reason:
        lane["reason"] = args.reason
    if args.status in {"ABANDONED_STALE", "CLOSED_DUPLICATE"} and old_status == "PUBLISHED":
        lane["canonical_verified"] = False
        lane["invalidated_at"] = timestamp
    refresh_derived_state(state)
    errors = verify_state(state)
    if errors:
        raise SystemExit("state verification failed:\n- " + "\n- ".join(errors))
    write_state(args.state, state)
    print(f"{args.id}: {old_status} -> {args.status}")


def command_verify(args: argparse.Namespace) -> None:
    state = read_state(args.state)
    errors = verify_state(state)
    if errors:
        print("\n".join(errors), file=sys.stderr)
        raise SystemExit(1)
    print(
        f"OK: packet={state.get('packet_id')} active={state.get('active_lane')} "
        f"published_valid={state.get('published_valid_count')}/{state.get('target_valid_published_prs')} "
        f"reserve={len(state.get('reserve_pool', []))}"
    )


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--state", type=Path, required=True, help="path to LANE_STATE.json")
    subparsers = parser.add_subparsers(dest="command", required=True)

    init = subparsers.add_parser("init", help="create a new packet state file")
    init.add_argument("--packet-id", required=True)
    init.add_argument("--target", type=int, default=5)
    init.add_argument("--force", action="store_true")
    init.set_defaults(func=command_init)

    reserve = subparsers.add_parser("add-reserve", help="add a lightweight reserve candidate")
    reserve.add_argument("--id", required=True)
    reserve.add_argument("--repo", required=True)
    reserve.add_argument("--issue-url", required=True)
    reserve.add_argument("--title", required=True)
    reserve.set_defaults(func=command_add_reserve)

    transition = subparsers.add_parser("transition", help="move one lane through the state machine")
    transition.add_argument("--id", required=True)
    transition.add_argument("--status", required=True, choices=sorted(STATUSES))
    transition.add_argument("--timestamp")
    transition.add_argument("--reason")
    transition.add_argument("--pr-url")
    transition.add_argument("--head")
    transition.add_argument("--base")
    transition.add_argument("--verified", action="store_true")
    transition.set_defaults(func=command_transition)

    show = subparsers.add_parser("show", help="print the state file")
    show.set_defaults(func=lambda args: print(json.dumps(read_state(args.state), indent=2)))

    verify = subparsers.add_parser("verify", help="check state-machine invariants")
    verify.set_defaults(func=command_verify)
    return parser


if __name__ == "__main__":
    arguments = build_parser().parse_args()
    arguments.func(arguments)
