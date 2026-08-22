# Component Patterns

These are implementation patterns, not mandatory visual layouts. Choose components from the execution contract and content mode. Astro should own static structure; hydrate only the interaction that needs a client runtime.

## Astro-First Boundaries

- Prefer `.astro` components for markup, data loading, and static content.
- Keep repeated content data-driven through Astro collections or typed props.
- Use React or another island only when the interaction materially benefits from client-side state.
- Keep route ownership in `src/pages`, shared shell in layouts, and reusable UI in `src/components`.
- Keep layout primitives separate from style-specific effects so presets can change without rewriting content models.

## Hydration Strategy

| Directive | Use when |
|---|---|
| `client:load` | Immediate interaction is necessary above the fold. |
| `client:visible` | Below-fold interaction can wait until visible. |
| `client:idle` | Low-priority enhancement can wait for idle time. |
| No directive | Static markup, links, forms handled by the platform, or CSS interaction. |

Do not hydrate a static list, decorative animation, or ordinary navigation merely because a framework component is available.

## Layout Primitives

Choose the smallest primitive that expresses the page’s job:

- `LayoutShell`: site width, gutters, metadata shell, and page-level theme state.
- `SectionStack`: repeated vertical rhythm between meaningful sections.
- `ContentGrid`: only when the content relationship benefits from columns; it must define its narrow-screen recomposition.
- `ProseMeasure`: long-form reading width, heading rhythm, links, lists, quotes, code, and media.
- `MediaFrame`: aspect ratio, object position, loading, alt text, and missing-media fallback.
- `MetadataRow`: dates, categories, reading time, status, or other supporting labels.
- `ActionGroup`: primary and secondary actions with explicit focus and narrow-screen behavior.

Do not create a card, hero, sidebar, ticker, or badge by default. First establish whether the content mode needs one.

## Navigation

A navigation component should provide:

- semantic `<nav>` structure and a useful accessible label
- visible active state without relying only on color
- keyboard access and a visible `focus-visible` style
- an explicit mobile state with Escape and outside-click behavior where relevant
- body overflow control only while an actual overlay is open
- correct links owned by Astro’s file-based routes
- no duplicate event listeners after internal navigation

A simple list of HTML links is preferable when a menu does not need client behavior.

## Content Lists and Archives

Select the listing pattern from the content mode:

- chronological list for reading-first work
- project index for proof and work browsing
- comparison or feature layout only when items have a meaningful relationship
- filter or search only when the content volume justifies the interaction

Every list needs a narrow-screen behavior, empty state, long-title behavior, and an accessible link target. Do not force all content into equal-height cards.

## Article and Detail Views

A detail view should define:

- title and supporting metadata hierarchy
- readable content measure
- heading and anchor behavior
- links, lists, quotes, code, tables, and image treatment when supported
- related or next content only if it helps the stated task
- a clear return or archive path
- narrow-screen behavior for any table of contents or side rail

The detail layout must be tested with actual long content before the archive is considered complete.

## Forms and Async States

Forms and interactive surfaces should have explicit idle, submitting, success, error, and unavailable states. Use semantic labels, validation messages, keyboard order, disabled behavior, and a safe failure path. Do not design only the happy path.

## Motion and Lifecycle

Use CSS transitions for small state changes. Use GSAP or another library only when the brief needs sequencing, scroll-linked motion, or an expressive media treatment. Every animated island must:

- check reduced motion
- clean up listeners, observers, and animation contexts
- avoid animating layout properties when transform or opacity is sufficient
- rebind only at the appropriate Astro navigation lifecycle boundary
- retain a readable static state when JavaScript fails or is disabled

## Verification

Use the browser and `vision_analyze` when necessary to check the actual component at narrow, tablet-boundary, and desktop widths. Test keyboard navigation, focus, real content, empty/error states, theme changes, and a second internal navigation. Use HMR to iterate without restarting the dev server.
