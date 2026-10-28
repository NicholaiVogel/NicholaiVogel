import rss from '@astrojs/rss';
import { excerpt, getWritingEntries, slugFor } from '../lib/writing';
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from '../consts';

export async function GET(context) {
  const entries = await getWritingEntries();
  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site ?? SITE_URL,
    items: entries.map((entry) => ({
      title: entry.data.title,
      description: entry.data.description ?? excerpt(entry.body, 220),
      pubDate: entry.data.created,
      link: `/writing/${slugFor(entry)}/`,
    })),
    customData: '<language>en-us</language>',
  });
}
