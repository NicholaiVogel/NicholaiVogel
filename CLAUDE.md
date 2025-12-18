# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
```bash
pnpm dev              # Run development server
pnpm build            # Build the project
pnpm preview          # Build and preview with Wrangler
pnpm deploy           # Build and deploy to Cloudflare Pages
```

### Utilities
```bash
# Git commit message automation
pnpm commit                        # Interactive: review, accept/edit, optionally push
pnpm commit --accept               # Auto-accept message, prompt for push
pnpm commit --accept --no-push     # Auto-accept and commit without pushing
pnpm commit --accept --push        # Fully automated: accept and push

pnpm notepad                       # Quick note-taking utility

# Image conversion to AVIF format
pnpm run convert:avif:all          # Convert all images
pnpm run convert:avif:jpeg         # Convert JPEG only
pnpm run convert:avif:png          # Convert PNG only
```

## High-Level Architecture

This is an Astro-based portfolio and blog site deployed on Cloudflare Pages. The architecture follows a content-driven approach with three distinct layers:

### 1. Content Layer (`src/content/**`)
Content is managed via Astro's Content Collections API with schema validation defined in `src/content.config.ts`:

- **`blog/`** - Blog posts as MDX files
  - Schema: title, description, pubDate, heroImage (optional), featured (boolean), category, tags
  - Posts are sorted by pubDate (newest first)

- **`sections/`** - Homepage section content (hero, experience, skills, featured-project)
  - Each section has a custom schema for its specific data needs
  - Experience entries include systemId, status, dates, company, role, achievements, links
  - Skills entries include domain, tools, proficiency

- **`pages/`** - Page-specific content (contact form configuration)
  - Includes form labels, social links, subject options

### 2. Component Layer
Components are organized by purpose:

- **Core UI**: `BlogCard`, `FormattedDate`, `Navigation`, `Footer`, `GridOverlay`
- **Blog-specific**: `BlogFilters`, `ReadingProgress`, `TableOfContents`, `PostNavigation`, `RelatedPosts`
- **Section components**: `Hero`, `Experience`, `Skills`, `FeaturedProject`

### 3. Page & Layout Layer
- **Layouts**: `BaseLayout` (shared structure), `BlogPost` (blog template)
- **Routes**: Static routes in `src/pages/` with dynamic blog routes via `[...slug].astro`

## Data Flow Patterns

### Blog Index (`src/pages/blog/index.astro`)
1. Fetches all posts via `getCollection('blog')`
2. Sorts by pubDate (newest first)
3. Identifies featured post (first with `featured: true` or fallback to latest)
4. Renders featured hero + filterable grid of all posts
5. Extracts unique categories for filter UI

### Individual Blog Posts (`src/pages/blog/[...slug].astro`)
1. Uses `getStaticPaths()` to generate all blog post routes
2. For each post, calculates:
   - Previous/next posts (by date)
   - Related posts (matching category or shared tags, limited to 3)
   - Reading time (based on word count, 200 wpm)
3. Passes everything to `BlogPost` layout which handles headings, navigation, related posts

### Content Collections
All content follows the schema validation pattern:
```
MDX file → src/content.config.ts schema → getCollection() → Component props
```

## Key Technical Patterns

### Image Handling
- Assets in `src/assets/` are processed by Astro (use relative paths in frontmatter)
- Static files in `public/media/` are served as-is (use absolute paths like `/media/file.mp4`)
- AVIF conversion utility available for optimization

### Styling
- Tailwind CSS v4 via Vite plugin
- Custom animation classes: `.animate-on-scroll`, `.slide-up`, `.stagger-*`, `.fade-in`
- Monospace font used for technical labels and metadata

### Deployment
- Cloudflare Pages adapter configured in `astro.config.mjs`
- Image service set to "compile" mode
- Platform proxy enabled for development

## Blog Post Creation Workflow

1. Create `.mdx` file in `src/content/blog/` (filename becomes URL slug)
2. Add required frontmatter: title, description, pubDate
3. Optionally add: heroImage, featured, category, tags
4. Write content using Markdown/MDX with embedded JSX/HTML
5. Images can reference `src/assets/` (relative) or `public/media/` (absolute)

## Utility Scripts

- **`src/utils/convert-to-avif.js`** - Converts images to AVIF format with quality options
- **`src/utils/git-commit.js`** - Auto-generates commit messages from staged changes
- **`src/utils/notepad.js`** - Quick note-taking utility
