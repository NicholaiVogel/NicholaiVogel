#!/usr/bin/env python3
"""Create physically separate, single-seed explorer workspaces."""

from __future__ import annotations

import argparse
import hashlib
import json
import shutil
from pathlib import Path


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def copy_record(source: Path, destination: Path, role: str) -> dict[str, str]:
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source, destination)
    return {"path": str(destination), "sha256": sha256(destination), "role": role}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--run-root", required=True, type=Path)
    parser.add_argument("--requirements", required=True, type=Path)
    parser.add_argument("--seeds", required=True, type=Path)
    args = parser.parse_args()

    run_root = args.run_root.expanduser().resolve()
    requirements = json.loads(args.requirements.expanduser().resolve().read_text(encoding="utf-8"))
    seeds = json.loads(args.seeds.expanduser().resolve().read_text(encoding="utf-8"))
    items = seeds.get("seeds")
    if not isinstance(items, list) or len(items) not in (3, 4):
        raise SystemExit("seed receipt must contain 3 or 4 seeds")
    inputs = requirements.get("inputs")
    if not isinstance(inputs, list) or not inputs:
        raise SystemExit("requirements must contain a non-empty inputs list")

    roots: list[dict[str, object]] = []
    for item in items:
        seed_id = item.get("id")
        seed_value = item.get("value")
        if not isinstance(seed_id, str) or not seed_id or not isinstance(seed_value, str) or not seed_value:
            raise SystemExit("each seed needs a non-empty id and value")
        workspace = run_root / "explorers" / seed_id
        if workspace.exists():
            raise SystemExit(f"refusing to reuse explorer workspace: {workspace}")
        workspace.mkdir(parents=True)
        staged: list[dict[str, str]] = []
        for index, record in enumerate(inputs, start=1):
            source = Path(record.get("path", "")).expanduser().resolve()
            role = record.get("role")
            if not source.is_file() or not isinstance(role, str) or not role:
                raise SystemExit(f"invalid requirements input: {record}")
            suffix = source.suffix or ".txt"
            destination = workspace / "inputs" / f"{index:02d}-{role}{suffix}"
            staged.append(copy_record(source, destination, role))
        packet = {
            "schema_version": 1,
            "kind": "single_seed_explorer_packet",
            "seed_id": seed_id,
            "seed_value": seed_value,
            "inputs": staged,
            "forbidden_context": [
                "seeds.json",
                "style-library.md",
                "rejected directions",
                "earlier criticism",
                "implementation rationale",
                "other explorer workspaces",
            ],
            "raw_seed_exposed_in_candidate_or_site": False,
        }
        packet_path = workspace / "packet.json"
        packet_path.write_text(json.dumps(packet, indent=2) + "\n", encoding="utf-8")
        roots.append({"seed_id": seed_id, "workspace_root": str(workspace), "packet": str(packet_path)})

    receipt = run_root / "explorer-roots.json"
    receipt.write_text(
        json.dumps(
            {
                "schema_version": 1,
                "kind": "physically_isolated_explorer_roots",
                "run_root": str(run_root),
                "requirements_source": str(args.requirements.expanduser().resolve()),
                "seed_source": str(args.seeds.expanduser().resolve()),
                "roots": roots,
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    print(receipt)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
