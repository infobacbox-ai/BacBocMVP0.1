# Sync Branch

**Goal**: Rebase current branch on latest master safely.

## Pre-Checks

- Abort if on master
- Stash uncommitted changes if present
- Verify branch exists on remote

## Sync Steps

1. `git fetch origin`
2. `git checkout master && git pull origin master`
3. `git checkout [branch] && git rebase master`
4. If conflicts: guide user through resolution, don't auto-resolve
5. `git push --force-with-lease origin [branch]`

## Post-Sync Validation

- `pnpm -w type-check`
- `pnpm -w lint`

## Output

```
Branch: [name]
Commits ahead of master: [count]
New commits from master: [count]
Validation: ✅ PASS | ❌ FAIL

[If conflicts occurred, summarize resolution]
```

## On Failure

- **Conflicts**: Show files, explain options (resolve/abort)
- **Push rejected**: Remote changed—refetch and retry once
- **Validation fails**: Report errors, suggest sync may have introduced issues
