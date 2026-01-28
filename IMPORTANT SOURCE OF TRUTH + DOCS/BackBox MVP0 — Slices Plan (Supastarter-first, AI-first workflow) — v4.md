# **BackBox MVP0 — Slices Plan (Supastarter-first, AI-first workflow) — v4.3.3 (contract-aligned)**

**Goal:** ship MVP0 fast with Supastarter as the foundation, while keeping Bob unblocked even if Toyo pauses for weeks.

**Note:** Slice 0 is already completed/out-of-scope; this plan starts at **Slice 0.5**.

---

## **Core operating rules**

1. **Repo reality check (must happen once, before Slice 1):** confirm the repo is actually configured to match the locked decisions (**ORM \= Prisma**, **Payments \= LemonSqueezy**). If the repo differs, fix the repo first (do not “paper over” with docs). Record the outcome in the Decision Log.  
2. **Supastarter-first**: reuse kit primitives (auth/session, config, DB package layout, routing conventions). Don’t invent parallel systems.  
   * **Billing note:** we follow Supastarter’s *entitlement/gating patterns*, but **payments provider \= LemonSqueezy**. No Stripe work. Stripe code may remain in the repo if inert/unreachable; do not expand it and do not remove it as a refactor.  
3. **Truth docs are canon**: Product rules/UX truth live in the truth docs; code must follow. Any rule/UX change \= doc patch first.  
   * **Dependency pointer format (required):** `Dependency: <DocName|SliceName> → <SectionTitle> → <RULE-ID>`  
   * **Slice dependencies (allowed):** you may reference an earlier slice inside this same document as `<SliceName>` **only if** that slice declares a stable `RULE-*` id (see “Rule IDs (for dependency pointers)”).  
   * **RULE-ID format (required):** `RULE-<DOMAIN>-<NN>` (e.g. `RULE-TRIAL-01`, `RULE-GUARD-03`). Rule IDs must be stable and referenced verbatim.  
   * **Truth docs index (canonical pointers):**  
     * `1. BackBox MVP — PRD Lite (Kernel Produit)` → product scope \+ MVP0 invariants  
     * `2. BackBox MVP — State & Flow Map (1 page)` → user flow \+ state transitions  
     * `3. BackBox MVP — Contract Spec (Artifact 3)` → canonical server rules \+ `ApiError` model \+ endpoint rules  
     * `4. BackBox MVP — Acceptance Tests (GWT)` → executable “Done” expectations  
     * `5. Figma Visual Truth (MVP0 Freeze v4 — 2026-01-23)` → screen inventory \+ error catalog \+ copy  
     * `6. Decision Log & Changelog (ADR-lite) — MVP0` → locked decisions \+ patch history  
   * **Dependency rule (no ambiguity):** if a referenced rule does not have a stable `RULE-*` id yet, **add the rule id in Contract Spec first** (and record the patch in Decision Log) before implementing.  
4. **PR discipline**: small PRs, one slice-box at a time, reversible. No broad refactors.  
5. **Contract-first between Bob and Toyo (Slice 3+)**:  
   * Toyo defines/updates the endpoint contract (inputs, outputs, error codes) for the slice.  
   * Bob can ship UI using a **mock** matching the contract.  
   * When Toyo PR merges, Bob flips the UI to the real endpoint.  
6. **MVP0 invariants are absolute** (no “temporary exceptions”): one-run trial, no reset, no fallback chat, deterministic errors only, server-side guards.  
7. **Supastarter shape rule (no fights):** BackBox features must fit kit conventions:  
   * UI in `apps/web` under App Router patterns used by the kit.  
   * Shared types/contracts in `packages/shared`.  
   * DB in `packages/database` (Prisma).  
   * API endpoints as **oRPC procedures** under `packages/api/modules/backbox/**` — no new Next.js route handlers for feature endpoints.  
   * Exception: **billing webhooks** follow the kit webhook route handler pattern.  
