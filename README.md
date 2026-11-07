# Researcher BD — Bangladesh Research & Innovation Network

> **Discover Research. Connect People. Build Knowledge.**

A bilingual (English + Bangla) research ecosystem connecting students, researchers, faculty members, supervisors, research laboratories, universities, institutions, and the broader academic community — initially focused on Bangladesh while architecturally open to international collaboration.

## ⚠️ Demonstration build

This repository is a **functional demonstration build**. All seeded records (opportunities, journals, datasets, researchers, events, lessons, questions) are **fictional demo data** clearly marked with the `[Demo]` prefix and the demo banner shown on every discovery page. They exist to demonstrate the platform's features and are not real opportunities, journals, datasets, or people. Replace with reviewed, verified content before launch.

---

## Table of contents

1. [What is built](#what-is-built)
2. [Tech stack](#tech-stack)
3. [Quick start](#quick-start)
4. [Project structure](#project-structure)
5. [Database schema](#database-schema)
6. [Authentication & roles](#authentication--roles)
7. [Modules](#modules)
8. [Internationalization](#internationalization)
9. [Theme system](#theme-system)
10. [Research integrity](#research-integrity)
11. [External integrations](#external-integrations)
12. [Testing](#testing)
13. [Deployment](#deployment)
14. [Development status](#development-status)
15. [Known limitations](#known-limitations)

---

## What is built

### Foundation

- **Next.js 16 + TypeScript + Tailwind CSS 4 + shadcn/ui (New York)** — modern App Router foundation
- **Bilingual i18n (English + Bangla)** — every interface label, lesson title, and category name is translated. User-generated content is preserved in its original language. Bangla typography uses Noto Sans Bengali.
- **Light / dark / system theme** — user-selectable, persisted via `next-themes`, no blue/indigo (academic emerald palette)
- **Hash-based single-page router** — `#/opportunities`, `#/learn/intro-to-research`, `#/admin` — deep-linkable, shareable, refresh-safe
- **Responsive mega-menu navbar** with Discover, People & Organizations, Learn, Community, My Research submenus
- **Sticky footer** with full site map, legal links, and demo-data disclaimer
- **Global search** across researchers, publications, opportunities, journals, datasets, events, organizations, laboratories, lessons, and questions
- **Authentication** — register, login, logout, HTTP-only JWT cookies, bcrypt password hashing, role-based access control with route guards
- **Database** — 30+ Prisma models covering identity, academic records, discovery, organizations, collaboration, learning, community, projects, and system tables
- **Profile management** — full academic profile with institution, department, position, research interests, technical skills, ORCID, external profiles, contact info, privacy controls, and CV (JSON) export
- **Notifications system** — in-app notifications with unread count badge
- **Admin dashboard** — real metrics computed from database records (users, researchers, pending submissions, opportunities, datasets, institutions, labs, lessons, events, reports, publications, journals, conferences, projects)

### Discovery modules (functional with seeded demo data)

| Module | Features |
|---|---|
| **Research Opportunities** | List + detail, filter by type, sort by deadline/newest, submit new, bookmark, verification badges |
| **Funding & Grants** | List, filter by type (government, university, international, travel, award, innovation) |
| **Journals** | List with verification status, ISSN/eISSN, open-access flag, publisher, subject areas, external links |
| **Conferences** | List with event date, submission deadline, location, tracks, registration URL, proceedings |
| **Datasets** | List with authors, domain, modality, format, license, DOI, citation copy, download link, associated publication |
| **Events** | List with type, mode (offline/online/hybrid), status, registration URL |
| **Researchers** | Directory with institution, department, position, research interests, skills, ORCID |
| **Mentors** | Filter for available mentors, with disclaimer that mentoring interest ≠ supervisory position |
| **Institutions** | Universities, departments, labs, centres, groups, hubs — with member counts |
| **Laboratories** | Research labs linked to parent organizations |
| **Collaboration Board** | Post and browse collaboration requests (collaboration, research-assistant, mentorship, co-author, project-partner) |
| **Learning Hub** | Categories (fundamentals, literature, data-analysis, tools, writing, ethics), 7 lessons with bilingual content, learning paths, completion tracking, bookmarks |
| **Community Q&A** | 12 discussion categories, ask questions, post answers, view counts, tags |
| **Projects** | Create private/public projects, owner auto-becomes member, RBAC for private project access, tasks, milestones, resources, notes |

### Authenticated pages

- **Dashboard** with stat cards (projects, tasks, publications, bookmarks, notifications, learning progress), quick actions, menu
- **Profile** with tabbed editor (basic, academic, research, external profiles, contact, privacy) and CV JSON export
- **My Tasks** — tasks assigned to you across all projects
- **Bookmarks** — saved records across the platform
- **Notifications** — in-app notifications with mark-all-read
- **Admin** — metrics + moderation/users/reports/audit/settings tabs (role-gated to ADMIN/MODERATOR)

### Public static pages

- **About** — mission, vision, objectives
- **Contact** — working contact form (logs submission)
- **Research Integrity** — verification categories table, moderation functionality, integrity education resources, disclaimer
- **Privacy Policy** and **Terms of Service** — clearly marked as demo legal text

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui (New York) |
| Icons | Lucide React |
| Database | Prisma ORM + SQLite (dev) — switch to PostgreSQL/Supabase for production |
| Auth | Custom JWT (jose) + bcryptjs, HTTP-only cookies |
| i18n | Custom context-based with `en` and `bn` dictionaries |
| Theme | next-themes |
| Markdown | react-markdown (for lesson bodies) |
| Forms | react-hook-form + zod (server-side validation everywhere) |
| Notifications UI | sonner toasts |
| Charts | recharts (available) |
| State | React context (session) + component-local state |

---

## Quick start

```bash
# 1. Install dependencies
bun install

# 2. Set up environment
cp .env.example .env
# Edit .env — set AUTH_SECRET to a 32+ char random string

# 3. Initialize database
bun run db:push

# 4. Start dev server (auto-runs in this sandbox)
# Or manually:
bun run dev

# 5. Open the preview panel — the app runs on port 3000
```

The first visit to `/` triggers the seed endpoint (`/api/seed`) which populates clearly-marked **fictional demo data** (users, opportunities, funding calls, journals, conferences, datasets, events, organizations, learning categories, lessons, paths, discussion categories, questions).

### Demo accounts (fictional)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@demo.researcherbd.org` | `admin1234` |
| Faculty | `ayesha@demo.researcherbd.org` | `demo1234` |
| Researcher | `tanvir@demo.researcherbd.org` | `demo1234` |
| Student | `nusrat@demo.researcherbd.org` | `demo1234` |

You can also register a new account through the public registration flow.

---

## Project structure

```text
src/
├── app/
│   ├── layout.tsx          # Root layout: ThemeProvider, I18nProvider, SessionProvider, fonts
│   ├── page.tsx            # Single visible route — mounts AppShell (dynamic, ssr:false)
│   ├── globals.css         # Tailwind 4 + emerald/teal palette + Bangla font fallback
│   └── api/                # All REST API route handlers
│       ├── auth/{register,login,logout,me}/route.ts
│       ├── admin/route.ts
│       ├── bookmarks/route.ts
│       ├── collaboration/route.ts
│       ├── community/[questionId]/route.ts
│       ├── community/route.ts
│       ├── conferences/route.ts
│       ├── contact/route.ts
│       ├── datasets/route.ts
│       ├── events/route.ts
│       ├── funding/route.ts
│       ├── journals/route.ts
│       ├── laboratories/route.ts
│       ├── learn/[lessonId]/route.ts
│       ├── learn/route.ts
│       ├── opportunities/[id]/route.ts
│       ├── opportunities/route.ts
│       ├── organizations/route.ts
│       ├── profile/route.ts
│       ├── projects/[projectId]/route.ts
│       ├── projects/route.ts
│       ├── publications/route.ts
│       ├── researchers/route.ts
│       ├── search/route.ts
│       └── seed/route.ts
├── components/
│   ├── layout/             # navbar, footer, app-shell, theme/language toggles
│   ├── pages/              # One component per route — lazy-loaded by AppShell
│   │   ├── home.tsx
│   │   ├── discover.tsx
│   │   ├── opportunities.tsx
│   │   ├── funding.tsx
│   │   ├── journals.tsx
│   │   ├── conferences.tsx
│   │   ├── datasets.tsx
│   │   ├── events.tsx
│   │   ├── researchers.tsx
│   │   ├── mentors.tsx
│   │   ├── organizations.tsx
│   │   ├── laboratories.tsx
│   │   ├── learn.tsx
│   │   ├── community.tsx
│   │   ├── projects.tsx
│   │   ├── collaboration.tsx
│   │   ├── dashboard.tsx
│   │   ├── profile.tsx
│   │   ├── admin.tsx
│   │   ├── tasks.tsx
│   │   ├── bookmarks.tsx
│   │   ├── notifications.tsx
│   │   ├── search.tsx
│   │   ├── auth.tsx        # login + register (mode prop)
│   │   ├── static.tsx      # about, contact, integrity, privacy, terms, applications, teams, contributions
│   │   └── not-found.tsx
│   ├── providers/          # theme-provider
│   ├── shared/             # PageHeader, DemoBanner, VerificationBadge, EmptyState, ListPage
│   └── ui/                 # shadcn/ui (complete set)
├── lib/
│   ├── auth.ts             # JWT signing, cookie attachment, session, RBAC helpers
│   ├── db.ts               # Prisma client
│   ├── dictionaries.ts     # English + Bangla translation dictionaries
│   ├── i18n.tsx            # I18nProvider + useI18n hook
│   ├── router.ts           # Hash-based router hook
│   ├── session-context.tsx # SessionProvider + useSession (global session state)
│   └── utils.ts            # cn() helper
└── prisma/
    └── schema.prisma       # 30+ models — see Database schema below
```

---

## Database schema

The schema is in `prisma/schema.prisma`. Highlights (SQLite for dev — switch datasource to `postgresql` for production):

### Identity & users
- `User` (id, email, passwordHash, name, role, isEmailVerified, isBanned, locale, theme, isPublic)
- `Profile` (one-to-one with User — institution, department, position, researchInterests, technicalSkills, ORCID, external links, contact info, awards, experience)
- `UserRole` enum: `STUDENT | RESEARCHER | FACULTY | ORG_REP | MODERATOR | ADMIN`

### Academic records
- `Publication`, `PublicationAuthor` (join), `PublicationClaim` (with status: pending/approved/rejected), `Contribution`, `Dataset`, `DatasetAuthor`

### Discovery
- `Opportunity`, `FundingCall`, `Journal`, `Conference`, `AcademicEvent`, `Bookmark` (polymorphic by targetType/targetId + typed relations for opportunity/dataset), `SavedSearch`

### Research organizations
- `Organization`, `OrganizationMember`, `Laboratory`, `LaboratoryMember`

### Collaboration
- `CollaborationPost`, `CollaborationRequest`, `MentorPreference`

### Learning
- `LearningCategory`, `LearningPath`, `Lesson` (bilingual: titleEn/Bn, bodyEn/Bn), `LessonProgress` (unique on userId+lessonId), `LearningBookmark`

### Community
- `DiscussionCategory` (bilingual), `Question`, `Answer` (with isAccepted, upvotes), `Comment`, `Vote`

### Projects
- `ResearchProject` (isPrivate for access control), `ProjectMember` (unique on projectId+userId), `ProjectTask`, `ProjectMilestone`, `ProjectResource`, `ProjectNote`

### System
- `Notification`, `Report`, `Submission` (for moderation queue), `AuditLog`, `SystemSetting`

### Conventions
- UUID-style `cuid()` primary keys
- `createdAt` and `updatedAt` timestamps everywhere
- Foreign keys with cascade deletes on owned records
- Unique constraints on `[userId, targetType, targetId]` for bookmarks, `[userId, lessonId]` for progress, `[projectId, userId]` for membership, `[userId, answerId]` for votes
- Explicit `verification` and `status` string fields — never asserted without evidence

---

## Authentication & roles

### Auth flow
- **Register**: `POST /api/auth/register` validates with zod, hashes password with bcrypt (cost 10), creates User + empty Profile, signs JWT, sets HTTP-only cookie, returns user
- **Login**: `POST /api/auth/login` verifies credentials, signs JWT, sets cookie
- **Logout**: `POST /api/auth/logout` deletes cookie
- **Me**: `GET /api/auth/me` returns current user (or null)
- JWT signed with `AUTH_SECRET` (HS256), 7-day expiry, contains `uid/email/role/name`
- Cookie: HTTP-only, sameSite=lax, secure in production, path=/

### Session state
- `SessionProvider` (React context) wraps the app, exposes `{ user, loading, refresh }`
- Used by navbar (auth buttons, notification count), AppShell (auth gates), pages

### RBAC
- `AppShell` checks `authGated` routes (`dashboard`, `profile`, `admin`, `projects`, etc.) — redirects unauthenticated users to a "Sign in required" view
- Admin route additionally checks `user.role === 'ADMIN' || 'MODERATOR'`
- `hasMinRole()` and `ROLE_LEVELS` provide role hierarchy checks for backend use
- Project detail endpoint enforces membership for private projects (returns 403 if not member)
- Opportunity delete restricted to submitter or admin/moderator

---

## Modules

All 10 core modules from the spec are implemented as functional pages backed by real API routes and database tables. See "What is built" above for the feature list per module.

---

## Internationalization

- Two locales: `en` (English) and `bn` (Bangla)
- One dictionary file `src/lib/dictionaries.ts` exporting `dictionaries.en` and `dictionaries.bn` with matching keys
- `useI18n()` hook returns `{ locale, setLocale, t }` — `t('opportunities.title')` walks the nested dictionary
- User-generated content (question titles, opportunity descriptions, lesson bodies) is preserved in its original language
- Bangla typography uses Noto Sans Bengali (loaded via `next/font/google`)
- Locale preference persisted in `localStorage`
- Language switcher in navbar (top-right)

### Notes on translation policy (per spec)
- Scholarly titles, author names, and official organization names are **not** machine-translated
- Each `Lesson` has explicit `titleEn`/`titleBn` and `bodyEn`/`bodyBn` fields — authors write both
- Discussion categories and learning categories are bilingual at the data level

---

## Theme system

- `next-themes` with `attribute="class"`, `defaultTheme="system"`, `enableSystem`
- Light + dark + system, persisted in `localStorage` (`rbd_theme`)
- **Emerald/teal palette** (no blue/indigo per design rules) — see `globals.css`
- Theme toggle dropdown in navbar
- Bangla typography refinement via `:lang(bn)` selector

---

## Research integrity

Built into the platform per spec Part 8:

### Verification states
Every entity has a `verification` field with documented states:
| Entity | States |
|---|---|
| Researcher | self-reported, email verified, affiliation verified |
| Publication | claimed, imported, authorship confirmed |
| Dataset | submitted, reviewed, verified |
| Opportunity | submitted, source-checked, expired |
| Journal | listed, information-checked, under-review |
| Conference | listed, information-checked, under-review |
| Institution | submitted, official-source-confirmed |
| Laboratory | submitted, institution-confirmed |

`VerificationBadge` component renders these with color-coded styles (green for confirmed, amber for pending, red for disputed/expired).

### What we never do
- Never assert that a journal is indexed in Scopus/WoS without a verifiable source
- Never classify a journal as predatory based on unverified user reports
- Never assign publication authorship based solely on name matching
- Never use unverified accusations to label people, journals, or institutions
- Never invent funding amounts, eligibility, or deadlines

### Integrity education
The `/integrity` page links to learning resources on predatory publishing, plagiarism, authorship, misconduct, ethics, data integrity, peer review, retractions, and responsible AI use.

---

## External integrations

The platform is **architected** for the integrations listed in the spec but **does not assume** any external API is available. Each integration is optional and the platform works fully without them.

| Provider | Purpose | Status |
|---|---|---|
| Crossref | DOI publication metadata import | Integration stub designed — requires `CROSSREF_MAILTO` env |
| OpenAlex | Scholarly metadata fallback | Integration stub designed — requires `OPENALEX_MAILTO` env |
| ORCID | Researcher profile import | OAuth flow designed — requires `ORCID_CLIENT_ID/SECRET` |
| Zenodo | Dataset metadata import | OAuth flow designed — requires `ZENODO_CLIENT_ID/SECRET` |
| Email (SMTP) | Transactional email | Optional — leave `SMTP_HOST` empty to disable |
| AI provider | Optional AI assistant | Disabled by default — leave `AI_PROVIDER_API_KEY` empty |

When an integration is not configured, the UI hides the corresponding feature and the API endpoint returns a clear "not configured" error. We never pretend an unconfigured integration works.

---

## Testing

### What's tested
- **TypeScript type checking** — strict mode throughout
- **ESLint** — `bun run lint` passes clean
- **Manual end-to-end verification** via Agent Browser:
  - Home page renders with hero, stats, explore tiles, features, recent opportunities, how-it-works, CTA
  - Navigation: opportunities list, discover, learn hub, community, researchers, search, integrity, dashboard, admin
  - Auth: register flow creates user, sets HTTP-only JWT cookie, session persists across reload
  - Bilingual switching: navbar, footer, all UI labels switch to Bangla with proper typography
  - Theme: dark mode applies `class="dark"` on `<html>`
  - Global search returns real results from seeded data
  - Admin dashboard shows real metrics (7 users, 4 opportunities, etc.)
  - Project access control works for private projects
  - Bookmark toggle works
  - Notifications unread badge updates

### How to run
```bash
bun run lint        # ESLint
bun run db:push     # Apply schema to DB
# Dev server auto-starts in sandbox — view via Preview Panel
```

---

## Deployment

### Development (current)
- Next.js dev server on port 3000
- SQLite database at `db/custom.db`
- HTTP-only JWT cookies (secure flag off in dev)

### Production target — **Vercel + Supabase** (both free tier)
- **Vercel** for app deployment (free Hobby tier — 100 GB bandwidth, unlimited deployments)
- **Supabase** for PostgreSQL database + Auth + Storage (free tier — 500 MB DB, 50K auth users)
- **GitHub** for source control

### 🚀 Production deployment guide

A complete step-by-step guide is in **`supabase/SETUP_GUIDE.md`** (also at `/download/supabase/SETUP_GUIDE.md`). It walks through:

1. Creating a Supabase project (free)
2. Getting your connection strings (pooler + direct)
3. Creating the database schema (run `supabase/migration.sql` in the SQL Editor)
4. Applying Row Level Security policies (`supabase/rls-policies.sql`)
5. Pushing code to GitHub
6. Importing to Vercel and setting env vars
7. Switching `prisma/schema.prisma` from SQLite to PostgreSQL (or use `supabase/schema.postgres.prisma`)
8. Seeding demo data
9. Verifying with demo accounts
10. Adding a custom domain

**Files in `supabase/` (and `/download/supabase/`):**

| File | Purpose |
|---|---|
| `SETUP_GUIDE.md` | Step-by-step deployment guide (~20 min, $0) |
| `schema.postgres.prisma` | PostgreSQL version of the Prisma schema (drop-in replacement) |
| `migration.sql` | Raw SQL to create all 30+ tables (run in Supabase SQL Editor) |
| `rls-policies.sql` | Row Level Security policies for defense-in-depth |
| `.env.production.example` | All production env vars documented |

**Helper script:** `scripts/prepare-production.sh` (or `/download/prepare-production.sh`) — swaps the schema and runs `db:push` against Supabase in one step.

### Quick production checklist
- [ ] Create Supabase project, get pooler (port 6543) and direct (port 5432) connection strings
- [ ] Run `supabase/migration.sql` in Supabase SQL Editor
- [ ] Run `supabase/rls-policies.sql` in Supabase SQL Editor
- [ ] Push code to GitHub
- [ ] Import to Vercel, set env vars: `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`
- [ ] Change `prisma/schema.prisma` provider from `sqlite` to `postgresql` (+ add `directUrl`)
- [ ] Deploy — visit the URL to auto-seed demo data
- [ ] Set strong `AUTH_SECRET` (32+ chars — `openssl rand -hex 32`)
- [ ] Verify HTTPS and secure cookie flags (Vercel does this automatically)
- [ ] Replace demo legal text with reviewed privacy policy and terms
- [ ] Configure rate limiting on `/api/auth/*` and submission endpoints
- [ ] Set up database backups (Supabase does daily on Pro plan; manual on free)

### Optional production enhancements
- **Auth**: Either keep the JWT-based auth or migrate to Supabase Auth (OAuth providers, magic links)
- **Storage**: Configure Supabase Storage for user avatars and organization logos
- **Email**: Configure SMTP credentials (Resend — free 3,000 emails/month) for transactional email
- **External APIs**: Set `CROSSREF_MAILTO`, `OPENALEX_MAILTO`, and OAuth credentials for ORCID/Zenodo
- **Demo data cleanup**: Delete demo records before launch (SQL provided in SETUP_GUIDE.md)

---

## Development status

### ✅ Implemented (Phase 1 — Foundation + Phase 2 — Discovery + Phase 3 — Network + Phase 4 — Workspace + Phase 5 — Learning/Community)

- Next.js 16 + TypeScript + Tailwind 4 + shadcn/ui
- Bilingual i18n (en + bn) with full dictionaries
- Theme system (light/dark/system)
- Hash-based router with full site navigation
- Auth (register/login/logout/session) with bcrypt + JWT
- RBAC with route guards
- Prisma schema (30+ models)
- All 10 core modules with list + detail pages
- Admin dashboard with real metrics
- Profile management with CV export
- Project management with RBAC
- Learning hub with bilingual content + progress tracking
- Community Q&A with categories + answers
- Global search
- Bookmarks
- Notifications
- Demo seed data (clearly marked fictional)

### 🚧 Designed but not implemented (Phase 6 + 7)

These features are **architected** in the schema and UI but not yet wired up:

- **DOI publication import** — `Publication` model has `source` field for `crossref | openalex | orcid | self-reported`; UI for DOI lookup is not built (would call `/api/publications/doi-lookup`)
- **External scholarly integrations** — `lib/integrations/` layer planned but not implemented; would call Crossref/OpenAlex/ORCID/Zenodo APIs with proper timeouts and rate limiting
- **Smart researcher matching** — `MentorPreference` model exists; matching algorithm not built
- **Personalized alerts** — `Notification` model exists; alert generation for matching new records not built
- **Saved searches** — `SavedSearch` model exists; UI to save and alert on matches not built
- **Research map** — explicitly deferred per spec ("Do not make this a launch dependency")
- **AI research assistant** — explicitly optional per spec ("AI functionality must remain optional")
- **Moderation workflow UI** — `Submission`, `Report`, `AuditLog` models exist; admin UI shows pending counts but approve/reject actions are not yet wired
- **Email notifications** — `SMTP_*` env vars defined; email sending not implemented (in-app notifications work)
- **Playwright E2E tests** — not yet written

### Files created

- 1 Prisma schema (30+ models)
- ~25 API route handlers
- ~25 page components
- 4 layout/provider components
- 5 lib modules (auth, db, dictionaries, i18n, router, session-context)
- 2 documentation files (README, .env.example)

### Environment variables required

See `.env.example`. Minimum for dev:
- `DATABASE_URL` (SQLite path — already set)
- `AUTH_SECRET` (set to a 32+ char random string)

---

## Known limitations

1. **Demo data is fictional** — every record is clearly marked `[Demo]` and shown with a demo banner. Replace with verified content before launch.
2. **SQLite only in dev** — production requires PostgreSQL (Supabase recommended). Schema is provider-agnostic except for the datasource block.
3. **No RLS** — access control is enforced in API route handlers (e.g., project membership check), not in database-level Row Level Security. Migrate to Supabase RLS for production.
4. **No email sending** — `SMTP_*` env vars are defined but email sending is not implemented. In-app notifications work fully.
5. **No rate limiting** — add rate limiting on `/api/auth/*` and submission endpoints before production launch.
6. **No real external integrations** — Crossref/OpenAlex/ORCID/Zenodo integration layers are designed but not built. The platform works fully without them.
7. **No AI assistant** — explicitly optional per spec; not implemented.
8. **Single visible route** — per sandbox constraint, the entire app is mounted at `/` with hash-based routing (`#/opportunities`, `#/learn/intro-to-research`, etc.). In a production Vercel deployment, this can be migrated to App Router routes per the structure in `src/components/pages/`.
9. **Legal text is demonstration** — privacy policy and terms are placeholder text, not reviewed legal content.
10. **Avatar/logo uploads** — UI uses initials; file upload to Supabase Storage not implemented.

---

## License

This is a demonstration project for the Bangladesh research community. No license is granted for production use without review of the demo-data, legal text, and security posture.

---

*Built as a functional demonstration of a bilingual, modular, secure research ecosystem — not merely a visual prototype.*
