# Slice 0.75 Implementation Summary

**Date:** 2026-01-29  
**Status:** ✅ COMPLETE  
**Branch:** slice-0.5-ci-guardrails (will be updated)

This document summarizes the implementation of Slice 0.75, which was defined in the Slices Plan but never executed. It provides the foundational scaffolding required for Slice 1.

---

## Overview

Slice 0.75 addresses the critical gaps identified in the [Slice 1 Readiness Review](c:\Users\thepl\.cursor\plans\slice_1_readiness_review_72d2a02d.plan.md):

1. **No contract types package** - Created `packages/shared` with canonical contract types
2. **No `me.getEntitlements` stub** - Implemented API procedure with dev mock
3. **No BackBox routes** - Created route stubs following Next.js App Router patterns

---

## What Was Implemented

### 1. Contract Types Package (`packages/shared`)

**Files Created:**
- `packages/shared/package.json` - Package configuration
- `packages/shared/tsconfig.json` - TypeScript configuration
- `packages/shared/biome.json` - Linting configuration
- `packages/shared/src/contracts/backbox.contract.ts` - Canonical contract types
- `packages/shared/index.ts` - Package exports

**Contract Types Defined:**
- `EntitlementStatus` - User entitlement status (`none` | `trial_one_run` | `paid`)
- `AccessState` - UI-derived access state (`NONE` | `TRIAL_AVAILABLE` | `TRIAL_ACTIVE` | `PAID`)
- `ProjectMode` - Project mode (`trial` | `paid`)
- `Pillar` - Pillar identifier (`p1` | `p2` | `p3` | `p4`)
- `ProjectStep` - Project step (`p1` | `p2` | `p3` | `p4` | `final`)
- `ERROR_CODES` - Canonical error codes
- `ApiError` - API error structure
- `GetEntitlementsOutput` - Output schema for `me.getEntitlements` (§5.1)
- `MiniRecapOutput` - Mini-recap output schema (§6.1)
- `FinalRecapOutput` - Final recap output schema (§6.2)
- `ProjectSummary` - Project listing schema (§5.4)
- `ProjectDetails` - Full project details schema (§5.5)

**Source of Truth:**
All types are based on [Contract Spec v0.4](IMPORTANT%20SOURCE%20OF%20TRUTH%20+%20DOCS/3.%20BackBox%20MVP%20—%20Contract%20Spec%20(Artifact%203)%20(1).md) sections §0, §4, §5, and §6.

---

### 2. API Procedure: `me.getEntitlements`

**Files Created:**
- `packages/api/modules/me/procedures/get-entitlements.ts` - Procedure implementation
- `packages/api/modules/me/router.ts` - Module router

**Files Modified:**
- `packages/api/orpc/router.ts` - Added `me` module to router
- `packages/api/package.json` - Added `@repo/shared` dependency

**Implementation Details:**
- **Route:** `GET /me/entitlements`
- **Auth:** Protected (requires session)
- **Dev Mock:** Returns `TRIAL_AVAILABLE` state by default in development
- **Production Stub:** Returns safe defaults (will be fully implemented in Slice 3)

**Output Schema (Contract Spec §5.1):**
```typescript
{
  entitlement_status: 'none' | 'trial_one_run' | 'paid'
  accessState: 'NONE' | 'TRIAL_AVAILABLE' | 'TRIAL_ACTIVE' | 'PAID'
  trialProjectId: string | null
  quotas: { perPillarMax: 2, perPillarUsed?: Record<Pillar, number> }
  rateLimit: { perHourMax: 10 }
}
```

---

### 3. Entitlements Client Wrapper

**Files Created:**
- `apps/web/modules/shared/lib/entitlements-client.ts` - Single surface for fetching entitlements

**Files Modified:**
- `apps/web/package.json` - Added `@repo/shared` dependency

**Usage:**
```typescript
// Server Components
import { getEntitlements } from "@shared/lib/entitlements-client";
const entitlements = await getEntitlements();

// Client Components (TanStack Query)
import { orpc } from "@shared/lib/orpc-query-utils";
const { data } = useQuery(orpc.me.getEntitlements.queryOptions());
```

