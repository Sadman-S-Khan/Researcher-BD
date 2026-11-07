import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { hashPassword, createSessionAndRespond } from '@/lib/auth'
import { rateLimit, getClientId, rateLimitedResponse, RATE_LIMITS } from '@/lib/rate-limit'

const RegisterSchema = z.object({
  name: z.string().min(2, 'Name too short'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['STUDENT', 'RESEARCHER', 'FACULTY', 'ORG_REP']).default('STUDENT'),
})

export async function POST(req: NextRequest) {
  // Rate limit: 3 registrations per hour per IP
  const clientId = getClientId(req, 'register')
  const rl = rateLimit(clientId, RATE_LIMITS.register)
  if (!rl.success) {
    return rateLimitedResponse(rl.resetAt) as NextResponse
  }

  try {
    const body = await req.json()
    const parsed = RegisterSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 }
      )
    }
    const { name, email, password, role } = parsed.data

    const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } })
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)
    const user = await db.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        passwordHash,
        role,
        isEmailVerified: false,
      },
    })

    // Create empty profile
    await db.profile.create({ data: { userId: user.id } })

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
  } catch (e: any) {
    console.error('register error', e)
    return NextResponse.json({ error: 'Could not create account' }, { status: 500 })
  }
}
