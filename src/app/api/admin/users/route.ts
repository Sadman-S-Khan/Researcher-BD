import { NextRequest, NextResponse } from 'next/server'
import { db, ci } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET: list all users (admin only)
export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const url = new URL(req.url)
  const q = url.searchParams.get('q')?.trim()
  const role = url.searchParams.get('role')

  const where: any = {}
  if (q) {
    where.OR = [{ name: ci(q) }, { email: ci(q) }]
  }
  if (role && role !== 'all') where.role = role

  const items = await db.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: {
      id: true, name: true, email: true, role: true, isBanned: true,
      isEmailVerified: true, createdAt: true, bio: true,
      _count: { select: { opportunities: true, publications: true, questions: true } },
    },
  })
  return NextResponse.json({ items })
}

// PATCH: change role or ban/unban
export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })
  }
  const body = await req.json().catch(() => null)
  if (!body || typeof body.userId !== 'string') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  const { userId, action, value } = body

  const target = await db.user.findUnique({ where: { id: userId } })
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  if (target.id === user.id) {
    return NextResponse.json({ error: 'Cannot modify your own account' }, { status: 400 })
  }

  // Role change rules: admin cannot promote above their own level or self-promote
  if (action === 'role') {
    const roleLevels: Record<string, number> = { STUDENT: 1, RESEARCHER: 2, FACULTY: 3, ORG_REP: 3, MODERATOR: 4, ADMIN: 5 }
    if (typeof value !== 'string' || !(value in roleLevels)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }
    const myLevel = roleLevels[user.role] ?? 0
    const newLevel = roleLevels[value as string] ?? 0
    if (newLevel > myLevel) {
      return NextResponse.json({ error: 'Cannot assign role higher than your own' }, { status: 403 })
    }
    if (target.role === 'ADMIN' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Cannot modify an admin' }, { status: 403 })
    }
    const updated = await db.user.update({ where: { id: userId }, data: { role: value as 'STUDENT' | 'RESEARCHER' | 'FACULTY' | 'ORG_REP' | 'MODERATOR' | 'ADMIN' } })
    await db.auditLog.create({
      data: { actorId: user.id, action: 'change_role', targetType: 'user', targetId: userId, metadata: JSON.stringify({ from: target.role, to: value }) },
    })
    const { passwordHash: _h1, ...safeUpdated } = updated
    return NextResponse.json({ user: safeUpdated })
  }

  if (action === 'ban') {
    const updated = await db.user.update({ where: { id: userId }, data: { isBanned: !!value } })
    await db.auditLog.create({
      data: { actorId: user.id, action: value ? 'ban_user' : 'unban_user', targetType: 'user', targetId: userId },
    })
    const { passwordHash: _h2, ...safeUpdated } = updated
    return NextResponse.json({ user: safeUpdated })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
