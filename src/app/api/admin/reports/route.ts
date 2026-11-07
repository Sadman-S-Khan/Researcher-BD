import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET: list reports (admin only)
export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const url = new URL(req.url)
  const status = url.searchParams.get('status') ?? 'open'
  const items = await db.report.findMany({
    where: { status },
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      reporter: { select: { id: true, name: true, email: true } },
      handler: { select: { id: true, name: true } },
    },
  })
  return NextResponse.json({ items })
}

// PATCH: resolve or dismiss a report
export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const body = await req.json()
  const { reportId, status, resolution } = body
  if (!['reviewing', 'resolved', 'dismissed'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }
  const updated = await db.report.update({
    where: { id: reportId },
    data: { status, resolution: resolution ?? null, handlerId: user.id },
  })
  await db.auditLog.create({
    data: { actorId: user.id, action: `report_${status}`, targetType: 'report', targetId: reportId, metadata: JSON.stringify({ resolution }) },
  })
  return NextResponse.json({ report: updated })
}

// POST: create a report (any authenticated user)
export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  const body = await req.json()
  const { targetType, targetId, reason } = body
  if (!targetType || !targetId || !reason?.trim()) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }
  // Prevent duplicate reports by same user
  const existing = await db.report.findFirst({
    where: { reporterId: user.id, targetType, targetId, status: 'open' },
  })
  if (existing) return NextResponse.json({ error: 'You have already reported this', existing }, { status: 409 })
  const report = await db.report.create({
    data: { reporterId: user.id, targetType, targetId, reason: reason.trim() },
  })
  return NextResponse.json({ report })
}
