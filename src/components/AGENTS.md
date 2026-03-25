# COMPONENTS

related guides: [[AGENTS.md|root guide]], [[src/pages/AGENTS.md|pages guide]], [[src/assets/AGENTS.md|assets guide]]

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
├── Interactive:       CustomCursor, SearchDialog, ThemePreferenceDialog
└── sections/:         Hero, Experience, Skills, FeaturedProject
```

## WHERE TO LOOK

| Task | File |
|------|------|
| Page shell elements | [[src/components/BaseHead.astro|BaseHead.astro]], [[src/components/Footer.astro|Footer.astro]], [[src/components/Navigation.astro|Navigation.astro]] |
| Blog listing | [[src/components/BlogCard.astro|BlogCard.astro]], [[src/components/BlogFilters.astro|BlogFilters.astro]] |
| Blog post | [[src/components/TableOfContents.astro|TableOfContents.astro]], [[src/components/ReadingProgress.astro|ReadingProgress.astro]], [[src/components/RelatedPosts.astro|RelatedPosts.astro]] |
| Homepage sections | [[src/components/sections/Hero.astro|Hero.astro]], [[src/components/sections/Experience.astro|Experience.astro]] |
| Interactive UI | [[src/components/CustomCursor.tsx|CustomCursor.tsx]], [[src/components/SearchDialog.tsx|SearchDialog.tsx]], [[src/components/ThemePreferenceDialog.astro|ThemePreferenceDialog.astro]] |

## COMPONENT PATTERNS

- **Astro components** for static UI ([[src/components/sections/Hero.astro|Hero.astro]], [[src/components/sections/Experience.astro|Experience.astro]], [[src/components/BlogCard.astro|BlogCard.astro]])
- **React/interactive components** for client behavior ([[src/components/CustomCursor.tsx|CustomCursor.tsx]], [[src/components/SearchDialog.tsx|SearchDialog.tsx]], [[src/components/ThemeToggle.astro|ThemeToggle.astro]])
- **No props interfaces** - Props typed inline or via Content Collections
- **Design system** follows [[design.json|design.json]] and the root [[AGENTS.md|AGENTS.md]] rules

## IMPORTS

```typescript
// Direct imports (no barrel export)
import Hero from '../components/sections/Hero.astro';
import SearchDialog from '../components/SearchDialog.tsx';
```

## NOTES

- Section components pull data from `src/content/sections/*.mdx`
- Grid overlay follows the pattern in [[src/components/GridOverlay.astro|GridOverlay.astro]]
- Theme preference behavior lives in [[src/components/ThemePreferenceDialog.astro|ThemePreferenceDialog.astro]]
