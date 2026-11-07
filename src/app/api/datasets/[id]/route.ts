import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const dataset = await db.dataset.findUnique({ where: { id } })
  if (!dataset) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const user = await getCurrentUser()
  let bookmarked = false
  if (user) {
    const b = await db.bookmark.findUnique({
      where: { userId_targetType_targetId: { userId: user.id, targetType: 'dataset', targetId: dataset.id } },
    })
    bookmarked = !!b
  }

  const related = await db.dataset.findMany({
    where: { id: { not: dataset.id }, OR: [
      ...(dataset.researchDomain ? [{ researchDomain: { contains: dataset.researchDomain.split(',')[0]?.trim() ?? '' } }] : []),
      ...(dataset.dataModality ? [{ dataModality: dataset.dataModality }] : []),
    ]},
    take: 4,
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ dataset, bookmarked, related })
}
