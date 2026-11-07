import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { seedDemoData } from '@/lib/seed.mjs'

// This endpoint seeds fictional demo data, clearly marked as such.
// Run once via /api/seed or via the seed button on the home page.

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const statsOnly = url.searchParams.get('stats')
  try {
    if (statsOnly) {
      const [opportunities, researchers, journals, datasets] = await Promise.all([
        db.opportunity.count(),
        db.user.count({ where: { role: { in: ['RESEARCHER', 'FACULTY'] } } }),
        db.journal.count(),
        db.dataset.count(),
      ])
      return NextResponse.json({ opportunities, researchers, journals, datasets, dbMode: process.env.NEXT_PUBLIC_DB_MODE || 'local' })
    }

    // In production the database is seeded during the build (scripts/vercel-build.mjs).
    // At runtime, seeding only runs in development or when ALLOW_DEMO_SEED=true.
    const seedAllowed = process.env.NODE_ENV !== 'production' || process.env.ALLOW_DEMO_SEED === 'true'
    if (seedAllowed) await seedDemoData(db, { adminPassword: process.env.SEED_ADMIN_PASSWORD || (process.env.NODE_ENV !== 'production' ? 'admin1234' : undefined) })
    const counts = {
      users: await db.user.count(),
      opportunities: await db.opportunity.count(),
      funding: await db.fundingCall.count(),
      journals: await db.journal.count(),
      conferences: await db.conference.count(),
      datasets: await db.dataset.count(),
      events: await db.academicEvent.count(),
      organizations: await db.organization.count(),
      lessons: await db.lesson.count(),
      questions: await db.question.count(),
    }
    return NextResponse.json({ ok: true, seeded: seedAllowed, counts })
  } catch (e: any) {
    console.error('seed error', e)
    return NextResponse.json({ error: 'Seed failed' }, { status: 500 })
  }
}
