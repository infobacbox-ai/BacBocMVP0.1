# Next Steps for PR2a

## Immediate Actions

### 1. Review the Clean PR2a

```bash
# You're currently on the clean branch
git log --oneline -n 3
# Should show: e12a080 feat(slice-1-pr2): wire dashboard page and access gate redirect

# Review the changes
git show --stat

# View the actual diff
git diff be54d25..HEAD
```

### 2. Create GitHub Pull Request

**URL**: https://github.com/infobacbox-ai/BacBocMVP0.1/pull/new/slice-1-pr2a-dashboard-wiring-clean

**PR Title**:
```
feat(slice-1-pr2): Wire dashboard page and access gate redirect
```

**PR Description Template**:
```markdown
## PR 2a: Dashboard Wiring (Clean Scope)

Part of Slice 1 implementation - Dashboard State Machine

### Changes

- Wire `/backbox` page to `DashboardStateMachine` component
- Implement NONE state redirect logic to `/access`
- Add `/access` page with minimal UI and reverse redirect
- Add access page translations (EN + FR)

### Implementation Details

**backbox/page.tsx**:
- Fetches user entitlements via `getEntitlements()`
- Redirects `NONE` state to `/access`
- Renders `DashboardStateMachine` with entitlements

**access/page.tsx**:
- Shows minimal access gate UI (trial CTA + premium CTA)
- Implements reverse redirect (non-NONE → `/backbox`)
- Uses translations for all user-facing text

**Translations**:
- Added `access.title`, `access.description`, `access.cta.*` keys
- French and English translations included

### Scope

This PR contains **ONLY** the dashboard wiring per Slice 1 Plan PR2.

Build/dependency fixes and React 19 compatibility are handled separately.

### Files Changed (4)

- `apps/web/app/(saas)/backbox/page.tsx`
- `apps/web/app/(saas)/access/page.tsx`
- `packages/i18n/translations/fr.json`
- `packages/i18n/translations/en.json`

### Known Issues

⚠️ **Type-check fails due to pre-existing errors** in the PR1 base branch.

These errors are **NOT introduced by this PR**:
- React 19 compatibility issues in analytics providers
- Third-party library type incompatibilities (QRCode, Recharts, Dropzone)
- Script component props in docs page

See `SLICE-1-PR2-CLEANUP-SUMMARY.md` for full analysis.

### Testing

✅ Linting passes
✅ Logic verified against Slice 1 Plan
❌ Type-check fails (pre-existing issues, not regressions)

### Related

- Base: `slice-1-pr1-state-machine-core` (commit be54d25)
- Closes: Slice 1 PR2 from plan
- Supersedes: Old `slice-1-pr2-wire-dashboard` branch (DO NOT MERGE)
```

### 3. Decide on Build Fixes Strategy

Choose one of:

**Option A (RECOMMENDED)**: Merge PR2a, fix build separately
- Create issue: "Fix React 19 compatibility and build errors"
- Assign to infrastructure/build fixes workstream
- Allows feature development to proceed

**Option B**: Fix build first, then merge PR2a
- Create `slice-1-build-fixes` branch from PR1 base
- Cherry-pick only build fix commits from old PR2
- Merge build fixes, then merge PR2a

**Option C**: Include build fixes in PR2a
- Cherry-pick build fix commits into PR2a branch
- Increases PR size but makes it immediately mergeable

## Commands Reference

### Switch between branches

```bash
# To PR2a (clean)
git checkout slice-1-pr2a-dashboard-wiring-clean

# To old PR2 (messy, for reference only)
git checkout slice-1-pr2-wire-dashboard

# To PR1 base
git checkout slice-1-pr1-state-machine-core
```

### Compare branches

```bash
# See what PR2a changed vs PR1
git diff be54d25..slice-1-pr2a-dashboard-wiring-clean

# See what old PR2 had vs PR2a
git diff slice-1-pr2a-dashboard-wiring-clean..slice-1-pr2-wire-dashboard
```

### Run checks on PR2a

```bash
# Lint (should pass)
pnpm -w lint

# Type-check (will fail due to pre-existing issues)
pnpm -w type-check

# Build (may fail due to tslib/AWS SDK issue)
NODE_ENV=production pnpm -w build
```

## Decision Needed

**Question for team**: Which build fix strategy (A, B, or C)?

**Recommendation**: **Option A** - merge clean scope, fix build in parallel

---

**Current branch**: `slice-1-pr2a-dashboard-wiring-clean`
**Status**: Ready for GitHub PR creation
**Pushed**: Yes, remote tracking set up
