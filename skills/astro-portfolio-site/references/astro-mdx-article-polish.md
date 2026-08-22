# Astro MDX article rendering polish

Use when an Astro content/blog route renders long MDX posts that are technically correct but feel like a plain markdown dump: long repeated `h2 -> paragraphs -> list` sections, low scanability, weak conversion paths, unused desktop side space, or static FAQ blocks.

## Goal

Turn content-heavy posts into designed editorial pages while preserving author-friendly MDX and Astro content collections.

## Pattern

1. Keep MDX posts semantic and simple: `h2` for sections, `h3` for subquestions/FAQ questions, normal paragraphs and lists.
2. In the blog route, derive article structure from `post.body` before rendering:
   - Extract `##` headings with `/^##\s+(.+)$/gm`.
   - Slugify text into stable heading IDs.
   - Use that list for desktop and mobile table-of-contents navigation.
3. Render a desktop utility layout:
   - Main article column plus a sticky right rail on wide screens.
   - Right rail: `In this article` heading links, plus a small booking/contact CTA.
   - Mobile: collapse the same headings into a top `<details>` section nav.
4. Add editorial conversion points that feel native to the brand:
   - A bordered intro CTA near the top for booking/routing help.
   - Related reading after the article, selected by shared tags and recency.
   - Keep CTA copy specific to the business, not generic SaaS phrasing.
5. Improve prose rhythm globally:
   - Treat the first paragraph as a larger lead/dek.
   - Slightly brighten long-form body text on black backgrounds.
   - Add `scroll-margin-top` to headings so TOC links do not hide under sticky nav.
   - Turn long lists into subtle bordered panels when the post is practical/checklist-heavy.
6. Enhance FAQ sections progressively using `references/astro-mdx-faq-accordions.md` when MDX uses `## ... FAQ` followed by `###` questions.
7. Verify with both build and browser inspection:
   - `pnpm build` passes.
   - TOC link count matches heading count.
   - H2 IDs are present.
   - Related-reading count is expected.
   - FAQ accordions render and click open.
   - Visual smoke test confirms spacing, contrast, and no broken desktop/mobile layout.

## Implementation sketch

Route frontmatter can derive headings and related posts:

```ts
const slugifyHeading = (value: string) => value
  .toLowerCase()
  .replace(/[^a-z0-9\s-]/g, '')
  .trim()
  .replace(/\s+/g, '-');

const headings = Array.from(post.body.matchAll(/^##\s+(.+)$/gm))
  .map((match) => {
    const text = match[1].trim();
    return { text, id: slugifyHeading(text) };
  })
  .filter((heading) => heading.id.length > 0);

const relatedPosts = posts
  .filter((candidate) => candidate.id !== post.id && !candidate.data.draft)
  .map((candidate) => ({
    post: candidate,
    score: candidate.data.tags.filter((tag) => post.data.tags.includes(tag)).length,
  }))
  .sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.post.data.publishDate.getTime() - a.post.data.publishDate.getTime();
  })
  .slice(0, 3)
  .map(({ post }) => post);
```

Client-side enhancement can assign heading IDs and list-panel classes after render:

```js
const enhanceBlogArticle = () => {
  document.querySelectorAll('.prose-editorial').forEach((prose) => {
    prose.querySelectorAll('h2').forEach((heading) => {
      if (!heading.id) heading.id = slugifyHeading(heading.textContent ?? '');
    });

    prose.querySelectorAll('ul, ol').forEach((list) => {
      if (!list.closest('.faq-answer')) list.classList.add('editorial-list-panel');
    });
  });
};

document.addEventListener('astro:page-load', enhanceBlogArticle);
enhanceBlogArticle();
```

Use the same enhancement function to call the FAQ accordion conversion from `references/astro-mdx-faq-accordions.md` so Astro view transitions run one article-enhancement pass.

## CSS cues for dark editorial blogs

- Use borders and low-opacity surface shifts, not card-heavy SaaS chrome.
- Keep body copy readable on black: `color-mix(in srgb, var(--brand-paper) 66%, transparent)` or equivalent is often better than very dim muted gray.
- Make the first prose paragraph a true lead: larger type, wider max width, subtle bottom rule.
- Give list panels just enough structure to scan without turning every list into a separate card.
- Use numbered TOC rows in the sidebar to make empty right-side space useful.

## Pitfalls

- Do not make the article layout depend on hand-authored component imports in every MDX file unless the client wants that authoring burden.
- Guard DOM enhancement against double-running on Astro page transitions.
- Do not add broad list-panel styling inside FAQ answers; nested FAQ answer lists should remain compact.
- If a heading slug algorithm is used both server-side and client-side, keep the two implementations identical.
- Verify visually. Build success does not prove long-form rhythm, contrast, or sticky sidebar behavior feels good.
