# **Annexe — Patch Pack “Repo-ready” (Implementation Pack)**

Version: IP-0.2  
Date: 2026-01-23  
Statut: **DÉRIVÉ / JETABLE** (non-canon)  
Canon: **Artifact 3 — Contract Spec v0.4 (CANON)**

Objectif: pack **exécutable par agent** (Cursor/Claude Code) pour implémenter le contrat BackBox MVP dans le repo Supastarter.

**Gouvernance**: en cas de divergence → **le canon gagne**. Ce pack se régénère.

---

## **1\) FILES TO TOUCH**

Chemins “type” Supastarter. Si ton repo diffère: adapte les chemins, pas la structure.

### **Database**

* `packages/database/src/schema/backbox.ts` (NEW) — tables BackBox.  
* `packages/database/src/schema/index.ts` (EDIT) — export du schema BackBox.  
* `packages/database/drizzle/` (EDIT/NEW) — migration init BackBox.

  ### **API (oRPC)**

* `packages/api/src/routers/me.ts` (EDIT) — `me.getEntitlements`.  
* `packages/api/src/routers/backbox.ts` (NEW) — procédures BackBox.  
* `packages/api/src/routers/index.ts` (EDIT) — register `backbox` router.

  ### **Shared (types \+ errors \+ constants)**

* `packages/api/src/shared/backbox.types.ts` (NEW)  
* `packages/api/src/shared/errors.ts` (NEW/EDIT)  
* `packages/api/src/shared/backbox.rules.ts` (NEW) — limites/constantes.

  ### **Services (min, pour garder les routers simples)**

* `packages/api/src/services/backbox.service.ts` (NEW) — guards/quota/rate-limit/lock \+ helpers.  
* `packages/api/src/services/ai.provider.ts` (NEW/EDIT) — wrapper IA normalisant `AI_UNAVAILABLE`.

  ### **Tests**

* `packages/api/src/__tests__/backbox.contract.test.ts` (NEW) — tests “anti-dérive”.  
  ---

  ## **2\) DB MIGRATIONS (Drizzle/SQL)**

  ### **2.1 Tables & contraintes (MUST)**

**Tables**

* `backbox_project`  
* `backbox_answer`  
* `backbox_minirecap`  
* `backbox_finalrecap`  
* `user_trial_one_run`  
* `ai_usage_event`

**Uniques (MUST)**

* `backbox_answer`: unique `(projectId, pillar, fieldKey)`  
* `backbox_minirecap`: unique `(projectId, pillar)`  
* `backbox_finalrecap`: unique `(projectId)`  
* `user_trial_one_run`: unique `(userId)` (PK OK)

**Indexes (SHOULD)**

* `backbox_project (userId, updatedAt)`  
* `ai_usage_event (userId, createdAt)`  
* `ai_usage_event (projectId, createdAt)`

**Types colonne (lean, safe)**

* `backbox_answer.content`: **jsonb** (même si MVP envoie du texte) → évite une migration future.  
* `sourceText`: text  
* `inputSnapshot/output`: jsonb

**FKs (SHOULD, mais optionnel si friction Supastarter)**

* `backbox_project.userId -> user.id`  
* `*_projectId -> backbox_project.id`

  ### **2.2 Drizzle schema (squelette minimal)**

