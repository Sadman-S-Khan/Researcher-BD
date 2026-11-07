import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const cat = url.searchParams.get('cat')
  const q = url.searchParams.get('q')?.trim()

  const where: any = {}
  if (cat && cat !== 'all') where.category = cat
  if (q) {
    where.OR = [
      { titleEn: { contains: q } },
      { titleBn: { contains: q } },
      { bodyEn: { contains: q } },
      { bodyBn: { contains: q } },
    ]
  }

  const lessons = await db.lesson.findMany({
    where,
    orderBy: { order: 'asc' },
    include: { categoryRef: true, path: true },
  })

  const categories = await db.learningCategory.findMany({
    orderBy: { order: 'asc' },
  })

  const paths = await db.learningPath.findMany({
    orderBy: { order: 'asc' },
  })

  // For logged-in users, include progress
  const user = await getCurrentUser()
  let progress: { lessonId: string; completed: boolean }[] = []
  let bookmarks: string[] = []
  if (user) {
    const [p, b] = await Promise.all([
      db.lessonProgress.findMany({ where: { userId: user.id }, select: { lessonId: true, completed: true } }),
      db.learningBookmark.findMany({ where: { userId: user.id }, select: { lessonId: true } }),
    ])
    progress = p
    bookmarks = b.map(x => x.lessonId)
  }

  return NextResponse.json({
    lessons,
    categories,
    paths,
    progress,
    bookmarks,
  })
}
