# Environment variables, URL access, and Better Auth

This doc explains why you see problems around **URL access**, **API key access**, and **Better Auth** — and how to fix them.

---

## Step-by-step guide (do this first)

Follow these steps in order. Pick **A** if the problem is on your machine, **B** if CI is failing, **C** if the deployed app has URL/auth issues.

### A. Fix local development (your machine)

1. **Create a `.env` file** at the repo root (same folder as `package.json`).
   - Copy from `.env.example`:  
     `cp .env.example .env`  
     (or copy the contents of `.env.example` into a new file named `.env`.)

2. **Set the three required variables** in `.env`:
   - **`DATABASE_URL`**  
     - Example: `postgresql://user:password@localhost:5432/your_db_name`  
     - Use your real PostgreSQL user, password, host, port, and database name.
   - **`RESEND_API_KEY`**  
     - Get a key from [Resend](https://resend.com) (sign up → API Keys).  
     - Example: `re_xxxxxxxxxxxx` (starts with `re_`).
   - **`BETTER_AUTH_SECRET`**  
     - Any random string **at least 32 characters** (e.g. generate with `openssl rand -base64 32`).  
     - Example: `your_secret_at_least_32_characters_long_here`

3. **Optional for local:** Add `NEXT_PUBLIC_SITE_URL=http://localhost:3000` to `.env` if you want to force the base URL (otherwise the app uses `http://localhost:3000` by default).

4. **Save `.env`** and run the app again:  
   `pnpm dev`  
   - Do **not** commit `.env` (it is in `.gitignore`).

---

### B. Fix CI (GitHub Actions failing)

1. **Check the failing job** in GitHub:  
   Repo → **Actions** → click the failed run → open the failed job (e.g. “Quick validation”, “Type check”, “Build production”).

2. **If the error is about `DATABASE_URL`, `RESEND_API_KEY`, or `BETTER_AUTH_SECRET`:**
   - **Option 1 (no secrets):** CI is already set up with **fallback** values. If the run still fails, the error may be something else (e.g. lockfile, Node version). Re-run the workflow; if it fails again, copy the exact error message and fix that.
   - **Option 2 (use real values in CI):**  
     - Go to the repo on GitHub → **Settings** → **Secrets and variables** → **Actions**.  
     - Click **New repository secret** and add:
       - Name: `DATABASE_URL` → Value: your PostgreSQL connection string (e.g. a CI/test DB).
       - Name: `RESEND_API_KEY` → Value: your Resend API key (or a test key).
       - Name: `BETTER_AUTH_SECRET` → Value: a secret at least 32 characters long.  
     - Re-run the failed workflow.

3. **If the error is about `CURSOR_API_KEY`:**  
   That’s only needed for the “Verify CURSOR_API_KEY” workflow. Follow `.github/CURSOR-API-KEY-MANUAL-STEPS.md` if you use that feature; otherwise you can ignore it.

---

### C. Fix production / deployed app (URL access, Better Auth)

1. **Set required env vars** in your hosting (Vercel, Railway, etc.):
   - `DATABASE_URL` = production PostgreSQL URL.
   - `RESEND_API_KEY` = your Resend API key.
   - `BETTER_AUTH_SECRET` = a strong secret (at least 32 characters), **different** from local.

2. **Set the base URL** so Better Auth and redirects work:
   - Add **`NEXT_PUBLIC_SITE_URL`** = your app’s public URL, e.g. `https://yourdomain.com` (no trailing slash).  
   - On **Vercel**, `NEXT_PUBLIC_VERCEL_URL` is set automatically; you can rely on it or override with `NEXT_PUBLIC_SITE_URL`.

3. **Redeploy** after saving env vars. Clear browser cache or use an incognito window if you still see old redirects.

---

## Why weren’t these problems here before?

1. **CI started running more**
   - PR 16 added workflow improvements: `validate-branches.yml` (runs on push to `feat/**`, `fix/**`, `slice-*`) and stricter PR validation.
   - Those jobs run **build** and **type-check**, which load:
     - **Database**: Prisma needs `DATABASE_URL` (and a `.env` file for the `dotenv -e ../../.env` script).
     - **Mail**: Resend is initialized at import time with `RESEND_API_KEY`.
     - **Auth**: Better Auth uses `BETTER_AUTH_SECRET` and a base URL from env.
   - So **missing env in CI** now fails the pipeline. Before, either CI didn’t run these steps or you didn’t push branches that triggered them.

2. **Local setup**
   - The app has always required `DATABASE_URL`, `RESEND_API_KEY`, and `BETTER_AUTH_SECRET` to run the full stack (DB, emails, auth).
   - If you previously had a working `.env` or only ran parts of the app (e.g. no mail), you wouldn’t see these errors. New clones or new machines without `.env` will see them.

3. **URL / Better Auth**
   - Better Auth uses **base URL** and **trusted origins** from `getBaseUrl()` (see `packages/utils/lib/base-url.ts`). That uses:
     - `NEXT_PUBLIC_SITE_URL`, or
     - `NEXT_PUBLIC_VERCEL_URL`, or
     - `http://localhost:${PORT ?? 3000}`.
   - In production, if neither `NEXT_PUBLIC_SITE_URL` nor `NEXT_PUBLIC_VERCEL_URL` is set, redirects and cookies can point to the wrong host → “URL access” or “Better Auth access” issues.

---

## What to set where

### Local development

Create a `.env` at the repo root (see `.env.example` for names). Minimum for running the app:

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string for Prisma. |
| `RESEND_API_KEY` | Yes | Resend API key; mail module loads it at import. |
| `BETTER_AUTH_SECRET` | Yes | Auth secret; must be at least 32 characters. |
| `NEXT_PUBLIC_SITE_URL` | Optional | Base URL for the app (e.g. `http://localhost:3000`). If unset, app uses `http://localhost:${PORT ?? 3000}`. |

Other optional vars (mail from address, storage, payments, etc.) are in `.env.example`.

### CI (GitHub Actions)

- **Validate PRs / Validate Branches**  
  Workflows use **fallback values** when secrets are not set, so lint, type-check, and build can pass without configuring secrets:
  - `DATABASE_URL` → `postgresql://user:pass@localhost:5432/dbname`
  - `RESEND_API_KEY` → `re_dummy_key_for_ci_build`
  - `BETTER_AUTH_SECRET` → `dummy_secret_for_ci_build_at_least_32_chars_long`

- **Optional:** For real e2e or production-like builds, add the same names as **repository secrets** in GitHub (Settings → Secrets and variables → Actions). Then CI will use those instead of fallbacks.

- **Cursor API key:** The “Verify CURSOR_API_KEY” workflow only needs the `CURSOR_API_KEY` secret if you use Cursor-related automation. See `.github/CURSOR-API-KEY-MANUAL-STEPS.md`.

### Production / deployed app

- Set **real** values for:
  - `DATABASE_URL`
  - `RESEND_API_KEY`
  - `BETTER_AUTH_SECRET`
- Set **base URL** so Better Auth and redirects work:
  - `NEXT_PUBLIC_SITE_URL` (e.g. `https://yourdomain.com`), or
  - On Vercel, `NEXT_PUBLIC_VERCEL_URL` is set automatically; you can rely on it or override with `NEXT_PUBLIC_SITE_URL`.

---

## Quick fixes

| Problem | Fix |
|--------|-----|
| **“DATABASE_URL is not set”** | Add `DATABASE_URL` to `.env` (local) or to CI env/secrets (see above). |
| **“RESEND_API_KEY” / mail errors** | Add `RESEND_API_KEY` to `.env` (local) or rely on CI fallbacks / repo secrets in CI. |
| **Better Auth / session / redirect errors** | Set `BETTER_AUTH_SECRET` (min 32 chars) and `NEXT_PUBLIC_SITE_URL` (or VERCEL_URL) in the environment where the app runs. |
| **CI failing on env** | Ensure workflows have the fallbacks (they do in `validate-prs.yml` and `validate-branches.yml`) or add the secrets in GitHub. |
| **URL access / wrong redirect domain** | Set `NEXT_PUBLIC_SITE_URL` (or `NEXT_PUBLIC_VERCEL_URL` on Vercel) to the public URL of the app. |

---

## Quick checklist

- [ ] **Local:** `.env` exists at repo root with `DATABASE_URL`, `RESEND_API_KEY`, `BETTER_AUTH_SECRET`.
- [ ] **Local:** `pnpm dev` runs without “env not set” or mail/auth errors.
- [ ] **CI:** Either relying on workflow fallbacks or repo secrets `DATABASE_URL`, `RESEND_API_KEY`, `BETTER_AUTH_SECRET` added in Settings → Secrets and variables → Actions.
- [ ] **Production:** Same three vars set in hosting; `NEXT_PUBLIC_SITE_URL` (or Vercel URL) set to the public app URL.

---

## References

- Required env for CI: `.cursor/rules/ci-guardrails.md`
- Cursor API key setup: `.github/CURSOR-API-KEY-MANUAL-STEPS.md`
- Base URL logic: `packages/utils/lib/base-url.ts`
- Auth config: `packages/auth/auth.ts`
