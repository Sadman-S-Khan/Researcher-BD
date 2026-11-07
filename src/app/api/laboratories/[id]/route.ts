import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const lab = await db.laboratory.findUnique({
    where: { id },
    include: {
      organization: true,
      members: { include: { user: { select: { id: true, name: true, role: true } } } },
      _count: { select: { members: true } },
    },
  })
  if (!lab) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const user = await getCurrentUser()
  let bookmarked = false
  if (user) {
    const b = await db.bookmark.findUnique({
      where: { userId_targetType_targetId: { userId: user.id, targetType: 'laboratory', targetId: lab.id } },
    })
    bookmarked = !!b
  }

  return NextResponse.json({ laboratory: lab, bookmarked })
}
