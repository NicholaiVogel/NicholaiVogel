# Visual QA and Design Loop

Visual QA is rendered evidence, not a source-code inspection. Use the running Astro dev server, browser or desktop tools, and `vision_analyze` when a screenshot or visual reading is needed. `bun run build` proves compilation; it does not prove layout, hierarchy, content rendering, or state behavior.

## Required Loop

1. Start one healthy `bun run dev` process through the `terminal` tool.
2. Open the priority route in the browser and keep the server alive.
3. Change CSS, components, content, and tokens through the normal edit workflow.
4. Confirm Astro hot reload/HMR updates the rendered page without restarting the server.
5. Inspect the vertical slice at representative widths and states.
6. Fix P0 and P1 defects before broad implementation or user review.
7. Recheck the same route after every structural change.

Restart only after dependency changes, Astro/Vite/Wrangler configuration changes, environment changes, or an actual server failure. Do not restart as a substitute for inspecting stale browser state.

## Minimum Render Matrix

Use browser tooling or an equivalent deterministic harness to inspect:

| Dimension | Minimum cases |
|---|---|
| Width | narrow phone around 375px, tablet boundary around 768px, desktop around 1440px |
| Theme | system default, explicit light, explicit dark when supported |
| Content | short title, long title, realistic prose, headings, lists, links, images, and empty state when applicable |
| Navigation | direct load, internal link, back/forward navigation, refreshed detail route |
| Interaction | keyboard focus, menu open/close, form states, filters, theme toggle, touch-sized controls |
| Motion | normal motion and `prefers-reduced-motion: reduce` |

These are verification widths, not universal design values.

## Geometry Checks

Inspect the rendered result, not just the CSS declarations:

- No horizontal overflow at narrow widths.
- Parent grids collapse or recompose instead of forcing a desktop side column into a text strip.
- Body copy has a readable measure and line-height.
- Headings wrap without clipping, overlap, or accidental `nowrap`.
- Navigation and controls remain reachable with a keyboard and have usable touch targets.
- Images respect their container, preserve intended crops, and have a fallback when media is absent or slow.
- Fixed, sticky, and absolute elements do not cover content or create hidden scroll regions.
- The first viewport communicates the job before decorative effects become visible.

If the same route fails twice after CSS patches, inspect computed layout and the parent component before adding another override.

## Content Rendering Checks

Use real Markdown or MDX content in the vertical slice. Exercise the exact elements the content model permits:

- headings and nested sections
- paragraphs and links
- ordered and unordered lists
- blockquotes and callouts when supported
- code or tables when supported
- images with captions or alt text when supported
- long titles and long unbroken strings

A Markdown or MDX page is not verified because the route returns 200. Inspect the rendered HTML and its visual rhythm in the browser.

## State and Lifecycle Checks

For theme, filters, menus, search, reading preferences, or other client state:

1. Load the route directly.
2. Change the state.
3. Navigate to another Astro route.
4. Return with a link or back navigation.
5. Refresh the route.
6. Confirm the intended state, focus, and visual treatment remain correct.

When Astro client-side navigation or view transitions are used, bind and clean up lifecycle work at the appropriate Astro page lifecycle events. Do not rely on a one-time module evaluation or a single page-load callback for state that must survive navigation.

## Self-Critique Questions

Before asking for user review, answer these internally:

- Does the composition fit the content mode, or did a generic marketing pattern take over?
- Is the hierarchy obvious without explaining it?
- Does every major element serve the primary visitor task?
- Is the design distinctive through structure and decisions rather than decoration?
- Does real content fit without special pleading?
- Does the mobile layout have a deliberate composition rather than a compressed desktop layout?
- Are any effects, cards, labels, or sections present only because they are familiar defaults?
- Are there visible contradictions between the design brief, the rendered page, and the implementation architecture?

Fix obvious answers before showing the user a review build.

## Evidence Rules

A verification claim needs evidence appropriate to the claim:

- Build claim: `bun run build` output and expected artifacts.
- Route claim: direct route inspection and destination check.
- Visual claim: rendered browser inspection or image evidence.
- Responsive claim: inspection at the relevant widths.
- State claim: a repeatable navigation or interaction sequence.
- Image claim: rendered optimized output, not merely an imported source file.
- Deployment claim: real public URL and exact route check.

Never use a successful build, HTTP status, string search, or `git diff --check` as a substitute for visual evidence.
