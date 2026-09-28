# Creative Delivery and Subtractive Pass

Use this reference after identity selection and during final delivery. It routes visual production to existing skills and turns polish into a rendered comparison rather than a paperwork exercise.

## Route existing media capabilities

Do not create a second generative-media reference or invent local image/video APIs. Route by job:

- Candidate visualization: load and invoke `imagegen-frontend-web` from each isolated explorer; the result must be a real rendered comp.
- Selected raster asset production or editing: load `imagegen`. Use its built-in image path by default.
- Codex image route: when Codex is available, load `autonomous-ai-agents/codex`, use `terminal` with `pty=true`, and explicitly run `codex exec --sandbox workspace-write` inside a git workspace while telling it to use its built-in `image_gen` tool and save the output to the requested raster path. Codex OAuth is sufficient; an unset `OPENAI_API_KEY` is not a reason to skip generation.
- Gemini-native image generation or editing: load `nano-banana` when that model path is selected.
- Video generation, first/last-frame interpolation, or cinematic motion: load `ai-video-director`.

Record the actual skill/tool route, tool receipt, output paths, and asset hashes in the ephemeral run manifest. For a visual landing/product brief, do not silently substitute CSS gradients, SVG scenery, or stock placeholders when purposeful generated imagery was required. Do not write a runtime generation dependency into a static Astro site.

## Portfolio evidence boundary

Real client work, approved project imagery, real credits, and real outcomes remain evidence. Never replace them with synthetic client work. Generated imagery may provide atmosphere, conceptual framing, texture, speculative work, or a visual treatment when the user approves it. Label speculative work accurately and preserve the publication boundary.

Keep generation credentials out of prompts, source files, screenshots, commits, and public assets. Use the existing skill's environment handling and scoped local credentials. Do not copy API-key patterns from external guides into project instructions.

## Image production contract

When the selected identity needs a generated image:

- generate for the actual placement and aspect ratio
- preserve the selected palette, material, crop grammar, and emotional target
- prefer a purposeful subject over a decorative gradient, blob, or fake UI panel
- inspect the output and verify composition, subject, text accuracy when applicable, and invariants
- keep the final approved asset and its provenance receipt in the project or approved asset store
- supply alt text, loading behavior, fallback behavior, and mobile art direction

Do not generate imagery merely to satisfy a count. If real work is the correct material, use it.

## Video production contract

Use video for a specific narrative or interaction job, not because motion is available.

For a layered animated graphic:

- generate the loop with a controlled background
- use the existing production skill's documented matting or background-removal path when needed
- provide a poster, static fallback, mobile decision, and reduced-motion path
- verify the actual rendered frames in the browser

For a transition between interface or product states:

- generate the first keyframe
- generate the next keyframe using the first as a reference
- interpolate between them
- reuse the final frame as the next transition's first frame
- scrub or sequence the transition with scrolling or a gesture only when it improves the selected concept

Never ship video without a failed-load path, no-motion path, and bandwidth decision. Do not let video obscure the offer, work, navigation, or content.

## Rendered subtractive comparison

After the selected slice has passed the first critic loop:

1. Capture the rendered `before` state.
2. Remove or consolidate nonessential labels, containers, copy, decoration, and duplicate actions.
3. Do not add replacement decoration merely because the removed element leaves space.
4. Render the `after` state with the same route, viewport, content, and interaction state.
5. Compare the actual before and after renders.
6. Keep the stronger version and record the comparison artifact, selected version, and short rationale.

Do not require a per-element ledger. A concise subtraction summary and rendered before/after evidence are sufficient. The comparison is invalid if the content, viewport, route, or state changes between captures.

Typical subtraction targets include:

- redundant hero metadata and labels
- decorative glows, gradients, and texture that compete with the subject
- repeated cards, badges, or containers
- duplicate CTA intents
- explanatory copy already carried by imagery
- custom controls that are weaker than native HTML controls
- fake statistics or implementation-status details

## Output-specific AI-tell pass

Run this after subtraction and before final critic review. Inspect the chosen rendered output, not the generic design brief. Record only visible tells that actually occur in this result and the concrete removal or replacement made for each.

Look for familiar defaults such as:

- predictable text-left/image-right composition without a reason
- purple or blue AI gradients
- identical card rows or repeated split sections
- fake product UI, fake metrics, or decorative status labels
- excessive eyebrows, pills, dots, marquees, scroll cues, or version stamps
- generic copy, awkward metaphors, invented precision, or inconsistent voice
- imagery that is ornamental rather than structural
- motion that exists without hierarchy, feedback, storytelling, or state purpose

If no tell appears, record that the output-specific pass found none. Do not manufacture a violation to satisfy a checklist. If a tell appears, remove or restructure it, render again, and send the final state through the independent critic.

## Return to Astro QA

After subtraction and the output-specific pass, return to the existing implementation references. Mark the `delivery_started` phase before this work and `qa_started` only when technical QA actually begins. Technical QA is downstream of exploration, taste, critic, and subtraction; it cannot be used to compensate for missing creative work.
- `references/design-system.md` for tokens, focus, media, and reduced motion
- `references/visual-qa.md` for rendered evidence, responsive widths, states, lifecycle, and technical matrix
- `references/deployment-cloudflare.md` only when deployment is explicitly requested

The creative delivery pass does not replace Astro build, route, accessibility, performance, or deployment verification.
