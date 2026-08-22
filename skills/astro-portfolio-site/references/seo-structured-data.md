# SEO & Structured Data

## StructuredData.astro

Generic JSON-LD renderer — copy verbatim:

```astro
---
interface Props {
  data: Record<string, unknown>;
}
const { data } = Astro.props;
---
<script type="application/ld+json" set:html={JSON.stringify(data)} />
```

## BaseHead.astro

```astro
---
import '../styles/global.css';
import type { ImageMetadata } from 'astro';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';

interface Props {
  title: string;
  description: string;
  image?: ImageMetadata;
  type?: 'website' | 'article';
  publishedTime?: Date;
  modifiedTime?: Date;
  robots?: string;
}

const canonicalURL = new URL(Astro.url.pathname, Astro.site);
const { title, description, image, type = 'website', publishedTime, modifiedTime, robots } = Astro.props;
const ogImageUrl = image
  ? new URL(image.src, Astro.url).toString()
  : new URL('/og-default.jpg', Astro.site).toString();
---

<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="generator" content={Astro.generator} />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
<link rel="icon" type="image/png" sizes="192x192" href="/favicon-192.png" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="{{GOOGLE_FONTS_URL}}" rel="stylesheet" />
<link rel="preload" href="/assets/fonts/{{FONT_FILE}}.woff2" as="font" type="font/woff2" crossorigin />
<link rel="canonical" href={canonicalURL} />
<link rel="alternate" type="application/rss+xml" title="{{COMPANY}} Blog" href="/rss.xml" />
{robots && <meta name="robots" content={robots} />}

<title>{title}</title>
<meta name="title" content={title} />
<meta name="description" content={description} />

<meta property="og:image" content={ogImageUrl} />
<meta property="og:site_name" content="{{COMPANY}}" />
<meta property="og:type" content={type} />
<meta property="og:url" content={Astro.url} />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="{{TWITTER_HANDLE}}" />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image" content={ogImageUrl} />

{publishedTime && <meta property="article:published_time" content={publishedTime.toISOString()} />}
{modifiedTime && <meta property="article:modified_time" content={modifiedTime.toISOString()} />}
```

## Organization Schema (every page, via BaseLayout)

```typescript
{
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: '{{COMPANY}}',
  url: '{{SITE_URL}}',
  logo: '{{SITE_URL}}/favicon-192.png',
  sameAs: [
    // Include only applicable social links
    SOCIAL_LINKS.steam,
    SOCIAL_LINKS.twitter,
    SOCIAL_LINKS.discord,
  ],
}
```

## Article Schema (blog posts, via BlogPost layout)

```typescript
const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: title,
  description,
  datePublished: pubDate.toISOString(),
  ...(updatedDate && { dateModified: updatedDate.toISOString() }),
  ...(heroImage && { image: new URL(heroImage.src, Astro.url).toString() }),
  author: {
    '@type': 'Organization',
    name: '{{COMPANY}}',
    url: '{{SITE_URL}}',
  },
  publisher: {
    '@type': 'Organization',
    name: '{{COMPANY}}',
    url: '{{SITE_URL}}',
    logo: { '@type': 'ImageObject', url: '{{SITE_URL}}/favicon-192.png' },
  },
};
```

## BreadcrumbList Schema (blog posts)

```typescript
const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: '{{SITE_URL}}/' },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: '{{SITE_URL}}/blog/' },
    { '@type': 'ListItem', position: 3, name: title },
  ],
};
```

## VideoGame Schema (for game product pages)

```typescript
{
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: '{{GAME_NAME}}',
  description: '{{GAME_DESCRIPTION}}',
  url: '{{GAME_URL}}',
  gamePlatform: ['PC'],
  applicationCategory: 'Game',
  operatingSystem: 'Windows',
  author: {
    '@type': 'Organization',
    name: '{{COMPANY}}',
  },
}
```

## Product Schema (for product pages)