8. **Boundary rule (resilience):** `apps/web` must **not** import Prisma or DB internals (`packages/database`, Prisma client/types). UI may import only **contract types** (`packages/shared`) and call the API client. Add a CI grep check (e.g., `rg -n "packages/database|prisma" apps/web`).

---

## **Supastarter drift checks (always run)**

These checks prevent “silent drift” (the app still runs, but you’ve started fighting the kit).

1. **ORM is Prisma (not Drizzle):** verify Prisma schema/migrations exist under `packages/database` (or the repo’s equivalent DB package) and Drizzle is not the active path.  
2. **Payments is LemonSqueezy:** verify Lemon env vars \+ provider wiring exist; ensure Stripe code isn’t being reintroduced or expanded.  
3. **Auth/session is kit-native:** search for duplicated auth/session logic outside the kit’s recommended path (no custom JWT/session store).  
4. **Routing conventions:** confirm BackBox routes follow the repo’s chosen Next.js routing convention consistently (no mixed patterns).  
5. **API conventions:** confirm BackBox features are oRPC procedures under `packages/api/modules/backbox/**` (or the repo’s existing `packages/api/**/modules/*` layout) (no ad-hoc API routes for feature endpoints).  
6. **Config/env conventions:** confirm env vars are read via the kit’s config patterns (no new bespoke loaders).  
7. **Build sanity:** `pnpm -w lint`, `pnpm -w typecheck`, `pnpm -w test` (if present), `pnpm -w build`.  
8. **Prod mock ban check:** `NODE_ENV=production pnpm -w build` must not bundle mocks or MSW (see Mock/prod separation).  
9. **UI/DB boundary check:** `rg -n "packages/database|prisma" apps/web` must return **no imports** of DB/Prisma from UI code.

---

## **Server-side enforcement is mandatory (Slice 3+) — canonical guard policy**

**Principle:** UI guards are helpful, but **server is authoritative**.

### **Guard rules (aligned with Contract Spec)**

* **Baseline:** `auth` is required for any `me.*` or `backbox.*` procedure.  
* **Email verification required (403 `FORBIDDEN`)** for:  
  * `backbox.startTrialProject`  
  * `backbox.createPaidProject`  
  * `backbox.saveAnswer`  
  * `backbox.generateMiniRecap`  
  * `backbox.generateFinalRecap`  
  * `backbox.exportHtml`  
* **Ownership (403 `FORBIDDEN`)**:  
  * Any procedure that takes `projectId` MUST enforce `project.userId === currentUser.id`.  
* **Trial vs paid access policy (403 `FORBIDDEN`)**:  
  * If `entitlement_status === 'paid'` / `accessState === 'PAID'`: allow actions on any owned project.  
  * If `accessState === 'TRIAL_ACTIVE'`: **write/AI/export only** allowed when `projectId === trialProjectId`.  
  * If `accessState === 'TRIAL_AVAILABLE'`: user can only **start trial**, not write/AI/export.  
  * Read endpoints (`backbox.listProjects`, `backbox.getProject`) are allowed for any authenticated user (still ownership for `getProject`).

**MVP0 decision (explicit):** read does **not** require email verification; write/AI/export do. This must match Figma/error screens and must not be “tightened later” without a doc patch.

* **Start trial gating (one-run, no reset):**  
  * `backbox.startTrialProject` requires `accessState === 'TRIAL_AVAILABLE'`; otherwise `403 FORBIDDEN`.  
* **Ex-paid note (MVP simple):**  
  * If subscription is no longer active, treat user as non-paid: write/AI/export only on `trialProjectId` (if present). Other projects remain readable.

### **Implementation rule (prevents drift)**

* All `backbox.*` procedures MUST call a **single shared server guard helper** (one file) and never re-implement guards ad-hoc.

### **Standard errors (canonical `ApiError` model)**

type ApiError \= {

  status: 400|401|403|404|409|429|500

  errorCode:

    | 'VALIDATION\_ERROR'

    | 'UNAUTHENTICATED'

    | 'FORBIDDEN'

    | 'NOT\_FOUND'

    | 'FINAL\_REQUIRED'

    | 'QUOTA\_REACHED'

    | 'RATE\_LIMIT'

    | 'EVALUATION\_IN\_PROGRESS'

    | 'AI\_UNAVAILABLE'

    | 'INTERNAL\_ERROR'

  message: string

  details?: Record\<string, unknown\>

}

