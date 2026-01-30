# Create Pull Request

**Goal**: Create a well-structured PR from the current branch.

## Pre-Flight

Abort if any fail:
- On master
- Branch NOT pushed to remote
- No commits different from base
- Uncommitted changes exist (warn only)

## Gather Context

- Branch name, base branch, changed files
- Recent commits: `git log --oneline origin/master..HEAD`
- Infer slice number from branch name if present

## PR Structure

**Title**: `<type>(<scope>): <description>`

Types: feat, fix, chore, refactor, docs

**Body**:

```markdown
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
