# Client Interview and Design Brief

Use this reference when a standalone site request is still underspecified. It adapts the frontier-based interview pattern from Matt Pocock’s `grill-me` material: ask the questions whose prerequisites are settled, use the answers to unlock the next frontier, and keep the user in charge of scope.

Source basis: `https://github.com/mattpocock/skills/tree/main/skills/productivity/grill-me`. The useful behavior is the frontier-based interview described by that source’s supporting documentation, not a copied questionnaire.

## Operating Rules

- Start with a one-line `Design Read`: the current audience, outcome, and likely tension.
- Interview as a conversation, not a form. Ask a small batch, then reflect what changed.
- Ask about the whole current frontier. Do not ask a dependent question before its parent decision is understood.
- Push back on contradictions and vague goals, but accept “I do not know” without inventing an answer.
- Preserve user scope. Do not turn an exploratory website into a product, CMS, or brand project without agreement.
- Count rounds, not questions. Four rounds with 4–8 questions each is usually enough; a very large count is a scope signal.
- Maintain an `Unresolved` list and remove items only when the user decides or a prototype answers them.
- If the choice is ungrillable in prose, stop interviewing and build a throwaway comparison instead.

## Opening Pattern

1. Restate the request in one sentence.
2. State the first design read and the assumptions that could change the build.
3. Ask Round 1 only.
4. Summarize decisions and contradictions before moving to Round 2.

Example shape:

```text
Design Read: [audience] needs [primary action], but the site must balance [tension].

Round 1: outcome, audience, and constraints
1. ...?
2. ...?
```

## Round 1: Client, Audience, Outcome

Ask only what defines the site’s job:

- Who is the client, and what do they actually do?
- Who is the primary visitor? Who is secondary?
- What should the ideal visitor do in the first visit?
- What is the business or reputational outcome behind that action?
- Why does this site exist now? What is changing from the current state?
- What would make the launch clearly successful after 30–90 days?
- What must the site never imply or promise?
- What constraints are already fixed: budget, launch date, platform, legal, brand, or content?

## Round 2: Information Architecture and Content

Ask after the audience and outcome are clear:

- What pages or destinations are necessary at launch?
- Which page or section deserves the most attention?
- What content already exists, and where is it stored?
- Which content will change often enough to need collections or MDX?
- What proof is available: work, testimonials, credentials, process, results, press, or partners?
- What is the primary CTA and what is the fallback CTA?
- What can be omitted without weakening the decision to contact, visit, buy, read, or hire?
- Are there routes, languages, legal pages, redirects, or structured data requirements?

## Round 3: Brand and Visual Direction

Ask after the site’s content hierarchy is known:

- What three words should the site feel like? What three words should it avoid?
- Which websites, studios, publications, products, or physical references feel right?
- What specifically is working in each reference: type, spacing, image treatment, navigation, tone, density, or motion?
- Are there existing brand tokens, a styleguide, `globals.css`, palette, fonts, logos, or image rules?
- Should the visual system be quiet, editorial, raw, playful, cinematic, technical, luxurious, or something else?
- What does the client own or have permission to use for imagery, video, type, and marks?
- How much motion is useful, and where would motion become a distraction or accessibility problem?
- Should the first viewport communicate atmosphere, proof, offer, or a direct action?

## Round 4: Behavior, Quality, and Delivery

Ask after style and hierarchy are credible:

- Which interactions materially help the visitor: filtering, search, galleries, forms, maps, booking, video, or downloads?
- What happens when content is empty, an image fails, a form fails, or a third-party service is unavailable?
- What accessibility level and keyboard, contrast, motion, and reduced-motion requirements apply?
- What performance target matters most: mobile load, image-heavy work, video, interaction, or search visibility?
- What analytics, consent, email, CRM, calendar, or CMS integration is required?
- Who will maintain content and deploy future changes?
- Is Cloudflare Pages acceptable as the default hosting target? What domain and account will own it?
- What is the acceptance test for each important page and the launch as a whole?

## Round 5: Decision and Acceptance Check

Use only when a high-impact choice remains:

- Which tradeoff matters more: speed or richness, breadth or depth, novelty or familiarity, atmosphere or conversion?
- What would make the proposed direction feel wrong even if it is technically correct?
- Which design option should be rejected, and why?
- What is explicitly out of scope for this launch?
- Can the user approve the design read, page list, style direction, content assumptions, and acceptance criteria?

## Handoff to Design Execution

The interview is not a request for the user to specify the entire page. Once the site’s job, content, audience, constraints, and visual direction are clear, stop asking low-impact questions and load `references/design-execution.md`.

Translate the brief into concrete implementation decisions: content mode, page archetype, first-viewport job, hierarchy, composition grammar, type roles, spacing rhythm, surface rules, media treatment, responsive behavior, motion budget, and anti-patterns. The agent owns reasonable defaults and records them as assumptions. If a high-impact visual choice remains uncertain, build a comparison slice instead of extending the interview.

## Round Closeout

After every round, record:

- `Decided`: facts or choices the build can rely on.
- `Assumptions`: plausible but unconfirmed details.
- `Unresolved`: choices that could still change structure, style, or implementation.
- `Next frontier`: the smallest set of questions unlocked by the decisions.

Stop when the unresolved list contains only low-impact polish or user-approved assumptions. Write the design brief before broad implementation. If the user wants to revise the brief later, treat the revision as a new decision round and assess scope impact before changing code.
