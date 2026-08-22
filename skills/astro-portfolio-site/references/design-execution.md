# Design Execution Contract

A design brief records what the site must accomplish. This reference converts that brief into decisions the agent can implement and verify without asking the user to design the page in their head.

## Core Rule

The agent owns reasonable low-impact design decisions. Do not extend the interview to decide every spacing value, card treatment, or component arrangement. Record those choices as assumptions in the brief, then validate them in a rendered prototype.

When a high-impact visual choice cannot be settled in prose, build two or three small alternatives. Compare the alternatives through hierarchy, content fit, responsive behavior, and the stated outcome. Do not resolve uncertainty by adding more adjectives to the brief.

## Content Mode

Choose the dominant content mode before choosing components. A site can combine modes, but one mode should govern the primary route.

| Mode | Primary design job | Default emphasis | Avoid by default |
|---|---|---|---|
| Editorial or reading | Help people read, browse, and return | Measure, typography, archive clarity, metadata, navigation | Marketing hero, card wall, narrow prose column, decorative interruptions |
| Portfolio or work | Make proof legible and memorable | Work hierarchy, media sequencing, project context, contact path | Equal-weight grids, fake case-study metrics, image effects that hide work |
| Services or business | Build trust and prompt contact | Offer, proof, objections, CTA, local or practical information | Atmosphere without an offer, vague slogans, buried contact path |
| Campaign or launch | Move one audience toward one action | First-viewport proposition, proof, CTA, mobile speed | Multiple competing CTAs, ornamental sections, deep navigation |
| Studio or personal profile | Explain identity and make the next step obvious | Voice, selected proof, capabilities, contact or follow path | Resume dump, generic profile cards, invented credentials |
| Documentation or reference | Help users find and understand information | Information scent, search, headings, code or examples | Novel navigation that hides URLs, long unstructured pages |

## Required Execution Contract

Record these fields in `DESIGN-BRIEF.md` before broad implementation:

- `Content mode`: the dominant mode and any secondary mode.
- `Primary page archetype`: the composition model for the priority route.
- `First-viewport job`: what a visitor should understand or do immediately.
- `Hierarchy`: the order of attention from first viewport through supporting sections.
- `Composition grammar`: alignment, column behavior, section rhythm, grouping, and intentional asymmetry or symmetry.
- `Type roles`: display, heading, body, metadata, code, and their relationship.
- `Spacing rhythm`: the small set of spacing levels that repeat across the system.
- `Surface rules`: background layers, borders, radii, shadows, and when not to use them.
- `Media rules`: aspect ratios, crops, art direction, loading, fallback, and whether media is evidence or atmosphere.
- `Interaction rules`: navigation, filters, forms, hover, focus, transitions, and persistence.
- `Responsive behavior`: what stacks, collapses, scrolls, disappears, or changes priority at narrow widths.
- `Motion budget`: what motion communicates, what is static, and the reduced-motion path.
- `Anti-patterns`: visible choices that would make the site wrong or generic.
- `Real-content fixture`: the actual route and content used to test the design.
- `Decision ownership`: user decisions, project constraints, and agent-owned assumptions.

## First-Viewport Test

Before adding secondary sections, confirm that the first viewport answers:

1. What is this site or person?
2. Who is it for?
3. What is the most useful next action?
4. What visual or textual evidence makes it credible?
5. What remains visible and usable on a narrow screen?

If a decorative device competes with those answers, remove or demote it.

## Vertical Slice

The first implementation pass contains:

- The first viewport of the priority route.
- The primary action and its real interaction state.
- One representative detail, article, project, or service route.
- Real approved copy, including a long title and realistic body content.
- Representative links, lists, metadata, and media when the content mode uses them.
- The selected theme states and the narrow layout.

Do not fill the rest of the site with generic components before this slice has passed visual QA.

## Self-Critique Rubric

Before asking the user to review, inspect the slice and fix:

- P0: broken routes, unreadable text, overflow, missing content, unusable interaction, accidental private content, or failed theme/navigation state.
- P1: wrong page archetype, weak hierarchy, generic composition, poor content measure, inconsistent tokens, or mobile layout that merely shrinks desktop.
- P2: minor polish such as small timing, border, or spacing refinements.

The agent should resolve P0 and P1 issues without making the user enumerate them.

## Refactor Rule

If two changes target the same layout defect, stop stacking selector overrides. Inspect the rendered DOM and computed geometry, then repair the parent grid, component boundary, or design primitive. A repeated patch is evidence that the implementation model is wrong.
