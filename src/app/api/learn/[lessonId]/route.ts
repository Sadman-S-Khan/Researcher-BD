import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  const { lessonId } = await params
  const existing = await db.lessonProgress.findUnique({
    where: { userId_lessonId: { userId: user.id, lessonId } },
  })
  if (existing) {
    const updated = await db.lessonProgress.update({
      where: { userId_lessonId: { userId: user.id, lessonId } },
      data: { completed: !existing.completed },
    })
    return NextResponse.json({ progress: updated })
  }
  const created = await db.lessonProgress.create({
    data: { userId: user.id, lessonId, completed: true },
  })
  return NextResponse.json({ progress: created })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  const { lessonId } = await params
  await db.lessonProgress.deleteMany({
    where: { userId: user.id, lessonId },
  })
  return NextResponse.json({ ok: true })
}
