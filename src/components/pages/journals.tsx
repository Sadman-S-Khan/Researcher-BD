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
import {
  BookOpen, ExternalLink, Bookmark, BookmarkCheck, ArrowLeft, Building2,
  Globe, FileText, CheckCircle2, AlertCircle, Plus, Calendar, Tag, Link2,
} from 'lucide-react'

export function JournalsPage({ id }: { id?: string }) {
  if (id) return <JournalDetail id={id} />
  return <JournalList />
}

function JournalList() {
  const { t } = useI18n()
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
