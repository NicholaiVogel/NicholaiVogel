#!/usr/bin/env python3
"""Guard project writes until seeded exploration and taste calibration finish."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

EXCLUDED_DIRS = {".git", "node_modules", ".astro", "dist", ".vercel", ".wrangler"}
PHASES = {
    "exploration_complete",
    "taste_calibrated",
    "implementation_started",
    "critic_started",
    "delivery_started",
    "qa_started",
}


def iso_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def resolve_dir(raw: str, label: str) -> Path:
    path = Path(raw).expanduser().resolve()
    if label == "run_root":
        path.mkdir(parents=True, exist_ok=True)
    return path


def atomic_write(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(f".{path.name}.{os.getpid()}.tmp")
    temporary.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    temporary.replace(path)


def file_digest(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def snapshot(project_root: Path) -> dict[str, Any]:
    if not project_root.exists():
        return {"root_exists": False, "files": {}}
    if not project_root.is_dir():
        return {"root_exists": True, "not_directory": True, "files": {}}

    files: dict[str, dict[str, Any]] = {}
    for path in sorted(project_root.rglob("*")):
        relative_parts = path.relative_to(project_root).parts
        if any(part in EXCLUDED_DIRS for part in relative_parts):
            continue
        relative = str(path.relative_to(project_root))
        if path.is_symlink():
            files[relative] = {"kind": "symlink", "target": os.readlink(path)}
        elif path.is_file():
            files[relative] = {"kind": "file", "sha256": file_digest(path)}
        elif not path.is_dir():
            files[relative] = {"kind": "other"}
    return {"root_exists": True, "files": files}


def snapshot_digest(value: dict[str, Any]) -> str:
    encoded = json.dumps(value, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def changed_paths(before: dict[str, Any], after: dict[str, Any]) -> list[str]:
    if before.get("root_exists") != after.get("root_exists"):
        return ["<project-root>"]
    if before.get("not_directory") != after.get("not_directory"):
        return ["<project-root-type>"]
    before_files = before.get("files", {})
    after_files = after.get("files", {})
    return sorted(
        {
            *[path for path in before_files if before_files.get(path) != after_files.get(path)],
            *[path for path in after_files if before_files.get(path) != after_files.get(path)],
        }
    )


def load(run_root: Path, name: str) -> dict[str, Any]:
    path = run_root / name
    if not path.is_file():
        raise SystemExit(f"missing guard file: {path}")
    return json.loads(path.read_text(encoding="utf-8"))


def start(args: argparse.Namespace) -> int:
    run_root = resolve_dir(args.run_root, "run_root")
    project_root = Path(args.project_root).expanduser().resolve()
    baseline = snapshot(project_root)
    started = {
        "schema_version": 1,
        "kind": "exploration_write_guard_start",
        "run_root": str(run_root),
        "project_root": str(project_root),
        "started_at": iso_now(),
        "started_epoch": time.time(),
        "baseline_tree_sha256": snapshot_digest(baseline),
        "baseline_snapshot": baseline,
    }
    atomic_write(run_root / "guard-start.json", started)
    atomic_write(
        run_root / "guard-state.json",
        {
            "schema_version": 1,
            "kind": "exploration_write_guard_state",
            "state": "running",
            "violation": False,
            "run_root": str(run_root),
            "project_root": str(project_root),
            "baseline_tree_sha256": started["baseline_tree_sha256"],
            "started_at": started["started_at"],
        },
    )

    while True:
        current = snapshot(project_root)
        changes = changed_paths(baseline, current)
        if changes:
            atomic_write(
                run_root / "guard-state.json",
                {
                    "schema_version": 1,
                    "kind": "exploration_write_guard_state",
                    "state": "violation",
                    "violation": True,
                    "run_root": str(run_root),
                    "project_root": str(project_root),
                    "baseline_tree_sha256": started["baseline_tree_sha256"],
                    "current_tree_sha256": snapshot_digest(current),
                    "changed_paths": changes,
                    "detected_at": iso_now(),
                },
            )
            print(f"EXPLORATION GUARD VIOLATION: {', '.join(changes[:8])}", file=sys.stderr)
            return 1

        release_path = run_root / "guard-release.json"
        if release_path.is_file():
            release = json.loads(release_path.read_text(encoding="utf-8"))
            release_snapshot = snapshot(project_root)
            release_changes = changed_paths(baseline, release_snapshot)
            if release_changes:
                atomic_write(
                    run_root / "guard-state.json",
                    {
                        "schema_version": 1,
                        "kind": "exploration_write_guard_state",
                        "state": "violation",
                        "violation": True,
                        "run_root": str(run_root),
                        "project_root": str(project_root),
                        "baseline_tree_sha256": started["baseline_tree_sha256"],
                        "release_tree_sha256": snapshot_digest(release_snapshot),
                        "changed_paths": release_changes,
                        "release_marker": str(release_path),
                        "detected_at": iso_now(),
                    },
                )
                print(f"EXPLORATION GUARD VIOLATION: {', '.join(release_changes[:8])}", file=sys.stderr)
                return 1
            atomic_write(
                run_root / "guard-state.json",
                {
                    "schema_version": 1,
                    "kind": "exploration_write_guard_state",
                    "state": "released",
                    "violation": False,
                    "run_root": str(run_root),
                    "project_root": str(project_root),
                    "baseline_tree_sha256": started["baseline_tree_sha256"],
                    "release_tree_sha256": snapshot_digest(release_snapshot),
                    "release_marker": str(release_path),
                    "release_reason": release.get("reason"),
                    "released_at": release.get("released_at"),
                },
            )
            print(f"EXPLORATION GUARD RELEASED: {release.get('reason', '')}")
            return 0
        time.sleep(max(0.05, args.poll_seconds))


def release(args: argparse.Namespace) -> int:
    run_root = resolve_dir(args.run_root, "run_root")
    state = load(run_root, "guard-state.json")
    if state.get("state") == "violation" or state.get("violation") is True:
        raise SystemExit("cannot release a violated exploration guard")
    atomic_write(
        run_root / "guard-release.json",
        {
            "schema_version": 1,
            "kind": "exploration_write_guard_release",
            "run_root": str(run_root),
            "project_root": state.get("project_root"),
            "reason": args.reason,
            "released_at": iso_now(),
            "released_epoch": time.time(),
        },
    )
    print(run_root / "guard-release.json")
    return 0


def phase(args: argparse.Namespace) -> int:
    run_root = resolve_dir(args.run_root, "run_root")
    if args.name not in PHASES:
        raise SystemExit(f"unknown phase: {args.name}")
    state = load(run_root, "guard-state.json")
    if args.name == "exploration_complete" and state.get("state") == "released":
        raise SystemExit("exploration_complete must be recorded before release")
    if args.name != "exploration_complete" and state.get("state") != "released":
        raise SystemExit(f"phase {args.name} requires a released guard")
    event = {
        "schema_version": 1,
        "kind": "design_loop_phase",
        "phase": args.name,
        "run_root": str(run_root),
        "project_root": state.get("project_root"),
        "recorded_at": iso_now(),
        "recorded_epoch": time.time(),
        "guard_state": state.get("state"),
        "guard_violation": state.get("violation"),
    }
    path = run_root / f"phase-{args.name}.json"
    atomic_write(path, event)
    print(path)
    return 0


def verify(args: argparse.Namespace) -> int:
    run_root = resolve_dir(args.run_root, "run_root")
    start_record = load(run_root, "guard-start.json")
    state = load(run_root, "guard-state.json")
    release_record = load(run_root, "guard-release.json")
    if state.get("state") != "released" or state.get("violation") is not False:
        raise SystemExit("exploration guard is not cleanly released")
    if release_record.get("reason") != "taste_calibrated":
        raise SystemExit("exploration guard release reason must be taste_calibrated")
    if state.get("baseline_tree_sha256") != state.get("release_tree_sha256"):
        raise SystemExit("project changed before exploration guard release")
    if state.get("project_root") != start_record.get("project_root"):
        raise SystemExit("guard project root mismatch")
    if args.project_root and str(Path(args.project_root).expanduser().resolve()) != state.get("project_root"):
        raise SystemExit("requested project root does not match guard")
    print("EXPLORATION GUARD VERIFIED")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="command", required=True)

    start_parser = subparsers.add_parser("start")
    start_parser.add_argument("--run-root", required=True)
    start_parser.add_argument("--project-root", required=True)
    start_parser.add_argument("--poll-seconds", type=float, default=0.25)
    start_parser.set_defaults(handler=start)

    release_parser = subparsers.add_parser("release")
    release_parser.add_argument("--run-root", required=True)
    release_parser.add_argument("--reason", required=True)
    release_parser.set_defaults(handler=release)

    phase_parser = subparsers.add_parser("phase")
    phase_parser.add_argument("--run-root", required=True)
    phase_parser.add_argument("--name", required=True)
    phase_parser.set_defaults(handler=phase)

    verify_parser = subparsers.add_parser("verify")
    verify_parser.add_argument("--run-root", required=True)
    verify_parser.add_argument("--project-root")
    verify_parser.set_defaults(handler=verify)

    args = parser.parse_args()
    return args.handler(args)


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except KeyboardInterrupt:
        raise SystemExit(130)
