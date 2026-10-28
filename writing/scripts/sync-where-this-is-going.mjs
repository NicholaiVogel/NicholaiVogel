#!/usr/bin/env node
// Rebuilds src/content/writing/where-this-is-going.mdx from the Obsidian note.
// Frontmatter stays as it is in the MDX; the body is regenerated from the note,
// and the note's preview images are swapped for the site's interactive components.
//
//   bun run sync:where-this-is-going          write the MDX
//   bun run sync:where-this-is-going --check  exit 1 if the MDX is out of date

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NOTE = '/mnt/work/life/obsidian-vault/Where this is going.md';
const MDX = path.join(root, 'src/content/writing/where-this-is-going.mdx');
const ASSETS = '../../assets/writing/where-this-is-going';

const COMPONENTS = [
  "import WipeCompare from '../../components/media/WipeCompare.astro'",
  "import Figure from '../../components/media/Figure.astro'",
  "import MediaGrid from '../../components/media/MediaGrid.astro'",
];

// Note image file -> site component. Captions here are the web versions (the
// note's captions describe static side-by-side images, not wipes).
const WIPES = {
  '035': {
    alt: 'SXRS shot 035, the Philadelphia skyline',
    caption: 'SXRS shot 035. The agent-built Philadelphia, generated from public LiDAR and OpenStreetMap data, as a raw beauty render. Drag to wipe to the final frame.',
  },
  '016': {
    alt: 'SXRS shot 016, the Ben Franklin Bridge',
    caption: 'Shot 016. Drag to wipe between the raw beauty render and the final frame.',
  },
  '008': {
    alt: 'SXRS shot 008, the Independence Hall bell tower',
    caption: 'Shot 008. Drag to wipe between the raw beauty render and the final frame.',
  },
};

const attr = (value) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

function convert(note) {
  const imports = new Set();
  const used = new Set();

  let body = note.replace(
    /!\[[^\]]*\]\(attachments\/where-this-is-going\/sxrs-(\d{3})-raw-final\.jpg\)\s*\n\s*\*[^\n]*\*/g,
    (match, shot) => {
      const wipe = WIPES[shot];
      if (!wipe) throw new Error(`No wipe config for shot ${shot}`);
      used.add(shot);
      imports.add(`import sxrs${shot}Raw from '${ASSETS}/sxrs-${shot}-raw.jpg'`);
      imports.add(`import sxrs${shot}Final from '${ASSETS}/sxrs-${shot}-final.jpg'`);
      return `<WipeCompare beforeLabel="Raw render" before={sxrs${shot}Raw} after={sxrs${shot}Final} alt="${attr(wipe.alt)}" caption="${attr(wipe.caption)}" />`;
    },
  );

  body = body.replace(
    /!\[[^\]]*\]\(attachments\/where-this-is-going\/lighthouse-pair\.jpg\)\s*\n\s*\*([^\n]*)\*/g,
    (match, caption) => {
      imports.add(`import lighthouseWide from '${ASSETS}/lighthouse-wide.jpg'`);
      imports.add(`import lighthouseCliff from '${ASSETS}/lighthouse-cliff.jpg'`);
      return [
        '<MediaGrid class="media-grid--pair">',
        '  <Figure src={lighthouseWide} alt="Procedural lighthouse environment on a sea cliff, wide view" />',
        '  <Figure src={lighthouseCliff} alt="Procedural lighthouse environment seen from the cliff path" />',
        '</MediaGrid>',
        `<p class="media-caption">${caption.trim().replace(/</g, '&lt;')}</p>`,
      ].join('\n');
    },
  );

  const leftover = body.match(/!\[[^\]]*\]\([^)]*\)|!\[\[[^\]]*\]\]/g);
  if (leftover) throw new Error(`Unmapped images in the note: ${leftover.join(', ')}`);

  const prose = body
    .replace(/<p class="media-caption">[^\n]*<\/p>/g, '')
    .replace(/<\/?(WipeCompare|MediaGrid|Figure)\b[\s\S]*?>/g, '');
  const risky = prose.match(/[{}<>]/g);
  if (risky) throw new Error(`Note prose contains MDX-sensitive characters: ${[...new Set(risky)].join(' ')}`);

  body = body.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  return { body, imports: [...imports], used: [...used] };
}

const mdx = readFileSync(MDX, 'utf8');
const frontmatter = mdx.match(/^---\n[\s\S]*?\n---\n/);
if (!frontmatter) throw new Error(`No frontmatter in ${MDX}`);

const { body, imports, used } = convert(readFileSync(NOTE, 'utf8'));
const next = `${frontmatter[0]}\n${[...COMPONENTS, ...imports].join('\n')}\n\n${body}\n`;

if (process.argv.includes('--check')) {
  if (next !== mdx) {
    console.error('where-this-is-going.mdx is out of date with the Obsidian note. Run: bun run sync:where-this-is-going');
    process.exit(1);
  }
  console.log('MDX matches the note.');
} else {
  writeFileSync(MDX, next);
  console.log(`Wrote ${path.relative(root, MDX)}: ${body.split(/\s+/).length} words, wipes ${used.join(', ')}`);
}
