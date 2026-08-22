import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const writing = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/writing' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    created: z.coerce.date().optional(),
    modified: z.coerce.date().optional(),
    image: image().optional(),
    tags: z.array(z.string()).default([]),
    description: z.string().optional(),
    draft: z.boolean().default(true),
  }),
});

export const collections = { writing };
