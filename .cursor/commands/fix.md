# Fix PR / CI

**Goal**: Make this PR green with the fewest possible pushes (ideally ONE) and reasonable token use.

## Input

- PR URL: <PASTE_GITHUB_PR_LINK_HERE>

## Rules

- Patch-sized fixes only (no broad refactors/rewrites).
- Don’t restate logs. Don’t ask for secrets/.env values (VAR NAMES ok).
- Prefer root-cause fixes that also prevent the next obvious failure (quick forward-scan), but don’t “clean up” unrelated code.

## Workflow

1) Inspect PR from the link
   - Identify repo + PR branch + what changed.
   - Read CI status and failing checks.
   - Fetch the *full* failing logs yourself (prefer `gh` CLI if available):
     - `gh pr view <PR> --json headRefName,baseRefName`
     - `gh pr checks <PR> --watch=false`
     - For failing runs/logs: `gh run list`, `gh run view <id> --log-failed`
   - If you cannot access logs from this environment, ask me ONLY for the minimal missing piece (the failing step name + error snippet).

2) Triage (short)
   - List distinct failures in order: Symptom → likely cause → files → minimal fix plan.

3) Reproduce locally
   - Run the same commands CI runs (from workflow) or the closest equivalents.

4) Fix + forward-scan
   - Implement fixes.
   - Run at least: typecheck + lint (+ tests/build if CI runs them) until locally green or only non-actionable failures remain.

5) Commit + push (ONE push if possible)
   - Create 1–3 commits max with clear messages.
   - Push the branch to update the PR.
   - Only push when local checks match CI and are green.

6) Report (concise)
   - What failed + what you changed (files list)
   - Commands you ran + results
   - Commits created (messages)
   - What might still fail in CI (if anything)
