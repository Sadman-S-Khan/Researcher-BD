"use client"

import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { useRouter, useNavigate } from '@/lib/router'
import { PageHeader } from '@/components/shared/ui-helpers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Folder, ListChecks, Award, Bookmark, Bell, GraduationCap, FolderKanban,
  FileText, User, Settings, Plus, ArrowRight, Sparkles, Users,
} from 'lucide-react'
import { useSession } from '@/lib/session-context'

export function DashboardPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { user } = useSession()
  const [stats, setStats] = useState({ projects: 0, tasks: 0, publications: 0, bookmarks: 0, notifications: 0, progress: 0 })

  useEffect(() => {
    Promise.all([
      fetch('/api/projects', { cache: 'no-store' }).then(r => r.json()).then(d => ({ projects: d.total ?? 0 })),
      fetch('/api/bookmarks', { cache: 'no-store' }).then(r => r.json()).then(d => ({ bookmarks: (d.items ?? []).length })),
      fetch('/api/notifications?count=1', { cache: 'no-store' }).then(r => r.json()).then(d => ({ notifications: d.unread ?? 0 })),
      fetch('/api/publications', { cache: 'no-store' }).then(r => r.json()).then(d => ({ publications: (d.items ?? []).length })),
      fetch('/api/learn', { cache: 'no-store' }).then(r => r.json()).then(d => ({ progress: (d.progress ?? []).filter((p: any) => p.completed).length })),
    ]).then(results => {
      const merged = results.reduce((acc, r) => ({ ...acc, ...r }), {} as any)
      setStats(merged)
    }).catch(() => {})
  }, [])

  if (!user) return null

  const statCards = [
    { label: t('dashboard.stats.projects'), value: stats.projects, icon: Folder, path: 'projects' },
    { label: t('dashboard.stats.tasks'), value: stats.tasks, icon: ListChecks, path: 'tasks' },
    { label: t('dashboard.stats.publications'), value: stats.publications, icon: Award, path: 'contributions' },
    { label: t('dashboard.stats.bookmarks'), value: stats.bookmarks, icon: Bookmark, path: 'bookmarks' },
    { label: t('dashboard.stats.notifications'), value: stats.notifications, icon: Bell, path: 'notifications' },
    { label: t('dashboard.stats.progress'), value: stats.progress, icon: GraduationCap, path: 'learn' },
  ]

  const quickActions = [
    { label: t('projects.createNew'), icon: Plus, path: 'projects' },
    { label: t('community.askQuestion'), icon: FileText, path: 'community' },
    { label: t('opportunities.submitNew'), icon: Award, path: 'opportunities' },
    { label: t('profile.saveProfile'), icon: User, path: 'profile' },
  ]

  const menuItems = [
    { label: t('dashboard.myProfile'), icon: User, path: 'profile' },
    { label: t('dashboard.myProjects'), icon: FolderKanban, path: 'projects' },
    { label: t('dashboard.myTasks'), icon: ListChecks, path: 'tasks' },
    { label: t('dashboard.myBookmarks'), icon: Bookmark, path: 'bookmarks' },
    { label: t('dashboard.myNotifications'), icon: Bell, path: 'notifications' },
    { label: t('dashboard.myProgress'), icon: GraduationCap, path: 'learn' },
    { label: t('dashboard.settings'), icon: Settings, path: 'profile' },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader title={t('dashboard.title')} subtitle={`${t('dashboard.welcome')}, ${user.name}`} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
        {statCards.map((s, i) => (
          <Card key={s.label} className="group cursor-pointer card-hover gradient-border" onClick={() => navigate(s.path)}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary group-hover:from-primary group-hover:text-primary-foreground transition-all duration-300">
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold gradient-text">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">{t('dashboard.quickActions')}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map(a => (
              <Button key={a.label} variant="outline" className="w-full justify-start" onClick={() => navigate(a.path)}>
                <a.icon className="mr-2 h-4 w-4" /> {a.label}
                <ArrowRight className="ml-auto h-4 w-4" />
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Menu</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            {menuItems.map(m => (
              <button key={m.path} onClick={() => navigate(m.path)} className="flex items-center gap-3 w-full p-2 rounded hover:bg-accent text-left">
                <m.icon className="h-4 w-4 text-primary" />
                <span className="text-sm">{m.label}</span>
                <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* User card */}
      <Card className="mt-4">
        <CardContent className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
          <Avatar className="h-10 w-10 sm:h-12 sm:w-12 shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">{user.name?.charAt(0)?.toUpperCase() ?? 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{user.name}</div>
            <div className="text-xs text-muted-foreground truncate">{user.email}</div>
          </div>
          <Badge variant="secondary" className="shrink-0">{user.role}</Badge>
        </CardContent>
      </Card>

      {/* Smart researcher matching */}
      <RecommendedResearchers />
    </div>
  )
}

function RecommendedResearchers() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [matches, setMatches] = useState<any[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/researchers/matches', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => {
        setMatches(d.items ?? [])
        setMessage(d.message ?? null)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return null
  if (matches.length === 0 && !message) return null

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Recommended researchers
        </CardTitle>
      </CardHeader>
      <CardContent>
        {message ? (
          <p className="text-sm text-muted-foreground">{message}</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {matches.map(m => (
              <div
                key={m.id}
                className="flex items-start gap-3 p-3 rounded border border-border hover:bg-accent cursor-pointer"
                onClick={() => navigate(`researchers/${m.id}`)}
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{m.name?.charAt(0) ?? '?'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-medium text-sm">{m.name}</div>
                    <Badge variant="outline" className="text-[10px]">{m.role}</Badge>
                    {m.isMentor && <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-700">Available for mentoring</Badge>}
                  </div>
                  {m.institution && <div className="text-xs text-muted-foreground mt-0.5">{m.institution}</div>}
                  {m.researchInterests && <div className="text-xs mt-1 line-clamp-1">{m.researchInterests}</div>}
                  {m.reasons.length > 0 && (
                    <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                      {m.reasons.slice(0, 2).map((r: string, i: number) => (
                        <div key={i} className="flex items-start gap-1">
                          <span className="text-primary">•</span> {r}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground mt-1" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
