import { NextRequest, NextResponse } from 'next/server'
import { db, ci } from '@/lib/db'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') ?? '20') || 20, 1), 100)
  const offset = Math.max(parseInt(url.searchParams.get('offset') ?? '0') || 0, 0)
  const q = url.searchParams.get('q')?.trim()
  const interest = url.searchParams.get('interest')
  const mentorOnly = url.searchParams.get('mentorOnly') === 'true'

  const where: any = {}
  where.AND = [{ isBanned: false }, { isPublic: true }]
  // Restrict visible users to community roles
  where.role = { in: ['STUDENT', 'RESEARCHER', 'FACULTY', 'ORG_REP'] }

  if (q) {
    where.OR = [
      { name: ci(q) },
      { bio: ci(q) },
      { displayName: ci(q) },
    ]
  }

  let orCondition: any = {}
  if (interest && interest !== 'all') {
    orCondition = {
      profile: { researchInterests: ci(interest) },
    }
  }

  const finalWhere: any = { ...where, ...(Object.keys(orCondition).length ? orCondition : {}) }
  // Apply the mentor filter in the database so pagination and totals stay correct
  if (mentorOnly) finalWhere.mentorPref = { is: { isAvailable: true } }

  const [items, total] = await Promise.all([
    db.user.findMany({
      where: finalWhere,
      include: { profile: true, mentorPref: true },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    }),
    db.user.count({ where: finalWhere }),
  ])
  return NextResponse.json({
    items: items.map(u => ({
      id: u.id,
      name: u.name,
      bio: u.bio,
      role: u.role,
      profile: u.profile,
      mentorPref: u.mentorPref,
    })),
    total,
    limit,
    offset,
  })
}
