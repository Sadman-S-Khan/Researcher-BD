import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { db } from './db'

const SESSION_COOKIE = 'rbd_session'
const DEV_FALLBACK_SECRET = 'dev-only-secret-change-in-production-please-use-32-chars'
const SECRET = process.env.AUTH_SECRET || DEV_FALLBACK_SECRET
if (process.env.NODE_ENV === 'production' && (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32)) {
  // Refuse to run with a guessable signing key in production: anyone could forge admin sessions.
  throw new Error('AUTH_SECRET must be set to a random string of at least 32 characters in production')
}
const key = new TextEncoder().encode(SECRET)

export interface SessionPayload {
  uid: string
  email: string
  role: string
  name: string
}

export async function hashPassword(pw: string) {
  return bcrypt.hash(pw, 10)
}

export async function verifyPassword(pw: string, hash: string) {
  return bcrypt.compare(pw, hash)
}

// Sign the JWT. The route handler is responsible for attaching it to the response.
// JWT expires in 24 hours — the client-side inactivity timer (30 min) handles
// auto-logout for inactive sessions, and the JWT max age provides a hard ceiling.
export async function createSessionToken(payload: SessionPayload): Promise<string> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(key)
  return token
}

// Attach a session cookie to a NextResponse and return it.
// Cookie persists for 24 hours — if the user closes the tab and reopens
// within that window, they stay logged in. The 30-minute inactivity timer
// (client-side) handles auto-logout for inactive sessions.
export function attachSessionCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  })
  return response
}

// Convenience: create token, attach cookie, return JSON response
export async function createSessionAndRespond(payload: SessionPayload, body: any): Promise<NextResponse> {
  const token = await createSessionToken(payload)
  return attachSessionCookie(NextResponse.json(body), token)
}

export async function destroySession(response?: NextResponse): Promise<NextResponse> {
  if (response) {
    response.cookies.delete(SESSION_COOKIE)
    return response
  }
  const store = await cookies()
  store.delete(SESSION_COOKIE)
  return NextResponse.json({ ok: true })
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, key)
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

export async function getCurrentUser() {
  const session = await getSession()
  if (!session) return null
  const user = await db.user.findUnique({
    where: { id: session.uid },
    include: { profile: true },
  })
  if (!user || user.isBanned) return null
  return user
}

export const ROLE_LEVELS: Record<string, number> = {
  STUDENT: 1,
  RESEARCHER: 2,
  FACULTY: 3,
  ORG_REP: 3,
  MODERATOR: 4,
  ADMIN: 5,
}

export function hasMinRole(userRole: string | undefined, required: string) {
  if (!userRole) return false
  return (ROLE_LEVELS[userRole] ?? 0) >= (ROLE_LEVELS[required] ?? 99)
}
