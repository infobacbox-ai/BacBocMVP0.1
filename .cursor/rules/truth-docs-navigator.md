---
description: How to navigate BackBox Source of Truth docs
globs: ["**/*.ts", "**/*.tsx"]
alwaysApply: false
---

# Truth Docs Navigator

> Guide for agents: how to find the right answer in the Source of Truth docs.

## The 6 Canonical Documents

Located in `IMPORTANT SOURCE OF TRUTH + DOCS/`:

| Doc | What it answers | When to read |
|-----|-----------------|--------------|
| **1. PRD Lite** | What is BackBox? Who is it for? | Understanding context |
| **2. State & Flow Map** | User journey, states, transitions | Building flows |
| **3. Contract Spec** | Server rules, errors, quotas | Implementing API |
| **4. Acceptance Tests (GWT)** | What must pass to be "done" | Testing, edge cases |
| **5. Figma Visual Truth** | Screens, states, microcopy | Building UI |
| **6. Decision Log** | Locked decisions, changes | Avoiding drift |

## Priority Rule (CANON hierarchy)

When docs conflict:

```
Contract Spec > Acceptance Tests > Decision Log > Figma > Flow Map > PRD
```

**Rule:** If a source contradicts the CANON, don't implement "au feeling" — note the divergence in Decision Log.

## Quick Lookup Table

### "What error should I return?"
→ **Contract Spec** § Error Model + § Endpoint Rules

### "What should the UI show for error X?"
→ **Figma Visual Truth** § Error Catalog + § Screen States

### "Is this behavior correct?"
→ **Acceptance Tests (GWT)** — find the matching scenario

### "What's the user flow for X?"
→ **State & Flow Map** — see the diagram

### "Why was this decision made?"
→ **Decision Log** — search by ADR-ID

### "What's in/out of MVP0?"
→ **PRD Lite** § Scope + § No-List

## Key Sections by Task

### Implementing Trial Logic

1. **Contract Spec** → `accessState`, `entitlement_status`, trial invariants
2. **Acceptance Tests** → GWT scenarios for trial
3. **Decision Log** → ADR-001, ADR-002, ADR-003 (trial rules)

### Implementing Error Handling

1. **Contract Spec** → `ApiError` model, error codes
2. **Figma Visual Truth** → Error screens, microcopy
3. **Acceptance Tests** → Error scenario GWTs

### Implementing AI Evaluation

1. **Contract Spec** → Quota, rate-limit, lock rules
2. **Decision Log** → ADR-005 (no fallback), ADR-006 (quota on success)
3. **Acceptance Tests** → AI unavailable, quota reached scenarios

### Building a New Screen

1. **Figma Visual Truth** → Screen design, states (loading/empty/error/disabled)
   - If Figma MCP is configured, you can query designs directly: "What does [ScreenName] look like in Figma?"
2. **State & Flow Map** → Where this screen fits in the journey
3. **Contract Spec** → What data/errors to expect

## Dependency Pointer Format

When referencing rules in code or docs:

```
Dependency: <DocName> → <SectionTitle> → <RULE-ID>
```

Examples:
```
// Dependency: Contract Spec → Trial Invariants → RULE-TRIAL-01
// Dependency: Decision Log → ADR-003 → NO DELETE RESET
```

## RULE-ID Format

```
RULE-<DOMAIN>-<NN>
```

Domains:
- `TRIAL` — Trial access rules
- `GUARD` — Server-side guards
- `ERROR` — Error handling
- `AI` — AI evaluation rules
- `EXPORT` — Export rules

## Reading Order for New Agents

1. **A LIRE EN PREMIER** — This explains everything
2. **State & Flow Map** — Visual overview (5 min)
3. **Contract Spec** — Deep dive on rules (30 min)
4. **Acceptance Tests** — What "done" looks like
5. **Figma Visual Truth** — When building UI

## Don't Guess, Ask

If you can't find the answer in the docs:

1. Check the **Decision Log** for related decisions
2. Check the **Slices Plan** for implementation context
3. If still unclear, **ask** rather than guess

## Document Update Rules

- **Contract Spec changes** → Require Decision Log entry
- **Figma changes** → Require Decision Log entry (ADR-011 freeze)
- **Acceptance Test changes** → Update corresponding Contract Spec section
- **PRD changes** → Rare, usually means scope change

## Forbidden Actions

- ❌ Implementing without checking Contract Spec
- ❌ Creating new error codes not in Contract Spec
- ❌ Adding UI states not in Figma
- ❌ Breaking an Acceptance Test scenario
- ❌ Changing a locked decision without Decision Log entry
