# Slice 0.5 — Repo Reality Check + CI Guardrails

> **Prompt pour Agent Cursor**  
> **Date :** 2026-01-28  
> **Auteur :** Préparé par Claude Opus 4.5 (Principal Engineer review)  
> **Référence canonique :** `BackBox MVP0 — Slices Plan v4.3.3`

---

Tu es un agent Cursor. Ta mission est d'implémenter Slice 0.5 en une seule PR, **en respectant strictement les exigences du Slices Plan v4.3.3**.

## Contexte

- **Repo** : monorepo Next.js basé sur Supastarter
- **Workflow CI existant** : `.github/workflows/validate-prs.yml` (lint + e2e)
- **ORM actif** : Prisma (`packages/database/prisma/schema.prisma`)
- **Paiements actif** : LemonSqueezy (`packages/payments/provider/index.ts` exporte uniquement lemonsqueezy)

## Exigences du Slices Plan (à respecter strictement)

### Quality gates minimum (section "Minimum CI gate")

CI doit bloquer le merge si l'un échoue :
- `pnpm -w lint`
- `pnpm -w typecheck`
- `pnpm -w build` (avec `NODE_ENV=production`)
- **`pnpm check:prod-mocks`** ← script dédié à créer

### Prod mock ban script (section "Prod mock ban script")

Le script `check:prod-mocks` doit :
1. Lancer `NODE_ENV=production pnpm -w build`
2. Échouer si le **build output** référence : `msw`, `mockServiceWorker`, `apps/web/src/mocks`, `__mocks__`

> ⚠️ C'est un scan du **bundle output** (`.next/`), pas juste du code source !

### UI/DB boundary check (section "Boundary rule")

```bash
rg -n "packages/database|prisma" apps/web
# doit retourner NO imports
```

> ⚠️ Le pattern inclut `packages/database` ET `prisma` (pas seulement `@prisma/client`)

---

## Tâches à réaliser

### 1. Mettre à jour le Decision Log

**Fichier** : `IMPORTANT SOURCE OF TRUTH + DOCS/6. Decision Log & Changelog (ADR-lite) — MVP0.md`

**Ajouter à la fin de la section "2) Index" (dans le tableau) :**

```
| ADR-012 | 2026-01-28 | **ORM = Prisma** (verrouillé MVP0) | Adopté | Tech/Repo |
| ADR-013 | 2026-01-28 | **Paiements = LemonSqueezy** (verrouillé MVP0) | Adopté | Tech/Repo |
```

**Ajouter dans la section "3) ADRs" (après ADR-011) :**

```markdown
### ADR-012 — ORM = Prisma (verrouillé)

**Date :** 2026-01-28  
**Décision :** L'ORM du projet est Prisma. Aucun changement d'ORM en MVP0.  
**Pourquoi :** Stabilité ; éviter la dérive tech pendant le dev MVP.  
**Preuves :** `packages/database/prisma/schema.prisma`, `packages/database/package.json` (deps prisma 7.1.0)  
**Impact :** Tech baseline  
**Statut :** Adopté

### ADR-013 — Paiements = LemonSqueezy (verrouillé)

**Date :** 2026-01-28  
**Décision :** Le provider de paiement actif est LemonSqueezy. Pas de changement en MVP0.  
**Pourquoi :** Stabilité ; éviter la dérive tech pendant le dev MVP.  
**Preuves :** `packages/payments/provider/index.ts` exporte uniquement `./lemonsqueezy`  
**Impact :** Tech baseline  
**Statut :** Adopté
```

---

### 2. Créer le script `check:prod-mocks`

**Fichier** : `tooling/scripts/src/check-prod-mocks.ts`

```typescript
/**
 * Prod mock ban check (Slices Plan v4.3.3)
 * 
 * Scans the production build output for forbidden mock patterns.
 * Fails if any mock code is bundled in production.
 */

import { execSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const FORBIDDEN_PATTERNS = [
  /\bmsw\b/,
  /mockServiceWorker/,
  /apps\/web\/src\/mocks/,
  /__mocks__/,
];

const BUILD_OUTPUT_DIR = "apps/web/.next";

function scanDirectory(dir: string, patterns: RegExp[]): string[] {
  const violations: string[] = [];
  
  if (!existsSync(dir)) {
    return violations;
  }

  function scan(currentDir: string) {
    const entries = readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules inside .next
        if (entry.name !== "node_modules") {
          scan(fullPath);
        }
      } else if (entry.isFile() && /\.(js|mjs|cjs)$/.test(entry.name)) {
        try {
          const content = readFileSync(fullPath, "utf-8");
          for (const pattern of patterns) {
            if (pattern.test(content)) {
              violations.push(`${fullPath}: matches pattern ${pattern}`);
            }
          }
        } catch {
          // Skip files that can't be read
        }
      }
    }
  }

  scan(dir);
  return violations;
}

async function main() {
  console.log("🔍 Prod mock ban check (Slices Plan v4.3.3)\n");

  // Step 1: Run production build
  console.log("Step 1: Running production build...");
  try {
    execSync("pnpm -w build", {
      stdio: "inherit",
      env: { ...process.env, NODE_ENV: "production" },
    });
  } catch {
    console.error("❌ Build failed");
    process.exit(1);
  }

  // Step 2: Scan build output for forbidden patterns
  console.log("\nStep 2: Scanning build output for mock patterns...");
  const violations = scanDirectory(BUILD_OUTPUT_DIR, FORBIDDEN_PATTERNS);

  if (violations.length > 0) {
    console.error("\n❌ FAIL: Found mock code in production build:\n");
    for (const v of violations) {
      console.error(`  - ${v}`);
    }
    console.error("\nMock code must not be bundled in production builds.");
    console.error("Check that MSW and mocks are only imported in development.");
    process.exit(1);
  }

  console.log("\n✅ No mock code found in production build");
  process.exit(0);
}

main();
```

