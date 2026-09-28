#!/usr/bin/env python3
"""Fail-closed verifier for the Astro creative design loop.

The manifest is ephemeral and must live under /mnt/work/hermes-scratch.
This verifier treats child-tool receipts as the authority for explorer and
critic output. A parent-authored critic JSON file is never accepted.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path
from typing import Any, Iterable

SCRATCH_ROOT = Path("/mnt/work/hermes-scratch").resolve()
SEED_RE = re.compile(r"^[A-Za-z0-9]{32,}$")
SHA_RE = re.compile(r"^[0-9a-f]{64}$")
ALLOWED_MEDIA_SKILLS = {"imagegen", "nano-banana", "ai-video-director", "codex"}
ALLOWED_EXPLORER_GENERATORS = {"imagegen-frontend-web", "imagegen", "nano-banana", "codex"}
RASTER_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".avif"}
ALLOWED_BROWSER_TOOLS = {"agent-browser", "browser-use", "browser"}
REQUIRED_PHASES = (
    "exploration_complete",
    "taste_calibrated",
    "implementation_started",
    "critic_started",
    "delivery_started",
    "qa_started",
)
FORBIDDEN_EXPLORER_TERMS = (
    "style-library",
    "rejected-directions",
    "earlier-criticism",
    "implementation-rationale",
)
REQUIRED_IDENTITY_FIELDS = (
    "emotional target",
    "concept spine",
    "hierarchy",
    "composition grammar",
    "typography",
    "palette",
    "material",
    "media role",
    "motion role",
    "signature",
    "explicit refusals",
)


class ValidationError(Exception):
    pass


def fail(message: str) -> None:
    raise ValidationError(message)


def require(condition: bool, message: str) -> None:
    if not condition:
        fail(message)


def load_json(path: Path, label: str) -> Any:
    require(path.is_file(), f"{label} does not exist: {path}")
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:  # pragma: no cover - diagnostic path
        fail(f"{label} is not valid JSON: {path}: {exc}")


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def validate_sha(path: Path, expected: str, label: str) -> None:
    require(bool(SHA_RE.fullmatch(expected)), f"{label} has an invalid SHA-256")
    actual = sha256(path)
    require(actual == expected, f"{label} hash mismatch: expected {expected}, got {actual}")


def absolute_ref(raw: Any, label: str) -> Path:
    require(isinstance(raw, str) and raw, f"{label} must be a non-empty absolute path")
    path = Path(raw)
    require(path.is_absolute(), f"{label} must be absolute: {raw}")
    return path.resolve()


def nonempty_file(raw: Any, label: str) -> Path:
    path = absolute_ref(raw, label)
    require(path.is_file(), f"{label} does not exist: {path}")
    require(path.stat().st_size > 0, f"{label} is empty: {path}")
    return path


def file_record(record: Any, label: str) -> Path:
    require(isinstance(record, dict), f"{label} must be an object")
    path = nonempty_file(record.get("path"), f"{label}.path")
    validate_sha(path, record.get("sha256", ""), label)
    return path


def path_under(path: Path, roots: Iterable[Path], label: str) -> None:
    resolved_roots = [root.resolve() for root in roots]
    for root in resolved_roots:
        try:
            path.relative_to(root)
            return
        except ValueError:
            continue
    fail(f"{label} is outside allowed roots: {path}")


def contains_pair(node: Any, key: str, expected: Any) -> bool:
    if isinstance(node, dict):
        if node.get(key) == expected:
            return True
        return any(contains_pair(value, key, expected) for value in node.values())
    if isinstance(node, list):
        return any(contains_pair(value, key, expected) for value in node)
    if isinstance(node, str):
        stripped = node.strip()
        if stripped.startswith("{") or stripped.startswith("["):
            try:
                return contains_pair(json.loads(stripped), key, expected)
            except json.JSONDecodeError:
                return False
    return False


def find_critic_report(node: Any) -> dict[str, Any] | None:
    if isinstance(node, dict):
        score = node.get("score")
        if (
            isinstance(score, (int, float))
            and not isinstance(score, bool)
            and isinstance(node.get("screenshot_hashes"), list)
            and node.get("fresh_context") is True
            and node.get("code_provided") is False
            and node.get("implementation_details_provided") is False
            and node.get("earlier_criticism_provided") is False
        ):
            return node
        for value in node.values():
            found = find_critic_report(value)
            if found:
                return found
    elif isinstance(node, list):
        for value in node:
            found = find_critic_report(value)
            if found:
                return found
    elif isinstance(node, str):
        stripped = node.strip()
        if stripped.startswith("{") or stripped.startswith("["):
            try:
                return find_critic_report(json.loads(stripped))
            except json.JSONDecodeError:
                return None
    return None


def find_explorer_result(node: Any, seed_id: str, artifact: str) -> dict[str, Any] | None:
    if isinstance(node, dict):
        if node.get("seed_id") == seed_id and node.get("candidate_artifact") == artifact:
            return node
        for value in node.values():
            found = find_explorer_result(value, seed_id, artifact)
            if found:
                return found
    elif isinstance(node, list):
        for value in node:
            found = find_explorer_result(value, seed_id, artifact)
            if found:
                return found
    elif isinstance(node, str):
        stripped = node.strip()
        if stripped.startswith("{") or stripped.startswith("["):
            try:
                return find_explorer_result(json.loads(stripped), seed_id, artifact)
            except json.JSONDecodeError:
                return None
    return None


def derive_seed_facts(value: str) -> dict[str, list[str]]:
    counts: dict[str, int] = {}
    for character in value:
        counts[character] = counts.get(character, 0) + 1
    most_common = max(sorted(counts), key=lambda character: counts[character])
    digits = sum(character.isdigit() for character in value)
    letters = sum(character.isalpha() for character in value)
    middle = len(value) // 2
    return {
        "most_common": [most_common, str(counts[most_common]), f"{most_common}:{counts[most_common]}"],
        "prefix": [value[:4]],
        "suffix": [value[-4:]],
        "digit_letter_balance": [str(digits), str(letters), f"digits={digits}", f"letters={letters}", f"{digits}/{letters}"],
        "unique_count": [str(len(set(value)))],
        "midpoint": [value[middle - 2:middle + 2]],
    }


def validate_seed_reading(reading: Any, seed_value: str, label: str) -> None:
    require(isinstance(reading, dict), f"{label}.seed_reading must be an object")
    observations = reading.get("observations")
    require(isinstance(observations, list) and len(observations) >= 3, f"{label} seed reading needs at least 3 observations")
    facts = derive_seed_facts(seed_value)
    observed_facts: set[str] = set()
    for index, observation in enumerate(observations):
        require(isinstance(observation, dict), f"{label}.seed_reading.observations[{index}] must be an object")
        fact = observation.get("fact")
        evidence = observation.get("evidence")
        require(fact in facts, f"{label} has an unsupported seed-reading fact: {fact}")
        require(isinstance(evidence, str) and evidence, f"{label} seed observation {index} has no evidence")
        require(any(evidence == option or evidence in option or evidence in seed_value for option in facts[fact]), f"{label} seed observation {index} evidence is not grounded in its seed")
        require(isinstance(observation.get("observation"), str) and observation["observation"].strip(), f"{label} seed observation {index} has no interpretation")
        observed_facts.add(fact)
    require(len(observed_facts) >= 3, f"{label} seed reading repeats one fact instead of inspecting the string")
    decisions = reading.get("derived_decisions")
    require(isinstance(decisions, list) and len(decisions) >= 3, f"{label} seed reading needs at least 3 derived decisions")
    for index, decision in enumerate(decisions):
        require(isinstance(decision, dict), f"{label}.seed_reading.derived_decisions[{index}] must be an object")
        require(decision.get("source_fact") in observed_facts, f"{label} decision {index} is not linked to an observed seed fact")
        require(isinstance(decision.get("decision"), str) and decision["decision"].strip(), f"{label} decision {index} has no visible design decision")
        require(isinstance(decision.get("visible_in"), str) and decision["visible_in"].strip(), f"{label} decision {index} has no visible consequence")
    require(reading.get("raw_seed_exposed_in_candidate_or_site") is False, f"{label} exposes the raw seed in candidate or site")


def validate_guard(manifest: dict[str, Any], scratch_root: Path, project_root: Path) -> tuple[float, dict[str, float]]:
    guard = manifest.get("phase_guard")
    require(isinstance(guard, dict), "phase_guard is required")
    start_path = file_record(guard.get("start_receipt"), "phase_guard.start_receipt")
    state_path = file_record(guard.get("state_receipt"), "phase_guard.state_receipt")
    release_path = file_record(guard.get("release_receipt"), "phase_guard.release_receipt")
    for label, path in (("phase_guard.start_receipt", start_path), ("phase_guard.state_receipt", state_path), ("phase_guard.release_receipt", release_path)):
        path_under(path, [scratch_root], label)
    start = load_json(start_path, "phase guard start receipt")
    state = load_json(state_path, "phase guard state receipt")
    release = load_json(release_path, "phase guard release receipt")
    require(start.get("project_root") == str(project_root), "phase guard start project root mismatch")
    require(state.get("project_root") == str(project_root), "phase guard state project root mismatch")
    require(release.get("project_root") == str(project_root), "phase guard release project root mismatch")
    require(state.get("state") == "released" and state.get("violation") is False, "exploration write guard is not cleanly released")
    require(release.get("reason") == "taste_calibrated", "exploration guard release reason must be taste_calibrated")
    require(state.get("baseline_tree_sha256") == state.get("release_tree_sha256"), "project changed before exploration guard release")
    release_epoch = release.get("released_epoch")
    require(isinstance(release_epoch, (int, float)) and release_epoch > 0, "phase guard has no release timestamp")

    event_records = guard.get("phase_events")
    require(isinstance(event_records, list), "phase_guard.phase_events must be a list")
    events: dict[str, float] = {}
    for index, record in enumerate(event_records):
        event_path = file_record(record, f"phase_guard.phase_events[{index}]")
        path_under(event_path, [scratch_root], f"phase_guard.phase_events[{index}]")
        event = load_json(event_path, f"phase guard phase event {index}")
        phase_name = event.get("phase")
        timestamp = event.get("recorded_epoch")
        require(phase_name in REQUIRED_PHASES, f"unknown phase event: {phase_name}")
        require(phase_name not in events, f"duplicate phase event: {phase_name}")
        require(isinstance(timestamp, (int, float)) and timestamp > 0, f"phase event {phase_name} has no timestamp")
        require(event.get("project_root") == str(project_root), f"phase event {phase_name} project root mismatch")
        require(event.get("guard_violation") is False, f"phase event {phase_name} recorded a guard violation")
        events[phase_name] = float(timestamp)
    require(set(events) == set(REQUIRED_PHASES), "phase guard is missing a required phase event")
    ordered = [events[name] for name in REQUIRED_PHASES]
    require(ordered == sorted(ordered), "design loop phase events are not monotonic")
    require(events["exploration_complete"] < release_epoch <= events["taste_calibrated"], "taste calibration was not released after exploration")
    for name in REQUIRED_PHASES[2:]:
        require(events[name] >= release_epoch, f"{name} began before taste calibration released the guard")
    return float(release_epoch), events


def require_transcript_markers(transcript: Path, markers: Iterable[str], label: str) -> None:
    text = transcript.read_text(encoding="utf-8")
    for marker in markers:
        require(marker in text, f"{label} transcript is missing child-output marker: {marker}")


def validate_provenance(
    provenance: Any,
    label: str,
    role: str,
    roots: list[Path],
    used_ids: set[str],
) -> tuple[Path, Path, dict[str, Any]]:
    require(isinstance(provenance, dict), f"{label} provenance must be an object")
    require(provenance.get("tool") == "functions.delegate_task", f"{label} is not a Hermes delegate_task receipt")
    require(provenance.get("role") == role, f"{label} has the wrong role")
    require(provenance.get("isolated") is True, f"{label} was not marked isolated")
    call_id = provenance.get("call_id")
    subagent_id = provenance.get("subagent_id")
    require(isinstance(call_id, str) and call_id, f"{label} is missing call_id")
    require(isinstance(subagent_id, str) and subagent_id, f"{label} is missing subagent_id")
    require(subagent_id not in used_ids, f"{label} reused subagent_id {subagent_id}")
    used_ids.add(subagent_id)
    require(SHA_RE.fullmatch(provenance.get("prompt_sha256", "")) is not None, f"{label} is missing prompt_sha256")

    receipt = nonempty_file(provenance.get("receipt_path"), f"{label}.receipt_path")
    transcript = nonempty_file(provenance.get("transcript_path"), f"{label}.transcript_path")
    path_under(receipt, roots, f"{label}.receipt_path")
    path_under(transcript, roots + [Path.home() / ".hermes"], f"{label}.transcript_path")
    raw = load_json(receipt, f"{label} raw receipt")
    require(contains_pair(raw, "subagent_id", subagent_id), f"{label} raw receipt does not contain its subagent_id")
    require(contains_pair(raw, "transcript_path", str(transcript)), f"{label} raw receipt does not contain its transcript_path")
    return receipt, transcript, raw


def validate_reference_list(records: Any, label: str, roots: list[Path]) -> list[str]:
    require(isinstance(records, list) and records, f"{label} must be a non-empty list")
    hashes: list[str] = []
    for index, record in enumerate(records):
        path = file_record(record, f"{label}[{index}]")
        path_under(path, roots, f"{label}[{index}]")
        hashes.append(record["sha256"])
    return hashes


def validate_build(project_root: Path, build: Any, check_only: bool, scratch_root: Path) -> None:
    require(isinstance(build, dict), "verification.build must be an object")
    command = build.get("command", "")
    require(isinstance(command, str) and "bun run build" in command, "verification.build.command must run bun run build")
    require(build.get("exit_code") == 0, "stored build result is not successful")
    receipt = nonempty_file(build.get("receipt_path"), "verification.build.receipt_path")
    path_under(receipt, [scratch_root], "verification.build.receipt_path")
    if check_only:
        return

    actual_receipt = scratch_root / "build-actual.txt"
    completed = subprocess.run(
        ["bun", "run", "build"],
        cwd=project_root,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        check=False,
    )
    actual_receipt.write_text(completed.stdout, encoding="utf-8")
    require(completed.returncode == 0, f"bun run build failed; see {actual_receipt}")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", required=True, type=Path)
    parser.add_argument(
        "--check-only",
        action="store_true",
        help="Validate recorded receipts without rerunning bun run build; never use for completion.",
    )
    args = parser.parse_args()

    manifest_path = args.manifest.resolve()
    require(manifest_path.is_file(), f"manifest does not exist: {manifest_path}")
    path_under(manifest_path, [SCRATCH_ROOT], "manifest")
    manifest = load_json(manifest_path, "manifest")
    require(manifest.get("schema_version") == 2, "unsupported or missing manifest schema_version")

    scratch_root = absolute_ref(manifest.get("scratch_root"), "scratch_root")
    path_under(scratch_root, [SCRATCH_ROOT], "scratch_root")
    project_root = absolute_ref(manifest.get("project_root"), "project_root")
    require(project_root.is_dir(), f"project_root does not exist: {project_root}")
    roots = [scratch_root, project_root]
    release_epoch, phase_epochs = validate_guard(manifest, scratch_root, project_root)

    creative = manifest.get("creative")
    require(isinstance(creative, dict), "creative must be an object")
    generated_media_required = creative.get("generated_media_required")
    require(isinstance(generated_media_required, bool), "creative.generated_media_required must be boolean")

    requirements = manifest.get("requirements")
    require(isinstance(requirements, dict), "requirements must be an object")
    requirement_inputs = requirements.get("inputs")
    require(isinstance(requirement_inputs, list) and requirement_inputs, "requirements.inputs must be non-empty")
    requirement_keys: set[tuple[str, str]] = set()
    for index, record in enumerate(requirement_inputs):
        path = file_record(record, f"requirements.inputs[{index}]")
        path_under(path, roots, f"requirements.inputs[{index}]")
        role = record.get("role", "")
        require(isinstance(role, str) and role, f"requirements.inputs[{index}] is missing role")
        requirement_keys.add((record["sha256"], role))
    brief_sha = requirements.get("brief_sha256")
    require(isinstance(brief_sha, str) and SHA_RE.fullmatch(brief_sha), "requirements.brief_sha256 is missing")

    seeds = manifest.get("seeds")
    require(isinstance(seeds, dict), "seeds must be an object")
    seed_receipt = nonempty_file(seeds.get("receipt_path"), "seeds.receipt_path")
    path_under(seed_receipt, [scratch_root], "seeds.receipt_path")
    seed_data = load_json(seed_receipt, "seed receipt")
    require(seed_data.get("generator") == "generate-design-seeds.sh", "seed receipt was not produced by the bundled shell generator")
    require(seed_data.get("entropy_source") == "/dev/urandom", "seed receipt does not prove external entropy")
    seed_items = seed_data.get("seeds")
    require(isinstance(seed_items, list) and 3 <= len(seed_items) <= 4, "seed receipt must contain 3 or 4 seeds")
    require(seed_data.get("count") == len(seed_items), "seed count mismatch in receipt")
    values = [item.get("value") for item in seed_items]
    ids = [item.get("id") for item in seed_items]
    require(len(set(values)) == len(values), "seed values are not unique")
    require(len(set(ids)) == len(ids), "seed IDs are not unique")
    for value in values:
        require(isinstance(value, str) and SEED_RE.fullmatch(value), "seed is not a long alphanumeric external value")
    manifest_seed_items = seeds.get("items")
    require(manifest_seed_items == seed_items, "manifest seeds do not match the external seed receipt")
    seed_by_id = {item["id"]: item["value"] for item in seed_items}

    explorers = manifest.get("explorers")
    require(isinstance(explorers, list) and len(explorers) == len(seed_items), "one explorer is required per seed")
    used_subagents: set[str] = set()
    explorer_by_seed: dict[str, dict[str, Any]] = {}
    candidate_hashes: set[str] = set()
    direction_signatures: set[tuple[str, str, str, str]] = set()
    composition_anchors: set[str] = set()
    background_modes: set[str] = set()
    hero_scales: set[str] = set()
    workspace_roots: set[Path] = set()
    for index, explorer in enumerate(explorers):
        label = f"explorer[{index}]"
        require(isinstance(explorer, dict), f"{label} must be an object")
        seed_id = explorer.get("seed_id")
        require(seed_id in seed_by_id, f"{label} has an unknown seed_id")
        require(seed_id not in explorer_by_seed, f"duplicate explorer for {seed_id}")
        explorer_by_seed[seed_id] = explorer
        require(explorer.get("brief_sha256") == brief_sha, f"{label} did not receive the same requirements brief")
        require(explorer.get("frontend_image_skill") == "imagegen-frontend-web", f"{label} did not invoke imagegen-frontend-web")
        workspace_root = absolute_ref(explorer.get("workspace_root"), f"{label}.workspace_root")
        path_under(workspace_root, [scratch_root], f"{label}.workspace_root")
        require(workspace_root.parent == scratch_root / "explorers", f"{label} workspace is not a direct per-seed root")
        require(workspace_root.name == seed_id, f"{label} workspace name is not bound to its seed")
        require(workspace_root not in workspace_roots, f"{label} reuses another explorer workspace")
        workspace_roots.add(workspace_root)
        seed_packet = file_record(explorer.get("seed_packet"), f"{label}.seed_packet")
        path_under(seed_packet, [workspace_root], f"{label}.seed_packet")
        packet = load_json(seed_packet, f"{label} seed packet")
        require(packet.get("seed_id") == seed_id, f"{label} seed packet has the wrong seed_id")
        require(packet.get("seed_value") == seed_by_id[seed_id], f"{label} seed packet has the wrong seed value")

        input_records = explorer.get("inputs")
        require(isinstance(input_records, list), f"{label}.inputs must be a list")
        input_keys: set[tuple[str, str]] = set()
        for input_record in input_records:
            path = file_record(input_record, f"{label}.inputs")
            path_under(path, [workspace_root], f"{label}.inputs")
            text = str(path).lower()
            require(not any(term in text for term in FORBIDDEN_EXPLORER_TERMS), f"{label} received forbidden context: {path}")
            require("seeds.json" not in text, f"{label} received the parent seed receipt")
            role = input_record.get("role", "")
            require(isinstance(role, str) and role, f"{label}.inputs has an unlabelled input")
            input_keys.add((input_record["sha256"], role))
        require(input_keys == requirement_keys, f"{label} did not receive exactly the shared requirements inputs in its own root")
        forbidden = explorer.get("forbidden_context", [])
        require(isinstance(forbidden, list), f"{label}.forbidden_context must be a list")
        require(all(term in forbidden for term in FORBIDDEN_EXPLORER_TERMS), f"{label} did not declare all forbidden context")

        provenance = explorer.get("provenance")
        explorer_receipt, explorer_transcript, raw = validate_provenance(provenance, label, "explorer", roots, used_subagents)
        path_under(explorer_receipt, [workspace_root], f"{label}.provenance.receipt_path")
        candidate = explorer.get("candidate")
        candidate_path = file_record(candidate, f"{label}.candidate")
        path_under(candidate_path, [workspace_root], f"{label}.candidate")
        require(candidate_path.stat().st_size >= 100, f"{label} candidate is too small to be a rendered artifact")
        try:
            candidate_bytes = candidate_path.read_bytes()
            require(seed_by_id[seed_id].encode() not in candidate_bytes, f"{label} exposes the raw seed in its candidate artifact")
        except OSError as exc:
            fail(f"{label} candidate cannot be read: {exc}")
        require(candidate.get("real_content") is True, f"{label} candidate did not use real content")
        viewport = candidate.get("viewport")
        require(isinstance(viewport, dict) and viewport.get("width", 0) >= 320 and viewport.get("height", 0) >= 400, f"{label} candidate has no real viewport")
        require(candidate.get("kind") in {"prototype-screenshot", "high-fidelity-comp"}, f"{label} candidate is not a rendered prototype or comp")
        image_receipt = nonempty_file(explorer.get("visualization_receipt"), f"{label}.visualization_receipt")
        path_under(image_receipt, [workspace_root], f"{label}.visualization_receipt")
        image_receipt_text = image_receipt.read_text(encoding="utf-8")
        require("imagegen-frontend-web" in image_receipt_text, f"{label} visualization receipt has no imagegen-frontend-web proof")
        require(str(candidate_path) in image_receipt_text and candidate["sha256"] in image_receipt_text, f"{label} visualization receipt is not bound to its candidate")

        result = find_explorer_result(raw, seed_id, str(candidate_path))
        require(result is not None, f"{label} raw receipt has no structured child result")
        require(result.get("status") in {"completed", "success"}, f"{label} child result is incomplete: {result.get('status')}")
        require(result.get("workspace_root") == str(workspace_root), f"{label} child result has the wrong workspace_root")
        require(result.get("seed_value") == seed_by_id[seed_id], f"{label} child result has the wrong seed value")
        require(result.get("frontend_image_skill") == "imagegen-frontend-web", f"{label} child result has no frontend image skill")
        require(result.get("real_content") is True, f"{label} child result did not use real content")
        require(result.get("candidate_sha256") == candidate["sha256"], f"{label} child result has the wrong candidate hash")
        require(candidate["sha256"] not in candidate_hashes, f"{label} reused another candidate artifact")
        candidate_hashes.add(candidate["sha256"])

        idea_set = result.get("idea_set")
        require(isinstance(idea_set, list) and 8 <= len(idea_set) <= 12, f"{label} needs 8-12 terse concepts before visualization")
        require(all(isinstance(idea, str) and 1 <= len(idea.strip()) <= 220 for idea in idea_set), f"{label} idea set contains empty or over-specified concepts")
        shortlist = result.get("shortlist")
        require(isinstance(shortlist, list) and len(shortlist) >= 2, f"{label} needs at least two shortlisted concepts")
        require(all(concept in idea_set for concept in shortlist), f"{label} shortlist contains a concept not present in its idea set")
        require(result.get("selected_concept") in shortlist, f"{label} has no selected concept from its shortlist")

        seed_reading = result.get("seed_reading")
        validate_seed_reading(seed_reading, seed_by_id[seed_id], label)
        direction = result.get("direction")
        require(isinstance(direction, dict), f"{label} direction is missing")
        direction_values = []
        for field in ("composition_anchor", "hero_scale", "background_mode", "media_role"):
            value = direction.get(field)
            require(isinstance(value, str) and value.strip(), f"{label} direction is missing {field}")
            direction_values.append(value.strip().lower())
        direction_signature = tuple(direction_values)
        require(direction_signature not in direction_signatures, f"{label} direction signature is identical to another candidate")
        direction_signatures.add(direction_signature)
        composition_anchors.add(direction_values[0])
        hero_scales.add(direction_values[1])
        background_modes.add(direction_values[2])
        require(isinstance(direction.get("concept"), str) and direction["concept"].strip(), f"{label} direction has no concept")
        require(isinstance(direction.get("emotional_target"), str) and direction["emotional_target"].strip(), f"{label} direction has no emotional target")

        transcript_text = explorer_transcript.read_text(encoding="utf-8")
        generated_media = result.get("generated_media", [])
        require(isinstance(generated_media, list), f"{label}.generated_media must be a list")
        if generated_media_required:
            require(generated_media, f"{label} has no generated or approved media receipt for a visual brief")
        for media_index, media in enumerate(generated_media):
            media_label = f"{label}.generated_media[{media_index}]"
            require(isinstance(media, dict), f"{media_label} must be an object")
            media_path = file_record(media, media_label)
            path_under(media_path, [workspace_root], media_label)
            require(media_path.suffix.lower() in RASTER_EXTENSIONS, f"{media_label} is not a raster artifact")
            require(media.get("generator") in ALLOWED_EXPLORER_GENERATORS, f"{media_label} has no approved generator")
            media_receipt = file_record(media.get("receipt"), f"{media_label}.receipt")
            path_under(media_receipt, [workspace_root], f"{media_label}.receipt")
            media_receipt_text = media_receipt.read_text(encoding="utf-8")
            require(str(media_path) in media_receipt_text and media["sha256"] in media_receipt_text, f"{media_label}.receipt is not bound to its artifact")
            if media.get("generator") == "codex":
                require("codex" in transcript_text.lower() and "image_gen" in transcript_text.lower(), f"{media_label} claims Codex without image_gen transcript proof")

        raw_text = json.dumps(raw, sort_keys=True)
        combined_text = transcript_text + "\n" + raw_text
        require("seeds.json" not in combined_text, f"{label} transcript or receipt exposes the parent seed receipt")
        for forbidden_term in FORBIDDEN_EXPLORER_TERMS:
            require(forbidden_term not in combined_text.lower(), f"{label} transcript or receipt exposes forbidden context: {forbidden_term}")
        require(seed_by_id[seed_id] in transcript_text, f"{label} transcript does not prove it inspected its exact seed")
        for foreign_id, foreign_value in seed_by_id.items():
            if foreign_id != seed_id:
                require(foreign_id not in combined_text, f"{label} was contaminated by foreign seed id {foreign_id}")
                require(foreign_value not in combined_text, f"{label} was contaminated by foreign seed value")
        if generated_media_required:
            require("codex" in transcript_text.lower() or "imagegen" in transcript_text.lower() or "nano-banana" in transcript_text.lower(), f"{label} transcript has no real media-generation route")
        require_transcript_markers(
            explorer_transcript,
            (seed_id, seed_by_id[seed_id], str(candidate_path), candidate["sha256"], "imagegen-frontend-web"),
            label,
        )

    require(set(explorer_by_seed) == set(seed_by_id), "explorer seed coverage is incomplete")
    require(len(candidate_hashes) == len(seed_items), "candidate artifacts are not unique")
    require(len(direction_signatures) == len(seed_items), "seeded candidates do not have distinct direction signatures")
    require(len(composition_anchors) >= 2, "seeded exploration reused one composition anchor")
    require(len(background_modes) >= 2, "seeded exploration reused one background mode")
    require(len(hero_scales) >= 2, "seeded exploration reused one hero scale")

    taste = manifest.get("taste")
    require(isinstance(taste, dict), "taste must be an object")
    presentation = file_record(taste.get("presentation"), "taste.presentation")
    path_under(presentation, [scratch_root], "taste.presentation")
    reactions = nonempty_file(taste.get("reactions_path"), "taste.reactions_path")
    path_under(reactions, [scratch_root], "taste.reactions_path")
    prompt = nonempty_file(taste.get("ambitious_prompt_path"), "taste.ambitious_prompt_path")
    path_under(prompt, [scratch_root], "taste.ambitious_prompt_path")
    comparison = file_record(taste.get("comparison"), "taste.comparison")
    path_under(comparison, [scratch_root], "taste.comparison")
    for label, path in (("taste.presentation", presentation), ("taste.comparison", comparison), ("taste.reactions_path", reactions), ("taste.ambitious_prompt_path", prompt)):
        require(path.stat().st_mtime <= release_epoch + 2, f"{label} was written after taste calibration released the guard")
    comparison_text = comparison.read_text(encoding="utf-8").lower()
    require(len(comparison_text.strip()) >= 160, "taste comparison is too thin to compare candidates")
    for marker in ("composition", "hero", "background", "media", "seed"):
        require(marker in comparison_text, f"taste comparison is missing visible {marker} differences")

    candidate_reviews = taste.get("candidate_reviews")
    require(isinstance(candidate_reviews, list) and len(candidate_reviews) == len(seed_items), "taste must include one parent visual review per candidate")
    reviewed_seeds: set[str] = set()
    for index, review in enumerate(candidate_reviews):
        label = f"taste.candidate_reviews[{index}]"
        require(isinstance(review, dict), f"{label} must be an object")
        seed_id = review.get("seed_id")
        require(seed_id in seed_by_id and seed_id not in reviewed_seeds, f"{label} has an invalid or duplicate seed_id")
        reviewed_seeds.add(seed_id)
        explorer = explorer_by_seed[seed_id]
        candidate = explorer["candidate"]
        require(review.get("candidate_sha256") == candidate["sha256"], f"{label} reviewed a different candidate hash")
        require(review.get("candidate_path") == candidate["path"], f"{label} reviewed a different candidate path")
        require(review.get("tool") == "functions.vision_analyze", f"{label} did not use vision_analyze")
        require(review.get("reviewed_by_parent") is True, f"{label} is not a parent review")
        receipt = file_record(review.get("review_receipt"), f"{label}.review_receipt")
        path_under(receipt, [scratch_root], f"{label}.review_receipt")
        review_text = receipt.read_text(encoding="utf-8")
        require(candidate["sha256"] in review_text and candidate["path"] in review_text, f"{label} receipt does not bind the candidate hash and path")
        require("vision_analyze" in review_text.lower() and len(review_text.strip()) >= 80, f"{label} receipt has no actual visual analysis")
        require(receipt.stat().st_mtime <= release_epoch + 2, f"{label} was written after taste calibration released the guard")
    require(reviewed_seeds == set(seed_by_id), "parent visual review coverage is incomplete")

    require(taste.get("reaction_source") == "user", "taste calibration must contain user reactions")
    require(taste.get("user_confirmed") is True, "user did not confirm the selected direction")
    selected_seed = taste.get("selected_seed_id")
    require(selected_seed in seed_by_id, "taste selected an unknown seed")
    selected_candidate = explorer_by_seed[selected_seed]["candidate"]
    require(taste.get("selected_candidate_sha256") == selected_candidate["sha256"], "taste did not record the selected candidate hash")
    reaction_text = reactions.read_text(encoding="utf-8").lower()
    require("exciting" in reaction_text and ("avoid" in reaction_text or "not" in reaction_text), "taste reactions need concrete positive and negative feedback")
    prompt_text = prompt.read_text(encoding="utf-8")
    require(selected_seed in prompt_text and selected_candidate["sha256"] in prompt_text, "ambitious prompt is not bound to the selected candidate")
    require(taste.get("rejected_directions_recorded") is True, "rejected directions were not recorded")

    identity = manifest.get("identity")
    identity_path = file_record(identity, "identity")
    path_under(identity_path, [project_root], "identity")
    require(identity_path.stat().st_mtime >= release_epoch - 1, "durable identity was written before taste calibration")
    identity_text = identity_path.read_text(encoding="utf-8").lower()
    require(selected_candidate["sha256"] in identity_text, "durable identity does not record the selected candidate hash")
    for field in REQUIRED_IDENTITY_FIELDS:
        require(field in identity_text, f"identity is missing durable field: {field}")
    for seed_value in seed_by_id.values():
        require(seed_value.lower() not in identity_text, "raw seed leaked into durable identity")

    critic = manifest.get("critic")
    require(isinstance(critic, dict), "critic must be an object")
    critic_prompt = file_record(critic.get("prompt"), "critic.prompt")
    path_under(critic_prompt, [scratch_root], "critic.prompt")
    prompt_hash = critic["prompt"]["sha256"]
    references = critic.get("reference_quality_examples")
    reference_hashes = validate_reference_list(references, "critic.reference_quality_examples", roots)
    iterations = critic.get("iterations")
    require(isinstance(iterations, list) and iterations, "critic.iterations must be non-empty")
    critic_ids: set[str] = set()
    iteration_scores: list[float] = []
    iteration_directions: list[str] = []
    last_critic_hashes: set[str] = set()
    for index, iteration in enumerate(iterations):
        label = f"critic.iteration[{index}]"
        require(isinstance(iteration, dict), f"{label} must be an object")
        require(iteration.get("prompt_sha256") == prompt_hash, f"{label} changed the critic prompt")
        require(iteration.get("reference_hashes") == reference_hashes, f"{label} changed the reference-quality baseline")
        direction_id = iteration.get("direction_id")
        require(isinstance(direction_id, str) and direction_id, f"{label} is missing direction_id")
        iteration_directions.append(direction_id)
        provenance = iteration.get("provenance")
        _, critic_transcript, raw = validate_provenance(provenance, label, "critic", roots, used_subagents)
        critic_ids.add(provenance["subagent_id"])
        screenshots = iteration.get("input_screenshots")
        require(isinstance(screenshots, list) and screenshots, f"{label}.input_screenshots is empty")
        screenshot_hashes: list[str] = []
        widths: set[int] = set()
        for screenshot_index, screenshot in enumerate(screenshots):
            shot_path = file_record(screenshot, f"{label}.input_screenshots[{screenshot_index}]")
            path_under(shot_path, [scratch_root], f"{label}.input_screenshots[{screenshot_index}]")
            screenshot_hashes.append(screenshot["sha256"])
            require(shot_path.stat().st_mtime >= phase_epochs["critic_started"] - 1, f"{label}.input_screenshots were captured before critic_started")
            viewport = screenshot.get("viewport", {})
            widths.add(int(viewport.get("width", 0)))
        require(375 in widths and 1440 in widths, f"{label} must review narrow and desktop renders")
        aesthetic_target = file_record(iteration.get("aesthetic_target"), f"{label}.aesthetic_target")
        path_under(aesthetic_target, roots, f"{label}.aesthetic_target")
        report = find_critic_report(raw)
        require(report is not None, f"{label} has no structured child critic report")
        score = report["score"]
        require(0 <= score <= 10, f"{label} score is outside 0-10")
        require(float(iteration.get("score", -1)) == float(score), f"{label} manifest score does not match child report")
        reported_hashes = report.get("screenshot_hashes")
        require(set(reported_hashes) == set(screenshot_hashes), f"{label} reviewed different screenshots than recorded")
        require(report.get("fresh_context") is True, f"{label} was not fresh")
        require(report.get("code_provided") is False, f"{label} received code")
        require(report.get("implementation_details_provided") is False, f"{label} received implementation details")
        require(report.get("earlier_criticism_provided") is False, f"{label} received earlier criticism")
        require(iteration.get("report_source") == "delegate_task_result", f"{label} did not use child-tool output as report source")
        require("report_path" not in iteration, f"{label} cannot use a parent-authored critic JSON file")
        require(contains_pair(raw, "score", score), f"{label} raw receipt has no child score")
        require_transcript_markers(
            critic_transcript,
            tuple(screenshot_hashes) + (str(score), "fresh_context", "code_provided"),
            label,
        )
        iteration_scores.append(float(score))
        last_critic_hashes = set(screenshot_hashes)

    require(iteration_scores[-1] >= 9.0, f"final independent critic score is {iteration_scores[-1]:.1f}, below 9.0")

    resets = critic.get("resets", [])
    require(isinstance(resets, list), "critic.resets must be a list")
    reset_after = {int(reset.get("after_iteration", -1)): reset for reset in resets}
    streak = 0
    previous_direction = None
    previous_score = None
    for index, (direction, score) in enumerate(zip(iteration_directions, iteration_scores), start=1):
        if direction == previous_direction and previous_score is not None and score <= previous_score:
            streak += 1
        else:
            streak = 0
        if streak >= 2:
            reset = reset_after.get(index)
            require(reset is not None, f"two non-converging iterations ended at {index} without reset or exploration return")
            require(reset.get("mode") in {"structural_reset", "return_to_exploration"}, f"invalid reset mode after iteration {index}")
            require(reset.get("new_direction_id") and reset.get("new_direction_id") != direction, f"reset after iteration {index} did not change direction")
            change = file_record(reset.get("structural_change"), f"reset[{index}].structural_change")
            path_under(change, [scratch_root, project_root], f"reset[{index}].structural_change")
            orphan = nonempty_file(reset.get("orphan_sweep_receipt"), f"reset[{index}].orphan_sweep_receipt")
            path_under(orphan, [scratch_root], f"reset[{index}].orphan_sweep_receipt")
            streak = 0
        previous_direction = direction
        previous_score = score

    delivery = manifest.get("delivery")
    require(isinstance(delivery, dict), "delivery must be an object")
    before = file_record(delivery.get("before"), "delivery.before")
    after = file_record(delivery.get("after"), "delivery.after")
    path_under(before, [scratch_root], "delivery.before")
    path_under(after, [scratch_root], "delivery.after")
    comparison = file_record(delivery.get("comparison"), "delivery.comparison")
    path_under(comparison, [scratch_root], "delivery.comparison")
    for label, path in (("delivery.before", before), ("delivery.after", after), ("delivery.comparison", comparison)):
        require(path.stat().st_mtime >= phase_epochs["delivery_started"] - 1, f"{label} was captured before delivery_started")
    require(delivery.get("selected") in {"before", "after"}, "delivery.selected must choose the rendered stronger version")
    summary = nonempty_file(delivery.get("subtractive_summary"), "delivery.subtractive_summary")
    path_under(summary, [scratch_root], "delivery.subtractive_summary")
    summary_text = summary.read_text(encoding="utf-8").lower()
    require("remove" in summary_text or "consolidat" in summary_text, "subtractive summary does not describe removal or consolidation")
    tell_pass = file_record(delivery.get("ai_tell_pass"), "delivery.ai_tell_pass")
    path_under(tell_pass, [scratch_root], "delivery.ai_tell_pass")
    tell_text = tell_pass.read_text(encoding="utf-8").lower()
    require("output" in tell_text and "tell" in tell_text, "AI-tell pass is not output-specific")
    final_screenshots = delivery.get("final_screenshots")
    require(isinstance(final_screenshots, list) and final_screenshots, "delivery.final_screenshots is empty")
    final_hashes = {record["sha256"] for record in final_screenshots}
    for index, record in enumerate(final_screenshots):
        shot_path = file_record(record, f"delivery.final_screenshots[{index}]")
        path_under(shot_path, [scratch_root], f"delivery.final_screenshots[{index}]")
    require(final_hashes == last_critic_hashes, "final critic did not review the final subtractive output")
    require(delivery.get("synthetic_replaces_client_work") is False, "synthetic media replaced portfolio evidence")

    media_required = delivery.get("production_media_required")
    require(isinstance(media_required, bool), "delivery.production_media_required must be boolean")
    media_routes = delivery.get("media_routes", [])
    require(isinstance(media_routes, list), "delivery.media_routes must be a list")
    if media_required:
        require(media_routes, "selected identity requires production media but no routed skill was invoked")
    for index, route in enumerate(media_routes):
        label = f"delivery.media_routes[{index}]"
        require(isinstance(route, dict), f"{label} must be an object")
        require(route.get("skill") in ALLOWED_MEDIA_SKILLS, f"{label} uses an unregistered media skill")
        receipt = nonempty_file(route.get("receipt_path"), f"{label}.receipt_path")
        path_under(receipt, [scratch_root], f"{label}.receipt_path")
        artifacts = route.get("artifacts", [])
        require(isinstance(artifacts, list) and artifacts, f"{label}.artifacts is empty")
        for artifact_index, artifact in enumerate(artifacts):
            artifact_path = file_record(artifact, f"{label}.artifacts[{artifact_index}]")
            path_under(artifact_path, roots, f"{label}.artifacts[{artifact_index}]")
        if route.get("skill") == "ai-video-director":
            for field in ("poster", "static_fallback", "reduced_motion_path"):
                fallback = file_record(route.get(field), f"{label}.{field}")
                path_under(fallback, roots, f"{label}.{field}")

    verification = manifest.get("verification")
    require(isinstance(verification, dict), "verification must be an object")
    browser = verification.get("browser_evidence")
    require(isinstance(browser, list) and browser, "verification.browser_evidence is empty")
    browser_widths: set[int] = set()
    for index, evidence in enumerate(browser):
        label = f"verification.browser_evidence[{index}]"
        require(isinstance(evidence, dict), f"{label} must be an object")
        require(evidence.get("tool") in ALLOWED_BROWSER_TOOLS, f"{label} has no approved browser tool")
        receipt = nonempty_file(evidence.get("receipt_path"), f"{label}.receipt_path")
        path_under(receipt, [scratch_root], f"{label}.receipt_path")
        require(receipt.stat().st_mtime >= phase_epochs["qa_started"] - 1, f"{label}.receipt_path was written before qa_started")
        screenshot = file_record(evidence.get("screenshot"), f"{label}.screenshot")
        path_under(screenshot, [scratch_root], f"{label}.screenshot")
        require(screenshot.stat().st_mtime >= phase_epochs["qa_started"] - 1, f"{label}.screenshot was captured before qa_started")
        viewport = evidence.get("viewport", {})
        width = int(viewport.get("width", 0))
        require(width > 0, f"{label} has no viewport width")
        browser_widths.add(width)
        require(isinstance(evidence.get("route"), str) and evidence["route"], f"{label} has no route")
        require(isinstance(evidence.get("state"), str) and evidence["state"], f"{label} has no state")
    require({375, 768, 1440}.issubset(browser_widths), "browser evidence must cover 375, 768, and 1440px")

    build_record = verification.get("build")
    build_receipt = nonempty_file(build_record.get("receipt_path") if isinstance(build_record, dict) else None, "verification.build.receipt_path")
    require(build_receipt.stat().st_mtime >= phase_epochs["qa_started"] - 1, "verification build receipt was written before qa_started")
    validate_build(project_root, build_record, args.check_only, scratch_root)
    require(verification.get("routes_verified"), "verification.routes_verified is empty")
    require(verification.get("status") == "complete", "verification status is not complete")

    print(f"PASS: design loop verified for {project_root}")
    print(f"PASS: {len(seed_items)} external seeds, {len(explorers)} isolated explorers, {len(iterations)} critic iterations")
    print(f"PASS: final independent critic score {iteration_scores[-1]:.1f}/10")
    print("PASS: subtraction, output-specific AI-tell pass, browser evidence, and build gate")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except ValidationError as exc:
        print(f"FAIL: {exc}", file=sys.stderr)
        raise SystemExit(1)
