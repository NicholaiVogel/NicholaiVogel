# Design Doctrine

The taste layer for standalone websites: concrete composition recipes, heuristics, and anti-patterns with examples. `design-execution.md` records decisions; this file teaches how to make them well. Load it during the art-direction pass and before every design critique.

## The Beauty Bar

Answer these internally before showing any viewport to the user:

1. What is this page's dominant visual idea?
2. What should the viewer notice first, second, and third?
3. Does the layout have a point of view, or is it a competent template?
4. Do typography, spacing, imagery, and interaction reinforce the same idea?
5. Is there a memorable moment or signature treatment?
6. Does the design feel specific to this client and this content?
7. Does it stay intentional once real copy and assets are inserted?
8. Is the restraint or expressiveness deliberate rather than accidental?

A blank answer to 1, 3, or 5 means the design is unfinished, not merely unpolished. Fix it by making composition decisions, not by adding decoration.

## Composition Recipes

| Design problem | Specific guidance | Example |
|---|---|---|
| Hero composition | Choose from copy length, media shape, and page purpose. Never pick a split by default. | Long title + wide image: vertical title/meta stack, then a full-width 16:9 banner. Short title + strong portrait image: an asymmetric split can work. |
| First viewport | One dominant focal point, one supporting layer, one clear next action. | Portfolio home: one featured project, a compact index, a contact action — not six equal cards. |
| Typography | Define type roles before styling elements: display, section heading, body, metadata, utility. | One display title at tight leading; readable body; small quiet metadata. Not every label mono, not every heading oversized. |
| Spacing | A small rhythm of named levels reused everywhere; the largest gap separates major groups. | tight ~0.5-1rem within groups, related ~1.5-2rem, section ~4-6rem, page ~8rem and up. Not 3rem between every card. |
| Color | Every color has a job; the accent identifies interaction, emphasis, or a recurring editorial device. | Accent on links, active filters, hover, one key rule. Neutral surfaces everywhere else. |
| Surfaces | Surfaces group content; they are not decoration. Pick one system: hairlines, tints, or cards. | Editorial mode: hairline dividers and raw text tags. Product mode: tinted cards. Do not mix systems on the same hierarchy level. |
| Component design | Repeated structures feel related without becoming identical boxes. | Project index as rows with metadata and hover reveal instead of a grid of identical cards. |
| Visual signature | One or two distinctive moves make the site specific to the client. | Oversized running label, unusual crop grammar, editorial rule system, kinetic index, project-specific color field. Not five gimmicks stacked. |
| Content hierarchy | Render content by meaning, not by the easiest markup. | Credits with departments and roles become structured rows or a typed component, not a prose paragraph. |
| Responsive behavior | Recompose at narrow widths; never just shrink desktop. | Desktop split hero becomes a clean vertical sequence. A bento gallery becomes single-column media in intentional order. |
| Interaction | Every interaction has a visible purpose and a restrained visual language. | A filter exposes its current state; a lightbox keeps captions and Escape; a hover reveals useful context, not glow. |
| Density | Contrast dense metadata against generous display moments. | Huge display title plus 12px mono metadata reads intentional; medium title plus medium metadata reads template. |

## Choose Composition From Content Geometry

Measure before composing:

- The longest realistic title (character count, expected wrap lines).
- Media orientation and aspect ratio for the primary image.
- Content volume on the primary route (3 projects vs 30).
- Fixed geometry the design must respect (sidebar width, reading measure, aside rail).

Worked example: a case-study title that wraps to three lines next to a landscape still in a 7fr/5fr split squeezes the image into a thumbnail and destroys vertical rhythm. The fix is structural: stack back-link, tags, title, metadata, then place a full-width 16:9 banner beneath. A short two-word title with a strong portrait image can carry the split.

Always test the densest realistic case, not placeholder content. Placeholder titles are short; real titles are long.

## Type Roles

- Display: one per page. Large scale, tight leading (0.95-1.05), slight negative tracking, `text-wrap: balance`.
- Section heading: clearly subordinate to display; one consistent scale step down.
- Body: readable measure (roughly 60-75 characters per line), line-height 1.5-1.7.
- Metadata: small (around 12px), quiet, optionally mono. Dense metadata against a huge display title is an editorial signature, not a defect.
- Utility: labels, captions, navigation — small and consistent.

Anti-patterns: mono for every label; oversized headings at every level; more than two type voices without a reason.

## Spacing Rhythm

Define four or five levels and name them: tight (within a group), related (between related items), section (between major sections), page-scale (top of page, hero separation). The section gap must visibly exceed the related gap — that contrast is what makes grouping legible. Arbitrary per-section margins accumulate into noise.

## Accent Has a Job

Assign the accent color one semantic job and keep it there: interaction (links, hover, active state), emphasis (one key rule, one highlight), or a recurring editorial device (slash delimiters, index markers). If the accent appears on static surfaces for decoration, it stops signaling anything.

## Signature Moves

Pick one or two and let them recur:

- An oversized running label or index system that carries through routes.
- A consistent image-crop grammar (same ratio, baseline captions).
- An editorial rule system: hairlines at one weight used wherever grouping is needed.
- A kinetic index: list rows that reveal media on hover.
- A project-specific color field or typographic moment tied to the client's world.

A signature move repeated with discipline reads as design intent. Five moves stacked read as noise.

## Structural Reset Protocol

When the user rejects a composition, do not defend it or incrementally patch it:

1. Record the superseded decision in the brief: what was rejected and why.
2. Replace the structure in one pass: markup, layout CSS, and the composition's rules.
3. Remove what the old decision created: schema fields, frontmatter keys, dead CSS blocks.
4. Sweep for orphaned selectors and classes before verifying.
5. Verify the rendered result at desktop and narrow widths before reporting.

A rejected composition leaving dead schema fields and zombie CSS behind will resurface later as a bug.

## Anti-Pattern Catalog

| Anti-pattern | Why it fails | Do instead |
|---|---|---|
| Glassmorphic card stack on editorial content | Cards fragment reading flow; blur reads as SaaS | Hairline dividers, raw text metadata, one dominant media moment |
| Pill badges on every metadata piece | Boxes every scalar; visual noise | Raw text tags with faint slash delimiters |
| Thumbnail squeezed beside a long headline | Media becomes a postage stamp; rhythm dies | Full-width banner below the title block |
| Divider severing hero from body | Artificial wall between related content | Let whitespace or the banner do the separating |
| Six identical cards | Equal weight means no hierarchy | Feature one, index the rest |
| Fake statistics or invented metrics | Destroys trust instantly | Real numbers from the client or none |
| Purple gradient mesh hero | Signals AI template | A composition idea tied to actual content |
| Custom cursor | Novelty that taxes usability | A signature move in type, crop, or rhythm instead |
| Decorative motion on everything | Competes with content | A motion budget: one purposeful movement |
