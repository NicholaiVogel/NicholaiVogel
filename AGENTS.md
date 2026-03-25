nicholai.work - agent guide
===

related guides
---

- [[src/assets/AGENTS.md|assets guide]]
- [[src/components/AGENTS.md|components guide]]
- [[src/pages/AGENTS.md|pages guide]]
- [[src/utils/AGENTS.md|utilities guide]]

important
---

- do not casually rewrite or discard this document. improve it carefully.
- this repo is a content-driven astro portfolio/blog deployed to cloudflare pages.
- treat changes here like product work, not generic scaffolding. design, content, and information architecture all matter.

this file provides guidance to ai assistants working on this repository. it is version controlled and should stay specific to how this site actually works.

session protocol (mandatory)
---

before starting any feature, fix, refactor, content change, or design pass:

1. identify the layer you are changing: content, components, pages/layouts, or config/deployment.
2. read the relevant source of truth before editing:
   - [[design.json|design.json]] for visual/design work
   - [[src/content.config.ts|src/content.config.ts]] for content collections or frontmatter/schema changes
   - the specific files under `src/content/**` for content-driven sections/pages
   - the relevant component/layout/page files for rendering changes
   - [[astro.config.mjs|astro.config.mjs]], [[wrangler.jsonc|wrangler.jsonc]], and [[src/consts.ts|src/consts.ts]] for platform/site metadata changes
3. preserve the existing site invariants unless the task explicitly changes them.
4. if the change is visual, check whether the dev server is already running before starting it.
5. all ui changes must be reviewed in the browser before the task is considered complete.
6. if you change routes, content schemas, config, or build behavior, run `bun build` before finishing.

site invariants (do not drift accidentally)
---

- homepage order is: hero → experience → featured project → skills → latest blogs.
- blog posts are sorted by `pubDate` newest first.
- featured blog post is the first post with `featured: true`, or the latest post as fallback.
- individual posts calculate reading time at 200 wpm.
- related posts are based on matching category or shared tags, limited to 3.
- dark mode is the default theme. light mode is optional via theme toggle.

incident -> guardrail loop (mandatory)
---

when a bug, regression, broken page, or content failure is found, the fix is not complete until at least one durable prevention mechanism is added:

1. tighten schema validation in [[src/content.config.ts|src/content.config.ts]] if the failure came from content shape/frontmatter.
2. add a component guard, fallback, or empty state if the failure came from rendering assumptions.
3. add a build-time or route-level validation step if the failure came from integration drift.
4. update this [[AGENTS.md|AGENTS.md]] if the failure mode was process-related and should be prevented next time.

common failure modes
---

prevent these proactively:

1. content/schema drift
   - if frontmatter shape changes, update [[src/content.config.ts|src/content.config.ts]] in the same pass.
   - do not add ad-hoc fields in mdx without schema support.

2. design language drift
   - modern design is the default for new work.
   - industrial styling is reserved for hero, experience, and featured project sections unless explicitly requested.
   - do not spread mono/uppercase/technical styling across blog, navigation, or new general-purpose sections by accident.

3. image path mistakes
   - assets in `src/assets/` should be referenced relatively in frontmatter/components.
   - static files in `public/media/` should use absolute paths like `/media/file.mp4`.

4. homepage/blog logic regressions
   - preserve ordering, featured-post fallback behavior, reading-time assumptions, and related-post limits unless the task says otherwise.

5. unverified visual work
   - no visual task is done until it has been checked in-browser.
   - verify the exact route affected, not just a component in isolation.

6. astro/cloudflare config drift
   - any change to [[astro.config.mjs|astro.config.mjs]], [[wrangler.jsonc|wrangler.jsonc]], image handling, or platform proxy behavior should be validated with a build or preview.

completion checklist (mandatory before finishing)
---

- [ ] read the relevant source-of-truth files first
- [ ] kept content schema and content usage in sync
- [ ] respected the correct design language for the section being changed
- [ ] used the correct image path strategy (`src/assets` vs `public/media`)
- [ ] reviewed ui changes in the browser
- [ ] ran `bun build` for route/schema/config/structural changes
- [ ] checked for broken links, slugs, imports, and obvious empty states

development commands
---

core:
- `bun dev` - run astro dev server
- `bun build` - build the site
- `bun preview` - build and preview with wrangler/cloudflare behavior
- `bun run deploy` - build and deploy to cloudflare pages
- `wrangler pages deploy --branch=main` - production deployment step

utilities:
- `bun commit` - interactive git commit with ai-generated messages
- `bun notepad` - quick note-taking utility
- `bun run convert:avif:all` - convert images to avif
- `bun cf-typegen` - generate cloudflare types

validation expectations
---

- visual/component/layout changes: review in browser.
- content/schema/route/config changes: run `bun build`.
- cloudflare-specific behavior changes: use `bun preview` when needed.
- do not deploy as part of a normal task unless the user asks for it.

architecture overview
---

this site has three main layers: content collections, components, and pages/layouts.

content layer (`src/content/**`)

content is managed via astro's content collections api with schema validation in [[src/content.config.ts|src/content.config.ts]].

- `blog/` - mdx blog posts
  - schema: `title`, `description`, `pubDate`, `updatedDate`, `heroImage`, `featured`, `category`, `tags`
  - sorted by `pubDate` newest first
  - featured post is surfaced on homepage and blog index