* // packages/database/src/schema/backbox.ts  
* import { pgTable, uuid, text, jsonb, timestamp, uniqueIndex, index, integer, varchar } from "drizzle-orm/pg-core";  
*   
* export const backbox\_project \= pgTable('backbox\_project', {  
*   id: uuid('id').defaultRandom().primaryKey(),  
*   userId: uuid('user\_id').notNull(),  
*   title: varchar('title', { length: 120 }),  
*   sourceText: text('source\_text').notNull(),  
*   sourceMeta: jsonb('source\_meta'),  
*   mode: varchar('mode', { length: 10 }).notNull(),        // 'trial'|'paid'  
*   currentStep: varchar('current\_step', { length: 10 }).notNull(), // 'p1'..'final'  
*   createdAt: timestamp('created\_at').defaultNow().notNull(),  
*   updatedAt: timestamp('updated\_at').defaultNow().notNull(),  
* }, (t) \=\> ({  
*   byUserUpdated: index('idx\_bb\_project\_user\_updated').on(t.userId, t.updatedAt),  
* }));  
*   
* export const backbox\_answer \= pgTable('backbox\_answer', {  
*   id: uuid('id').defaultRandom().primaryKey(),  
*   projectId: uuid('project\_id').notNull(),  
*   pillar: varchar('pillar', { length: 2 }).notNull(),  
*   fieldKey: varchar('field\_key', { length: 40 }).notNull(),  
*   content: jsonb('content').notNull(),  
*   createdAt: timestamp('created\_at').defaultNow().notNull(),  
*   updatedAt: timestamp('updated\_at').defaultNow().notNull(),  
* }, (t) \=\> ({  
*   uniq: uniqueIndex('uq\_bb\_answer').on(t.projectId, t.pillar, t.fieldKey),  
* }));  
*   
* export const backbox\_minirecap \= pgTable('backbox\_minirecap', {  
*   id: uuid('id').defaultRandom().primaryKey(),  
*   projectId: uuid('project\_id').notNull(),  
*   pillar: varchar('pillar', { length: 2 }).notNull(),  
*   inputSnapshot: jsonb('input\_snapshot').notNull(),  
*   output: jsonb('output').notNull(),  
*   score: integer('score'),  
*   createdAt: timestamp('created\_at').defaultNow().notNull(),  
*   updatedAt: timestamp('updated\_at').defaultNow().notNull(),  
* }, (t) \=\> ({  
*   uniq: uniqueIndex('uq\_bb\_minirecap').on(t.projectId, t.pillar),  
* }));  
*   
* export const backbox\_finalrecap \= pgTable('backbox\_finalrecap', {  
*   id: uuid('id').defaultRandom().primaryKey(),  
*   projectId: uuid('project\_id').notNull(),  
*   inputSnapshot: jsonb('input\_snapshot').notNull(),  
*   output: jsonb('output').notNull(),  
*   createdAt: timestamp('created\_at').defaultNow().notNull(),  
*   updatedAt: timestamp('updated\_at').defaultNow().notNull(),  
* }, (t) \=\> ({  
*   uniq: uniqueIndex('uq\_bb\_finalrecap').on(t.projectId),  
* }));  
*   
* export const user\_trial\_one\_run \= pgTable('user\_trial\_one\_run', {  
*   userId: uuid('user\_id').notNull().primaryKey(),  
*   trialProjectId: uuid('trial\_project\_id'),  
*   consumedAt: timestamp('consumed\_at'),  
*   evalCounts: jsonb('eval\_counts').notNull(), // {p1:number,p2:number,p3:number,p4:number}  
* });  
*   
* export const ai\_usage\_event \= pgTable('ai\_usage\_event', {  
*   id: uuid('id').defaultRandom().primaryKey(),  
*   userId: uuid('user\_id').notNull(),  
*   projectId: uuid('project\_id'),  
*   pillar: varchar('pillar', { length: 2 }),  
*   kind: varchar('kind', { length: 12 }).notNull(), // 'minirecap'|'finalrecap'  
*   createdAt: timestamp('created\_at').defaultNow().notNull(),  
*   tokensIn: integer('tokens\_in'),  
*   tokensOut: integer('tokens\_out'),  
*   latencyMs: integer('latency\_ms'),  
*   errorCode: varchar('error\_code', { length: 40 }),  
* }, (t) \=\> ({  
*   byUserCreated: index('idx\_ai\_usage\_user\_created').on(t.userId, t.createdAt),  
*   byProjectCreated: index('idx\_ai\_usage\_project\_created').on(t.projectId, t.createdAt),  
* }));  
    
  ---

  ## **3\) API CONTRACT (types \+ errors \+ procédures)**

  ### **3.1 Constants (MUST)**

* // packages/api/src/shared/backbox.rules.ts  
* export const MAX\_SOURCE\_TEXT \= 30000;  
* export const MAX\_ANSWER\_LEN \= 5000;  
* export const TRIAL\_PER\_PILLAR\_MAX \= 2;  
* export const RATE\_PER\_HOUR\_MAX \= 10;


  ### **3.2 Shared types**

* // packages/api/src/shared/backbox.types.ts  
* export type Pillar \= 'p1'|'p2'|'p3'|'p4';  
* export type EntitlementStatus \= 'none'|'trial\_one\_run'|'paid';  
* export type AccessState \= 'NONE'|'TRIAL\_AVAILABLE'|'TRIAL\_ACTIVE'|'PAID';  
*   
* export type MiniRecapOutput \= {  
*   pillar: Pillar;  
*   score?: number;  
*   strengths: string\[\];      // \<= 2  
*   improvements: string\[\];   // \<= 2  
*   nextAction: string;  
* };  
*   
* export type FinalRecapOutput \= {  
*   priorities: string\[\]; // 1..3  
*   perPillar: Record\<Pillar, {  
*     score?: number;  
*     strengths: string\[\];  
*     improvements: string\[\];  
*     nextAction: string;  
*   }\>;  
* };


  ### **3.3 Errors**

