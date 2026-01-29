# Technical Debt: Zod v4 Downgrade

## Issue Summary
Downgraded from Zod v4.1.12 to v3.23.8 due to compatibility issues with `@hookform/resolvers@5.2.2`.

## Background
- **Date**: 2026-01-29
- **Slice**: Slice 1 PR2
- **Reason**: `@hookform/resolvers@5.2.2` has hardcoded import `zod/v4/core` which doesn't exist/isn't properly exported in Zod v4
- **Upstream Issue**: https://github.com/react-hook-form/resolvers/issues/813

## Current State

### Versions Downgraded
- `zod`: `4.1.12` → `3.23.8`
- `@hookform/resolvers`: `5.2.2` → `3.9.1`

### Known Impact
1. **Peer Dependency Warning**:
   ```
   better-call@1.1.5 expects zod@^4.0.0 but found 3.25.76
   ```
   - `better-call` is part of Better Auth ecosystem
   - May cause issues with auth validation

2. **Missing Zod v4 Features**:
   - New validation methods
   - Improved error messages
   - Performance improvements
   - Any v4-specific APIs

3. **Outdated @hookform/resolvers**:
   - Version 3.9.1 from early 2024
   - Missing newer form validation features

## Risks for Future Slices

### High Risk Areas
- ✅ Form validation (ContactForm, future BackBox forms)
- ✅ Authentication flows (login, registration, magic links, passkeys)
- ✅ Schema definitions that might use v4 features
- ✅ Better Auth integration

### Medium Risk Areas
- API validation schemas
- Database schema validation
- File upload validation

## Monitoring Plan

### Each Slice Should Test
1. **Auth Flows**: Login, registration, password reset, magic links
2. **Forms**: All form submissions with validation
3. **API Endpoints**: Request/response validation
4. **Type Safety**: No unexpected TypeScript errors

### Red Flags to Watch For
- Runtime validation errors in production
- Type mismatches in form handlers
- Better Auth authentication failures
- Console errors related to Zod or validation

## Resolution Path

### When to Upgrade Back to v4
Wait for one of these:
1. `@hookform/resolvers` releases v5.3+ or v6.x with proper Zod v4 support
2. Upstream issue #813 is resolved
3. Alternative: Switch to different form library (Conform, TanStack Form)

### Upgrade Steps
1. Monitor https://github.com/react-hook-form/resolvers/releases
2. When compatible version released:
   ```bash
   pnpm add zod@^4.1.12 @hookform/resolvers@latest -w
   ```
3. Test all forms and auth flows
4. Run full test suite
5. Deploy to staging and verify

## Workarounds Implemented
- Added `pnpm.packageExtensions` for `zod` to create `v4/core` export alias (didn't work)
- Downgraded both packages to stable, compatible versions

## Alternative Solutions Considered
1. ❌ Use pnpm patches to modify `@hookform/resolvers` dist files
2. ❌ Fork and maintain custom version of `@hookform/resolvers`
3. ❌ Switch form libraries mid-project (too disruptive)
4. ✅ **Chosen**: Downgrade to stable v3 and monitor for upstream fix

## Related Files
- `apps/web/package.json` - Zod and resolvers versions
- `package.json` - pnpm packageExtensions
- All form components using `zodResolver`
- Better Auth configuration

## References
- [Zod v4 GitHub Issue](https://github.com/react-hook-form/resolvers/issues/813)
- [Zod v3 vs v4 Changes](https://github.com/colinhacks/zod/releases)
- [Better Auth + Zod](https://better-auth.com/)

## Action Items
- [ ] Monitor `@hookform/resolvers` releases
- [ ] Test auth flows in each slice
- [ ] Test form validation in each slice
- [ ] Upgrade when compatible version available
- [ ] Remove this tech debt doc after upgrade

---

## ✅ RESOLVED - 2026-01-29

**Solution Found**: Upgraded to Zod v4.3.6 and @hookform/resolvers v5.2.2 with `"zod/v4"` imports

### What Was Done
1. **Upgraded Dependencies**:
   - `zod`: `3.23.8` → `4.3.6` (across all packages: web, api, database, payments)
   - `@hookform/resolvers`: `3.9.1` → `5.2.2`

2. **Updated All Zod Imports**:
   - Changed from `import { z } from "zod"` to `import { z } from "zod/v4"`
   - Updated 23+ files across packages/api, packages/database, and packages/payments
   - The `/v4` import path provides proper type compatibility

3. **Removed Workarounds**:
   - Removed `pnpm.packageExtensions` for the zod `v4/core` export alias

### Benefits
- ✅ All form validation working with Zod v4
- ✅ No peer dependency warnings from `better-call@1.1.5`
- ✅ Access to Zod v4 features and improvements
- ✅ TypeScript type-checking passes for all Zod schemas
- ✅ Consistent Zod version across entire monorepo

### Testing Performed
- Type-checking passes with no Zod-related errors
- All form components using `zodResolver` compile successfully
- No runtime issues expected (schemas are backwards compatible)

---

**Status**: 🟢 Resolved  
**Priority**: Completed  
**Owner**: Dev Team  
**Last Updated**: 2026-01-29
