# Create Pull Request

Generate a well-structured Pull Request with proper description and metadata.

## Task

1. **Detect current context**:
   - Current branch name
   - Base branch (usually `master` or `main`)
   - Slice number (if applicable, from branch name or commit messages)
   - List of changed files
   - Recent commits on this branch

2. **Generate PR title**:
   - Follow conventional commit format: `<type>: <description>`
   - Examples:
     - `feat(slice-1): add dashboard state machine`
     - `fix: resolve React 19 type compatibility issues`
     - `chore: add pre-commit hooks with husky`

3. **Generate PR description** with these sections:

```markdown
## Summary

[1-3 sentences describing what this PR does and why]

## Changes

- [Bullet list of key changes]
- [One bullet per logical change]
- [Focus on what changed, not how]

## Slice Reference

[If applicable]
- **Slice**: [number]
- **Contract Spec Section**: [reference]
- **Acceptance Tests**: [reference]

## Test Plan

- [ ] `pnpm -w lint` passes
- [ ] `pnpm -w type-check` passes
- [ ] `pnpm -w build` succeeds
- [ ] Manual testing: [describe what you tested]

## Files Changed ([count] files)

[Organized by category]

**API/Backend**:
- `packages/api/modules/.../procedure.ts`

**UI/Frontend**:
- `apps/web/modules/.../Component.tsx`

**Configuration**:
- `.github/workflows/...`

**Documentation**:
- `docs/...`

## Related

- Closes: #[issue-number] (if applicable)
- Depends on: #[pr-number] (if applicable)
- Blocks: #[pr-number] (if applicable)
```

4. **Create the PR** using GitHub CLI:

```bash
gh pr create --title "[generated title]" --body "[generated description]" --base [detected base branch]
```

## Auto-Detection Logic

### Slice Number
Check in order:
1. Branch name pattern: `feat/slice-N-...` or `slice-N-...`
2. Recent commit messages: `Slice: N`
3. If not found, mark as N/A

### Base Branch
1. Check if tracking a remote branch: use its base
2. Check git config for default branch
3. Fallback to `master`

### Changed Files
Use: `git diff --name-only [base-branch]...HEAD`

### Recent Commits
Use: `git log --oneline [base-branch]..HEAD`

## Example Output

```
✅ PR Created Successfully

Title: feat(slice-1): add dashboard state machine
URL: https://github.com/infobacbox-ai/BacBocMVP0.1/pull/42

Summary:
- 8 files changed
- 4 commits included
- Slice 1 implementation
- Base branch: master
```

## Pre-Flight Checks

Before creating the PR, verify:
1. Current branch is NOT `master` or `main`
2. Branch has been pushed to remote
3. Branch has at least 1 commit different from base
4. No uncommitted changes (warn if present)

## Error Handling

### Branch not pushed
```
❌ Branch not pushed to remote

Run: git push -u origin [branch-name]
Then retry creating the PR.
```

### No commits
```
❌ No commits found on this branch

This branch has no commits different from [base-branch].
Make some changes and commit them first.
```

### GitHub CLI not available
```
❌ GitHub CLI (gh) not found

Install: https://cli.github.com/
Or create PR manually at: [generated URL]

PR details saved to: .pr-description.md
```

## Notes

- PR description is also saved to `.pr-description.md` for reference
- You can edit the description after creation
- The command respects existing PR templates if present
