"use client"

import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { useRouter, useNavigate } from '@/lib/router'
import { PageHeader, DemoBanner, EmptyState } from '@/components/shared/ui-helpers'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle2, Circle, Clock, BookOpen, Compass, Lightbulb, Database, PenLine, ShieldCheck, FileText, ArrowLeft, Bookmark } from 'lucide-react'
import { useSession } from '@/lib/session-context'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'

const catIcons: Record<string, any> = {
  fundamentals: Compass,
  literature: BookOpen,
  'data-analysis': Database,
  tools: PenLine,
  writing: FileText,
  ethics: ShieldCheck,
}

export function LearnPage({ slug }: { slug: string }) {
  const { t, locale } = useI18n()
  const { route, navigate } = useRouter()
  const { user } = useSession()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/learn', { cache: 'no-store' }).then(r => r.json()).then(d => setData(d)).finally(() => setLoading(false))
  }, [])

  // If slug is a lesson slug, show lesson detail
  if (loading) return <div className="container mx-auto px-4 py-8">{t('common.loading')}</div>
  if (!data) return <div className="container mx-auto px-4 py-8">{t('common.error')}</div>

  const lesson = data.lessons.find((l: any) => l.slug === slug)
  if (lesson) {
    return <LessonDetail lesson={lesson} progress={data.progress} bookmarks={data.bookmarks} allLessons={data.lessons} />
  }

  // Otherwise show the catalog
  const activeCat = route.query.cat ?? 'all'
  const tab = route.query.tab ?? 'lessons'

  const filteredLessons = activeCat === 'all' ? data.lessons : data.lessons.filter((l: any) => l.category === activeCat)
  const completedCount = data.progress.filter((p: any) => p.completed).length
  const totalCount = data.lessons.length
  const progressPct = totalCount ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader title={t('learn.title')} subtitle={t('learn.subtitle')} />

      {user && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-sm font-medium">{t('learn.progress')}</div>
                <div className="text-xs text-muted-foreground">{completedCount} / {totalCount} {t('learn.completed').toLowerCase()}</div>
              </div>
              <div className="text-2xl font-bold text-primary">{progressPct}%</div>
            </div>
            <Progress value={progressPct} />
          </CardContent>
        </Card>
      )}

      {/* Category pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant={activeCat === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => navigate('learn?cat=all')}
        >
          {t('common.all')}
        </Button>
        {data.categories.map((c: any) => {
          const Icon = catIcons[c.slug] ?? BookOpen
          return (
            <Button
              key={c.slug}
              variant={activeCat === c.slug ? 'default' : 'outline'}
              size="sm"
              onClick={() => navigate(`learn?cat=${c.slug}`)}
              className="gap-2"
            >
              <Icon className="h-4 w-4" />
              {locale === 'bn' ? c.nameBn : c.nameEn}
            </Button>
          )
        })}
      </div>

      <Tabs value={tab} onValueChange={v => navigate(`learn?cat=${activeCat}&tab=${v}`)}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="lessons">{t('learn.lessons')}</TabsTrigger>
          <TabsTrigger value="paths">{t('learn.paths')}</TabsTrigger>
          <TabsTrigger value="categories">{t('learn.categories')}</TabsTrigger>
        </TabsList>

        <TabsContent value="lessons">
          {filteredLessons.length === 0 ? <EmptyState title={t('common.noResults')} icon={BookOpen} /> : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {filteredLessons.map((l: any) => {
                const prog = data.progress.find((p: any) => p.lessonId === l.id)
                const isMarked = data.bookmarks.includes(l.id)
                const Icon = catIcons[l.category] ?? BookOpen
                return (
                  <Card key={l.id} className="cursor-pointer hover:shadow-md h-full" onClick={() => navigate(`learn/${l.slug}`)}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Icon className="h-5 w-5 text-primary" />
                        <div className="flex items-center gap-2">
                          {isMarked && <Bookmark className="h-3 w-3 fill-primary text-primary" />}
                          {prog?.completed ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
                        </div>
                      </div>
                      <h3 className="font-medium text-sm">{locale === 'bn' ? l.titleBn : l.titleEn}</h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                        <Clock className="h-3 w-3" /> {l.durationMin} {t('learn.minutes')}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="paths">
          {data.paths.length === 0 ? <EmptyState title={t('common.noResults')} icon={Lightbulb} /> : (
            <div className="grid gap-3 md:grid-cols-2">
              {data.paths.map((p: any) => (
                <Card key={p.id}>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2"><Compass className="h-4 w-4 text-primary" /> {locale === 'bn' ? p.titleBn : p.titleEn}</CardTitle>
                    <CardDescription>{locale === 'bn' ? p.descriptionBn : p.descriptionEn}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="categories">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {data.categories.map((c: any) => {
              const Icon = catIcons[c.slug] ?? BookOpen
              const count = data.lessons.filter((l: any) => l.category === c.slug).length
              return (
                <Card key={c.id} className="cursor-pointer hover:shadow-md" onClick={() => navigate(`learn?cat=${c.slug}`)}>
                  <CardContent className="p-4">
                    <Icon className="h-6 w-6 text-primary mb-2" />
                    <h3 className="font-medium text-sm">{locale === 'bn' ? c.nameBn : c.nameEn}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{count} {t('learn.lessons').toLowerCase()}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function LessonDetail({ lesson, progress, bookmarks, allLessons }: { lesson: any; progress: any[]; bookmarks: string[]; allLessons: any[] }) {
  const { t, locale } = useI18n()
  const navigate = useNavigate()
  const { user } = useSession()
  const [completed, setCompleted] = useState(progress.find((p: any) => p.lessonId === lesson.id)?.completed ?? false)
  const [marked, setMarked] = useState(bookmarks.includes(lesson.id))

  const toggleComplete = async () => {
    if (!user) { toast.error('Sign in required'); navigate('login'); return }
    const res = await fetch(`/api/learn/${lesson.id}`, { method: 'POST' })
    const d = await res.json()
    setCompleted(d.progress?.completed ?? false)
    toast.success(d.progress?.completed ? t('learn.completed') : 'Progress reset')
  }

  const related = allLessons.filter((l: any) => l.category === lesson.category && l.id !== lesson.id).slice(0, 4)

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Button variant="ghost" size="sm" onClick={() => navigate('learn')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> {t('common.back')}
      </Button>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary">{lesson.category}</Badge>
            <Badge variant="outline" className="text-[10px]"><Clock className="h-3 w-3 mr-1" /> {lesson.durationMin} {t('learn.minutes')}</Badge>
          </div>
          <CardTitle className="text-2xl">{locale === 'bn' ? lesson.titleBn : lesson.titleEn}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{locale === 'bn' ? lesson.bodyBn : lesson.bodyEn}</ReactMarkdown>
          </div>
          <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-border">
            <Button onClick={toggleComplete} variant={completed ? 'default' : 'outline'}>
              {completed ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <Circle className="mr-2 h-4 w-4" />}
              {completed ? t('learn.completed') : t('learn.markComplete')}
            </Button>
          </div>
        </CardContent>
      </Card>
      {related.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-semibold mb-3">Related lessons</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {related.map((l: any) => (
              <Card key={l.id} className="cursor-pointer hover:shadow-md" onClick={() => navigate(`learn/${l.slug}`)}>
                <CardContent className="p-3">
                  <div className="font-medium text-sm">{locale === 'bn' ? l.titleBn : l.titleEn}</div>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Clock className="h-3 w-3" /> {l.durationMin} {t('learn.minutes')}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
