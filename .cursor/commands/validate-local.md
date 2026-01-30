# Validate Local

Run the complete CI validation suite locally before pushing to catch issues early.

## Task

Execute all CI checks in sequence and report results in a clear table format.

## Checks to Run

Run these commands in order, capturing the exit status of each:

1. **Lint**: `pnpm -w lint`
2. **Type-check**: `pnpm -w type-check`
3. **Build**:
   - macOS/Linux: `NODE_ENV=production pnpm -w build`
   - Windows (PowerShell): `$env:NODE_ENV="production"; pnpm -w build`
   - Windows (cmd): `set NODE_ENV=production&& pnpm -w build`
4. **Prod mock ban**: `pnpm check:prod-mocks`

## Output Format

Present results in a table:

```
| Check          | Status | Duration | Notes |
|----------------|--------|----------|-------|
| Lint           | ✅ PASS | 2.3s     | 413 files checked |
| Type-check     | ✅ PASS | 15.2s    | 14 packages validated |
| Build          | ✅ PASS | 45.8s    | Production build successful |
| Prod mock ban  | ✅ PASS | 1.1s     | No mocks in production output |
```

## On Failure

If any check fails:
1. Show the **specific error** from the failed check
2. Provide **minimal fix guidance** based on the error type
3. Stop at the first failure (don't run remaining checks)

## Example Failure Output

```
| Check          | Status | Duration | Notes |
|----------------|--------|----------|-------|
| Lint           | ✅ PASS | 2.3s     | 413 files checked |
| Type-check     | ❌ FAIL | 8.1s     | 3 errors in apps/web |

### Errors Found

**apps/web/modules/foo.tsx:10:5**
```
error TS2322: Type 'string' is not assignable to type 'number'
```

**Minimal Fix**: Update the type of `value` prop to `string` or convert the value to `number`.
```

## Notes

- This mirrors the CI pipeline defined in `.github/workflows/validate-prs.yml`
- Run this before creating a PR to ensure CI will pass
- Expected total time: ~60-90 seconds on first run (includes full build)
- Subsequent runs are faster due to caching
