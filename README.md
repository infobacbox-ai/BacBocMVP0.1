# supastarter for Next.js

supastarter is the ultimate starter kit for production-ready, scalable SaaS applications.

## Helpful links

- [📘 Documentation](https://supastarter.dev/docs/nextjs)
- [🚀 Demo](https://demo.supastarter.dev)

## Development

### Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Lint and type check
pnpm lint && pnpm type-check
```

### CI/CD

This project uses GitHub Actions for continuous integration. All PRs are automatically validated with:

- **Linting** (Biome)
- **Type checking** (TypeScript)
- **Boundary checks** (Architecture rules)
- **Production build**
- **E2E tests** (Playwright)

See [`.github/workflows/README.md`](.github/workflows/README.md) for details.

### Auto-Fix CI Failures

We have an optional AI-powered auto-fix workflow that can automatically resolve common CI failures:

```
1. Create PR → 2. CI fails → 3. Add cursor-autofix label → 4. AI fixes → 5. Review & merge
```

**Setup:** See [`docs/AUTO-FIX-CI-SETUP.md`](docs/AUTO-FIX-CI-SETUP.md)

**Guardrails:**
- Requires `cursor-autofix` label (opt-in)
- Max 3 attempts per PR
- Creates review branches (`ci-fix/*`)
- Never auto-merges

**Best for:** Type errors, linting issues, simple build failures  
**Not for:** Complex bugs, performance issues, security vulnerabilities

### Architecture Rules

This project enforces architectural boundaries via CI:

- ❌ `apps/web` must NOT import `@repo/database` (use `@repo/api` instead)
- ❌ No MSW/mock code in production builds
- ✅ Use contract types from `@repo/shared`

See [`.cursor/rules/ci-guardrails.md`](.cursor/rules/ci-guardrails.md) for details.
