# PAGES

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
| `/` | `index.astro` | Homepage |
| `/blog/` | `blog/index.astro` | Blog listing |
| `/blog/:slug` | `blog/[...slug].astro` | Individual posts |
| `/contact` | `contact.astro` | Contact page |
| `/rss.xml` | `rss.xml.js` | RSS feed generator |
| `/search.json` | `search.json.ts` | Search index JSON |
| `/llms.txt` | `llms.txt.ts` | LLM context (concise) |
| `/llms-full.txt` | `llms-full.txt.ts` | LLM context (full) |

## DATA FLOW

```
blog/index.astro:
  getCollection('blog') → sort by pubDate → extract featured post → render grid

blog/[...slug].astro:
  getStaticPaths() → for each post: calc prev/next + related + reading time → BlogPost layout
```

## API ENDPOINTS (NON-STANDARD)

- Place in `pages/` instead of dedicated `api/` directory
- Generate static files at build time (not runtime)
- `search.json.ts` → `/search.json` (static search index)
- `llms.txt.ts` → `/llms.txt` (LLM-friendly context)

## NOTES

- Dynamic route `[...slug].astro` catches all blog post paths
- All pages are SSG (static site generation)
- No API routes that run at request time
