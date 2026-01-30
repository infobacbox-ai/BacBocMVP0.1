---
name: CI Fix Commit Reduction
overview: Implement pre-commit hooks, add type-check to CI, and fix editor configurations to reduce fix commits from 79% to under 20% of total commits.
todos:
  - id: ci-typecheck
    content: Add type-check job to .github/workflows/validate-prs.yml
    status: pending
  - id: precommit-install
    content: Install simple-git-hooks and lint-staged dependencies
    status: pending
  - id: precommit-config
    content: Configure simple-git-hooks and lint-staged in package.json
    status: pending
  - id: vscode-settings
    content: Update .vscode/settings.json with auto-fix and LF settings
    status: pending
  - id: gitattributes
    content: Create .gitattributes for line ending normalization
    status: pending
  - id: normalize-endings
    content: Run git add --renormalize to fix existing line endings
    status: pending
  - id: turbo-typecheck
    content: Update turbo.json with type-check task dependencies
    status: pending
  - id: verify
    content: Test pre-commit hooks and push PR to verify CI
    status: pending
isProject: false
---

# Reduce Fix Commits: CI and Workflow Improvements

## Problem Statement

Analysis of the last 2 days shows 79% of commits are fixes rather than features. Root causes identified:

- No type-check in CI (TypeScript errors only caught at build time)
- No pre-commit hooks (formatting/lint issues reach CI)
- Line ending mismatch (Windows CRLF vs repo LF)
- VS Code auto-fix not running on save

---

## Implementation

### 1. Add Type-Check Job to CI

Update `[.github/workflows/validate-prs.yml](.github/workflows/validate-prs.yml)` to add a new job between `lint` and `e2e`:

```yaml
type-check:
  name: Type check
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: pnpm/action-setup@v4
    - uses: actions/setup-node@v4
      with:
        node-version: lts/*
        cache: 'pnpm'
    - run: pnpm install
    - run: pnpm --filter database generate
    - run: pnpm type-check
```

This catches React 19 type errors and similar issues before merge.

---

### 2. Add Pre-Commit Hooks

Install dependencies and configure `simple-git-hooks` + `lint-staged`:

```bash
pnpm add -Dw simple-git-hooks lint-staged
```

Add to `[package.json](package.json)`:

```json
{
  "scripts": {
    "prepare": "simple-git-hooks"
  },
  "simple-git-hooks": {
    "pre-commit": "pnpm lint-staged"
  },
  "lint-staged": {
    "*.{ts,tsx,js,jsx,json}": [
      "biome check --write --no-errors-on-unmatched"
    ]
  }
}
```

Run `pnpm prepare` to activate hooks.

---

### 3. Fix VS Code Settings

Update `[.vscode/settings.json](.vscode/settings.json)`:

- Change `"source.fixAll.biome": "explicit"` to `"always"`
- Change `"source.organizeImports.biome": "explicit"` to `"always"`
- Add `"files.eol": "\n"` to enforce LF line endings

---

### 4. Add Line Ending Normalization

Create new file `.gitattributes` in repo root:

```
* text=auto eol=lf
*.{cmd,[cC][mM][dD]} text eol=crlf
*.{bat,[bB][aA][tT]} text eol=crlf
```

Then normalize existing files:

```bash
git add --renormalize .
git commit -m "fix: normalize line endings to LF"
```

---

### 5. Add Check-All Script (Optional)

Add to `[package.json](package.json)` scripts:

```json
"check-all": "pnpm lint && pnpm type-check"
```

---

### 6. Update Turbo Config for Type-Check Caching

Update `[turbo.json](turbo.json)` to add dependencies for type-check:

```json
"type-check": {
  "dependsOn": ["^generate"],
  "outputs": []
}
```

---

## Verification

After implementation, run:

```bash
pnpm check-all        # Should pass locally
git commit --allow-empty -m "test: verify pre-commit hooks"  # Should trigger lint-staged
```

Push a test PR to verify the new `type-check` job runs in CI.

---

## Expected Outcome


| Metric                 | Before | After         |
| ---------------------- | ------ | ------------- |
| Fix commits            | 79%    | Less than 20% |
| CI failures from types | Many   | Near zero     |
| Formatting commits     | Common | Eliminated    |


