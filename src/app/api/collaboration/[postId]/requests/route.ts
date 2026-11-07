import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET: list all requests for a post (only the post owner can see them)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  const { postId } = await params
  const post = await db.collaborationPost.findUnique({ where: { id: postId } })
  if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })

  // Only the post owner can see all requests. A requester can see only their own.
  const where: any = { postId }
  if (post.authorId !== user.id) {
    where.userId = user.id
  }

  const items = await db.collaborationRequest.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true, role: true, bio: true, profile: true } },
    },
  })

  return NextResponse.json({ items, isOwner: post.authorId === user.id })
}
