import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { z } from 'zod'

const MilestoneSchema = z.object({
  title: z.string().min(3),
  dueDate: z.string().optional().nullable(),
})

const ResourceSchema = z.object({
  title: z.string().min(3),
  url: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

const NoteSchema = z.object({
  title: z.string().min(3),
  body: z.string().min(1),
})

async function verifyMembership(projectId: string, userId: string) {
  const project = await db.researchProject.findUnique({
    where: { id: projectId },
    include: { members: true },
  })
  if (!project) return null
  const isMember = project.ownerId === userId || project.members.some(m => m.userId === userId)
  if (!isMember) return null
  return project
}

// Create milestone / resource / note based on ?kind= query param
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  const { projectId } = await params
  const url = new URL(req.url)
  const kind = url.searchParams.get('kind') ?? 'milestone'

  const project = await verifyMembership(projectId, user.id)
  if (!project) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()

  if (kind === 'milestone') {
    const parsed = MilestoneSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
    const m = await db.projectMilestone.create({
      data: { ...parsed.data, dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null, projectId },
    })
    return NextResponse.json({ item: m })
  }
  if (kind === 'resource') {
    const parsed = ResourceSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
    const r = await db.projectResource.create({ data: { ...parsed.data, projectId } })
    return NextResponse.json({ item: r })
  }
  if (kind === 'note') {
    const parsed = NoteSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
    const n = await db.projectNote.create({ data: { ...parsed.data, projectId } })
    return NextResponse.json({ item: n })
  }
  return NextResponse.json({ error: 'Unknown kind' }, { status: 400 })
}

// Toggle milestone completion
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  const { projectId } = await params
  const project = await verifyMembership(projectId, user.id)
  if (!project) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { milestoneId, completed } = body
  if (!milestoneId) return NextResponse.json({ error: 'milestoneId required' }, { status: 400 })
  const existing = await db.projectMilestone.findUnique({ where: { id: milestoneId } })
  if (!existing || existing.projectId !== projectId) {
    return NextResponse.json({ error: 'Milestone not found' }, { status: 404 })
  }
  const m = await db.projectMilestone.update({
    where: { id: milestoneId },
    data: { completed: !!completed },
  })
  return NextResponse.json({ item: m })
}
