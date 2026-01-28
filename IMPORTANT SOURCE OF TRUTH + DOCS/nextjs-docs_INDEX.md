# Docs offline (Supastarter / Next.js) — Index rapide & mode d’emploi

Ce fichier sert de **guide de lecture** pour le bundle `nextjs-docs.zip` (docs offline).
L’objectif : aider un agent (Claude/Cursor) à trouver **vite** le bon repère, sans confondre ces docs avec la *source de vérité produit*.

---

## Ce que c’est (et ce que ce n’est pas)

- ✅ **Référence technique** : patterns Supastarter (monorepo, auth, DB, paiements, API, etc.) + guides pratiques.
- ❌ **Pas le CANON produit** : en cas de doute/contradiction, on suit d’abord les docs “source of truth” du projet (Contract Spec, GWT, Decision Log, Figma, etc.).

Règle simple : si une page de ce zip contredit le CANON, on **n’implémente pas “au feeling”** → on note la divergence dans le Decision Log.

---

## Comment l’utiliser sans saturer le contexte

### Option recommandée
- **Garder le zip** dans le repo (archive/référence)
- **Ne pas** dézipper et committer tout le dossier (bruit énorme)
- Ajouter le zip dans `.cursorignore`

### Pour consulter localement
Dézipper **en local uniquement** (non committé), puis rechercher au besoin :

```bash
# depuis le dossier dézippé
rg -n "Lemonsqueezy|LEMONSQUEEZY|Prisma|packages/database|Biome|protectedProcedure" .
```

---

## Carte des sections (à quoi ça sert)

Les pages sont rangées par thèmes. À l’intérieur du zip, les chemins ressemblent à :
`<theme>/<page>.mdx` + un `meta.json`.

### 1) Travailler avec le codebase (monorepo, dev, lint)
Dossier : `codebase/`

Pages clés :
- `codebase/structure.mdx` — structure du monorepo (apps/, packages/, etc.)
- `codebase/local-development.mdx` — setup local + services
- `codebase/formatting-and-linting.mdx` — lint/format **avec Biome** (commandes `pnpm format`, `pnpm lint`)
- `codebase/update.mdx` — update du kit (si applicable)

### 2) Authentification & sessions
Dossier : `authentication/`

Pages clés :
- `authentication/overview.mdx` — vue d’ensemble (UI + auth flow)
- `authentication/user-and-session.mdx` — accéder à user/session côté app
- `authentication/permissions.mdx` — permissions / access control (front + API)
- `authentication/superadmin.mdx` — superadmin (si utilisé)

### 3) API (endpoints, protection, usage côté front)
Dossier : `api/`

Pages clés :
- `api/overview.mdx`
- `api/protect-endpoints.mdx` — procédures type `publicProcedure`, `protectedProcedure`, `adminProcedure`
- `api/usage-in-frontend.mdx` — comment consommer côté UI

### 4) Base de données (Prisma/Drizzle, migrations, studio)
Dossier : `database/`

Pages clés :
- `database/overview.mdx` — choix ORM (Prisma/Drizzle) + emplacement `packages/database`
- `database/client.mdx` — recommandations d’usage du client DB (server-side)
- `database/update-schema.mdx` — **migrations Prisma** (update schema + migrate)
- `database/studio.mdx` — Prisma Studio / inspection

> Si la décision verrouillée du projet est “Prisma”, ces pages sont les repères officiels côté kit.

### 5) Paiements & abonnements (dont LemonSqueezy)
Dossier : `payments/`

Pages clés :
- `payments/overview.mdx` — module paiements générique du kit
- `payments/providers/lemonsqueezy.mdx` — setup LemonSqueezy (API key, store, webhooks)
- (selon besoin) `payments/providers/stripe.mdx` — **attention** si le projet a verrouillé LemonSqueezy : Stripe peut être un héritage template

Variables d’environnement mentionnées (noms seulement) :
- `LEMONSQUEEZY_API_KEY`
- `LEMONSQUEEZY_SIGNING_SECRET`
- `LEMONSQUEEZY_STORE_ID`

### 6) Déploiement / production
Dossier : `deployment/`

À consulter si tu dois comprendre :
- quelles variables doivent être présentes en prod
- comment déployer le monorepo et gérer les webhooks (paiements, etc.)

### 7) Autres sections (utile selon besoins)
- `mailing/` — emails
- `storage/` — fichiers / S3 (souvent MinIO en local)
- `organizations/` — multi-tenant / orgs
- `analytics/`, `monitoring/`, `seo/` — instrumentation / SEO
- `recipes/`, `tasks/`, `customization/`, `ai/` — patterns additionnels

---

## Repères “Slice 0.5” (Repo reality check + CI guardrails)

Si le travail concerne la CI et les garde-fous, les pages les plus utiles sont :

- CI lint/format : `codebase/formatting-and-linting.mdx` (Biome + commandes)
- Structure monorepo : `codebase/structure.mdx`
- ORM/DB : `database/overview.mdx`, `database/client.mdx`, `database/update-schema.mdx`
- Paiements : `payments/overview.mdx`, `payments/providers/lemonsqueezy.mdx`
- Protection endpoints : `api/protect-endpoints.mdx`

Ces pages donnent le “contrat kit” : où regarder dans le repo, quels scripts, quels emplacements.

---

## Mini check anti-dérive (à appliquer quand tu lis ces docs)

Avant d’implémenter quoi que ce soit “parce que la doc le dit” :
1) Est-ce aligné avec **Supastarter** (patterns du kit) ?
2) Est-ce cohérent avec le **CANON** du projet (Contract/GWT/Decision Log/Figma) ?
3) Est-ce un **patch** (petit changement) plutôt qu’un refactor ?

Si la réponse n’est pas “oui” aux 3 → on pose une question / on fait une note de divergence.

---

*Fichier généré comme index de lecture du zip `nextjs-docs.zip` (sans extraire le zip dans le repo).*
