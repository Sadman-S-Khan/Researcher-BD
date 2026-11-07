// Daily automatic content refresh (run by Vercel Cron via /api/cron/daily, or by an admin).
//
// What it does — conservatively, never overwriting values that already exist:
//  1. DOAJ: adds open-access journals published in Bangladesh (DOAJ is a curated directory),
//     and fills missing ISSN / publisher / homepage / open-access fields on matching journals.
//  2. OpenAlex: fills missing ISSN, publisher and open-access status for journals already on the
//     site (exact title match only). OpenAlex is NOT used to add journals, because its country
//     attribution includes many doubtful titles.
//  3. Events: marks events whose date has passed as "past".
// Every run is recorded in the audit log.
import { db } from '@/lib/db'

type Report = { doajAdded: number; doajUpdated: number; openalexUpdated: number; eventsClosed: number; errors: string[] }

const norm = (s: string) => s.toLowerCase().replace(/^the\s+/, '').replace(/&/g, 'and').replace(/[^a-z0-9]+/g, ' ').trim()

async function getJson(url: string) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Researcher-BD/1.0 (+https://researcherbd.vercel.app)' }, signal: AbortSignal.timeout(12000) })
  if (!res.ok) throw new Error(`${new URL(url).host} ${res.status}`)
  return res.json()
}

type DoajBib = {
  title?: string; pissn?: string; eissn?: string
  publisher?: { name?: string }
  ref?: { journal?: string }
  subject?: { term?: string }[]
}

async function refreshFromDoaj(report: Report) {
  const all: DoajBib[] = []
  for (let page = 1; page <= 5; page++) {
    const d = await getJson(`https://doaj.org/api/search/journals/bibjson.publisher.country%3ABD?page=${page}&pageSize=100`)
    const results = (d.results ?? []) as { bibjson: DoajBib }[]
    all.push(...results.map(r => r.bibjson))
    if (all.length >= (d.total ?? 0) || results.length === 0) break
  }

  const existing = await db.journal.findMany({ select: { id: true, title: true, issn: true, eissn: true, publisher: true, website: true, openAccess: true, subjectAreas: true, indexingClaims: true } })
  const byIssn = new Map<string, (typeof existing)[number]>()
  const byTitle = new Map<string, (typeof existing)[number]>()
  for (const j of existing) {
    if (j.issn) byIssn.set(j.issn, j)
    if (j.eissn) byIssn.set(j.eissn, j)
    byTitle.set(norm(j.title), j)
  }

  const now = new Date()
  for (const b of all) {
    if (!b.title) continue
    const issnKey = b.eissn || b.pissn
    const doajUrl = issnKey ? `https://doaj.org/toc/${issnKey}` : 'https://doaj.org/'
    const claim = `Listed in DOAJ (checked ${now.toISOString().slice(0, 10)}): ${doajUrl}`
    const subjects = (b.subject ?? []).map(s => s.term).filter(Boolean).join(', ') || null
    const match = (b.eissn && byIssn.get(b.eissn)) || (b.pissn && byIssn.get(b.pissn)) || byTitle.get(norm(b.title))
    if (match) {
      const data: Record<string, unknown> = { lastCheckedAt: now }
      if (!match.issn && b.pissn) data.issn = b.pissn
      if (!match.eissn && b.eissn) data.eissn = b.eissn
      if (!match.publisher && b.publisher?.name) data.publisher = b.publisher.name
      if (!match.website && b.ref?.journal) data.website = b.ref.journal
      if (match.openAccess == null) data.openAccess = true
      if (!match.subjectAreas && subjects) data.subjectAreas = subjects
      if (!match.indexingClaims) data.indexingClaims = claim
      if (Object.keys(data).length > 1) report.doajUpdated++
      await db.journal.update({ where: { id: match.id }, data })
    } else {
      await db.journal.create({
        data: {
          title: b.title, issn: b.pissn || null, eissn: b.eissn || null, publisher: b.publisher?.name || null,
          subjectAreas: subjects, website: b.ref?.journal || doajUrl, openAccess: true,
          scope: 'Open-access journal published in Bangladesh and listed in the Directory of Open Access Journals (DOAJ). See the journal website for aims and scope.',
          indexingClaims: claim, verification: 'listed', lastCheckedAt: now,
        },
      })
      report.doajAdded++
    }
  }
}

async function enrichFromOpenAlex(report: Report) {
  const key = process.env.OPENALEX_API_KEY ? `&api_key=${encodeURIComponent(process.env.OPENALEX_API_KEY)}` : ''
  const mailto = process.env.OPENALEX_MAILTO ? `&mailto=${encodeURIComponent(process.env.OPENALEX_MAILTO)}` : ''
  // Journals still missing an ISSN, least recently checked first
  const todo = await db.journal.findMany({
    where: { issn: null, eissn: null },
    orderBy: [{ lastCheckedAt: { sort: 'asc', nulls: 'first' } }],
    take: 25,
    select: { id: true, title: true, publisher: true, openAccess: true },
  })
  const now = new Date()
  for (const j of todo) {
    try {
      const d = await getJson(`https://api.openalex.org/sources?search=${encodeURIComponent(j.title)}&per-page=5&select=display_name,issn_l,issn,host_organization_name,is_oa,type${key}${mailto}`)
      type Src = { display_name: string; issn_l?: string | null; issn?: string[] | null; host_organization_name?: string | null; is_oa?: boolean; type?: string }
      const hit = ((d.results ?? []) as Src[]).find(s => s.type === 'journal' && norm(s.display_name) === norm(j.title))
      const data: Record<string, unknown> = { lastCheckedAt: now }
      if (hit?.issn_l) {
        data.issn = hit.issn_l
        const other = (hit.issn ?? []).find(x => x !== hit.issn_l)
        if (other) data.eissn = other
        if (!j.publisher && hit.host_organization_name) data.publisher = hit.host_organization_name
        if (j.openAccess == null && typeof hit.is_oa === 'boolean') data.openAccess = hit.is_oa
        report.openalexUpdated++
      }
      await db.journal.update({ where: { id: j.id }, data })
    } catch (e) {
      report.errors.push(`openalex: ${(e as Error).message}`)
      break // stop early if rate limited or unavailable; try again tomorrow
    }
  }
}

export async function runDailyRefresh(actorId: string | null = null): Promise<Report> {
  const report: Report = { doajAdded: 0, doajUpdated: 0, openalexUpdated: 0, eventsClosed: 0, errors: [] }
  try { await refreshFromDoaj(report) } catch (e) { report.errors.push(`doaj: ${(e as Error).message}`) }
  try { await enrichFromOpenAlex(report) } catch (e) { report.errors.push(`openalex: ${(e as Error).message}`) }
  try {
    const r = await db.academicEvent.updateMany({
      where: { status: 'upcoming', startDateTime: { lt: new Date(Date.now() - 86400000) } },
      data: { status: 'past' },
    })
    report.eventsClosed = r.count
  } catch (e) { report.errors.push(`events: ${(e as Error).message}`) }

  await db.auditLog.create({
    data: { actorId, action: 'content.daily_refresh', targetType: 'system', metadata: JSON.stringify(report) },
  }).catch(() => {})
  return report
}
