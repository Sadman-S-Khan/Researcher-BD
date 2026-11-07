import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const countOnly = url.searchParams.get('count') === '1'
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ items: [], unread: 0 })

  if (countOnly) {
    const unread = await db.notification.count({
      where: { userId: user.id, isRead: false },
    })
    return NextResponse.json({ unread })
  }

  const items = await db.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
  return NextResponse.json({ items })
}

export async function POST(req: NextRequest) {
  // Mark all as read
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  await db.notification.updateMany({
    where: { userId: user.id, isRead: false },
    data: { isRead: true },
  })
  return NextResponse.json({ ok: true })
}
