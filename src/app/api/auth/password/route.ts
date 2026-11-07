import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getCurrentUser, verifyPassword, hashPassword } from '@/lib/auth'
import { rateLimit, getClientId, rateLimitedResponse, RATE_LIMITS } from '@/lib/rate-limit'

const Schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, 'New password must be at least 8 characters').max(200),
})

// Change the signed-in user's password (requires the current password).
export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const rl = rateLimit(getClientId(req, 'password'), RATE_LIMITS.auth)
  if (!rl.success) return rateLimitedResponse(rl.resetAt) as NextResponse

  const parsed = Schema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
  const { currentPassword, newPassword } = parsed.data

  const record = await db.user.findUnique({ where: { id: user.id }, select: { passwordHash: true } })
  if (!record || !(await verifyPassword(currentPassword, record.passwordHash))) {
    return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
  }
  await db.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(newPassword) } })
  await db.auditLog.create({ data: { actorId: user.id, action: 'user.password_change', targetType: 'user', targetId: user.id } }).catch(() => {})
  return NextResponse.json({ ok: true })
}
