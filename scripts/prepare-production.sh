#!/usr/bin/env bash
# ============================================================================
# Researcher BD — Prepare for Production (Supabase + Vercel)
# ============================================================================
# This script switches the Prisma schema from SQLite (dev) to PostgreSQL
# (production), then runs db:push against your Supabase database.
#
# Run this ONCE, locally, before deploying to Vercel.
#
# Prerequisites:
#   1. Created a Supabase project (see supabase/SETUP_GUIDE.md)
#   2. Set these env vars in your shell (or .env):
#        DATABASE_URL=postgresql://...@...pooler.supabase.com:6543/postgres?pgbouncer=true
#        DIRECT_URL=postgresql://...@...pooler.supabase.com:5432/postgres
#        AUTH_SECRET=<32+ char random string>
#
# Usage:
#   bash scripts/prepare-production.sh
# ============================================================================

set -e

cd "$(dirname "$0")/.."

echo ""
echo "=========================================="
echo "  Researcher BD — Production Preparation"
echo "=========================================="
echo ""

# 1. Verify env vars
if [ -z "$DATABASE_URL" ]; then
  echo "✗ DATABASE_URL is not set."
  echo "  Set it to your Supabase pooler URL (port 6543):"
  echo "  export DATABASE_URL='postgresql://postgres.<ref>:<password>@<region>-pooler.supabase.com:6543/postgres?pgbouncer=true'"
  exit 1
fi

if [ -z "$DIRECT_URL" ]; then
  echo "✗ DIRECT_URL is not set."
  echo "  Set it to your Supabase direct URL (port 5432):"
  echo "  export DIRECT_URL='postgresql://postgres.<ref>:<password>@<region>-pooler.supabase.com:5432/postgres'"
  exit 1
fi

if [ -z "$AUTH_SECRET" ]; then
  echo "⚠ AUTH_SECRET is not set. Generating one for you..."
  AUTH_SECRET=$(openssl rand -hex 32)
  echo "  AUTH_SECRET=$AUTH_SECRET"
  echo "  Save this value and set it in Vercel env vars."
fi

# 2. Confirm
echo "Current settings:"
echo "  DATABASE_URL = ${DATABASE_URL%%:*}://...@${DATABASE_URL##*@}"
echo "  DIRECT_URL   = ${DIRECT_URL%%:*}://...@${DIRECT_URL##*@}"
echo ""
read -p "Swap schema to PostgreSQL and run db:push? (y/N) " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "Aborted."
  exit 0
fi

# 3. Back up current schema
echo ""
echo "→ Backing up current schema to prisma/schema.sqlite.backup.prisma"
cp prisma/schema.prisma prisma/schema.sqlite.backup.prisma

# 4. Swap to PostgreSQL schema
echo "→ Switching schema to PostgreSQL"
cp supabase/schema.postgres.prisma prisma/schema.prisma

# 5. Push schema to Supabase
echo "→ Running prisma db push against Supabase..."
bun run db:push

# 6. Regenerate Prisma client
echo "→ Regenerating Prisma client..."
bun run db:generate

echo ""
echo "=========================================="
echo "  ✓ Schema pushed to Supabase"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. Apply RLS policies in Supabase SQL Editor (supabase/rls-policies.sql)"
echo "  2. Push code to GitHub"
echo "  3. Import to Vercel, set env vars (DATABASE_URL, DIRECT_URL, AUTH_SECRET)"
echo "  4. Deploy"
echo "  5. Visit the deployed URL — /api/seed will populate demo data"
echo ""
echo "To revert to SQLite for local dev:"
echo "  cp prisma/schema.sqlite.backup.prisma prisma/schema.prisma"
echo "  bun run db:push"
echo ""
