import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { z } from 'zod'

// Imports one chunk of the SCImago Journal Rank file (parsed in the admin's browser).
// SCImago covers journals indexed in Scopus, so imported journals are marked scopusIndexed=true
// with the SCImago year as evidence. Existing journals (matched by ISSN or exact title) get their
// metrics updated; journals not yet listed are added.
export const maxDuration = 60

const row = z.object({
  sourceId: z.string().max(40),
  title: z.string().min(1).max(500),
  issns: z.array(z.string().max(12)).max(4),
  sjr: z.number().nullable(),
  quartile: z.enum(['Q1', 'Q2', 'Q3', 'Q4']).nullable(),
  hIndex: z.number().int().nullable(),
  country: z.string().max(100).nullable(),
  publisher: z.string().max(300).nullable(),
  categories: z.string().max(2000).nullable(),
  areas: z.string().max(1000).nullable(),
})
const body = z.object({ year: z.number().int().min(1999).max(2100), rows: z.array(row).max(2000) })

const fmtIssn = (s: string) => { const d = s.replace(/[^0-9Xx]/g, '').toUpperCase(); return d.length === 8 ? `${d.slice(0, 4)}-${d.slice(4)}` : null }
const norm = (s: string) => s.toLowerCase().replace(/^the\s+/, '').replace(/&/g, 'and').replace(/[^a-z0-9]+/g, ' ').trim()

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const parsed = body.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid import data' }, { status: 400 })
  const { year, rows } = parsed.data

  const existing = await db.journal.findMany({ select: { id: true, title: true, issn: true, eissn: true, publisher: true, scimagoId: true } })
  const byIssn = new Map<string, (typeof existing)[number]>()
  const byTitle = new Map<string, (typeof existing)[number]>()
  const bySid = new Map<string, (typeof existing)[number]>()
  for (const j of existing) {
    if (j.issn) byIssn.set(j.issn, j)
    if (j.eissn) byIssn.set(j.eissn, j)
    if (j.scimagoId) bySid.set(j.scimagoId, j)
    byTitle.set(norm(j.title), j)
  }

  const now = new Date()
  let updated = 0
  const toCreate: any[] = []
  for (const r of rows) {
    const issns = r.issns.map(fmtIssn).filter((x): x is string => !!x)
    const sourceUrl = `https://www.scimagojr.com/journalsearch.php?q=${encodeURIComponent(r.sourceId)}&tip=sid`
    const claim = `Indexed in Scopus according to SCImago Journal Rank ${year}: ${sourceUrl}`
    const categories = (r.categories ?? '').replace(/\s*\(Q[1-4]\)/g, '')
    const subjectAreas = [r.areas, categories].filter(Boolean).join('; ') || null
    const metrics = { scopusIndexed: true, scimagoId: r.sourceId, sjrScore: r.sjr, sjrQuartile: r.quartile, hIndex: r.hIndex, metricsYear: year, lastCheckedAt: now }
    const match = bySid.get(r.sourceId) || issns.map(i => byIssn.get(i)).find(Boolean) || byTitle.get(norm(r.title))
    if (match) {
      await db.journal.update({
        where: { id: match.id },
        data: {
          ...metrics,
          ...(match.issn ? {} : issns[0] ? { issn: issns[0] } : {}),
          ...(match.eissn ? {} : issns[1] ? { eissn: issns[1] } : {}),
          ...(match.publisher ? {} : r.publisher ? { publisher: r.publisher } : {}),
        },
      })
      updated++
    } else {
      toCreate.push({
        title: r.title, issn: issns[0] ?? null, eissn: issns[1] ?? null, publisher: r.publisher, country: r.country,
        subjectAreas, website: sourceUrl, indexingClaims: claim, verification: 'listed',
        scope: `Scopus-indexed journal${r.country ? ` (${r.country})` : ''}. Subject categories: ${categories || 'see SCImago'}. See the SCImago page for the journal homepage.`,
        ...metrics,
      })
    }
  }
  if (toCreate.length) await db.journal.createMany({ data: toCreate })
  return NextResponse.json({ updated, added: toCreate.length })
}

// Finalise an import: record it in the audit log.
export async function PUT(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const b = await req.json().catch(() => ({}))
  await db.auditLog.create({ data: { actorId: user.id, action: 'journal.scimago_import', targetType: 'journal', metadata: JSON.stringify(b).slice(0, 2000) } })
  return NextResponse.json({ ok: true })
}
