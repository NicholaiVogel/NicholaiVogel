nicholai.work
===

personal portfolio and blog built with astro. live at https://nicholai.work

tech stack
---

- astro - static site framework
- react - interactive components
- tailwind css - styling
- mdx - markdown with jsx
- cloudflare pages - hosting
- typescript - type safety

commands
---

```bash
bun install        # install deps
bun dev            # dev server at localhost:4321
bun build          # production build
bun preview        # preview with wrangler
bun run deploy     # build and deploy to cloudflare
```

image conversion
---

```bash
bun run convert:avif:all   # convert all images in src/assets/
bun run convert:avif:jpeg  # just jpegs
bun run convert:avif:png   # just pngs
```

blog posts
---

create mdx files in `src/content/blog/`. filename becomes the url slug.

frontmatter:

```mdx
---
title: 'Post Title'
description: 'brief description for listings and seo'
pubDate: 'Jan 15 2025'
heroImage: '../../assets/image.jpg'  # optional
featured: true                        # optional, shows in hero
category: 'Case Study'                # optional, for filtering
tags: ['VFX', 'Houdini']              # optional, for related posts
---
```

images go in `src/assets/` (processed by astro) or `public/media/` (static, use absolute paths like `/media/video.mp4`).

project structure
---

```
src/
├── assets/       # images processed by astro
├── components/   # reusable components
├── content/
│   ├── blog/     # blog posts (mdx)
│   ├── pages/    # page content
│   └── sections/ # homepage sections
├── layouts/      # page layouts
├── pages/        # routes
├── styles/       # global styles
└── utils/        # utility scripts
```

deployment
---

deployed to cloudflare pages. `bun run deploy` builds and deploys via wrangler.
for production: `wrangler pages deploy --branch=main`
