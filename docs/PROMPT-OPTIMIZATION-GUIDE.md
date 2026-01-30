# Prompt Optimization Guide

> Analysis of existing Cursor commands with improved alternatives for better AI agent performance.

---

## Executive Summary

Your 5 command prompts are **well-structured** but share common issues that reduce effectiveness:

| Issue | Impact | Frequency |
|-------|--------|-----------|
| Over-verbosity | AI wastes context tokens parsing documentation | 5/5 prompts |
| Redundant examples | Examples AI already knows from training | 4/5 prompts |
| Missing "why" upfront | AI starts executing before understanding goal | 3/5 prompts |
| Bash snippets as instructions | AI knows git/pnpm—commands as docs bloat | 4/5 prompts |
| No failure escalation path | Prompts don't say what to do if stuck | 3/5 prompts |

**Key insight**: AI agents perform better with **intent + constraints + output format** rather than step-by-step tutorials.

---

## Prompt Analysis & Improvements

---

### 1. `audit-pr.md` — PR Audit

#### When You Use It
- Before merging PRs
- Code review sessions
- Checking for regressions/blockers

#### Current Strengths
- ✅ Anti-spiral meta-rules (timebox, finding cap)
- ✅ Clear severity levels
- ✅ Structured output format
- ✅ Scope discipline (diff-first)

#### Current Weaknesses
- ❌ 123 lines is too long—AI may skim or lose focus
- ❌ Repeats rules already in `.cursor/rules/pr-checklist.md`
- ❌ "Run each command max once" is obvious to AI
- ❌ BackBox invariants section is domain-specific noise for general PRs

#### Improved Version

```markdown
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
APPROVE | REQUEST_CHANGES | BLOCK

### Summary (max 5 bullets)
### Findings Table
| Severity | Issue | Evidence | Minimal Fix |

Severities: BLOCKER > HIGH > MED > LOW

### Split Recommendation (if needed)
### Follow-ups (max 3, patch-sized only)
```

**Why this is better**:
- 60% shorter (50 lines vs 123)
- Intent-first, not tutorial-style
- Removes obvious instructions ("run each command once")
- Keeps the critical anti-spiral rules

---

### 2. `check-react19.md` — React 19 Compatibility

#### When You Use It
- After upgrading React or dependencies
- When type-check shows React 19 errors
- Tracking suppression debt

#### Current Strengths
- ✅ Good error pattern examples
- ✅ Multiple output modes
- ✅ Links to rules file

