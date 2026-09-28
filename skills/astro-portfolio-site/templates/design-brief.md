# DESIGN BRIEF

## Client and Outcome

- Client/project:
- What they do:
- Why this site exists now:
- Primary business or reputational outcome:
- Primary visitor action:
- Secondary action:
- Launch target and fixed constraints:

## Decision Log

| Round | Decision | Evidence or rationale | Status |
|---|---|---|---|
| 1 |  |  | decided |

## Audience and Task

- Primary audience:
- Secondary audience:
- Visitor context and intent:
- The first viewport must communicate:
- Success measure:
- What the site must not imply:

## Information Architecture

- Content mode:
- Launch routes:
- Priority route:
- Primary page archetype:
- Navigation model:
- Content collections or MDX:
- Proof and trust elements:
- Omitted or explicitly out-of-scope content:

## Content and Assets

- Existing copy sources:
- Approved public content:
- Private or WIP content excluded from publication:
- Real-content fixture for the vertical slice:
- Fonts and licensing:
- Logo and brand assets:
- Image dimensions, crops, optimization, and fallback rules:
- Missing content assumptions:

## Design Read

- One-sentence design read:
- Desired feelings:
- Avoided feelings:
- Design variance (0–10):
- Motion intensity (0–10):
- Visual density (0–10):

## Design Execution Contract

- First-viewport job:
- Hierarchy from first viewport downward:
- Composition grammar:
- Type roles:
- Spacing rhythm:
- Surface, border, radius, and shadow rules:
- Image and media treatment:
- Interaction rules:
- Responsive behavior and mobile collapse:
- Reduced-motion behavior:
- Anti-patterns to avoid:
- Agent-owned assumptions:
- Design-system approach:
- CSS owner and cascade boundary:
- Token source of truth:
- Theme model:

## Style Direction

- Selected direction:
- Rejected directions and why:
- User-supplied references:
- Override precedence:
- Palette tokens:
- Type roles:
- Spacing rhythm:
- Border, radius, and shadow rules:
- Image and media treatment:
- Mobile collapse:
- Reduced-motion behavior:

## Astro Architecture

- Existing Astro version and repository contract:
- `src/content` collection path and schema:
- Approved route tree under `src/pages`:
- Dynamic route parameters and `getStaticPaths()`:
- Astro image pipeline and asset locations:
- Native integrations selected and why:
- Client navigation or `ClientRouter` use:
- HMR/dev-server process:
- Custom infrastructure explicitly justified:

## Accessibility and Performance

- Contrast and focus requirements:
- Keyboard and touch behavior:
- Reduced-motion behavior:
- Target devices and connection assumptions:
- Image/video loading strategy:
- Known performance tradeoffs:

## SEO and Structured Data

- Site URL:
- Title and description:
- Canonical rules:
- Open Graph/Twitter image:
- JSON-LD types:
- Sitemap/RSS:
- Redirects, language, and legal routes:

## Integrations and Forms

- Contact or booking path:
- Email/CRM/calendar:
- Analytics and consent:
- Environment variables or Cloudflare secrets:
- Failure and empty states:

## Vertical Slice Gate

- Priority route:
- Representative detail/content route:
- Real content included:
- Widths and states inspected:
- P0/P1 defects resolved before expansion:
- User review needed only for:

## Acceptance Matrix

- [ ] The primary visitor can complete the primary action.
- [ ] The first viewport communicates the site’s job.
- [ ] The vertical slice uses approved real content and media.
- [ ] Every launch route has approved content or an explicit placeholder decision.
- [ ] Astro file-based routing owns all public routes.
- [ ] Content uses native Astro collections or a documented exception.
- [ ] Required images use Astro’s optimization path and have fallbacks.
- [ ] HMR works without restarting the dev server after ordinary design edits.
- [ ] Narrow, tablet-boundary, and desktop layouts have been inspected.
- [ ] Markdown or MDX headings, lists, links, images, and long content render correctly.
- [ ] Theme and other persistent client state survive navigation.
- [ ] Keyboard, focus, contrast, and reduced-motion paths work.
- [ ] Build, lint, and tests pass when present.
- [ ] Expected route artifacts exist in `dist`.
- [ ] Deployment is validated at the real public URL when requested.

## Cloudflare Deployment

- Pages project:
- Account:
- Production branch:
- Deploy script:
- Public URL:
- Raw `*.pages.dev` URL:
- Who owns future deploys:

## Open Decisions

- 
