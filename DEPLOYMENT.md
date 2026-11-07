# Deployment (Vercel)

Live: https://researcherbd.vercel.app — Vercel project `researcher-bd`, auto-deploys on every push to `main`
of github.com/Sadman-S-Khan/Researcher-BD.

## How the build works (`npm run build` → `scripts/vercel-build.mjs`)

| Database configured? | What happens |
|---|---|
| `DATABASE_URL` / `POSTGRES_PRISMA_URL` is a `postgres://` URL | Prisma schema switched to PostgreSQL, `prisma db push` (non-destructive — fails rather than dropping data), empty tables seeded, `next build`. **Data is permanent.** |
| No Postgres | A seeded SQLite file (`prisma/template.db`) is built into the deployment and copied to `/tmp` at runtime. Everything works, but user changes can reset when Vercel starts a new instance. A banner says so. |

### Make data permanent (free)
Vercel → project **researcher-bd** → **Storage → Create Database → Neon** → connect to the project → **Redeploy**.
The Neon integration sets `DATABASE_URL` / `DATABASE_URL_UNPOOLED`; the build detects them automatically.

## Environment variables

| Key | Purpose |
|---|---|
| `AUTH_SECRET` | JWT signing key (required, 32+ chars) |
| `ADMIN_EMAIL` | Site administrator. Created on first build (or promoted if the account exists) |
| `SEED_ADMIN_PASSWORD` | Initial password for `ADMIN_EMAIL` — change it after first login |
| `BLOB_READ_WRITE_TOKEN` | Optional. Vercel Blob for avatar uploads (otherwise small avatars are stored inline) |
| `CROSSREF_MAILTO` | Optional. Contact email for Crossref's polite pool (DOI import works without it) |

## Content
Starter content (conferences, journals, funding, scholarships, institutions, datasets, lessons) lives in
`src/lib/seed-content.mjs`, each with an official source link and a last-checked date. The build only fills
empty tables, so edits made through the site are never overwritten. Old `[Demo]` records and
`@demo.researcherbd.org` users are removed automatically on deploy.

## Automatic updates
- **Daily (Vercel Cron, 03:00 Dhaka)** — `/api/cron/daily`, authenticated with `CRON_SECRET`: adds Bangladeshi
  open-access journals from DOAJ, fills missing ISSNs/publishers from OpenAlex (exact title match; Bangladeshi
  journals must be attributed to Bangladesh), refreshes OpenAlex citation metrics for 100 journals/day, and closes
  past events. Admins can run it from the admin panel. Optional `OPENALEX_API_KEY` raises OpenAlex limits.
- **Weekly (Claude scheduled task, Fridays)** — researches new conferences, fellowships and scholarships from
  official sources and commits them to `src/lib/data/international.mjs` / `src/lib/seed-content.mjs`.

## Journal metrics and Scopus journals
- **SCImago import (admin panel):** download the CSV from https://www.scimagojr.com/journalrank.php ("Download
  data") and upload it. Every journal in the file is Scopus-indexed; the import adds missing journals and updates
  quartile, SJR, H-index, subject areas and the Scopus flag (with the SCImago year as evidence). Re-import yearly.
  SCImago blocks automated downloads, so this step is manual.
- **CiteScore / Impact Factor:** proprietary (Elsevier / Clarivate). Moderators enter them on the journal page with
  the year and a source note; they are never fetched or guessed.
- **Filters:** Journals can be filtered by region, field (27 Scopus subject areas), quartile and indexing, and
  sorted by SJR or Impact Factor. Conferences can be filtered by submission deadline and conference date.

## Local development
```bash
npm install
cp .env.example .env          # DATABASE_URL=file:./dev.db, AUTH_SECRET=...
npx prisma db push && npm run db:seed
npm run dev
```
