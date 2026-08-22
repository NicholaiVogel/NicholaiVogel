# DESIGN BRIEF

## Client and Outcome

- Client/project: Nicholai Vogel — writing site
- What they do: VFX artist and developer writing essays, journalism, and technical work about craft, software, AI, systems, and the work around them.
- Why this site exists now: nicholai.work has a strong portfolio identity but is too visually distracting for sustained reading.
- Primary business or reputational outcome: meet people who want to engage with Nicholai's ideas and create a credible, calm home for published writing.
- Primary visitor action: read a featured piece and continue into the archive.
- Secondary action: follow Nicholai through an external profile or return to nicholai.work.
- Launch target and fixed constraints: standalone Astro app at `/mnt/work/life/web/writing/`; intended hostname `https://blog.nicholai.work`; Cloudflare Pages; no automatic deployment claim without public-route verification.

## Decision Log

| Round | Decision | Evidence or rationale | Status |
|---|---|---|---|
| 1 | Build a separate writing site | The portfolio site's visual language is not suitable for reading. | decided |
| 1 | Readers first, collaborators second, occasional clients third | The site exists to create engagement around ideas rather than sell a portfolio service. | decided |
| 2 | Launch routes are Home, Writing, and About | Small, focused information architecture. | decided |
| 2 | Archive is chronological with filters | Chronology preserves the notebook feeling; frontmatter-derived tags preserve authorial organization. | decided |
| 2 | RSS-ready structure, no subscription integration yet | Leave an easy future path without adding launch complexity. | decided |
| 3 | Soft Scandinavian reading room | Calm, readable, personal, with carefully limited creative gestures. | decided |
| 3 | System color preference with manual light/dark switching | The site should respect the visitor's environment without locking them into one mode. | decided |
| 3 | Personal notebook voice | Better fit than publication, portfolio, or software-journal tone. | decided |
| 3 | Short personal introduction leads the homepage | The site should establish a human point of view before presenting the archive. | decided |
| 3 | Abstract graphic and fine red markers are welcome | Connects the site to nicholai.work without repeating its visual intensity. | decided |
| 4 | Alternate visual directions remain as CSS theme variants | The user wants to compare them during development without duplicating components. | decided |
| 4 | Style switcher is temporary and visible in development only | Keeps production focused while making visual comparison practical. | decided |
| 4 | Initial source notes remain private | The three supplied notes are WIP and live in a private Obsidian vault; local preview may load them, but public repository and deployment must not include them until approved. | decided |

## Audience and Task

- Primary audience: thoughtful readers interested in essays, ideas, software, AI, culture, and craft.
- Secondary audience: collaborators and occasional clients who want context on Nicholai's thinking and working background.
- Visitor context and intent: arrives from a social profile, a project, or a shared article and wants to understand the person behind the ideas.
- The first viewport must communicate: this is a personal, readable home for Nicholai's writing and a clear path into the latest work.
- Success measure: visitors can find and read a piece quickly, understand the site's point of view, and reach an external profile without friction.
- What the site must not imply: that every Obsidian note is finished, that the site is a comprehensive portfolio, or that it makes claims beyond the published writing.

## Information Architecture

- Launch routes: `/`, `/writing/`, `/about/`, `/writing/<slug>/`, `/rss.xml`.
- Priority route: individual writing pages and the chronological archive.
- Navigation model: simple Home / Writing / About navigation, with external links in the footer or About page.
- Content collections or MDX: Astro content collection for public writing with frontmatter-driven `tags`; local-only draft import from the private Obsidian writing directory for development preview.
- Proof and trust elements: writing itself, concise About copy focused on VFX and development work, and links to public profiles and nicholai.work.
- Omitted or explicitly out-of-scope content: contact forms, newsletter signup, CMS, portfolio case studies, private notes, and unfinished writing in public builds.

## Content and Assets

- Existing copy sources: approved writing will originate from `/mnt/work/life/obsidian-vault/garden/writing`; initial local preview sources are The Temporal Contract, Thirty Days in an Empty Folder, and The Last Ten Percent.
- Approved images/video: none required for launch; use a generated or authored abstract graphic only if it remains lightweight and does not obscure reading.
- Fonts and licensing: use a readable system-first stack unless a locally licensed font is selected during implementation; no remote font dependency by default.
- Logo and brand assets: text-based Nicholai identity and existing nicholai.work red accent, approximately `#dd4132`.
- Image dimensions, crops, and fallback rules: abstract graphic is decorative and must have an accessible label or be hidden from assistive technology; no content depends on it loading.
- Missing content assumptions: initial public deployment may show a graceful empty/archive state if no writing has been explicitly approved for publication.

## Design Read

- One-sentence design read: a quiet Scandinavian reading room for a technical and creative mind, with enough visual authorship to feel personal without competing with the words.
- Desired feelings: attentive, warm, intelligent, calm, curious, lightly distinctive.
- Avoided feelings: noisy, corporate, over-designed, sterile, portfolio-like, precious.
- Design variance (0–10): 6/10.
- Motion intensity (0–10): 2/10.
- Visual density (0–10): 3/10.

