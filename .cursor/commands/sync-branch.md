# Sync Branch

Safely rebase the current branch on the latest master/main and verify no regressions.

## Task

Synchronize the current feature branch with the latest changes from the base branch (typically `master` or `main`), handling conflicts gracefully and validating the result.

## Workflow Steps

### 1. Pre-Sync Safety Checks

Before starting, verify:
- Current branch is NOT `master` or `main`
- Working directory is clean (no uncommitted changes)
- Current branch exists on remote (has been pushed)

If uncommitted changes exist, offer to stash them.

### 2. Update Base Branch

```bash
# Fetch latest from remote
git fetch origin

# Switch to base branch
git checkout master

# Pull latest changes
git pull origin master

# Return to feature branch
git checkout [original-branch]
```

### 3. Perform Rebase

```bash
# Rebase current branch on updated master
git rebase master
```

### 4. Handle Conflicts

If conflicts occur:

```
⚠️ Rebase conflicts detected

Conflicted files:
- apps/web/modules/foo.tsx
- packages/api/modules/bar.ts

Options:
1. Resolve conflicts manually and continue
2. Abort rebase and return to pre-sync state
3. Show conflict details

Please resolve conflicts, then:
- Stage resolved files: git add <file>
- Continue: git rebase --continue
- Or abort: git rebase --abort
```

**Guide user through resolution**:
1. Show conflicted files with markers
2. Explain merge markers (`<<<<<<<`, `=======`, `>>>>>>>`)
3. After user resolves, run `git add` and `git rebase --continue`
4. Repeat until rebase completes

### 5. Force Push (if needed)

After successful rebase:

```bash
# Push rebased branch (rebase rewrites history)
git push --force-with-lease origin [branch-name]
```

**Note**: Use `--force-with-lease` instead of `--force` for safety.

### 6. Validation

Run quick validation checks after sync:

```bash
# Type-check to catch integration issues
pnpm -w type-check

# Lint to catch style issues
pnpm -w lint
```

Report results:

```
✅ Sync Complete

Branch: feat/my-feature
Commits ahead of master: 5
Commits applied: 3 new from master

Validation:
✅ Type-check: PASS
✅ Lint: PASS

Safe to continue work.
```

## Safety Features

### --force-with-lease

Always use `--force-with-lease` instead of `--force`:
- Checks that remote hasn't changed since last fetch
- Prevents accidentally overwriting others' work
- Fails safely if remote was updated

### Stash Management

If uncommitted changes exist:

```bash
# Before sync
git stash push -m "WIP before sync at [timestamp]"

# After sync
git stash pop
```

Handle stash conflicts gracefully:
```
⚠️ Stash pop conflicts

The stashed changes conflict with synced code.

Options:
1. Manually resolve conflicts (same as rebase conflicts)
2. Keep stash saved: git stash drop (you'll lose stashed changes)
3. View stash diff: git stash show -p
```

## Common Scenarios

### Scenario 1: Clean Sync (No Conflicts)

```
🔄 Starting sync...

✅ Fetched latest changes
✅ Updated master (3 new commits)
✅ Rebased feat/my-feature on master
✅ Pushed to origin/feat/my-feature
✅ Type-check: PASS
✅ Lint: PASS

Sync complete! Branch is up to date.
```

### Scenario 2: Conflicts Resolved

```
🔄 Starting sync...

⚠️ Rebase conflicts in 2 files:
- apps/web/modules/dashboard.tsx
- packages/api/modules/backbox/procedure.ts

[User resolves conflicts]

✅ Conflicts resolved
✅ Rebase continued
✅ Pushed to origin/feat/my-feature
✅ Type-check: PASS
✅ Lint: PASS

Sync complete with manual conflict resolution.
```

### Scenario 3: Abort

```
🔄 Starting sync...

⚠️ Rebase conflicts detected

User chose to abort.

✅ Rebase aborted
✅ Branch returned to pre-sync state

No changes made. Try again when ready.
```

## Error Handling

### Working directory not clean

```
❌ Cannot sync: uncommitted changes detected

Files with changes:
- apps/web/modules/foo.tsx
- packages/api/modules/bar.ts

Options:
1. Stash changes: git stash
2. Commit changes: git add . && git commit
3. Discard changes: git checkout .

Choose an option, then retry sync.
```

### Not on a feature branch

```
❌ Cannot sync: you are on master/main

Syncing master requires only: git pull

Switch to a feature branch first:
git checkout feat/my-feature
```

### Remote branch doesn't exist

```
⚠️ Branch not pushed to remote

This branch exists only locally.

Push first: git push -u origin [branch-name]
Then retry sync.
```

## Post-Sync Recommendations

After successful sync:

1. **Review the changes**:
   ```bash
   git log master..HEAD  # See your commits
   git diff master...HEAD  # See total diff
   ```

2. **Test locally**:
   - Run dev server: `pnpm dev`
   - Manual smoke test of your feature
   - Verify no integration issues

3. **Check CI**:
   - If pushed, check GitHub Actions status
   - Fix any new CI failures introduced by sync

## Related Commands

- `.cursor/commands/validate-local.md` - Run full validation after sync
- `.cursor/rules/git-workflow.md` - Branch management guidelines

## Notes

- Syncing regularly (daily) reduces conflict complexity
- Sync before creating a PR to ensure clean merge
- If sync introduces issues, it's often easier to fix than merge conflicts later
