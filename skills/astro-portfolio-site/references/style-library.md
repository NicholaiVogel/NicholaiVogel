# Ready-to-Go Style Library

These are starting directions, not mandatory themes. They synthesize the local project patterns and the supplied Scandinavian, taste-skill, soft-skill, [[design-taste-frontend]], and [[high-end-visual-design]] references. Source URLs: `https://github.com/ericzakariasson/scandinavian-design`, `https://github.com/Leonxlnx/taste-skill/blob/main/skills/taste-skill/SKILL.md`, and `https://github.com/Leonxlnx/taste-skill/blob/main/skills/soft-skill/SKILL.md`. The user's brand, supplied styleguide, `globals.css`, reference URL, content, accessibility needs, and performance constraints outrank every preset.

## Style Dials

Record three dials in the design brief:

- `DESIGN_VARIANCE`: how far the visual system departs from a familiar website. Baseline 8/10.
- `MOTION_INTENSITY`: how much motion carries hierarchy or atmosphere. Baseline 6/10.
- `VISUAL_DENSITY`: how much information and interface occupies a viewport. Baseline 4/10.

Dial values are a communication aid, not a substitute for a brief. Every option must state how it collapses on mobile and how it behaves with reduced motion.

## 1. Nordic Restraint

- Best for: service firms, architects, makers, thoughtful personal brands, and information-led work.
- Palette: neutral canvas and ink, restrained supporting alpha levels, one semantic accent only when needed.
- Type: one clear sans family with a practical hierarchy; preserve an existing good font.
- Layout: left-aligned hierarchy, generous whitespace, chapters and useful density instead of repeated feature cards.
- Media: product or project imagery carries the expression; avoid decorative layers that compete with it.
- Motion: low; opacity, small transforms, and clear state changes.
- Risks: can become anonymous or too sparse; recover with distinctive content, cropping, type scale, or one meaningful material detail.

## 2. Editorial Dark Grid

- Best for: tattoo studios, creative studios, artists, culture, portfolios, and image-led editorial work.
- Palette: deep neutral surfaces, paper or off-white text, one controlled accent, mono metadata where useful.
- Type: expressive display face paired with a readable text face; use mono sparingly for labels.
- Layout: editorial chapters, asymmetric image grids, strong full-bleed moments, clear section banners.
- Media: real photography, art direction, scrims, texture, and restrained noise; image treatment must not hide content.
- Motion: moderate; lifecycle-safe reveal, hover, and image movement with reduced-motion fallbacks.
- Risks: noise, cursor, parallax, and overlays can become a costume. Remove any effect that does not improve comprehension or atmosphere.

## 3. Retro Pixel Arcade

- Best for: game projects, experimental studios, digital artists, niche communities, and playful internet-native brands.
- Palette: deep dark base with a small set of bright, named pixel accents; use contrast intentionally.
- Type: custom or pixel display type only when legibility and licensing are settled; pair with a readable text face.
- Layout: sharp geometry, deliberate HUD-like labels, expressive hero media, and a small number of memorable utility motifs.
- Media: owned pixel assets, video, posters, sprites, or game-like imagery with explicit fallbacks.
- Motion: moderate to high only where it serves interaction; session-based intro or video must have a static and reduced-motion path.
- Risks: CRT, scanlines, glitches, glow, sound effects, and custom cursors can overwhelm the content. Do not add generic pixel decoration to unrelated work.

## 4. Soft Structuralism

- Best for: wellness, hospitality, consumer services, calm tools, and brands needing warmth without ornament.
- Palette: light or silver surfaces, charcoal text, soft semantic accents, and carefully measured shadows.
- Type: a confident sans hierarchy with occasional restrained display treatment.
- Layout: spacious blocks, curved or custom section transitions, clear visual grouping, and fewer nested cards.
- Media: tactile close crops, quiet product photography, and calm transitions.
- Motion: low to moderate; use easing, opacity, and short transforms rather than constant movement.
- Risks: can become generic "soft UI." Give it a specific material, editorial voice, image rule, or typographic gesture.

## 5. Editorial Luxury

- Best for: heritage, fashion, hospitality, real estate, premium craft, and high-consideration services.
- Palette: brand-specific dark/light contrast or a disciplined warm palette; never assume beige and brass.
- Type: high-contrast serif only when the client's voice and reading context justify it, paired with a practical text face.
- Layout: editorial split, wide margins, full-bleed photography, intentional sequencing, and slow reveal.
- Media: art-directed photography, texture, material closeups, and strong crops.
- Motion: measured and quiet; prioritize timing, scale, and opacity over spectacle.
- Risks: premium styling can hide a weak offer or make the site slow. Keep the CTA, proof, and mobile reading path explicit.

## 6. Raw Utility / Brutalist

