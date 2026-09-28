# Creative Discovery and Seeded Exploration

Use this reference before any execution contract or project implementation. It is an orchestration gate, not a moodboard checklist. Requirements discovery constrains the solution; seeded exploration creates alternatives; user taste selects what deserves implementation.

## State boundary

Do not load `references/style-library.md`, choose a page archetype, or freeze `DESIGN-BRIEF.md` during requirements discovery. The style library is a vocabulary for the selected direction, not an input to isolated explorers.

Use this state order exactly:

```text
requirements packet -> external seeds -> physical explorer roots -> isolated explorers -> rendered candidates -> parent visual comparison -> user taste -> ambitious implementation prompt -> selected identity -> implementation
```

A state transition requires its artifact. Do not advance because the agent has written a plausible explanation. Do not load the style library, scaffold, write project files, start a dev server, run browser QA, or freeze the project brief before the implementation state.

## Requirements packet

Gather only information that constrains the solution:

- audience, site goal, and primary visitor action
- hard brand rules, existing design tokens, supplied references, and legal constraints
- real approved copy, project data, media, and longest realistic content
- required routes, integrations, forms, analytics, and publication boundary
- accessibility, performance, browser, motion, and maintenance requirements
- existing Astro version, architecture, scripts, and deployment contract

Hash the packet and the real-content fixture in the ephemeral run manifest. Pass the same packet and fixture to every explorer. Do not pass style presets, implementation rationale, rejected directions, or other explorer outputs.

## External seeds

Run the bundled script through `terminal`:

```bash
bash <skill-dir>/scripts/generate-design-seeds.sh \
  /mnt/work/hermes-scratch/astro-portfolio-site/<run-id>/seeds.json 4
```

Use 3 or 4 seeds. The script obtains entropy outside the model and writes a receipt containing the generator, entropy source, count, and seed values. Keep the receipt in the ephemeral run directory. Do not copy seed values into the project brief, public content, or implementation prompt after selection.

Use one unique seed per explorer. A seed is an inspiration input, not a permission to violate brand, content, accessibility, performance, or legal constraints. Record the resulting creative cues in ephemeral metadata so the selected identity remains reproducible without exposing the raw seed in durable project documentation.

Stage isolated packets before dispatching children:

```bash
python3 <skill-dir>/scripts/prepare-explorer-roots.py \
  --run-root /mnt/work/hermes-scratch/astro-portfolio-site/<run-id> \
  --requirements /mnt/work/hermes-scratch/astro-portfolio-site/<run-id>/requirements.json \
  --seeds /mnt/work/hermes-scratch/astro-portfolio-site/<run-id>/seeds.json
```

This creates `/explorers/<seed-id>/` roots containing copies of the same requirements/content inputs and exactly one seed packet. Never pass the parent run root, `seeds.json`, or a sibling explorer root to a child. The helper refuses to reuse an existing explorer root.

Start `scripts/exploration-guard.py start` before dispatching children. Run it as a background terminal process against the actual project root, including when the project does not yet exist. It snapshots the pre-exploration state and fails on project writes until taste calibration releases it. While children are pending, the parent may only perform read-only status checks. No scaffolding, source edits, dev server, build, browser screenshots, critic, delivery, identity, or QA work is allowed.

## Explorer launch

Launch one fresh isolated `delegate_task` context per seed. A batch of separate tasks is acceptable when the tool's concurrency limit requires it, but never reuse a context. Give each child its own physical `/explorers/<seed-id>/` root, not the shared run root. Preserve the raw tool result, subagent ID, transcript path, and candidate output schema in the manifest.

After the batch dispatch, yield until the delegation completion arrives. A returned task handle is not completion, and `timeout_after_artifact` is not a valid result. Rerun incomplete seeds in new contexts and roots. Do not continue implementation or QA while waiting.

Give each explorer:

- the exact same requirements packet, content fixture, constraints, and user references
- exactly one seed and no other seed
- the requirement to load and invoke `imagegen-frontend-web` for candidate visualization
- if the normal image path is unavailable, load `autonomous-ai-agents/codex`, create or enter the child workspace as a git repository, and use `terminal` with `pty=true` to run `codex exec --sandbox workspace-write` with an explicit request to use the built-in `image_gen` tool and save the raster into that child root; Codex OAuth is enough, so an unset `OPENAI_API_KEY` is not a blocker. Do not skip imagery or silently fall back to CSS/SVG scenery
- the requirement to generate 8–12 terse, high-level concepts first, shortlist at least two, and then visualize the strongest one
- the requirement to produce one actual first-viewport prototype or high-fidelity visual comp using the real content
- the requirement to return an artifact path, artifact hash, viewport, design direction, and image-generation provenance

Do not give an explorer:

- `references/style-library.md` or generic preset directions
- another explorer's prompt, screenshot, artifact, or output
- rejected directions or earlier criticism
- implementation code, architecture rationale, or CSS decisions from the parent

