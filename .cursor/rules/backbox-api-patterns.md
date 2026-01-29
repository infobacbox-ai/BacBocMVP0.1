---
description: BackBox API patterns - endpoints, errors, guards (Contract Spec aligned)
globs: ["packages/api/**/*.ts", "apps/web/**/use-*.ts", "apps/web/**/lib/*.ts"]
---

# BackBox API Patterns

> **Source of Truth:** `Contract Spec (Artifact 3)` + `Slices Plan v4.3.3`

## Endpoint Structure

All BackBox features use **oRPC procedures** under `packages/api/modules/backbox/`.

```
packages/api/modules/backbox/
├── router.ts              # Route definitions
├── procedures/
│   ├── start-trial.ts     # backbox.startTrialProject
│   ├── create-paid.ts     # backbox.createPaidProject
│   ├── get-project.ts     # backbox.getProject
│   ├── list-projects.ts   # backbox.listProjects
│   ├── save-answer.ts     # backbox.saveAnswer
│   ├── generate-mini.ts   # backbox.generateMiniRecap
│   ├── generate-final.ts  # backbox.generateFinalRecap
│   └── export-html.ts     # backbox.exportHtml
└── lib/
    └── guards.ts          # Shared guard helper (SINGLE SOURCE)
```

## Canonical Error Model (ApiError)

```typescript
type ApiError = {
  status: 400 | 401 | 403 | 404 | 409 | 429 | 500;
  errorCode:
    | 'VALIDATION_ERROR'
    | 'UNAUTHENTICATED'
    | 'FORBIDDEN'
    | 'NOT_FOUND'
    | 'FINAL_REQUIRED'
    | 'QUOTA_REACHED'
    | 'RATE_LIMIT'
    | 'EVALUATION_IN_PROGRESS'
    | 'AI_UNAVAILABLE'
    | 'INTERNAL_ERROR';
  message: string;
  details?: Record<string, unknown>;
};
```

### Error → HTTP Status Mapping

| errorCode | HTTP | When |
|-----------|------|------|
| `VALIDATION_ERROR` | 400 | Invalid input |
| `UNAUTHENTICATED` | 401 | No session |
| `FORBIDDEN` | 403 | Ownership, entitlement, email not verified |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `FINAL_REQUIRED` | 409 | Export without finalRecap |
| `QUOTA_REACHED` | 429 | Trial quota exhausted |
| `RATE_LIMIT` | 429 | Too many requests/hour |
| `EVALUATION_IN_PROGRESS` | 429 | Concurrent AI call blocked |
| `AI_UNAVAILABLE` | 500 | Provider down/timeout |
| `INTERNAL_ERROR` | 500 | Default server error |

## Guard Rules (Server-Side Mandatory)

All `backbox.*` procedures MUST call the **shared guard helper** (`packages/api/modules/backbox/lib/guards.ts`).

### Guard Checklist

```typescript
// Required for ALL backbox.* procedures
const guards = {
  auth: true,                    // Session required
  emailVerified: true,           // For write/AI/export
  ownership: (projectId) => ..., // project.userId === user.id
  accessPolicy: (projectId) => {
    // PAID: allow all owned projects
    // TRIAL_ACTIVE: only trialProjectId
    // TRIAL_AVAILABLE: only startTrial allowed
  },
};
```

### Which guards apply where

| Procedure | auth | emailVerified | ownership | accessPolicy |
|-----------|------|---------------|-----------|--------------|
| `listProjects` | ✅ | ❌ | - | - |
| `getProject` | ✅ | ❌ | ✅ | - |
| `startTrialProject` | ✅ | ✅ | - | TRIAL_AVAILABLE |
| `createPaidProject` | ✅ | ✅ | - | PAID |
| `saveAnswer` | ✅ | ✅ | ✅ | ✅ |
| `generateMiniRecap` | ✅ | ✅ | ✅ | ✅ |
| `generateFinalRecap` | ✅ | ✅ | ✅ | ✅ |
| `exportHtml` | ✅ | ✅ | ✅ | ✅ |

## Contract Types Location

**Single source of truth:** `packages/shared/src/contracts/backbox.contract.ts`

```typescript
// ✅ CORRECT - import from contract
import { 
  type ApiError, 
  type StartTrialInput,
  ERROR_CODES 
} from "@repo/shared/contracts/backbox";

// ❌ WRONG - duplicated types
const errorCodes = ['FORBIDDEN', 'NOT_FOUND', ...]; // NO!
```

## Procedure Template

```typescript
// packages/api/modules/backbox/procedures/example.ts
import { protectedProcedure } from "../../../orpc/procedures";
import { backboxGuard } from "../lib/guards";
import { exampleInputSchema, exampleOutputSchema } from "@repo/shared/contracts/backbox";

export const exampleProcedure = protectedProcedure
  .route({
    method: "POST",
    path: "/backbox/example",
    tags: ["BackBox"],
    summary: "Example procedure",
  })
  .input(exampleInputSchema)
  .output(exampleOutputSchema)
  .handler(async ({ input, context }) => {
    // 1. Guards (MUST use shared helper)
    await backboxGuard(context, {
      emailVerified: true,
      ownership: input.projectId,
      accessPolicy: true,
    });

    // 2. Business logic
    // ...

    // 3. Return typed output
    return { ok: true };
  });
```

## AI Procedure Specifics (Slice 6+)

For `generateMiniRecap` and `generateFinalRecap`:

```typescript
// Additional guards for AI procedures
const aiGuards = {
  ...baseGuards,
  quota: {
    // Trial: evalCounts[pillar] < 2
    check: (user, pillar) => user.evalCounts[pillar] < 2,
    error: { status: 429, errorCode: 'QUOTA_REACHED' },
  },
  rateLimit: {
    // 10 evals/hour for all users
    check: (user) => user.evalsThisHour < 10,
    error: { status: 429, errorCode: 'RATE_LIMIT' },
  },
  lock: {
    // No concurrent AI calls per project
    check: (projectId) => !hasActiveLock(projectId),
    error: { status: 429, errorCode: 'EVALUATION_IN_PROGRESS' },
  },
};
```

## One-Run Trial Invariants

```typescript
// INVARIANTS (never break these)
const trialInvariants = {
  // 1. Trial consumed at submit, not at access
  consumedAt: "set when startTrialProject succeeds",
  
  // 2. NO DELETE RESET - deleting project never resets trial
  onDelete: "trialProjectId stays set, consumedAt stays set",
  
  // 3. Trial project ID is stable
  trialProjectId: "set once, never changes",
};
```
