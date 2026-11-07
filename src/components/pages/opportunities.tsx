"use client"

import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { useRouter, useNavigate } from '@/lib/router'
import { PageHeader, DemoBanner, VerificationBadge, formatDate, EmptyState } from '@/components/shared/ui-helpers'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from '@/components/ui/dialog'
import { Bookmark, BookmarkCheck, ExternalLink, FlaskConical, Plus, ArrowLeft, MapPin, Calendar, Building2 } from 'lucide-react'
import { useSession } from '@/lib/session-context'
import { toast } from 'sonner'

export function OpportunitiesPage({ id }: { id?: string }) {
  if (id) return <OpportunityDetail id={id} />
  return <OpportunityList />
}

function OpportunityList() {
  const { t, locale } = useI18n()
  const { navigate } = useRouter()
  const { user } = useSession()
  const [items, setItems] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [type, setType] = useState('all')
  const [sort, setSort] = useState('newest')
  const [submitOpen, setSubmitOpen] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (type !== 'all') params.set('type', type)
      params.set('sort', sort)
      params.set('limit', '30')
      const res = await fetch(`/api/opportunities?${params}`, { cache: 'no-store' })
      const d = await res.json()
      setItems(d.items ?? [])
      setTotal(d.total ?? 0)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [type, sort])

  const types = ['assistantship', 'internship', 'scholarship', 'fellowship', 'phd', 'postdoc', 'job', 'competition', 'international']

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title={t('opportunities.title')}
        subtitle={t('opportunities.subtitle')}
        action={user && (
          <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> {t('opportunities.submitNew')}</Button>
            </DialogTrigger>
            <SubmitDialog onClose={() => setSubmitOpen(false)} onCreated={() => { setSubmitOpen(false); load() }} />
          </Dialog>
        )}
      />
      <div className="mb-4"><DemoBanner /></div>

      {/* Filters */}
      <div className="grid gap-2 sm:grid-cols-4 mb-6">
        <Input placeholder={t('common.searchPlaceholder')} value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()} />
        <Select value={type} onValueChange={setType}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('opportunities.allTypes')}</SelectItem>
            {types.map(ty => <SelectItem key={ty} value={ty}>{t(`opportunities.types.${ty}`)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">{t('opportunities.sortNewest')}</SelectItem>
            <SelectItem value="deadline">{t('opportunities.sortDeadline')}</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={load} variant="secondary">{t('common.filter')}</Button>
      </div>

      {loading ? <p className="text-sm text-muted-foreground">{t('common.loading')}</p> :
        items.length === 0 ? <EmptyState title={t('common.noResults')} icon={FlaskConical} /> :
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {items.map(o => (
            <Card key={o.id} className="cursor-pointer hover:shadow-md flex flex-col" onClick={() => navigate(`opportunities/${o.id}`)}>
              <CardContent className="p-4 flex-1 flex flex-col">
                <div className="flex items-start gap-2">
                  <Badge variant="secondary" className="text-[10px]">{t(`opportunities.types.${o.type}`)}</Badge>
                  <VerificationBadge status={o.verification} />
                </div>
                <h3 className="font-medium mt-2 line-clamp-2 text-sm">{o.title}</h3>
                {o.organization && <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><Building2 className="h-3 w-3" /> {o.organization}</p>}
                {o.location && <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" /> {o.location}</p>}
                {o.deadline && <p className="text-xs mt-2 flex items-center gap-1"><Calendar className="h-3 w-3" /> {t('opportunities.deadline')}: {formatDate(o.deadline, locale)}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      }
    </div>
  )
}

function OpportunityDetail({ id }: { id: string }) {
  const { t, locale } = useI18n()
  const navigate = useNavigate()
  const { user } = useSession()
  const [opp, setOpp] = useState<any>(null)
  const [bookmarked, setBookmarked] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/opportunities/${id}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(d => { setOpp(d.opportunity); setBookmarked(d.bookmarked) })
      .finally(() => setLoading(false))
  }, [id])

  const toggleBookmark = async () => {
    if (!user) { toast.error('Sign in required'); navigate('login'); return }
    const res = await fetch('/api/bookmarks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetType: 'opportunity', targetId: id }),
    })
    const d = await res.json()
    setBookmarked(d.bookmarked)
    toast.success(d.bookmarked ? t('common.bookmarked') : 'Removed')
  }

  if (loading) return <div className="container mx-auto px-4 py-8">{t('common.loading')}</div>
  if (!opp) return <div className="container mx-auto px-4 py-8">{t('common.noResults')}</div>

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Button variant="ghost" size="sm" onClick={() => navigate('opportunities')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> {t('common.back')}
      </Button>
      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge variant="secondary">{t(`opportunities.types.${opp.type}`)}</Badge>
            <VerificationBadge status={opp.verification} />
          </div>
          <CardTitle className="text-xl">{opp.title}</CardTitle>
          {opp.organization && <CardDescription className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {opp.organization}</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm whitespace-pre-wrap">{opp.description}</p>
          <div className="grid gap-3 sm:grid-cols-2 text-sm">
            {opp.researchDomain && <Field label={t('opportunities.domain')} value={opp.researchDomain} />}
            {opp.location && <Field label={t('opportunities.location')} value={opp.location} icon={MapPin} />}
            {opp.eligibility && <Field label={t('opportunities.eligibility')} value={opp.eligibility} />}
            {opp.qualifications && <Field label={t('opportunities.qualifications')} value={opp.qualifications} />}
            {opp.fundingAmount && <Field label={t('opportunities.funding')} value={opp.fundingAmount} />}
            {opp.deadline && <Field label={t('opportunities.deadline')} value={formatDate(opp.deadline, locale)} icon={Calendar} />}
          </div>
          <div className="flex flex-wrap gap-2 pt-3 border-t border-border">
            {opp.applicationUrl && (
              <Button asChild size="sm">
                <a href={opp.applicationUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" /> {t('opportunities.applyAt')}
                </a>
              </Button>
            )}
            {opp.sourceUrl && (
              <Button variant="outline" size="sm" asChild>
                <a href={opp.sourceUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" /> {t('opportunities.source')}
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
    </div>
  )
}

function Field({ label, value, icon: Icon }: { label: string; value: string; icon?: any }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
      <div className="flex items-center gap-1">{Icon && <Icon className="h-3 w-3 text-muted-foreground" />} {value}</div>
    </div>
  )
}

function SubmitDialog({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { t } = useI18n()
  const [form, setForm] = useState<any>({
    title: '', description: '', type: 'assistantship', researchDomain: '', organization: '',
    eligibility: '', qualifications: '', location: '', fundingAmount: '', deadline: '',
    applicationUrl: '', sourceUrl: '',
  })
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const d = await res.json()
        toast.error(d.error ?? 'Failed')
        return
      }
      toast.success('Submitted for review')
      onCreated()
    } finally { setLoading(false) }
  }

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{t('opportunities.submitTitle')}</DialogTitle>
      </DialogHeader>
      <form onSubmit={submit} className="space-y-3">
        <div><Label>{t('opportunities.title')} *</Label><Input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
        <div><Label>{t('opportunities.description')} *</Label><Textarea required rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>{t('opportunities.type')}</Label>
            <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {['assistantship', 'internship', 'scholarship', 'fellowship', 'phd', 'postdoc', 'job', 'competition', 'international'].map(ty => <SelectItem key={ty} value={ty}>{t(`opportunities.types.${ty}`)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label>{t('opportunities.domain')}</Label><Input value={form.researchDomain} onChange={e => setForm(f => ({ ...f, researchDomain: e.target.value }))} /></div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div><Label>{t('opportunities.location')}</Label><Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} /></div>
          <div><Label>{t('opportunities.deadline')}</Label><Input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} /></div>
        </div>
        <div><Label>{t('opportunities.eligibility')}</Label><Input value={form.eligibility} onChange={e => setForm(f => ({ ...f, eligibility: e.target.value }))} /></div>
        <div><Label>{t('opportunities.qualifications')}</Label><Input value={form.qualifications} onChange={e => setForm(f => ({ ...f, qualifications: e.target.value }))} /></div>
        <div><Label>{t('opportunities.funding')}</Label><Input value={form.fundingAmount} onChange={e => setForm(f => ({ ...f, fundingAmount: e.target.value }))} /></div>
        <div><Label>{t('opportunities.applyAt')}</Label><Input type="url" value={form.applicationUrl} onChange={e => setForm(f => ({ ...f, applicationUrl: e.target.value }))} /></div>
        <div><Label>{t('opportunities.source')}</Label><Input type="url" value={form.sourceUrl} onChange={e => setForm(f => ({ ...f, sourceUrl: e.target.value }))} /></div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="submit" disabled={loading}>{loading ? t('common.loading') : t('common.submit')}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