**Fichier** : `tooling/scripts/package.json` — ajouter le script :

```json
{
  "scripts": {
    "check:prod-mocks": "tsx src/check-prod-mocks.ts"
  }
}
```

**Fichier** : `package.json` (racine) — ajouter le script workspace :

```json
{
  "scripts": {
    "check:prod-mocks": "pnpm --filter scripts check:prod-mocks"
  }
}
```

---

### 3. Enrichir le workflow CI

**Fichier** : `.github/workflows/validate-prs.yml`

**Remplacer le contenu entier par :**

```yaml
name: Validate PRs

on:
  pull_request:
    branches: [main, master]

env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}

jobs:
  lint:
    name: Lint code
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Biome
        uses: biomejs/setup-biome@v2
        with:
          version: latest
      - name: Run Biome
        run: biome ci .

  type-check:
    name: Type check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: lts/*
      - uses: pnpm/action-setup@v4
      - name: Install dependencies
        run: pnpm install
      - name: Generate Prisma client
        run: pnpm --filter database generate
      - name: Run type-check
        run: pnpm -w type-check

  boundary-checks:
    name: UI/DB boundary checks
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Check UI/DB boundary (Slices Plan rule)
        run: |
          echo "Checking UI/DB boundary: apps/web must not import packages/database or prisma..."
          # Pattern from Slices Plan: rg -n "packages/database|prisma" apps/web
          # Exception: next.config.ts uses @prisma/nextjs-monorepo-workaround-plugin (webpack plugin, not runtime)
          if grep -rE "(packages/database|from ['\"]@prisma|from ['\"]prisma)" --include="*.ts" --include="*.tsx" --exclude="next.config.ts" apps/web/; then
            echo "❌ FAIL: Found DB/Prisma imports in apps/web"
            echo "Rule: apps/web must NOT import Prisma or DB internals."
            echo "Use @repo/api procedures or @repo/shared contract types instead."
            exit 1
          fi
          echo "✅ UI/DB boundary OK"
      - name: Check no MSW/mocks in source code
        run: |
          echo "Checking for MSW/mock patterns in source..."
          if grep -rE "(from ['\"]msw['\"]|setupWorker|setupServer)" --include="*.ts" --include="*.tsx" apps/ packages/; then
            echo "❌ FAIL: Found MSW/mock imports in source code"
            echo "Mocks must only be used in tests/ or behind NODE_ENV=development guards."
            exit 1
          fi
          echo "✅ No MSW/mock imports in source"

  build:
    name: Build production
    runs-on: ubuntu-latest
    needs: [lint, type-check, boundary-checks]
    env:
      NODE_ENV: production
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: lts/*
      - uses: pnpm/action-setup@v4
      - name: Install dependencies
        run: pnpm install
      - name: Generate Prisma client
        run: pnpm --filter database generate
      - name: Build (NODE_ENV=production)
        run: pnpm -w build

  prod-mock-ban:
    name: Prod mock ban check
    runs-on: ubuntu-latest
    needs: [build]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: lts/*
      - uses: pnpm/action-setup@v4
      - name: Install dependencies
        run: pnpm install
      - name: Generate Prisma client
        run: pnpm --filter database generate
      - name: Build and scan for mocks
        run: pnpm check:prod-mocks

  e2e:
    name: Run e2e tests
    timeout-minutes: 60
    runs-on: ubuntu-latest
    needs: [build]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: lts/*
      - uses: pnpm/action-setup@v4
      - name: Install dependencies
        run: pnpm install && pnpm --filter database generate
      - name: Run Playwright tests
        run: pnpm --filter web e2e:ci
      - uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: playwright-report
          path: apps/web/playwright-report/
          retention-days: 30
```

---

### 4. Créer `.cursorignore`

**Fichier** : `.cursorignore` (à la racine du repo)

```
# Build outputs
.next/
dist/
build/
out/

# Dependencies
node_modules/
.pnpm-store/

# Generated
packages/database/prisma/generated/
packages/database/prisma/zod/

# Test artifacts
playwright-report/
test-results/

# IDE & OS
.idea/
*.log
.DS_Store
Thumbs.db

# Env files (ne jamais lire les secrets)
.env
.env.*
!.env.example

# Supastarter docs zip (use nextjs-docs_INDEX.md instead)
IMPORTANT SOURCE OF TRUTH + DOCS/nextjs-docs.zip
```

