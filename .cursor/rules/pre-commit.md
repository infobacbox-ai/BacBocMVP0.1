---
description: Pre-commit validation rules and workflow
globs: ["**/*.ts", "**/*.tsx", "**/*.json", "**/*.md"]
alwaysApply: true
---

# Pre-Commit Validation

> Automated checks that run before every commit to prevent broken code from entering the repository.

## What Runs Automatically

When you commit, these checks run via `husky` pre-commit hook:

### 1. Lint-Staged (Fast)
Runs on **staged files only**:
- **TypeScript files** (`*.ts`, `*.tsx`): `biome check --write`
- **JSON/Markdown files** (`*.json`, `*.md`): `biome format --write`

### 2. Type-Check (Full Workspace)
Runs `pnpm -w type-check` across all packages to catch:
- Type errors
- Missing imports
- Invalid type assertions

## If the Hook Fails

**DO NOT** use `--no-verify` to bypass checks unless absolutely necessary.

Instead:
1. **Fix the issue** shown in the error output
2. **Stage the fixes**: `git add .`
3. **Retry the commit**: `git commit -m "..."`

## Manual Validation Commands

If you need to run checks manually (without committing):

```bash
# Run lint-staged manually
pnpm lint-staged

# Run full type-check
pnpm -w type-check

# Run full lint
pnpm -w lint

# Run production build
NODE_ENV=production pnpm -w build

# Check for mock leakage
pnpm check:prod-mocks
```

## Bypassing the Hook (Emergency Only)

If you absolutely must commit without validation (e.g., WIP commit):

```bash
git commit --no-verify -m "WIP: save work in progress"
```

**WARNING**: Never push commits that bypass validation to shared branches. Fix them before pushing.

## Common Scenarios

### Scenario 1: Biome Formatting Fails
```
✖ lint-staged: biome check --write failed
```

**Fix**: Run `pnpm format` to auto-fix formatting, then stage and retry.

### Scenario 2: Type-Check Fails
```
✖ pnpm -w type-check failed
apps/web/modules/foo.tsx:10:5 - error TS2322: Type 'string' is not assignable to type 'number'
```

**Fix**: Fix the type error in the indicated file, stage, and retry.

### Scenario 3: Hook Takes Too Long
If type-check is slow:
- Consider using `--no-verify` for WIP commits
- Run full validation before creating a PR

## Integration with CI

These pre-commit checks mirror the CI pipeline:
- `lint` job → `biome check`
- `type-check` job → `pnpm -w type-check`
- `build` job → `pnpm -w build`
- `boundary-checks` job → architecture validation
- `prod-mock-ban` job → `pnpm check:prod-mocks`

Passing pre-commit checks **does not guarantee** CI will pass (CI runs additional checks), but it catches most issues early.

## Troubleshooting

### Hook doesn't run
- Verify `.husky/pre-commit` exists
- Check file permissions (should be executable)
- Run `pnpm exec husky install` to reinstall hooks

### Hook runs but fails immediately
- Check `.husky/pre-commit` content matches expected commands
- Verify `lint-staged` config exists in `package.json`

### Type-check passes locally but fails in CI
- Ensure you have the latest dependencies: `pnpm install`
- Regenerate Prisma client: `pnpm --filter database generate`
- Build content-collections: `pnpm --filter web build`