**Canon mapping:**

* 400 `VALIDATION_ERROR`  
* 401 `UNAUTHENTICATED`  
* 403 `FORBIDDEN` (ownership, entitlement insuffisant, email non vérifié)  
* 404 `NOT_FOUND`  
* 409 `FINAL_REQUIRED` (export demandé sans finalRecap)  
* 429 `QUOTA_REACHED` | `RATE_LIMIT` | `EVALUATION_IN_PROGRESS`  
* 500 `INTERNAL_ERROR` (default) or `AI_UNAVAILABLE` (provider down/timeout)

---

## **Mock/prod separation (Bob safety)**

**Rule:** mocks are dev-only. No mock paths reachable in prod builds.

* Mocks can exist as:  
  * MSW handlers used only in `NODE_ENV=development`, OR  
  * simple in-memory stubs behind a dev flag, OR  
  * a “mock API server” only launched in dev.  
* CI gate: prod build must not bundle mock code.

---

## **Quality gates (must be present)**

### **Minimum CI gate (required)**

CI must block merge if any fail:

* `pnpm -w lint`  
* `pnpm -w typecheck`  
* `pnpm -w build` (with `NODE_ENV=production`)  
* **Prod mock ban check** (see Mock/prod separation)  
* `pnpm check:prod-mocks` (required; deterministic fail if mocks/MSW are bundled)

If a slice changes DB schema:

* migration must be included and validated (see Migration discipline)

### **Migration discipline**

* No migration \= no merge  
* Prisma schema lives under `packages/database`  
* **Dev:** `pnpm --filter database prisma migrate dev`  
* **CI/Prod:** `pnpm --filter database prisma migrate deploy`  
* **PR must include:** exact commands used in this repo, plus what “rollback” means for that change.

### **Prod mock ban script (CI-enforceable)**

Add a single script and require it in CI:

* `pnpm check:prod-mocks`

**Behavior:**

1. runs `NODE_ENV=production pnpm -w build`  
2. fails if build output references any of:  
   * `msw`, `mockServiceWorker`, `apps/web/src/mocks`, `__mocks__`

(Exact grep targets can be tuned to the repo output paths; rule is: no mock code reachable in production builds.)

### **API contract single source of truth**

**Canonical contract file:** `packages/shared/src/contracts/backbox.contract.ts`.

* Defines all procedure names \+ request/response types (`me.getEntitlements` \+ 8 `backbox.*`)  
* Defines the canonical `ApiError` shape \+ error code union  
* UI and API both import from this file. No duplicated contracts elsewhere.

**Contract drift ban:**

* No duplicated string literals for `procedureName` or `errorCode` outside the contract file.  
* UI branches on `errorCode` (not HTTP status). Unknown code ⇒ deterministic `INTERNAL_ERROR` screen.

**Deterministic UI mapping (minimum):**

| `errorCode` | UI behavior | Notes |
| ----- | ----- | ----- |
| `UNAUTHENTICATED` | redirect `/access` | no retry loop |
| `FORBIDDEN` | show gate screen (email / access / ownership) | message chosen by context when available (but deterministic) |
| `NOT_FOUND` | “Project not found” screen | offer back to dashboard |
| `VALIDATION_ERROR` | inline form errors \+ keep user input | never erase text |
| `RATE_LIMIT` | show cooldown message \+ disable button | include “try later” only |
| `QUOTA_REACHED` | show quota screen \+ upsell (if applicable) | deterministic copy |
| `EVALUATION_IN_PROGRESS` | show locked/loading state | no duplicate requests |
| `FINAL_REQUIRED` | show “Generate final recap first” | export CTA disabled |
| `AI_UNAVAILABLE` | show “AI unavailable” screen | offer retry button |
| `INTERNAL_ERROR` | generic error screen | include `requestId` if available |

