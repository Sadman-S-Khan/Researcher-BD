import { NextRequest, NextResponse } from 'next/server'
import { db, ci } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { z } from 'zod'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '20'), 100)
  const offset = Math.max(parseInt(url.searchParams.get('offset') ?? '0'), 0)
  const q = url.searchParams.get('q')?.trim()
  const type = url.searchParams.get('type')
  const status = url.searchParams.get('status')

  const where: any = {}
  if (q) {
    where.OR = [
      { title: ci(q) },
      { description: ci(q) },
      { organizer: ci(q) },
      { location: ci(q) },
    ]
  }
  if (type && type !== 'all') where.eventType = type
  if (status && status !== 'all') where.status = status

  const [items, total] = await Promise.all([
    db.academicEvent.findMany({
      where,
      orderBy: { startDateTime: 'asc' },
      take: limit,
      skip: offset,
    }),
    db.academicEvent.count({ where }),
  ])
  return NextResponse.json({ items, total, limit, offset })
}

const EventSchema = z.object({
  title: z.string().min(5),
  description: z.string().optional().nullable(),
  organizer: z.string().optional().nullable(),
  eventType: z.string(),
  startDateTime: z.string().optional().nullable(),
  endDateTime: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  mode: z.string().default('offline'),
  registrationDeadline: z.string().optional().nullable(),
  registrationUrl: z.string().optional().nullable(),
  sourceUrl: z.string().optional().nullable(),
})

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  const body = await req.json()
  const parsed = EventSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
  }
  // Determine status from start date
  const startDate = parsed.data.startDateTime ? new Date(parsed.data.startDateTime) : null
  let status = 'upcoming'
  const now = new Date()
  if (startDate) {
    if (startDate > now) status = 'upcoming'
    else {
      const endDate = parsed.data.endDateTime ? new Date(parsed.data.endDateTime) : null
      if (endDate && endDate > now) status = 'ongoing'
      else status = 'ended'
    }
  }
  const ev = await db.academicEvent.create({
    data: {
      ...parsed.data,
      startDateTime: parsed.data.startDateTime ? new Date(parsed.data.startDateTime) : null,
      endDateTime: parsed.data.endDateTime ? new Date(parsed.data.endDateTime) : null,
      registrationDeadline: parsed.data.registrationDeadline ? new Date(parsed.data.registrationDeadline) : null,
      submitterId: user.id,
      status,
    },
  })
  return NextResponse.json({ event: ev })
}
