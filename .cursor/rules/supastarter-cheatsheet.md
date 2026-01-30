---
description: Supastarter patterns cheat sheet - quick reference for agents
globs: ["**/*.ts", "**/*.tsx"]
alwaysApply: false
---

# Supastarter Cheat Sheet

> Quick reference for the patterns used in this monorepo.  
> **Full docs:** `nextjs-docs.zip` (not extracted) — see `nextjs-docs_INDEX.md` for navigation.

## Package Structure

```
packages/
├── api/          # oRPC procedures (NOT Next.js route handlers)
├── auth/         # Better Auth config
├── database/     # Prisma schema + queries
├── i18n/         # Translations
├── mail/         # Email templates + providers
├── payments/     # Payment providers (LemonSqueezy active)
├── storage/      # File storage (S3)
├── shared/       # Contract types (BackBox will add here)
└── utils/        # Shared utilities
```

## Import Aliases

```typescript
// ✅ Use these aliases
import { auth } from "@repo/auth";
import { db } from "@repo/database";
import { config } from "@repo/config";
import { orpc } from "@shared/lib/orpc-client";

// ❌ Never use deep relative imports
import { auth } from "../../../packages/auth/auth";
```

## Authentication

### Server-side (RSC, API)

```typescript
import { getSession } from "@saas/auth/lib/server";

export default async function Page() {
  const session = await getSession();
  if (!session) redirect("/auth/login");
  // ...
}
```

### Client-side

```typescript
"use client";
import { useSession } from "@saas/auth/hooks/use-session";

export function Component() {
  const { user, loaded } = useSession();
  // ...
}
```

### Organizations

```typescript
"use client";
import { useActiveOrganization } from "@saas/organizations/hooks/use-active-organization";

export function OrgComponent() {
  const { activeOrganization, isOrganizationAdmin } = useActiveOrganization();
  // ...
}
```

## API (oRPC)

### Procedure Types

```typescript
import { publicProcedure, protectedProcedure, adminProcedure } from "../../../orpc/procedures";

// publicProcedure   → No auth required
// protectedProcedure → Session required
// adminProcedure    → Admin role required
```

### Creating a Procedure

```typescript
// packages/api/modules/[feature]/procedures/[action].ts
export const myProcedure = protectedProcedure
  .route({
    method: "POST",
    path: "/my-feature/action",
    tags: ["MyFeature"],
    summary: "Does something",
  })
  .input(z.object({ id: z.string() }))
  .output(z.object({ ok: z.boolean() }))
  .handler(async ({ input, context }) => {
    // context.user is available (protectedProcedure)
    return { ok: true };
  });
```

### Calling from Client

```typescript
"use client";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useQuery, useMutation } from "@tanstack/react-query";

// Query
const { data } = useQuery(orpc.myFeature.get.queryOptions({ id: "123" }));

// Mutation
const mutation = useMutation(orpc.myFeature.create.mutationOptions());
mutation.mutate({ name: "test" });
```

## Database (Prisma)

### Schema Location

```
packages/database/prisma/schema.prisma
```

### Commands

```bash
pnpm --filter database generate   # Generate client
pnpm --filter database push       # Push to DB (dev)
pnpm --filter database migrate    # Create migration
pnpm --filter database studio     # Open Prisma Studio
```

### Query Pattern

```typescript
// packages/database/prisma/queries/[entity].ts
import { db } from "../client";

export async function getUserById(id: string) {
  return db.user.findUnique({ where: { id } });
}
```

### Using in API

```typescript
// ✅ Import from @repo/database
import { getUserById } from "@repo/database";

// ❌ Never import Prisma client directly in apps/web
import { db } from "@repo/database"; // OK in packages/api
```

## Payments (LemonSqueezy)

### Active Provider

```typescript
// packages/payments/provider/index.ts
export * from "./lemonsqueezy";
```

### Env Vars (names only)

```
LEMONSQUEEZY_API_KEY
LEMONSQUEEZY_SIGNING_SECRET
LEMONSQUEEZY_STORE_ID
```

### Webhook Pattern

Webhooks use Next.js route handlers (exception to oRPC rule):

```typescript
// apps/web/app/api/webhooks/lemonsqueezy/route.ts
export async function POST(request: Request) {
  // 1. Verify signature
  // 2. Parse event
  // 3. Handle idempotently (store providerEventId)
  // 4. Update entitlements
}
```

## Forms

```typescript
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@ui/components/form";

const schema = z.object({ name: z.string().min(1) });

export function MyForm() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
```

## i18n

```typescript
import { useTranslations } from "next-intl";

export function Component() {
  const t = useTranslations();
  return <h1>{t("page.title")}</h1>;
}
```

Translations live in `packages/i18n/translations/`.

## UI Components

```typescript
import { Button } from "@ui/components/button";
import { Input } from "@ui/components/input";
import { cn } from "@ui/lib";

<Button variant="default" className={cn("custom", className)}>
  Click
</Button>
```

## Config

```typescript
import { config } from "@repo/config";

config.appName;              // App name
config.i18n.defaultLocale;   // Default locale
config.auth.enableSignup;    // Auth settings
config.payments.plans;       // Payment plans
```

## Commands Reference

```bash
# Development
pnpm dev                    # Start dev server

# Quality
pnpm -w lint                # Biome lint
pnpm -w type-check          # TypeScript check
pnpm -w build               # Production build

# Database
pnpm --filter database generate
pnpm --filter database push
pnpm --filter database migrate
pnpm --filter database studio

# Testing
pnpm --filter web e2e       # Playwright UI
pnpm --filter web e2e:ci    # Playwright headless
```
