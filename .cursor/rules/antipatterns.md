---
description: Common mistakes and antipatterns to avoid in BackBox
globs: ["**/*.ts", "**/*.tsx"]
alwaysApply: true
---

# Antipatterns & Common Mistakes

> Things that will break CI, cause bugs, or fight the framework.

## 🚫 CI Blockers (will fail PR)

### Direct Prisma imports in apps/web

```typescript
// ❌ WRONG - CI will fail (boundary-checks job)
import { db } from "@repo/database";
import { PrismaClient } from "@prisma/client";

// ✅ CORRECT - use API procedures
import { orpc } from "@shared/lib/orpc-client";
const project = await orpc.backbox.getProject({ projectId });
```

### MSW/mocks in production code

```typescript
// ❌ WRONG - CI will fail (prod-mock-ban job)
import { handlers } from "msw";
import { setupWorker } from "msw/browser";

// ✅ CORRECT - dev-only with dynamic import
if (process.env.NODE_ENV === "development") {
  const { setupMocks } = await import("./mocks/setup");
  setupMocks();
}
```

### Hardcoded error codes

```typescript
// ❌ WRONG - duplicated string literals
if (error.errorCode === "FORBIDDEN") { ... }

// ✅ CORRECT - import from contract
import { ERROR_CODES } from "@repo/shared/contracts/backbox";
if (error.errorCode === ERROR_CODES.FORBIDDEN) { ... }
```

## 🚫 Framework Fights (Supastarter violations)

### Next.js route handlers for features

```typescript
// ❌ WRONG - don't create route handlers for feature endpoints
// apps/web/app/api/backbox/start/route.ts
export async function POST() { ... }

// ✅ CORRECT - use oRPC procedures
// packages/api/modules/backbox/procedures/start-trial.ts
export const startTrialProject = protectedProcedure
  .route({ method: "POST", path: "/backbox/start" })
  // ...
```

**Exception:** Webhooks (like LemonSqueezy) use route handlers per Supastarter pattern.

### Custom auth/session handling

```typescript
// ❌ WRONG - custom session logic
const session = await verifyJWT(request.headers.get("authorization"));

// ✅ CORRECT - use kit auth
import { getSession } from "@saas/auth/lib/server";
const session = await getSession();
```

### Direct config loading

```typescript
// ❌ WRONG - reading env directly for app config
const apiKey = process.env.LEMONSQUEEZY_API_KEY;

// ✅ CORRECT - use config package
import { config } from "@repo/config";
// (for env vars needed at runtime, they should be wired through config)
```

## 🚫 BackBox Logic Errors

### Implementing guards ad-hoc

```typescript
// ❌ WRONG - guard logic scattered in procedure
export const saveAnswer = protectedProcedure.handler(async ({ input, context }) => {
  if (!context.user.emailVerified) throw new Error("Not verified");
  const project = await getProject(input.projectId);
  if (project.userId !== context.user.id) throw new Error("Not owner");
  // ...
});

// ✅ CORRECT - use shared guard helper
import { backboxGuard } from "../lib/guards";

export const saveAnswer = protectedProcedure.handler(async ({ input, context }) => {
  await backboxGuard(context, {
    emailVerified: true,
    ownership: input.projectId,
    accessPolicy: true,
  });
  // ...
});
```

### Resetting trial state

```typescript
// ❌ WRONG - violates RULE-TRIAL-03 (NO DELETE RESET)
async function deleteProject(projectId) {
  await db.project.delete({ where: { id: projectId } });
  // WRONG: resetting trial
  await db.userTrial.update({
    where: { userId },
    data: { trialProjectId: null, consumedAt: null },
  });
}

// ✅ CORRECT - delete never resets trial
async function deleteProject(projectId) {
  await db.project.delete({ where: { id: projectId } });
  // trialProjectId and consumedAt stay unchanged (invariant)
}
```

### Consuming trial at wrong time

```typescript
// ❌ WRONG - consuming trial on access page
async function handleAccess() {
  await consumeTrial(userId); // TOO EARLY
  redirect("/backbox/start");
}

// ✅ CORRECT - consume on submit (startTrialProject)
// Trial is consumed when project is actually created
async function startTrialProject({ sourceText }) {
  const project = await createProject(sourceText);
  await markTrialConsumed(userId, project.id); // CORRECT TIME
  return { projectId: project.id };
}
```

### AI fallback logic

```typescript
// ❌ WRONG - implementing fallback (ADR-005 says NO)
try {
  return await callAI();
} catch {
  return await callBackupAI(); // NO FALLBACK ALLOWED
}

// ✅ CORRECT - 1 retry max, then AI_UNAVAILABLE
try {
  return await callAI();
} catch (firstError) {
  try {
    return await callAI(); // 1 retry
  } catch {
    throw { status: 500, errorCode: 'AI_UNAVAILABLE' };
  }
}
```

### Incrementing quota on attempt (not success)

```typescript
// ❌ WRONG - incrementing before AI call
await incrementEvalCount(userId, pillar);
const result = await callAI(); // might fail!

// ✅ CORRECT - increment only after success persisted
const result = await callAI();
await saveResult(projectId, pillar, result);
await incrementEvalCount(userId, pillar); // ONLY after success
```

## 🚫 UI Mistakes

### Branching on HTTP status instead of errorCode

```typescript
// ❌ WRONG - HTTP status is not enough
if (error.status === 403) {
  showForbiddenScreen(); // But WHY forbidden? Ownership? Entitlement? Email?
}

// ✅ CORRECT - use errorCode for precise UI
switch (error.errorCode) {
  case 'FORBIDDEN':
    // Check context for specific message
    showForbiddenScreen(error.message);
    break;
  case 'QUOTA_REACHED':
    showQuotaScreen();
    break;
}
```

### Inventing UI states

```typescript
// ❌ WRONG - state not in Figma
if (someWeirdCondition) {
  return <WeirdStateIInvented />; // NOT IN FIGMA
}

// ✅ CORRECT - only states from Figma inventory
// loading | empty | error | disabled | normal
```

### Guessing copy/microcopy

```typescript
// ❌ WRONG - making up text
<Button>Upgrade Now!</Button>

// ✅ CORRECT - use canonical copy from Figma (ADR-010)
<Button>Passer Premium</Button>
```

## 🚫 PR Discipline Violations

### Mixed PRs

```
// ❌ WRONG PR - too many subjects
feat: implement trial + fix login bug + refactor utils
```

```
// ✅ CORRECT - one subject per PR
feat: implement startTrialProject procedure
```

### Refactoring "while you're there"

```typescript
// ❌ WRONG - opportunistic refactor
// "I'll just clean up this file while implementing the feature"

// ✅ CORRECT - patch-size only
// Focus on the slice task, create separate issue for cleanup
```

### Removing Stripe code

```typescript
// ❌ WRONG - removing "unused" Stripe code
// Decision says LemonSqueezy, so I'll delete Stripe...

// ✅ CORRECT - leave inert code alone
// Stripe code may remain if unreachable; don't expand OR remove it
```

## Quick Reference: What Breaks What

| Mistake | CI Job That Fails |
|---------|-------------------|
| Import `@repo/database` in apps/web | `boundary-checks` |
| Import `@prisma/client` in apps/web | `boundary-checks` |
| Import `msw` unconditionally | `boundary-checks` |
| MSW bundled in prod | `prod-mock-ban` |
| Type error | `type-check` |
| Biome error | `lint` |
| Build error | `build` |
| Playwright test fails | `e2e` |
