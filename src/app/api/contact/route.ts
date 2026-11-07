import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const Schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(3),
  message: z.string().min(10),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
  }
  // In production this would email the message. For now we log it.
  console.log('[contact form]', parsed.data)
  return NextResponse.json({ ok: true })
}