```typescript
{
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: '{{PRODUCT_NAME}}',
  description: '{{PRODUCT_DESCRIPTION}}',
  brand: { '@type': 'Brand', name: '{{COMPANY}}' },
  offers: {
    '@type': 'Offer',
    price: '{{PRICE}}',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
  },
}
```

## LocalBusiness Schema (for service businesses)

```typescript
{
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: '{{COMPANY}}',
  url: '{{SITE_URL}}',
  email: '{{CONTACT_EMAIL}}',
  address: {
    '@type': 'PostalAddress',
    addressLocality: '{{CITY}}',
    addressRegion: '{{STATE}}',
    addressCountry: 'US',
  },
}
```

## robots.txt

```
User-agent: *
Allow: /

LLM-Policy: /llms.txt
Sitemap: {{SITE_URL}}/sitemap-index.xml
```

## RSS Feed (src/pages/rss.xml.ts)

```typescript
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';

export const prerender = true;

export async function GET(context: APIContext) {
  const posts = await getCollection('blog');
  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site!,
    items: posts.map((post) => ({
      ...post.data,
      link: `/blog/${post.id}/`,
    })),
  });
}
```

## LLM Context: llms.txt (src/pages/llms.txt.ts)

```typescript
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';

export const prerender = true;

export const GET: APIRoute = async (context) => {
  const site = context.site?.toString().replace(/\/$/, '') ?? '{{SITE_URL}}';
  const posts = (await getCollection('blog')).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );

  const lines: string[] = [
    `# ${SITE_TITLE}`,
    '',
    `> ${SITE_DESCRIPTION}`,
    '',
    '## Pages',
    '',
    `- [Home](${site}/)`,
    `- [Blog](${site}/blog/)`,
    `- [Contact](${site}/contact/)`,
    '',
    '## Blog Posts',
    '',
  ];

  for (const post of posts) {
    const url = `${site}/blog/${post.id}/`;
    const date = post.data.pubDate.toISOString().split('T')[0];
    lines.push(`- [${post.data.title}](${url}) - ${date}`);
  }

  lines.push('', '## Additional Resources', '',
    `- [RSS Feed](${site}/rss.xml)`,
    `- [Sitemap](${site}/sitemap-index.xml)`,
    `- [Full LLM Context](${site}/llms-full.txt)`,
    '');

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
```

## LLM Full Context: llms-full.txt (src/pages/llms-full.txt.ts)

```typescript
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';

export const prerender = true;

export const GET: APIRoute = async (context) => {
  const site = context.site?.toString().replace(/\/$/, '') ?? '{{SITE_URL}}';
  const posts = (await getCollection('blog')).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );

  const lines: string[] = [
    `# ${SITE_TITLE}`,
    '',
    `> ${SITE_DESCRIPTION}`,
    '',
    '## About This File',
    '',
    'Full content of all blog posts, formatted for LLM consumption.',
    'For a shorter index, see /llms.txt',
    '',
    '## Pages',
    '',
    `- [Home](${site}/)`,
    `- [Blog](${site}/blog/)`,
    `- [Contact](${site}/contact/)`,
    '',
    '---',
    '',
    '## Blog Posts',
    '',
  ];

  for (const post of posts) {
    const url = `${site}/blog/${post.id}/`;
    const date = post.data.pubDate.toISOString().split('T')[0];
    const category = post.data.category ?? 'Uncategorized';
    const tags = post.data.tags?.join(', ') ?? '';

    lines.push(`### ${post.data.title}`, '',
      `- **URL**: ${url}`,
      `- **Date**: ${date}`,
      `- **Category**: ${category}`);
    if (tags) lines.push(`- **Tags**: ${tags}`);
    lines.push(`- **Description**: ${post.data.description}`, '',
      '#### Content', '',
      post.body || '*No content body available*',
      '', '---', '');
  }

  lines.push('## Additional Resources', '',
    `- [RSS Feed](${site}/rss.xml)`,
    `- [Sitemap](${site}/sitemap-index.xml)`, '');

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
```

## URL Pattern

All blog URLs: `/blog/${post.id}/` with trailing slash. Consistent across blog listing, homepage featured posts, search index, RSS feed, and LLM context files.
