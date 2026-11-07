import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { runDailyRefresh } from '@/lib/refresh'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

// Vercel Cron calls this with "Authorization: Bearer $CRON_SECRET" (see vercel.json).
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const report = await runDailyRefresh(null)
  return NextResponse.json({ ok: true, report })
}

// Admins can trigger the same refresh from the admin panel.
export async function POST() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const report = await runDailyRefresh(user.id)
  return NextResponse.json({ ok: true, report })
}
