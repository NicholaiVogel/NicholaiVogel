# PAGES

related guides: [[AGENTS.md|root guide]], [[src/components/AGENTS.md|components guide]]

**Type:** Astro routes + API endpoints
**Count:** 8 files

## OVERVIEW

File-based routing + non-standard API endpoints in pages directory. API routes generate static files (JSON, RSS, LLM context).

## STRUCTURE

```
src/pages/
├── Static routes:      index.astro, 404.astro, contact.astro
├── Blog:               blog/index.astro, blog/[...slug].astro
└── API endpoints:      rss.xml.js, search.json.ts, llms.txt.ts, llms-full.txt.ts
```

## WHERE TO LOOK

| Route | File | Purpose |
|-------|------|---------|
| `/` | [[src/pages/index.astro|index.astro]] | Homepage |
| `/blog/` | [[src/pages/blog/index.astro|blog/index.astro]] | Blog listing |
| `/blog/:slug` | [[src/pages/blog/[...slug].astro|blog/[...slug].astro]] | Individual posts |
| `/contact` | [[src/pages/contact.astro|contact.astro]] | Contact page |
| `/rss.xml` | [[src/pages/rss.xml.js|rss.xml.js]] | RSS feed generator |
| `/search.json` | [[src/pages/search.json.ts|search.json.ts]] | Search index JSON |
| `/llms.txt` | [[src/pages/llms.txt.ts|llms.txt.ts]] | LLM context (concise) |
| `/llms-full.txt` | [[src/pages/llms-full.txt.ts|llms-full.txt.ts]] | LLM context (full) |

## DATA FLOW

```
blog/index.astro:
  getCollection('blog') → sort by pubDate → extract featured post → render grid

blog/[...slug].astro:
  getStaticPaths() → for each post: calc prev/next + related + reading time → BlogPost layout
```

for layout details, see [[src/layouts/BlogPost.astro|BlogPost.astro]] and the root [[AGENTS.md|AGENTS.md]].

## API ENDPOINTS (NON-STANDARD)

- Place in `pages/` instead of a dedicated `api/` directory
- Generate static files at build time, not runtime
- [[src/pages/search.json.ts|search.json.ts]] → `/search.json`
- [[src/pages/llms.txt.ts|llms.txt.ts]] → `/llms.txt`
- [[src/pages/llms-full.txt.ts|llms-full.txt.ts]] → `/llms-full.txt`

## NOTES

- Dynamic route [[src/pages/blog/[...slug].astro|[...slug].astro]] catches all blog post paths
- All pages are SSG (static site generation)
- No API routes that run at request time
