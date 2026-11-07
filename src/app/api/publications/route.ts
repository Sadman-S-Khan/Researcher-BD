import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const userId = url.searchParams.get('userId')
  const user = await getCurrentUser()
  const targetUserId = userId ?? user?.id
  if (!targetUserId) return NextResponse.json({ items: [] })

  const items = await db.publication.findMany({
    where: {
      OR: [
        { userId: targetUserId },
        { authors: { some: { userId: targetUserId } } },
        { claims: { some: { userId: targetUserId, status: 'approved' } } },
      ],
    },
    orderBy: { year: 'desc' },
    include: { authors: true },
  })
  return NextResponse.json({ items })
}
