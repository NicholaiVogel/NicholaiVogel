import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';

export const prerender = true;

export const GET: APIRoute = async (context) => {
  const site = context.site?.toString().replace(/\/$/, '') ?? 'https://nicholai.work';
  
  // Fetch and sort blog posts by date (newest first)
  const posts = (await getCollection('blog')).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );

  // Build llms-full.txt content with full post bodies
  const lines: string[] = [
    `# ${SITE_TITLE}`,
    '',
    `> ${SITE_DESCRIPTION}`,
    '',
    '## About This File',
    '',
    'This file contains the full content of all blog posts on this site, formatted for LLM consumption.',
    'For a shorter index of available content, see /llms.txt',
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

  // Add each blog post with full content
  for (const post of posts) {
    const url = `${site}/blog/${post.id}/`;
    const date = post.data.pubDate.toISOString().split('T')[0];
    const category = post.data.category ?? 'Uncategorized';
    const tags = post.data.tags?.join(', ') ?? '';
    
    lines.push(`### ${post.data.title}`);
    lines.push('');
    lines.push(`- **URL**: ${url}`);
    lines.push(`- **Date**: ${date}`);
    lines.push(`- **Category**: ${category}`);
    if (tags) {
      lines.push(`- **Tags**: ${tags}`);
    }
    lines.push(`- **Description**: ${post.data.description}`);
    lines.push('');
    lines.push('#### Content');
    lines.push('');
    // Include the raw body content (MDX source)
    if (post.body) {
      lines.push(post.body);
    } else {
      lines.push('*No content body available*');
    }
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  lines.push('## Additional Resources');
  lines.push('');
  lines.push(`- [RSS Feed](${site}/rss.xml)`);
  lines.push(`- [Sitemap](${site}/sitemap-index.xml)`);
  lines.push('');

  const body = lines.join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};

