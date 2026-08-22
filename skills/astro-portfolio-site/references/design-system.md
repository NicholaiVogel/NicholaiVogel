# Token-Driven Design System

This reference defines a neutral implementation contract for `global.css`. Adapt the values to the execution contract and selected style direction. It is not a visual preset and must not force a pixel, dark, glass, luxury, Scandinavian, or “AI” look.

## Principles

- Name decisions as tokens so the visual system can change without selector archaeology.
- Keep the palette, typography, spacing, surfaces, borders, shadows, and motion rules coherent across routes.
- Let the content mode determine measure and density. A reading page and a campaign page should not share the same default composition.
- Prefer CSS and semantic Astro markup before adding a client island or animation library.
- Never hide focus, disable normal cursors, or add decorative effects without a brief reason and a fallback.

## File Order

Keep `global.css` easy to inspect:

1. `@import "tailwindcss"` when Tailwind is used.
2. Licensed `@font-face` declarations.
3. Theme and design tokens.
4. Root theme variables and any dark/light overrides.
5. Base element styles and font smoothing.
6. Layout and content primitives.
7. Focus-visible and form states.
8. Image and media defaults.
9. Keyframes and opt-in animation utilities.
10. Reduced-motion rules.
11. Safe viewport helpers.

## Token Groups

Define only tokens the brief uses. A neutral baseline usually needs:

- `--color-bg`, `--color-surface`, `--color-surface-raised`
- `--color-text`, `--color-muted`, `--color-border`, `--color-accent`
- `--font-display`, `--font-body`, `--font-mono`
- type roles for display, heading, body, metadata, and code
- spacing levels for section, layout, component, and inline rhythm
- radii, border widths, shadow levels, and motion durations
- content measure, layout max width, and narrow-screen gutter

Example shape:

```css
@import "tailwindcss";

@theme {
  --font-display: "Display", sans-serif;
  --font-body: "Body", sans-serif;
  --font-mono: "Mono", monospace;
  --color-bg: #ffffff;
  --color-surface: #f4f4f2;
  --color-text: #171717;
  --color-muted: #686868;
  --color-border: #d8d8d2;
  --color-accent: #8a2f2f;
}

:root {
  --content-measure: 68ch;
  --layout-max: 80rem;
  --gutter: 1.25rem;
  --radius-control: 0.25rem;
  --motion-fast: 160ms;
  --motion-standard: 280ms;
}
```

The values are placeholders. Replace them with decisions from the brief rather than copying them as universal defaults.

## Base Rules

- Set `box-sizing: border-box` and a predictable body margin.
- Keep `overflow-x: hidden` only when it does not mask a real layout bug; diagnose overflow first.
- Set body type, background, and text color from tokens.
- Define readable default link, selection, and focus-visible behavior.
- Keep heading wrapping enabled unless a specific short label has a safe `nowrap` rule.
- Use semantic elements and class-level primitives instead of styling every route with unrelated selectors.

## Content Primitives

Create only the primitives the content mode needs:

- `layout-shell`: owns max width and page gutters.
- `prose-measure`: owns long-form line length and vertical rhythm.
- `section-stack`: owns repeated section spacing.
- `media-frame`: owns aspect ratio, crop, loading, and fallback behavior.
- `metadata-row`: owns low-emphasis labels and dates.
- `focus-ring`: owns keyboard visibility.

A primitive should solve a repeated rule. Do not create a component merely to give a familiar card, hero, or badge a name.

## Theme and Navigation State

If the site supports light and dark themes:

- Initialize the chosen theme before the first paint when practical.
- Keep the source of truth explicit, such as system preference plus a stored user choice.
- Reapply or preserve the state across Astro internal navigation and view transitions.
- Test theme changes on every major surface, including images, borders, muted text, forms, and focus rings.

## Motion

- Motion must clarify state, hierarchy, or atmosphere.
- Prefer opacity and transform over layout-affecting animation.
- Provide a static path and honor `prefers-reduced-motion: reduce`.
- Clean up listeners, observers, and animation contexts when a client island or Astro navigation lifecycle requires it.
- Do not add smooth scrolling, parallax, custom cursors, noise, scanlines, glows, or intro loaders by default.

## Anti-Patterns

Do not begin from a prebuilt visual bundle that assumes:

- dark backgrounds with neon accents
- pixel shadows or scanlines
- hidden cursors
- three equal feature cards
- centered full-viewport hero copy
- glassmorphism and gradient mesh backgrounds
- uppercase display typography on every heading

Those may be valid style decisions, but only when the execution contract justifies them.

## Verification

Use the running site, browser tooling, and `vision_analyze` when needed to check the actual token result at narrow and desktop widths, both themes, focus states, reduced motion, and representative content. Use HMR for ordinary token edits; do not restart the dev server after each CSS change.
