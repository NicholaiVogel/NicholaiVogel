# COMPONENTS

**Type:** Astro + React
**Count:** 16 files

## OVERVIEW

Reusable UI components organized by purpose. Section components in nested `sections/` directory.

## STRUCTURE

```
src/components/
├── Core UI:           BaseHead, Footer, Navigation, GridOverlay, ThemeToggle
├── Blog:              BlogCard, BlogFilters, FormattedDate, ReadingProgress,
│                     PostNavigation, RelatedPosts, TableOfContents
├── Interactive (React): CustomCursor, SearchDialog, ThemePreferenceDialog
└── sections/:         Hero, Experience, Skills, FeaturedProject
```

## WHERE TO LOOK

| Task | File |
|------|------|
| Page shell elements | `BaseHead.astro`, `Footer.astro`, `Navigation.astro` |
| Blog listing | `BlogCard.astro`, `BlogFilters.astro` |
| Blog post | `TableOfContents.astro`, `ReadingProgress.tsx`, `RelatedPosts.astro` |
| Homepage sections | `sections/Hero.astro`, `sections/Experience.astro` |
| Interactive UI | `CustomCursor.tsx`, `SearchDialog.tsx`, `ThemePreferenceDialog.tsx` |

## COMPONENT PATTERNS

- **Astro components** for static UI (Hero, Experience, BlogCard)
- **React components** for interactivity (CustomCursor, SearchDialog, ThemeToggle)
- **No props interfaces** - Props typed inline or via Content Collections
- **Design system** follows `dev/design.json` V7 Industrial Dark Mode

## IMPORTS

```typescript
// Direct imports (no barrel export)
import Hero from '../components/sections/Hero.astro';
import SearchDialog from '../components/SearchDialog.tsx';
```

## NOTES

- Section components pull data from `src/content/sections/*.mdx`
- Grid overlay follows 10x10 interactive pattern from design spec
- ThemePreferenceDialog manages dark mode state
