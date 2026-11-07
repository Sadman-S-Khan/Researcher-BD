import { NextRequest, NextResponse } from 'next/server'
import { db, ci } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { rateLimit, getClientId, rateLimitedResponse, RATE_LIMITS } from '@/lib/rate-limit'
import { notifyMatchingUsers } from '@/lib/alerts'
import { z } from 'zod'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '20'), 100)
  const offset = Math.max(parseInt(url.searchParams.get('offset') ?? '0'), 0)
  const q = url.searchParams.get('q')?.trim()
  const type = url.searchParams.get('type')
  const domain = url.searchParams.get('domain')
  const location = url.searchParams.get('location')
  const sort = url.searchParams.get('sort') ?? 'newest'

  const where: any = {}
  if (q) {
    where.OR = [
      { title: ci(q) },
      { description: ci(q) },
      { organization: ci(q) },
      { researchDomain: ci(q) },
    ]
  }
  if (type && type !== 'all') where.type = type
  if (domain && domain !== 'all') where.researchDomain = ci(domain)
  if (location && location !== 'all') where.location = ci(location)

  const orderBy: any =
    sort === 'deadline'
      ? { deadline: 'asc' }
      : { publishedAt: 'desc' }

  const [items, total] = await Promise.all([
    db.opportunity.findMany({
      where,
      orderBy,
      take: limit,
      skip: offset,
    }),
    db.opportunity.count({ where }),
  ])

  return NextResponse.json({ items, total, limit, offset })
}

const OppSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(10),
  type: z.string(),
  researchDomain: z.string().optional().nullable(),
  organization: z.string().optional().nullable(),
  eligibility: z.string().optional().nullable(),
  qualifications: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  fundingAmount: z.string().optional().nullable(),
  deadline: z.string().optional().nullable(),
  applicationUrl: z.string().optional().nullable(),
  sourceUrl: z.string().optional().nullable(),
})

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  // Rate limit: 10 submissions per hour per IP
  const clientId = getClientId(req, 'submit-opp')
  const rl = rateLimit(clientId, RATE_LIMITS.submission)
  if (!rl.success) {
    return rateLimitedResponse(rl.resetAt) as NextResponse
  }

  const body = await req.json()
  const parsed = OppSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
  }

  const opp = await db.opportunity.create({
    data: {
      ...parsed.data,
      deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : null,
      submitterId: user.id,
      verification: 'submitted',
    },
  })

  // Personalized alerts: notify users whose research interests match this opportunity
  notifyMatchingUsers('opportunity', {
    id: opp.id,
    title: opp.title,
    researchDomain: opp.researchDomain,
    type: opp.type,
  }).catch(() => { /* best-effort; don't fail the submission */ })

  await db.submission.create({
    data: {
      submitterId: user.id,
      entityType: 'opportunity',
      entityId: opp.id,
      status: 'pending',
    },
  })

  return NextResponse.json({ opportunity: opp })
}
