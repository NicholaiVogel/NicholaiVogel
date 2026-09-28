# Lumos-Derived Design-System Standards

Use this reference after taste calibration and before implementation. It extracts the strongest implementation ideas from Lumos for Astro without making Lumos a dependency, copying its source, or importing its visual defaults. Treat it as a house baseline for new work, not as a replacement for the selected visual identity.

## Precedence and ownership

- User-supplied brand rules, approved references, accessibility, performance, legal requirements, and real content outrank this baseline.
- The selected visual identity controls palette, type character, composition, density, media treatment, motion, and signature moves.
- Choose one primary CSS and component owner: the project’s token CSS, Tailwind, Lumos, or another deliberate system. Do not add a second owner by habit.
- For greenfield work, use these principles by default unless the content mode or requirements make them a poor fit.
- For brownfield work, inspect the existing system first and adopt principles incrementally only when they reduce complexity or improve verified behavior.

## Canonical tokens

- Keep one inspectable source of truth for colors, semantic surfaces, text roles, typography, spacing, layout widths, borders, radii, focus, and motion.
- Name tokens by role when a value carries meaning, such as `--color-text-muted`, `--space-section`, or `--focus-ring-color`.
- Let components consume semantic tokens rather than repeating raw colors, spacing, or timing values.
- Keep visual identity values in the token layer so a direction can change without selector archaeology.
- Do not create aliases merely to hide two competing systems. Every alias needs an ownership reason and a removal boundary.

## Cascade and stylesheet structure

- Declare cascade-layer order once when layers are used, for example `base`, `patterns`, `components`, and `utilities`.
- Keep tokens and theme variables in the base layer.
- Keep repeated layout recipes in a patterns layer.
- Keep project-owned component rules in a component layer.
- Keep utilities deliberate and higher priority than shared patterns, not as a substitute for component structure.
- Keep the global stylesheet as an inspectable entry point that imports the project’s CSS in one known order.
- Repair the owning layout or component instead of stacking selector specificity until the result happens to work.
- When Tailwind or another CSS system is selected, document its layer position and do not import a second framework without a tested boundary.

## Fluid and user-scalable sizing

- Use `rem` for type, spacing, controls, and layout values that should respond to user font settings.
- Use `clamp()` or container-aware rules for values that should grow smoothly rather than jump at arbitrary breakpoints.
- Prefer content-driven height, `min-height`, and flexible layout over fixed heights that fail at zoom or with long copy.
- Pixel values remain appropriate for hairlines, raster dimensions, and deliberate geometry; do not ban them blindly.
- Test the densest realistic content at narrow phone, tablet-boundary, desktop, 200% zoom, and a changed user font-size setting.

## Themes and inheritance

- Define themes through semantic tokens so a theme changes meaningfully related surfaces, text, borders, controls, and focus states together.
- Apply theme state at the smallest useful layout or section boundary when nested themes are part of the design.
- Choose one explicit project convention for theme markers, such as a class or data attribute; do not mix conventions casually.
- Initialize global theme state before first paint when the site supports a user-selected theme.
- Verify nested themes, media contrast, forms, focus rings, internal Astro navigation, refreshes, and system preference behavior.

## Astro-native components

- Prefer `.astro` components and semantic HTML for static structure.
- Type component props and keep repeated content data-driven.
- Use native links, buttons, headings, lists, forms, and landmarks rather than generic elements with simulated behavior.
- Allow content-empty components or conditional sections to render nothing instead of leaving empty wrappers and gaps.
- Add project components alongside framework components. Do not edit copied or vendored framework components without recording the fork and upgrade boundary.
- Do not hydrate static content, ordinary navigation, or decorative motion merely because a component exists.
- If source code is borrowed from an MIT-licensed project, preserve the applicable license notice.

## Accessibility baseline

Use these as defaults, then verify the rendered result:

- A skip link and real `header`, `nav`, `main`, and `footer` landmarks where the site uses those regions.
- Visible keyboard focus that remains legible on every theme and surface.
- Real buttons for actions and real links for navigation.
- Correct heading order, meaningful link text, intentional alt text, and tested color contrast.
- Reduced-motion behavior for every animation and transition.
- Keyboard and touch paths for menus, dialogs, tabs, sliders, forms, and other custom controls.

A token system or component library can make these defaults easier. It cannot decide the correct alt text, heading structure, link wording, contrast values, or content hierarchy for the project.

## Greenfield procedure

1. Complete requirements discovery and seeded visual exploration without using Lumos-specific visual vocabulary as hidden direction.
2. After the user selects a direction, establish the token source, cascade order, theme convention, and component boundaries.
3. Build the first viewport and one representative detail route with real content before expanding the system.
4. Keep the visual identity in project-owned tokens and components. Use the baseline to make the implementation coherent, not to flatten the design into familiar marketing blocks.
5. Record the chosen design-system approach, CSS owner, token source, and known exceptions in the design brief.

## Brownfield procedure

1. Inventory the current CSS entry points, tokens, components, package dependencies, theme initialization, and route lifecycle.
2. Identify the existing primary owner. Do not introduce Lumos, Tailwind, or another framework merely to access these principles.
3. Map equivalent semantic tokens only where that reduces duplication. Keep compatibility aliases temporary and named.
4. Pilot the change on one route or one component. Compare real renders before removing old rules.
5. Expand only after verifying cascade order, mobile recomposition, focus, themes, zoom, reduced motion, and build output.

## Do not copy wholesale

- Do not copy Lumos’s current palette, radii, typography, component catalog, class names, or prop API as universal defaults.
- Do not use a generic marketing component because the framework provides it.
- Do not make a project depend on a pre-1.0 framework when the project only needs its design principles.
- Do not treat a clean build or a framework accessibility claim as visual or functional proof.

The durable lesson is source-informed, not source-copied: centralize decisions, make the cascade predictable, let values scale with the user and viewport, build semantic components, and verify the real rendered site.