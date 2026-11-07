import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { z } from 'zod'

const TaskSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional().nullable(),
  status: z.string().default('todo'),
  priority: z.string().default('medium'),
  dueDate: z.string().optional().nullable(),
  assigneeId: z.string().optional().nullable(),
})

// Fields a member may change on an existing task (everything else, e.g. projectId, is immutable)
const TaskUpdateSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional().nullable(),
  status: z.string().optional(),
  priority: z.string().optional(),
  dueDate: z.string().optional().nullable(),
  assigneeId: z.string().optional().nullable(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  const { projectId } = await params

  // Verify membership
  const project = await db.researchProject.findUnique({
    where: { id: projectId },
    include: { members: true },
  })
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const isMember = project.ownerId === user.id || project.members.some(m => m.userId === user.id)
  if (!isMember) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const parsed = TaskSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
  }

  const task = await db.projectTask.create({
    data: {
      ...parsed.data,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      projectId,
      createdById: user.id,
    },
  })
  return NextResponse.json({ task })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  const { projectId } = await params
  const body = await req.json().catch(() => null)
  if (!body || typeof body.taskId !== 'string') {
    return NextResponse.json({ error: 'taskId required' }, { status: 400 })
  }
  const { taskId, ...rawUpdates } = body
  const parsedUpdates = TaskUpdateSchema.safeParse(rawUpdates)
  if (!parsedUpdates.success) {
    return NextResponse.json({ error: parsedUpdates.error.issues[0]?.message }, { status: 400 })
  }
  const updates = parsedUpdates.data

  const project = await db.researchProject.findUnique({
    where: { id: projectId },
    include: { members: true },
  })
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const isMember = project.ownerId === user.id || project.members.some(m => m.userId === user.id)
  if (!isMember) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // The task must belong to THIS project, otherwise a member of project A could edit tasks of project B
  const existingTask = await db.projectTask.findUnique({ where: { id: taskId } })
  if (!existingTask || existingTask.projectId !== projectId) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }

  const task = await db.projectTask.update({
    where: { id: taskId },
    data: {
      ...updates,
      // undefined = leave unchanged, null = clear the date
      dueDate: updates.dueDate === undefined ? undefined : updates.dueDate ? new Date(updates.dueDate) : null,
    },
  })
  return NextResponse.json({ task })
}
