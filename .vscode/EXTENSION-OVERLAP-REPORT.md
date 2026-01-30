# Extension Overlap Report

Audit of installed Cursor/VS Code extensions for conflicts, redundancy, and recommended settings.

---

## 1. Formatting & Linting

| Extension | Role | Overlap / Notes |
|-----------|------|-----------------|
| **biomejs.biome** | Linter + formatter (TS, TSX, JSON, …) | **Primary.** Replaces ESLint + Prettier in this repo. |
| **editorconfig.editorconfig** | Indent, EOL, charset from `.editorconfig` | **No conflict.** Biome has `formatter.useEditorconfig: true` in `biome.json` — they are coordinated. |
| **prisma.prisma** | Prisma schema formatter | **No conflict.** Scoped to `[prisma]` in settings; Biome stays default for TS/JSON. |

**Verdict:** No overlap. `biome.requireConfiguration: true` is set so Biome only runs where a `biome.json` exists (avoids affecting other folders).

---

## 2. Import & Path Completion

| Extension | Role | Overlap / Notes |
|-----------|------|-----------------|
| **steoates.autoimport** | Suggests symbols and inserts full import (TS/TSX) | Can **duplicate** TypeScript’s built-in “add import” in completion/quick fix. |
| **ionutvmi.path-autocomplete** | Completes path strings in `import "…"` (incl. `@repo/*`, `@ui/*`) | Different layer (path string vs symbol). **Complements** Auto Import. |
| **christian-kohler.npm-intellisense** | Completes **package names** in `require`/`import` (node_modules) | Different scope (npm names vs workspace paths). **No conflict.** |
| **Built-in TypeScript** | “Add all missing imports”, completion with import | **Overlap** with Auto Import: you may see two “add import” options. |

**Verdict:**  
- **Path Autocomplete** and **npm-intellisense**: no conflict; different jobs.  
- **Auto Import vs TypeScript:** mild overlap (two sources of import suggestions). If you see duplicate or confusing “add import” entries, you can either:  
  - Rely on **TypeScript only**: disable the Auto Import extension, or  
  - Rely on **Auto Import only**: set `"typescript.suggest.autoImports": false` and `"javascript.suggest.autoImports": false` in settings.

No change applied by default; adjust if duplicates bother you.

---

## 3. Diagnostics Display

| Extension | Role | Overlap / Notes |
|-----------|------|-----------------|
| **usernamehw.errorlens** | Shows diagnostics (errors/warnings) inline in the editor | **Display only.** Shows what Biome + TypeScript (and others) report. No duplicate linting. |
| **biomejs.biome** | Produces diagnostics | Error Lens **displays** them. Complementary. |

**Verdict:** No conflict. Error Lens is a display layer for existing diagnostics.

---

## 4. Git & GitHub

| Extension | Role | Overlap / Notes |
|-----------|------|-----------------|
| **eamodio.gitlens** | Blame, history, file lens, git UX | Focus: **git visualization and history**. |
| **github.vscode-pull-request-github** | PRs, issues, review, in-editor comments | Focus: **GitHub PR/workflow**. |
| **github.vscode-github-actions** | Edit and run GitHub Actions workflows | Focus: **Actions only**. |

**Verdict:** Some UI touchpoints (e.g. “open PR”) but different main jobs. No need to remove either; use GitLens for history/blame and GitHub extension for PRs/Actions.

---

## 5. Docker & Containers

| Extension | Role | Overlap / Notes |
|-----------|------|-----------------|
| **ms-azuretools.vscode-docker** | Docker UX (build, run, images, etc.) | Microsoft’s Docker-facing UI. |
| **ms-azuretools.vscode-containers** | Container Tools: language service, container management, debugging | Newer core; Docker extension can depend on or bundle it. |

**Verdict:** Per Microsoft’s current design, **Docker** and **Container Tools** are meant to work together (Docker UX + Container Tools). Keeping both is expected; no conflict.

---

## 6. Language / Framework Specific

| Extension | Role | Overlap / Notes |
|-----------|------|-----------------|
| **bradlc.vscode-tailwindcss** | Tailwind IntelliSense, class completion | No overlap. `tailwindCSS.experimental.classRegex` for `cn()` is set. |
| **lokalise.i18n-ally** | i18n keys, next-intl | No overlap. |
| **prisma.prisma** | Prisma schema support | No overlap. |

**Verdict:** No conflicts.

---

## 7. Other

| Extension | Role | Overlap / Notes |
|-----------|------|-----------------|
| **gruntfuggly.todo-tree** | TODO/FIXME/… tracking | No overlap. |
| **streetsidesoftware.code-spell-checker** | Spell check | No overlap. |
| **mikestead.dotenv** | .env highlighting | No overlap. |
| **humao.rest-client** | REST requests | No overlap. |
| **firefox-devtools.vscode-firefox-debug** | Firefox debugging | No overlap. |

**Verdict:** No conflicts.

---

## Summary

| Severity | Area | Action |
|----------|------|--------|
| **None** | Formatting (Biome, EditorConfig, Prisma) | Already coordinated; `biome.requireConfiguration: true` added. |
| **None** | Error Lens vs Biome | Complementary (display vs producer). |
| **None** | GitLens vs GitHub PR/Actions | Different focus; keep both if you use both. |
| **None** | Docker vs Containers | Designed to work together. |
| **Low** | Auto Import vs TypeScript built-in | Optional: disable one if duplicate “add import” suggestions are annoying. |

No extensions need to be removed. The only optional tweak is reducing duplicate import suggestions (Auto Import vs TypeScript) via settings or disabling one extension if you prefer a single source of import completion.
