import { NextRequest, NextResponse } from 'next/server'
import { db, ci } from '@/lib/db'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '20'), 100)
  const offset = Math.max(parseInt(url.searchParams.get('offset') ?? '0'), 0)
  const q = url.searchParams.get('q')?.trim()
  const type = url.searchParams.get('type')

  const where: any = {}
  if (q) {
    where.OR = [
      { name: ci(q) },
      { description: ci(q) },
      { researchAreas: ci(q) },
      { location: ci(q) },
    ]
  }
  if (type && type !== 'all') where.type = type

  const [items, total] = await Promise.all([
    db.organization.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: { _count: { select: { members: true, laboratories: true } } },
    }),
    db.organization.count({ where }),
  ])
  return NextResponse.json({ items, total, limit, offset })
}
