import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { rateLimit, getClientId, rateLimitedResponse, RATE_LIMITS } from '@/lib/rate-limit'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { put } from '@vercel/blob'

// Allowed MIME types and max file size
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
// Extension is derived from the validated MIME type, never from the client-supplied file name
// (otherwise "evil.html" sent as image/png would be stored and served as HTML => stored XSS).
const EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}
const MAX_SIZE = 2 * 1024 * 1024 // 2 MB

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  // Rate limit: 5 uploads per hour
  const clientId = getClientId(req, 'upload-avatar')
  const rl = rateLimit(clientId, { windowMs: 60 * 60 * 1000, max: 5 })
  if (!rl.success) return rateLimitedResponse(rl.resetAt) as NextResponse

  const formData = await req.formData()
  const file = formData.get('avatar') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  // Validate type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({
      error: `Invalid file type. Allowed: ${ALLOWED_TYPES.join(', ')}`,
    }, { status: 400 })
  }

  // Validate size
  if (file.size > MAX_SIZE) {
    return NextResponse.json({
      error: `File too large. Maximum size is ${MAX_SIZE / 1024 / 1024} MB.`,
    }, { status: 400 })
  }

  // Generate a unique filename
  const ext = EXT_BY_TYPE[file.type]
  const filename = `${user.id}-${Date.now()}.${ext}`
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars')
  const filepath = path.join(uploadDir, filename)

  const bytes = await file.arrayBuffer()
  let avatarUrl: string

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const bucket = process.env.SUPABASE_AVATAR_BUCKET || 'avatars'

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    // Vercel Blob (preferred on Vercel)
    try {
      const blob = await put(`avatars/${filename}`, Buffer.from(bytes), {
        access: 'public',
        contentType: file.type,
        addRandomSuffix: true,
      })
      avatarUrl = blob.url
    } catch (e) {
      console.error('blob upload failed', e)
      return NextResponse.json({ error: 'Could not upload avatar' }, { status: 502 })
    }
  } else if (supabaseUrl && serviceKey) {
    // Supabase Storage (PUBLIC bucket)
    const res = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${filename}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
        'Content-Type': file.type,
        'x-upsert': 'true',
      },
      body: Buffer.from(bytes),
    })
    if (!res.ok) {
      console.error('avatar upload failed', res.status, await res.text().catch(() => ''))
      return NextResponse.json({ error: 'Could not upload avatar' }, { status: 502 })
    }
    avatarUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${filename}`
  } else if (process.env.VERCEL) {
    // No object storage configured on a read-only filesystem: store a small data URL in the database.
    if (file.size > 512 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum size is 0.5 MB.' }, { status: 400 })
    }
    avatarUrl = `data:${file.type};base64,${Buffer.from(bytes).toString('base64')}`
  } else {
    // Local development: write to public/uploads
    try { await mkdir(uploadDir, { recursive: true }) } catch {}
    await writeFile(filepath, Buffer.from(bytes))
    avatarUrl = `/uploads/avatars/${filename}`
  }
  await db.user.update({
    where: { id: user.id },
    data: { avatarUrl },
  })

  return NextResponse.json({ avatarUrl })
}
