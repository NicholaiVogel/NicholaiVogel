# Visual QA and Design Loop

Visual QA is rendered evidence, not source-code inspection. Separate two jobs: design QA asks whether the page is good; technical QA asks whether it works. Run design QA first — a technically flawless generic page still fails the brief. Use the running Astro dev server, browser or desktop tools, and `vision_analyze` when a screenshot or visual reading is needed. `bun run build` proves compilation; it does not prove layout, hierarchy, content rendering, or state behavior.

## Required Loop

1. Start one healthy `bun run dev` process through the `terminal` tool.
2. Open the priority route in the browser and keep the server alive.
3. Change CSS, components, content, and tokens through the normal edit workflow.
4. Confirm Astro hot reload/HMR updates the rendered page without restarting the server.
5. Inspect the vertical slice at representative widths and states.
6. Fix P0 and P1 defects before broad implementation or user review.
7. Recheck the same route after every structural change.

Restart only after dependency changes, Astro/Vite/Wrangler configuration changes, environment changes, or an actual server failure. Do not restart as a substitute for inspecting stale browser state.

## Design QA (always)

Inspect the rendered first viewport against the execution contract:

- Hierarchy: what the viewer notices first, second, and third matches the contract.
- Rhythm: spacing levels group content legibly; no arbitrary per-section margins.
- Emphasis, grouping, alignment, and density reflect the intended structure.
- The beauty bar in `design-doctrine.md`: dominant idea, point of view, signature treatment.
- Real content fits without special pleading: longest title, real prose, actual media.
- Mobile is a deliberate recomposition, not a compressed desktop.

Contradiction rule: if rendered evidence contradicts the brief or contract, either fix the page or revise the contract with the user. Never rationalize the mismatch away, and never silently redefine the requirement after implementation.

## Evidence Completeness

Evidence must show the state being verified:

- A dropdown claim needs the menu open with options visible.
- A hover or focus claim needs that state captured.
- A responsive claim needs the narrow viewport itself, not a crop of desktop.
- A media claim needs the image rendered (`naturalWidth > 0`), not a 200 response.
- A theme claim needs that theme actually active in the capture.

A cropped, default-state, or pre-load screenshot verifies nothing. If the evidence does not show the state, the state is unverified.

## Technical QA Matrix (conditional — run the rows the project uses)

| Dimension | When | Minimum cases |
|---|---|---|
| Width | always | narrow phone ~375px, tablet boundary ~768px, desktop ~1440px |
| Content | always in the slice | short and long titles, realistic prose, lists, links, images, empty state when applicable |
| Navigation | always | direct load, internal link, back/forward, refreshed detail route |
| Theme | when the site has light and dark | explicit light, explicit dark, system default |
| Interaction | what the project uses | keyboard focus, menu open/close, form states, filters, touch-sized controls |
| Motion | when motion exists | normal motion and `prefers-reduced-motion: reduce` |
| Custom controls | only when a custom control is built | Arrow keys, Enter, Escape, outside click, selection state, ARIA attributes. Prefer a native `select` or the simplest accessible primitive unless the design genuinely justifies custom |
| Media-heavy pages | galleries, bento grids, long media routes | scroll to trigger lazy loads; assert each figure's rendered box and the image's `naturalWidth` |
| Complex grid architecture | container queries, placement rules, competing selectors | `getComputedStyle()` checks at each breakpoint; keep placement rules and responsive resets inside the same component boundary |

These are verification widths and conditional rows, not universal design values or a standing audit.

## Geometry Checks

When layout is complex, inspect the rendered result, not just the CSS declarations:

- No horizontal overflow at narrow widths.
- Parent grids collapse or recompose instead of forcing a desktop side column into a text strip.
- Body copy has a readable measure and line-height.
- Headings wrap without clipping, overlap, or accidental `nowrap`.
- Navigation and controls remain keyboard reachable with usable touch targets.
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

## Corrections Become Invariants

After a user corrects a concrete defect, add a targeted check so it cannot silently regress:

- Dropdown width wobbled across options: assert `max(widths) - min(widths)` stays within tolerance.
- Labels wrapped unexpectedly: assert single-line rendered height.
- A filter stopped filtering: assert the result count changes when the filter changes.
- A menu state broke: assert `aria-expanded` toggles with open and close.

Keep invariants proportional: a handful of assertions tied to real corrections, not an audit of everything. Validate that test-harness variables actually represent the behavior being tested before trusting a result.

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
- Visual claim: rendered browser inspection or image evidence showing the state.
- Responsive claim: inspection at the relevant widths.
- State claim: a repeatable navigation or interaction sequence.
- Image claim: rendered optimized output, not merely an imported source file.
- Deployment claim: real public URL and exact route check.

Never use a successful build, HTTP status, string search, or `git diff --check` as a substitute for visual evidence.
