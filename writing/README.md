# Nicholai's writing site

A standalone Astro site for essays, journalism, and technical writing. It lives beside the main nicholai.work project at `/mnt/work/life/web/writing` and is intended for `blog.nicholai.work`.

## Local development

```bash
bun install
bun run dev
```

Published Markdown and any local image assets live directly under `src/content/writing/`, where Astro loads them as a native content collection. WIP material stays private in the Obsidian vault and is not available to the site until it is deliberately copied into this directory.

## Commands

- `bun run dev` — local development server
- `bun run build` — production build
- `bun run preview` — serve the production build locally
- `bun run deploy` — build and deploy to the `nicholai-writing` Cloudflare Pages project

## Content workflow

Public writing belongs in the Astro content collection once it has been approved for publication. Frontmatter tags are the source of archive filters; the UI derives filter groups and labels from the tags rather than maintaining a separate hardcoded taxonomy.

WIP material stays in the private Obsidian vault. When a note is ready, copy the Markdown file and any referenced local images into `src/content/writing/`, review the rendered route, and commit those published files.

## Project notes

- `DESIGN-BRIEF.md` is the frozen design and content contract.
- `src/styles/global.css` contains the default reading-room tokens and alternate development style variants.
- `src/components/DevStyleSwitcher.astro` is rendered only in development.
- No analytics, contact form, newsletter, or RSS subscription service is required at launch. RSS is generated as a route so it can be linked later.
