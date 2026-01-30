---
description: Git workflow rules and branch management conventions
globs: ["**/*"]
alwaysApply: false
---

# Git Workflow Rules

> Standard conventions for branching, committing, and maintaining a clean repository.

## Branch Naming Conventions

### Format
```
<type>/<scope>
```

### Types

| Type | When to Use | Example |
|------|-------------|---------|
| `feat/` | New feature implementation | `feat/slice-1-dashboard` |
| `fix/` | Bug fixes | `fix/react-19-types` |
| `refactor/` | Code refactoring (no behavior change) | `refactor/auth-guards` |
| `chore/` | Tooling, dependencies, config | `chore/upgrade-next` |
| `docs/` | Documentation only | `docs/api-spec-update` |

### Scope Guidelines
- Use **slice numbers** for feature work: `feat/slice-2-trial-logic`
- Use **descriptive names** for fixes: `fix/login-redirect`
- Keep names **lowercase with dashes**: `feat/user-profile` (not `feat/UserProfile`)
- **No versioning** in branch names: use `fix/types` not `fix/types-v2`

### Examples

```bash
# ✅ Good
feat/slice-1-dashboard
fix/react-19-types
refactor/orpc-procedures
chore/add-husky

# ❌ Bad
feature/add_user_dashboard  # use 'feat/', not 'feature/'
fix-types-v2                # no versioning
Fix-React-Types             # use lowercase
my-branch                   # no type prefix
```

## One Branch = One Topic

**Rule**: Each branch must address **exactly one concern**.

### What This Means

```bash
# ✅ Good: Single topic
feat/slice-1-dashboard
  - Add dashboard state machine
  - Wire dashboard page
  - Add translations

# ❌ Bad: Multiple topics
feat/slice-1-and-build-fixes
  - Add dashboard state machine  # Topic 1
  - Fix React 19 types           # Topic 2 (unrelated!)
  - Upgrade dependencies         # Topic 3 (unrelated!)
```

### When Scope Creeps

If you start working on a branch and realize you need to fix something unrelated:

1. **Stash your current work**: `git stash`
2. **Create a new branch** for the fix: `git checkout -b fix/unrelated-issue`
3. **Fix and commit** the unrelated issue
4. **Return to original branch**: `git checkout feat/original-work`
5. **Apply stash**: `git stash pop`

## No Versioned Branches

**Never** create branches like:
- `fix/types-v2`
- `feat/dashboard-v3`
- `fix/login-attempt-2`

### Why?
Commits provide version history. Branch names should describe **what**, not **which attempt**.

### Instead:
- Use **force-push** to update the same branch (if not yet merged)
- Create a **new branch** with a **different scope** if the approach changes significantly

```bash
# ❌ Bad
git checkout -b fix/types-v2  # Don't version!

# ✅ Good - Same branch, new commits
git checkout fix/types
# ... make changes ...
git commit -m "fix: resolve remaining type errors"
git push --force-with-lease  # Update remote

# ✅ Good - Different approach
git checkout -b fix/types-with-assertions  # Describes new approach
```

## Branch Cleanup Rules

### After Merge
Delete branch **immediately** after merge:

```bash
# GitHub UI: Click "Delete branch" button after merge

# Or locally:
git checkout master
git pull
git branch -d feat/merged-branch
git fetch --prune  # Remove remote-tracking branches
```

### Weekly Cleanup
Every week, review and prune stale branches:

```bash
# List local branches
git branch

# List merged branches (safe to delete)
git branch --merged master

# Delete merged local branches
git branch -d old-branch-name

# List remote branches
git branch -r

# Prune deleted remote branches
git fetch --prune

# Force delete unmerged branches (if abandoned)
git branch -D abandoned-branch
```

### Abandoned Branches
If a branch is outdated or you're taking a different approach:

```bash
# Don't keep it "just in case"
git branch -D old-approach

# Commits are still in reflog for 30+ days if you need them
git reflog  # See all recent commits
```

## Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <description>

[optional body]

[optional footer: Ref, Slice, Breaking Change]
```

### Types
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `refactor:` - Code refactoring
- `test:` - Tests
- `chore:` - Tooling/config

### Examples

```bash
# Simple
git commit -m "feat: add dashboard state machine"

# With body
git commit -m "fix: resolve React 19 type compatibility

- Add type assertions for Script component
- Update analytics provider types
- Document technical debt

Ref: Contract Spec v0.4
Slice: 1"
```

## Common Workflows

### Starting New Feature Work

```bash
# Sync with latest master
git checkout master
git pull

# Create feature branch
git checkout -b feat/slice-2-trial-logic

# Make changes, commit frequently
git add .
git commit -m "feat: add trial consumption logic"

# Push to remote
git push -u origin feat/slice-2-trial-logic
```

### Syncing with Master

```bash
# Update master
git checkout master
git pull

# Return to feature branch
git checkout feat/my-feature

# Rebase on latest master
git rebase master

# If conflicts, resolve and continue
git rebase --continue

# Force-push (rebase rewrites history)
git push --force-with-lease
```

### Splitting a Messy Branch

If you realize your branch has mixed concerns:

```bash
# Create clean branch for Topic A
git checkout -b feat/topic-a master

# Cherry-pick only relevant commits
git cherry-pick <commit-hash>  # Repeat for each relevant commit

# Create clean branch for Topic B
git checkout -b fix/topic-b master
git cherry-pick <other-commit-hash>

# Delete messy original branch
git branch -D feat/messy-mixed-branch
```

## Integration with CI

Branches matching these patterns trigger CI:
- Branches pushed to **any pattern** trigger `validate-branches.yml` (lint + type-check)
- PRs to `main`/`master` trigger full `validate-prs.yml` (lint + type-check + build + tests)

## Related Rules

- `.cursor/rules/pre-commit.md` - Pre-commit validation
- `.cursor/rules/pr-checklist.md` - PR requirements
- `.cursor/commands/sync-branch.md` - Safe rebase command
