---
name: astro-portfolio-site
version: 0.4.0
author: Hermes
description: Explore, build, verify distinctive Astro portfolio sites.
metadata:
  hermes:
    tags:
      - Astro
      - Standalone Websites
      - Design Systems
      - Visual QA
      - Cloudflare Pages
---

# Astro Standalone Website Builder

Use this for standalone websites: portfolios, studios, small businesses, marketing sites, editorial sites, blogs, and campaigns. Run it as a state machine, not as a style checklist:

requirements discovery -> seeded creative exploration -> taste calibration -> identity freeze -> Astro implementation -> independent critique -> subtractive delivery -> Astro QA -> handoff.

Do not claim a later state without the artifact and provenance required by the earlier state. Do not deploy without an explicit request.

## When to Use

- Create, redesign, or polish a standalone website.
- Build an Astro portfolio, studio site, marketing site, blog, editorial site, or campaign page.
- Add content structure, responsive behavior, design tokens, visual QA, or Cloudflare deployment to an Astro site.
- Translate a supplied reference URL, local project, `globals.css`, styleguide, or brand system into an Astro implementation.

## Prerequisites

- A user, audience, outcome, real content, and any existing brand or legal rules.
- For an existing project, inspect `package.json`, README, `AGENTS.md`, Astro config, Wrangler config, styles, content, assets, and scripts with `read_file` and `search_files`.
- For a new project, use the chosen Astro version, the project’s package manager, TypeScript, and only integrations justified by the requirements. Use Bun when it is the project contract. Do not silently change an existing project contract.
- A user available to select a rendered direction. If the user cannot review, stop after candidate presentation; do not implement or claim taste calibration.
- Hermes scratch space at `/mnt/work/hermes-scratch`. Keep the run manifest, guard receipts, explorer roots, and all exploration, review, and comparison artifacts there. Do not add a `.design-loop` directory to the project.
- Load these focused references at their phase: `references/creative-discovery.md`, `references/design-critic.md`, and `references/creative-delivery.md`.
- Preserve and load the existing implementation references on demand: `references/client-interview.md`, `references/design-execution.md`, `references/design-doctrine.md`, `references/style-library.md`, `references/visual-qa.md`, `references/astro-native-architecture.md`, `references/reference-project-patterns.md`, `references/astro-routing.md`, `references/design-system.md`, `references/lumos-derived-standards.md`, `references/component-patterns.md`, `references/deployment-cloudflare.md`, and `templates/design-brief.md`.

## How to Run

Do not begin by writing components or loading the generic style library. Begin with requirements discovery only. Then load `references/creative-discovery.md`, generate external seeds, start the exploration write guard, stage physical per-seed roots, and launch one fresh `delegate_task` context per seed. After dispatch, yield until every child completes; do not scaffold, edit, build, browse, or QA while the batch is pending. Require a rendered candidate, seed reading, and media provenance from every explorer. The parent must visually inspect every candidate before presenting them to the user. Calibrate the selected direction with the user before loading `references/design-execution.md` or `references/style-library.md` to freeze the durable identity.

After implementation, load `references/design-critic.md` and run the independent critic in a fresh context. Then load `references/creative-delivery.md` for routed media, before/after subtraction, and the output-specific AI-tell pass. Finish with the existing Astro-native and visual-QA workflow. The bundled verifier is a hard gate, not a self-reported checklist.

## Quick Reference

- `bun create astro@latest . -- --template minimal --no-install`
- `bun install`
- `bun run dev`
- `bun run build`
- `bun preview`
- `wrangler --version`
- `wrangler whoami`
- `bun run deploy`
- `wrangler pages deploy ./dist --project-name <pages-project> --branch main`
- `bash <skill-dir>/scripts/generate-design-seeds.sh <scratch>/seeds.json 4`
- `python3 <skill-dir>/scripts/prepare-explorer-roots.py --run-root <scratch> --requirements <scratch>/requirements.json --seeds <scratch>/seeds.json`
- `python3 <skill-dir>/scripts/exploration-guard.py start|release|phase|verify ...`
- `codex exec --sandbox workspace-write '<explicit image_gen task>'` (inside a git workspace when Codex is used)
- `python3 <skill-dir>/scripts/verify-design-loop.py --manifest <scratch>/manifest.json`
- `src/content/<collection>`
- `src/content.config.ts`
- `src/pages`
- `getCollection()`
- `getEntry()`
- `render()` from `astro:content`
- `image()` in a content schema
- Astro `Image` for rendered media
- `references/creative-discovery.md`
- `references/design-critic.md`
- `references/creative-delivery.md`
- `references/design-execution.md`
- `references/design-doctrine.md`
- `references/style-library.md`
- `references/visual-qa.md`
- `references/astro-native-architecture.md`
- `references/design-system.md`
- `references/lumos-derived-standards.md`
- `references/component-patterns.md`
- `references/astro-routing.md`
- `templates/design-brief.md`

