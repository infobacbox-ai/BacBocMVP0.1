# Validate Local

**Goal**: Run CI checks locally before pushing.

## Checks

Run in order, stop on first failure:

1. `pnpm -w lint`
2. `pnpm -w type-check`
3. `pnpm -w build` (with NODE_ENV=production)
4. `pnpm check:prod-mocks`

## Output

| Check | Status | Duration | Notes |
|-------|--------|----------|-------|
| Lint | ✅/❌ | Xs | file count or error summary |
| Type-check | ✅/❌ | Xs | package count or error location |
| Build | ✅/❌ | Xs | success or failure reason |
| Prod mock ban | ✅/❌ | Xs | pass or violations found |

## On Failure

- Show the specific error with file:line
- Provide a one-sentence fix suggestion
- Do NOT continue to next check

## On Success

```
✅ All checks passed. Safe to push.

Next steps:
- `git push` to trigger CI
- Or run `create-pr` command
```
