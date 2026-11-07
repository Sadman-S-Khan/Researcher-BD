"use client"

import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { useRouter, useNavigate } from '@/lib/router'
import { PageHeader, DemoBanner, EmptyState, formatDate } from '@/components/shared/ui-helpers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from '@/components/ui/dialog'
import {
  MessageSquare, HelpCircle, Plus, ArrowLeft, Eye, MessageCircle, Send,
} from 'lucide-react'
import { useSession } from '@/lib/session-context'
import { toast } from 'sonner'

export function CommunityPage({ id }: { id?: string }) {
  if (id) return <QuestionDetail id={id} />
  return <QuestionList />
}

function QuestionList() {
  const { t, locale } = useI18n()
  const { route, navigate } = useRouter()
  const { user } = useSession()
  const [items, setItems] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [cat, setCat] = useState(route.query.cat ?? 'all')
  const [askOpen, setAskOpen] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (cat !== 'all') params.set('cat', cat)
      params.set('limit', '30')
      const res = await fetch(`/api/community?${params}`, { cache: 'no-store' })
      const d = await res.json()
      setItems(d.items ?? [])
      setCategories(d.categories ?? [])
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [cat])

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title={t('community.title')}
        subtitle={t('community.subtitle')}
        action={user && (
          <Dialog open={askOpen} onOpenChange={setAskOpen}>
            <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> {t('community.askQuestion')}</Button></DialogTrigger>
            <AskDialog categories={categories} onClose={() => setAskOpen(false)} onCreated={() => { setAskOpen(false); load() }} />
          </Dialog>
        )}
      />
      <div className="mb-4"><DemoBanner /></div>

      <div className="flex flex-wrap gap-2 mb-6">
        <Button variant={cat === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setCat('all')}>{t('common.all')}</Button>
        {categories.map(c => (
          <Button key={c.slug} variant={cat === c.slug ? 'default' : 'outline'} size="sm" onClick={() => setCat(c.slug)}>
            {locale === 'bn' ? c.nameBn : c.nameEn}
          </Button>
        ))}
      </div>

      <Input placeholder={t('common.searchPlaceholder')} value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()} className="mb-4 max-w-md" />

      {loading ? <p className="text-sm text-muted-foreground">{t('common.loading')}</p> :
        items.length === 0 ? <EmptyState title={t('common.noResults')} icon={HelpCircle} /> :
        <div className="space-y-2">
          {items.map(q => (
            <Card key={q.id} className="cursor-pointer hover:shadow-md" onClick={() => navigate(`community/${q.id}`)}>
              <CardContent className="p-4 flex items-start gap-3">
                <div className="flex flex-col items-center text-center min-w-12">
                  <div className="text-xs text-muted-foreground flex items-center gap-1"><MessageCircle className="h-3 w-3" /> {q._count?.answers ?? 0}</div>
                  <div className="text-[10px] text-muted-foreground">{t('community.answers').toLowerCase()}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm line-clamp-1">{q.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{q.body}</p>
                  <div className="flex flex-wrap gap-1 mt-2 items-center">
                    {q.category && <Badge variant="secondary" className="text-[10px]">{locale === 'bn' ? q.category.nameBn : q.category.nameEn}</Badge>}
                    {q.tags?.split(',').map((tag: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-[10px]">{tag.trim()}</Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Avatar className="h-5 w-5"><AvatarFallback className="text-[10px]">{q.author?.name?.charAt(0) ?? '?'}</AvatarFallback></Avatar>
                    <span>{t('community.askedBy')} {q.author?.name}</span>
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {q.views}</span>
                    <span>· {formatDate(q.createdAt, locale)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      }
    </div>
  )
}

function QuestionDetail({ id }: { id: string }) {
  const { t, locale } = useI18n()
  const navigate = useNavigate()
  const { user } = useSession()
  const [q, setQ] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [answerText, setAnswerText] = useState('')

  const load = () => {
    fetch(`/api/community/${id}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(d => setQ(d.question))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [id])

  const submitAnswer = async () => {
    if (!user) { toast.error('Sign in required'); navigate('login'); return }
    if (answerText.trim().length < 5) { toast.error('Answer too short'); return }
    const res = await fetch(`/api/community/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: answerText }),
    })
    if (res.ok) {
      setAnswerText('')
      toast.success('Answer posted')
      load()
    }
  }

  if (loading) return <div className="container mx-auto px-4 py-8">{t('common.loading')}</div>
  if (!q) return <div className="container mx-auto px-4 py-8">{t('common.noResults')}</div>

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Button variant="ghost" size="sm" onClick={() => navigate('community')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> {t('common.back')}
      </Button>
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-wrap gap-2 mb-2">
            {q.category && <Badge variant="secondary">{locale === 'bn' ? q.category.nameBn : q.category.nameEn}</Badge>}
            {q.tags?.split(',').map((tag: string, i: number) => <Badge key={i} variant="outline" className="text-[10px]">{tag.trim()}</Badge>)}
          </div>
          <CardTitle className="text-xl">{q.title}</CardTitle>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Avatar className="h-6 w-6"><AvatarFallback className="text-[10px]">{q.author?.name?.charAt(0) ?? '?'}</AvatarFallback></Avatar>
            <span>{t('community.askedBy')} {q.author?.name}</span>
            <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {q.views}</span>
            <span>· {formatDate(q.createdAt, locale)}</span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm whitespace-pre-wrap">{q.body}</p>
        </CardContent>
      </Card>

      <h3 className="text-sm font-semibold mb-3">{t('community.answers')} ({q.answers?.length ?? 0})</h3>
      {q.answers?.length === 0 ? (
        <p className="text-sm text-muted-foreground mb-6">{t('community.noAnswers')}</p>
      ) : (
        <div className="space-y-3 mb-6">
          {q.answers.map((a: any) => (
            <Card key={a.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2 text-xs">
                  <Avatar className="h-6 w-6"><AvatarFallback className="text-[10px]">{a.author?.name?.charAt(0) ?? '?'}</AvatarFallback></Avatar>
                  <span className="font-medium">{a.author?.name}</span>
                  <span className="text-muted-foreground">{t('community.answeredBy')}</span>
                  <span className="text-muted-foreground">· {formatDate(a.createdAt, locale)}</span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{a.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {user ? (
        <Card>
          <CardContent className="p-4">
            <Label className="mb-2 block">{t('community.answerThis')}</Label>
            <Textarea rows={4} value={answerText} onChange={e => setAnswerText(e.target.value)} />
            <Button className="mt-3" onClick={submitAnswer}>
              <Send className="mr-2 h-4 w-4" /> {t('common.submit')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4 text-center text-sm text-muted-foreground">
            <Button variant="outline" onClick={() => navigate('login')}>{t('nav.login')}</Button> to {t('community.answerThis').toLowerCase()}.
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function AskDialog({ categories, onClose, onCreated }: { categories: any[]; onClose: () => void; onCreated: () => void }) {
  const { t, locale } = useI18n()
  const [form, setForm] = useState({ title: '', body: '', categoryId: '', tags: '' })
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const d = await res.json()
        toast.error(d.error ?? 'Failed')
        return
      }
      toast.success('Question posted')
      onCreated()
    } finally { setLoading(false) }
  }

  return (
    <DialogContent className="max-w-xl">
      <DialogHeader><DialogTitle>{t('community.askQuestion')}</DialogTitle></DialogHeader>
      <form onSubmit={submit} className="space-y-3">
        <div><Label>{t('community.questionTitle')}</Label><Input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
        <div><Label>{t('community.questionBody')}</Label><Textarea required rows={4} value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} /></div>
        <div><Label>{t('community.category')}</Label>
          <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}>
            <option value="">—</option>
            {categories.map(c => <option key={c.id} value={c.id}>{locale === 'bn' ? c.nameBn : c.nameEn}</option>)}
          </select>
        </div>
        <div><Label>{t('community.tags')}</Label><Input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="nlp, python, thesis" /></div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="submit" disabled={loading}>{loading ? t('common.loading') : t('common.submit')}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
