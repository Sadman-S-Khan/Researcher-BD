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

## Local development
```bash
npm install
cp .env.example .env          # DATABASE_URL=file:./dev.db, AUTH_SECRET=...
npx prisma db push && npm run db:seed
npm run dev
```
