"use client"

import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { useNavigate } from '@/lib/router'
import { PageHeader, DemoBanner } from '@/components/shared/ui-helpers'
import { Card, CardContent } from '@/components/ui/card'
import { FlaskConical, Award, BookOpen, UsersRound, Database, CalendarDays, Users, GraduationCap, Microscope, Landmark, Lightbulb, MessageSquare } from 'lucide-react'

export function DiscoverPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [counts, setCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    fetch('/api/seed?stats=1', { cache: 'no-store' }).then(r => r.json()).then(d => setCounts(d)).catch(() => {})
  }, [])

  const tiles = [
    { icon: FlaskConical, label: t('nav.opportunities'), path: 'opportunities', desc: t('opportunities.subtitle'), count: counts.opportunities },
    { icon: Award, label: t('nav.funding'), path: 'funding', desc: t('funding.subtitle'), count: null },
    { icon: BookOpen, label: t('nav.journals'), path: 'journals', desc: t('journals.subtitle'), count: counts.journals },
    { icon: UsersRound, label: t('nav.conferences'), path: 'conferences', desc: t('conferences.subtitle'), count: null },
    { icon: Database, label: t('nav.datasets'), path: 'datasets', desc: t('datasets.subtitle'), count: counts.datasets },
    { icon: CalendarDays, label: t('nav.events'), path: 'events', desc: t('events.subtitle'), count: null },
    { icon: Users, label: t('nav.researchers'), path: 'researchers', desc: t('researchers.subtitle'), count: counts.researchers },
    { icon: GraduationCap, label: t('nav.mentors'), path: 'mentors', desc: t('mentors.subtitle'), count: null },
    { icon: Microscope, label: t('nav.laboratories'), path: 'laboratories', desc: t('laboratories.subtitle'), count: null },
    { icon: Landmark, label: t('nav.organizations'), path: 'organizations', desc: t('organizations.subtitle'), count: null },
    { icon: Lightbulb, label: t('nav.collaboration'), path: 'collaboration', desc: 'Find collaborators and post research assistant positions', count: null },
    { icon: MessageSquare, label: t('nav.community'), path: 'community', desc: t('community.subtitle'), count: null },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader title={t('discover.title')} subtitle={t('discover.subtitle')} />
      <div className="mb-6"><DemoBanner /></div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tiles.map(tile => (
          <Card
            key={tile.path}
            className="cursor-pointer hover:shadow-md hover:border-primary/30 transition h-full"
            onClick={() => navigate(tile.path)}
          >
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-primary/10 text-primary shrink-0">
                  <tile.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{tile.label}</h3>
                    {tile.count != null && tile.count > 0 && (
                      <span className="text-xs rounded-full bg-muted px-2 py-0.5 text-muted-foreground">{tile.count}</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{tile.desc}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
