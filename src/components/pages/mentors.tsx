"use client"

import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { useRouter, useNavigate } from '@/lib/router'
import { PageHeader, DemoBanner, EmptyState } from '@/components/shared/ui-helpers'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { GraduationCap, Search as SearchIcon, AlertCircle } from 'lucide-react'

export function MentorsPage() {
  const { t } = useI18n()
  const { navigate } = useRouter()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      params.set('mentorOnly', 'true')
      params.set('limit', '30')
      const res = await fetch(`/api/researchers?${params}`, { cache: 'no-store' })
      const d = await res.json()
      setItems(d.items ?? [])
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader title={t('mentors.title')} subtitle={t('mentors.subtitle')} />
      <div className="mb-4"><DemoBanner /></div>
      <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-900 dark:text-amber-200 mb-6">
        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>{t('mentors.disclaimer')}</span>
      </div>
      <div className="relative mb-6 max-w-md">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-10" placeholder={t('common.searchPlaceholder')} value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()} />
      </div>
      {loading ? <p className="text-sm text-muted-foreground">{t('common.loading')}</p> :
        items.length === 0 ? <EmptyState title={t('common.noResults')} icon={GraduationCap} /> :
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {items.map(r => (
            <Card key={r.id} className="cursor-pointer hover:shadow-md" onClick={() => navigate(`researchers/${r.id}`)}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12 border border-border">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">{r.name?.charAt(0)?.toUpperCase() ?? '?'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{r.name}</h3>
                    <Badge variant="outline" className="text-[10px] mt-0.5 border-emerald-500/30 text-emerald-700">{t('mentors.available')}</Badge>
                    {r.profile?.institution && <p className="text-xs text-muted-foreground mt-1 truncate">{r.profile.institution}</p>}
                  </div>
                </div>
                {r.mentorPref?.researchAreas && (
                  <div className="mt-3">
                    <div className="text-xs text-muted-foreground">{t('researchers.interests')}</div>
                    <div className="text-xs mt-0.5">{r.mentorPref.researchAreas}</div>
                  </div>
                )}
                {r.mentorPref?.preferredSkills && (
                  <div className="mt-2">
                    <div className="text-xs text-muted-foreground">{t('mentors.preferredSkills')}</div>
                    <div className="text-xs mt-0.5">{r.mentorPref.preferredSkills}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      }
    </div>
  )
}