---

### 4. BackBox Route Stubs

**Files Created:**
- `apps/web/app/(saas)/access/page.tsx` - Access gate route
- `apps/web/app/(saas)/backbox/page.tsx` - BackBox dashboard
- `apps/web/app/(saas)/backbox/start/page.tsx` - Start new project form
- `apps/web/app/(saas)/backbox/project/[projectId]/page.tsx` - Project view

**Route Structure:**
- `/access` - Access gate (redirects based on entitlement state)
- `/backbox` - Main dashboard (project list, access state UI)
- `/backbox/start` - Start new trial/paid project
- `/backbox/project/[projectId]` - Project view with wizard navigation

**Implementation:**
- All routes follow existing `(saas)` route group patterns
- Auth checks with `getSession()`
- Redirect to `/auth/login` if unauthenticated
- Placeholder UI with TODO comments for Slice 1 implementation

---

## Quality Checks

### ✅ Linting
```bash
pnpm biome check packages/shared packages/api/modules/me \
  "apps/web/app/(saas)/backbox" "apps/web/app/(saas)/access" \
  "apps/web/modules/shared/lib/entitlements-client.ts"
# Result: ✅ Checked 12 files in 29ms. No fixes applied.
```

### ✅ Type Checking
```bash
pnpm --filter @repo/shared type-check  # ✅ PASS
pnpm --filter @repo/api type-check     # ✅ PASS
```

### ✅ Dependencies
```bash
pnpm install  # ✅ Already up to date (8s)
```

---

## Compliance with Readiness Review

### Section B: Contract-first / Single Surface for Entitlements

| Requirement | Before | After | Evidence |
|-------------|--------|-------|----------|
| `packages/shared` package | ❌ MISSING | ✅ PASS | Directory exists with 5 files |
| Contract file | ❌ MISSING | ✅ PASS | `packages/shared/src/contracts/backbox.contract.ts` |
| Single client surface | ✅ PASS | ✅ PASS | `orpcClient` in `orpc-client.ts` |
| `me.getEntitlements` procedure | ❌ MISSING | ✅ PASS | `packages/api/modules/me/procedures/get-entitlements.ts` |
| Mock isolation | ✅ PASS | ✅ PASS | No MSW imports in source |

### Section C: Slice 1 Can Be Implemented Without "Dashboard Guessing"

| Requirement | Before | After | Evidence |
|-------------|--------|-------|----------|
| `accessState` shape documented | ✅ PASS | ✅ PASS | Defined in `backbox.contract.ts` |
| `trialProjectId` shape documented | ✅ PASS | ✅ PASS | Defined in `GetEntitlementsOutput` |
| Invariant documented | ✅ PASS | ✅ PASS | Contract Spec §0.2 |
| Implementation exists | ❌ MISSING | ✅ PASS | Dev mock returns typed data |

### Section D: Minimal Routing Surface

| Route | Before | After | Evidence |
|-------|--------|-------|----------|
| `/access` | ❌ MISSING | ✅ PASS | `apps/web/app/(saas)/access/page.tsx` |
| `/backbox` | ❌ MISSING | ✅ PASS | `apps/web/app/(saas)/backbox/page.tsx` |
| `/backbox/start` | ❌ MISSING | ✅ PASS | `apps/web/app/(saas)/backbox/start/page.tsx` |
| `/backbox/project/[projectId]` | ❌ MISSING | ✅ PASS | `apps/web/app/(saas)/backbox/project/[projectId]/page.tsx` |

---

## Files Summary

**Total Files Created:** 12  
**Total Files Modified:** 3  
**Total Lines Added:** ~550