**Rule:** UI must not invent new states beyond the above behaviors; state derivation comes from `accessState` \+ contract outputs only.

### **QA spine (minimum Playwright)**

* login \+ logged-out redirect to `/access`  
* email-not-verified blocks: start/save/AI/export  
* start trial once; second attempt deterministic `FORBIDDEN`  
* resume trial project  
* ownership blocked (403)  
* export blocked until final exists (409 `FINAL_REQUIRED`)  
* paid unlock path (Slice 8\)

### **Observability (minimal)**

**Single implementation point (required):** add one API-layer middleware/logger that runs for every oRPC procedure (do not hand-log per endpoint).

* For every `backbox.*` request, log JSON: `requestId`, `procedureName`, `userId` (if any), `projectId` (if applicable), `status`, `errorCode` (if any)  
* For AI calls additionally log JSON: `provider`, `latencyMs`, `outcome` (`success` or `errorCode`)

**RequestId propagation (required):**

* Generate `requestId` at the API boundary if missing  
* Return it in error `details` (when safe) so UI can display it on `INTERNAL_ERROR`  
* UI must include it in bug reports (copy button optional)

---

## **Slices**

**Slice 0.5 — Repo Reality Check \+ CI Guardrails (Bob)**

* Confirm repo matches locked decisions (**Prisma**, **LemonSqueezy**), recorded in Decision Log.  
* Add/verify CI gate: `pnpm -w lint`, `pnpm -w typecheck`, `NODE_ENV=production pnpm -w build`, prod mock ban check.

**Definition of done:** checks pass; Decision Log entry created.

---

**Slice 0.75 — Contract-first scaffolding (Bob)**

* Ensure canonical contract file exists and is the only source of procedure strings/types:  
  * `packages/shared/src/contracts/backbox.contract.ts`  
* Add MSW mock harness (dev-only) \+ single client “switch” module.  
* Stub UI routes (empty shells): `/backbox`, `/backbox/start`, `/backbox/project/[projectId]`.

**Definition of done:** UI routes exist; mocks work in dev only; prod build does not bundle mocks.

---

## **Slice 1 — Dashboard State Machine (Bob only; mocks)**

**Goal:** dashboard never “guesses”; it renders from `me.getEntitlements` only.

**Inputs (mock ok until slices land):**

* `me.getEntitlements` (no input)  
* (optional) `backbox.listProjects` for listing/resume UI (mock ok until Slice 4\)

**Render states (from `accessState`):**

* `NONE` → redirect `/access`  
* `TRIAL_AVAILABLE` → primary CTA “Start trial” (go to `/backbox/start`)  
* `TRIAL_ACTIVE` → primary CTA “Resume trial” (needs `trialProjectId`)  
* `PAID` → “New project” \+ list/resume projects (via `listProjects` when available)

**Invariant:** if `accessState === 'TRIAL_ACTIVE'` then `trialProjectId` MUST be a string; otherwise show deterministic `INTERNAL_ERROR`.

**Definition of done:** dashboard matches the state machine; no hidden branching on random flags.

---

## **Slice 2 — Start Trial UI \+ Project Page Shell (Bob only; mocks)**

**Bob owns (UI):**

* `/backbox/start` form:  
  * `title?` (\<= 120\)  
  * `sourceText` textarea (1..30000)  
* Submit calls mocked `backbox.startTrialProject({ sourceText, title?, sourceMeta? })`.  
* On success redirect to `/backbox/project/[projectId]`.  
* Project page shell calls mocked `backbox.getProject({ projectId })` and renders loading/empty/error states.

**Definition of done:** start flow works end-to-end in UI with deterministic errors (mocked).

---

## **Slice 3 — Trial One-Run \+ Entitlements Core (boxed)**

### **Toyo box (DB \+ API)**

**Contract (must match `packages/shared/src/contracts/backbox.contract.ts`):**

