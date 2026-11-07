"use client"

import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { useRouter, useNavigate } from '@/lib/router'
import { ListPage } from '@/components/shared/list-page'
import { PageHeader, DemoBanner, VerificationBadge, formatDate, EmptyState } from '@/components/shared/ui-helpers'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { useSession } from '@/lib/session-context'
import { FIELDS } from '@/lib/fields'
import {
  BookOpen, ExternalLink, Bookmark, BookmarkCheck, ArrowLeft, Building2,
  Globe, FileText, CheckCircle2, AlertCircle, Plus, Calendar, Tag, Link2,
} from 'lucide-react'

export function JournalsPage({ id }: { id?: string }) {
  if (id) return <JournalDetail id={id} />
  return <JournalList />
}

const quartileClass: Record<string, string> = {
  Q1: 'bg-emerald-600 text-white', Q2: 'bg-lime-600 text-white', Q3: 'bg-amber-500 text-white', Q4: 'bg-orange-600 text-white',
}

function MetricBadges({ j, compact = false }: { j: any; compact?: boolean }) {
  const items: string[] = []
  if (j.sjrScore != null) items.push(`SJR ${j.sjrScore.toFixed(2)}`)
  if (j.citeScore != null) items.push(`CiteScore ${j.citeScore.toFixed(1)}${j.citeScoreYear ? ` (${j.citeScoreYear})` : ''}`)
  if (j.impactFactor != null) items.push(`IF ${j.impactFactor.toFixed(2)}${j.impactFactorYear ? ` (${j.impactFactorYear})` : ''}`)
  if (!compact && j.hIndex != null) items.push(`H-index ${j.hIndex}`)
  if (!j.sjrQuartile && items.length === 0 && !j.scopusIndexed) return null
  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-2">
      {j.sjrQuartile && <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${quartileClass[j.sjrQuartile] ?? 'bg-muted'}`}>{j.sjrQuartile}</span>}
      {j.scopusIndexed && <span className="rounded border border-border px-1.5 py-0.5 text-[10px]">Scopus{j.metricsYear ? ` ${j.metricsYear}` : ''}</span>}
      {items.map(x => <span key={x} className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-secondary-foreground tabular-nums">{x}</span>)}
    </div>
  )
}

function JournalList() {
  const { t, locale } = useI18n()
  const bn = locale === 'bn'
  const { user } = useSession()
  const [open, setOpen] = useState(false)
  const [refresh, setRefresh] = useState(0)

  return (
    <>
      <div style={{ display: 'none' }}>{refresh}</div>
      <ListPage
        key={refresh}
        title={t('journals.title')}
        subtitle={t('journals.subtitle')}
        endpoint="/api/journals"
        navigateBase="journals"
        typeParam="region"
        typeFilters={[
          { value: 'bd', label: 'Bangladesh' },
          { value: 'intl', label: 'International' },
        ]}
        extraFilters={[
          { param: 'field', label: bn ? 'বিষয়' : 'Field', allLabel: bn ? 'সব বিষয়' : 'All fields', options: FIELDS.map(f => ({ value: f.value, label: bn ? f.labelBn : f.label })) },
          { param: 'quartile', label: bn ? 'কোয়ার্টাইল' : 'Quartile', allLabel: bn ? 'যেকোনো কোয়ার্টাইল' : 'Any quartile', options: ['Q1', 'Q2', 'Q3', 'Q4'].map(q => ({ value: q, label: `${q} (SJR)` })) },
          { param: 'indexed', label: bn ? 'ইনডেক্সিং' : 'Indexing', allLabel: bn ? 'সব জার্নাল' : 'All journals', options: [
            { value: 'scopus', label: bn ? 'Scopus-এ ইনডেক্সড' : 'Scopus-indexed' },
            { value: 'doaj', label: bn ? 'DOAJ-এ তালিকাভুক্ত' : 'Listed in DOAJ' },
          ] },
          { param: 'sort', label: bn ? 'সাজান' : 'Sort', defaultValue: 'title', options: [
            { value: 'title', label: bn ? 'নাম (A–Z)' : 'Title A–Z' },
            { value: 'sjr', label: bn ? 'SJR (বেশি থেকে কম)' : 'Highest SJR first' },
            { value: 'if', label: bn ? 'ইমপ্যাক্ট ফ্যাক্টর (বেশি থেকে কম)' : 'Highest Impact Factor first' },
          ] },
        ]}
        icon={BookOpen}
        action={user ? (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> {t('journals.submitNew') || 'Submit a journal'}</Button>
            </DialogTrigger>
            <SubmitJournalDialog onClose={() => setOpen(false)} onCreated={() => { setOpen(false); setRefresh(r => r + 1) }} />
          </Dialog>
        ) : undefined}
        renderItem={(j) => (
          <Card className="hover:shadow-md h-full">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <VerificationBadge status={j.verification} />
                {j.openAccess && <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-700">Open access</Badge>}
              </div>
              <h3 className="font-medium text-sm line-clamp-2">{j.title}</h3>
              {j.publisher && <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Building2 className="h-3 w-3" /> {j.publisher}</p>}
              {j.subjectAreas && <p className="text-xs mt-1 line-clamp-1">{j.subjectAreas}</p>}
              {j.issn && <p className="text-xs text-muted-foreground mt-1">ISSN: {j.issn}</p>}
              <MetricBadges j={j} compact />
              {j.website && (
                <a href={j.website} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="inline-flex items-center gap-1 text-xs text-primary mt-2 hover:underline">
                  <ExternalLink className="h-3 w-3" /> {t('journals.website')}
                </a>
              )}
            </CardContent>
          </Card>
        )}
      />
    </>
  )
}

function JournalDetail({ id }: { id: string }) {
  const { t, locale } = useI18n()
  const navigate = useNavigate()
  const { user } = useSession()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [bookmarked, setBookmarked] = useState(false)

  useEffect(() => {
    fetch(`/api/journals/${id}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(d => { setData(d); setBookmarked(d.bookmarked) })
      .finally(() => setLoading(false))
  }, [id])

  const toggleBookmark = async () => {
    if (!user) { toast.error('Sign in required'); navigate('login'); return }
    const res = await fetch('/api/bookmarks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetType: 'journal', targetId: id }),
    })
    const d = await res.json()
    setBookmarked(d.bookmarked)
    toast.success(d.bookmarked ? t('common.bookmarked') : 'Removed')
  }

  if (loading) return <div className="container mx-auto px-4 py-8">{t('common.loading')}</div>
  if (!data?.journal) return <div className="container mx-auto px-4 py-8">{t('common.noResults')}</div>

  const j = data.journal

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Button variant="ghost" size="sm" onClick={() => navigate('journals')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> {t('common.back')}
      </Button>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-2 mb-2">
            <VerificationBadge status={j.verification} />
            {j.openAccess && <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-700"><CheckCircle2 className="h-3 w-3 mr-1" /> Open access</Badge>}
          </div>
          <CardTitle className="text-xl">{j.title}</CardTitle>
          {j.publisher && <CardDescription className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {j.publisher}</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-5">
          {j.scope && (
            <div>
              <h3 className="text-sm font-semibold mb-1 flex items-center gap-1.5"><FileText className="h-4 w-4 text-primary" /> {t('journals.scope')}</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{j.scope}</p>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2 pt-3 border-t border-border">
            {j.issn && <Field label={t('journals.issn')} value={j.issn} />}
            {j.eissn && <Field label={t('journals.eissn')} value={j.eissn} />}
            {j.subjectAreas && <Field label={t('journals.subjectAreas')} value={j.subjectAreas} icon={Tag} />}
            {j.doi && <Field label="DOI" value={j.doi} icon={Link2} />}
            {j.openAccess !== null && j.openAccess !== undefined && (
              <Field label={t('journals.openAccess')} value={j.openAccess ? t('common.yes') : t('common.no')} icon={j.openAccess ? CheckCircle2 : AlertCircle} />
            )}
            {j.lastCheckedAt && <Field label={t('journals.lastChecked')} value={formatDate(j.lastCheckedAt, locale)} icon={Calendar} />}
            <Field label={t('journals.reviewStatus')} value={j.verification.replace(/-/g, ' ')} />
          </div>

          <JournalMetrics j={j} canEdit={user?.role === 'ADMIN' || user?.role === 'MODERATOR'} onSaved={(nj: any) => setData((d: any) => ({ ...d, journal: nj }))} />

          {j.indexingClaims && (
            <div className="pt-3 border-t border-border">
              <h3 className="text-sm font-semibold mb-1">Indexing claims</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{j.indexingClaims}</p>
              <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-900 dark:text-amber-200 mt-2">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>Indexing claims are shown as reported. We never assert that a journal is indexed in Scopus, Web of Science, or any other database without a verifiable source. Verify directly with the indexing service.</span>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-3 border-t border-border">
            {j.website && (
              <Button asChild size="sm">
                <a href={j.website} target="_blank" rel="noopener noreferrer">
                  <Globe className="mr-2 h-4 w-4" /> {t('journals.website')}
                </a>
              </Button>
            )}
            {j.doi && (
              <Button asChild size="sm" variant="outline">
                <a href={`https://doi.org/${j.doi}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" /> DOI
                </a>
              </Button>
            )}
            <Button variant={bookmarked ? 'default' : 'outline'} size="sm" onClick={toggleBookmark}>
              {bookmarked ? <BookmarkCheck className="mr-2 h-4 w-4" /> : <Bookmark className="mr-2 h-4 w-4" />}
              {bookmarked ? t('common.bookmarked') : t('common.bookmark')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Related journals */}
      {data.related && data.related.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-semibold mb-3">Related journals</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {data.related.map((r: any) => (
              <Card key={r.id} className="cursor-pointer hover:shadow-md" onClick={() => navigate(`journals/${r.id}`)}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <VerificationBadge status={r.verification} />
                    {r.openAccess && <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-700">OA</Badge>}
                  </div>
                  <div className="font-medium text-sm line-clamp-1">{r.title}</div>
                  {r.publisher && <div className="text-xs text-muted-foreground mt-0.5">{r.publisher}</div>}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, value, icon: Icon }: { label: string; value: string; icon?: any }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
      <div className="flex items-center gap-1 text-sm">{Icon && <Icon className="h-3 w-3 text-muted-foreground" />} {value}</div>
    </div>
  )
}

const SubjectAreaList = [
  'Computer Science', 'Engineering', 'Medicine', 'Public Health',
  'Agriculture', 'Climate Science', 'Social Sciences', 'Humanities',
  'Business', 'Economics', 'Education', 'Biology', 'Chemistry', 'Physics',
]

function SubmitJournalDialog({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { t } = useI18n()
  const [form, setForm] = useState<any>({
    title: '', publisher: '', issn: '', eissn: '', subjectAreas: '',
    scope: '', website: '', doi: '', indexingClaims: '', openAccess: false,
  })
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/journals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const d = await res.json()
        toast.error(d.error ?? 'Failed')
        return
      }
      toast.success('Journal submitted for review')
      onCreated()
    } finally { setLoading(false) }
  }

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Submit a journal</DialogTitle>
      </DialogHeader>
      <form onSubmit={submit} className="space-y-3">
        <div><Label>Title *</Label><Input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
        <div className="grid grid-cols-2 gap-2">
          <div><Label>Publisher</Label><Input value={form.publisher} onChange={e => setForm(f => ({ ...f, publisher: e.target.value }))} /></div>
          <div><Label>ISSN</Label><Input value={form.issn} onChange={e => setForm(f => ({ ...f, issn: e.target.value }))} placeholder="0000-0000" /></div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div><Label>eISSN</Label><Input value={form.eissn} onChange={e => setForm(f => ({ ...f, eissn: e.target.value }))} placeholder="0000-0000" /></div>
          <div><Label>DOI prefix (optional)</Label><Input value={form.doi} onChange={e => setForm(f => ({ ...f, doi: e.target.value }))} placeholder="10.xxxx" /></div>
        </div>
        <div><Label>Subject areas</Label><Input value={form.subjectAreas} onChange={e => setForm(f => ({ ...f, subjectAreas: e.target.value }))} placeholder="Computer Science, AI, ..." /></div>
        <div><Label>Scope</Label><Textarea rows={3} value={form.scope} onChange={e => setForm(f => ({ ...f, scope: e.target.value }))} placeholder="Brief description of the journal's scope and focus" /></div>
        <div><Label>Website</Label><Input type="url" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://journal.example.org" /></div>
        <div><Label>Indexing claims (with sources)</Label><Textarea rows={2} value={form.indexingClaims} onChange={e => setForm(f => ({ ...f, indexingClaims: e.target.value }))} placeholder="e.g., Scopus (verified 2024-01) — only include if you can verify" />
          <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">Never assert indexing without a verifiable source. We do not classify journals as predatory based on unverified reports.</p>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={form.openAccess} onCheckedChange={v => setForm(f => ({ ...f, openAccess: v }))} id="oa" />
          <Label htmlFor="oa">Open access</Label>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="submit" disabled={loading}>{loading ? t('common.loading') : t('common.submit')}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}


// Metrics block on the journal page, with sources and an admin editor.
function JournalMetrics({ j, canEdit, onSaved }: { j: any; canEdit: boolean; onSaved: (j: any) => void }) {
  const [editing, setEditing] = useState(false)
  const [f, setF] = useState({
    impactFactor: j.impactFactor ?? '', impactFactorYear: j.impactFactorYear ?? '',
    citeScore: j.citeScore ?? '', citeScoreYear: j.citeScoreYear ?? '',
    sjrQuartile: j.sjrQuartile ?? '', sjrScore: j.sjrScore ?? '', metricsYear: j.metricsYear ?? '',
    metricsNote: j.metricsNote ?? '',
  })
  const n = (v: any) => (v === '' || v == null ? null : Number(v))
  const save = async () => {
    const res = await fetch(`/api/journals/${j.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        impactFactor: n(f.impactFactor), impactFactorYear: n(f.impactFactorYear),
        citeScore: n(f.citeScore), citeScoreYear: n(f.citeScoreYear),
        sjrQuartile: f.sjrQuartile || null, sjrScore: n(f.sjrScore), metricsYear: n(f.metricsYear),
        metricsNote: f.metricsNote || null,
      }),
    })
    const d = await res.json()
    if (!res.ok) { toast.error(d.error || 'Could not save'); return }
    onSaved(d.journal); setEditing(false); toast.success('Metrics saved')
  }
  const has = j.sjrQuartile || j.sjrScore != null || j.citeScore != null || j.impactFactor != null || j.hIndex != null || j.oaCitedness != null
  if (!has && !canEdit) return null
  const scimagoUrl = j.scimagoId ? `https://www.scimagojr.com/journalsearch.php?q=${j.scimagoId}&tip=sid` : null
  return (
    <div className="pt-3 border-t border-border">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">Journal metrics</h3>
        {canEdit && <Button size="sm" variant="ghost" onClick={() => setEditing(e => !e)}>{editing ? 'Cancel' : 'Edit metrics'}</Button>}
      </div>
      {!editing ? (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            {j.sjrQuartile && <Field label={`SJR quartile${j.metricsYear ? ` (${j.metricsYear})` : ''}`} value={j.sjrQuartile} />}
            {j.sjrScore != null && <Field label={`SJR${j.metricsYear ? ` (${j.metricsYear})` : ''}`} value={j.sjrScore.toFixed(3)} />}
            {j.hIndex != null && <Field label="H-index (SCImago)" value={String(j.hIndex)} />}
            {j.citeScore != null && <Field label={`CiteScore${j.citeScoreYear ? ` (${j.citeScoreYear})` : ''}`} value={j.citeScore.toFixed(1)} />}
            {j.impactFactor != null && <Field label={`Impact Factor${j.impactFactorYear ? ` (${j.impactFactorYear})` : ''}`} value={j.impactFactor.toFixed(3)} />}
            {j.oaCitedness != null && <Field label="2-year mean citedness (OpenAlex)" value={j.oaCitedness.toFixed(2)} />}
            {j.oaHIndex != null && <Field label="H-index (OpenAlex)" value={String(j.oaHIndex)} />}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Sources: quartile, SJR and H-index from {scimagoUrl ? <a className="text-primary underline" href={scimagoUrl} target="_blank" rel="noreferrer">SCImago Journal Rank</a> : 'SCImago Journal Rank'} (Scopus data).
            CiteScore (Scopus) and Impact Factor (Clarivate Journal Citation Reports) are entered by moderators{j.metricsNote ? `: ${j.metricsNote}` : ''}.
            OpenAlex citedness is a free open indicator and is not the official Impact Factor. Always confirm metrics with the official source.
          </p>
          {!has && <p className="text-xs text-muted-foreground">No metrics recorded yet.</p>}
        </>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <div><Label className="text-xs">Impact Factor</Label><Input type="number" step="0.001" value={f.impactFactor} onChange={e => setF({ ...f, impactFactor: e.target.value })} /></div>
          <div><Label className="text-xs">Impact Factor year</Label><Input type="number" value={f.impactFactorYear} onChange={e => setF({ ...f, impactFactorYear: e.target.value })} /></div>
          <div><Label className="text-xs">CiteScore</Label><Input type="number" step="0.1" value={f.citeScore} onChange={e => setF({ ...f, citeScore: e.target.value })} /></div>
          <div><Label className="text-xs">CiteScore year</Label><Input type="number" value={f.citeScoreYear} onChange={e => setF({ ...f, citeScoreYear: e.target.value })} /></div>
          <div><Label className="text-xs">SJR quartile</Label>
            <Select value={f.sjrQuartile || 'none'} onValueChange={v => setF({ ...f, sjrQuartile: v === 'none' ? '' : v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Not set</SelectItem>
                {['Q1', 'Q2', 'Q3', 'Q4'].map(q => <SelectItem key={q} value={q}>{q}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label className="text-xs">SJR / metrics year</Label><Input type="number" value={f.metricsYear} onChange={e => setF({ ...f, metricsYear: e.target.value })} /></div>
          <div className="sm:col-span-2"><Label className="text-xs">Source note (required for IF / CiteScore)</Label><Textarea rows={2} value={f.metricsNote} placeholder="e.g. JCR 2025 release; CiteScore from scopus.com/sourceid/…" onChange={e => setF({ ...f, metricsNote: e.target.value })} /></div>
          <div className="sm:col-span-2"><Button size="sm" onClick={save} disabled={(f.impactFactor !== '' || f.citeScore !== '') && !f.metricsNote}>Save metrics</Button></div>
        </div>
      )}
    </div>
  )
}
