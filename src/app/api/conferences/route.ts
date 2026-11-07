import { NextRequest, NextResponse } from 'next/server'
import { db, ci } from '@/lib/db'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '20'), 100)
  const offset = Math.max(parseInt(url.searchParams.get('offset') ?? '0'), 0)
  const q = url.searchParams.get('q')?.trim()
  const where: any = {}
  if (q) {
    where.OR = [
      { title: ci(q) },
      { organizer: ci(q) },
      { location: ci(q) },
      { researchTracks: ci(q) },
    ]
  }
  const DAY = 86400000
  const today = new Date(Date.now() - DAY) // include events/deadlines from today
  const inDays = (n: number) => new Date(Date.now() + n * DAY)
  const and: any[] = []

  // Hide conferences that have already happened unless ?past=1
  if (url.searchParams.get('past') !== '1') {
    and.push({ OR: [{ eventDate: null }, { eventDate: { gte: today } }] })
  }

  // Submission deadline filter
  const deadline = url.searchParams.get('deadline')
  if (deadline === 'open') and.push({ submissionDeadline: { gte: today } })
  else if (deadline === '30' || deadline === '90') and.push({ submissionDeadline: { gte: today, lte: inDays(Number(deadline)) } })
  else if (deadline === 'passed') and.push({ submissionDeadline: { lt: today } })
  else if (deadline === 'unknown') and.push({ submissionDeadline: null })

  // Conference date filter
  const when = url.searchParams.get('when')
  if (when && ['30', '90', '180', '365'].includes(when)) and.push({ eventDate: { gte: today, lte: inDays(Number(when)) } })
  else if (when === 'tbd') and.push({ eventDate: null })

  const region = url.searchParams.get('region')
  if (region === 'bd') and.push({ location: { contains: 'Bangladesh' } })
  if (region === 'intl') and.push({ NOT: { location: { contains: 'Bangladesh' } } })
  if (and.length) where.AND = and

  const orderBy = url.searchParams.get('sort') === 'deadline'
    ? [{ submissionDeadline: { sort: 'asc' as const, nulls: 'last' as const } }, { eventDate: { sort: 'asc' as const, nulls: 'last' as const } }]
    : [{ eventDate: { sort: 'asc' as const, nulls: 'last' as const } }, { title: 'asc' as const }]

  const [items, total] = await Promise.all([
    db.conference.findMany({ where, orderBy, take: limit, skip: offset }),
    db.conference.count({ where }),
  ])
  return NextResponse.json({ items, total, limit, offset })
}
