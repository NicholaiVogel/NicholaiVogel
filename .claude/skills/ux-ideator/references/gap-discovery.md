# Gap Discovery Framework

## Table of Contents
1. [Codebase Analysis Patterns](#codebase-analysis-patterns)
2. [User Journey Friction Points](#user-journey-friction-points)
3. [Spec vs Reality Gaps](#spec-vs-reality-gaps)
4. [Feature Flag Archaeology](#feature-flag-archaeology)

---

## Codebase Analysis Patterns

### TODO/FIXME Mining
Search for incomplete work signals:
```
grep -rn "TODO\|FIXME\|HACK\|XXX\|INCOMPLETE" src/
```

Categorize findings by:
- **Blocking**: Prevents core functionality
- **Enhancement**: Improves existing feature
- **Technical Debt**: Cleanup or refactor needed

### Stub Detection
Identify placeholder implementations:
- Functions returning hardcoded values
- Components with "Coming Soon" or skeleton UI
- API endpoints returning 404/501
- Event handlers that log but don't act

### Dead Code Paths
Find unreachable or disabled features:
- Conditional branches that never execute
- Commented-out functionality
- Feature flags set to false
- Unused exports in module index files

---

## User Journey Friction Points

### Interaction Friction Categories

| Category | Signal | Example |
|----------|--------|---------|
| **Discovery** | Feature exists but hidden | Settings → submenu → feature |
| **Affordance** | Unclear how to interact | No hover states, missing labels |
| **Feedback** | Action has no response | Button click with no indication |
| **Recovery** | No path back from error | Error state with no retry option |
| **Completion** | Workflow ends abruptly | Form submits but no confirmation |

### Navigation Depth Analysis
Optimal: 1-2 clicks to core features
Concerning: 3+ clicks to frequently-used features

Map click depth for:
- Primary actions (chat, task assignment)
- Secondary actions (settings, history)
- Discovery features (memory, analytics)

### Cognitive Load Indicators
- Multiple concepts on single screen
- Jargon without explanation
- Inconsistent terminology
- Information overload without hierarchy

---

## Spec vs Reality Gaps

### Documentation Sources to Compare
1. **PRD/Technical Brief** - Intended functionality
2. **Code Comments** - Developer intent
3. **UI Labels/Copy** - User-facing promises
4. **API Contracts** - Expected data flow

### Gap Categories

**Missing Implementation**
- Spec describes feature, code doesn't exist
- UI references capability that's not built

**Partial Implementation**
- Feature works in some cases, not others
- Happy path only, no edge case handling

**Divergent Implementation**
- Built differently than specified
- May be intentional pivot or oversight

**Stale Documentation**
- Code has evolved, docs haven't
- Creates confusion for new contributors

---

## Feature Flag Archaeology

### Common Flag Patterns
```typescript
const USE_FEATURE = false;           // Disabled feature
const ENABLE_EXPERIMENTAL = false;   // Unreleased feature
if (process.env.NODE_ENV === 'development') // Dev-only
```

### Flag Status Categories

| Status | Meaning | Action |
|--------|---------|--------|
| `false` (long-term) | Abandoned or blocked | Investigate why, propose resolution |
| `false` (recent) | In development | Check progress, offer help |
| `true` but unused | Dead code | Propose cleanup |
| Environment-gated | Staged rollout | Check if ready for promotion |

### Investigation Questions
- When was flag introduced? (git blame)
- Why is it disabled? (commit message, PR)
- What's blocking enablement? (linked issues)
- Is the feature still wanted? (product roadmap)
