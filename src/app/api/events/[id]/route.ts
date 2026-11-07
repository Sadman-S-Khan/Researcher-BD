import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const event = await db.academicEvent.findUnique({ where: { id } })
  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const user = await getCurrentUser()
  let bookmarked = false
  if (user) {
    const b = await db.bookmark.findUnique({
      where: { userId_targetType_targetId: { userId: user.id, targetType: 'event', targetId: event.id } },
    })
    bookmarked = !!b
  }

  const related = await db.academicEvent.findMany({
    where: { id: { not: event.id }, eventType: event.eventType, startDateTime: { gt: new Date() } },
    take: 4,
    orderBy: { startDateTime: 'asc' },
  })

  return NextResponse.json({ event, bookmarked, related })
}
