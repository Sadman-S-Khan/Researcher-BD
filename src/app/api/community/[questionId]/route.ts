import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  const { questionId } = await params
  const question = await db.question.findUnique({
    where: { id: questionId },
    include: {
      author: { select: { id: true, name: true, role: true } },
      category: true,
      answers: {
        orderBy: { createdAt: 'asc' },
        include: {
          author: { select: { id: true, name: true, role: true } },
          comments: {
            include: { author: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'asc' },
          },
        },
      },
      comments: {
        include: { author: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
  })
  if (!question) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Increment views
  await db.question.update({ where: { id: questionId }, data: { views: { increment: 1 } } })

  return NextResponse.json({ question })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  // Add an answer
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  const { questionId } = await params
  const body = await req.json()
  if (!body.body || body.body.trim().length < 5) {
    return NextResponse.json({ error: 'Answer too short' }, { status: 400 })
  }
  const answer = await db.answer.create({
    data: { questionId, authorId: user.id, body: body.body },
    include: { author: { select: { id: true, name: true, role: true } } },
  })
  return NextResponse.json({ answer })
}
