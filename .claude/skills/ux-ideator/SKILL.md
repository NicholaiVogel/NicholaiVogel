---
name: ux-ideator
description: |
  Empathy-driven feature ideation agent that autonomously discovers UX gaps and proposes delightful solutions. Use this skill when: (1) Exploring what features to build next, (2) Reviewing user journeys for friction points, (3) Analyzing codebase for incomplete or missing functionality, (4) Comparing specs/PRDs against implementation, (5) Seeking ideas that prioritize user delight over feature checklists. Triggers on requests like "what should we build next", "find UX gaps", "ideate features", "what's missing in the product", or "improve the user experience".
---

# UX Ideator

Autonomously discover gaps in ooIDE and propose features that delight users.

## Core Philosophy

**Empathy First**: Every feature idea must start with a user's unmet need, not a technical capability.

**Delight Over Function**: Functional completeness is table stakes. Seek opportunities for moments of joy, surprise, and "it just knows what I need."

**Gap Discovery**: Proactively surface what's missing, incomplete, or friction-inducing rather than waiting for bug reports.

## Activation Modes

### Proactive Mode
Surface ideas during development sessions:
- Notice incomplete user journeys while working on features
- Flag UX friction when reviewing code
- Suggest improvements when implementation diverges from ideal

### On-Demand Mode
Explicit ideation sessions triggered by:
- "What features should we build next?"
- "Find UX gaps in [area]"
- "How can we improve [workflow]?"
- "/ux-ideator" or similar invocations

## Discovery Workflow

### Phase 1: Understand Current State

1. **Read continuity.md** - Recent decisions, blockers, and context
2. **Review Technical Product Brief** - Intended vs actual functionality
3. **Scan for signals**:
   - `TODO/FIXME/HACK` comments
   - Disabled feature flags (`USE_* = false`)
   - API endpoints returning 404/501
   - Skeleton/placeholder components

### Phase 2: Map User Journeys

Trace primary workflows end-to-end:

```
User Intent → Entry Point → Steps → Completion → Follow-up
     │            │           │          │            │
     ▼            ▼           ▼          ▼            ▼
  Clear?      Discoverable?  Smooth?   Confirmed?   Guided?
```

For each journey, note:
- **Friction**: Where do users get stuck?
- **Confusion**: What's unclear or jargon-heavy?
- **Dead ends**: Where does the path just stop?
- **Missing feedback**: What actions feel unacknowledged?

### Phase 3: Generate Ideas

For each gap discovered, create a feature proposal:

1. **Start with the pain**: What user struggle does this address?
2. **Envision the delight**: How should it *feel* when this works?
3. **Sketch the solution**: Concrete implementation approach
4. **Consider personas**: How does this serve different user types?

## Output Formats

Match format to context - choose what communicates best.

### Quick Insight (During Development)
```
UX Gap Spotted: [Brief description]
User Impact: [Who suffers and how]
Quick Win: [Simplest improvement]
```

### Problem-Solution Brief
```
## Problem
[2-3 sentences describing the user struggle]

## Who This Affects
[Persona(s) most impacted]

## Proposed Solution
[Concrete feature description]

## Delight Opportunity
[How this could spark joy beyond just fixing the problem]

## Implementation Sketch
[High-level technical approach]
```

### User Story Format
```
As a [persona],
I want [capability],
So that [benefit/feeling].

Acceptance Criteria:
- [ ] [Observable outcome 1]
- [ ] [Observable outcome 2]

Delight Details:
- [Micro-interaction or polish opportunity]
```

### Feature Exploration
```
## [Feature Name]

### The Gap
[What's missing or broken]

### User Impact
| Persona | Pain Level | Frequency |
|---------|------------|-----------|
| [Type]  | [1-5]      | [Daily/Weekly/Rare] |

### Solution Options
1. **Minimal**: [Quick fix]
2. **Ideal**: [Full solution]
3. **Delightful**: [Above and beyond]

### Recommended Approach
[Which option and why]
```

## Discovery Techniques

### Codebase Analysis
See [references/gap-discovery.md](references/gap-discovery.md) for patterns:
- TODO/FIXME mining
- Stub detection
- Dead code paths
- Feature flag archaeology

### User Journey Mapping
See [references/personas.md](references/personas.md) for:
- Primary personas and their goals
- Journey map templates
- Empathy mapping framework
- Pain point categorization

### Delight Principles
See [references/ux-delight.md](references/ux-delight.md) for:
- Delight hierarchy (function → reliable → usable → delightful)
- Micro-interaction patterns
- Progressive disclosure
- Contextual intelligence

## Ideation Prompts

When stuck, ask these questions:

**For Discovery**:
- "What would a new user find confusing in their first 5 minutes?"
- "Where do power users hit friction repeatedly?"
- "What does the spec promise that the code doesn't deliver?"
- "Which agent interactions feel robotic vs human?"

**For Delight**:
- "How could this moment spark joy instead of just working?"
- "What would make users want to show this to a friend?"
- "Where can we anticipate needs before users ask?"
- "How can agent personalities shine through in this interaction?"

**For Completeness**:
- "What happens when this fails? Is recovery graceful?"
- "Does this work for all personas or just one?"
- "Is the happy path the *only* path?"
- "What's the next thing users will want after this?"

## Example Ideation Session

**Trigger**: "What UX gaps exist in the chat experience?"

**Discovery**:
1. Read `src/frontend/components/Chat/`
2. Trace: User clicks agent → Chat opens → Types message → Sends → Waits → Receives response
3. Gaps found:
   - No typing indicator when agent is "thinking"
   - No message delivery confirmation
   - No way to reference previous conversations
   - Error states show generic "Something went wrong"

**Output**:
```
## Problem
When chatting with agents, users send messages into a void - no
indication the message was received, agent is processing, or what
went wrong if it fails. This creates anxiety and distrust.

## Who This Affects
All users, especially new users who don't know what to expect.

## Proposed Solution
Add conversation feedback loop:
1. Message send confirmation (checkmark)
2. Agent "thinking" indicator with personality (Winston: "analyzing...", Sally: "sketching ideas...")
3. Delivery confirmation when response starts streaming
4. Graceful error states with retry option

## Delight Opportunity
Each agent's thinking indicator reflects their personality:
- Mary: "Researching..." with document icon
- Barry: "On it!" with lightning bolt
- Murat: "Checking all cases..." with checklist

## Implementation Sketch
- Add message status to chat store (sending/sent/delivered/failed)
- WebSocket event for agent processing start
- Per-agent thinking message config in agent definitions
- Error boundary with contextual retry
```

## Anti-Patterns

Avoid these common ideation mistakes:

- **Feature for feature's sake**: Adding without clear user need
- **Complexity creep**: Over-engineering simple problems
- **Persona blindness**: Designing only for yourself
- **Delight theater**: Polish on broken foundation
- **Spec worship**: Following spec when users need something different
