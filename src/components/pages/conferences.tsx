"use client"

import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { useRouter, useNavigate } from '@/lib/router'
import { ListPage } from '@/components/shared/list-page'
import { PageHeader, DemoBanner, VerificationBadge, formatDate, EmptyState } from '@/components/shared/ui-helpers'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useSession } from '@/lib/session-context'
import {
  UsersRound, ExternalLink, Bookmark, BookmarkCheck, ArrowLeft,
  Calendar, MapPin, Globe, Building2, FileText, Clock, Link2, AlertCircle,
} from 'lucide-react'

export function ConferencesPage({ id }: { id?: string }) {
  if (id) return <ConferenceDetail id={id} />
  return <ConferencesList />
}

function ConferencesList() {
  const { t } = useI18n()
  return (
    <ListPage
      title={t('conferences.title')}
      subtitle={t('conferences.subtitle')}
      endpoint="/api/conferences"
      navigateBase="conferences"
      typeParam="region"
      typeFilters={[
        { value: 'bd', label: 'Bangladesh' },
        { value: 'intl', label: 'International' },
      ]}
      icon={UsersRound}
      renderItem={(c) => (
        <Card className="hover:shadow-md h-full">
          <CardContent className="p-4">
            <div className="mb-2"><VerificationBadge status={c.verification} /></div>
            <h3 className="font-medium text-sm line-clamp-2">{c.title}</h3>
            {c.organizer && <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Building2 className="h-3 w-3" /> {c.organizer}</p>}
            {c.location && <p className="text-xs mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" /> {c.location}</p>}
            {c.eventDate && <p className="text-xs mt-1 flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(c.eventDate, 'en')}</p>}
            {c.website && (
              <a href={c.website} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="inline-flex items-center gap-1 text-xs text-primary mt-2 hover:underline">
                <ExternalLink className="h-3 w-3" /> {t('conferences.website')}
              </a>
            )}
          </CardContent>
        </Card>
      )}
    />
  )
}

function ConferenceDetail({ id }: { id: string }) {
  const { t, locale } = useI18n()
  const navigate = useNavigate()
  const { user } = useSession()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [bookmarked, setBookmarked] = useState(false)

  useEffect(() => {
    fetch(`/api/conferences/${id}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(d => { setData(d); setBookmarked(d.bookmarked) })
      .finally(() => setLoading(false))
  }, [id])

  const toggleBookmark = async () => {
    if (!user) { toast.error('Sign in required'); navigate('login'); return }
    const res = await fetch('/api/bookmarks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetType: 'conference', targetId: id }),
    })
    const d = await res.json()
    setBookmarked(d.bookmarked)
    toast.success(d.bookmarked ? t('common.bookmarked') : 'Removed')
  }

  if (loading) return <div className="container mx-auto px-4 py-8">{t('common.loading')}</div>
  if (!data?.conference) return <div className="container mx-auto px-4 py-8">{t('common.noResults')}</div>

  const c = data.conference
  const submissionDeadlinePassed = c.submissionDeadline && new Date(c.submissionDeadline) < new Date()
  const eventDatePassed = c.eventDate && new Date(c.eventDate) < new Date()

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Button variant="ghost" size="sm" onClick={() => navigate('conferences')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> {t('common.back')}
      </Button>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-2 mb-2">
            <VerificationBadge status={c.verification} />
            {eventDatePassed && <Badge variant="outline" className="text-[10px]">Past event</Badge>}
          </div>
          <CardTitle className="text-xl">{c.title}</CardTitle>
          {c.organizer && <CardDescription className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {c.organizer}</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Key dates block */}
          <div className="grid gap-3 sm:grid-cols-2 pt-3 border-t border-border">
            {c.eventDate && (
              <Field
                label={t('conferences.eventDate')}
                value={formatDate(c.eventDate, locale)}
                icon={Calendar}
                highlight={!eventDatePassed}
              />
            )}
            {c.submissionDeadline && (
              <Field
                label={t('conferences.submissionDeadline')}
                value={formatDate(c.submissionDeadline, locale)}
                icon={Clock}
                highlight={!submissionDeadlinePassed}
                warning={submissionDeadlinePassed}
              />
            )}
            {c.location && <Field label={t('conferences.location')} value={c.location} icon={MapPin} />}
            {c.organizer && <Field label={t('conferences.organizer')} value={c.organizer} icon={Building2} />}
          </div>

          {/* Research tracks */}
          {c.researchTracks && (
            <div className="pt-3 border-t border-border">
              <h3 className="text-sm font-semibold mb-1 flex items-center gap-1.5"><FileText className="h-4 w-4 text-primary" /> {t('conferences.tracks')}</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{c.researchTracks}</p>
            </div>
          )}

          {/* Proceedings info */}
          {c.proceedings && (
            <div className="pt-3 border-t border-border">
              <h3 className="text-sm font-semibold mb-1">{t('conferences.proceedings')}</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{c.proceedings}</p>
            </div>
          )}

          {/* Publisher info */}
          {c.publisher && (
            <div className="pt-3 border-t border-border">
              <h3 className="text-sm font-semibold mb-1 flex items-center gap-1.5"><Building2 className="h-4 w-4 text-primary" /> Publisher</h3>
              <p className="text-sm text-muted-foreground">{c.publisher}</p>
            </div>
          )}

          {/* Verification info */}
          <div className="pt-3 border-t border-border flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground mb-0.5">{t('journals.lastChecked')}</div>
              <div className="text-sm">{c.lastCheckedAt ? formatDate(c.lastCheckedAt, locale) : 'Not yet verified'}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground mb-0.5">{t('journals.reviewStatus')}</div>
              <VerificationBadge status={c.verification} />
            </div>
          </div>

          {/* Submission deadline warning */}
          {submissionDeadlinePassed && (
            <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-900 dark:text-amber-200">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>The submission deadline has passed. Check the conference website for any extensions or late-breaking calls.</span>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-3 border-t border-border">
            {c.website && (
              <Button asChild size="sm">
                <a href={c.website} target="_blank" rel="noopener noreferrer">
                  <Globe className="mr-2 h-4 w-4" /> {t('conferences.website')}
                </a>
              </Button>
            )}
            {c.registrationUrl && (
              <Button asChild size="sm" variant="secondary">
                <a href={c.registrationUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" /> {t('conferences.registration')}
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

      {/* Related conferences */}
      {data.related && data.related.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-semibold mb-3">Related conferences</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {data.related.map((r: any) => (
              <Card key={r.id} className="cursor-pointer hover:shadow-md" onClick={() => navigate(`conferences/${r.id}`)}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <VerificationBadge status={r.verification} />
                  </div>
                  <div className="font-medium text-sm line-clamp-1">{r.title}</div>
                  {r.eventDate && <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(r.eventDate, locale)}</div>}
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
