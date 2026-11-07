import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '20'), 100)
  const offset = Math.max(parseInt(url.searchParams.get('offset') ?? '0'), 0)
  const q = url.searchParams.get('q')?.trim()
  const where: any = {}
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { organizer: { contains: q } },
      { location: { contains: q } },
      { researchTracks: { contains: q } },
    ]
  }
  const [items, total] = await Promise.all([
    db.conference.findMany({ where, orderBy: { eventDate: 'asc' }, take: limit, skip: offset }),
    db.conference.count({ where }),
  ])
  return NextResponse.json({ items, total, limit, offset })
}
