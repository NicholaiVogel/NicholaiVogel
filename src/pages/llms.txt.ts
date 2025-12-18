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

  // Build llms.txt content following the standard format
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

  // Add each blog post
  for (const post of posts) {
    const url = `${site}/blog/${post.id}/`;
    const date = post.data.pubDate.toISOString().split('T')[0];
    lines.push(`- [${post.data.title}](${url}) - ${date}`);
  }

  lines.push('');
  lines.push('## Additional Resources');
  lines.push('');
  lines.push(`- [RSS Feed](${site}/rss.xml)`);
  lines.push(`- [Sitemap](${site}/sitemap-index.xml)`);
  lines.push(`- [Full LLM Context](${site}/llms-full.txt)`);
  lines.push('');

  const body = lines.join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};

