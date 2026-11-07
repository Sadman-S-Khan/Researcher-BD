import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const conference = await db.conference.findUnique({ where: { id } })
  if (!conference) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const user = await getCurrentUser()
  let bookmarked = false
  if (user) {
    const b = await db.bookmark.findUnique({
      where: {
        userId_targetType_targetId: {
          userId: user.id,
          targetType: 'conference',
          targetId: conference.id,
        },
      },
    })
    bookmarked = !!b
  }

  // Related conferences (upcoming, by similar organizer or location)
  const related = await db.conference.findMany({
    where: {
      id: { not: conference.id },
      OR: [
        ...(conference.organizer ? [{ organizer: conference.organizer }] : []),
        ...(conference.location ? [{ location: conference.location }] : []),
      ],
    },
    take: 4,
    orderBy: { eventDate: 'asc' },
  })

  return NextResponse.json({ conference, bookmarked, related })
}
