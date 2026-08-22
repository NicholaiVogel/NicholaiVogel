# Astro MDX FAQ accordions

Use when an Astro content/blog route renders plain MDX FAQ sections such as:

```md
## First tattoo FAQ

### Do I need to know exactly what I want?

No. You need a starting point...

### Can I bring a friend?

Ask the studio...
```

## Pattern

For content-heavy client sites, keep FAQ authorship simple in MDX and progressively enhance at the blog layout level:

1. Leave the source MDX semantic and editor-friendly: `h2` for the FAQ section, `h3` for each question, following paragraphs/lists for answers.
2. In the blog post layout, find `h2` headings whose text contains `FAQ`.
3. Collect the following `h3` blocks until the next `h2`.
4. Move each question/answer group into native `<details><summary>...</summary><div>...</div></details>` elements.
5. Run the enhancement both immediately and on `astro:page-load` so it survives Astro view transitions.
6. Style in the global prose/content CSS, not inline in each post.
7. Verify with a build plus browser smoke test: the FAQ wrapper exists, item count matches expected questions, collapsed count/open behavior works, and visual spacing/contrast still match the site.

## Example layout script

```astro
<script>
  const enhanceFaqAccordions = () => {
    const proseBlocks = document.querySelectorAll('.prose-editorial');

    proseBlocks.forEach((prose) => {
      const headings = Array.from(prose.querySelectorAll('h2'));
      const faqHeadings = headings.filter((heading) => /\bfaq\b/i.test(heading.textContent ?? ''));

      faqHeadings.forEach((heading) => {
        if (heading.nextElementSibling?.classList.contains('faq-accordion')) return;

        const items = [];
        let current = heading.nextElementSibling;

        while (current && current.tagName !== 'H2') {
          if (current.tagName !== 'H3') {
            current = current.nextElementSibling;
            continue;
          }

          const question = current;
          const answerNodes = [];
          let answerNode = question.nextElementSibling;

          while (answerNode && answerNode.tagName !== 'H2' && answerNode.tagName !== 'H3') {
            answerNodes.push(answerNode);
            answerNode = answerNode.nextElementSibling;
          }

          items.push({ question, answerNodes });
          current = answerNode;
        }

        if (items.length === 0) return;

        const accordion = document.createElement('div');
        accordion.className = 'faq-accordion';
        heading.insertAdjacentElement('afterend', accordion);

        items.forEach(({ question, answerNodes }) => {
          const details = document.createElement('details');
          details.className = 'faq-item';

          const summary = document.createElement('summary');
          summary.className = 'faq-question';
          summary.textContent = question.textContent ?? '';

          const answer = document.createElement('div');
          answer.className = 'faq-answer';
          answerNodes.forEach((node) => answer.appendChild(node));

          details.append(summary, answer);
          accordion.append(details);
          question.remove();
        });
      });
    });
  };

  document.addEventListener('astro:page-load', enhanceFaqAccordions);
  enhanceFaqAccordions();
</script>
```

## Minimal CSS shape

Keep the site's prose typography and brand tokens. A dark editorial site usually wants subtle separators rather than card chrome:

```css
.prose-editorial {
  & .faq-accordion {
    max-width: 65ch;
    margin-top: 2.25rem;
    border-top: 1px solid var(--border);
  }

  & .faq-item {
    border-bottom: 1px solid var(--border);
  }

  & .faq-question {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
    padding: 1.5rem 3rem 1.5rem 0;
    color: var(--secondary-foreground);
    cursor: pointer;
    font-family: var(--font-sans);
    font-size: 1.5rem;
    font-weight: 500;
    line-height: 1.2;
    list-style: none;
    transition: color 0.25s ease;
  }

  & .faq-question::-webkit-details-marker { display: none; }

  & .faq-question::after {
    content: '+';
    position: absolute;
    right: 0;
    top: 50%;
    color: var(--muted-foreground);
    font-family: var(--font-mono);
    transform: translateY(-50%);
    transition: color 0.25s ease, transform 0.25s ease;
  }

  & .faq-question:hover,
  & .faq-question:focus-visible { color: var(--foreground); }

  & .faq-question:focus-visible {
    outline: 1px solid var(--ring);
    outline-offset: 6px;
  }

  & .faq-item[open] .faq-question::after {
    color: var(--foreground);
    transform: translateY(-50%) rotate(45deg);
  }

  & .faq-answer { padding: 0 3rem 1.75rem 0; }
}
```

## Pitfalls

- Do not hard-code FAQ content in a component if the site already uses MDX content collections; preserve author-friendly source content.
- Avoid replacing semantic headings at build time unless you also preserve accessible summary labels.
- Guard against double enhancement, especially when Astro view transitions are enabled.
- Native `<details>` gives keyboard behavior and collapsed content without a framework dependency.
- If SEO schema needs FAQPage JSON-LD later, derive it from the same content model or a frontmatter field instead of scraping enhanced DOM at runtime.
