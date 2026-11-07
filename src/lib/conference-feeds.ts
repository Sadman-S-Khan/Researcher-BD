// Automatic conference discovery used by the daily refresh.
//  • International: the open ccf-deadlines dataset (MIT licence, https://github.com/ccfddl/ccf-deadlines),
//    which tracks dates, deadlines and venues of computer-science conferences. Only well-ranked
//    series (CCF A/B or CORE A*/A) are imported to keep the list useful.
//  • Bangladesh: the public conference table at https://conf.info.bd (robots.txt allows general
//    access; we read it once a day, credit it, and link to each official conference site).
// New editions are added as "listed"; for editions already on the site only empty fields are filled.
import { parse as parseYaml } from 'yaml'
import { db } from '@/lib/db'

const UA = 'Researcher-BD/1.0 (+https://researcherbd.vercel.app)'
const MONTHS: Record<string, number> = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 }
const SUBJECTS: Record<string, string> = {
  AI: 'Artificial intelligence', CG: 'Computer graphics and multimedia', CT: 'Theory of computing', DB: 'Databases, data mining and information retrieval',
  DS: 'Computer architecture, parallel and distributed systems', HI: 'Human-computer interaction', MX: 'Interdisciplinary computing',
  NW: 'Computer networks', SC: 'Security and privacy', SE: 'Software engineering and programming languages',
}

/** "June 20-25, 2027" | "Oct 09–10, 2026" | "Jan 30 - Feb 2, 2027" -> start date (UTC) */
export function parseStartDate(text: string | null | undefined): Date | null {
  if (!text) return null
  const m = text.match(/([A-Za-z]{3})[a-z]*\.?\s+(\d{1,2})\b[^0-9]*?(?:.*?)(\d{4})/)
  if (!m) return null
  const mon = MONTHS[m[1].toLowerCase()]
  if (mon === undefined) return null
  const d = new Date(Date.UTC(Number(m[3]), mon, Number(m[2])))
  return Number.isNaN(d.getTime()) ? null : d
}

/** "2026-11-16 23:59:59" or "Jun 14, 2026" -> date (UTC), else null */
function parseDeadline(text: unknown): Date | null {
  if (typeof text !== 'string' || /tbd|tba/i.test(text)) return null
  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) return new Date(Date.UTC(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3])))
  return parseStartDate(text)
}

/** Key from an acronym + year, e.g. ("AAAI", "27") -> "aaai2027" */
const keyOf = (acr: string, year: string | number) => {
  let y = String(year)
  if (y.length === 2) y = `20${y}`
  return acr.toLowerCase().replace(/^ieee\s+/, '').replace(/[^a-z0-9]/g, '') + y
}
/** Key from an existing title ending in "(ACRONYM 2027)" or "(ACRONYM-27)" */
const keyFromTitle = (title: string) => {
  const m = title.match(/\(([^()]*?)[\s-]((?:19|20)?\d{2})\)\s*$/)
  return m ? keyOf(m[1], m[2]) : null
}

type Incoming = { key: string; title: string; eventDate: Date | null; submissionDeadline: Date | null; location: string | null; website: string | null; organizer: string | null; researchTracks: string | null }

async function upsertConferences(items: Incoming[]) {
  const existing = await db.conference.findMany({ select: { id: true, title: true, eventDate: true, submissionDeadline: true, location: true, website: true } })
  const byKey = new Map<string, (typeof existing)[number]>()
  for (const c of existing) { const k = keyFromTitle(c.title); if (k) byKey.set(k, c) }
  const titles = new Set(existing.map(c => c.title.toLowerCase()))
  let added = 0, updated = 0
  const now = new Date()
  for (const it of items) {
    const match = byKey.get(it.key)
    if (match) {
      const data: Record<string, unknown> = {}
      if (!match.eventDate && it.eventDate) data.eventDate = it.eventDate
      if (!match.submissionDeadline && it.submissionDeadline) data.submissionDeadline = it.submissionDeadline
      if (!match.location && it.location) data.location = it.location
      if (!match.website && it.website) data.website = it.website
      if (Object.keys(data).length) { await db.conference.update({ where: { id: match.id }, data: { ...data, lastCheckedAt: now } }); updated++ }
    } else if (!titles.has(it.title.toLowerCase())) {
      await db.conference.create({ data: { title: it.title, organizer: it.organizer, location: it.location, eventDate: it.eventDate, submissionDeadline: it.submissionDeadline, website: it.website, researchTracks: it.researchTracks, verification: 'listed', lastCheckedAt: now } })
      titles.add(it.title.toLowerCase()); byKey.set(it.key, { id: '', title: it.title, eventDate: it.eventDate, submissionDeadline: it.submissionDeadline, location: it.location, website: it.website })
      added++
    }
  }
  return { added, updated }
}

