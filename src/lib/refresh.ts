// Daily automatic content refresh (run by Vercel Cron via /api/cron/daily, or by an admin).
//
// What it does — conservatively, never overwriting values that already exist:
//  1. DOAJ: adds open-access journals published in Bangladesh (DOAJ is a curated directory),
//     and fills missing ISSN / publisher / homepage / open-access fields on matching journals.
//  2. OpenAlex: fills missing ISSN, publisher and open-access status for journals already on the
//     site (exact title match only). OpenAlex is NOT used to add journals, because its country
//     attribution includes many doubtful titles.
//  3. Conferences: new editions from ccf-deadlines (international, CS/AI, well-ranked series) and
//     conf.info.bd (Bangladesh); see conference-feeds.ts.
//  4. OpenAlex citation metrics for journals with an ISSN.
//  5. Events: marks events whose date has passed as "past".
// Every run is recorded in the audit log.
import { db } from '@/lib/db'
import { refreshInternationalConferences, refreshBangladeshConferences } from '@/lib/conference-feeds'

type Report = { doajAdded: number; doajUpdated: number; openalexUpdated: number; metricsUpdated: number; conferencesAdded: number; conferencesUpdated: number; eventsClosed: number; errors: string[] }

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
    select: { id: true, title: true, publisher: true, openAccess: true, website: true, scope: true },
  })
  const now = new Date()
  for (const j of todo) {
    try {
      const d = await getJson(`https://api.openalex.org/sources?search=${encodeURIComponent(j.title)}&per-page=5&select=display_name,issn_l,issn,host_organization_name,is_oa,type,country_code${key}${mailto}`)
      type Src = { display_name: string; issn_l?: string | null; issn?: string[] | null; host_organization_name?: string | null; is_oa?: boolean; type?: string; country_code?: string | null }
      // Bangladeshi journals must also be attributed to Bangladesh, so a generic title
      // (e.g. "Pulse", "Spectrum") never picks up a foreign journal's ISSN.
      const isBd = (j.website ?? '').includes('banglajol.info') || (j.scope ?? '').includes('published in Bangladesh')
      const hit = ((d.results ?? []) as Src[]).find(s => s.type === 'journal' && norm(s.display_name) === norm(j.title) && (!isBd || s.country_code === 'BD'))
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

// OpenAlex citation metrics (2-year mean citedness, h-index, works count) for journals with an ISSN.
// Up to 100 journals per day, refreshing each roughly monthly.
async function refreshOpenAlexMetrics(report: Report) {
  const key = process.env.OPENALEX_API_KEY ? `&api_key=${encodeURIComponent(process.env.OPENALEX_API_KEY)}` : ''
  const monthAgo = new Date(Date.now() - 30 * 86400000)
  const todo = await db.journal.findMany({
    where: { OR: [{ issn: { not: null } }, { eissn: { not: null } }], AND: [{ OR: [{ oaMetricsAt: null }, { oaMetricsAt: { lt: monthAgo } }] }] },
    orderBy: [{ oaMetricsAt: { sort: 'asc', nulls: 'first' } }],
    take: 100,
    select: { id: true, issn: true, eissn: true },
  })
  for (let i = 0; i < todo.length; i += 50) {
    const batch = todo.slice(i, i + 50)
    const issns = [...new Set(batch.flatMap(j => [j.issn, j.eissn]).filter((x): x is string => !!x))]
    const d = await getJson(`https://api.openalex.org/sources?filter=issn:${issns.join('|')}&per-page=100&select=issn,summary_stats,works_count${key}`)
    type Src = { issn?: string[] | null; works_count?: number; summary_stats?: { '2yr_mean_citedness'?: number; h_index?: number } }
    const byIssn = new Map<string, Src>()
    for (const r of (d.results ?? []) as Src[]) for (const x of r.issn ?? []) byIssn.set(x, r)
    const now = new Date()
    for (const j of batch) {
      const hit = (j.issn && byIssn.get(j.issn)) || (j.eissn && byIssn.get(j.eissn))
      const data: Record<string, unknown> = { oaMetricsAt: now }
      if (hit) {
        const c = hit.summary_stats?.['2yr_mean_citedness']
        if (typeof c === 'number') data.oaCitedness = Math.round(c * 1000) / 1000
        if (typeof hit.summary_stats?.h_index === 'number') data.oaHIndex = hit.summary_stats.h_index
        if (typeof hit.works_count === 'number') data.oaWorksCount = hit.works_count
        report.metricsUpdated++
      }
      await db.journal.update({ where: { id: j.id }, data })
    }
  }
}

export async function runDailyRefresh(actorId: string | null = null): Promise<Report> {
  const report: Report = { doajAdded: 0, doajUpdated: 0, openalexUpdated: 0, metricsUpdated: 0, conferencesAdded: 0, conferencesUpdated: 0, eventsClosed: 0, errors: [] }
  try { await refreshFromDoaj(report) } catch (e) { report.errors.push(`doaj: ${(e as Error).message}`) }
  try { await enrichFromOpenAlex(report) } catch (e) { report.errors.push(`openalex: ${(e as Error).message}`) }
  for (const [name, fn] of [['ccf-deadlines', refreshInternationalConferences], ['conf.info.bd', refreshBangladeshConferences]] as const) {
    try { const r = await fn(); report.conferencesAdded += r.added; report.conferencesUpdated += r.updated } catch (e) { report.errors.push(`${name}: ${(e as Error).message}`) }
  }
  try { await refreshOpenAlexMetrics(report) } catch (e) { report.errors.push(`openalex metrics: ${(e as Error).message}`) }
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
