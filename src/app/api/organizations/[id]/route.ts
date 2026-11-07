import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const org = await db.organization.findUnique({
    where: { id },
    include: {
      members: { include: { user: { select: { id: true, name: true, role: true } } } },
      laboratories: true,
      _count: { select: { members: true, laboratories: true } },
    },
  })
  if (!org) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const user = await getCurrentUser()
  let bookmarked = false
  if (user) {
    const b = await db.bookmark.findUnique({
      where: { userId_targetType_targetId: { userId: user.id, targetType: 'organization', targetId: org.id } },
    })
    bookmarked = !!b
  }

  return NextResponse.json({ organization: org, bookmarked })
}