- `sections/` - homepage section content
  - `hero`, `experience`, `skills`, `featured-project`
  - `experience`: `systemId`, `status`, `dates`, `company`, `role`, `tags`, `description`, `achievements`, `link`
  - `skills`: `id`, `domain`, `tools`, `proficiency`

- `pages/` - page-specific content such as contact form config, labels, social links, and subject options

component layer

organized by purpose:
- core ui: [[src/components/BlogCard.astro|BlogCard.astro]], [[src/components/FormattedDate.astro|FormattedDate.astro]], [[src/components/Navigation.astro|Navigation.astro]], [[src/components/Footer.astro|Footer.astro]], [[src/components/GridOverlay.astro|GridOverlay.astro]]
- blog: [[src/components/BlogFilters.astro|BlogFilters.astro]], [[src/components/TableOfContents.astro|TableOfContents.astro]], [[src/components/PostNavigation.astro|PostNavigation.astro]], [[src/components/RelatedPosts.astro|RelatedPosts.astro]]
- sections: [[src/components/sections/Hero.astro|Hero.astro]], [[src/components/sections/Experience.astro|Experience.astro]], [[src/components/sections/Skills.astro|Skills.astro]], [[src/components/sections/FeaturedProject.astro|FeaturedProject.astro]]

page & layout layer

- [[src/layouts/BaseLayout.astro|BaseLayout.astro]] - shared shell for all pages
- [[src/layouts/BlogPost.astro|BlogPost.astro]] - blog post template with sidebar, navigation, and related posts
- [[src/pages|src/pages]] - static routes plus dynamic blog routes via [[src/pages/blog/[...slug].astro|[...slug].astro]]

design system
---

design direction is documented in [[design.json|design.json]].

key rule: industrial styling is reserved for hero, experience, and featured project sections only. everything else should use the modern design language unless the task explicitly says otherwise.

modern design, default for new work:
- rounded corners (`rounded-lg`, `rounded-xl`, `rounded-full`)
- clean typography, normal case
- simple badges with `bg-brand-accent/10`
- metadata format like `date · read time`
- hashtag tag format like `#tag`
- restrained transitions, around 300ms
- avoid spraying `font-mono` and wide tracking everywhere

industrial design, only where intended:
- sharp corners
- uppercase tracking-tighter titles
- mono system labels
- pulsing dots, accent strips, technical framing

data flow patterns
---

homepage ([[src/pages/index.astro|src/pages/index.astro]]):
- fetches `hero`, `experience`, `skills`, and `featured-project` from content collections
- queries the 3 most recent blog posts for the latest blogs section
- renders in this order: hero → experience → featured project → skills → latest blogs

blog index ([[src/pages/blog/index.astro|src/pages/blog/index.astro]]):
- fetches all posts with `getCollection('blog')`
- sorts by `pubDate` newest first
- identifies the featured post from `featured: true`, with fallback to the latest post
- renders a featured hero plus a filterable grid of all posts
- extracts unique categories for filter ui

individual blog posts ([[src/pages/blog/[...slug].astro|src/pages/blog/[...slug].astro]]):
- uses `getStaticPaths()` to generate routes
- calculates previous/next posts by date
- finds related posts by shared category or tags, limited to 3
- calculates reading time at 200 wpm
- passes computed data to the [[src/layouts/BlogPost.astro|BlogPost.astro]] layout

key technical patterns
---

image handling:
- assets in `src/assets/` are processed by astro
- static files in `public/media/` are served as-is
- avif conversion utility is available via [[src/utils/convert-to-avif.js|convert-to-avif.js]]

content collections pattern:
- mdx file → [[src/content.config.ts|src/content.config.ts]] schema → `getCollection()` → component props

ui development:
- always review ui changes in the browser
- check whether the dev server is already running before starting another one
- visually verify layouts, animations, spacing, and responsive behavior before calling the work done

deployment
---

- cloudflare pages adapter is configured in [[astro.config.mjs|astro.config.mjs]]
- image service is set to `compile` mode
- platform proxy is enabled for development
- production domain is `nicholai.work`
- site is hosted on cloudflare pages

blog post workflow
---

1. create an `.mdx` file in `src/content/blog/`
2. add required frontmatter: `title`, `description`, `pubDate`
3. optionally add: `heroImage`, `featured`, `category`, `tags`
4. write the post in markdown/mdx, including jsx/html only when it genuinely helps
5. use relative asset paths for `src/assets/` files, or absolute `/media/...` paths for `public/media/` files

important files
---

- [[AGENTS.md|AGENTS.md]] - this guide
- [[design.json|design.json]] - design system and stylistic direction
- [[src/content.config.ts|src/content.config.ts]] - content collection schemas
- [[astro.config.mjs|astro.config.mjs]] - astro + cloudflare adapter config
- [[wrangler.jsonc|wrangler.jsonc]] - cloudflare worker/pages configuration
- [[src/consts.ts|src/consts.ts]] - site metadata and social links

theme system
---

uses css custom properties for theming:
- `--theme-bg-primary`, `--theme-bg-secondary`
- `--theme-text-primary`, `--theme-text-secondary`, `--theme-text-muted`
- `--theme-border-primary`, `--theme-hover-bg`
- `--brand-accent`

dark mode is default. light mode is available via the theme toggle.