The explorer prompt may ask for a broad concept, but it must end in a rendered candidate. A prose direction, ASCII composition sketch, token list, or placeholder screenshot fails the exploration gate.

## String Seed of Thought

The seed must influence visible work. Each child must inspect its exact seed for observable repetitions, runs, symmetry/asymmetry, prefix/suffix contrast, character frequency, digit/letter balance, or positional clusters. Require `seed_reading.observations` with at least three concrete evidence values and `seed_reading.derived_decisions` mapping those observations to visible composition, scale, crop, palette, typography, material, media, motion, or section choices. The child must set `raw_seed_exposed_in_candidate_or_site` to false. “The seed inspired an organic mood” is not evidence.

The reading stays in the ephemeral child receipt. It must not appear in the shipped site or durable brief.

## Explorer output contract

Require a structured result from each child tool call:

```json
{
  "seed_id": "seed-01",
  "candidate_artifact": "/mnt/work/hermes-scratch/.../candidate-01.png",
  "candidate_sha256": "...",
  "candidate_kind": "high-fidelity-comp",
  "viewport": {"width": 1440, "height": 900},
  "real_content": true,
  "frontend_image_skill": "imagegen-frontend-web",
  "visualization_receipt": "/mnt/work/hermes-scratch/.../imagegen-receipt.json",
  "generated_media": [{"path": "/mnt/work/hermes-scratch/.../hero.png", "sha256": "...", "generator": "codex", "receipt": "..."}],
  "idea_set": ["short concept 1", "short concept 2"],
  "shortlist": ["short concept 1", "short concept 2"],
  "selected_concept": "short concept 1",
  "seed_reading": {"observations": [], "derived_decisions": []},
  "direction": {
    "concept": "...",
    "emotional_target": "...",
    "composition_anchor": "...",
    "hero_scale": "...",
    "background_mode": "...",
    "media_role": "...",
    "motion_role": "..."
  }
}
```

The parent must save the exact `delegate_task` result as a raw receipt before normalizing it. The verifier accepts explorer provenance only when the receipt, subagent ID, transcript path, isolated-context flag, unique physical workspace root, candidate path, and candidate hash agree. It also requires a completed child result, a breadth-first idea set, a seed reading, a materially distinct direction signature, and any required generated-media receipt. Do not replace the raw receipt with a hand-written summary.

## Parent visual comparison

When all explorers have completed, the parent must inspect every actual candidate image with `vision_analyze`, using the exact paths and hashes. Inspecting receipts alone does not count. Record a comparison that names the visible differences in composition, hero scale, background, product/media role, and seed-derived choices. Reject the set if candidates are near-identical, if seed influence is not visible, or if one candidate was never visually reviewed.

Present all rendered candidates together. Do not present only the agent's preferred option. Keep the raw child receipts, parent review receipts, and the comparison artifact in scratch.

## Taste calibration

Capture the user's reactions in a small run artifact:

- what feels exciting or memorable
- what feels too safe, tacky, busy, cold, or derivative
- which visual or emotional signal should become stronger
- what must not survive into implementation
- which candidate is selected, or whether to return to exploration

Then run the broad-to-deep refinement loop:

1. Ask for many high-level ideas with intentionally little detail.
2. Visualize the strongest ideas.
3. Capture the user's reactions rather than asking for abstract design adjectives.
4. Ask the model to sharpen the selected idea using those reactions.
5. Ask for the ambitious implementation prompt only after the direction is sharpened.

Require the user to select a direction or reject all candidates. If the user is unavailable, stop after presentation with the run incomplete. Do not write an agent-owned identity and later label it taste-calibrated. Do not invent reactions after implementation. Record the selected candidate hash and rejected directions in scratch metadata.

Save failed prompts and rejected directions in ephemeral metadata. They are useful regression material for newer models, but do not put them in the durable project brief.

## Identity freeze

After the user selects a direction and the guard is released with reason `taste_calibrated`, verify the clean guard state, then load the style library as vocabulary and implementation guidance. Record the selected candidate hash and only durable decisions:

- emotional target
- concept spine
- hierarchy and attention order
- composition grammar
- typography
- palette
- material and surface language
- media role
- motion role
- signature treatments
- explicit refusals and anti-patterns

Do not record raw seed values or seed-generation commands in `DESIGN-BRIEF.md`. Keep them in the scratch manifest. Do not freeze the execution contract before this selection and reaction record exist.

## Failure handling

- Missing or timed-out candidate: keep the explorer in `exploration_pending`; rerun it in a new context and physical root.
- Explorer receipt missing, foreign-seed contaminated, or non-isolated: invalidate that candidate and rerun it.
- Missing seed reading, generated media, parent visual review, or materially distinct direction: fail the exploration gate.
- Candidates too similar: generate a new seed batch rather than instructing the same context to “be more creative.”
- User rejects all candidates: return to seeded exploration; do not defend a direction.
- User is unavailable: stop without implementation or completion claim.
- Requirements change after exploration: invalidate affected candidates and begin a new run or new seed batch.
