# PR Flow Checklist

This checklist captures the end-to-end PR flow for daily use in this repo.

## 1) Start from main

- `git checkout main`
- `git pull`

## 2) Create a branch

- `git checkout -b feat/<slice>-<topic>`
- or `git checkout -b fix/<scope>`

## 3) Implement + commit (repeat as needed)

- `git add -A`
- `git commit -m "..."`
  - Pre-commit runs: `lint-staged` + `pnpm -w type-check`
- Bot slash command: `/check-react19` when React 19 types/regressions appear

## 4) Full local validation (before PR)

- Cursor command: `validate-local`
- Bot slash command: `/validate-local` to run full local checks

## 5) Sync with main (before push)

- Cursor command: `sync-branch`
- Bot slash command: `/sync-branch` to rebase safely

## 6) Push branch

- `git push -u origin HEAD`

## 7) Create PR

- Cursor command: `create-pr`
- Bot slash command: `/create-pr` to draft the PR body

## 8) CI + review

- Feature branch CI: `validate-branches`
- Address feedback with follow-up commits
- Bot slash command: `/audit-pr` to review PR diffs and checks

## 9) Final check (if needed)

- `validate-local`
- Bot slash command: `/validate-local` after significant review changes

## 10) Merge + cleanup

- Merge via GitHub
- Delete branch (remote + local)
