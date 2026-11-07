import { NextRequest, NextResponse } from 'next/server'
import { db, ci } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { z } from 'zod'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const cat = url.searchParams.get('cat')
  const q = url.searchParams.get('q')?.trim()
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '20'), 100)
  const offset = Math.max(parseInt(url.searchParams.get('offset') ?? '0'), 0)

  const where: any = {}
  if (cat && cat !== 'all') {
    where.category = { slug: cat }
  }
  if (q) {
    where.OR = [{ title: ci(q) }, { body: ci(q) }, { tags: ci(q) }]
  }

  const [items, total] = await Promise.all([
    db.question.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        author: { select: { id: true, name: true, role: true } },
        category: true,
        _count: { select: { answers: true } },
      },
    }),
    db.question.count({ where }),
  ])

  const categories = await db.discussionCategory.findMany({ orderBy: { order: 'asc' } })
  return NextResponse.json({ items, total, categories, limit, offset })
}

const QuestionSchema = z.object({
  title: z.string().min(8),
  body: z.string().min(10),
  categoryId: z.string().optional().nullable(),
  tags: z.string().optional().nullable(),
})

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  const body = await req.json()
  const parsed = QuestionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
  }
  const q = await db.question.create({
    data: { ...parsed.data, authorId: user.id },
    include: { author: { select: { id: true, name: true, role: true } }, category: true },
  })
  return NextResponse.json({ question: q })
}
