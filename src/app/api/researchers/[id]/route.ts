import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const researcher = await db.user.findUnique({
    where: { id },
    include: {
      profile: true,
      mentorPref: true,
      orgsOwned: { select: { id: true, name: true, type: true } },
      labsOwned: { select: { id: true, name: true, researchAreas: true } },
    },
  })
  if (!researcher || researcher.isBanned || !researcher.isPublic) {
    // Allow viewing if it's the user themselves
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.id !== id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
  }
  if (!researcher) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Get publications where this user is an author or has claimed
  const publications = await db.publication.findMany({
    where: {
      OR: [
        { userId: id },
        { authors: { some: { userId: id } } },
        { claims: { some: { userId: id, status: 'approved' } } },
      ],
    },
    orderBy: { year: 'desc' },
    take: 20,
  })

  // Get contributions
  const contributions = await db.contribution.findMany({
    where: { userId: id },
    orderBy: { year: 'desc' },
    take: 30,
  })

  // Get projects owned
  const projects = await db.researchProject.findMany({
    where: { ownerId: id, isPrivate: false },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: { id: true, title: true, researchDomain: true, status: true },
  })

  // Get questions asked
  const questions = await db.question.findMany({
    where: { authorId: id },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, title: true, createdAt: true, _count: { select: { answers: true } } },
  })

  return NextResponse.json({
    researcher: {
      id: researcher.id,
      name: researcher.name,
      bio: researcher.bio,
      role: researcher.role,
      createdAt: researcher.createdAt,
      profile: researcher.profile,
      mentorPref: researcher.mentorPref,
      orgsOwned: researcher.orgsOwned,
      labsOwned: researcher.labsOwned,
    },
    publications,
    contributions,
    projects,
    questions,
  })
}
