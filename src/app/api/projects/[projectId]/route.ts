import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params
  const user = await getCurrentUser()

  const project = await db.researchProject.findUnique({
    where: { id: projectId },
    include: {
      owner: { select: { id: true, name: true, role: true } },
      members: {
        include: { user: { select: { id: true, name: true, role: true } } },
      },
      tasks: {
        include: {
          assignee: { select: { id: true, name: true } },
          createdBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
      milestones: { orderBy: { dueDate: 'asc' } },
      resources: { orderBy: { createdAt: 'desc' } },
      notes: { orderBy: { createdAt: 'desc' } },
    },
  })
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Access control
  if (project.isPrivate) {
    if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
    const isMember = project.ownerId === user.id ||
      project.members.some(m => m.userId === user.id)
    if (!isMember && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden — not a project member' }, { status: 403 })
    }
  }
  return NextResponse.json({ project, currentUser: user ? { id: user.id, role: user.role } : null })
}