* `me.getEntitlements()` → Output:  
  * `entitlement_status: 'none' | 'trial_one_run' | 'paid'`  
  * `accessState: 'NONE'|'TRIAL_AVAILABLE'|'TRIAL_ACTIVE'|'PAID'`  
  * `trialProjectId: string | null`  
  * `quotas: { perPillarMax: 2, perPillarUsed?: Record<'p1'|'p2'|'p3'|'p4', number> }`  
  * `rateLimit: { perHourMax: 10 }`  
* `backbox.startTrialProject({ sourceText, title?, sourceMeta? })` → Output `{ projectId: string }`

**Implementation (minimum):**

* Add Prisma tables needed for trial start:  
  * `backbox_project` (trial mode \+ source fields)  
  * `user_trial_one_run` (trialProjectId, consumedAt, evalCounts)  
* Enforce one-run invariants:  
  * `consumedAt` never returns to null (no reset)  
  * deleting trial project never re-enables trial  
* `startTrialProject` guards/validation:  
  * auth \+ emailVerified  
  * `accessState === 'TRIAL_AVAILABLE'` else 403 `FORBIDDEN`  
  * `sourceText.trim().length > 0`, `sourceText.length <= 30000`, `title?.length <= 120`  
  * transaction: create trial project \+ upsert trial record  
* `me.getEntitlements` computes trial state from `user_trial_one_run`.  
  * **Paid can be stubbed as `'none'` until Slice 8**, but the output shape must already support `'paid'`.

**Definition of done:** trial can be started once; `me.getEntitlements` reflects `TRIAL_AVAILABLE`→`TRIAL_ACTIVE` with `trialProjectId`.

### **Bob lane (UI)**

* Swap MSW mock → real `backbox.startTrialProject` and `me.getEntitlements`.

---

## **Slice 4 — Projects \+ Persistence (boxed)**

### **Toyo box (DB \+ API)**

**Contract (must match `packages/shared/src/contracts/backbox.contract.ts`):**

* `backbox.listProjects()` → Output `Array<{ id, title?, mode: 'trial'|'paid', currentStep: string, updatedAt: string }>`  
* `backbox.getProject({ projectId })` → Output `{ project, answers, miniRecaps, finalRecap }`  
* `backbox.saveAnswer({ projectId, pillar, fieldKey, content, step? })` → Output `{ ok: true }`

**Implementation:**

* Add Prisma table `backbox_answer` (unique `(projectId,pillar,fieldKey)`; upsert idempotent).  
* `listProjects`: auth-only.  
* `getProject`: auth \+ ownership; return empty `miniRecaps` and `finalRecap=null` until Slices 6/7.  
* `saveAnswer`:  
  * auth \+ ownership \+ emailVerified  
  * access policy: PAID ok; TRIAL\_ACTIVE only if `projectId === trialProjectId`  
  * validate `fieldKey` non-empty; if `content` is string then `<= 5000`  
  * upsert answer; if `step` provided then update `backbox_project.currentStep`.

**Definition of done:** save/reload works; ownership \+ access gating enforced server-side.

### **Bob lane (UI)**

* Swap mocks → real `listProjects/getProject/saveAnswer`.  
* Implement autosave indicator \+ deterministic error mapping.

---

## **Slice 5 — Pillar Flows P1–P4 (UI heavy)**

**Dependency:** Slice 4 procedures \+ contract types.

**Bob owns:**

* Guided forms for each pillar, saving via `backbox.saveAnswer`:  
  * `{ projectId, pillar: 'p1'|'p2'|'p3'|'p4', fieldKey: 'main' (MVP default), content, step }`  
* Deterministic validation \+ error screens (no fallback chat).  
* Progress UI reflects `currentStep`.

**Mock boundary:** MSW mocks remain available for dev-only if Toyo box is not merged yet.

**Definition of done:** each pillar can be filled/saved; reload restores; no invented UI states.

---

## **Slice 6 — Mini-Recap AI \+ Policy Rails (boxed)**

### **Toyo box (AI \+ API)**

**Contract:** `backbox.generateMiniRecap({ projectId, pillar })` → Output `{ output: MiniRecapOutput, score?: number }`.

