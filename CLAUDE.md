nicholai.work - claude guide
===

this is an astro-based portfolio and blog site deployed on cloudflare pages. content-driven architecture with three main layers: content collections, components, and pages/layouts.

development commands
---

core:
- bun dev - run dev server
- bun build - build the project
- bun preview - build and preview with wrangler
- bun run deploy - build and deploy to cloudflare pages (then run `wrangler pages deploy --branch=main` for production)

utilities:
- bun commit - interactive git commit with AI-generated messages
- bun notepad - quick note-taking utility
- bun run convert:avif:all - convert images to AVIF
- bun cf-typegen - generate cloudflare types

architecture overview
---

content layer (src/content/**)

content is managed via astro's content collections API with schema validation in src/content.config.ts:

blog/ - blog posts as MDX files
- schema: title, description, pubDate, updatedDate, heroImage, featured, category, tags
- sorted by pubDate (newest first)
- featured post displayed on homepage and blog index

sections/ - homepage section content
- hero, experience, skills, featured-project
- each has custom schema for its needs
- experience: systemId, status, dates, company, role, tags, description, achievements, link
- skills: id, domain, tools, proficiency

pages/ - page-specific content
- contact form configuration, labels, social links, subject options

component layer

organized by purpose:
- core UI: BlogCard, FormattedDate, Navigation, Footer, GridOverlay
- blog: BlogFilters, ReadingProgress, TableOfContents, PostNavigation, RelatedPosts
- sections: Hero, Experience, Skills, FeaturedProject

page & layout layer

- BaseLayout - shared structure for all pages
- BlogPost - blog post template with sidebar, navigation, related posts
- src/pages/ - static routes + dynamic blog routes via [...slug].astro

design system
---

design.json documents the evolution from industrial/technical to modern/clean design language.

key principle: industrial styling reserved for hero, experience, and featured project sections only. everything else (blog, navigation, new sections) uses modern design.

modern design (default for new work):
- rounded corners (rounded-lg, rounded-full, rounded-xl)
- clean typography (normal case, no excessive uppercase)
- simple badges with bg-brand-accent/10
- clean metadata format: "date · read time"
- hashtag format for tags (#tag)
- no font-mono or tracking-widest on everything
- faster transitions (300ms)

industrial design (hero/experience/featured only):
- sharp corners
- uppercase tracking-tighter titles
- font-mono system labels
- pulsing dots, accent strips
- technical aesthetic

when building new features, default to modern design unless explicitly working on hero/experience/featured sections.

data flow patterns
---

homepage (src/pages/index.astro):
- fetches hero, experience, skills, featured-project from content collections
- queries 3 most recent blog posts for latest blogs section
- displays in order: hero → experience → featured project → skills → latest blogs

blog index (src/pages/blog/index.astro):
- fetches all posts via getCollection('blog')
- sorts by pubDate newest first
- identifies featured post (first with featured: true or fallback to latest)
- renders featured hero + filterable grid of all posts
- extracts unique categories for filter UI

individual blog posts (src/pages/blog/[...slug].astro):
- uses getStaticPaths() to generate routes
- calculates previous/next posts by date
- finds related posts (matching category or shared tags, limited to 3)
- calculates reading time (200 wpm)
- passes to BlogPost layout

key technical patterns
---

image handling:
- assets in src/assets/ processed by astro (use relative paths in frontmatter)
- static files in public/media/ served as-is (use absolute paths like /media/file.mp4)
- AVIF conversion utility available

content collections pattern:
MDX file → src/content.config.ts schema → getCollection() → component props

UI development:
- ALWAYS review UI changes in the browser
- check if dev server is running before starting it
- visually verify components, animations, layouts before considering work complete

deployment:
- cloudflare pages adapter configured in astro.config.mjs
- image service set to "compile" mode
- platform proxy enabled for development
- production domain: nicholai.work
- hosted on cloudflare pages

blog post creation workflow
---

1. create .mdx file in src/content/blog/ (filename becomes URL slug)
2. add required frontmatter: title, description, pubDate
3. optionally add: heroImage, featured, category, tags
4. write content using markdown/MDX with embedded JSX/HTML
5. images can reference src/assets/ (relative) or public/media/ (absolute)

utility scripts
---

- src/utils/convert-to-avif.js - converts images to AVIF format
- src/utils/git-commit.js - auto-generates commit messages
- src/utils/notepad.js - quick note-taking
- src/utils/reading-time.ts - calculates reading time (200 wpm)

important files
---

- design.json - comprehensive design system documentation
- src/content.config.ts - content collection schemas
- astro.config.mjs - cloudflare pages adapter config
- wrangler.jsonc - cloudflare worker configuration
- src/consts.ts - site metadata (title, description, social links)

theme system
---

uses CSS custom properties for theming:
- --theme-bg-primary, --theme-bg-secondary
- --theme-text-primary, --theme-text-secondary, --theme-text-muted
- --theme-border-primary, --theme-hover-bg
- --brand-accent (primary accent color)

dark mode is default, light mode available via theme toggle.
