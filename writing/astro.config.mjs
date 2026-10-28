// @ts-check

import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { draftPaths } from './scripts/draft-paths.mjs';

export default defineConfig({
  site: 'https://blog.nicholai.work',
  trailingSlash: 'always',
  server: { port: 4322 },
  integrations: [
    react(),
    mdx(),
    sitemap({
      filter: (page) => !draftPaths().some((draft) => page.endsWith(draft)),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