#### Current Weaknesses
- ❌ 253 lines—mostly examples AI can generate itself
- ❌ Bash snippets for basic rg/pnpm commands
- ❌ "Bulk Fix Workflow" is interactive fiction (AI can't prompt mid-task)
- ❌ Fix patterns duplicate `.cursor/rules/react-19-compat.md`

#### Improved Version

```markdown
# Check React 19 Compatibility

**Goal**: Find and report React 19 type incompatibilities with fix suggestions.

## Process
1. Run `pnpm -w type-check` and capture output
2. Extract React 19-related errors (children props, JSX types, component prop mismatches)
3. Group by library (next/script, react-dropzone, recharts, etc.)
4. Cross-reference fixes from `.cursor/rules/react-19-compat.md`

## Output Format

### Summary
- Files scanned: [count]
- Files with issues: [count]
- Affected libraries: [list]

### Issues by Library

For each library:
- File path + line
- Error description
- Recommended fix (suppression or type assertion)

### Quick Stats
- Current React 19 suppressions: `rg "@ts-expect-error.*React 19" apps/ packages/ -c`
- @ts-ignore usage (should be 0): `rg "@ts-ignore" apps/ packages/ -g "*.tsx" -c`

## After Reporting
Offer to apply fixes. If accepted:
1. Apply fix to each file
2. Re-run type-check
3. Report error reduction
```

**Why this is better**:
- 80% shorter (45 lines vs 253)
- Removes example code the AI can generate from the rules file
- Removes fake "interactive" workflows
- Focuses on what to DO, not how to teach

---

### 3. `create-pr.md` — Create Pull Request

#### When You Use It
- After completing a feature/fix
- When ready to open a PR

#### Current Strengths
- ✅ Good PR description template
- ✅ Pre-flight checks
- ✅ Error handling cases

#### Current Weaknesses
- ❌ Step-by-step git commands AI already knows
- ❌ "Auto-Detection Logic" is implementation detail, not instruction
- ❌ Duplicates what the agent's built-in PR creation already does

#### Improved Version

```markdown
# Create Pull Request

**Goal**: Create a well-structured PR from the current branch.

## Pre-Flight (abort if any fail)
- Not on main/master
- Branch pushed to remote
- Has commits different from base
- No uncommitted changes (warn only)

## Gather Context
- Branch name, base branch, changed files
- Recent commits: `git log --oneline origin/main..HEAD`
- Infer slice number from branch name if present

## PR Structure

**Title**: `<type>(<scope>): <description>`
- Types: feat, fix, chore, refactor, docs

**Body**:
```
## Summary
[1-3 sentences]

## Changes
- [Key changes as bullets]

## Test Plan
- [ ] lint passes
- [ ] type-check passes
- [ ] build succeeds
- [ ] [manual testing done]

## Files Changed
[Grouped by: API, UI, Config, Docs]
```

## Create
```bash
gh pr create --title "..." --body "..." --base [base-branch]
```

Save description to `.pr-description.md` for reference.
```

**Why this is better**:
- 50% shorter
- Removes tutorial-style "Auto-Detection Logic" section
- Keeps the template which is the valuable part
- Trusts AI to know git commands

---

### 4. `sync-branch.md` — Sync Branch

#### When You Use It
- Daily sync with main
- Before creating a PR
- After teammates merge changes

#### Current Strengths
- ✅ Good safety features (force-with-lease)
- ✅ Handles edge cases
- ✅ Post-sync validation

#### Current Weaknesses
- ❌ 265 lines—mostly bash tutorials
- ❌ "Common Scenarios" section is narrative, not instruction
- ❌ Conflict resolution walkthrough AI already knows
- ❌ Explains merge markers (AI knows this)

#### Improved Version

```markdown
# Sync Branch

**Goal**: Rebase current branch on latest main/master safely.

## Pre-Checks
- Abort if on main/master
- Stash uncommitted changes if present
- Verify branch exists on remote

## Sync Steps
1. `git fetch origin`
2. `git checkout main && git pull origin main`
3. `git checkout [branch] && git rebase main`
4. If conflicts: guide user through resolution, don't auto-resolve
5. `git push --force-with-lease origin [branch]`

## Post-Sync Validation
- `pnpm -w type-check`
- `pnpm -w lint`

## Output
```
Branch: [name]
Commits ahead of main: [count]
New commits from main: [count]
Validation: ✅ PASS | ❌ FAIL

[If conflicts occurred, summarize resolution]
```

## On Failure
- Conflicts: Show files, explain options (resolve/abort)
- Push rejected: Remote changed—refetch and retry once
- Validation fails: Report errors, suggest sync may have introduced issues
```

**Why this is better**:
- 75% shorter (50 lines vs 265)
- Removes bash tutorials and merge marker explanations
- Focuses on decision points, not mechanics
- Adds explicit failure escalation

---

### 5. `validate-local.md` — Validate Local

#### When You Use It
- Before pushing changes
- Before creating a PR
- After sync to verify no regressions

#### Current Strengths
- ✅ Already concise (65 lines)
- ✅ Clear table output format
- ✅ Fail-fast behavior

#### Current Weaknesses
- ❌ Three OS-specific build commands add noise
- ❌ No guidance on what to do after passing
- ❌ "Minimal fix guidance" is vague

#### Improved Version

```markdown
# Validate Local

**Goal**: Run CI checks locally before pushing.

## Checks (run in order, stop on first failure)
1. `pnpm -w lint`
2. `pnpm -w type-check`
3. `pnpm -w build` (use appropriate NODE_ENV=production syntax for OS)
4. `pnpm check:prod-mocks`

## Output

| Check | Status | Duration | Notes |
|-------|--------|----------|-------|
| Lint | ✅/❌ | Xs | file count or error summary |
| Type-check | ✅/❌ | Xs | package count or error location |
| Build | ✅/❌ | Xs | success or failure reason |
| Prod mock ban | ✅/❌ | Xs | pass or violations found |

## On Failure
- Show the specific error with file:line
- Provide a one-sentence fix suggestion
- Do NOT continue to next check

## On Success
```
✅ All checks passed. Safe to push.

Next steps:
- `git push` to trigger CI
- Or run `create-pr` command
```
```

**Why this is better**:
- Removes OS-specific command clutter
- Adds "what next" guidance
- Keeps the good parts (table format, fail-fast)

---

## General Prompt Writing Principles

Based on this analysis, here are principles for better AI agent prompts:

### 1. Lead with Intent, Not Steps
```markdown
# Bad
1. First, run git status
2. Then, check if there are changes
3. If there are changes...

# Good
**Goal**: Verify working directory is clean before proceeding.
```

### 2. Trust the AI's Knowledge
```markdown
# Bad
Use `git rebase main` to rebase. This takes your commits and replays them
on top of the target branch. The syntax is: git rebase <branch-name>

# Good
Rebase on main. Handle conflicts if they occur.
```

### 3. Specify Output Format Explicitly
```markdown
# Bad
Report the results clearly.

# Good
## Output
| Check | Status | Notes |
```

### 4. Include Failure Paths
```markdown
# Bad
Run the build command.

# Good
Run build. On failure:
- Show error with file:line
- Suggest minimal fix
- Stop remaining checks
```

### 5. Remove Interactive Fiction
```markdown
# Bad
If multiple files have the same issue:
"Apply bulk fix? (yes/no)"
If yes: [steps...]

# Good
If multiple files share the same issue pattern, apply fixes to all,
then report what was changed.
```

### 6. Reference Rules, Don't Duplicate
```markdown
# Bad
[50 lines of React 19 fix patterns]

# Good
Apply fixes per `.cursor/rules/react-19-compat.md`
```

---

## Token/Length Comparison

| Prompt | Original Lines | Improved Lines | Reduction |
|--------|---------------|----------------|-----------|
| audit-pr | 123 | 50 | 59% |
| check-react19 | 253 | 45 | 82% |
| create-pr | 152 | 55 | 64% |
| sync-branch | 265 | 50 | 81% |
| validate-local | 65 | 40 | 38% |
| **Total** | **858** | **240** | **72%** |

**Result**: Same functionality in 72% fewer tokens, leaving more context window for actual code.

---

## Recommended Actions

1. **Replace existing prompts** with the improved versions above
2. **Consolidate shared knowledge** into `.cursor/rules/` files and reference them
3. **Add a "meta" prompt** for common pre-work (gather context, check git status)
4. **Test with edge cases** to ensure improved prompts handle failures gracefully

---

## New Prompt Ideas

Based on your workflow, consider adding:

### `quick-fix.md`
```markdown
# Quick Fix

**Goal**: Fix the current linter/type error with minimal changes.

Read the error, identify the root cause, apply the smallest fix that resolves it.
Do not refactor. Do not add features. Just fix.
```

### `explain-error.md`
```markdown
# Explain Error

**Goal**: Explain what the current error means and why it's happening.

Do not fix it. Just explain:
1. What the error message means
2. Why it's occurring in this context
3. Common causes
4. Typical solutions (without implementing)
```

### `pre-push.md`
```markdown
# Pre-Push

**Goal**: Full pre-push checklist.

1. Run validate-local checks
2. Verify no TODO/FIXME in new code (warn only)
3. Check for console.log statements (warn only)
4. Confirm branch is up to date with main
5. Show summary of what will be pushed
```