type CcfConf = { year: number; id?: string; link?: string; timeline?: Record<string, string>[]; date?: string; place?: string }
type CcfSeries = { title: string; description?: string; sub?: string; rank?: { ccf?: string; core?: string }; confs?: CcfConf[] }

export async function refreshInternationalConferences() {
  const res = await fetch('https://ccfddl.com/conference/allconf.yml', { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(20000) })
  if (!res.ok) throw new Error(`ccfddl ${res.status}`)
  const data = parseYaml(await res.text()) as CcfSeries[]
  const today = new Date(Date.now() - 86400000)
  const items: Incoming[] = []
  for (const s of Array.isArray(data) ? data : []) {
    const ccf = s.rank?.ccf ?? ''
    const core = s.rank?.core ?? ''
    const good = ccf === 'A' || ccf === 'B' || core === 'A*' || core === 'A'
    if (!good || !s.title) continue
    for (const c of s.confs ?? []) {
      const eventDate = parseStartDate(c.date)
      const deadlines = (c.timeline ?? []).map(t => parseDeadline(t.deadline)).filter((d): d is Date => !!d)
      const submissionDeadline = deadlines.length ? deadlines[deadlines.length - 1] : null
      const upcoming = (eventDate && eventDate >= today) || (!eventDate && submissionDeadline && submissionDeadline >= today)
      if (!upcoming) continue
      const ranks = [ccf && `CCF ${ccf}`, core && core !== 'N' && `CORE ${core}`].filter(Boolean).join(', ')
      const tracks = [SUBJECTS[s.sub ?? ''] ?? null, ranks ? `Rankings: ${ranks}` : null, 'Source: ccf-deadlines (open dataset)'].filter(Boolean).join('. ')
      const name = (s.description ?? s.title).replace(/\s+/g, ' ').trim()
      items.push({
        key: keyOf(s.title, c.year),
        title: `${name} (${s.title} ${c.year})`,
        eventDate, submissionDeadline,
        location: c.place?.trim() || null,
        website: c.link || null,
        organizer: null,
        researchTracks: tracks,
      })
    }
  }
  return upsertConferences(items)
}

const strip = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&rsquo;/g, "'").replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()

export async function refreshBangladeshConferences() {
  const res = await fetch('https://conf.info.bd/', { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(15000) })
  if (!res.ok) throw new Error(`conf.info.bd ${res.status}`)
  const html = await res.text()
  const today = new Date(Date.now() - 86400000)
  const items: Incoming[] = []
  for (const row of html.match(/<tr[^>]*>[\s\S]*?<\/tr>/g) ?? []) {
    const cells = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map(m => m[1])
    if (cells.length < 6 || !/conf-name/.test(row)) continue
    const name = strip(cells[0])
    const ym = name.match(/^(.*?)[\s-]+((?:19|20)\d{2})$/)
    if (!name || !ym) continue
    const eventDate = parseStartDate(strip(cells[2]))
    const submissionDeadline = parseDeadline(strip(cells[1]))
    if (eventDate && eventDate < today) continue
    const venue = strip(cells[3]); const city = strip(cells[4])
    const link = cells[5].match(/href="([^"]+)"/)?.[1] ?? null
    const location = [venue, city].filter(Boolean).join(', ')
    items.push({
      key: keyOf(ym[1], ym[2]),
      title: name,
      eventDate, submissionDeadline,
      location: /bangladesh/i.test(location) ? location : `${location}, Bangladesh`,
      website: link,
      organizer: venue || null,
      researchTracks: 'Listed by conf.info.bd; see the official website for tracks and the call for papers.',
    })
  }
  return upsertConferences(items)
}
