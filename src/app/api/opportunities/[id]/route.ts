import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const opp = await db.opportunity.findUnique({ where: { id } })
  if (!opp) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const user = await getCurrentUser()
  let bookmarked = false
  if (user) {
    const b = await db.bookmark.findUnique({
      where: {
        userId_targetType_targetId: {
          userId: user.id,
          targetType: 'opportunity',
          targetId: opp.id,
        },
      },
    })
    bookmarked = !!b
  }
  return NextResponse.json({ opportunity: opp, bookmarked })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  const { id } = await params
  const opp = await db.opportunity.findUnique({ where: { id } })
  if (!opp) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const canDelete =
    opp.submitterId === user.id ||
    user.role === 'ADMIN' ||
    user.role === 'MODERATOR'
  if (!canDelete) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  await db.opportunity.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
