# Slice Completion Checklist

This checklist ensures that each Slice (development increment) is complete and ready for merge. Use this before creating a PR to avoid post-merge fixes.

## Pre-Commit Validation

### 1. Environment Variables Audit

- [ ] Identify all new environment variables required by your changes
- [ ] Add fallback values to `.github/workflows/validate-prs.yml` (all jobs that run builds)
- [ ] Document required env vars in `.cursor/rules/ci-guardrails.md`
- [ ] Verify that CI jobs pass with the fallback values
- [ ] Add to `.env.example` if it exists

**Common env vars that need CI fallbacks:**
- `DATABASE_URL`
- `RESEND_API_KEY`
- `BETTER_AUTH_SECRET`
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET`
- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`
- AI provider keys (OpenAI, Anthropic, etc.)

### 2. CI/CD Guardrails Check

- [ ] Run local linting: `pnpm lint` or `biome ci .`
- [ ] Run type-check: `pnpm type-check`
- [ ] Run production build: `NODE_ENV=production pnpm build`
- [ ] Verify no MSW/mock imports in production code
- [ ] Test boundary checks pass (no `@repo/database` in `apps/web`)

### 3. Translation Strings

- [ ] Identify all user-facing text changes
- [ ] Add translation keys to `packages/i18n/translations/*.json`
- [ ] Use `useTranslations()` hook, not hardcoded strings
- [ ] Verify translations exist for all supported locales

### 4. Code Quality

- [ ] No console.log statements in production code
- [ ] No temporary debugging code
- [ ] No commented-out code blocks (unless documented as intentional)
- [ ] Follow project conventions (see `agents.md`, `AGENTS.md`)

### 5. Documentation

- [ ] Update relevant MDX docs in `apps/web/content` if user-facing behavior changed
- [ ] Update `CHANGELOG.md` if consumer-impacting
- [ ] Update README if setup instructions changed

## Post-Development Verification

### 6. Dependency Management

- [ ] Verify new dependencies are added to correct package
- [ ] Check for duplicate dependencies across packages
- [ ] Ensure dependency versions are compatible with existing packages

### 7. API Boundary Compliance

- [ ] UI code (`apps/web`) only uses `@repo/api` procedures
- [ ] No direct database imports in UI code
- [ ] Contract types exported from `@repo/api` or appropriate package

### 8. Testing

- [ ] Manually test the feature locally
- [ ] Run E2E tests if they exist: `pnpm --filter web e2e:ci`
- [ ] Verify no new linter errors: `pnpm lint`

### 9. Git Hygiene

- [ ] Commit message follows conventional commit format
- [ ] No unrelated changes included
- [ ] No `.env` or secret files staged
- [ ] `.gitignore` updated if new artifacts introduced

## CI Success Criteria

Before marking the slice complete, ensure CI passes on **first commit**:

- [ ] ✅ Lint job passes
- [ ] ✅ Type-check job passes
- [ ] ✅ Boundary-checks job passes
- [ ] ✅ Build job passes (NODE_ENV=production)
- [ ] ✅ Prod-mock-ban job passes
- [ ] ✅ E2E tests pass (if applicable)

## Common Post-Slice Fix Patterns to Avoid

These are issues that have required post-merge fixes in the past:

1. **Missing CI env vars**: Always add fallbacks to ALL build jobs
2. **Translation keys**: Add to all locale files, not just English
3. **Boundary violations**: Never import `@repo/database` in `apps/web`
4. **Mock leaks**: Ensure mocks are behind `NODE_ENV=development` guards
5. **Type errors in CI**: Run full type-check locally before pushing

## Slice Completion Statement

When creating a PR, include in the description:

```
## Slice Completion Validation

- [x] All items in SLICE_CHECKLIST.md verified
- [x] CI passed on first commit (no post-slice fixes required)
- [x] No boundary violations introduced
- [x] All env vars have CI fallbacks
```

## Decision Log Integrity

If your slice introduces architectural decisions:

- [ ] Create or update ADR (Architecture Decision Record)
- [ ] Explain trade-offs and alternatives considered
- [ ] Document validation criteria (e.g., "Validation: CI passed on first commit")
- [ ] Ensure ADR is consistent with implementation

---

**Remember**: The goal is to have CI pass on the first commit after completing the slice. Use this checklist to catch issues before they reach the PR stage.
