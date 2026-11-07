import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const q = url.searchParams.get('q')?.trim()
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [], total: 0 })
  }

  const limit = 5
  const [
    opportunities, journals, conferences, datasets, events,
    researchers, organizations, laboratories, lessons, questions,
  ] = await Promise.all([
    db.opportunity.findMany({ where: { OR: [{ title: { contains: q } }, { description: { contains: q } }] }, take: limit, select: { id: true, title: true, type: true, organization: true } }),
    db.journal.findMany({ where: { title: { contains: q } }, take: limit, select: { id: true, title: true, publisher: true } }),
    db.conference.findMany({ where: { title: { contains: q } }, take: limit, select: { id: true, title: true, eventDate: true } }),
    db.dataset.findMany({ where: { OR: [{ title: { contains: q } }, { description: { contains: q } }] }, take: limit, select: { id: true, title: true, researchDomain: true } }),
    db.academicEvent.findMany({ where: { title: { contains: q } }, take: limit, select: { id: true, title: true, startDateTime: true } }),
    db.user.findMany({ where: { name: { contains: q }, isBanned: false, isPublic: true, role: { in: ['RESEARCHER', 'FACULTY'] } }, take: limit, select: { id: true, name: true, role: true, profile: true } }),
    db.organization.findMany({ where: { name: { contains: q } }, take: limit, select: { id: true, name: true, type: true } }),
    db.laboratory.findMany({ where: { name: { contains: q } }, take: limit, select: { id: true, name: true, researchAreas: true } }),
    db.lesson.findMany({ where: { OR: [{ titleEn: { contains: q } }, { titleBn: { contains: q } }] }, take: limit, select: { id: true, slug: true, titleEn: true, titleBn: true, category: true } }),
    db.question.findMany({ where: { title: { contains: q } }, take: limit, select: { id: true, title: true, tags: true } }),
  ])

  const results = [
    ...opportunities.map(x => ({ type: 'opportunity', id: x.id, title: x.title, subtitle: x.organization ?? '', path: `opportunities/${x.id}` })),
    ...journals.map(x => ({ type: 'journal', id: x.id, title: x.title, subtitle: x.publisher ?? '', path: `journals/${x.id}` })),
    ...conferences.map(x => ({ type: 'conference', id: x.id, title: x.title, subtitle: '', path: `conferences/${x.id}` })),
    ...datasets.map(x => ({ type: 'dataset', id: x.id, title: x.title, subtitle: x.researchDomain ?? '', path: `datasets/${x.id}` })),
    ...events.map(x => ({ type: 'event', id: x.id, title: x.title, subtitle: '', path: `events/${x.id}` })),
    ...researchers.map(x => ({ type: 'researcher', id: x.id, title: x.name, subtitle: x.role, path: `researchers/${x.id}` })),
    ...organizations.map(x => ({ type: 'organization', id: x.id, title: x.name, subtitle: x.type, path: `organizations/${x.id}` })),
    ...laboratories.map(x => ({ type: 'laboratory', id: x.id, title: x.name, subtitle: x.researchAreas ?? '', path: `laboratories/${x.id}` })),
    ...lessons.map(x => ({ type: 'lesson', id: x.id, title: x.titleEn, subtitle: x.category ?? '', path: `learn/${x.slug}` })),
    ...questions.map(x => ({ type: 'question', id: x.id, title: x.title, subtitle: x.tags ?? '', path: `community/${x.id}` })),
  ]

  return NextResponse.json({ results, total: results.length })
}
