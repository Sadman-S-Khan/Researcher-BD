# Deploying Researcher BD to Vercel + Supabase

This guide walks you through deploying the Researcher BD platform from this sandbox to a live production URL using **Vercel** (free hosting) and **Supabase** (free PostgreSQL database).

**Total time:** ~20 minutes
**Cost:** $0 (within free tiers)
**Result:** A live, public URL like `https://researcher-bd.vercel.app`

---

## Prerequisites

You need:

1. A **GitHub** account (free)
2. A **Vercel** account (free — sign in with GitHub at https://vercel.com)
3. A **Supabase** account (free — sign in with GitHub at https://supabase.com)

No local development environment is required — everything is done in the browser.

---

## Step 1: Create a Supabase project (5 min)

1. Go to https://supabase.com and sign in
2. Click **New project**
3. Fill in:
   - **Name:** `researcher-bd`
   - **Database password:** Generate a strong password and **save it somewhere safe** (you'll need it later)
   - **Region:** Choose the one closest to your users (e.g., `Singapore` for Bangladesh)
   - **Pricing plan:** Free
4. Click **Create new project** and wait ~2 minutes for provisioning to finish

---

## Step 2: Get your database connection strings (1 min)

1. In your Supabase dashboard, go to **Project Settings** (gear icon) → **Database**
2. Look for **Connection string** and toggle to **Transaction** mode (also called "Pooler")
3. You'll see two URLs:

   **Transaction URL (port 6543)** — this becomes `DATABASE_URL`
   ```
   postgresql://postgres.<ref>:<password>@<region>-pooler.supabase.com:6543/postgres
   ```

   **Session URL (port 5432)** — this becomes `DIRECT_URL`
   ```
   postgresql://postgres.<ref>:<password>@<region>-pooler.supabase.com:5432/postgres
   ```

4. Replace `<password>` with the password you saved in Step 1
5. Copy both URLs to a notes file — you'll paste them into Vercel shortly

> **Why two URLs?** Vercel serverless functions open many short-lived connections. The **pooler** (port 6543) multiplexes these so you don't exhaust the connection limit. Migrations need a **direct** connection (port 5432) because PgBouncer doesn't support some migration operations.

---

## Step 3: Create the database schema (3 min)

You have two options. **Option A is simpler.**

### Option A: Use Supabase SQL Editor (recommended)

1. In Supabase dashboard, go to **SQL Editor** → **New query**
2. Open the file `supabase/migration.sql` from this project (it's the same one in `/download/supabase/migration.sql`)
3. Copy its entire content and paste into the SQL Editor
4. Click **Run** (top-right)
5. You should see "Success. No rows returned" — that means all 30+ tables were created

### Option B: Use Prisma from your local machine

If you have Node.js locally:

```bash
# Clone your repo locally
git clone <your-github-repo-url>
cd researcher-bd
bun install  # or npm install

# Swap schema to PostgreSQL
cp supabase/schema.postgres.prisma prisma/schema.prisma

# Set environment variables
export DATABASE_URL="postgresql://postgres.<ref>:<password>@<region>-pooler.supabase.com:6543/postgres?pgbouncer=true"
export DIRECT_URL="postgresql://postgres.<ref>:<password>@<region>-pooler.supabase.com:5432/postgres"

# Push schema to Supabase
bun run db:push
```

Either way, verify by going to **Table Editor** in Supabase — you should see ~40 tables.

---

## Step 4: Apply Row Level Security (2 min)

This is **defense-in-depth** — it protects your data even if someone tries to bypass your API and query Supabase directly.

1. In Supabase dashboard, go to **SQL Editor** → **New query**
2. Open `supabase/rls-policies.sql` from this project
3. Copy and paste the entire content
4. Click **Run**
5. Verify: go to **Database** → **Tables** — every table should show **"RLS Enabled"**

---

## Step 5: Push the code to GitHub (3 min)

1. Go to https://github.com and sign in
2. Click **+** → **New repository**
3. Name it `researcher-bd`, choose **Private** or **Public**, click **Create repository**
4. In this sandbox, you can download all the project files from the `/download/` folder
5. Upload the files to your new GitHub repo using the GitHub web UI:
   - Click **uploading an existing file**
   - Drag the entire project contents (everything except `node_modules/`, `db/`, `.next/`)
   - Add a `.gitignore` (see below) before committing
   - Click **Commit changes**

### `.gitignore` to add

```
node_modules/
.next/
db/
*.db
*.db-journal
.env
.env.local
.env.production
dev.log
server.log
.DS_Store
```

---

## Step 6: Deploy to Vercel (5 min)

1. Go to https://vercel.com and sign in with GitHub
2. Click **Add New** → **Project**
3. Find your `researcher-bd` repo and click **Import**
4. Vercel auto-detects Next.js — keep the default settings
5. **Before clicking Deploy**, expand **Environment Variables** and add each of these:

| Name | Value | Environments |
|---|---|---|
| `DATABASE_URL` | Your transaction URL from Step 2 (port 6543), append `?pgbouncer=true` | Production, Preview, Development |
| `DIRECT_URL` | Your session URL from Step 2 (port 5432) | Production, Preview, Development |
| `AUTH_SECRET` | Run `openssl rand -hex 32` locally and paste the result, or use any 32+ char random string | Production, Preview, Development |

> **Important:** Make sure the `DATABASE_URL` value ends with `?pgbouncer=true&connection_limit=1` — this prevents connection pool exhaustion on serverless.

6. Click **Deploy**
7. Wait ~2 minutes for the build to complete
8. Vercel gives you a URL like `https://researcher-bd-abc123.vercel.app` — click **Visit**

---

## Step 7: Switch the schema to PostgreSQL (1 min)

The deployed code currently has `provider = "sqlite"` in `prisma/schema.prisma`. You need to change it to PostgreSQL.

1. In your GitHub repo, click on `prisma/schema.prisma`
2. Click the **pencil icon** to edit
3. Change lines 9-12 from:

   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

   to:

   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
     directUrl = env("DIRECT_URL")
   }
   ```

4. Commit the change directly to main
5. Vercel will automatically rebuild — wait ~2 minutes

> **Alternative:** Replace the entire content of `prisma/schema.prisma` with the content of `supabase/schema.postgres.prisma` (which is already prepared for you).

---

## Step 8: Seed demo data (1 min)

1. Visit your deployed URL
2. The app automatically calls `/api/seed` on first load, which populates:
   - 4 demo users (admin, faculty, researcher, student)
   - 4 demo opportunities
   - 3 demo funding calls
   - 3 demo journals
   - 2 demo conferences
   - 2 demo datasets
   - 2 demo events
   - 2 demo organizations
   - 7 demo lessons
   - 2 demo learning paths
   - 12 demo discussion categories
   - 2 demo questions

You can verify in Supabase **Table Editor** → `User` table — you should see the demo users.

---

## Step 9: Log in and verify (1 min)

Visit your deployed URL and sign in with the demo admin account:

- **Email:** `admin@demo.researcherbd.org`
- **Password:** `admin1234`

Then navigate to **Admin** (in the user menu, top-right). You should see real metrics from your Supabase database.

Other demo accounts:

| Role | Email | Password |
|---|---|---|
| Faculty | `ayesha@demo.researcherbd.org` | `demo1234` |
| Researcher | `tanvir@demo.researcherbd.org` | `demo1234` |
| Student | `nusrat@demo.researcherbd.org` | `demo1234` |

---

## Step 10: Add your custom domain (optional, 5 min)

1. In Vercel, go to your project → **Settings** → **Domains**
2. Add your domain (e.g., `researcherbd.org`)
3. Follow Vercel's instructions to add DNS records at your domain registrar
4. Vercel provisions HTTPS automatically via Let's Encrypt

Update the `NEXT_PUBLIC_APP_URL` env var to your custom domain.

---

## Common issues

### "Can't reach database server"
- Double-check `DATABASE_URL` and `DIRECT_URL` are using the correct pooler URL (port 6543 for `DATABASE_URL`, port 5432 for `DIRECT_URL`)
- Make sure `?pgbouncer=true` is appended to `DATABASE_URL`
- Check your Supabase project isn't paused (free tier pauses after 7 days of inactivity — just click "Restore" in the dashboard)

### "PrismaClientInitializationError: schema mismatch"
- You haven't run the migration. Re-do Step 3.

### Build fails on Vercel
- Check that all three env vars are set (DATABASE_URL, DIRECT_URL, AUTH_SECRET)
- Check the build logs — most issues are missing env vars

### Cookie not being set
- Make sure `AUTH_SECRET` is set (the JWT signing fails silently without it)
- In production, cookies are `secure: true` — they only work over HTTPS (which Vercel provides)

### "Connection terminated" errors
- This means you're not using the pooler. Re-check Step 2 — you must use the **transaction mode** URL (port 6543) for `DATABASE_URL`, not the session URL.

### Database paused (free tier)
- Supabase pauses projects after 7 days of inactivity. Just visit the dashboard and click "Restore project" — takes ~30 seconds.

---

## Free tier limits

### Supabase free tier
- **500 MB** database storage (thousands of records — plenty for early stage)
- **1 GB** file storage (for avatars, logos if you add uploads)
- **50,000 monthly active users** for Auth
- **Unlimited API requests**
- **7 day inactivity pause** — visit the dashboard occasionally to keep alive, or upgrade to Pro ($25/mo) for no pause

### Vercel free tier (Hobby)
- **100 GB bandwidth** per month
- **100 GB-hours** serverless function execution
- **Unlimited deployments**
- **Custom domains** supported
- No commercial use — if monetizing, upgrade to Pro ($20/mo)

For a research community platform with a few hundred users, the free tiers are more than enough.

---

## Removing demo data (when you go live)

When you're ready to launch with real data:

1. In Supabase SQL Editor, run:
   ```sql
   -- Delete demo users and cascade to their data
   DELETE FROM "User" WHERE email LIKE '%@demo.researcherbd.org';

   -- Delete demo discovery records
   DELETE FROM "Opportunity" WHERE title LIKE '[Demo]%';
   DELETE FROM "FundingCall" WHERE title LIKE '[Demo]%';
   DELETE FROM "Journal" WHERE title LIKE '[Demo]%';
   DELETE FROM "Conference" WHERE title LIKE '[Demo]%';
   DELETE FROM "Dataset" WHERE title LIKE '[Demo]%';
   DELETE FROM "AcademicEvent" WHERE title LIKE '[Demo]%';
   DELETE FROM "Organization" WHERE name LIKE '[Demo]%';
   DELETE FROM "Question" WHERE title LIKE '[Demo]%';
   ```

2. Optionally, remove the `/api/seed` endpoint entirely (delete `src/app/api/seed/route.ts`) so no demo data is ever created.

3. Replace demo legal text (Privacy Policy, Terms of Service) with reviewed content from a lawyer.

---

## What's next?

After deployment, you may want to:

1. **Wire up the moderation workflow** — the `Submission`, `Report`, `AuditLog` tables exist; build the admin approve/reject UI (see `DEVELOPMENT_STATUS.md`)
2. **Add Crossref DOI import** — set `CROSSREF_MAILTO` env var and build the integration in `src/lib/integrations/`
3. **Enable email notifications** — set `SMTP_*` env vars and wire up email sending in the notification endpoints
4. **Add OAuth providers** — Vercel/Supabase both support GitHub/Google OAuth for sign-in
5. **Add file uploads** — use Supabase Storage for user avatars and organization logos

For questions, refer to:
- `README.md` — full project documentation
- `DEVELOPMENT_STATUS.md` — what's built, what's not, known limitations
- `supabase/migration.sql` — the full database schema
- `supabase/rls-policies.sql` — all RLS policies
