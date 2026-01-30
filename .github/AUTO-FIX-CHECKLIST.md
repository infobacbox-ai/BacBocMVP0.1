# Auto-Fix CI Setup Checklist

Quick setup checklist for enabling the Auto-Fix CI workflow.

## Prerequisites

- [ ] Cursor account with API access
- [ ] GitHub repository admin access
- [ ] Cursor Pro or Team plan (for API access)

## Setup Steps

### 1. Get Cursor API Key

- [ ] Go to [cursor.com/dashboard](https://cursor.com/dashboard)
- [ ] Navigate to Settings → API Keys
- [ ] Generate new API key
- [ ] Copy the key (save it securely - you won't see it again)

### 2. Add GitHub Secret

- [ ] Go to GitHub repository Settings
- [ ] Navigate to Secrets and variables → Actions
- [ ] Click "New repository secret"
- [ ] Name: `CURSOR_API_KEY`
- [ ] Paste your Cursor API key
- [ ] Click "Add secret"

### 3. Create GitHub Label

- [ ] Go to GitHub repository Issues/PRs
- [ ] Click "Labels"
- [ ] Click "New label"
- [ ] Name: `cursor-autofix`
- [ ] Description: `Enable automated CI failure fixes using Cursor AI`
- [ ] Color: `#0e8a16` (green) or your preference
- [ ] Click "Create label"

### 4. Merge the Workflow

- [ ] Ensure `.github/workflows/auto-fix-ci.yml` is in your main branch
- [ ] The workflow activates automatically once merged

## Testing

### Test the Workflow

1. - [ ] Create a test branch
2. - [ ] Intentionally break something (e.g., add a type error)
3. - [ ] Create a PR
4. - [ ] Wait for CI to fail
5. - [ ] Add `cursor-autofix` label
6. - [ ] Watch the workflow run in Actions tab
7. - [ ] Review the fix branch and PR comment

### Example Type Error for Testing

Add this to any `.ts` file in `apps/web`:

```typescript
// Temporary test - will cause type error
const testAutoFix: string = 123;
```

Expected behavior:
1. CI fails on type-check
2. Auto-fix workflow triggers
3. Creates `ci-fix/your-branch`
4. Posts PR comment with fix
5. You review and merge

## Verification

- [ ] Workflow appears in Actions tab
- [ ] `CURSOR_API_KEY` secret exists
- [ ] `cursor-autofix` label exists
- [ ] Test PR triggers workflow successfully
- [ ] Fix branch created with changes
- [ ] PR comment posted with summary

## Optional: Budget Controls

### Set Usage Alerts

- [ ] Go to [cursor.com/dashboard](https://cursor.com/dashboard)
- [ ] Set up usage alerts/limits
- [ ] Monitor costs after first few uses

### Team Guidelines

- [ ] Document when to use auto-fix (in team wiki/docs)
- [ ] Share cost estimates with team
- [ ] Establish who can add `cursor-autofix` label
- [ ] Set review requirements for auto-fixes

## Troubleshooting

If workflow doesn't run:

1. Check Actions tab for errors
2. Verify secret name is exactly `CURSOR_API_KEY`
3. Ensure PR has the label
4. Confirm CI workflow failed first
5. Check [workflow logs](../../.github/workflows/auto-fix-ci.yml) for conditions

If fixes are wrong:

1. Don't merge the fix branch
2. Delete it: `git push origin --delete ci-fix/branch-name`
3. Add more context to PR description
4. Try again or fix manually

## Next Steps

- [ ] Read full documentation: [`docs/AUTO-FIX-CI-SETUP.md`](../../docs/AUTO-FIX-CI-SETUP.md)
- [ ] Review workflow configuration: [`.github/workflows/auto-fix-ci.yml`](../../.github/workflows/auto-fix-ci.yml)
- [ ] Customize attempt limit if needed (default: 3)
- [ ] Set up cost monitoring
- [ ] Train team on usage

## Quick Reference

**Enable for a PR:**
```bash
gh pr edit <number> --add-label cursor-autofix
```

**Check workflow status:**
```bash
gh run list --workflow=auto-fix-ci.yml
```

**View latest run:**
```bash
gh run view --workflow=auto-fix-ci.yml
```

**Fetch fix branch:**
```bash
git fetch origin ci-fix/your-branch
git checkout ci-fix/your-branch
```

**Merge fix:**
```bash
git checkout your-branch
git merge ci-fix/your-branch
git push
```

## Support

- 📖 Documentation: [`docs/AUTO-FIX-CI-SETUP.md`](../../docs/AUTO-FIX-CI-SETUP.md)
- 💬 Cursor Forum: [forum.cursor.com](https://forum.cursor.com)
- 📧 Cursor Support: [hi@cursor.com](mailto:hi@cursor.com)

---

**Setup Date**: ___________  
**Setup By**: ___________  
**API Key Added**: ☐ Yes ☐ No  
**Label Created**: ☐ Yes ☐ No  
**Tested**: ☐ Yes ☐ No
