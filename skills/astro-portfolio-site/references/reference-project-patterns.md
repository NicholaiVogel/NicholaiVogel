# Reference Project Patterns

The following local projects were inspected as preference references. They are pattern sources, not templates to copy. Preserve the useful architecture while selecting a visual direction from the current client brief.

## `/mnt/work/life/projects/united-tattoo`

Observed patterns:

- Astro 5 with Cloudflare, MDX, Tailwind 4 through Vite, GSAP, Lenis, Resend, and content collections.
- `SiteLayout.astro` owns metadata, canonical and social tags, JSON-LD, client-router lifecycle, and scroll setup.
- The homepage is data-driven from content collections and JSON rather than hardcoded repeated cards.
- `HeaderNav.astro` has separate desktop/mobile behavior, active state, accessible labels, an overlay, keyboard handling, and body overflow control.
- `global.css` is token-led, dark/editorial, includes font and theme variables, safe viewport helpers, and reduced-motion rules.
- The site uses explicit image loading, fallbacks, AVIF assets, section banners, and a strong image-led hierarchy.

Use these lessons: centralize layout and metadata, model repeated content, make mobile navigation a first-class state, and keep animation lifecycle-safe. Do not assume every site should inherit its dark editorial look, noise, or smooth scroll.

## `/mnt/work/life/web`

Observed patterns:

- Astro 5 with Cloudflare Pages, MDX, React, RSS, sitemap, Tailwind 4, GSAP, and content infrastructure.
- `BaseLayout.astro` and `BaseHead.astro` establish reusable shell, canonical/OG/Twitter metadata, JSON-LD, theme initialization, and client-router lifecycle.
- `Navigation.astro` provides desktop and mobile navigation with active states, overlays, labels, and Escape handling.
- The project’s `global.css` defines named dark/light tokens, font stacks, animation timing, safe viewport helpers, responsive rules, and reduced-motion behavior.
- The Pages-style `wrangler.jsonc` uses `pages_build_output_dir: "./dist"`; deployment is manual through a documented script.
- Real project sections and content are treated as the page’s evidence, not decorative filler.

Use these lessons: establish theme state before paint, keep metadata and structured data reusable, rebind interaction code after Astro page loads, and make deployment configuration match the Pages runtime. Do not copy the side-rail navigation, cursor, colors, or exact motion system without a brief reason.

## `/mnt/work/life/projects/oddcore-website`

Observed patterns:

- Astro 5 with Cloudflare Pages, MDX, React, RSS, sitemap, Tailwind 4, GSAP, Resend, image tooling, and search dependencies.
- Custom fonts and expressive visual assets are declared explicitly with `@font-face` and token variables.
- `Hero.tsx` uses GSAP context cleanup, reduced-motion handling, video fallback, a static poster path, and session-aware intro behavior.
- `Navigation.tsx` includes accessible menu state, Escape handling, animation cleanup, and deliberately branded audio behavior.
- MDX, blog assets, public images, video, fonts, and a Pages Wrangler config are documented for maintenance.

Use these lessons: a strong brand can justify custom type and media, but expressive effects need fallbacks, cleanup, and an explicit accessibility path. Do not transplant the pixel palette, CRT layer, sound effects, cursor, or navigation mechanics into a different brand.

## Cross-Project Defaults

- Treat each project’s existing `package.json`, scripts, Astro config, content model, design tokens, and deployment notes as the source of truth before scaffolding or changing versions.
- Prefer Astro 5, TypeScript, Tailwind CSS 4 through Vite, and Bun when creating a new site only when that matches the chosen project contract; do not silently upgrade an existing project.
- Use a token-driven `global.css` with `@import "tailwindcss"` first, then fonts, theme variables, base styles, utilities, motion, reduced-motion rules, and safe viewport helpers.
- Use Astro layouts for shell and metadata, content collections or MDX for repeated content, and data-driven components for lists and cards.
- Use real assets with explicit dimensions, optimized formats, meaningful `alt` text, and mobile fallbacks.
- Treat responsive navigation, keyboard behavior, focus, empty/error states, theme initialization, and route lifecycle cleanup as core architecture.
- Prefer Pages-style `wrangler.jsonc` and manual Cloudflare Pages deployment for standalone sites unless SSR, bindings, or API routes require another contract.
- Document commands, content paths, tokens, secrets, and deploy steps in the project.
