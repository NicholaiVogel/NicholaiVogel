# Astro-Native Architecture

Use Astro’s primitives as the default architecture. The goal is not to use every integration; it is to check whether Astro already solves the requirement before introducing a custom loader, client router, duplicate content pipeline, or framework abstraction.

## Reconcile Before Scaffolding

For an existing project, inspect with `read_file` and `search_files`:

- `package.json` and lockfile version
- `AGENTS.md`, README, and project notes
- `astro.config.*`, `wrangler.*`, and deploy scripts
- `src/content.config.ts` or legacy content configuration
- `src/content`, `src/pages`, `src/layouts`, `src/components`, `src/assets`, and `public`
- `global.css`, theme initialization, and existing client-router lifecycle code

The repository’s version and scripts are the source of truth. Do not silently create a second app, change the Astro major version, or replace working conventions with a generic scaffold.

## Content

For repeated Markdown or MDX content:

- Keep approved files under `src/content/<collection>`.
- Keep related images beside the content when the project’s content model supports relative paths.
- Define the collection in `src/content.config.ts` with `defineCollection` and the project’s supported loader.
- Validate frontmatter with the collection schema.
- Use the schema callback’s `image()` for image fields that should enter Astro’s image pipeline.
- Use `getCollection()` or `getEntry()` in pages and components.
- Use `render()` from `astro:content` to render collection entries.
- Keep publication state explicit. Local WIP files must not enter the public collection or deployment artifact by accident.

Do not create a hidden `.local-writing` directory, custom preparation script, or alternate glob loader when native content collections can meet the requirement. If a sync or import step is genuinely necessary, document why it cannot be replaced by approved files under `src/content` and verify its public allowlist.

## Routing

Use Astro’s built-in file-based router:

- Public routes belong under `src/pages` as `.astro`, `.md`, or `.mdx` files.
- File paths own URLs. Keep the route map in `DESIGN-BRIEF.md`.
- Use normal HTML `<a>` elements for ordinary internal navigation.
- Use `getStaticPaths()` and `Astro.params` for dynamic static routes.
- Keep reusable UI, data helpers, and test fixtures outside route files where practical.
- Do not add React Router, Next Router, or another client-side router for ordinary site navigation.

Load `references/astro-routing.md` before implementing a non-trivial route tree.

## Images

Use Astro’s image pipeline for content and site media when optimization is part of the requirement:

- Store source media in the project’s supported asset or content location.
- Use the content schema’s `image()` for collection-owned images.
- Render images through Astro’s `Image` component or the existing project abstraction.
- Provide meaningful `alt` text, dimensions or responsive sizing, loading intent, and a fallback or empty state.
- Check the rendered output for the expected optimized attributes and sources. An imported image file alone is not proof of optimization.

Do not replace Astro image handling with arbitrary public URLs or raw `<img>` tags unless the source is intentionally external and the tradeoff is recorded.

## Navigation and Client State

Use Astro’s native navigation and transition lifecycle only when it improves the brief. If the project uses client-side navigation or `ClientRouter`, test every persistent state boundary: theme, menus, filters, search, focus, scroll position, and animation cleanup.

A theme toggle that works on first load but resets after an internal link is not complete. A transition that appears once but duplicates listeners after navigation is not complete.

## Integrations

Add integrations only when they solve an identified requirement:

- MDX for authorable extended content.
- RSS for a feed requirement.
- Sitemap for discoverability and the configured site URL.
- React or another island only for interaction that benefits from it.
- GSAP or other motion tooling only when the brief justifies it and the reduced-motion and cleanup paths exist.
- Cloudflare adapter and Pages configuration for the documented deployment target.

## Native-Feature Audit

Before adding custom infrastructure, answer:

| Requirement | Astro-native question |
|---|---|
| Repeated content | Can `src/content`, collections, and `render()` model it? |
| Public URLs | Can `src/pages` and `getStaticPaths()` own the routes? |
| Responsive media | Can the `Image` pipeline and `image()` schema handle it? |
| Navigation state | Can Astro’s native navigation lifecycle handle it without a second router? |
| Feed and discovery | Are RSS and sitemap integrations sufficient? |
| Deployment | Does the existing Pages adapter and Wrangler script already define the contract? |

Custom infrastructure needs a reason, a scope boundary, and a verification step.

## Verification

Before broad implementation, verify that:

- the intended files are under `src/content` and `src/pages`
- collection entries render through Astro content APIs
- dynamic route artifacts exist after `bun run build`
- images render through the project’s Astro image path when required
- ordinary links reach Astro-owned routes
- theme and other client state survive internal navigation
- the existing Astro and Cloudflare version/config contract remains intact
