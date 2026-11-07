import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ items: [] })
  const items = await db.bookmark.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ items })
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  const body = await req.json()
  const { targetType, targetId } = body
  if (!targetType || !targetId) {
    return NextResponse.json({ error: 'Missing target' }, { status: 400 })
  }
  // Find existing
  const existing = await db.bookmark.findUnique({
    where: {
      userId_targetType_targetId: { userId: user.id, targetType, targetId },
    },
  })
  if (existing) {
    await db.bookmark.delete({ where: { id: existing.id } })
    return NextResponse.json({ bookmarked: false })
  }
  // Create bookmark; if opportunity or dataset, also link the relation
  const data: any = { userId: user.id, targetType, targetId }
  if (targetType === 'opportunity') data.opportunityId = targetId
  if (targetType === 'dataset') data.datasetId = targetId
  await db.bookmark.create({ data })
  return NextResponse.json({ bookmarked: true })
}
