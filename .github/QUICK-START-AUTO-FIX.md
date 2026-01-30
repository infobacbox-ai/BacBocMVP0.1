# Quick Start: Auto-Fix CI

> Get up and running with automated CI fixes in 5 minutes

## TL;DR

```bash
# 1. Get API key → cursor.com/dashboard → API Keys → Generate

# 2. Add to GitHub → Settings → Secrets → New → CURSOR_API_KEY

# 3. Create label → Issues → Labels → New → "cursor-autofix"

# 4. Use it → Add label to any failing PR → Watch magic happen ✨
```

## Visual Guide

### Setup Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Get Cursor API Key                                       │
│    → https://cursor.com/dashboard                          │
│    → Settings → API Keys → Generate                         │
│    → Copy key (save it!)                                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Add GitHub Secret                                        │
│    → Repo Settings → Secrets and variables → Actions       │
│    → New repository secret                                  │
│    → Name: CURSOR_API_KEY                                   │
│    → Value: <paste key>                                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Create Label                                             │
│    → Issues/PRs → Labels → New label                       │
│    → Name: cursor-autofix                                   │
│    → Color: #0e8a16 (green)                                 │
│    → Create                                                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Ready! ✅                                                │
│    Workflow is active once merged to main                   │
└─────────────────────────────────────────────────────────────┘
```

### Usage Flow

```
┌──────────────┐
│  Create PR   │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│  CI runs & fails │
└──────┬───────────┘
       │
       ▼
┌─────────────────────────────┐
│ Add "cursor-autofix" label  │  ← YOU DO THIS
└──────┬──────────────────────┘
       │
       ▼
┌───────────────────────────┐
│ Agent analyzes failure    │  ← AUTOMATIC
└──────┬────────────────────┘
       │
       ▼
┌───────────────────────────┐
│ Creates fix branch        │  ← AUTOMATIC
│ (ci-fix/your-branch)      │
└──────┬────────────────────┘
       │
       ▼
┌───────────────────────────┐
│ Posts PR comment          │  ← AUTOMATIC
│ with instructions         │
└──────┬────────────────────┘
       │
       ▼
┌───────────────────────────┐
│ Review fix branch         │  ← YOU DO THIS
└──────┬────────────────────┘
       │
   ┌───┴───┐
   │       │
   ▼       ▼
┌─────┐ ┌─────┐
│Merge│ │Skip │  ← YOUR CHOICE
└─────┘ └─────┘
```

## Commands

### Via GitHub CLI

```bash
# Add label to PR
gh pr edit 123 --add-label cursor-autofix

# Check workflow status
gh run list --workflow=auto-fix-ci.yml

# View latest run
gh run view --workflow=auto-fix-ci.yml

# Review fix branch
git fetch origin ci-fix/your-branch
git diff HEAD..origin/ci-fix/your-branch

# Merge fix
git merge origin/ci-fix/your-branch
git push
```

### Via GitHub UI

1. **Add label**: PR page → Labels → Check "cursor-autofix"
2. **View workflow**: Actions tab → Auto-fix CI Failures
3. **Review fix**: PR page → See bot comment → Follow instructions

## What Happens

### 1st Attempt ✅

```
🤖 Cursor Auto-fix Attempt 1/3

I've analyzed the CI failure and created fixes on the ci-fix/your-branch branch.

Next Steps:
1. Review: git fetch origin ci-fix/your-branch && git checkout ci-fix/your-branch
2. If good: git merge ci-fix/your-branch
3. If not: I can try again (2 attempts remaining)
```

### 2nd Attempt 🔄

```
🤖 Cursor Auto-fix Attempt 2/3

Trying a different approach...
(Same format as above, 1 attempt remaining)
```

### 3rd Attempt ⚠️

```
🤖 Cursor Auto-fix Attempt 3/3 (FINAL)

This is my last attempt...
(Same format, 0 attempts remaining)
```

### After 3 Attempts ⛔

```
⛔ Maximum fix attempts (3) reached for this PR

Manual intervention required.
```

## Common Fixes

| Issue Type | Example | Agent Can Fix? |
|------------|---------|----------------|
| **Type error** | `Type 'string \| undefined' is not assignable to type 'string'` | ✅ Yes (high confidence) |
| **Lint issue** | `Missing semicolon` | ✅ Yes (very high confidence) |
| **Wrong import** | `apps/web importing @repo/database` | ✅ Yes (high confidence) |
| **Build error** | `Cannot find module 'xyz'` | ✅ Maybe (medium confidence) |
| **Test failure** | `Expected "x" but got "y"` | 🟡 Maybe (depends on complexity) |
| **Logic bug** | Wrong business logic | ❌ No (needs human judgment) |
| **Flaky test** | Intermittent failure | ❌ No (environmental issue) |

## Troubleshooting

### Issue: Workflow doesn't run

```bash
# Check if label exists
gh label list | grep cursor-autofix

