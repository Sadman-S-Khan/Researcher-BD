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
      { title: ci(q) },
      { description: ci(q) },
      { funder: ci(q) },
    ]
  }
  if (type && type !== 'all') where.type = type

  const [items, total] = await Promise.all([
    db.fundingCall.findMany({ where, orderBy: { publishedAt: 'desc' }, take: limit, skip: offset }),
    db.fundingCall.count({ where }),
  ])
  return NextResponse.json({ items, total, limit, offset })
}
