"use client"

import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { useRouter, useNavigate } from '@/lib/router'
import { PageHeader, DemoBanner, VerificationBadge, formatDate, EmptyState } from '@/components/shared/ui-helpers'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Users, ExternalLink, Bookmark, BookmarkCheck, ArrowLeft, MapPin,
  Building2, Globe, GraduationCap, Award, FileText, FolderKanban,
  HelpCircle, Lightbulb, BookOpen, Link2, MessageSquare,
} from 'lucide-react'
import { toast } from 'sonner'
import { useSession } from '@/lib/session-context'

export function ResearchersPage({ id }: { id?: string }) {
  if (id) return <ResearcherDetail id={id} />
  return <ResearchersList />
}

function ResearchersList() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      params.set('limit', '30')
      const res = await fetch(`/api/researchers?${params}`, { cache: 'no-store' })
      const d = await res.json()
      setItems(d.items ?? [])
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader title={t('researchers.title')} subtitle={t('researchers.subtitle')} />
      <div className="relative mb-6 max-w-md">
        <input
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm pl-10"
          placeholder={t('common.searchPlaceholder')}
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && load()}
        />
      </div>
      {loading ? <p className="text-sm text-muted-foreground">{t('common.loading')}</p> :
        items.length === 0 ? <EmptyState title={t('common.noResults')} icon={Users} /> :
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {items.map(r => (
            <Card key={r.id} className="cursor-pointer hover:shadow-md" onClick={() => navigate(`researchers/${r.id}`)}>
              <CardContent className="p-4 flex items-start gap-3">
                <Avatar className="h-12 w-12 border border-border">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">{r.name?.charAt(0)?.toUpperCase() ?? '?'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">{r.name}</h3>
                  <Badge variant="outline" className="text-[10px] mt-0.5">{r.role}</Badge>
                  {r.profile?.institution && <p className="text-xs text-muted-foreground mt-1 truncate">{r.profile.institution}</p>}
                  {r.profile?.researchInterests && <p className="text-xs mt-1 line-clamp-2">{r.profile.researchInterests}</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      }
    </div>
  )
}

function ResearcherDetail({ id }: { id: string }) {
  const { t, locale } = useI18n()
  const navigate = useNavigate()
  const { user } = useSession()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/researchers/${id}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(d => setData(d))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="container mx-auto px-4 py-8">{t('common.loading')}</div>
  if (!data?.researcher) return <div className="container mx-auto px-4 py-8">{t('common.noResults')}</div>

  const r = data.researcher
  const p = r.profile

  // Build a unified timeline from publications, contributions, projects, questions
  const timeline: Array<{ date: string; type: string; title: string; subtitle?: string; link?: string }> = []
  data.publications.forEach((pub: any) => {
    timeline.push({ date: pub.year ? `${pub.year}-01-01` : pub.createdAt, type: 'publication', title: pub.title, subtitle: pub.venue ?? pub.publisher, link: pub.url ?? (pub.doi ? `https://doi.org/${pub.doi}` : undefined) })
  })
  data.contributions.forEach((c: any) => {
    timeline.push({ date: c.year ? `${c.year}-01-01` : c.createdAt, type: 'contribution', title: c.title, subtitle: c.category, link: c.url })
  })
  data.projects.forEach((proj: any) => {
    timeline.push({ date: proj.createdAt ?? '', type: 'project', title: proj.title, subtitle: proj.researchDomain })
  })
  data.questions.forEach((q: any) => {
    timeline.push({ date: q.createdAt, type: 'question', title: q.title, subtitle: `${q._count?.answers ?? 0} answers`, link: `#/community/${q.id}` })
  })
  timeline.sort((a, b) => (b.date || '').localeCompare(a.date || ''))

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button variant="ghost" size="sm" onClick={() => navigate('researchers')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> {t('common.back')}
      </Button>

      {/* Profile header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20 border border-border">
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">{r.name?.charAt(0)?.toUpperCase() ?? '?'}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{r.name}</h1>
              <Badge variant="outline" className="mt-1">{r.role}</Badge>
              {p?.position && <p className="text-sm text-muted-foreground mt-2">{p.position}</p>}
              {p?.institution && (
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Building2 className="h-3 w-3" /> {p.institution}
                  {p?.department && <span> · {p.department}</span>}
                </p>
              )}
              {p?.location && <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" /> {p.location}</p>}
            </div>
          </div>

          {r.bio && <p className="text-sm text-muted-foreground mt-4 whitespace-pre-wrap">{r.bio}</p>}

          {/* Research interests */}
          {p?.researchInterests && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="text-xs text-muted-foreground mb-1">{t('researchers.interests')}</div>
              <p className="text-sm">{p.researchInterests}</p>
            </div>
          )}

          {/* Technical skills */}
          {p?.technicalSkills && (
            <div className="mt-3">
              <div className="text-xs text-muted-foreground mb-1">{t('researchers.skills')}</div>
              <p className="text-sm">{p.technicalSkills}</p>
            </div>
          )}

          {/* External profiles */}
          <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-2">
            {p?.orcid && <Button asChild size="sm" variant="outline"><a href={`https://orcid.org/${p.orcid}`} target="_blank" rel="noopener noreferrer"><Link2 className="mr-2 h-3 w-3" /> ORCID</a></Button>}
            {p?.scholarLink && <Button asChild size="sm" variant="outline"><a href={p.scholarLink} target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-2 h-3 w-3" /> Scholar</a></Button>}
            {p?.githubLink && <Button asChild size="sm" variant="outline"><a href={p.githubLink} target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-2 h-3 w-3" /> GitHub</a></Button>}
            {p?.linkedinLink && <Button asChild size="sm" variant="outline"><a href={p.linkedinLink} target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-2 h-3 w-3" /> LinkedIn</a></Button>}
            {p?.websiteLink && <Button asChild size="sm" variant="outline"><a href={p.websiteLink} target="_blank" rel="noopener noreferrer"><Globe className="mr-2 h-3 w-3" /> Website</a></Button>}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="timeline">
        <TabsList className="flex-wrap overflow-x-auto max-w-full">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="publications">Publications ({data.publications.length})</TabsTrigger>
          <TabsTrigger value="contributions">Contributions ({data.contributions.length})</TabsTrigger>
          <TabsTrigger value="projects">Projects ({data.projects.length})</TabsTrigger>
          <TabsTrigger value="questions">Questions ({data.questions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <Card><CardContent className="p-4">
            {timeline.length === 0 ? <EmptyState title="No activity yet" icon={Award} /> : (
              <div className="relative pl-6 border-l-2 border-border space-y-4">
                {timeline.slice(0, 20).map((item, i) => {
                  const Icon = item.type === 'publication' ? FileText :
                    item.type === 'contribution' ? Award :
                    item.type === 'project' ? FolderKanban :
                    item.type === 'question' ? HelpCircle : Lightbulb
                  return (
                    <div key={i} className="relative">
                      <div className="absolute -left-[31px] flex items-center justify-center h-6 w-6 rounded-full bg-background border-2 border-primary">
                        <Icon className="h-3 w-3 text-primary" />
                      </div>
                      <div className="ml-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] rounded bg-muted px-1.5 py-0.5 text-muted-foreground uppercase">{item.type}</span>
                          {item.date && <span className="text-xs text-muted-foreground">{formatDate(item.date, locale)}</span>}
                        </div>
                        <div className="text-sm font-medium mt-1">{item.title}</div>
                        {item.subtitle && <div className="text-xs text-muted-foreground mt-0.5">{item.subtitle}</div>}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="publications">
          <Card><CardContent className="p-4">
            {data.publications.length === 0 ? <EmptyState title="No publications listed" icon={BookOpen} /> : (
              <div className="space-y-3">
                {data.publications.map((pub: any) => {
                  let authors: string[] = []
                  try { authors = JSON.parse(pub.authorsList || '[]') } catch {}
                  return (
                    <div key={pub.id} className="p-3 rounded border border-border">
                      <div className="flex items-start gap-2">
                        <Badge variant="secondary" className="text-[10px] mt-0.5">{pub.type}</Badge>
                        <VerificationBadge status={pub.verification} />
                      </div>
                      <div className="font-medium text-sm mt-1">{pub.title}</div>
                      {authors.length > 0 && <div className="text-xs text-muted-foreground mt-0.5">{authors.join(', ')}</div>}
                      {pub.venue && <div className="text-xs text-muted-foreground mt-0.5">{pub.venue}{pub.year ? ` · ${pub.year}` : ''}</div>}
                      {pub.doi && <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary mt-1 hover:underline"><Link2 className="h-3 w-3" /> {pub.doi}</a>}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="contributions">
          <Card><CardContent className="p-4">
            {data.contributions.length === 0 ? <EmptyState title="No contributions listed" icon={Award} /> : (
              <div className="space-y-3">
                {data.contributions.map((c: any) => (
                  <div key={c.id} className="p-3 rounded border border-border">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px]">{c.category}</Badge>
                      <VerificationBadge status={c.verification} />
                    </div>
                    <div className="font-medium text-sm mt-1">{c.title}</div>
                    {c.description && <div className="text-xs text-muted-foreground mt-0.5">{c.description}</div>}
                    {c.year && <div className="text-xs text-muted-foreground mt-0.5">{c.year}</div>}
                  </div>
                ))}
              </div>
            )}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="projects">
          <Card><CardContent className="p-4">
            {data.projects.length === 0 ? <EmptyState title="No public projects" icon={FolderKanban} /> : (
              <div className="space-y-2">
                {data.projects.map((proj: any) => (
                  <div key={proj.id} className="p-3 rounded border border-border cursor-pointer hover:bg-accent" onClick={() => navigate(`projects/${proj.id}`)}>
                    <div className="font-medium text-sm">{proj.title}</div>
                    {proj.researchDomain && <div className="text-xs text-muted-foreground mt-0.5">{proj.researchDomain}</div>}
                    <Badge variant="outline" className="text-[10px] mt-1">{proj.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="questions">
          <Card><CardContent className="p-4">
            {data.questions.length === 0 ? <EmptyState title="No questions asked" icon={MessageSquare} /> : (
              <div className="space-y-2">
                {data.questions.map((q: any) => (
                  <div key={q.id} className="p-3 rounded border border-border cursor-pointer hover:bg-accent" onClick={() => navigate(`community/${q.id}`)}>
                    <div className="font-medium text-sm">{q.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                      <span>{formatDate(q.createdAt, locale)}</span>
                      <span>· {q._count?.answers ?? 0} answers</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
