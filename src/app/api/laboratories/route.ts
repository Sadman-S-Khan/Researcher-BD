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
      { name: { contains: q } },
      { description: { contains: q } },
      { researchAreas: { contains: q } },
      { location: { contains: q } },
    ]
  }
  const [items, total] = await Promise.all([
    db.laboratory.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: { organization: true, _count: { select: { members: true } } },
    }),
    db.laboratory.count({ where }),
  ])
  return NextResponse.json({ items, total, limit, offset })
}
