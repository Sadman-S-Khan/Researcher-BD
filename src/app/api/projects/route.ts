import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { z } from 'zod'

export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ items: [], total: 0 })
  const url = new URL(req.url)
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '20'), 100)
  const offset = Math.max(parseInt(url.searchParams.get('offset') ?? '0'), 0)

  // Projects where the user is owner or member
  const [items, total] = await Promise.all([
    db.researchProject.findMany({
      where: {
        OR: [
          { ownerId: user.id },
          { members: { some: { userId: user.id } } },
        ],
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        owner: { select: { id: true, name: true } },
        _count: { select: { members: true, tasks: true } },
      },
    }),
    db.researchProject.count({
      where: {
        OR: [
          { ownerId: user.id },
          { members: { some: { userId: user.id } } },
        ],
      },
    }),
  ])
  return NextResponse.json({ items, total, limit, offset })
}

const ProjectSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional().nullable(),
  researchDomain: z.string().optional().nullable(),
  objectives: z.string().optional().nullable(),
  status: z.string().default('planning'),
  isPrivate: z.boolean().default(true),
  startDate: z.string().optional().nullable(),
  expectedEnd: z.string().optional().nullable(),
})

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  const body = await req.json()
  const parsed = ProjectSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
  }
  const project = await db.researchProject.create({
    data: {
      ...parsed.data,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
      expectedEnd: parsed.data.expectedEnd ? new Date(parsed.data.expectedEnd) : null,
      ownerId: user.id,
    },
  })
  // Owner becomes a member automatically
  await db.projectMember.create({
    data: { projectId: project.id, userId: user.id, role: 'owner' },
  })
  return NextResponse.json({ project })
}