### New Files
1. `packages/shared/package.json`
2. `packages/shared/tsconfig.json`
3. `packages/shared/biome.json`
4. `packages/shared/src/contracts/backbox.contract.ts`
5. `packages/shared/index.ts`
6. `packages/api/modules/me/procedures/get-entitlements.ts`
7. `packages/api/modules/me/router.ts`
8. `apps/web/modules/shared/lib/entitlements-client.ts`
9. `apps/web/app/(saas)/access/page.tsx`
10. `apps/web/app/(saas)/backbox/page.tsx`
11. `apps/web/app/(saas)/backbox/start/page.tsx`
12. `apps/web/app/(saas)/backbox/project/[projectId]/page.tsx`

### Modified Files
1. `packages/api/orpc/router.ts` - Added `me` module
2. `packages/api/package.json` - Added `@repo/shared` dependency
3. `apps/web/package.json` - Added `@repo/shared` dependency

---

## Next Steps (Slice 1)

With Slice 0.75 complete, Slice 1 can now proceed with:

1. **Dashboard State Machine Implementation**
   - Use `getEntitlements()` to fetch user state
   - Render UI based on `accessState`:
     - `TRIAL_AVAILABLE` → Show "Start Free Trial" CTA
     - `TRIAL_ACTIVE` → Show trial project with quota indicators
     - `PAID` → Show all projects with full features
     - `NONE` → Redirect to login

2. **Start Project Flow**
   - Form with `sourceText` input (max 30,000 chars)
   - Optional `title` input (max 120 chars)
   - Call `backbox.startTrialProject` or `backbox.createPaidProject`
   - Redirect to `/backbox/project/[projectId]/p1` on success

3. **Project List View**
   - Fetch projects via `backbox.listProjects`
   - Display project cards with mode badge (trial/paid)
   - Show current step progress
   - Navigate to project detail on click

4. **Wizard Navigation**
   - Implement P1-P4 pillar routes
   - Track current step in project state
   - Show progress indicator
   - Enable step navigation based on completion

---

## Architectural Decisions

### ADR-SLICE075-01: Dev Mock Strategy
**Decision:** Use `NODE_ENV` guard in procedure handler for dev mocks  
**Rationale:** Keeps mock logic colocated with procedure, no separate mock infrastructure needed  
**Trade-off:** Mock code ships to production (inert), but keeps implementation simple for MVP  

### ADR-SLICE075-02: Route Stub Approach
**Decision:** Create minimal route stubs with TODO comments  
**Rationale:** Provides compilable routes that follow existing patterns, allows incremental implementation  
**Trade-off:** Non-functional UX until Slice 1, but enables parallel development

### ADR-SLICE075-03: Contract Package Location
**Decision:** Place contract types in `packages/shared` instead of `packages/api`  
**Rationale:** Contract types are shared between API and client, not API-specific  
**Trade-off:** Additional package to manage, but cleaner separation of concerns

---

## Verification Commands

```bash
# Install dependencies
pnpm install

# Lint all new files
pnpm biome check packages/shared packages/api/modules/me \
  "apps/web/app/(saas)/backbox" "apps/web/app/(saas)/access" \
  "apps/web/modules/shared/lib/entitlements-client.ts"

# Type-check
pnpm --filter @repo/shared type-check
pnpm --filter @repo/api type-check

# Run dev server (smoke test)
pnpm dev

# Access routes (requires auth):
# - http://localhost:3000/access
# - http://localhost:3000/backbox
# - http://localhost:3000/backbox/start
# - http://localhost:3000/backbox/project/test-id
```

---

## References

- [Slice 1 Readiness Review](c:\Users\thepl\.cursor\plans\slice_1_readiness_review_72d2a02d.plan.md)
- [Contract Spec v0.4](IMPORTANT%20SOURCE%20OF%20TRUTH%20+%20DOCS/3.%20BackBox%20MVP%20—%20Contract%20Spec%20(Artifact%203)%20(1).md)
- [State & Flow Map](IMPORTANT%20SOURCE%20OF%20TRUTH%20+%20DOCS/2.%20BackBox%20MVP%20—%20State%20&%20Flow%20Map%20(1%20page).md)
- [Supastarter Coding Guidelines](agents.md)
