---
description: PR checklist for BackBox contributions
globs: ["**/*.ts", "**/*.tsx"]
alwaysApply: false
---

# PR Checklist

> Run through this before submitting any PR.

## Before Writing Code

- [ ] Read the relevant **Contract Spec** section
- [ ] Check **Decision Log** for related decisions
- [ ] Check **Acceptance Tests** for expected behavior
- [ ] Identify which **Slice** this belongs to

## Code Quality

- [ ] `pnpm -w lint` passes
- [ ] `pnpm -w type-check` passes
- [ ] No `any` types without justification
- [ ] No `console.log` in production code
- [ ] No hardcoded secrets or env values

## Supastarter Alignment

- [ ] Using oRPC procedures (not Next.js route handlers) for features
- [ ] Using `@repo/database` abstractions (not direct Prisma in apps/web)
- [ ] Using `@repo/auth` for auth (no custom session handling)
- [ ] Using existing UI components from `@ui/components`
- [ ] Following existing patterns in neighboring files

## BackBox Specific

- [ ] Error codes match **Contract Spec** `ApiError` model
- [ ] Server guards use shared helper (`packages/api/modules/backbox/lib/guards.ts`)
- [ ] No new UI states beyond Figma inventory
- [ ] No new error codes without Contract Spec update
- [ ] Dependency pointers included in comments where needed

## If Touching API

- [ ] Input validation with Zod
- [ ] Output types match contract
- [ ] Guards cover: auth, emailVerified, ownership, accessPolicy
- [ ] Errors return proper `errorCode` (not just HTTP status)
- [ ] Logging includes: requestId, procedureName, userId, outcome

## If Touching AI Procedures

- [ ] Quota check before AI call
- [ ] Rate-limit check before AI call
- [ ] Lock check (no concurrent calls)
- [ ] Quota incremented **only after** success persisted
- [ ] `AI_UNAVAILABLE` on provider failure (no fallback)

## If Touching Trial Logic

- [ ] One-run invariants respected (no reset)
- [ ] `consumedAt` set on submit (not access)
- [ ] Delete does not reset trial
- [ ] `trialProjectId` stable once set

## If Touching Database

- [ ] Migration included (`pnpm --filter database migrate`)
- [ ] Migration is reversible (or documented why not)
- [ ] No direct Prisma imports in `apps/web`

## If Touching UI

- [ ] Mobile-first responsive design
- [ ] Loading/empty/error/disabled states handled
- [ ] Error mapping uses `errorCode` (not HTTP status)
- [ ] Translations added for user-facing strings
- [ ] Accessibility: uses Radix primitives

## CI Checks Will Verify

- [ ] Biome lint
- [ ] TypeScript
- [ ] UI/DB boundary (no `packages/database|prisma` in apps/web)
- [ ] No MSW/mocks in source
- [ ] Production build succeeds
- [ ] No mocks in build output
- [ ] E2E tests pass

## PR Discipline

- [ ] **One PR = one subject** (no mixed changes)
- [ ] **Patch-size** (no broad refactors)
- [ ] **Reversible** (can be reverted cleanly)
- [ ] Commit message follows convention

## Commit Message Format

```
<type>: <description>

[optional body]

Ref: <truth-doc or slice reference>
Slice: <slice-number if applicable>
```

Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`

Example:
```
feat: implement startTrialProject procedure

- Add guards for auth, emailVerified, accessPolicy
- Enforce one-run invariants
- Return projectId on success

Ref: Contract Spec → backbox.startTrialProject
Slice: 3
```

## Definition of Done

- [ ] Code reviewed (or self-reviewed against this checklist)
- [ ] CI passes (all jobs green)
- [ ] No regressions in existing Acceptance Tests
- [ ] Manual smoke test in dev environment
- [ ] Ready to merge (no WIP, no TODO comments)
