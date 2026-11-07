import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'

// DOI publication metadata lookup.
// Tries Crossref first (no auth required for the polite pool — just a mailto),
// then falls back to OpenAlex. If neither is configured or reachable, returns
// a clear "not configured" error so the UI can degrade gracefully.

const CROSSREF_MAILTO = process.env.CROSSREF_MAILTO || process.env.OPENALEX_MAILTO || ''

interface CrossrefMessage {
  title?: string[]
  author?: Array<{ given?: string; family?: string }>
  'container-title'?: string[]
  'published-print'?: { 'date-parts'?: number[][] }
  'published-online'?: { 'date-parts'?: number[][] }
  ISSN?: string[]
  publisher?: string
  abstract?: string
  URL?: string
  type?: string
}

interface CrossrefResponse {
  message?: CrossrefMessage
  status?: string
}

interface OpenAlexWork {
  id?: string
  title?: string
  display_name?: string
  publication_year?: number
  authorships?: Array<{ author?: { display_name?: string; orcid?: string } }>
  host_venue?: { display_name?: string; issn?: string[]; publisher?: string }
  abstract_inverted_index?: Record<string, number[]>
  doi?: string
  type?: string
}

async function fetchCrossref(doi: string): Promise<any | null> {
  const url = `https://api.crossref.org/works/${encodeURIComponent(doi)}${CROSSREF_MAILTO ? `?mailto=${encodeURIComponent(CROSSREF_MAILTO)}` : ''}`
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': CROSSREF_MAILTO ? `Researcher-BD/1.0 (mailto:${CROSSREF_MAILTO})` : 'Researcher-BD/1.0' },
    })
    clearTimeout(timeout)
    if (!res.ok) return null
    const data: CrossrefResponse = await res.json()
    const m = data.message
    if (!m) return null
    const authors = (m.author ?? []).map(a => [a.given, a.family].filter(Boolean).join(' ')).filter(Boolean)
    const dateParts = m['published-print']?.['date-parts']?.[0] ?? m['published-online']?.['date-parts']?.[0]
    const year = dateParts?.[0]
    return {
      source: 'crossref',
      retrievedAt: new Date().toISOString(),
      doi,
      title: m.title?.[0] ?? '',
      authorsList: JSON.stringify(authors),
      abstract: m.abstract ?? null,
      venue: m['container-title']?.[0] ?? null,
      publisher: m.publisher ?? null,
      year: year ?? null,
      url: m.URL ?? `https://doi.org/${doi}`,
      issn: m.ISSN?.[0] ?? null,
      type: m.type ?? 'journal-article',
    }
  } catch {
    return null
  }
}

async function fetchOpenAlex(doi: string): Promise<any | null> {
  // OpenAlex uses lowercase doi URL
  const doiUrl = doi.startsWith('10.') ? `https://doi.org/${doi}` : doi
  const url = `https://api.openalex.org/works/doi:${encodeURIComponent(doiUrl.replace('https://doi.org/', ''))}`
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': CROSSREF_MAILTO ? `Researcher-BD/1.0 (mailto:${CROSSREF_MAILTO})` : 'Researcher-BD/1.0' },
    })
    clearTimeout(timeout)
    if (!res.ok) return null
    const w: OpenAlexWork = await res.json()
    const authors = (w.authorships ?? []).map(a => a.author?.display_name).filter(Boolean) as string[]
    // Reconstruct abstract from inverted index
    let abstract: string | null = null
    if (w.abstract_inverted_index) {
      const positions: Array<[string, number]> = []
      for (const [word, idxs] of Object.entries(w.abstract_inverted_index)) {
        for (const i of idxs) positions.push([word, i])
      }
      positions.sort((a, b) => a[1] - b[1])
      abstract = positions.map(p => p[0]).join(' ')
    }
    return {
      source: 'openalex',
      retrievedAt: new Date().toISOString(),
      doi,
      title: w.title ?? w.display_name ?? '',
      authorsList: JSON.stringify(authors),
      abstract,
      venue: w.host_venue?.display_name ?? null,
      publisher: w.host_venue?.publisher ?? null,
      year: w.publication_year ?? null,
      url: doiUrl,
      issn: w.host_venue?.issn?.[0] ?? null,
      type: w.type ?? 'journal-article',
    }
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  const url = new URL(req.url)
  const doi = url.searchParams.get('doi')?.trim()
  if (!doi) return NextResponse.json({ error: 'DOI required' }, { status: 400 })

  // Normalize: strip 'doi:' prefix, strip URL prefix
  const normalized = doi.replace(/^https?:\/\/doi\.org\//i, '').replace(/^doi:/i, '').trim()

  // Try Crossref first, then OpenAlex
  let metadata = await fetchCrossref(normalized)
  if (!metadata) {
    metadata = await fetchOpenAlex(normalized)
  }

  if (!metadata) {
    return NextResponse.json({
      error: 'Could not retrieve metadata for this DOI',
      detail: 'The DOI may not be registered with Crossref or OpenAlex, or both services are temporarily unreachable.',
      doi: normalized,
    }, { status: 404 })
  }

  // Check if this DOI already exists in our database
  const existing = await db.publication.findFirst({ where: { doi: normalized } })
  if (existing) {
    return NextResponse.json({ metadata, existing })
  }

  return NextResponse.json({ metadata })
}

// POST: save the looked-up publication to the user's records
export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  const body = await req.json()
  const { metadata, claimAuthorship } = body
  if (!metadata?.doi) return NextResponse.json({ error: 'Metadata with DOI required' }, { status: 400 })

  // Check duplicate
  const existing = await db.publication.findFirst({ where: { doi: metadata.doi } })
  if (existing) {
    // Just create an authorship claim if requested
    if (claimAuthorship) {
      const claim = await db.publicationClaim.create({
        data: { publicationId: existing.id, userId: user.id, status: 'pending' },
      })
      return NextResponse.json({ publication: existing, claim })
    }
    return NextResponse.json({ publication: existing, alreadyExists: true })
  }

  // Create publication
  const pub = await db.publication.create({
    data: {
      title: metadata.title,
      type: metadata.type ?? 'journal-article',
      authorsList: metadata.authorsList ?? '[]',
      abstract: metadata.abstract,
      doi: metadata.doi,
      venue: metadata.venue,
      publisher: metadata.publisher,
      year: metadata.year,
      url: metadata.url,
      source: metadata.source,
      verification: 'imported',
      userId: user.id,
    },
  })

  // Optionally create an authorship claim
  let claim = null
  if (claimAuthorship) {
    claim = await db.publicationClaim.create({
      data: { publicationId: pub.id, userId: user.id, status: 'pending', evidenceNote: 'Self-claim after DOI import' },
    })
  }

  return NextResponse.json({ publication: pub, claim })
}
