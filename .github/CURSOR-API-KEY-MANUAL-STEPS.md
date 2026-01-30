# CURSOR_API_KEY Setup — Your Manual Steps

Everything is configured in the repo. Do these steps to finish:

---

## 1. Push your changes

Commit and push the workflow updates:

```bash
git add .github/workflows/
git commit -m "fix: add CURSOR_API_KEY validation and verify workflow"
git push
```

---

## 2. Verify the API key (optional but recommended)

1. Go to **GitHub** → your repo → **Actions**
2. Select **Verify CURSOR_API_KEY** in the left sidebar
3. Click **Run workflow** → **Run workflow**
4. When it finishes, open the run and check the logs:
   - ✓ `CURSOR_API_KEY is configured` → you're good
   - ✗ Error about secret not set → continue to step 3

---

## 3. Add the secret (if not already done)

1. Go to **GitHub** → your repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. **Name:** `CURSOR_API_KEY` (exact spelling, case-sensitive)
4. **Value:** your Cursor API key
5. Click **Add secret**

Then run the **Verify CURSOR_API_KEY** workflow again (step 2) to confirm.

---

## 4. Use auto-fix on a PR

1. Open a PR that has failing CI
2. Add the **cursor-autofix** label to the PR
3. The auto-fix workflow runs automatically after CI fails (or trigger it manually via Actions → Auto-fix CI Failures → Run workflow with a PR number)

---

## Summary

| Step | Action |
|------|--------|
| 1 | Push workflow changes to GitHub |
| 2 | Run "Verify CURSOR_API_KEY" workflow to test |
| 3 | Add `CURSOR_API_KEY` secret if step 2 fails |
| 4 | Add `cursor-autofix` label to PRs you want auto-fixed |