**Guards/policy (server MUST):**

* auth \+ ownership \+ emailVerified  
* access policy: PAID ok; TRIAL\_ACTIVE only if `projectId === trialProjectId`  
* trial quota: `evalCounts[pillar] < 2` else 429 `QUOTA_REACHED`  
* rate-limit: 10/h else 429 `RATE_LIMIT`  
* lock: reject concurrent generation with 429 `EVALUATION_IN_PROGRESS` (TTL 30–60s)  
* one server attempt; on provider down/timeout → 500 `AI_UNAVAILABLE`  
* persist:  
  * `backbox_minirecap` upsert (unique `(projectId,pillar)`)  
  * increment `evalCounts[pillar]` **only after** success persisted  
  * log `ai_usage_event` success/error always

**Policy rails single-source:** quota/lock/rate-limit constants live in one shared module and are imported by UI \+ API.

### **Bob lane (UI)**

* Generate button per pillar, locked/loading states, deterministic error mapping.

**Definition of done:** AI runs reliably; quota/rate-limit/lock are deterministic.

---

## **Slice 7 — Final Recap \+ Export Gate (boxed)**

### **Toyo box (AI \+ API)**

* `backbox.generateFinalRecap({ projectId })` → Output `{ output: FinalRecapOutput }`  
* `backbox.exportHtml({ projectId })` → Output `{ html: string }`

**Rules:**

* Same guards as Slice 6 (auth \+ ownership \+ emailVerified \+ access policy).  
* Export requires final recap exists; otherwise 409 `FINAL_REQUIRED`.  
* HTML must be generated from a fixed template and **escape all user content** (no raw HTML injection).

### **Bob lane (UI)**

* Final recap CTA \+ deterministic error mapping.  
* Export button enabled only when final exists; handles 409 deterministically.

**Definition of done:** export cannot happen without final; no hidden path; content is escaped.

---

## **Slice 8 — Premium Hook (LemonSqueezy) \+ Paid Projects (boxed)**

### **Toyo box (Billing \+ entitlements)**

* Implement LemonSqueezy webhook using Supastarter webhook route-handler pattern:  
  * **Signature verification (required):** verify the provider signature header exactly as LemonSqueezy expects; reject with 401 on mismatch.  
  * **Idempotency (required):** store `providerEventId` (or equivalent unique event id) with a **unique constraint**; if already processed, return 200 and do nothing.  
  * **Replay safety:** webhook handler must be safe on retries and out-of-order events (latest state wins).  
  * **Logging:** log `providerEventId`, `eventType`, `userId` (if resolved), `result`.  
  * **Test (minimum):** one test that replays the same event twice and confirms entitlements change only once.  
* Update `me.getEntitlements` to compute `entitlement_status === 'paid'` / `accessState === 'PAID'` using Supastarter’s canonical purchases/subscription helpers (single constant plan id).  
* Implement `backbox.createPaidProject({ sourceText, title?, sourceMeta? })` (Input **identique** à `backbox.startTrialProject`):  
  * auth \+ emailVerified  
  * require `entitlement_status === 'paid'` else 403 `FORBIDDEN`  
  * validate:  
    * `sourceText.trim().length > 0`  
    * `sourceText.length <= 30000`  
    * `title?.length <= 120`  
  * create `backbox_project(mode='paid', currentStep='p1', sourceText, title?, sourceMeta?)`  
  * return `{ projectId }`

### **Bob lane (UI \+ QA)**

* Premium CTA / upgrade flow.  
* Dashboard uses `accessState === 'PAID'` to unlock multi-project.  
* QA pass: full trial path \+ paid path.

**Definition of done:** webhook flips entitlements; paid users can create paid projects.

---

## **Slice 9 — QA \+ Stability Sweep (Both)**

* Add/extend Playwright tests (minimum spine in Quality gates).  
* Add an export escaping regression test (prove user content is escaped in HTML).  
* Add a “prod mock ban” CI check if not already present.

**Definition of done:** green CI; risky rules covered; no mock path ships to production.