## Procedure

1. Reconcile the repository before scaffolding. Inspect versions, scripts, content model, layouts, components, tokens, integrations, routes, and deployment contract. Identify the project’s primary styling owner and token source of truth. For greenfield work, use `references/lumos-derived-standards.md` as the default house baseline without installing or copying a framework. For brownfield work, preserve the existing owner and plan incremental adoption only when it reduces complexity. Do not combine Lumos, Tailwind, or another CSS system by default. Reuse existing architecture.
2. Run requirements discovery only. Load `references/client-interview.md`. Gather hard constraints, audience, site goals, real approved content, existing brand rules, accessibility, performance, legal, route, and delivery requirements. Do not choose an aesthetic, load the style library, or write the execution contract yet.
3. Start an ephemeral run. Create a run directory under `/mnt/work/hermes-scratch`, run `scripts/generate-design-seeds.sh` for 3 or 4 external seeds, stage one physical explorer root per seed with `scripts/prepare-explorer-roots.py`, and start `scripts/exploration-guard.py` against the actual project root before dispatch. Keep seed values and raw tool receipts in the manifest, never in `DESIGN-BRIEF.md`.
4. Explore in isolation. Load `references/creative-discovery.md`. Launch one fresh isolated `delegate_task` context per seed, giving each only its own physical explorer root and exactly one seed. Require identical requirements/content inputs, an 8–12 item terse idea set, a shortlist of at least two, a concrete `seed_reading`, a materially distinct direction signature, an actual rendered first-viewport prototype using the same real content, and media provenance. For visual landing/product briefs, require purposeful raster generation; explicitly load `autonomous-ai-agents/codex` and use Codex's built-in `image_gen` through `codex exec` when the normal image path is unavailable rather than skipping images. Do not accept `timeout_after_artifact`. After dispatch, stop all implementation, scaffolding, builds, browser work, criticism, and QA until the batch-completion message arrives.
5. Compare and calibrate taste. After every explorer completes, use `vision_analyze` on every actual candidate screenshot and record the exact hashes and visible differences. Present all candidates together, not just the preferred one. Capture positive and negative user reactions, sharpen one direction, record the selected candidate hash, and write the ambitious implementation prompt. If the user is unavailable, stop with the run incomplete. Do not fabricate reactions or freeze an agent-owned identity as user taste.
6. Define the selected identity. Only after user selection and reactions, release and verify the exploration guard with reason `taste_calibrated`, then mark the phase boundary. Load `references/design-execution.md`, `references/design-doctrine.md`, and `references/style-library.md` only now. Record durable decisions plus the selected candidate hash; keep seeds out of the durable brief. Freeze `DESIGN-BRIEF.md` only after selection.
7. Route visual production. Load `references/creative-delivery.md`. Keep real portfolio work as evidence. Invoke `imagegen`, `nano-banana`, or Codex's built-in `image_gen` for selected raster production and `ai-video-director` for selected video production only when the identity needs them. If the brief needs generated imagery and a real route is unavailable, stop and report the block; never replace the image with CSS gradients, SVG scenery, or stock placeholders. Never replace client work with synthetic client evidence, expose API keys, or make a static Astro site depend on a runtime generation API.
8. Build the selected vertical slice. Mark `implementation_started` only after the guard release. Load `references/astro-native-architecture.md`, `references/astro-routing.md`, `references/design-system.md`, and `references/lumos-derived-standards.md`. Implement the first viewport, priority route, primary action, and one representative detail/content route with real approved content. Use native Astro routing and content collections, real media, explicit mobile recomposition, one canonical token source, one explicit CSS owner, and the existing design-system rules. Start one healthy `bun run dev` process and use HMR for ordinary edits.
9. Run the independent critic loop. Mark `critic_started` at the actual boundary. Load `references/design-critic.md`. Capture rendered screenshots, create the review bundle, and launch a fresh critic context with only the screenshots, aesthetic target, and reference-quality examples. Use the identical critic prompt on every iteration. Do not provide code, implementation details, earlier criticism, or implementation rationale. Completion requires an independent score of at least 9/10. After two non-converging iterations, perform a structural reset or return to exploration. Do not stack incremental CSS patches.
10. Deliver by subtraction. Mark `delivery_started` at the actual boundary. Load `references/creative-delivery.md`. Produce rendered before and after versions by removing or consolidating nonessential labels, containers, copy, decoration, and duplicate actions. Compare the actual renders and keep the stronger one. Run the output-specific AI-tell pass after subtraction, then send the chosen final render through the critic gate again.
11. Run enforced verification. Invoke `scripts/verify-design-loop.py` with the run manifest and the real project. It must validate seed generation, explorer and critic tool provenance, screenshot hashes, critic score, reset behavior, subtraction state, browser evidence, and the actual build. A critic JSON file written by the implementation agent is invalid. A missing artifact or failed state transition means incomplete work.
12. Complete the existing technical QA only after all creative gates pass. Mark `qa_started` at the actual boundary. Load `references/visual-qa.md` and `references/design-system.md`. Verify the rendered first viewport and complete route set at narrow phone, tablet boundary, and desktop widths; direct routes, navigation lifecycle, themes, focus, forms, reduced motion, media fallbacks, console errors, optimized image output, metadata, sitemap/RSS when applicable, empty/error states, and expected `dist` artifacts. Run repository lint and tests when present. A build or HTTP 200 is not visual proof.
13. Expand and hand off only after the slice and gates pass. Centralize tokens, keep components semantic and data-driven, document dev/build/preview/deploy, architecture, content paths, publication rules, environment variables, and known gotchas. Deploy to Cloudflare Pages only after an explicit request; load `references/deployment-cloudflare.md`, authenticate with `wrangler whoami`, and verify the exact public routes and actual deployment URL.

