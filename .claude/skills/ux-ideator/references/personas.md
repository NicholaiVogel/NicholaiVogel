# User Personas for ooIDE

## Table of Contents
1. [Primary Personas](#primary-personas)
2. [Journey Maps](#journey-maps)
3. [Empathy Mapping](#empathy-mapping)
4. [Pain Point Identification](#pain-point-identification)

---

## Primary Personas

### 1. The Solo Developer
**Profile**: Individual developer working on personal or freelance projects

**Goals**:
- Ship features faster with AI assistance
- Learn best practices from agent guidance
- Reduce context-switching between tools

**Frustrations**:
- MCP configuration overhead
- Losing context between sessions
- AI responses that don't understand their codebase

**Delights**:
- Agent remembers previous conversations
- Code suggestions that match project style
- Feeling like a productive team of one

---

### 2. The Tech Lead
**Profile**: Senior developer coordinating work across team members

**Goals**:
- Maintain architectural consistency
- Onboard new team members efficiently
- Track progress across multiple workstreams

**Frustrations**:
- Misaligned implementations
- Repeated explanations of patterns
- Difficulty seeing team progress at glance

**Delights**:
- Agents enforce established patterns
- Visual representation of team activity
- Shared memory that persists across sessions

---

### 3. The New User
**Profile**: First-time user exploring ooIDE capabilities

**Goals**:
- Understand what the tool can do
- Complete first successful interaction
- Build confidence with AI collaboration

**Frustrations**:
- Overwhelming features on first load
- Unclear where to start
- Fear of "breaking something"

**Delights**:
- Guided onboarding experience
- Quick wins within first 5 minutes
- Discovery of unexpected capabilities

---

### 4. The Product Builder
**Profile**: Non-technical or semi-technical user building products

**Goals**:
- Translate ideas into working features
- Understand technical tradeoffs
- Communicate effectively with agents

**Frustrations**:
- Technical jargon without explanation
- Not knowing what to ask for
- Losing track of project decisions

**Delights**:
- Agents speak in accessible language
- Visual representation of progress
- Decision history explains "why"

---

## Journey Maps

### First Session Journey

```
Discovery → Installation → First Launch → Orientation → First Interaction → First Win → Return
    │            │              │              │               │              │         │
    ▼            ▼              ▼              ▼               ▼              ▼         ▼
 "What is    "How do I    "Where do I    "Who are      "Did that      "It works!" "I want to
  this?"     set up?"      start?"      these agents?"  work?"                     continue"
```

**Critical Moments**:
- First Launch: Must not overwhelm
- First Interaction: Must feel responsive
- First Win: Must happen within 5 minutes

### Returning User Journey

```
Return → Context Recall → Continue Work → Hit Blocker → Get Help → Resolve → Ship
   │           │               │              │            │          │       │
   ▼           ▼               ▼              ▼            ▼          ▼       ▼
"Where    "Oh, it       "Let me       "This isn't   "Can Mary   "That    "Done!"
was I?"   remembers!"    continue"     working"      help?"     worked!"
```

**Critical Moments**:
- Context Recall: Memory must be visible
- Hit Blocker: Help must be accessible
- Resolve: Solution must feel earned

---

## Empathy Mapping

### Template for Each Persona

```
         ╭─────────────────────────────────╮
         │           THINKS                │
         │  What occupies their mind?      │
         │  What worries them?             │
         │  What aspirations do they have? │
         ├─────────────────────────────────┤
    ╭────┤           SEES                  ├────╮
    │    │  What does their environment    │    │
    │    │  look like? What do they        │    │
    │    │  observe others doing?          │    │
    ├────┼─────────────────────────────────┼────┤
    │    │           DOES                  │    │
    │    │  What actions do they take?     │    │
    │    │  What behaviors can we observe? │    │
    ├────┼─────────────────────────────────┼────┤
    │    │           FEELS                 │    │
    │    │  What emotions drive them?      │    │
    │    │  What fears hold them back?     │    │
    ╰────┴─────────────────────────────────┴────╯
```

### Empathy Questions for Feature Ideation
1. "If I were [persona], how would this make me feel?"
2. "What would [persona] expect to happen next?"
3. "What might confuse [persona] about this?"
4. "How would [persona] describe this to a friend?"
5. "What would make [persona] want to come back?"

---

## Pain Point Identification

### Pain Point Categories

| Category | Description | Signal Phrases |
|----------|-------------|----------------|
| **Process** | Workflow inefficiencies | "Too many steps", "Why can't I just..." |
| **Knowledge** | Missing information | "Where do I find...", "I don't know how to..." |
| **Technical** | System limitations | "It doesn't work when...", "I wish it could..." |
| **Emotional** | Frustration/anxiety | "I'm worried about...", "It's stressful when..." |

### Severity Assessment

**Critical (Blocks completion)**
- User cannot complete primary task
- No workaround exists
- Causes data loss or errors

**Major (Causes significant friction)**
- User must find workaround
- Multiple steps for simple action
- Creates confusion or errors

**Minor (Annoyance)**
- User notices but continues
- Cosmetic or preference issue
- Improvement would be nice

### Converting Pain Points to Features

```
Pain Point → Root Cause → Solution Options → Delight Opportunity
    │            │              │                    │
    ▼            ▼              ▼                    ▼
"I can't     Multiple     1. Unify in one      Add personality
find where   locations    2. Better search     to search results
things are"  for info     3. Contextual nav    with agent hints
```