## Style Direction

- Selected direction: Soft Scandinavian reading room, with the archive clarity of Steph Ango and a restrained homepage gesture inspired by Emrah's project presentation.
- Rejected directions and why: fully expressive editorial signal is too close to the distracting portfolio mode; quiet technical journal is a useful secondary variant but too interface-like as the default; Nordic editorial is retained as a comparison variant.
- User-supplied references: `https://emrah.ca/projects/iron-man-iii`, `https://stephango.com/`, `https://shapxo.com/about`, and the existing nicholai.work brand system.
- Override precedence: user constraints and readability first; existing brand red second; selected direction and variants third; implementation defaults last.
- Palette tokens: paper/ivory canvas, graphite ink, muted blue-gray secondary text, subtle gray rules, red accent `#dd4132`, separate light and dark semantic tokens.
- Type roles: readable body text, quiet sans navigation and metadata, restrained display scale for article and section titles, optional mono only for small metadata labels.
- Spacing rhythm: generous page margins, narrow long-form measure, clear section breaks, compact metadata.
- Border, radius, and shadow rules: mostly fine rules and low-radius editorial surfaces; no heavy cards, glass, glow, or decorative shadows.
- Image and media treatment: optional abstract graphic or article media, secondary to text, with graceful fallback.
- Mobile collapse: single-column reading path; filters become compact controls; no horizontal overflow; touch targets remain comfortable.
- Reduced-motion behavior: remove reveal transforms and animation; preserve content order and state changes.

## Accessibility and Performance

- Contrast and focus requirements: WCAG-conscious text contrast, visible keyboard focus, semantic landmarks, named controls, and no color-only meaning.
- Keyboard and touch behavior: all navigation, filters, theme controls, and article links usable without a pointer; touch targets at least comfortable mobile size.
- Reduced-motion behavior: `prefers-reduced-motion` disables decorative transitions and abstract graphic animation.
- Target devices and connection assumptions: mobile-first, ordinary broadband and mobile connections, low JavaScript dependency.
- Image/video loading strategy: no video at launch; decorative graphic is lightweight and non-blocking.
- Known performance tradeoffs: none expected beyond Astro's generated CSS and optional inline SVG graphic.

## SEO and Structured Data

- Site URL: `https://blog.nicholai.work`.
- Title and description: Nicholai's writing and ideas; final metadata should describe essays, journalism, technical writing, VFX, development, and systems thinking without overclaiming.
- Canonical rules: canonical URLs from Astro site config; trailing slash policy consistent across routes.
- Open Graph/Twitter image: defer custom social image until an approved identity graphic exists; provide reliable title/description metadata now.
- JSON-LD types: `Person`/`WebSite` for the site, `Article` for individual writing pages.
- Sitemap/RSS: sitemap enabled; RSS route scaffolded from the public writing collection.
- Redirects, language, and legal routes: English only; no special legal routes required at launch.

## Integrations and Forms

- Contact or booking path: none; external profiles are the contact/follow path.
- Email/CRM/calendar: none at launch; leave room for future subscription integration.
- Analytics and consent: none required for initial launch.
- Environment variables or Cloudflare secrets: none required for the public build; local-only writing source path must remain outside tracked files.
- Failure and empty states: clear empty archive state, missing image fallback, filter no-results state, and theme control fallback to system preference.

## Cloudflare Deployment

- Pages project: `nicholai-writing` unless an existing project/domain contract requires another name.
- Account: determined by authenticated Wrangler session; do not place account ID in public config.
- Production branch: `main`.
- Deploy script: `bun run deploy`.
- Public URL: `https://blog.nicholai.work` if the custom domain is already attached; otherwise report the actual Pages hostname.
- Raw `*.pages.dev` URL: capture from Wrangler deployment output.
- Who owns future deploys: Nicholai via the repository and Cloudflare account.

## Acceptance Criteria

- [ ] Home, Writing, About, article, and RSS routes build successfully.
- [ ] The homepage opens with a short personal introduction, then featured/latest writing and a chronological teaser.
- [ ] The Writing archive is chronological and filters by frontmatter-derived tags/domains without hardcoded article categories.
- [ ] The About page is concise, grounded in VFX and development work, and avoids private claims.
- [ ] The default theme follows system preference and supports manual light/dark switching.
- [ ] Alternate style variants can be previewed through the temporary development-only switcher.
- [ ] Public builds do not include the WIP source text from the private Obsidian vault unless explicitly enabled for local preview.
- [ ] Desktop and mobile layouts have been inspected.
- [ ] Keyboard, focus, contrast, empty, no-results, and reduced-motion paths work.
- [ ] `bun run build` exits 0 and expected route artifacts exist in `dist`.
- [ ] Deployment is validated at the actual public URL and raw Pages URL.

## Open Decisions

- Final approval of About copy and any specific article before public publication.
- Whether the custom domain is already attached to the selected Pages project.
- Whether a future approved abstract graphic should replace the initial CSS/SVG placeholder.
