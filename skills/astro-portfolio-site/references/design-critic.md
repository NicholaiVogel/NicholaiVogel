# Independent Design Critic Loop

Use this reference after the selected vertical slice renders and after the final subtractive pass. The critic is an independent taste lane, not a second explanation from the implementation agent.

## Review bundle

Create an ephemeral review bundle containing only:

- the rendered desktop and narrow screenshots for the exact state under review
- the selected aesthetic target and concept spine
- the fixed reference-quality examples or moodboard
- screenshot dimensions and SHA-256 hashes

Do not include source code, DOM dumps, CSS, implementation details, previous screenshots, earlier criticism, rejected directions, or the implementer's rationale. A screenshot may be accompanied by its route and state, but the critic must judge the rendered result rather than the implementation.

Use the same reference examples and the same critic prompt for every iteration of one direction. Reference examples establish a quality baseline and moodboard; they are not a request to copy another design.

## Critic launch

Launch the critic in a fresh isolated `delegate_task` context for every iteration. Use a capable review model for this role and keep implementation work in the implementer lane. Do not ask the critic to redesign the page or inspect the repository.

Use this prompt unchanged, apart from inserting the review bundle and aesthetic target:

```text
Review the rendered design in the attached review bundle.

Judge it against the stated aesthetic target and the reference-quality examples. Imagine how a top design studio would execute this aesthetic, then identify the largest gaps between that bar and the current result.

Evaluate both high-level structure and fine details:
- composition, hierarchy, rhythm, and attention order
- specificity, point of view, and concept coherence
- typography, spacing, material, image treatment, and interaction cues
- fit with the actual content and intended visitor task
- patterns that feel overdone, excessive, copied, or obviously AI-generated

Be tight, specific, bold, and opinionated. Do not give vague encouragement. Do not inspect or infer implementation details. Return JSON with:
- score: a number from 0 to 10
- screenshot_hashes: the hashes reviewed
- largest_gaps: the three most important gaps
- ai_tells: visible output-specific tells
- next_actions: concrete changes for the implementer
- fresh_context: true
- code_provided: false
- implementation_details_provided: false
- earlier_criticism_provided: false
```

Do not mention the 9/10 completion threshold in the critic prompt. The outer verifier owns that gate. Do not alter the prompt to obtain a better score.

## Critic output and provenance

Require the structured JSON as the `delegate_task` output. Save the exact raw tool result, subagent ID, transcript path, prompt hash, review bundle hash, screenshot hashes, and reference-example hashes in the run manifest.

The verifier reads the report from the raw child-tool receipt and matches its screenshot hashes and score. A `critic.json` or score file written by the implementation agent is never authoritative and must not satisfy the gate. Do not use a parent-authored summary as a substitute for the child result.

Require these provenance properties:

```json
{
  "tool": "functions.delegate_task",
  "role": "critic",
  "call_id": "...",
  "subagent_id": "...",
  "isolated": true,
  "receipt_path": "/mnt/work/hermes-scratch/.../critic-result.json",
  "transcript_path": "/home/.../.hermes/...transcript...",
  "prompt_sha256": "..."
}
```

Use a different subagent ID for every critic iteration and never reuse an explorer context as the critic. The raw receipt must contain the same subagent ID and transcript path recorded in the manifest.

## Iteration and stopping

Run the critic on the rendered output, apply only its highest-value findings, and render again. Do not stack several speculative CSS overrides before another review.

Use the same critic prompt each time. Stop normally only when the independent final score is at least 9.0 and the existing P0/P1 technical checks also pass.

Define non-convergence as two consecutive iterations of one direction whose score does not improve. After two such iterations, do one of the following:

- perform a structural reset: replace the parent composition or component boundary in one pass, remove the superseded schema/frontmatter/CSS, sweep orphans, and render a new direction ID; or
- return to seeded exploration and select a different candidate or seed.

Record the reset event, old and new direction IDs, structural-change receipt, orphan sweep receipt, and the new screenshots. Do not continue the same direction with incremental patches after the reset threshold.

A score below 9.0 is incomplete. If the direction is not converging, report the incomplete state or reset. Never hide the score, invent convergence, or claim that a build succeeded in place of independent design evidence.

## Final review order

Run the final critic after the selected subtractive before/after result and output-specific AI-tell pass. The last critic input hashes must match the final rendered screenshots that the user will review. If subtraction makes the score worse, keep the stronger rendered version or return to the delivery pass; do not rationalize the regression.
