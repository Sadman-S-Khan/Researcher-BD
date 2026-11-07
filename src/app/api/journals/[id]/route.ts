import { NextRequest, NextResponse } from 'next/server'
import { db, ci } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { z } from 'zod'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const journal = await db.journal.findUnique({ where: { id } })
  if (!journal) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const user = await getCurrentUser()
  let bookmarked = false
  if (user) {
    const b = await db.bookmark.findUnique({
      where: {
        userId_targetType_targetId: {
          userId: user.id,
          targetType: 'journal',
          targetId: journal.id,
        },
      },
    })
    bookmarked = !!b
  }

  // Related journals by publisher or subject area
  const related = await db.journal.findMany({
    where: {
      id: { not: journal.id },
      OR: [
        ...(journal.publisher ? [{ publisher: journal.publisher }] : []),
        ...(journal.subjectAreas ? [{ subjectAreas: ci(journal.subjectAreas.split(',')[0]?.trim() ?? '') }] : []),
      ],
    },
    take: 4,
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ journal, bookmarked, related })
}

// Admins and moderators can record journal metrics (with year and source) and correct verification.
const metricsSchema = z.object({
  impactFactor: z.number().min(0).max(1000).nullable().optional(),
  impactFactorYear: z.number().int().min(1990).max(2100).nullable().optional(),
  citeScore: z.number().min(0).max(1000).nullable().optional(),
  citeScoreYear: z.number().int().min(1990).max(2100).nullable().optional(),
  sjrScore: z.number().min(0).max(1000).nullable().optional(),
  sjrQuartile: z.enum(['Q1', 'Q2', 'Q3', 'Q4']).nullable().optional(),
  hIndex: z.number().int().min(0).max(100000).nullable().optional(),
  metricsYear: z.number().int().min(1990).max(2100).nullable().optional(),
  scopusIndexed: z.boolean().nullable().optional(),
  metricsNote: z.string().max(1000).nullable().optional(),
  issn: z.string().max(20).nullable().optional(),
  eissn: z.string().max(20).nullable().optional(),
  publisher: z.string().max(300).nullable().optional(),
  subjectAreas: z.string().max(1000).nullable().optional(),
  verification: z.enum(['listed', 'information-checked', 'source-checked', 'under-review']).optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.role !== 'ADMIN' && user.role !== 'MODERATOR') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const parsed = metricsSchema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid metrics' }, { status: 400 })
  const exists = await db.journal.findUnique({ where: { id }, select: { id: true } })
  if (!exists) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const journal = await db.journal.update({ where: { id }, data: { ...parsed.data, lastCheckedAt: new Date() } })
  await db.auditLog.create({ data: { actorId: user.id, action: 'journal.metrics_update', targetType: 'journal', targetId: id, metadata: JSON.stringify(parsed.data) } }).catch(() => {})
  return NextResponse.json({ journal })
}
