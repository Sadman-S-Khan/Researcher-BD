"use client"

import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { useRouter, useNavigate } from '@/lib/router'
import { ListPage } from '@/components/shared/list-page'
import { PageHeader, DemoBanner, VerificationBadge, formatDate, EmptyState } from '@/components/shared/ui-helpers'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Microscope, Users, ExternalLink, Bookmark, BookmarkCheck, ArrowLeft,
  Building2, Globe, MapPin,
} from 'lucide-react'
import { toast } from 'sonner'
import { useSession } from '@/lib/session-context'

export function LaboratoriesPage({ id }: { id?: string }) {
  if (id) return <LaboratoryDetail id={id} />
  return <LaboratoriesList />
}

function LaboratoriesList() {
  const { t } = useI18n()
  return (
    <ListPage
      title={t('laboratories.title')}
      subtitle={t('laboratories.subtitle')}
      endpoint="/api/laboratories"
      navigateBase="laboratories"
      icon={Microscope}
      renderItem={(l) => (
        <Card className="hover:shadow-md h-full">
          <CardContent className="p-4">
            <h3 className="font-medium text-sm line-clamp-2">{l.name}</h3>
            {l.organization?.name && <p className="text-xs text-muted-foreground mt-1">{t('laboratories.organization')}: {l.organization.name}</p>}
            {l.researchAreas && <p className="text-xs mt-1">{l.researchAreas}</p>}
            {l.location && <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" /> {l.location}</p>}
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
              <Users className="h-3 w-3" /> {l._count?.members ?? 0} members
            </div>
          </CardContent>
        </Card>
      )}
    />
  )
}

function LaboratoryDetail({ id }: { id: string }) {
  const { t, locale } = useI18n()
  const navigate = useNavigate()
  const { user } = useSession()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [bookmarked, setBookmarked] = useState(false)

  useEffect(() => {
    fetch(`/api/laboratories/${id}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(d => { setData(d); setBookmarked(d.bookmarked) })
      .finally(() => setLoading(false))
  }, [id])

  const toggleBookmark = async () => {
    if (!user) { toast.error('Sign in required'); navigate('login'); return }
    const res = await fetch('/api/bookmarks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetType: 'laboratory', targetId: id }),
    })
    const d = await res.json()
    setBookmarked(d.bookmarked)
    toast.success(d.bookmarked ? t('common.bookmarked') : 'Removed')
  }

  if (loading) return <div className="container mx-auto px-4 py-8">{t('common.loading')}</div>
  if (!data?.laboratory) return <div className="container mx-auto px-4 py-8">{t('common.noResults')}</div>

  const l = data.laboratory

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Button variant="ghost" size="sm" onClick={() => navigate('laboratories')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> {t('common.back')}
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{l.name}</CardTitle>
          {l.organization?.name && (
            <CardDescription className="flex items-center gap-1">
              <Building2 className="h-3 w-3" /> {t('laboratories.organization')}: {l.organization.name}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-5">
          {l.description && (
            <div>
              <h3 className="text-sm font-semibold mb-1">Description</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{l.description}</p>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2 pt-3 border-t border-border">
            {l.researchAreas && <Field label={t('laboratories.researchAreas')} value={l.researchAreas} />}
            {l.location && <Field label={t('conferences.location')} value={l.location} icon={MapPin} />}
            <Field label={t('organizations.members')} value={String(l._count?.members ?? 0)} icon={Users} />
          </div>

          {/* Members */}
          {l.members && l.members.length > 0 && (
            <div className="pt-3 border-t border-border">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5"><Users className="h-4 w-4 text-primary" /> Members</h3>
              <div className="space-y-2">
                {l.members.map((m: any) => (
                  <div key={m.id} className="flex items-center gap-3 p-2 rounded border border-border">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{m.user.name?.charAt(0) ?? '?'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{m.user.name}</div>
                      <Badge variant="outline" className="text-[10px] mt-0.5">{m.role}</Badge>
                    </div>
                    <button onClick={() => navigate(`researchers/${m.user.id}`)} className="text-xs text-primary hover:underline">{t('researchers.viewProfile')}</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-3 border-t border-border">
            {l.website && (
              <Button asChild size="sm">
                <a href={l.website} target="_blank" rel="noopener noreferrer">
                  <Globe className="mr-2 h-4 w-4" /> Website
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
      <div className="flex items-center gap-1 text-sm">{Icon && <Icon className="h-3 w-3 text-muted-foreground" />} {value}</div>
    </div>
  )
}
