"use client"

import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { useRouter, useNavigate } from '@/lib/router'
import { PageHeader, DemoBanner, EmptyState, formatDate } from '@/components/shared/ui-helpers'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from '@/components/ui/dialog'
import { Lightbulb, Plus, Send, Check, X } from 'lucide-react'
import { useSession } from '@/lib/session-context'
import { toast } from 'sonner'

export function CollaborationPage() {
  const { t, locale } = useI18n()
  const navigate = useNavigate()
  const { user } = useSession()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      const res = await fetch(`/api/collaboration?${params}`, { cache: 'no-store' })
      const d = await res.json()
      setItems(d.items ?? [])
    } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title={t('nav.collaboration')}
        subtitle="Find collaborators, post research assistant positions, and find mentorship opportunities."
        action={user && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> New post</Button></DialogTrigger>
            <NewPostDialog onClose={() => setOpen(false)} onCreated={() => { setOpen(false); load() }} />
          </Dialog>
        )}
      />
      <div className="mb-4"><DemoBanner /></div>
      <Input placeholder={t('common.searchPlaceholder')} value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()} className="mb-4 max-w-md" />
      {loading ? <p className="text-sm text-muted-foreground">{t('common.loading')}</p> :
        items.length === 0 ? <EmptyState title={t('common.noResults')} icon={Lightbulb} /> :
        <div className="space-y-3">
          {items.map(p => (
            <CollaborationPostCard key={p.id} post={p} onReload={load} />
          ))}
        </div>
      }
    </div>
  )
}

function CollaborationPostCard({ post, onReload }: { post: any; onReload: () => void }) {
  const { t, locale } = useI18n()
  const { user } = useSession()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [requests, setRequests] = useState<any[]>([])
  const [showRequests, setShowRequests] = useState(false)

  const isOwner = user?.id === post.authorId

  const sendRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) { toast.error('Sign in required'); navigate('login'); return }
    const res = await fetch(`/api/collaboration/${post.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    })
    if (res.ok) {
      toast.success('Request sent')
      setMessage('')
      setOpen(false)
      onReload()
    } else {
      const d = await res.json()
      toast.error(d.error ?? 'Failed')
    }
  }

  const viewRequests = async () => {
    if (showRequests) {
      setShowRequests(false)
      return
    }
    const res = await fetch(`/api/collaboration/${post.id}/requests`, { cache: 'no-store' })
    const d = await res.json()
    setRequests(d.items ?? [])
    setShowRequests(true)
  }

  const handleRequest = async (requestId: string, action: 'accept' | 'reject') => {
    const res = await fetch(`/api/collaboration/${post.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, action }),
    })
    if (res.ok) {
      toast.success(action === 'accept' ? 'Request accepted' : 'Request rejected')
      onReload()
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10"><AvatarFallback className="bg-primary/10 text-primary">{post.author?.name?.charAt(0) ?? '?'}</AvatarFallback></Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-[10px]">{post.category}</Badge>
              {post.researchArea && <Badge variant="outline" className="text-[10px]">{post.researchArea}</Badge>}
              {post.status === 'closed' && <Badge variant="outline" className="text-[10px]">Closed</Badge>}
            </div>
            <h3 className="font-medium text-sm mt-2">{post.title}</h3>
            <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap line-clamp-3">{post.body}</p>
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <button onClick={() => navigate(`researchers/${post.author?.id}`)} className="hover:underline">{post.author?.name}</button>
              <span>· {formatDate(post.createdAt, locale)}</span>
              {post._count?.requests > 0 && <span>· {post._count.requests} requests</span>}
            </div>

            {!isOwner && post.status === 'open' && (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="mt-3">
                    <Send className="mr-1 h-3 w-3" /> Request collaboration
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Request collaboration</DialogTitle></DialogHeader>
                  <form onSubmit={sendRequest} className="space-y-3">
                    <div>
                      <Label>Message (optional)</Label>
                      <Textarea rows={4} value={message} onChange={e => setMessage(e.target.value)} placeholder="Briefly introduce yourself and your interest in collaborating..." />
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setOpen(false)}>{t('common.cancel')}</Button>
                      <Button type="submit"><Send className="mr-1 h-3 w-3" /> Send request</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}

            {isOwner && post._count?.requests > 0 && (
              <Button size="sm" variant="outline" className="mt-3" onClick={viewRequests}>
                {showRequests ? 'Hide' : 'View'} {post._count.requests} request{post._count.requests === 1 ? '' : 's'}
              </Button>
            )}

            {showRequests && (
              <div className="mt-3 space-y-2 border-t border-border pt-3">
                <div className="text-xs font-semibold text-muted-foreground uppercase">Requests</div>
                {requests.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No requests to display.</p>
                ) : (
                  requests.map(r => (
                    <div key={r.id} className="p-2 rounded border border-border bg-muted/20">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              onClick={() => navigate(`researchers/${r.user.id}`)}
                              className="text-sm font-medium hover:underline"
                            >
                              {r.user.name}
                            </button>
                            <Badge variant="outline" className="text-[10px]">{r.user.role}</Badge>
                            <Badge
                              variant={r.status === 'pending' ? 'secondary' : r.status === 'accepted' ? 'default' : 'outline'}
                              className="text-[10px]"
                            >
                              {r.status}
                            </Badge>
                          </div>
                          {r.message && (
                            <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">{r.message}</p>
                          )}
                          {r.user.profile?.institution && (
                            <p className="text-xs text-muted-foreground mt-1">{r.user.profile.institution}</p>
                          )}
                          <p className="text-[10px] text-muted-foreground mt-1">{formatDate(r.createdAt, locale)}</p>
                        </div>
                        {isOwner && r.status === 'pending' && (
                          <div className="flex flex-col gap-1 shrink-0">
                            <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => handleRequest(r.id, 'accept')}>
                              <Check className="mr-1 h-3 w-3" /> Accept
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleRequest(r.id, 'reject')}>
                              <X className="mr-1 h-3 w-3" /> Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function NewPostDialog({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { t } = useI18n()
  const [form, setForm] = useState({ title: '', body: '', category: 'collaboration', researchArea: '' })
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/collaboration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) { const d = await res.json(); toast.error(d.error ?? 'Failed'); return }
      toast.success('Posted')
      onCreated()
    } finally { setLoading(false) }
  }

  return (
    <DialogContent className="max-w-xl">
      <DialogHeader><DialogTitle>New collaboration post</DialogTitle></DialogHeader>
      <form onSubmit={submit} className="space-y-3">
        <div><Label>Title</Label><Input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
        <div><Label>Category</Label>
          <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
            <option value="collaboration">Collaboration</option>
            <option value="research-assistant">Research assistant</option>
            <option value="mentorship">Mentorship</option>
            <option value="co-author">Co-author</option>
            <option value="project-partner">Project partner</option>
          </select>
        </div>
        <div><Label>Research area</Label><Input value={form.researchArea} onChange={e => setForm(f => ({ ...f, researchArea: e.target.value }))} /></div>
        <div><Label>Details</Label><Textarea required rows={5} value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} /></div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="submit" disabled={loading}><Send className="mr-2 h-4 w-4" /> {loading ? t('common.loading') : t('common.submit')}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
