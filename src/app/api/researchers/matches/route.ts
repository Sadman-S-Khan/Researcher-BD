import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET: recommended researchers for the current user
// Algorithm:
// 1. Parse the user's research interests into keywords
// 2. Find all other public, non-banned users with researchInterests set
// 3. Score each candidate by:
//    - +2 for each shared research interest keyword
//    - +1 for each shared technical skill
//    - +3 if they're a faculty member with mentor availability (for students)
//    - +1 if they're a different role (encourages cross-role collaboration)
// 4. Sort by score descending, take top 10
// 5. Return with the match reasons
export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  const fullUser = await db.user.findUnique({
    where: { id: user.id },
    include: { profile: true, mentorPref: true },
  })
  if (!fullUser) return NextResponse.json({ items: [] })

  const myInterests = (fullUser.profile?.researchInterests ?? '')
    .split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
  const mySkills = (fullUser.profile?.technicalSkills ?? '')
    .split(',').map(s => s.trim().toLowerCase()).filter(Boolean)

  if (myInterests.length === 0 && mySkills.length === 0) {
    return NextResponse.json({
      items: [],
      message: 'Add your research interests and technical skills in your profile to get personalized recommendations.',
    })
  }

  // Find candidate users (public, not banned, not the current user, with research interests or skills)
  const candidates = await db.user.findMany({
    where: {
      id: { not: user.id },
      isBanned: false,
      isPublic: true,
      role: { in: ['RESEARCHER', 'FACULTY'] },
      profile: {
        OR: [
          { researchInterests: { not: null } },
          { technicalSkills: { not: null } },
        ],
      },
    },
    include: { profile: true, mentorPref: true },
    take: 100,
  })

  const scored = candidates.map(c => {
    const theirInterests = (c.profile?.researchInterests ?? '')
      .split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
    const theirSkills = (c.profile?.technicalSkills ?? '')
      .split(',').map(s => s.trim().toLowerCase()).filter(Boolean)

    const sharedInterests = myInterests.filter(i => theirInterests.some(t => t.includes(i) || i.includes(t)))
    const sharedSkills = mySkills.filter(s => theirSkills.some(t => t.includes(s) || s.includes(t)))

    let score = sharedInterests.length * 2 + sharedSkills.length
    const reasons: string[] = []

    if (sharedInterests.length > 0) {
      reasons.push(`Shared research interests: ${sharedInterests.slice(0, 3).join(', ')}`)
    }
    if (sharedSkills.length > 0) {
      reasons.push(`Shared technical skills: ${sharedSkills.slice(0, 3).join(', ')}`)
    }

    // Bonus: faculty with mentor availability for students
    if (fullUser.role === 'STUDENT' && c.role === 'FACULTY' && c.mentorPref?.isAvailable) {
      score += 3
      reasons.push('Available for mentoring')
    }

    // Bonus: different role encourages cross-role collaboration
    if (c.role !== fullUser.role) {
      score += 1
      reasons.push(`Different role (${c.role.toLowerCase()}) — complementary perspective`)
    }

    // Bonus: mentor availability for anyone
    if (c.mentorPref?.isAvailable && !reasons.includes('Available for mentoring')) {
      score += 1
      reasons.push('Open to collaboration')
    }

    return {
      id: c.id,
      name: c.name,
      role: c.role,
      bio: c.bio,
      institution: c.profile?.institution,
      department: c.profile?.department,
      position: c.profile?.position,
      researchInterests: c.profile?.researchInterests,
      technicalSkills: c.profile?.technicalSkills,
      isMentor: c.mentorPref?.isAvailable ?? false,
      score,
      reasons,
    }
  })

  // Filter to those with score > 0, sort by score descending, take top 10
  const ranked = scored
    .filter(c => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)

  return NextResponse.json({ items: ranked, myInterests, mySkills })
}
