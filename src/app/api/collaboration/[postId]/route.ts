import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// POST: create a collaboration request on a post
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  const { postId } = await params
  const body = await req.json()
  const message = body.message?.trim() ?? ''

  const post = await db.collaborationPost.findUnique({ where: { id: postId } })
  if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  if (post.authorId === user.id) {
    return NextResponse.json({ error: 'Cannot request collaboration on your own post' }, { status: 400 })
  }
  if (post.status === 'closed') {
    return NextResponse.json({ error: 'This post is closed' }, { status: 400 })
  }

  const existing = await db.collaborationRequest.findFirst({
    where: { postId, userId: user.id },
  })
  if (existing) return NextResponse.json({ error: 'You already requested collaboration on this post', existing }, { status: 409 })

  const request = await db.collaborationRequest.create({
    data: { postId, userId: user.id, message },
  })

  // Notify post author
  await db.notification.create({
    data: {
      userId: post.authorId,
      type: 'collaboration',
      title: 'New collaboration request',
      body: `${user.name} requested collaboration on "${post.title}".`,
      link: `#/collaboration`,
    },
  })

  return NextResponse.json({ request })
}

// PATCH: accept or reject a request (only post author)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  const { postId } = await params
  const body = await req.json()
  const { requestId, action } = body // action: 'accept' | 'reject'

  const post = await db.collaborationPost.findUnique({ where: { id: postId } })
  if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  if (post.authorId !== user.id) {
    return NextResponse.json({ error: 'Only the post author can accept or reject requests' }, { status: 403 })
  }

  const request = await db.collaborationRequest.findUnique({ where: { id: requestId } })
  if (!request || request.postId !== postId) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 })
  }

  const newStatus = action === 'accept' ? 'accepted' : 'rejected'
  const updated = await db.collaborationRequest.update({
    where: { id: requestId },
    data: { status: newStatus },
  })

  // Notify the requester
  await db.notification.create({
    data: {
      userId: request.userId,
      type: 'collaboration',
      title: `Collaboration request ${newStatus}`,
      body: `${user.name} ${newStatus} your request on "${post.title}".`,
      link: `#/collaboration`,
    },
  })

  return NextResponse.json({ request: updated })
}
