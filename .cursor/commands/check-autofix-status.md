# Check Auto-Fix Status

Check the status of auto-fix attempts for the current PR.

## What This Does

Shows:
- If auto-fix is enabled (has label)
- Number of attempts made
- Latest workflow run status
- Fix branches created

## Command

```bash
# Get current branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Find PR number
PR_NUMBER=$(gh pr list --head "$BRANCH" --json number --jq '.[0].number')

if [ -z "$PR_NUMBER" ]; then
  echo "❌ No open PR found for branch: $BRANCH"
  exit 1
fi

echo "🔍 Auto-Fix Status for PR #$PR_NUMBER"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if label exists
LABELS=$(gh pr view "$PR_NUMBER" --json labels --jq '.labels[].name')
if echo "$LABELS" | grep -q "cursor-autofix"; then
  echo "✅ Auto-fix ENABLED (has cursor-autofix label)"
else
  echo "⏭️  Auto-fix DISABLED (no cursor-autofix label)"
  echo ""
  echo "To enable: gh pr edit $PR_NUMBER --add-label cursor-autofix"
  exit 0
fi

echo ""

# Count attempts (look for bot comments)
COMMENTS=$(gh pr view "$PR_NUMBER" --json comments --jq '.comments[] | select(.body | contains("Cursor Auto-fix Attempt")) | .body')
ATTEMPT_COUNT=$(echo "$COMMENTS" | grep -c "Cursor Auto-fix Attempt" || echo "0")

echo "📊 Attempts: $ATTEMPT_COUNT / 3"
echo ""

if [ "$ATTEMPT_COUNT" -ge 3 ]; then
  echo "⛔ Maximum attempts reached"
  echo "   Manual intervention required"
  echo ""
fi

# Check for fix branches
FIX_BRANCH="ci-fix/$BRANCH"
if git ls-remote --heads origin "$FIX_BRANCH" | grep -q "$FIX_BRANCH"; then
  echo "🌿 Fix branch exists: $FIX_BRANCH"
  echo ""
  echo "   Review changes:"
  echo "   git fetch origin $FIX_BRANCH"
  echo "   git diff HEAD..origin/$FIX_BRANCH"
  echo ""
  echo "   Merge fix:"
  echo "   git merge origin/$FIX_BRANCH"
  echo ""
else
  echo "🌿 No fix branch yet (will be created after CI fails)"
  echo ""
fi

# Check latest workflow runs
echo "🔄 Recent workflow runs:"
gh run list --workflow=auto-fix-ci.yml --limit 3 --json conclusion,status,createdAt,displayTitle | \
  jq -r '.[] | "   \(.createdAt | split("T")[0]) - \(.displayTitle) - \(.conclusion // .status)"'

echo ""
echo "🔗 View PR: $(gh pr view $PR_NUMBER --json url --jq '.url')"
echo "🔗 View workflows: https://github.com/$(gh repo view --json nameWithOwner --jq '.nameWithOwner')/actions/workflows/auto-fix-ci.yml"
```

## Usage

In Cursor:
1. Press `Cmd/Ctrl + Shift + P`
2. Type: "Cursor: Run Command"
3. Select: "Check Auto-Fix Status"

## Quick Status

```bash
# Just check if enabled
gh pr view --json labels --jq '.labels[].name' | grep cursor-autofix

# View latest run
gh run view --workflow=auto-fix-ci.yml
```
