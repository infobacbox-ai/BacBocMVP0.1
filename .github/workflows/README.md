# GitHub Actions Workflows

## Overview

This directory contains automated workflows for the BackBox project.

## Workflows

### Validate PRs (`validate-prs.yml`)

Runs on every pull request to ensure code quality and prevent regressions.

**Jobs:**
- **lint**: Biome code quality checks
- **type-check**: TypeScript compilation
- **boundary-checks**: Enforces architectural rules (UI/DB separation, no test mocks in source)
- **build**: Production build verification
- **prod-mock-ban**: Scans build output for test/mock code
- **e2e**: Playwright end-to-end tests

**When it runs:** On PR to `main` or `master` branches

### Auto-Fix CI Failures (`auto-fix-ci.yml`)

Automatically analyzes and fixes CI failures using Cursor AI Agent.

**Guardrails:**
- ✅ Only runs with `cursor-autofix` label
- ✅ Maximum 3 attempts per PR
- ✅ Creates safe review branches (`ci-fix/*`)

**Setup Required:**
1. Add `CURSOR_API_KEY` secret (see [AUTO-FIX-CI-SETUP.md](../../docs/AUTO-FIX-CI-SETUP.md))
2. Add `cursor-autofix` label to PR when needed

**When it runs:** When "Validate PRs" workflow fails on a labeled PR

**Documentation:** [📖 Full Setup Guide](../../docs/AUTO-FIX-CI-SETUP.md)

## Quick Start

### Running CI Checks Locally

```bash
# Lint
pnpm lint

# Type check
pnpm type-check

# Build
pnpm build

# E2E tests
pnpm --filter web e2e

# All checks
pnpm lint && pnpm type-check && pnpm build
```

### Using Auto-Fix

1. Create a PR
2. Wait for CI to fail
3. Add `cursor-autofix` label
4. Review fix branch when agent posts comment
5. Merge if good: `git merge ci-fix/your-branch`

## Environment Variables

### Required Secrets

- `CURSOR_API_KEY`: For auto-fix workflow (see setup guide)
- `DATABASE_URL`: Database connection (or uses dummy value)
- `RESEND_API_KEY`: Email service (or uses dummy value for CI)
- `BETTER_AUTH_SECRET`: Auth secret (or uses dummy value for CI)

### Note on Dummy Values

The CI workflows use dummy values for secrets when not available. This allows:
- ✅ Type checking without live services
- ✅ Build verification
- ❌ Won't work for E2E tests that need real services

## Troubleshooting

### Common Issues

**"Type check failed"**
- Run `pnpm --filter database generate` locally
- Ensure all dependencies are installed: `pnpm install`

**"Boundary check failed"**
- Don't import `@repo/database` in `apps/web`
- Use `@repo/api` procedures instead

**"MSW/mock imports found"**
- Mocks should only be in test files
- Check imports in source code

**"Auto-fix not running"**
- Verify `CURSOR_API_KEY` secret exists
- Check PR has `cursor-autofix` label
- Ensure "Validate PRs" workflow failed first

### Getting Help

1. Check workflow logs in Actions tab
2. See [AUTO-FIX-CI-SETUP.md](../../docs/AUTO-FIX-CI-SETUP.md)
3. Review `.cursor/rules/ci-guardrails.md`

## Maintenance

### Adding New CI Checks

1. Add job to `validate-prs.yml`
2. Update this README
3. Consider if auto-fix should monitor it

### Modifying Auto-Fix

See [Advanced Configuration](../../docs/AUTO-FIX-CI-SETUP.md#advanced-configuration) in the setup guide.

## Best Practices

### For Contributors

- ✅ Run checks locally before pushing
- ✅ Fix linting issues immediately (fast & easy)
- ✅ Use auto-fix for type errors after upgrades
- ❌ Don't rely on auto-fix for logic bugs

### For Maintainers

- ✅ Monitor auto-fix usage and costs
- ✅ Review fix patterns for common issues
- ✅ Update agent instructions if seeing bad fixes
- ✅ Keep attempt limit reasonable (currently 3)

## Costs

**CI Workflow (validate-prs.yml)**
- Free on GitHub Actions (included in plan)

**Auto-Fix Workflow (auto-fix-ci.yml)**
- Uses Cursor API credits
- Cost depends on complexity and frequency
- Capped at 3 attempts per PR
- Only runs when labeled (opt-in)

## Contributing

When adding new workflows:

1. Document them in this README
2. Add usage examples
3. Include troubleshooting tips
4. Test on a branch first
5. Update relevant docs in `/docs`