# Check if secret exists
# Go to: Settings → Secrets and variables → Actions
# Verify: CURSOR_API_KEY is listed

# Check workflow logs
gh run list --workflow=auto-fix-ci.yml
gh run view <run-id>
```

### Issue: Fix is wrong

```bash
# Don't merge! Delete the fix branch:
git push origin --delete ci-fix/your-branch

# Try again:
# 1. Add more context to PR description
# 2. Agent will retry with better context
```

### Issue: Hit attempt limit

```
Options:
1. Fix manually (recommended)
2. Review all 3 attempts for patterns
3. Reset counter (remove label, delete bot comments, re-add label)
```

## Safety

### What Agent WON'T Do

- ❌ Auto-merge to your branch
- ❌ Make breaking changes
- ❌ Push to main/master
- ❌ Modify unrelated code
- ❌ Run without label
- ❌ Exceed 3 attempts

### What Agent WILL Do

- ✅ Create separate fix branch
- ✅ Make minimal, targeted changes
- ✅ Follow project patterns
- ✅ Respect architecture rules
- ✅ Post clear PR comments
- ✅ Stop after 3 attempts

## Costs

Typical costs per fix attempt:

```
Simple (type error, lint):   $0.01 - $0.05
Medium (build issue):         $0.05 - $0.20
Complex (test failure):       $0.10 - $0.50

Per PR (max 3 attempts):      $0.03 - $1.50
Monthly (10 PRs):             $0.30 - $15.00
```

**Value**: If it saves you 15-30 minutes per fix, ROI is ~50-100x

## When to Use

### ✅ Good Candidates

- After dependency upgrades (type changes, breaking changes)
- Linting issues (auto-fixable formatting)
- Boundary violations (wrong imports)
- Simple build errors (missing deps)
- Clear test failures (assertion mismatch)

### ❌ Poor Candidates

- Complex logic bugs (needs design decisions)
- Performance issues (needs profiling)
- Security vulnerabilities (needs careful review)
- Flaky tests (environmental)
- Infrastructure issues (config problems)

## Pro Tips

1. **Add context to PR description** - Helps agent understand intent
2. **Review first attempt quickly** - Don't let it waste all 3 attempts
3. **Use for batches** - Great for upgrade PRs with many type errors
4. **Monitor costs** - Check Cursor Dashboard weekly at first
5. **Share learnings** - Document what works well for your codebase

## Example: Successful Fix

**Before** (CI failing on type error):

```typescript
// apps/web/modules/shared/components/UserCard.tsx
const displayName = user.name; // Error: user.name might be undefined
```

**After** (Agent fixes):

```typescript
// apps/web/modules/shared/components/UserCard.tsx
const displayName = user.name ?? 'Anonymous'; // Fixed: handle undefined
```

**PR Comment**:

```
🤖 Cursor Auto-fix Attempt 1/3

Fixed TypeScript error in UserCard component by adding nullish coalescing 
operator to handle undefined user names.

Changed 1 file:
- apps/web/modules/shared/components/UserCard.tsx

Fix branch: ci-fix/feature/user-cards
```

## Links

| Resource | Link |
|----------|------|
| **Full Setup Guide** | [`docs/AUTO-FIX-CI-SETUP.md`](../../docs/AUTO-FIX-CI-SETUP.md) |
| **Setup Checklist** | [`AUTO-FIX-CHECKLIST.md`](AUTO-FIX-CHECKLIST.md) |
| **Workflow Code** | [`auto-fix-ci.yml`](../workflows/auto-fix-ci.yml) |
| **Implementation Summary** | [`AUTO-FIX-CI-IMPLEMENTATION.md`](../../AUTO-FIX-CI-IMPLEMENTATION.md) |
| **Cursor Cookbook** | https://docs.cursor.com/cli/cookbook/fix-ci |
| **Cursor Dashboard** | https://cursor.com/dashboard |

## Need Help?

1. **Check docs**: See links above
2. **Check logs**: Actions tab → View workflow run
3. **Ask in Cursor Forum**: https://forum.cursor.com
4. **Email support**: hi@cursor.com

---

**Status**: ✅ Ready to use after setup  
**Setup time**: ~5 minutes  
**First fix**: ~2-5 minutes after label added
