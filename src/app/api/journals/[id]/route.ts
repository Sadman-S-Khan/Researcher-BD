import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const journal = await db.journal.findUnique({ where: { id } })
  if (!journal) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const user = await getCurrentUser()
  let bookmarked = false
  if (user) {
    const b = await db.bookmark.findUnique({
      where: {
        userId_targetType_targetId: {
          userId: user.id,
          targetType: 'journal',
          targetId: journal.id,
        },
      },
    })
    bookmarked = !!b
  }

  // Related journals by publisher or subject area
  const related = await db.journal.findMany({
    where: {
      id: { not: journal.id },
      OR: [
        ...(journal.publisher ? [{ publisher: journal.publisher }] : []),
        ...(journal.subjectAreas ? [{ subjectAreas: { contains: journal.subjectAreas.split(',')[0]?.trim() ?? '' } }] : []),
      ],
    },
    take: 4,
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ journal, bookmarked, related })
}
