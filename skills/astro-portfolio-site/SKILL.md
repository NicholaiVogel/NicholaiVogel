---
name: astro-portfolio-site
version: 0.1.0
author: Hermes
description: Interview and build Astro sites with visual QA.
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

Use this as the safe default for standalone websites: portfolios, studios, small businesses, marketing sites, editorial sites, blogs, and campaigns. It turns a client conversation into a defended design brief, translates that brief into an execution contract, builds an Astro-native vertical slice, and expands only after visual and technical QA. It does not replace a product-app workflow or deploy without an explicit request.

## When to Use

- The user asks to create, redesign, or polish a standalone website.
- The user says they have a website to design for a client, studio, business, artist, or project.
- The user wants an Astro portfolio, marketing site, blog, editorial site, or campaign page.
- An existing Astro site needs a design system, content structure, responsive pass, or Cloudflare deployment.
- A user provides a style reference, `globals.css`, design system, brand assets, or an existing site to learn from.

## Prerequisites

- A client, audience, outcome, or project idea to interview; “I do not know” is a valid answer.
- For an existing project, inspect `package.json`, README, `AGENTS.md`, Astro config, Wrangler config, styles, content, assets, and existing scripts with `read_file` and `search_files`.
- For a new project, use the project’s chosen Astro version, Bun, TypeScript, and the integrations justified by the brief. Do not silently upgrade or downgrade an existing project.
- Cloudflare authentication only for deployment: `wrangler whoami` must identify an account, or the user must provide the documented login/token setup.
- Load references on demand with `skill_view`: `references/client-interview.md`, `references/design-execution.md`, `references/design-doctrine.md`, `references/style-library.md`, `references/visual-qa.md`, `references/astro-native-architecture.md`, `references/reference-project-patterns.md`, `references/astro-routing.md`, `references/design-system.md`, `references/component-patterns.md`, `references/deployment-cloudflare.md`, and `templates/design-brief.md`.

## How to Run

Invoke this skill through Hermes. Do not begin by writing components. Begin with a short `Design Read` and a bounded interview. After the brief is accepted, derive the execution contract, build one representative vertical slice using real content, run the dev server once, perform browser QA, and only then expand the site. Use `read_file`, `search_files`, `web_search`, `web_extract`, and `vision_analyze` to inspect sources; use `write_file`, `patch`, and `terminal` to create and verify the site.

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
- `src/content/<collection>`
- `src/content.config.ts`
- `src/pages`
- `getCollection()`
- `getEntry()`
- `render()` from `astro:content`
- `image()` in a content schema
- Astro `Image` for rendered media
- `references/client-interview.md`
- `references/design-execution.md`
- `references/design-doctrine.md`
- `references/style-library.md`
- `references/visual-qa.md`
- `references/astro-native-architecture.md`
- `references/design-system.md`
- `references/component-patterns.md`
- `references/astro-routing.md`
- `references/deployment-cloudflare.md`
- `templates/design-brief.md`

## Procedure

