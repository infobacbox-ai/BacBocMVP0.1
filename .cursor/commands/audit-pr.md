# BackBox — PR Audit (standard)

You are auditing the CURRENT PR/branch. This is an AUDIT ONLY: do not modify code unless explicitly asked.
Goal: catch correctness issues, invariant breaks, Supastarter drift, mock leakage, and "too big / multi-topic PRs".
Be blunt. Prefer small, actionable fixes.

## 0) Inputs you must infer (no guessing)
- What slice / feature this PR targets (infer from branch name + diff + PR description).
- What "source of truth" docs it should match (state/flow + contract + acceptance tests if present).

If you cannot infer intent from the diff, ask at most 2 questions, then continue with best-effort audit.

## 1) Scope + size gate (blockers)
1) List changed files (`git diff --name-only origin/main...HEAD`).
2) Detect if PR contains >1 topic (e.g., UI + infra + refactor). If yes => BLOCKER: "split PR".

## 2) Run required gates (record results)
Run and paste results (or explain why you can't run them):
- pnpm -w lint
- pnpm -w type-check
- NODE_ENV=production pnpm -w build
- pnpm check:prod-mocks (if present)

(These gates are non-negotiable in this repo's guardrails.)
If any fail: classify as BLOCKER and point to the minimal fix.

## 3) Mock / dev-only safety (must be deterministic)
- Verify mocks/MSW/fixtures do NOT leak into prod builds.
- Check for imports from mocks in prod entrypoints (layouts/providers/pages).
- If any risk exists => BLOCKER + exact file path(s).

## 4) Supastarter alignment (no "fight the framework")
- Flag any rewrite/refactor, folder renames, or new architecture patterns.
- Prefer "add a guard/check" over redesign.
- Ensure auth/session patterns and routing conventions aren't bypassed.

## 5) Product invariants check (BackBox)
Use the canonical state machine:
- Dashboard renders strictly from accessState.
- NONE => redirect /access
- TRIAL_AVAILABLE => CTA start trial => /backbox/start
- TRIAL_ACTIVE => requires trialProjectId; CTA resume => /backbox/project/[trialProjectId]
- PAID => show New project + list/resume projects (can be mocked)

Hard invariant:
If accessState === TRIAL_ACTIVE and trialProjectId is missing/empty => show deterministic INTERNAL_ERROR (no fallback).

Audit the diff specifically for anything that violates these.

## 6) Risk + security hygiene
- No secrets committed, no .env values.
- Any env additions: names only, documented.
- No client-side DB access / server-only boundaries violated (flag if seen).

## 7) Output format (must follow)
Return a report with:

### Verdict
One of: APPROVE | REQUEST_CHANGES | BLOCK

### Executive Summary (5 bullets max)
- What changed
- Biggest risks

### Checks Run (with outputs)
- lint:
- type-check:
- build:
- prod-mock-ban:

### Findings (table)
Columns: Severity | Issue | Evidence (file:line) | Why it matters | Minimal fix

Severity levels:
- BLOCKER (must fix before merge)
- HIGH
- MED
- LOW

### "Split PR?" recommendation
If yes, propose exact split boundaries (file groups) into 2–3 PRs max.

### Suggested follow-ups (max 3)
Only small, patch-sized follow-ups. No refactors.
