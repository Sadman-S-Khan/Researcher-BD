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
  Landmark, Users, ExternalLink, Bookmark, BookmarkCheck, ArrowLeft,
  Building2, Globe, MapPin, Microscope,
} from 'lucide-react'
import { toast } from 'sonner'
import { useSession } from '@/lib/session-context'

export function OrganizationsPage({ id }: { id?: string }) {
  if (id) return <OrganizationDetail id={id} />
  return <OrganizationsList />
}

function OrganizationsList() {
  const { t } = useI18n()
  return (
    <ListPage
      title={t('organizations.title')}
      subtitle={t('organizations.subtitle')}
      endpoint="/api/organizations"
      navigateBase="organizations"
      icon={Landmark}
      typeParam="type"
      typeFilters={[
        { value: 'university', label: t('organizations.types.university') },
        { value: 'department', label: t('organizations.types.department') },
        { value: 'laboratory', label: t('organizations.types.laboratory') },
        { value: 'centre', label: t('organizations.types.centre') },
        { value: 'group', label: t('organizations.types.group') },
        { value: 'hub', label: t('organizations.types.hub') },
      ]}
      renderItem={(o) => (
        <Card className="hover:shadow-md h-full">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-[10px]">{t(`organizations.types.${o.type}`)}</Badge>
              <VerificationBadge status={o.verification} />
            </div>
            <h3 className="font-medium text-sm line-clamp-2">{o.name}</h3>
            {o.location && <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" /> {o.location}</p>}
            {o.researchAreas && <p className="text-xs mt-1">{o.researchAreas}</p>}
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
              <Users className="h-3 w-3" /> {o._count?.members ?? 0} {t('organizations.members').toLowerCase()}
            </div>
          </CardContent>
        </Card>
      )}
    />
  )
}

function OrganizationDetail({ id }: { id: string }) {
  const { t, locale } = useI18n()
  const navigate = useNavigate()
  const { user } = useSession()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [bookmarked, setBookmarked] = useState(false)

  useEffect(() => {
    fetch(`/api/organizations/${id}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(d => { setData(d); setBookmarked(d.bookmarked) })
      .finally(() => setLoading(false))
  }, [id])

  const toggleBookmark = async () => {
    if (!user) { toast.error('Sign in required'); navigate('login'); return }
    const res = await fetch('/api/bookmarks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetType: 'organization', targetId: id }),
    })
    const d = await res.json()
    setBookmarked(d.bookmarked)
    toast.success(d.bookmarked ? t('common.bookmarked') : 'Removed')
  }

  if (loading) return <div className="container mx-auto px-4 py-8">{t('common.loading')}</div>
  if (!data?.organization) return <div className="container mx-auto px-4 py-8">{t('common.noResults')}</div>

  const o = data.organization

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Button variant="ghost" size="sm" onClick={() => navigate('organizations')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> {t('common.back')}
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="text-[10px]">{t(`organizations.types.${o.type}`)}</Badge>
            <VerificationBadge status={o.verification} />
          </div>
          <CardTitle className="text-xl">{o.name}</CardTitle>
          {o.location && <CardDescription className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {o.location}</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-5">
          {o.description && (
            <div>
              <h3 className="text-sm font-semibold mb-1">Description</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{o.description}</p>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2 pt-3 border-t border-border">
            {o.researchAreas && <Field label={t('organizations.researchAreas')} value={o.researchAreas} />}
            {o.contactEmail && <Field label="Email" value={o.contactEmail} icon={Building2} />}
            {o.contactPhone && <Field label="Phone" value={o.contactPhone} />}
            <Field label={t('organizations.members')} value={String(o._count?.members ?? 0)} icon={Users} />
          </div>

          {/* Members list */}
          {o.members && o.members.length > 0 && (
            <div className="pt-3 border-t border-border">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5"><Users className="h-4 w-4 text-primary" /> {t('organizations.members')}</h3>
              <div className="space-y-2">
                {o.members.map((m: any) => (
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

          {/* Laboratories */}
          {o.laboratories && o.laboratories.length > 0 && (
            <div className="pt-3 border-t border-border">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5"><Microscope className="h-4 w-4 text-primary" /> {t('nav.laboratories')}</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {o.laboratories.map((l: any) => (
                  <Card key={l.id} className="cursor-pointer hover:shadow-md" onClick={() => navigate(`laboratories/${l.id}`)}>
                    <CardContent className="p-3">
                      <div className="font-medium text-sm">{l.name}</div>
                      {l.researchAreas && <div className="text-xs text-muted-foreground mt-0.5">{l.researchAreas}</div>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-3 border-t border-border">
            {o.website && (
              <Button asChild size="sm">
                <a href={o.website} target="_blank" rel="noopener noreferrer">
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
