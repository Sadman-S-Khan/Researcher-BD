import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  const user = await getCurrentUser()
  if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const [
    users, researchers, pendingSubmissions, opportunities, datasets,
    institutions, laboratories, lessons, events, reports, publications,
    journals, conferences, projects,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { role: { in: ['RESEARCHER', 'FACULTY'] } } }),
    db.submission.count({ where: { status: 'pending' } }),
    db.opportunity.count(),
    db.dataset.count(),
    db.organization.count(),
    db.laboratory.count(),
    db.lesson.count(),
    db.academicEvent.count(),
    db.report.count({ where: { status: 'open' } }),
    db.publication.count(),
    db.journal.count(),
    db.conference.count(),
    db.researchProject.count(),
  ])

  return NextResponse.json({
    metrics: {
      users, researchers, submissions: pendingSubmissions, opportunities,
      datasets, institutions, laboratories, learning: lessons, events,
      reports, publications, journals, conferences, projects,
    },
  })
}