1. Reconcile the working context before scaffolding. Inspect the repository’s version, scripts, content model, layouts, components, design tokens, integrations, and deployment contract. Reuse the existing architecture when it already solves the requirement. Do not create a parallel app or replace a project convention merely because a generic scaffold is easier.
2. Interview before implementation. Load `references/client-interview.md`. Run bounded frontier-based rounds covering outcome, audience, content, information architecture, visual references, behavior, quality, and delivery. Summarize decisions after each round. Stop when only low-impact polish is unresolved. Do not add questions to make the user design the page; when prose cannot settle a visual choice, prototype alternatives.
3. Translate the brief into an execution contract. Load `references/design-execution.md`. Classify the content mode, choose the page archetype, define the first-viewport job, establish hierarchy and composition, and state responsive and interaction behavior. Measure real content geometry (longest title, media orientation, content volume) before choosing a hero pattern. The agent owns reasonable low-impact design decisions. Record anti-patterns and rejected directions so the implementation does not drift into generic hero/card/gradient defaults.
4. Run the art-direction pass. Load `references/design-doctrine.md` and `references/style-library.md`. Derive three genuinely different candidates from the brief and include a custom-reference candidate when the user supplies a URL, local project, styleguide, palette, or `globals.css`. Present each direction with a concrete composition sketch — element order, grid proportions, type treatment — not adjectives alone. Answer the beauty bar (dominant idea, attention order, point of view, signature moves) before presenting. Record the chosen direction, overrides, and rejected options.
5. Freeze `DESIGN-BRIEF.md`. Load `templates/design-brief.md`. Include the execution contract, content mode, route map, real-content fixture, token decisions, asset rules, publication boundary, accessibility and performance rules, Cloudflare target, vertical-slice scope, and acceptance matrix. Low-impact unknowns become explicit assumptions rather than more interview rounds.
6. Use Astro-native architecture first. Load `references/astro-native-architecture.md` and `references/astro-routing.md`. Public routes belong under `src/pages` and use Astro’s file-based router, `getStaticPaths()`, `Astro.params`, and normal HTML `<a>` links. Repeated Markdown or MDX belongs under `src/content/<collection>` with the project’s native content configuration, `getCollection()` or `getEntry()`, and `render()`. Colocated images use the content schema’s `image()` and Astro’s `Image` pipeline. Do not create a `.local-writing` loader or preparation script when native content collections can satisfy the requirement.
7. Establish the dev loop once. Invoke `bun run dev` through the `terminal` tool, keep one healthy process running, and use Astro’s hot reload/HMR for CSS, components, content, and assets. Do not restart after ordinary design edits. Restart only for dependency changes, Astro/Vite/Wrangler configuration, environment changes, or an actual server failure. Verify that HMR is working instead of assuming it.
8. Build a vertical slice before broad implementation. Implement the first viewport, the primary route, and one representative detail/content route with real approved content. Include long titles, real prose, real lists, real links, and representative media where applicable. Do not polish secondary pages while the primary slice still has layout, hierarchy, content-rendering, or state defects.
9. Run visual QA and self-critique. Load `references/visual-qa.md`. Design QA comes first: inspect the rendered first viewport against the execution contract — hierarchy, rhythm, emphasis, grouping, the beauty bar — at desktop and narrow widths with real content. Then run the conditional technical matrix rows the project uses (themes, interaction states, media-heavy checks). Fix P0 and P1 defects before asking the user to review the direction.
10. Expand the approved system. Centralize tokens in `global.css`, keep components semantic and data-driven, and apply the same execution contract across routes. If two patches target the same layout defect, stop stacking overrides and diagnose the parent layout or component boundary. Use React, GSAP, smooth scrolling, cursors, or view transitions only when they improve the stated outcome and have lifecycle-safe reduced-motion paths.
11. Verify the complete site. Run `bun run build`, the repository’s existing lint and test scripts when present, and the documented preview command. Verify every route, the public-content allowlist, generated image output, metadata, sitemap/RSS when applicable, empty/error states, keyboard behavior, reduced motion, contrast, browser console errors, and the expected `dist` artifacts. A build or HTTP 200 is not visual proof.
12. Deploy to Cloudflare Pages only after the user asks. Load `references/deployment-cloudflare.md`, inspect the existing deploy script and Wrangler config, authenticate with `wrangler whoami`, audit the staged scope in multi-site or generated-file repositories, build `dist`, and prefer the documented `bun run deploy`. Validate the exact public route at the custom domain and raw `*.pages.dev` URL when both exist. Report the actual URL and verification result; never claim deployment from a successful build alone.
13. Hand off for maintenance. Update the README or project notes with dev, build, preview, deploy, architecture, content paths, publication rules, token locations, environment variables, and known gotchas. Leave the vertical-slice decisions and reusable components understandable to the next person.

## Pitfalls

- Treating the interview or design brief as a substitute for design execution and visual QA.
- Asking more questions when a prototype would answer the uncertainty faster.
- Choosing a hero pattern or page archetype before measuring real content geometry, then discovering a three-line title destroys the composition.
- Defending or incrementally patching a rejected composition instead of resetting the structure and removing what it created (schema fields, frontmatter keys, dead CSS).
- Treating a clean technical QA pass as proof the design is good: no console errors and no overflow still leave a generic page with no point of view.
- Rationalizing rendered evidence that contradicts the brief instead of fixing the page or revising the contract with the user.
- Building the whole site before validating the primary route with real content.
- Calling source inspection, a build, HTTP 200, or CSS checks “visual verification.”
- Letting a desktop grid, sidebar, fixed header, card layout, or hero pattern leak into mobile or into a content mode that does not need it.
- Using a custom content-preparation pipeline when `src/content`, Astro content collections, and `render()` solve the requirement.
- Bypassing Astro’s file-based router with React Router, Next Router, or another client router.
- Silently changing the project’s Astro major version, scripts, or deployment contract.
- Restarting the dev server after every design edit instead of using HMR.
- Copying one reference project’s exact palette, layout, or effects into every preset.
- Defaulting to purple gradients, centered dark meshes, glassmorphism, three equal cards, fake screenshots, custom cursors, or text-only minimalism.
- Publishing local drafts or WIP content because they were used as design fixtures.
- Ignoring navigation lifecycle state, theme persistence, focus, reduced motion, image fallbacks, and browser console errors.
- Adding every integration up front, inventing client facts, hiding content in components, or creating a separate visual language per page.

## Verification

Invoke through the `terminal` tool and require `bun run build` to exit 0, then verify the expected route artifacts and the visual-QA matrix for the representative slice and complete route set. For a requested deployment, also require a real public-route check with the expected title or content before reporting success.
