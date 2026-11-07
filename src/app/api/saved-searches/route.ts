import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ items: [] })
  const items = await db.savedSearch.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ items })
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  const body = await req.json()
  const { name, query, filters } = body
  if (!name?.trim() || !query?.trim()) {
    return NextResponse.json({ error: 'Name and query required' }, { status: 400 })
  }
  const saved = await db.savedSearch.create({
    data: { userId: user.id, name: name.trim(), query: query.trim(), filters: filters ?? null },
  })
  return NextResponse.json({ savedSearch: saved })
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  await db.savedSearch.deleteMany({ where: { id, userId: user.id } })
  return NextResponse.json({ ok: true })
}
