# Blog Infrastructure

## Content Collection Config (src/content.config.ts)

Uses Astro 5 Content Layer API (NOT the legacy v2 API):

```typescript
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      heroImage: image().optional(),
      featured: z.boolean().optional().default(false),
      category: z.string().optional(),
      tags: z.array(z.string()).optional(),
    }),
});

export const collections = { blog };
```

Key points:
- `image()` from the schema callback enables Astro image optimization for hero images
- `z.coerce.date()` auto-converts date strings to Date objects
- `featured` defaults to false — used to highlight posts on homepage/blog listing

## Blog Post Frontmatter

```yaml
---
title: "Post Title Here"
description: "SEO description under 160 characters."
pubDate: 2026-01-15
heroImage: ./images/hero-image.jpg
featured: true
category: "announcement"
tags: ["tag-one", "tag-two"]
---
```

Hero images stored in `src/content/blog/images/` and referenced with relative paths.

## Blog Listing (src/pages/blog/index.astro)

The following is one editorial implementation pattern, not a universal default. Choose the listing composition from the project’s content mode and execution contract; a reading site may need a chronological list, while an image-led publication may justify a featured post and grid.

Pattern: featured post hero + category filter strip + post grid + sidebar

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import BlogCard from '../../components/BlogCard.astro';
import BlogSearch from '../../components/BlogSearch';
import { calculateReadingTime } from '../../utils/reading-time';

const posts = (await getCollection('blog')).sort(
  (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
);

const featuredPost = posts.find((p) => p.data.featured) || posts[0];
const otherPosts = posts.filter((p) => p.id !== featuredPost?.id);
const categories = [...new Set(posts.map((p) => p.data.category).filter(Boolean))];
const allTags = [...new Set(posts.flatMap((p) => p.data.tags || []))];
---
```

Layout structure:
1. Navigation (`client:load`)
2. Header with title + BlogSearch (`client:idle`)
3. Category filter strip (horizontally scrollable on mobile)
4. Featured post (large card, lg:row-span-3 on desktop)
5. Post grid (1 col mobile, 2 cols tablet, 3 cols xl)
6. Sidebar (xl+ only, sticky): recent posts, categories, tags
7. Footer

## Dynamic Post Route (src/pages/blog/[...slug].astro)

Uses rest parameter `[...slug]` for nested slug support:

```astro
---
import { getCollection, render } from 'astro:content';
import BlogPost from '../../layouts/BlogPost.astro';
import { calculateReadingTime } from '../../utils/reading-time';

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map((post) => ({
    params: { slug: post.id },
    props: post,
  }));
}

const post = Astro.props;
const { Content, headings } = await render(post);
const readTime = calculateReadingTime(post.body);
---

<BlogPost
  title={post.data.title}
  description={post.data.description}
  pubDate={post.data.pubDate}
  updatedDate={post.data.updatedDate}
  heroImage={post.data.heroImage}
  category={post.data.category}
  tags={post.data.tags}
  readTime={readTime}
  headings={headings}
>
  <Content />
</BlogPost>
```

**Important**: Astro 5 uses `render(post)` (imported from `astro:content`), NOT `post.render()`.

## Tag Archive (src/pages/blog/tag/[tag].astro)

```astro
---
import { getCollection } from 'astro:content';
// ... imports

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  const tags = [...new Set(posts.flatMap((p) => p.data.tags || []))];
  return tags.map((tag) => ({
    params: { tag },
    props: {
      tag,
      posts: posts
        .filter((p) => p.data.tags?.includes(tag))
        .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()),
    },
  }));
}

const { tag, posts } = Astro.props;
---
```

## Category Archive (src/pages/blog/category/[category].astro)

Same pattern as tag archive but filtering on `post.data.category`.

## BlogCard.astro

Props: `{ title, description, pubDate, href, heroImage?, readTime?, category? }`

Structure:
- Link wraps entire card
- Optional hero image (h-44/h-48, gradient overlay at bottom)
- Metadata row: category badge (accent color, pixel font), date, read time
- Title with hover color transition
- Description (line-clamp-2)
- Touch feedback: `:active` scales 0.985 with 80ms transition

## FeaturedPosts.astro

Props: `{ posts: Post[] }` (max 4 posts)

Layout:
- Header with "FROM THE BLOG" + "VIEW ALL" link
- Featured post takes full row height on desktop (lg:row-span-3)
- Remaining posts in 2-column grid
- Atmospheric overlays: noise texture, radial glows

## BlogSearch.tsx (client:idle)

Lazy-loaded Fuse.js search:

```typescript
// State
const [query, setQuery] = useState('');
const [results, setResults] = useState([]);
const [isReady, setIsReady] = useState(false);
const fuseRef = useRef(null);

// Lazy load search index on first focus
const loadSearchIndex = async () => {
  if (isReady) return;
  const res = await fetch('/search.json');
  const data = await res.json();
  fuseRef.current = new Fuse(data, {
    keys: [
      { name: 'title', weight: 3 },
      { name: 'description', weight: 2 },
      { name: 'tags', weight: 1.5 },
      { name: 'category', weight: 1 },
      { name: 'content', weight: 0.5 },
    ],
    threshold: 0.3,
    minMatchCharLength: 2,
  });
  setIsReady(true);
};

// Keyboard shortcuts: "/" to focus, ESC to close
// Click outside to close
// Query triggers search when >= 2 chars, limits to 6 results
```

## Search Index (src/pages/search.json.ts)

```typescript
import { getCollection } from 'astro:content';

export const prerender = true;

export async function GET() {
  const posts = await getCollection('blog');
  const searchData = posts.map((post) => ({
    id: post.id,
    title: post.data.title,
    description: post.data.description,
    content: post.body ?? '',
    category: post.data.category || '',
    tags: post.data.tags || [],
    url: `/blog/${post.id}/`,
    pubDate: post.data.pubDate.toISOString(),
  }));

  return new Response(JSON.stringify(searchData), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
```

## FormattedDate.astro

```astro
---
interface Props { date: Date; }
const { date } = Astro.props;
---
<time datetime={date.toISOString()}>
  {date.toLocaleDateString('en-us', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })}
</time>
```

## BlogPost Layout

See `references/seo-structured-data.md` for the Article + Breadcrumb JSON-LD patterns used in this layout.

Key features:
- Mobile TOC: `<details>` with `+` toggle that rotates 45deg on open
- Desktop TOC: sticky aside (top-24, w-56) with border-l navigation
- Prose styling: Tailwind typography with brand color overrides for headings, links, code, blockquotes
- Hero image bleeds to edges on mobile (`-mx-5`, `max-width: calc(100% + 2.5rem)`)
- Safe area bottom padding for iOS
- 44px touch targets on all interactive elements
