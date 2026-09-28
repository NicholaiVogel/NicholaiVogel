import { getCollection, type CollectionEntry } from 'astro:content';

export type WritingEntry = CollectionEntry<'writing'>;

export async function getWritingEntries(includeDrafts = false) {
  const entries = await getCollection('writing', (entry) => includeDrafts || !entry.data.draft);
  return entries.sort((a: WritingEntry, b: WritingEntry) => dateValue(b) - dateValue(a));
}

export function dateValue(entry: WritingEntry) {
  return (entry.data.created ?? entry.data.modified ?? new Date(0)).getTime();
}

export function formatDate(entry: WritingEntry) {
  const date = entry.data.created ?? entry.data.modified;
  if (!date) return 'undated';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function slugFor(entry: WritingEntry) {
  return entry.data.title
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function readingTime(body = '') {
  const words = body.replace(/```[\s\S]*?```/g, '').trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

export function excerpt(body = '', length = 190) {
  const text = body
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/!\[\[[^\]]*\]\]/g, '')
    .replace(/[#>*_`~\[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= length) return text;
  return `${text.slice(0, length).replace(/\s+\S*$/, '')}…`;
}

export function tagGroups(entries: WritingEntry[]) {
  const groups = new Map<string, Map<string, string>>();
  for (const entry of entries) {
    for (const tag of entry.data.tags) {
      const [group, ...rest] = tag.split('/');
      const value = rest.length ? rest.join('/') : group;
      if (!groups.has(group)) groups.set(group, new Map());
      groups.get(group)?.set(tag, value);
    }
  }
  return [...groups.entries()].map(([group, values]) => ({ group, values: [...values.entries()] }));
}

export function displayTag(tag: string) {
  return tag.split('/').slice(1).join(' / ') || tag;
}

/* One tag per card on listings: the deepest segment of the note-type tag
   (note-type/writing/case-study -> case-study; note-type/recipe -> recipe). */
export function primaryTag(tags: string[]) {
  const noteType = tags.find((tag) => tag.toLowerCase().startsWith('note-type/'));
  const source = noteType ?? tags[0] ?? '';
  const segments = source.split('/').filter(Boolean);
  return segments[segments.length - 1] || source;
}

export function displayTags(tags: string[]) {
  const seen = new Set<string>();
  return tags
    .flatMap((tag) => {
      const parts = tag.split('/');
      return parts.length > 1 ? parts.slice(1) : parts;
    })
    .map((tag) => tag.trim())
    .filter((tag) => {
      const key = tag.toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export function titleCase(value: string) {
  return value.replace(/[-_]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}
