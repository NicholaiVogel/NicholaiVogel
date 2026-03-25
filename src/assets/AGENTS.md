# ASSETS

related guides: [[AGENTS.md|root guide]], [[src/utils/AGENTS.md|utilities guide]]

**Type:** Astro-processed images
**Count:** 6 files

## OVERVIEW

Images optimized by Astro at build time. Use relative paths in frontmatter/content.

## USAGE

```mdx
---
heroImage: '../../assets/portrait.jpg'  # Frontmatter reference
---

<!-- In content -->
import portrait from '../../assets/portrait.jpg';
<img src={portrait.src} alt="Description" />
```

## ASSET TYPES

| Location | Type | Processing |
|----------|------|------------|
| `src/assets/` | Images | Astro optimization, AVIF/WebP conversion |
| `public/media/` | Static | Served as-is (videos, large files) |

## PATTERNS

- **Referenced in frontmatter** via relative path (`../../assets/image.jpg`)
- **Imported in MDX** for component usage
- **Optimized automatically** by Astro image service (compile mode)
- **AVIF preferred** - Use [[src/utils/convert-to-avif.js|convert-to-avif.js]] for batch conversion

## NOTES

- `public/media/` for static assets (videos, pre-converted images)
- `src/assets/` for images needing Astro processing
- Images in `src/assets/` available via `import` statement
