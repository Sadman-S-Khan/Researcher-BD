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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { useSession } from '@/lib/session-context'
import {
  Database, ExternalLink, Bookmark, BookmarkCheck, ArrowLeft, Copy,
  Download, FileText, Link2, Users, Building2, Plus, AlertCircle, BookOpen,
} from 'lucide-react'

export function DatasetsPage({ id }: { id?: string }) {
  if (id) return <DatasetDetail id={id} />
  return <DatasetList />
}

function DatasetList() {
  const { t } = useI18n()
  const { user } = useSession()
  const [open, setOpen] = useState(false)
  const [refresh, setRefresh] = useState(0)

  return (
    <>
      <div style={{ display: 'none' }}>{refresh}</div>
      <ListPage
        key={refresh}
        title={t('datasets.title')}
        subtitle={t('datasets.subtitle')}
        endpoint="/api/datasets"
        navigateBase="datasets"
        icon={Database}
        typeParam="domain"
        action={user ? (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> {t('datasets.submitNew')}</Button>
            </DialogTrigger>
            <SubmitDatasetDialog onClose={() => setOpen(false)} onCreated={() => { setOpen(false); setRefresh(r => r + 1) }} />
          </Dialog>
        ) : undefined}
        renderItem={(d) => {
          let authors: string[] = []
          try { authors = JSON.parse(d.authorsList || '[]') } catch {}
          return (
            <Card className="hover:shadow-md h-full">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <VerificationBadge status={d.verification} />
                  {d.dataModality && <Badge variant="secondary" className="text-[10px]">{d.dataModality}</Badge>}
                </div>
                <h3 className="font-medium text-sm line-clamp-2">{d.title}</h3>
                {authors.length > 0 && <p className="text-xs text-muted-foreground mt-1">{t('datasets.authors')}: {authors.join(', ')}</p>}
                {d.researchDomain && <p className="text-xs mt-1">{d.researchDomain}</p>}
                {d.license && <p className="text-xs text-muted-foreground mt-1">{t('datasets.license')}: {d.license}</p>}
                <div className="flex flex-wrap gap-2 mt-3">
                  {d.citation && (
                    <button
                      onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(d.citation); toast.success(t('common.copied')) }}
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <Copy className="h-3 w-3" /> {t('datasets.copyCitation')}
                    </button>
                  )}
                  {d.downloadUrl && (
                    <a href={d.downloadUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                      <ExternalLink className="h-3 w-3" /> {t('datasets.download')}
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        }}
      />
    </>
  )
}

function DatasetDetail({ id }: { id: string }) {
  const { t, locale } = useI18n()
  const navigate = useNavigate()
  const { user } = useSession()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [bookmarked, setBookmarked] = useState(false)

  useEffect(() => {
    fetch(`/api/datasets/${id}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(d => { setData(d); setBookmarked(d.bookmarked) })
      .finally(() => setLoading(false))
  }, [id])

  const toggleBookmark = async () => {
    if (!user) { toast.error('Sign in required'); navigate('login'); return }
    const res = await fetch('/api/bookmarks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetType: 'dataset', targetId: id }),
    })
    const d = await res.json()
    setBookmarked(d.bookmarked)
    toast.success(d.bookmarked ? t('common.bookmarked') : 'Removed')
  }

  if (loading) return <div className="container mx-auto px-4 py-8">{t('common.loading')}</div>
  if (!data?.dataset) return <div className="container mx-auto px-4 py-8">{t('common.noResults')}</div>

  const d = data.dataset
  let authors: string[] = []
  try { authors = JSON.parse(d.authorsList || '[]') } catch {}

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Button variant="ghost" size="sm" onClick={() => navigate('datasets')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> {t('common.back')}
      </Button>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-2 mb-2">
            <VerificationBadge status={d.verification} />
            {d.dataModality && <Badge variant="secondary" className="text-[10px]">{d.dataModality}</Badge>}
            {d.fileFormat && <Badge variant="outline" className="text-[10px]">{d.fileFormat}</Badge>}
          </div>
          <CardTitle className="text-xl">{d.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {d.description && (
            <div>
              <h3 className="text-sm font-semibold mb-1 flex items-center gap-1.5"><FileText className="h-4 w-4 text-primary" /> Description</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{d.description}</p>
            </div>
          )}

          {authors.length > 0 && (
            <div className="pt-3 border-t border-border">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5"><Users className="h-4 w-4 text-primary" /> {t('datasets.authors')}</h3>
              <ul className="text-sm text-muted-foreground space-y-0.5">
                {authors.map((a, i) => <li key={i}>{i + 1}. {a}</li>)}
              </ul>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2 pt-3 border-t border-border">
            {d.researchDomain && <Field label={t('datasets.domain')} value={d.researchDomain} />}
            {d.dataModality && <Field label={t('datasets.modality')} value={d.dataModality} />}
            {d.fileFormat && <Field label={t('datasets.format')} value={d.fileFormat} />}
            {d.sampleCount && <Field label={t('datasets.samples')} value={d.sampleCount} />}
            {d.license && <Field label={t('datasets.license')} value={d.license} />}
            {d.doi && <Field label={t('datasets.doi')} value={d.doi} icon={Link2} />}
            {d.hostingPlatform && <Field label={t('datasets.hosting')} value={d.hostingPlatform} icon={Building2} />}
          </div>

          {d.citation && (
            <div className="pt-3 border-t border-border">
              <h3 className="text-sm font-semibold mb-1">{t('datasets.citation')}</h3>
              <div className="rounded-md bg-muted p-3 text-sm font-mono text-muted-foreground">{d.citation}</div>
              <Button size="sm" variant="outline" className="mt-2" onClick={() => { navigator.clipboard.writeText(d.citation); toast.success(t('common.copied')) }}>
                <Copy className="mr-2 h-3 w-3" /> {t('datasets.copyCitation')}
              </Button>
            </div>
          )}

          {d.associatedPub && (
            <div className="pt-3 border-t border-border">
              <h3 className="text-sm font-semibold mb-1 flex items-center gap-1.5"><BookOpen className="h-4 w-4 text-primary" /> {t('datasets.associatedPub')}</h3>
              <p className="text-sm text-muted-foreground">{d.associatedPub}</p>
            </div>
          )}

          {d.docsUrl && (
            <div className="pt-3 border-t border-border">
              <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-900 dark:text-amber-200">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>Always review the dataset documentation checklist before use. We store metadata and original repository links — we do not duplicate large external datasets.</span>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-3 border-t border-border">
            {d.downloadUrl && (
              <Button asChild size="sm">
                <a href={d.downloadUrl} target="_blank" rel="noopener noreferrer">
                  <Download className="mr-2 h-4 w-4" /> {t('datasets.download')}
                </a>
              </Button>
            )}
            {d.docsUrl && (
              <Button asChild size="sm" variant="outline">
                <a href={d.docsUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" /> {t('datasets.docs')}
                </a>
              </Button>
            )}
            {d.doi && (
              <Button asChild size="sm" variant="outline">
                <a href={`https://doi.org/${d.doi}`} target="_blank" rel="noopener noreferrer">
                  <Link2 className="mr-2 h-4 w-4" /> DOI
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

      {data.related && data.related.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-semibold mb-3">Related datasets</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {data.related.map((r: any) => (
              <Card key={r.id} className="cursor-pointer hover:shadow-md" onClick={() => navigate(`datasets/${r.id}`)}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <VerificationBadge status={r.verification} />
                    {r.dataModality && <Badge variant="outline" className="text-[10px]">{r.dataModality}</Badge>}
                  </div>
                  <div className="font-medium text-sm line-clamp-1">{r.title}</div>
                  {r.researchDomain && <div className="text-xs text-muted-foreground mt-0.5">{r.researchDomain}</div>}
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

function SubmitDatasetDialog({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { t } = useI18n()
  const [form, setForm] = useState<any>({
    title: '', description: '', authorsList: '', researchDomain: '',
    dataModality: '', fileFormat: '', sampleCount: '', license: '',
    doi: '', citation: '', hostingPlatform: '', downloadUrl: '',
    associatedPub: '', docsUrl: '',
  })
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Convert authors comma-separated to JSON array
      const authorsArr = form.authorsList.split(',').map((s: string) => s.trim()).filter(Boolean)
      const payload = { ...form, authorsList: JSON.stringify(authorsArr) }
      const res = await fetch('/api/datasets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const d = await res.json()
        toast.error(d.error ?? 'Failed')
        return
      }
      toast.success('Dataset submitted for review')
      onCreated()
    } finally { setLoading(false) }
  }

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader><DialogTitle>{t('datasets.submitTitle')}</DialogTitle></DialogHeader>
      <form onSubmit={submit} className="space-y-3">
        <div><Label>{t('datasets.title')} *</Label><Input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
        <div><Label>{t('datasets.description')}</Label><Textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
        <div><Label>{t('datasets.authors')} (comma-separated)</Label><Input value={form.authorsList} onChange={e => setForm(f => ({ ...f, authorsList: e.target.value }))} placeholder="Author One, Author Two" /></div>
        <div className="grid grid-cols-2 gap-2">
          <div><Label>{t('datasets.domain')}</Label><Input value={form.researchDomain} onChange={e => setForm(f => ({ ...f, researchDomain: e.target.value }))} /></div>
          <div><Label>{t('datasets.modality')}</Label><Input value={form.dataModality} onChange={e => setForm(f => ({ ...f, dataModality: e.target.value }))} placeholder="Text, Image, Audio, Tabular..." /></div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div><Label>{t('datasets.format')}</Label><Input value={form.fileFormat} onChange={e => setForm(f => ({ ...f, fileFormat: e.target.value }))} placeholder="CSV, JSON, JPG..." /></div>
          <div><Label>{t('datasets.samples')}</Label><Input value={form.sampleCount} onChange={e => setForm(f => ({ ...f, sampleCount: e.target.value }))} placeholder="5000" /></div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div><Label>{t('datasets.license')}</Label><Input value={form.license} onChange={e => setForm(f => ({ ...f, license: e.target.value }))} placeholder="CC BY 4.0" /></div>
          <div><Label>{t('datasets.doi')}</Label><Input value={form.doi} onChange={e => setForm(f => ({ ...f, doi: e.target.value }))} placeholder="10.xxxx/xxxxx" /></div>
        </div>
        <div><Label>{t('datasets.hosting')}</Label><Input value={form.hostingPlatform} onChange={e => setForm(f => ({ ...f, hostingPlatform: e.target.value }))} placeholder="Zenodo, Figshare, GitHub..." /></div>
        <div><Label>{t('datasets.download')}</Label><Input type="url" value={form.downloadUrl} onChange={e => setForm(f => ({ ...f, downloadUrl: e.target.value }))} placeholder="https://..." /></div>
        <div><Label>{t('datasets.citation')}</Label><Textarea rows={2} value={form.citation} onChange={e => setForm(f => ({ ...f, citation: e.target.value }))} /></div>
        <div><Label>{t('datasets.associatedPub')}</Label><Input value={form.associatedPub} onChange={e => setForm(f => ({ ...f, associatedPub: e.target.value }))} /></div>
        <div><Label>{t('datasets.docs')}</Label><Input type="url" value={form.docsUrl} onChange={e => setForm(f => ({ ...f, docsUrl: e.target.value }))} placeholder="https://..." /></div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="submit" disabled={loading}>{loading ? t('common.loading') : t('common.submit')}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
