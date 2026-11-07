import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { verifyPassword, createSessionAndRespond } from '@/lib/auth'
import { rateLimit, rateLimitPeek, rateLimitReset, getClientId, rateLimitedResponse, RATE_LIMITS } from '@/lib/rate-limit'

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(req: NextRequest) {
  // Rate limit: 5 FAILED login attempts per 15 minutes per IP (successful logins are not counted,
  // so many users behind one shared network are not locked out).
  const clientId = getClientId(req, 'login')
  const rl = rateLimitPeek(clientId, RATE_LIMITS.auth)
  if (!rl.success) {
    return rateLimitedResponse(rl.resetAt) as NextResponse
  }
  const fail = (message: string, status: number) => {
    rateLimit(clientId, RATE_LIMITS.auth)
    return NextResponse.json({ error: message }, { status })
  }

  try {
    const body = await req.json()
    const parsed = LoginSchema.safeParse(body)
    if (!parsed.success) {
      return fail('Invalid email or password', 400)
    }
    const { email, password } = parsed.data

    const user = await db.user.findUnique({ where: { email: email.toLowerCase() } })
    if (!user || user.isBanned) {
      return fail('Invalid email or password', 401)
    }
    const ok = await verifyPassword(password, user.passwordHash)
    if (!ok) {
      return fail('Invalid email or password', 401)
    }
    rateLimitReset(clientId)

    return await createSessionAndRespond(
      {
        uid: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      {
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      }
    )
  } catch (e) {
    console.error('login error', e)
    return NextResponse.json({ error: 'Could not sign in' }, { status: 500 })
  }
}
