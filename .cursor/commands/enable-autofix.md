# Enable Auto-Fix for Current PR

Enable Cursor AI auto-fix for the current PR's CI failures.

## What This Does

1. Finds the PR for your current branch
2. Adds the `cursor-autofix` label
3. Next time CI fails, the auto-fix workflow will run automatically

## Command

```bash
# Get current branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Find PR number for this branch
PR_NUMBER=$(gh pr list --head "$BRANCH" --json number --jq '.[0].number')

if [ -z "$PR_NUMBER" ]; then
  echo "❌ No open PR found for branch: $BRANCH"
  echo "Create a PR first with: gh pr create"
  exit 1
fi

# Add the label
echo "🏷️  Adding cursor-autofix label to PR #$PR_NUMBER..."
gh pr edit "$PR_NUMBER" --add-label cursor-autofix

# Check status
echo ""
echo "✅ Auto-fix enabled for PR #$PR_NUMBER"
echo ""
echo "📋 What happens next:"
echo "  1. If CI is currently failing → workflow will trigger soon"
echo "  2. If CI passes → workflow will trigger on next failure"
echo "  3. Watch progress: gh run list --workflow=auto-fix-ci.yml"
echo ""
echo "🔗 View PR: $(gh pr view $PR_NUMBER --json url --jq '.url')"
```

## Usage

In Cursor:
1. Press `Cmd/Ctrl + Shift + P`
2. Type: "Cursor: Run Command"
3. Select: "Enable Auto-Fix for Current PR"

Or via terminal:
```bash
# Copy the command above and run it
```

## What's Required

- Open PR exists for your current branch
- PR has failing CI (or will fail)
- `CURSOR_API_KEY` secret is set in GitHub repo

## Check Status

```bash
# View workflow runs
gh run list --workflow=auto-fix-ci.yml

# View PR labels
gh pr view --json labels
```

## Disable Auto-Fix

```bash
# Remove the label
gh pr edit --remove-label cursor-autofix
```
