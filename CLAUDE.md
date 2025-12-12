```
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build the project
```bash
npm run build
```

### Run development server
```bash
npm run dev
```

### Lint the codebase
```bash
npm run lint
```

### Run tests
```bash
npm run test
```

### Build and preview a specific page
```bash
npm run build:page <page-name>
```

### Preview the blog section
```bash
npm run preview:blog
```

## High-Level Architecture

The website follows a clean separation of concerns with three distinct layers:

1. **Content Layer** - Markdown/MDX files containing structured content located in `src/content/**`
2. **Component Layer** - Reusable UI components built with Astro, organized by purpose and functionality
3. **Layout & Structure Layer** - Page templates that orchestrate component composition across different sections

### Content Structure
- All content is stored in Markdown/MDX format within the `src/content/**` directory
- Organized into logical groups:
  - `sections/*` - About, Experience, Skills, Featured Project
  - `pages/contact.mdx` - Contact form data
  - `blog/*.mdx` - Blog posts with structured metadata and frontmatter

### Component Structure
The component architecture follows a consistent pattern with different types of components:

**Core Components**: Reusable elements like `BlogCard`, `FormattedDate`, and `Navigation`

**Section Components**: Page-specific sections like `Experience`, `Skills`, and `FeaturedProject`

**Layout Components**: Base templates that provide shared styling and structure (e.g., `BaseLayout`, `BlogPost`)

### Component Relationships

**Blog Section Flow**: The blog page (`src/pages/blog/index.astro`) fetches all blog posts via `getCollection()` and organizes content into three distinct sections:
- Featured post (first with `featured: true`)
- Editor's picks (next 3 posts after featured)
- Latest posts (all posts for filtering)

**Content Rendering Pattern**: All components use a consistent data model where properties are passed through props. For example, `BlogCard` receives title, description, pubDate, and heroImage as parameters.

### Data Flow Architecture
```
Content Files → Astro Content API → Page Components → UI Components → Final Render
```

- **Content Collection**: Configured in `src/content.config.ts` with schema validation for frontmatter
- **Data Fetching**: Uses Astro's content API to load and transform data from Markdown/MDX files
- **Component Composition**: Pages assemble components based on fetched data, creating dynamic and responsive layouts

### Design System Elements
- **Styling System**: Consistent use of classes like `.animate-on-scroll`, `.stagger-*`, and `.border-white/[0.1]`
- **Navigation**: Responsive mobile menu with smooth transitions
- **Accessibility**: Proper ARIA attributes, keyboard navigation support
- **Performance**: Optimized image loading and lazy rendering (using AVIF/WebP formats)

### Technical Features
- **AI Integration**: Blog post highlights AI/ML usage in technical workflow
- **Interactive Elements**: Form dropdowns, modal responses for contact form
- **Animation System**: Scroll-triggered animations with staggered effects
- **Responsive Design**: Mobile-first approach with viewport-specific classes and media queries

The architecture is highly maintainable with clear separation of content from presentation. The use of Astro's data API and component system enables dynamic content generation while maintaining a consistent visual language throughout the site.
```