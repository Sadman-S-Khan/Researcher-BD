import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { z } from 'zod'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const q = url.searchParams.get('q')?.trim()
  const where: any = { status: 'open' }
  if (q) {
    where.OR = [{ title: { contains: q } }, { body: { contains: q } }, { researchArea: { contains: q } }]
  }
  const items = await db.collaborationPost.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      author: { select: { id: true, name: true, role: true } },
      _count: { select: { requests: true } },
    },
  })
  return NextResponse.json({ items })
}

const PostSchema = z.object({
  title: z.string().min(5),
  body: z.string().min(10),
  category: z.string().default('collaboration'),
  researchArea: z.string().optional().nullable(),
})

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  const body = await req.json()
  const parsed = PostSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
  }
  const post = await db.collaborationPost.create({
    data: { ...parsed.data, authorId: user.id },
  })
  return NextResponse.json({ post })
}
