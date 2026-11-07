import { NextRequest, NextResponse } from 'next/server'
import { db, ci } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { z } from 'zod'
import { FIELDS } from '@/lib/fields'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '20'), 100)
  const offset = Math.max(parseInt(url.searchParams.get('offset') ?? '0'), 0)
  const q = url.searchParams.get('q')?.trim()
  const publisher = url.searchParams.get('publisher')
  const openAccess = url.searchParams.get('openAccess')

  const where: any = {}
  if (q) {
    where.OR = [
      { title: ci(q) },
      { publisher: ci(q) },
      { subjectAreas: ci(q) },
      { scope: ci(q) },
    ]
  }
  if (publisher && publisher !== 'all') where.publisher = ci(publisher)
  if (openAccess === 'true') where.openAccess = true
  const region = url.searchParams.get('region')
  const and: any[] = []
  const bdCond = { OR: [{ website: { contains: 'banglajol.info' } }, { scope: { contains: 'published in Bangladesh' } }, { country: 'Bangladesh' }] }
  if (region === 'bd') and.push(bdCond)
  if (region === 'intl') and.push({ NOT: bdCond })

  // Field (subject area) filter
  const field = FIELDS.find(f => f.value === url.searchParams.get('field'))
  if (field) and.push({ OR: field.match.map(m => ({ subjectAreas: ci(m) })) })

  // Quartile and indexing filters
  const quartile = url.searchParams.get('quartile')
  if (quartile && ['Q1', 'Q2', 'Q3', 'Q4'].includes(quartile)) and.push({ sjrQuartile: quartile })
  if (url.searchParams.get('indexed') === 'scopus') and.push({ scopusIndexed: true })
  if (url.searchParams.get('indexed') === 'doaj') and.push({ indexingClaims: { contains: 'DOAJ' } })
  if (and.length) where.AND = and

  const sort = url.searchParams.get('sort')
  const orderBy: any = sort === 'sjr'
    ? [{ sjrScore: { sort: 'desc', nulls: 'last' } }, { title: 'asc' }]
    : sort === 'if'
      ? [{ impactFactor: { sort: 'desc', nulls: 'last' } }, { title: 'asc' }]
      : { title: 'asc' }

  const [items, total] = await Promise.all([
    db.journal.findMany({ where, orderBy, take: limit, skip: offset }),
    db.journal.count({ where }),
  ])
  return NextResponse.json({ items, total, limit, offset })
}

const JournalSchema = z.object({
  title: z.string().min(3),
  issn: z.string().optional().nullable(),
  eissn: z.string().optional().nullable(),
  publisher: z.string().optional().nullable(),
  subjectAreas: z.string().optional().nullable(),
  scope: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  doi: z.string().optional().nullable(),
  indexingClaims: z.string().optional().nullable(),
  openAccess: z.boolean().optional().nullable(),
})

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  const body = await req.json()
  const parsed = JournalSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
  }
  const j = await db.journal.create({
    data: { ...parsed.data, verification: 'listed' },
  })
  return NextResponse.json({ journal: j })
}
