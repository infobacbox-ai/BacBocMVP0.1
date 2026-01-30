# PR Audit

**Goal**: Audit the current PR for merge-readiness. AUDIT ONLY—no code changes unless asked.

## Constraints

- Timebox: 15 minutes max
- Scope: Diff + changed files only. Repo scan only if confirming a BLOCKER.
- Finding cap: 12 max. Bundle nits into one LOW item.
- Command retries: Zero. Report failures, don't loop.

## Process

1. **Size gate**: `git diff --name-only origin/main...HEAD`
   - If >25 files or multi-topic → BLOCKER: split PR, then triage-audit only
2. **Run gates once** (paste results):
   - `pnpm -w lint`
   - `pnpm -w type-check`
   - `NODE_ENV=production pnpm -w build`
   - `pnpm check:prod-mocks` (N/A if missing)
3. **Check diff for**: mock leakage, auth bypasses, secret commits, breaking changes
4. **Align with Supastarter patterns**—flag new architectures or convention breaks

## Output Format

### Verdict

One of: **APPROVE | REQUEST_CHANGES | BLOCK**

### Summary (max 5 bullets)

- What changed
- Biggest risks

### Checks Run

- lint: [result]
- type-check: [result]
- build: [result]
- prod-mock-ban: [result or N/A]

### Findings Table

| Severity | Issue | Evidence | Minimal Fix |
|----------|-------|----------|-------------|

Severities: **BLOCKER** > HIGH > MED > LOW

### Split Recommendation

If multi-topic or >25 files, propose 2-3 PR boundaries.

### Follow-ups (max 3)

Patch-sized only. No refactors.
