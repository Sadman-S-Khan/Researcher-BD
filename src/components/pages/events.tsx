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
  CalendarDays, ExternalLink, Bookmark, BookmarkCheck, ArrowLeft, MapPin,
  Building2, Globe, Clock, Plus, AlertCircle,
} from 'lucide-react'

export function EventsPage({ id }: { id?: string }) {
  if (id) return <EventDetail id={id} />
  return <EventList />
}

function EventList() {
  const { t } = useI18n()
  const { user } = useSession()
  const [open, setOpen] = useState(false)
  const [refresh, setRefresh] = useState(0)

  return (
    <>
      <div style={{ display: 'none' }}>{refresh}</div>
      <ListPage
        key={refresh}
        title={t('events.title')}
        subtitle={t('events.subtitle')}
        endpoint="/api/events"
        navigateBase="events"
        icon={CalendarDays}
        typeParam="type"
        typeFilters={[
          { value: 'seminar', label: t('events.types.seminar') },
          { value: 'workshop', label: t('events.types.workshop') },
          { value: 'webinar', label: t('events.types.webinar') },
          { value: 'conference', label: t('events.types.conference') },
          { value: 'hackathon', label: t('events.types.hackathon') },
          { value: 'bootcamp', label: t('events.types.bootcamp') },
        ]}
        action={user ? (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> Submit an event</Button>
            </DialogTrigger>
            <SubmitEventDialog onClose={() => setOpen(false)} onCreated={() => { setOpen(false); setRefresh(r => r + 1) }} />
          </Dialog>
        ) : undefined}
        renderItem={(e) => (
          <Card className="hover:shadow-md h-full">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant="secondary" className="text-[10px]">{t(`events.types.${e.eventType}`)}</Badge>
                <Badge variant="outline" className="text-[10px]">{t(`events.modes.${e.mode}`)}</Badge>
                <Badge variant="outline" className="text-[10px]">{t(`events.statuses.${e.status}`)}</Badge>
              </div>
              <h3 className="font-medium text-sm line-clamp-2">{e.title}</h3>
              {e.organizer && <p className="text-xs text-muted-foreground mt-1">{e.organizer}</p>}
              {e.location && <p className="text-xs mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" /> {e.location}</p>}
              {e.startDateTime && <p className="text-xs mt-1 flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {formatDate(e.startDateTime, 'en')}</p>}
              {e.registrationUrl && (
                <a href={e.registrationUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="inline-flex items-center gap-1 text-xs text-primary mt-2 hover:underline">
                  <ExternalLink className="h-3 w-3" /> {t('events.register')}
                </a>
              )}
            </CardContent>
          </Card>
        )}
      />
    </>
  )
}

function EventDetail({ id }: { id: string }) {
  const { t, locale } = useI18n()
  const navigate = useNavigate()
  const { user } = useSession()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [bookmarked, setBookmarked] = useState(false)

  useEffect(() => {
    fetch(`/api/events/${id}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(d => { setData(d); setBookmarked(d.bookmarked) })
      .finally(() => setLoading(false))
  }, [id])

  const toggleBookmark = async () => {
    if (!user) { toast.error('Sign in required'); navigate('login'); return }
    const res = await fetch('/api/bookmarks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetType: 'event', targetId: id }),
    })
    const d = await res.json()
    setBookmarked(d.bookmarked)
    toast.success(d.bookmarked ? t('common.bookmarked') : 'Removed')
  }

  if (loading) return <div className="container mx-auto px-4 py-8">{t('common.loading')}</div>
  if (!data?.event) return <div className="container mx-auto px-4 py-8">{t('common.noResults')}</div>

  const e = data.event
  const registrationPassed = e.registrationDeadline && new Date(e.registrationDeadline) < new Date()
  const eventPassed = e.endDateTime ? new Date(e.endDateTime) < new Date() : e.startDateTime && new Date(e.startDateTime) < new Date()

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Button variant="ghost" size="sm" onClick={() => navigate('events')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> {t('common.back')}
      </Button>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge variant="secondary" className="text-[10px]">{t(`events.types.${e.eventType}`)}</Badge>
            <Badge variant="outline" className="text-[10px]">{t(`events.modes.${e.mode}`)}</Badge>
            <Badge variant="outline" className="text-[10px]">{t(`events.statuses.${e.status}`)}</Badge>
            {eventPassed && <Badge variant="outline" className="text-[10px] text-muted-foreground">Past event</Badge>}
          </div>
          <CardTitle className="text-xl">{e.title}</CardTitle>
          {e.organizer && <CardDescription className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {e.organizer}</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-5">
          {e.description && (
            <div>
              <h3 className="text-sm font-semibold mb-1">Description</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{e.description}</p>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2 pt-3 border-t border-border">
            {e.startDateTime && (
              <Field label={t('events.date')} value={formatDate(e.startDateTime, locale)} icon={CalendarDays} highlight={!eventPassed} />
            )}
            {e.startDateTime && (
              <Field label={t('events.time')} value={new Date(e.startDateTime).toLocaleTimeString(locale === 'bn' ? 'bn-BD' : 'en-US', { hour: '2-digit', minute: '2-digit' })} icon={Clock} />
            )}
            {e.location && <Field label={t('conferences.location')} value={e.location} icon={MapPin} />}
            {e.organizer && <Field label={t('events.organizer')} value={e.organizer} icon={Building2} />}
            {e.registrationDeadline && (
              <Field label={t('events.registrationDeadline')} value={formatDate(e.registrationDeadline, locale)} icon={Clock} warning={registrationPassed} highlight={!registrationPassed} />
            )}
            <Field label={t('events.mode')} value={t(`events.modes.${e.mode}`)} />
          </div>

          {registrationPassed && !eventPassed && (
            <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-900 dark:text-amber-200">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>Registration deadline has passed. Check the event website for late registration options.</span>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-3 border-t border-border">
            {e.registrationUrl && (
              <Button asChild size="sm" disabled={registrationPassed}>
                <a href={e.registrationUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" /> {t('events.register')}
                </a>
              </Button>
            )}
            {e.sourceUrl && (
              <Button asChild size="sm" variant="outline">
                <a href={e.sourceUrl} target="_blank" rel="noopener noreferrer">
                  <Globe className="mr-2 h-4 w-4" /> Source
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
          <h3 className="text-sm font-semibold mb-3">Related events</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {data.related.map((r: any) => (
              <Card key={r.id} className="cursor-pointer hover:shadow-md" onClick={() => navigate(`events/${r.id}`)}>
                <CardContent className="p-3">
                  <div className="font-medium text-sm line-clamp-1">{r.title}</div>
                  {r.startDateTime && <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {formatDate(r.startDateTime, locale)}</div>}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, value, icon: Icon, highlight, warning }: { label: string; value: string; icon?: any; highlight?: boolean; warning?: boolean }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
      <div className={`flex items-center gap-1 text-sm ${highlight ? 'text-primary font-medium' : ''} ${warning ? 'text-amber-700 dark:text-amber-300' : ''}`}>
        {Icon && <Icon className={`h-3 w-3 ${highlight ? 'text-primary' : 'text-muted-foreground'} ${warning ? 'text-amber-600' : ''}`} />}
        {value}
      </div>
    </div>
  )
}

function SubmitEventDialog({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { t } = useI18n()
  const [form, setForm] = useState<any>({
    title: '', description: '', organizer: '', eventType: 'workshop',
    startDateTime: '', endDateTime: '', location: '', mode: 'offline',
    registrationDeadline: '', registrationUrl: '', sourceUrl: '',
  })
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const d = await res.json()
        toast.error(d.error ?? 'Failed')
        return
      }
      toast.success('Event submitted')
      onCreated()
    } finally { setLoading(false) }
  }

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader><DialogTitle>Submit an event</DialogTitle></DialogHeader>
      <form onSubmit={submit} className="space-y-3">
        <div><Label>Title *</Label><Input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
        <div><Label>Description</Label><Textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
        <div><Label>Organizer</Label><Input value={form.organizer} onChange={e => setForm(f => ({ ...f, organizer: e.target.value }))} /></div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>Event type</Label>
            <Select value={form.eventType} onValueChange={v => setForm(f => ({ ...f, eventType: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {['seminar', 'workshop', 'bootcamp', 'webinar', 'conference', 'hackathon', 'thesis', 'competition', 'training'].map(ty => <SelectItem key={ty} value={ty}>{t(`events.types.${ty}`)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Mode</Label>
            <Select value={form.mode} onValueChange={v => setForm(f => ({ ...f, mode: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="offline">{t('events.modes.offline')}</SelectItem>
                <SelectItem value="online">{t('events.modes.online')}</SelectItem>
                <SelectItem value="hybrid">{t('events.modes.hybrid')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div><Label>Start date & time</Label><Input type="datetime-local" value={form.startDateTime} onChange={e => setForm(f => ({ ...f, startDateTime: e.target.value }))} /></div>
          <div><Label>End date & time</Label><Input type="datetime-local" value={form.endDateTime} onChange={e => setForm(f => ({ ...f, endDateTime: e.target.value }))} /></div>
        </div>
        <div><Label>Location</Label><Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Dhaka, Bangladesh / Online" /></div>
        <div><Label>Registration deadline</Label><Input type="date" value={form.registrationDeadline} onChange={e => setForm(f => ({ ...f, registrationDeadline: e.target.value }))} /></div>
        <div><Label>Registration URL</Label><Input type="url" value={form.registrationUrl} onChange={e => setForm(f => ({ ...f, registrationUrl: e.target.value }))} placeholder="https://..." /></div>
        <div><Label>Source URL</Label><Input type="url" value={form.sourceUrl} onChange={e => setForm(f => ({ ...f, sourceUrl: e.target.value }))} placeholder="https://..." /></div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="submit" disabled={loading}>{loading ? t('common.loading') : t('common.submit')}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
