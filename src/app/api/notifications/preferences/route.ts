import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

const ALL_TYPES = [
  'deadline',
  'collaboration',
  'project',
  'submission',
  'verification',
  'learning',
  'opportunity-match',
] as const

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  return NextResponse.json({
    types: user.notifTypes ? user.notifTypes.split(',').filter(Boolean) : [],
    email: user.notifEmail,
    availableTypes: ALL_TYPES,
  })
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  const body = await req.json()
  const { types, email } = body

  // Validate types
  const validTypes = Array.isArray(types)
    ? types.filter((t: string) => ALL_TYPES.includes(t as any))
    : []

  await db.user.update({
    where: { id: user.id },
    data: {
      notifTypes: validTypes.join(','),
      notifEmail: !!email,
    },
  })

  return NextResponse.json({
    types: validTypes,
    email: !!email,
    availableTypes: ALL_TYPES,
  })
}
