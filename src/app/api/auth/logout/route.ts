import { NextResponse } from 'next/server'
import { destroySession } from '@/lib/auth'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete('rbd_session')
  return res
}
