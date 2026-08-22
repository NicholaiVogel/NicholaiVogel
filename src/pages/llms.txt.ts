import type { APIRoute } from 'astro';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';

export const prerender = true;

export const GET: APIRoute = async (context) => {
  const site = context.site?.toString().replace(/\/$/, '') ?? 'https://nicholai.work';

  // Build llms.txt content following the standard format
  const lines: string[] = [
    `# ${SITE_TITLE}`,
    '',
    `> ${SITE_DESCRIPTION}`,
    '',
    '## Pages',
    '',
    `- [Home](${site}/)`,
    `- [Contact](${site}/contact/)`,
    '',
    '## Writing',
    '',
    `- [Writing (external)](https://blog.nicholai.work/) - essays, journalism, and technical writing`,
    `- [Writing RSS](https://blog.nicholai.work/rss.xml)`,
    '',
    '## Additional Resources',
    '',
    `- [Sitemap](${site}/sitemap-index.xml)`,
    '',
  ];

  const body = lines.join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
