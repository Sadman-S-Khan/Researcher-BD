import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { rateLimit, getClientId, rateLimitedResponse, RATE_LIMITS } from '@/lib/rate-limit'
import { notifyMatchingUsers } from '@/lib/alerts'
import { z } from 'zod'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '20'), 100)
  const offset = Math.max(parseInt(url.searchParams.get('offset') ?? '0'), 0)
  const q = url.searchParams.get('q')?.trim()
  const domain = url.searchParams.get('domain')
  const modality = url.searchParams.get('modality')

  const where: any = {}
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
      { researchDomain: { contains: q } },
      { hostingPlatform: { contains: q } },
    ]
  }
  if (domain && domain !== 'all') where.researchDomain = { contains: domain }
  if (modality && modality !== 'all') where.dataModality = { contains: modality }

  const [items, total] = await Promise.all([
    db.dataset.findMany({ where, orderBy: { createdAt: 'desc' }, take: limit, skip: offset }),
    db.dataset.count({ where }),
  ])
  return NextResponse.json({ items, total, limit, offset })
}

const DatasetSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional().nullable(),
  authorsList: z.string().default('[]'),
  researchDomain: z.string().optional().nullable(),
  dataModality: z.string().optional().nullable(),
  fileFormat: z.string().optional().nullable(),
  sampleCount: z.string().optional().nullable(),
  license: z.string().optional().nullable(),
  doi: z.string().optional().nullable(),
  citation: z.string().optional().nullable(),
  hostingPlatform: z.string().optional().nullable(),
  downloadUrl: z.string().optional().nullable(),
  associatedPub: z.string().optional().nullable(),
  docsUrl: z.string().optional().nullable(),
})

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  // Rate limit
  const clientId = getClientId(req, 'submit-dataset')
  const rl = rateLimit(clientId, RATE_LIMITS.submission)
  if (!rl.success) return rateLimitedResponse(rl.resetAt) as NextResponse

  const body = await req.json()
  const parsed = DatasetSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
  }
  const d = await db.dataset.create({
    data: { ...parsed.data, submitterId: user.id, verification: 'submitted' },
  })

  // Personalized alerts
  notifyMatchingUsers('dataset', {
    id: d.id,
    title: d.title,
    researchDomain: d.researchDomain,
    description: d.description,
  }).catch(() => {})

  return NextResponse.json({ dataset: d })
}