- Best for: technical teams, independent products, publications, activist projects, and unconventional creative work.
- Palette: black/white or a small high-contrast system with one semantic accent.
- Type: bold readable sans or mono with explicit hierarchy and disciplined line lengths.
- Layout: hard edges, visible rules, asymmetric offsets, dense but deliberate information, and direct navigation.
- Media: real artifacts, documentation, diagrams, or raw work; avoid fake interface screenshots.
- Motion: low; use state, focus, and navigation transitions rather than decorative animation.
- Risks: "raw" can become inaccessible or merely messy. Keep contrast, focus, hierarchy, and responsive collapse non-negotiable.

## 7. Atmospheric Media

- Best for: film, music, games, experiential studios, tourism, and work where mood is part of the offer.
- Palette: derived from the key image or brand, with scrims that preserve text contrast.
- Type: sparse, high-confidence hierarchy; labels should remain readable over media.
- Layout: cinematic first viewport, direct CTA, sparse supporting copy, then evidence and detail below.
- Media: real full-bleed image or video with poster, loading, and mobile fallbacks.
- Motion: moderate; sequence atmosphere without blocking navigation, content, or reduced-motion users.
- Risks: a beautiful hero can obscure what the client does. State the offer early and keep media optional when it fails.

## Composition Examples

Concrete sketches showing how a direction is specified through element order, grid, and type treatment rather than adjectives. Use these as the level of specificity expected when presenting a direction.

### Editorial case study (Editorial Dark Grid or Editorial Luxury)

Use when the work needs authority, craft, and a sense of process.

Composition:

- Navigation and metadata stay compact and quiet.
- The title carries the strongest typographic scale on the page.
- One dominant media moment instead of several competing thumbnails.
- Article body, media, and any table of contents align to one visible grid.

Element order: back-link, raw-text tags, display title, dense metadata row, full-width 16:9 banner, body.

Avoid:

- glassmorphism and decorative gradient blobs
- pill badges for every metadata piece
- a tiny image squeezed beside a long headline
- a divider that visually disconnects the hero from the article

Good variations: full-width hero below the title block; asymmetric title/image split when the title is short; large opening image followed by structured project facts.

### Studio portfolio index (Nordic Restraint or Raw Utility)

Use when the work itself should remain the focus.

Composition:

- Feature one project instead of making every project visually equal.
- A strong list or index carries the secondary work.
- Project titles and categories create the rhythm.
- Hover reveals image, year, role, or a short descriptor.

Element order: compact header, one featured project with large media, index rows (title / category / year), contact path.

Avoid:

- six identical cards
- fake statistics
- generic services/process/testimonials blocks
- a hero that explains the studio before showing its work

Good variations: featured project as a full-bleed banner; index rows with hover image reveal; a type-only index with an oversized running label.

### Service business (Soft Structuralism or Nordic Restraint)

Use when trust and a contact path drive the outcome.

Composition:

- The offer states what, for whom, and the next action in the first viewport.
- Proof (work, results, clients) follows immediately, not four sections later.
- Grouping through spacing and one surface system — hairlines or cards, not both mixed.

Element order: offer headline, one-line clarification, primary CTA, proof, practical information, contact.

Avoid: atmosphere without an offer, vague slogans, a buried contact path, testimonial walls without specifics.

Good variations: split offer with one supporting image; a quiet services index with per-service anchors; locality and practical facts as a structured block.

## Selection Protocol

1. Load this library only after seeded explorers have produced rendered candidates and the user has selected or requested a new direction.
2. Use the library as implementation vocabulary and constraint checking, never as an input to isolated explorers and never as a replacement for external-seed variety.
3. Translate the selected identity into content mode, first-viewport job, composition grammar, dials, palette, type, layout, media, motion, density, mobile collapse, accessibility risks, anti-patterns, and tradeoffs.
4. Describe the behavior of the selected direction, not only its adjectives. State what the page prioritizes, what it refuses, and how it recomposes on mobile.
5. Record the durable choice and rejected directions in `DESIGN-BRIEF.md`; keep raw seeds and exploration receipts in Hermes scratch.
6. Freeze the execution contract before broad implementation: palette, type roles, spacing rhythm, radius/border rules, image treatment, motion rules, composition grammar, responsive behavior, and the first-viewport job.
7. Build a vertical slice before applying the direction to every route. Do not ask the user to review a full site when the primary composition has not been proven with real content.

## Override Precedence

1. Explicit user brand, styleguide, `globals.css`, and supplied references.
2. Content, audience, accessibility, legal, and performance constraints.
3. The selected library direction.
4. Neutral implementation defaults.

Do not combine two presets by copying every visible trick. Combine the underlying principles and delete conflicts. One website should have one coherent design system.