## Pitfalls

- Loading the style library, narrowing the design space, or writing the execution contract before seeded exploration.
- Asking for “unique” without injecting external randomness.
- Reusing one explorer context, one physical workspace, or leaking another candidate, rejection, reference preset, or implementation rationale into an explorer.
- Dispatching explorers and then continuing implementation or QA while they are pending.
- Accepting a timed-out child because it left an artifact, or trusting an after-the-fact exploration receipt.
- Accepting prose, a composition sketch, placeholder copy, or a fake screenshot instead of a rendered candidate with the same real content.
- Passing an opaque seed through a prompt without requiring observable seed reading and visible derived decisions.
- Skipping purposeful raster generation for a visual brief, or silently replacing it with CSS gradients, SVG shapes, or stock filler.
- Treating generated ideas as taste. User reactions must sharpen the selected direction.
- Letting the parent inspect receipts without visually reviewing every candidate, or presenting only the preferred candidate.
- Putting a random seed in `DESIGN-BRIEF.md` or public content.
- Letting the implementer critique its own work or accepting a critic report authored by the implementer.
- Giving the critic code, history, or earlier criticism; changing the critic prompt between iterations; hiding a sub-9 score.
- Stacking CSS patches after two non-converging iterations instead of structurally resetting or returning to exploration.
- Using image generation to fabricate portfolio evidence, or using video without a poster, static fallback, mobile decision, and reduced-motion path.
- Pasting API keys into prompts or source files, committing them, or making runtime generation part of a static Astro build.
- Skipping the rendered before/after subtraction comparison or replacing it with a per-element paperwork ledger.
- Running a generic AI-tell checklist instead of inspecting the actual chosen output.
- Publishing drafts or WIP content used as fixtures.
- Treating a clean build, HTTP 200, or CSS inspection as visual proof.
- Bypassing Astro’s file-based router, silently changing the project version or deploy contract, restarting the dev server after every design edit, or stacking selector overrides instead of repairing the parent layout.
- Treating Lumos as a required dependency, copying its visual defaults or component API, or introducing a second CSS/component owner instead of adopting its underlying principles.
- Assuming tokens, fluid sizing, or framework accessibility claims replace rendered browser verification at real content, zoom, theme, focus, and reduced-motion states.

## Verification

The completion gate is the bundled verifier plus the existing visual-QA matrix. Invoke the verifier through `terminal` against the ephemeral run manifest and project root; do not use its `--check-only` mode for completion. Require a clean released exploration guard, completed isolated explorers with seed readings and distinct direction signatures, parent visual review of every candidate, user-confirmed selection, purposeful media when required, an independent final critic score of at least 9.0, a valid structural reset after two non-converging iterations, rendered browser evidence at narrow/tablet/desktop widths, one explicit CSS owner, one canonical token source, and a real `bun run build` exit code of 0. For projects following the Lumos-derived baseline, also verify fluid sizing, theme inheritance, visible focus, 200% zoom, reduced motion, and cascade behavior in the browser. For deployment, require the exact public-route check and actual URL verification before reporting success.
