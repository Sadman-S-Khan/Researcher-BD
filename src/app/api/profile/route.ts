import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { z } from 'zod'

const ProfileSchema = z.object({
  displayName: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  institution: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  position: z.string().optional().nullable(),
  education: z.string().optional().nullable(),
  researchInterests: z.string().optional().nullable(),
  technicalSkills: z.string().optional().nullable(),
  orcid: z.string().optional().nullable(),
  scholarLink: z.string().optional().nullable(),
  githubLink: z.string().optional().nullable(),
  linkedinLink: z.string().optional().nullable(),
  websiteLink: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  contactEmail: z.string().optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  awards: z.string().optional().nullable(),
  experience: z.string().optional().nullable(),
  isPublic: z.boolean().optional(),
  locale: z.string().optional(),
})

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  const body = await req.json()
  const parsed = ProfileSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
  }

  const { displayName, bio, isPublic, locale, ...profileFields } = parsed.data

  // Update user fields
  await db.user.update({
    where: { id: user.id },
    data: {
      ...(displayName !== undefined && { displayName }),
      ...(bio !== undefined && { bio }),
      ...(isPublic !== undefined && { isPublic }),
      ...(locale !== undefined && { locale }),
    },
  })

  // Upsert profile
  const existing = await db.profile.findUnique({ where: { userId: user.id } })
  if (existing) {
    await db.profile.update({
      where: { userId: user.id },
      data: profileFields as any,
    })
  } else {
    await db.profile.create({
      data: { userId: user.id, ...profileFields } as any,
    })
  }

  const updated = await db.user.findUnique({
    where: { id: user.id },
    include: { profile: true },
  })
  if (!updated) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  // Never send passwordHash (or other internal fields) back to the client
  const { passwordHash: _omit, ...safeUser } = updated
  return NextResponse.json({ user: safeUser })
}

// GET endpoint returns the current user's full profile
export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ user: null })
  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      displayName: user.displayName,
      bio: user.bio,
      isPublic: user.isPublic,
      locale: user.locale,
      profile: user.profile,
    },
  })
}
