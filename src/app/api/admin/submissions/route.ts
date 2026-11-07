import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET: list pending submissions
export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const url = new URL(req.url)
  const status = url.searchParams.get('status') ?? 'pending'
  const items = await db.submission.findMany({
    where: { status },
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { submitter: { select: { id: true, name: true, email: true, role: true } } },
  })
  return NextResponse.json({ items })
}

// PATCH: approve or reject a submission
export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const body = await req.json()
  const { submissionId, action, reviewNote } = body // action: 'approve' | 'reject'

  const submission = await db.submission.findUnique({ where: { id: submissionId } })
  if (!submission) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const newStatus = action === 'approve' ? 'approved' : 'rejected'
  const updated = await db.submission.update({
    where: { id: submissionId },
    data: { status: newStatus, reviewerId: user.id, reviewNote: reviewNote ?? null },
  })

  // Update the linked entity's verification field
  const verificationMap: Record<string, string> = {
    opportunity: action === 'approve' ? 'source-checked' : 'submitted',
    journal: action === 'approve' ? 'information-checked' : 'listed',
    conference: action === 'approve' ? 'information-checked' : 'listed',
    dataset: action === 'approve' ? 'reviewed' : 'submitted',
    event: action === 'approve' ? 'source-checked' : 'submitted',
    organization: action === 'approve' ? 'official-source-confirmed' : 'submitted',
    laboratory: action === 'approve' ? 'institution-confirmed' : 'submitted',
  }

  const entityType = submission.entityType
  const entityId = submission.entityId
  const newVerification = verificationMap[entityType] ?? 'submitted'

  // Update entity
  if (entityType === 'opportunity') {
    await db.opportunity.update({ where: { id: entityId }, data: { verification: newVerification, verifiedById: user.id } })
  } else if (entityType === 'journal') {
    await db.journal.update({ where: { id: entityId }, data: { verification: newVerification, verifiedById: user.id, lastCheckedAt: new Date() } })
  } else if (entityType === 'conference') {
    await db.conference.update({ where: { id: entityId }, data: { verification: newVerification, lastCheckedAt: new Date() } })
  } else if (entityType === 'dataset') {
    await db.dataset.update({ where: { id: entityId }, data: { verification: newVerification, verifiedById: user.id } })
  } else if (entityType === 'event') {
    await db.academicEvent.update({ where: { id: entityId }, data: { verification: newVerification, verifiedById: user.id } })
  } else if (entityType === 'organization') {
    await db.organization.update({ where: { id: entityId }, data: { verification: newVerification, verifiedById: user.id } })
  } else if (entityType === 'laboratory') {
    await db.laboratory.update({ where: { id: entityId }, data: { verification: newVerification } })
  }

  // Audit log
  await db.auditLog.create({
    data: {
      actorId: user.id,
      action: `${newStatus}_submission`,
      targetType: entityType,
      targetId: entityId,
      metadata: JSON.stringify({ submissionId, reviewNote }),
    },
  })

  // Notify submitter
  await db.notification.create({
    data: {
      userId: submission.submitterId,
      type: 'submission',
      title: `Submission ${newStatus}`,
      body: `Your ${entityType} submission has been ${newStatus}.`,
      link: `#/${entityType === 'opportunity' ? 'opportunities' : entityType + 's'}/${entityId}`,
    },
  })

  return NextResponse.json({ submission: updated })
}
