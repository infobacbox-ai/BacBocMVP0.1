---
description: CI guardrails for the BackBox project (Slices Plan v4.3.3)
globs: ["apps/**/*.ts", "apps/**/*.tsx", "packages/**/*.ts"]
---

# CI Guardrails (Slices Plan v4.3.3)

This project has automated boundary checks in CI. These rules are **mandatory**.

## 1. UI/DB Boundary Rule

`apps/web` must **NOT** import:
- `packages/database` or `@repo/database`
- `@prisma/client` or any Prisma types directly

**Why:** UI should only use contract types (`packages/shared`) and call the API client.

**CI check:** `rg -n "packages/database|prisma" apps/web`

**Correct pattern:**
```typescript
// ❌ WRONG - direct DB import in apps/web
import { db } from "@repo/database";

// ✅ CORRECT - use API procedures
import { orpc } from "@shared/lib/orpc-client";
const data = await orpc.backbox.getProject({ projectId });
```

## 2. Prod Mock Ban

No mock code in production builds. The following patterns are forbidden in `.next/` output:
- `msw`
- `mockServiceWorker`
- `apps/web/src/mocks`
- `__mocks__`

**CI check:** `pnpm check:prod-mocks`

**Correct pattern:**
```typescript
// ❌ WRONG - unconditional mock import
import { handlers } from "./mocks/handlers";

// ✅ CORRECT - dev-only import
if (process.env.NODE_ENV === "development") {
  const { setupMocks } = await import("./mocks/setup");
  setupMocks();
}
```

## 3. MSW/Mocks in Source

No MSW imports in production source paths:
- `from "msw"`
- `setupWorker`
- `setupServer`

**Where mocks can live:**
- `apps/web/tests/` (Playwright)
- `apps/web/src/mocks/` (dev-only, must be tree-shaken)

## Required Environment Variables for CI

All CI jobs that run builds require these environment variables with fallback values:

- `DATABASE_URL`: PostgreSQL connection string
- `RESEND_API_KEY`: Email service API key
- `BETTER_AUTH_SECRET`: Authentication secret (min 32 chars)

**Where to add fallbacks:** `.github/workflows/validate-prs.yml` in the `env` section of each build job.

**Example fallback values:**
```yaml
DATABASE_URL: 'postgresql://user:pass@localhost:5432/dbname'
RESEND_API_KEY: 're_dummy_key_for_ci_build'
BETTER_AUTH_SECRET: 'dummy_secret_for_ci_build_at_least_32_chars_long'
```

## CI Jobs (validate-prs.yml)

| Job | Command | Blocks merge |
|-----|---------|--------------|
| lint | `biome ci .` | Yes |
| type-check | `pnpm -w type-check` | Yes |
| boundary-checks | grep patterns | Yes |
| build | `NODE_ENV=production pnpm -w build` | Yes |
| prod-mock-ban | `pnpm check:prod-mocks` | Yes |
| e2e | Playwright | Yes |
