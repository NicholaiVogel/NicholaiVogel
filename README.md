# nicholai-work-2026

Personal portfolio and blog site built with Astro.

🌐 [Live Site](https://nicholai.work)

## I used these:

- **Astro** - Static site framework
- **React** - Interactive components
- **Tailwind CSS** - Styling
- **MDX** - Markdown with JSX support
- **Cloudflare Pages** - Hosting & deployment
- **TypeScript** - Type safety

## some commands

```bash
pnpm install

pnpm dev

pnpm build

pnpm preview

pnpm run deploy
```

## Image Optimization

```bash
# Convert all images in src/assets/
pnpm run convert:avif:all

pnpm run convert:avif:jpeg

pnpm run convert:avif:png

# Custom quality (0-100, default: 65)
node src/utils/convert-to-avif.js --jpeg --quality 80
```
## Blog

Blog posts are created as MDX files in the `src/content/blog/` directory. The file name becomes the URL slug (e.g., `my-post.mdx` → `/blog/my-post/`).

### Step 1: Create the MDX File

Create a new `.mdx` file in `src/content/blog/`:

```bash
src/content/blog/my-new-post.mdx
```

### Step 2: Add Frontmatter

Every blog post requires frontmatter at the top of the file. Here's the complete schema:

```mdx
---
title: 'Your Post Title'
description: 'A brief description that appears in listings and meta tags'
pubDate: 'Jan 15 2025'
heroImage: '../../assets/your-image.jpg'
featured: true
category: 'Case Study'
tags: ['VFX', 'Houdini', 'Nuke']
---
```

#### Required Fields

- **`title`** (string) - The post title
- **`description`** (string) - Brief description for listings and SEO
- **`pubDate`** (string) - Publication date in any format (e.g., `'Jan 15 2025'`, `'2025-01-15'`)

#### Optional Fields

- **`heroImage`** (image path) - Hero image for the post. Use relative path from the MDX file:
  - Images in `src/assets/`: `'../../assets/image.jpg'`
  - Images in `public/media/`: Use absolute path in content: `/media/image.jpg`
- **`featured`** (boolean, default: `false`) - Set to `true` to feature on blog index page
- **`category`** (string) - Category for filtering (e.g., `'Case Study'`, `'Tutorial'`, `'Thoughts'`)
- **`tags`** (array of strings) - Tags for categorization and related posts
- **`updatedDate`** (string) - Optional update date

### Step 3: Write Your Content

Write your content using Markdown or MDX syntax. You can use:

- Standard Markdown (headings, lists, links, etc.)
- JSX components and HTML
- Custom styling with Tailwind classes

#### Example: Adding Videos

```mdx
<div class="video-container my-10">
  <video controls class="w-full border border-white/10">
    <source src="/media/my-video.mp4" type="video/mp4" />
    Your browser does not support the video tag.
  </video>
  <p class="text-slate-500 text-sm mt-3 font-mono">/// VIDEO CAPTION</p>
</div>
```

#### Example: Image Grids

```mdx
<div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-10">
  <div class="video-container">
    <video controls class="w-full border border-white/10">
      <source src="/media/video-1.mp4" type="video/mp4" />
    </video>
    <p class="text-slate-500 text-sm mt-3 font-mono">/// CAPTION 1</p>
  </div>
  <div class="video-container">
    <video controls class="w-full border border-white/10">
      <source src="/media/video-2.mp4" type="video/mp4" />
    </video>
    <p class="text-slate-500 text-sm mt-3 font-mono">/// CAPTION 2</p>
  </div>
</div>
```

### Step 4: Adding Images

#### Option 1: Images in `src/assets/`

For images processed by Astro (optimization, etc.):

1. Place image in `src/assets/`
2. Reference in frontmatter: `heroImage: '../../assets/my-image.jpg'`
3. Use in content with Astro's Image component (import required)

#### Option 2: Images in `public/media/`

For static assets (videos, large images):

1. Place file in `public/media/`
2. Reference with absolute path: `/media/my-video.mp4`
3. No import needed, works directly in HTML/MDX

### Step 5: File Naming

- Use kebab-case: `my-awesome-post.mdx`
- The filename (without extension) becomes the URL slug
- Example: `gstar-raw-olympics.mdx` → `/blog/gstar-raw-olympics/`

### Complete Example

Here's a complete example blog post:

```mdx
---
title: 'My Awesome Project'
description: 'A deep dive into the technical pipeline behind this amazing project.'
pubDate: 'Jan 15 2025'
heroImage: '../../assets/project-hero.jpg'
featured: true
category: 'Case Study'
tags: ['VFX', 'Houdini', 'Pipeline']
---

## Introduction

This is the introduction to my project.

## The Challenge

Here's what we were trying to solve.

<div class="video-container my-10">
  <video controls class="w-full border border-white/10">
    <source src="/media/project-video.mp4" type="video/mp4" />
  </video>
  <p class="text-slate-500 text-sm mt-3 font-mono">/// PROJECT VIDEO</p>
</div>

## Technical Approach

### Key Features

- Feature one
- Feature two
- Feature three

## Results

The project was a success!
```

### Blog Features

- **Automatic sorting** - Posts are sorted by `pubDate` (newest first)
- **Featured posts** - First post with `featured: true` appears in hero section
- **Related posts** - Automatically finds related posts by category or shared tags
- **Category filtering** - Users can filter posts by category on the blog index
- **Previous/Next navigation** - Automatic navigation between posts
- **RSS feed** - Available at `/rss.xml`

## Project Structure

```text
src/
├── assets/          # Images processed by Astro
├── components/      # Reusable components
├── content/
│   ├── blog/       # Blog posts (MDX files)
│   ├── pages/      # Page content
│   └── sections/   # Homepage sections
├── layouts/         # Page layouts
├── pages/          # Routes
├── styles/         # Global styles
└── utils/          # Utility scripts (AVIF converter, etc.)
```

## Deployment

The site is deployed to Cloudflare Pages. The `pnpm run deploy` command builds the site and deploys it using Wrangler.

Deployment happens automatically on push to the main branch (if configured in Cloudflare Pages dashboard).