* // packages/api/src/shared/errors.ts  
* export type ApiError \= {  
*   status: 400|401|403|404|409|429|500;  
*   errorCode:  
*     | 'VALIDATION\_ERROR'  
*     | 'UNAUTHENTICATED'  
*     | 'FORBIDDEN'  
*     | 'NOT\_FOUND'  
*     | 'FINAL\_REQUIRED'  
*     | 'QUOTA\_REACHED'  
*     | 'RATE\_LIMIT'  
*     | 'EVALUATION\_IN\_PROGRESS'  
*     | 'AI\_UNAVAILABLE'  
*     | 'INTERNAL\_ERROR';  
*   message: string;  
*   details?: Record\<string, unknown\>;  
* };


  ### **3.4 Procedures (liste \+ guards clés)**

* `me.getEntitlements()`  
  * Retourne `entitlement_status`, `accessState`, `trialProjectId`, `quotas.perPillarUsed` (si trial), `rateLimit`.  
* `backbox.startTrialProject({sourceText,title?,sourceMeta?})`  
  * auth \+ email verified \+ `TRIAL_AVAILABLE`.  
  * crée `project(mode=trial)` \+ fixe `user_trial_one_run(trialProjectId,consumedAt,evalCounts)`.  
* `backbox.createPaidProject({sourceText,title?,sourceMeta?})`  
  * auth \+ email verified \+ `paid`.  
* `backbox.listProjects()`  
  * auth.  
* `backbox.getProject({projectId})`  
  * auth \+ ownership.  
* `backbox.saveAnswer({projectId,pillar,fieldKey,content,step?})`  
  * auth \+ ownership.  
  * write autorisé: PAID ; ou TRIAL\_ACTIVE **uniquement si** `projectId === trialProjectId`.  
* `backbox.generateMiniRecap({projectId,pillar})`  
  * auth \+ ownership \+ email verified.  
  * trialProjectId uniquement \+ quota pilier \< 2 \+ rate-limit 10/h \+ lock.  
  * succès: upsert mini-recap \+ incrément quota (atomique, sur succès).  
* `backbox.generateFinalRecap({projectId})`  
  * auth \+ ownership \+ email verified.  
  * trialProjectId uniquement (si non-paid) \+ rate-limit \+ lock.  
  * succès: upsert final-recap.  
* `backbox.exportHtml({projectId})`  
  * auth \+ ownership \+ email verified.  
  * trialProjectId uniquement (si non-paid).  
  * MUST exiger `finalRecap` sinon 409 `FINAL_REQUIRED`.  
  * MUST escape systématique des valeurs user (anti-XSS).

  ---

  ## **4\) ACCEPTANCE TESTS (GWT → tests)**

À implémenter dans `backbox.contract.test.ts` (minimum vital).

1. Trial create OK (TRIAL\_AVAILABLE → TRIAL\_ACTIVE \+ trialProjectId/consumedAt fixés)  
2. Trial create forbidden si déjà consommé (trialProjectId \!= null → 403\)  
3. NO DELETE RESET (consumedAt non-null → essai jamais réactivé)  
4. saveAnswer refuse hors trialProjectId (TRIAL\_ACTIVE → 403\)  
5. Quota pilier bloque à 2 (→ 429 QUOTA\_REACHED)  
6. Échec IA ne consomme pas quota (quota inchangé sur `AI_UNAVAILABLE`)  
7. Rate limit compte les tentatives (10/h → 11e \= 429 RATE\_LIMIT)  
8. Lock bloque la concurrence (→ 429 EVALUATION\_IN\_PROGRESS)  
9. Export exige finalRecap (absent → 409 FINAL\_REQUIRED)  
10. Email non vérifié bloque start/save/generate/export (→ 403\)  
    ---

    ## **5\) SMOKE CHECKLIST (manuel)**

1. Nouveau compte → `me.getEntitlements` \= TRIAL\_AVAILABLE.  
2. Start trial → création projet trial \+ TRIAL\_ACTIVE.  
3. Save answer P1 → refresh → persistance OK.  
4. Generate mini P1 → mini-recap OK \+ quota p1=1.  
5. Re-generate mini P1 jusqu’à 3e → la 3e \= QUOTA\_REACHED.  
6. 11 tentatives d’éval en \<60 min → la 11e \= RATE\_LIMIT.  
7. Double-clic “Évaluer” → 2e requête \= EVALUATION\_IN\_PROGRESS.  
8. Export sans final → FINAL\_REQUIRED ; export après final → OK.  
   ---

   ## **6\) Pitfalls (keep it strict)**

* Quota trial: incrément **uniquement** après succès persisté.  
* Rate-limit: compter **tentatives** (succès \+ échecs \+ retries).  
* ExportHtml: escape systématique (anti-XSS).  
* Uniques: indispensables pour idempotence et anti-dup.  
* 