---

### 5. Créer une règle Cursor

**Fichier** : `.cursor/rules/ci-guardrails.md`

```markdown
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

## CI Jobs (validate-prs.yml)

| Job | Command | Blocks merge |
|-----|---------|--------------|
| lint | `biome ci .` | Yes |
| type-check | `pnpm -w type-check` | Yes |
| boundary-checks | grep patterns | Yes |
| build | `NODE_ENV=production pnpm -w build` | Yes |
| prod-mock-ban | `pnpm check:prod-mocks` | Yes |
| e2e | Playwright | Yes |
```

---

## Validation de fin de tâche

Après avoir fait les modifications :

1. **Lint** — doit passer :
   ```bash
   pnpm -w lint
   ```

2. **Type-check** — doit passer :
   ```bash
   pnpm -w type-check
   ```

3. **UI/DB boundary check** — doit retourner 0 résultat :
   ```bash
   # Note: --exclude="next.config.ts" car il utilise un plugin webpack Prisma (pas un import runtime)
   grep -rE "(packages/database|from ['\"]@prisma|from ['\"]prisma)" --include="*.ts" --include="*.tsx" --exclude="next.config.ts" apps/web/ || echo "OK: boundary respected"
   ```

4. **Build prod** — doit passer :
   ```bash
   NODE_ENV=production pnpm -w build
   ```

5. **Prod mock ban** — doit passer :
   ```bash
   pnpm check:prod-mocks
   ```

---

## Commit message

```
chore: Slice 0.5 — Repo Reality Check + CI Guardrails

- Add ADR-012 (ORM=Prisma) and ADR-013 (Payments=LemonSqueezy) to Decision Log
- Add check:prod-mocks script (scans build output per Slices Plan v4.3.3)
- Extend validate-prs.yml with type-check, boundary-checks, build, prod-mock-ban jobs
- Add .cursorignore for cleaner AI navigation
- Add .cursor/rules/ci-guardrails.md documenting CI rules

Ref: Slices Plan v4.3.3 — Quality gates, Prod mock ban, UI/DB boundary
Slice: 0.5
```

---

## Si ça casse

### La CI échoue sur `type-check`

**Où regarder** : Output du job `type-check` dans GitHub Actions → erreur TypeScript exacte

**Fix minimal** :
```bash
pnpm -w type-check  # reproduire localement
# corriger les erreurs TS signalées
```

### La CI échoue sur `boundary-checks`

**Où regarder** : Le grep affiche la ligne fautive avec le fichier

**Fix minimal** :
- Import `packages/database` trouvé dans `apps/web` → remplacer par un appel API oRPC
- Import `@prisma/client` trouvé → utiliser les types de `@repo/shared` à la place

**Exception connue** : `apps/web/next.config.ts` utilise `@prisma/nextjs-monorepo-workaround-plugin` — c'est un plugin webpack, pas un import runtime. Si le grep le détecte, ajuster le pattern pour exclure `next.config.ts`.

### La CI échoue sur `build`

**Où regarder** : Output du job `build` → souvent un import manquant ou une env var requise

**Fix minimal** :
- Si erreur "cannot find module" → vérifier que `pnpm --filter database generate` a bien tourné
- Si erreur env var → ajouter la variable dans les secrets GitHub (Settings → Secrets)

### La CI échoue sur `prod-mock-ban`

**Où regarder** : Output du script `check:prod-mocks` → fichier et pattern trouvé

**Fix minimal** :
- Si MSW est bundlé → vérifier que l'import est bien conditionnel sur `NODE_ENV`
- Si `__mocks__` est bundlé → déplacer les mocks dans `tests/` ou les supprimer

### E2E timeout ou échec

**Où regarder** : Artifact `playwright-report` téléchargeable depuis l'onglet Actions

**Fix minimal** :
- Si timeout → augmenter `timeout-minutes` ou vérifier que le serveur démarre bien
- Si test spécifique échoue → souvent un sélecteur obsolète ou un changement UI non testé

---

## Résumé des fichiers à créer/modifier

| Action | Fichier |
|--------|---------|
| EDIT | `IMPORTANT SOURCE OF TRUTH + DOCS/6. Decision Log & Changelog (ADR-lite) — MVP0.md` |
| EDIT | `.github/workflows/validate-prs.yml` |
| CREATE | `tooling/scripts/src/check-prod-mocks.ts` |
| EDIT | `tooling/scripts/package.json` (ajouter script) |
| EDIT | `package.json` (racine, ajouter script) |
| CREATE | `.cursorignore` |
| CREATE | `.cursor/rules/ci-guardrails.md` |

---

## Notes Supastarter (ne pas dévier)

- **Build sanity** : utiliser `pnpm -w` (workspace flag) pour les commandes
- **Prisma generate** : toujours faire `pnpm --filter database generate` avant type-check ou build
- **Biome** : le lint utilise `biome ci .` (pas eslint)
- **Ne pas toucher** au code Stripe existant (inert mais présent) — pas de suppression ni expansion
