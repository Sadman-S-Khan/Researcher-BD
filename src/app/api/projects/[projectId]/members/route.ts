import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  // Invite a member by email
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  const { projectId } = await params
  const body = await req.json()
  const email = typeof body?.email === 'string' ? body.email.trim() : ''
  const role = ['lead', 'member', 'viewer'].includes(body?.role) ? body.role : 'member'
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  const project = await db.researchProject.findUnique({ where: { id: projectId } })
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (project.ownerId !== user.id) {
    return NextResponse.json({ error: 'Only the project owner can invite members' }, { status: 403 })
  }

  const invitee = await db.user.findUnique({ where: { email: email.toLowerCase() } })
  if (!invitee) return NextResponse.json({ error: 'User not found with that email' }, { status: 404 })
  if (invitee.id === user.id) return NextResponse.json({ error: 'Cannot invite yourself' }, { status: 400 })

  const existing = await db.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: invitee.id } },
  })
  if (existing) return NextResponse.json({ error: 'Already a member' }, { status: 409 })

  const member = await db.projectMember.create({
    data: { projectId, userId: invitee.id, role },
  })

  // Create notification for the invitee
  await db.notification.create({
    data: {
      userId: invitee.id,
      type: 'project',
      title: `Added to project: ${project.title}`,
      body: `You have been added as ${role} to "${project.title}".`,
      link: `#/projects/${project.id}`,
    },
  })

  return NextResponse.json({ member })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  // Remove a member
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  const { projectId } = await params
  const url = new URL(req.url)
  const memberId = url.searchParams.get('memberId')
  if (!memberId) return NextResponse.json({ error: 'memberId required' }, { status: 400 })

  const project = await db.researchProject.findUnique({ where: { id: projectId } })
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  // memberId is a ProjectMember row id (not a user id) and must belong to this project
  const member = await db.projectMember.findUnique({ where: { id: memberId } })
  if (!member || member.projectId !== projectId) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 })
  }
  const isOwner = project.ownerId === user.id
  const isSelf = member.userId === user.id
  if (!isOwner && !isSelf) {
    return NextResponse.json({ error: 'Only the owner or the member themselves can remove' }, { status: 403 })
  }

  await db.projectMember.delete({ where: { id: memberId } })
  return NextResponse.json({ ok: true })
}
