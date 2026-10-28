// Draft posts are still built (they are reachable by URL for previews) but
// should not be advertised in the sitemap. Reads frontmatter directly because
// the sitemap filter runs outside the content layer.
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src/content/writing');

const field = (frontmatter, name) => {
  const match = frontmatter.match(new RegExp(`^${name}:\\s*(.+)$`, 'm'));
  return match ? match[1].trim().replace(/^['"]|['"]$/g, '') : undefined;
};

const slugify = (title) =>
  title.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function draftPaths() {
  return readdirSync(dir)
    .filter((file) => /\.mdx?$/.test(file))
    .flatMap((file) => {
      const frontmatter = readFileSync(path.join(dir, file), 'utf8').match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
      const draft = field(frontmatter, 'draft');
      if (draft === 'false') return [];
      const slug = field(frontmatter, 'slug') ?? slugify(field(frontmatter, 'title') ?? '');
      return slug ? [`/writing/${slug}/`] : [];
    });
}
