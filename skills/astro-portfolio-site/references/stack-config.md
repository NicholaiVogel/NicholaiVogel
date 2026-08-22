# Stack Configuration

## astro.config.mjs

```javascript
// @ts-check
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

export default defineConfig({
  site: '{{SITE_URL}}',  // e.g. 'https://example.com'
  integrations: [
    mdx(),
    sitemap({
      filter: (page) =>
        !['/404', '/privacy', '/terms', '/shop'].some((p) => page.includes(p)),
    }),
    react(),
  ],
  adapter: cloudflare({
    platformProxy: { enabled: true },
    imageService: "compile"
  }),
  vite: {
    plugins: [tailwindcss()],
  },
});
```

Key notes:

Use this as a reconciliation reference, not a mandatory dependency bundle. Start from the project’s existing Astro version, integrations, scripts, content model, and deployment contract. Add only the integrations justified by the design brief and native-feature audit.

- `site` is used for canonical URLs, OG tags, sitemap, RSS
- Sitemap filter excludes legal, 404, and shop pages
- `platformProxy: { enabled: true }` gives access to Cloudflare bindings in dev
- `imageService: "compile"` uses Astro's built-in image optimization
- No separate tailwind.config or postcss.config — Tailwind 4 uses Vite plugin

## tsconfig.json

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"],
  "compilerOptions": {
    "strictNullChecks": true,
    "types": ["./worker-configuration.d.ts", "node"],
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] },
    "jsx": "react-jsx",
    "jsxImportSource": "react"
  }
}
```

## wrangler.jsonc

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "{{PROJECT_NAME}}",
  "compatibility_date": "2025-12-05",
  "compatibility_flags": ["nodejs_compat"],
  "pages_build_output_dir": "./dist",
  "observability": { "enabled": true },
  "vars": {
    "CONTACT_EMAIL": "{{CONTACT_EMAIL}}"
  }
}
```

**Critical**: Pages does NOT support `account_id` or `ratelimits` in config. Wrangler will reject the deploy. Set account ID via env var, configure rate limiting in dashboard.

## package.json scripts

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro build && wrangler pages dev",
    "astro": "astro",
    "deploy": "astro build && wrangler pages deploy",
    "cf-typegen": "wrangler types",
    "convert:avif": "node src/utils/convert-to-avif.js",
    "convert:avif:all": "node src/utils/convert-to-avif.js --all",
    "convert:avif:jpeg": "node src/utils/convert-to-avif.js --jpeg",
    "convert:avif:png": "node src/utils/convert-to-avif.js --png",
    "commit": "node src/utils/git-commit.js"
  }
}
```

**Critical**: `bun build` invokes bun's bundler, not astro's. Always use `bun run build`.

## Dependencies

```json
{
  "dependencies": {
    "@astrojs/cloudflare": "^12.6.12",
    "@astrojs/mdx": "^4.3.12",
    "@astrojs/react": "^4.4.2",
    "@astrojs/rss": "^4.0.14",
    "@astrojs/sitemap": "^3.6.0",
    "@react-email/components": "^1.0.8",
    "@tailwindcss/typography": "^0.5.19",
    "@tailwindcss/vite": "^4.1.17",
    "@types/react": "^19.2.7",
    "@types/react-dom": "^19.2.3",
    "astro": "^5.16.4",
    "clsx": "^2.1.1",
    "fuse.js": "^7.1.0",
    "gsap": "^3.14.2",
    "react": "^19.2.1",
    "react-dom": "^19.2.1",
    "react-icons": "^5.5.0",
    "resend": "^6.9.2",
    "sharp": "^0.34.3",
    "tailwind-merge": "^3.4.0",
    "tailwindcss": "^4.1.17"
  },
  "devDependencies": {
    "@types/node": "^24.10.1",
    "wrangler": "^4.53.0"
  }
}
```

## src/env.d.ts

```typescript
type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {}
}

interface Env {
  RESEND_API_KEY: string;
  CONTACT_RATE_LIMITER: RateLimit;
}
```

## src/consts.ts

```typescript
export const SITE_TITLE = '{{COMPANY_NAME}} — {{TAGLINE}}';
export const SITE_DESCRIPTION = '{{SEO_DESCRIPTION}}';
export const HTML_MARKER = "Built by {{COMPANY_NAME}}";

export const SOCIAL_LINKS = {
  email: '{{CONTACT_EMAIL}}',
  website: '{{SITE_URL}}',
  // Include only the ones the client has:
  // steam: 'https://store.steampowered.com/...',
  // twitter: 'https://twitter.com/...',
  // discord: 'https://discord.gg/...',
  // instagram: 'https://instagram.com/...',
  // github: 'https://github.com/...',
};
```

## src/lib/utils.ts

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## src/utils/reading-time.ts

```typescript
export function calculateReadingTime(content: string | undefined, wordsPerMinute: number = 200): string {
  const wordCount = content?.split(/\s+/).length || 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  return `${readingTime} min read`;
}
```

## worker-configuration.d.ts

Generated by `bun cf-typegen`. Run this after initial setup to generate Cloudflare Worker runtime types.
