"use client"

import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { useRouter, useNavigate } from '@/lib/router'
import { PageHeader, DemoBanner, EmptyState, formatDate } from '@/components/shared/ui-helpers'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from '@/components/ui/dialog'
import { Folder, Plus, ArrowLeft, ListChecks, Calendar, Users, Lock, Globe, FileText, Lightbulb } from 'lucide-react'
import { toast } from 'sonner'

export function ProjectsPage({ id }: { id?: string }) {
  if (id) return <ProjectDetail id={id} />
  return <ProjectList />
}

function ProjectList() {
  const { t, locale } = useI18n()
  const { navigate } = useRouter()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/projects', { cache: 'no-store' })
      const d = await res.json()
      setItems(d.items ?? [])
    } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title={t('projects.title')}
        subtitle={t('projects.subtitle')}
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> {t('projects.createNew')}</Button></DialogTrigger>
            <NewProjectDialog onClose={() => setOpen(false)} onCreated={(id) => { setOpen(false); navigate(`projects/${id}`) }} />
          </Dialog>
        }
      />
      {loading ? <p className="text-sm text-muted-foreground">{t('common.loading')}</p> :
        items.length === 0 ? <EmptyState title={t('projects.noProjects')} message="Create your first project to get started." icon={Folder} /> :
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {items.map(p => (
            <Card key={p.id} className="cursor-pointer hover:shadow-md" onClick={() => navigate(`projects/${p.id}`)}>
              <CardContent className="p-4">
                <div className="flex items-start gap-2 mb-2">
                  {p.isPrivate ? <Lock className="h-4 w-4 text-muted-foreground" /> : <Globe className="h-4 w-4 text-emerald-600" />}
                  <Badge variant="secondary" className="text-[10px]">{t(`projects.statuses.${p.status}`)}</Badge>
                </div>
                <h3 className="font-medium text-sm line-clamp-2">{p.title}</h3>
                {p.researchDomain && <p className="text-xs text-muted-foreground mt-1">{p.researchDomain}</p>}
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-3">
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {p._count?.members ?? 0}</span>
                  <span className="flex items-center gap-1"><ListChecks className="h-3 w-3" /> {p._count?.tasks ?? 0}</span>
                  {p.expectedEnd && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(p.expectedEnd, locale)}</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      }
    </div>
  )
}

function NewProjectDialog({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string) => void }) {
  const { t } = useI18n()
  const [form, setForm] = useState({
    title: '', description: '', researchDomain: '', objectives: '',
    status: 'planning', isPrivate: true, startDate: '', expectedEnd: '',
  })
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const d = await res.json()
      if (!res.ok) { toast.error(d.error ?? 'Failed'); return }
      toast.success('Project created')
      onCreated(d.project.id)
    } finally { setLoading(false) }
  }

  return (
    <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
      <DialogHeader><DialogTitle>{t('projects.createNew')}</DialogTitle></DialogHeader>
      <form onSubmit={submit} className="space-y-3">
        <div><Label>{t('projects.title')} *</Label><Input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
        <div><Label>{t('projects.description')}</Label><Textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
        <div className="grid grid-cols-2 gap-2">
          <div><Label>{t('projects.domain')}</Label><Input value={form.researchDomain} onChange={e => setForm(f => ({ ...f, researchDomain: e.target.value }))} /></div>
          <div><Label>{t('projects.status')}</Label>
            <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              {['planning', 'active', 'on-hold', 'completed', 'cancelled'].map(s => <option key={s} value={s}>{t(`projects.statuses.${s}`)}</option>)}
            </select>
          </div>
        </div>
        <div><Label>{t('projects.objectives')}</Label><Textarea rows={2} value={form.objectives} onChange={e => setForm(f => ({ ...f, objectives: e.target.value }))} /></div>
        <div className="grid grid-cols-2 gap-2">
          <div><Label>{t('projects.startDate')}</Label><Input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} /></div>
          <div><Label>{t('projects.expectedEnd')}</Label><Input type="date" value={form.expectedEnd} onChange={e => setForm(f => ({ ...f, expectedEnd: e.target.value }))} /></div>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="isPrivate" checked={form.isPrivate} onChange={e => setForm(f => ({ ...f, isPrivate: e.target.checked }))} />
          <Label htmlFor="isPrivate">{t('projects.private')}</Label>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="submit" disabled={loading}>{loading ? t('common.loading') : t('common.create')}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}

function ProjectDetail({ id }: { id: string }) {
  const { t, locale } = useI18n()
  const navigate = useNavigate()
  const [project, setProject] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const load = () => {
    fetch(`/api/projects/${id}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(d => { setProject(d.project); setCurrentUser(d.currentUser) })
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [id])

  if (loading) return <div className="container mx-auto px-4 py-8">{t('common.loading')}</div>
  if (!project) return <div className="container mx-auto px-4 py-8">{t('common.noResults')}</div>

  const isOwner = currentUser?.id === project.ownerId
  const isMember = project.members?.some((m: any) => m.userId === currentUser?.id)

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button variant="ghost" size="sm" onClick={() => navigate('projects')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> {t('common.back')}
      </Button>
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary">{t(`projects.statuses.${project.status}`)}</Badge>
            {project.isPrivate ? <Badge variant="outline"><Lock className="h-3 w-3 mr-1" /> {t('projects.private')}</Badge> : <Badge variant="outline"><Globe className="h-3 w-3 mr-1" /> {t('projects.public')}</Badge>}
          </div>
          <CardTitle className="text-2xl">{project.title}</CardTitle>
          {project.researchDomain && <CardDescription>{project.researchDomain}</CardDescription>}
        </CardHeader>
        <CardContent>
          {project.description && <p className="text-sm whitespace-pre-wrap mb-3">{project.description}</p>}
          {project.objectives && (
            <div className="mt-3">
              <div className="text-xs text-muted-foreground mb-1">{t('projects.objectives')}</div>
              <p className="text-sm whitespace-pre-wrap">{project.objectives}</p>
            </div>
          )}
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mt-4 pt-3 border-t border-border">
            <span>{t('projects.owner')}: {project.owner?.name}</span>
            {project.startDate && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(project.startDate, locale)}</span>}
            {project.expectedEnd && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(project.expectedEnd, locale)}</span>}
          </div>
        </CardContent>
      </Card>

      <ProjectTabs project={project} currentUser={currentUser} onReload={load} />
    </div>
  )
}

function ProjectTabs({ project, currentUser, onReload }: { project: any; currentUser: any; onReload: () => void }) {
  const { t, locale } = useI18n()
  const navigate = useNavigate()
  const [newTask, setNewTask] = useState({ title: '', description: '', status: 'todo', priority: 'medium', dueDate: '', assigneeId: '' })
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [newMemberRole, setNewMemberRole] = useState('member')
  const [newMilestone, setNewMilestone] = useState({ title: '', dueDate: '' })
  const [newResource, setNewResource] = useState({ title: '', url: '', notes: '' })
  const [newNote, setNewNote] = useState({ title: '', body: '' })
  const [loading, setLoading] = useState(false)

  const isOwner = currentUser?.id === project.ownerId

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`/api/projects/${project.id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTask,
          dueDate: newTask.dueDate || null,
          assigneeId: newTask.assigneeId || null,
        }),
      })
      if (!res.ok) { const d = await res.json(); toast.error(d.error ?? 'Failed'); return }
      toast.success('Task created')
      setNewTask({ title: '', description: '', status: 'todo', priority: 'medium', dueDate: '', assigneeId: '' })
      onReload()
    } finally { setLoading(false) }
  }

  const updateTaskStatus = async (taskId: string, status: string) => {
    const res = await fetch(`/api/projects/${project.id}/tasks`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, status }),
    })
    if (res.ok) { toast.success('Task updated'); onReload() }
  }

  const inviteMember = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`/api/projects/${project.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newMemberEmail, role: newMemberRole }),
      })
      if (!res.ok) {
        const d = await res.json()
        toast.error(d.error ?? 'Failed')
        return
      }
      toast.success('Member added')
      setNewMemberEmail('')
      onReload()
    } finally { setLoading(false) }
  }

  const removeMember = async (memberId: string) => {
    if (!confirm('Remove this member?')) return
    const res = await fetch(`/api/projects/${project.id}/members?memberId=${memberId}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Member removed'); onReload() }
  }

  const createItem = async (kind: 'milestone' | 'resource' | 'note', payload: any) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/projects/${project.id}/milestones?kind=${kind}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) { const d = await res.json(); toast.error(d.error ?? 'Failed'); return }
      toast.success(`${kind} created`)
      if (kind === 'milestone') setNewMilestone({ title: '', dueDate: '' })
      if (kind === 'resource') setNewResource({ title: '', url: '', notes: '' })
      if (kind === 'note') setNewNote({ title: '', body: '' })
      onReload()
    } finally { setLoading(false) }
  }

  const toggleMilestone = async (milestoneId: string, completed: boolean) => {
    const res = await fetch(`/api/projects/${project.id}/milestones`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ milestoneId, completed }),
    })
    if (res.ok) { onReload() }
  }

  return (
    <Tabs defaultValue="tasks">
      <TabsList className="flex-wrap overflow-x-auto max-w-full">
        <TabsTrigger value="tasks">{t('projects.tasks')} ({project.tasks?.length ?? 0})</TabsTrigger>
        <TabsTrigger value="members">{t('projects.members')} ({project.members?.length ?? 0})</TabsTrigger>
        <TabsTrigger value="milestones">{t('projects.milestones')} ({project.milestones?.length ?? 0})</TabsTrigger>
        <TabsTrigger value="resources">{t('projects.resources')} ({project.resources?.length ?? 0})</TabsTrigger>
        <TabsTrigger value="notes">{t('projects.notes')} ({project.notes?.length ?? 0})</TabsTrigger>
      </TabsList>

      {/* TASKS */}
      <TabsContent value="tasks">
        <Card className="mb-3"><CardContent className="p-4">
          <form onSubmit={createTask} className="space-y-2">
            <Input placeholder={t('projects.tasks') + ' — title'} required value={newTask.title} onChange={e => setNewTask(f => ({ ...f, title: e.target.value }))} />
            <Textarea placeholder="Description (optional)" rows={2} value={newTask.description} onChange={e => setNewTask(f => ({ ...f, description: e.target.value }))} />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" value={newTask.status} onChange={e => setNewTask(f => ({ ...f, status: e.target.value }))}>
                <option value="todo">To do</option>
                <option value="in-progress">In progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
              <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" value={newTask.priority} onChange={e => setNewTask(f => ({ ...f, priority: e.target.value }))}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              <Input type="date" value={newTask.dueDate} onChange={e => setNewTask(f => ({ ...f, dueDate: e.target.value }))} />
              <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" value={newTask.assigneeId} onChange={e => setNewTask(f => ({ ...f, assigneeId: e.target.value }))}>
                <option value="">Unassigned</option>
                {project.members?.map((m: any) => <option key={m.user.id} value={m.user.id}>{m.user.name}</option>)}
              </select>
            </div>
            <Button type="submit" size="sm" disabled={loading}>{t('projects.addTask')}</Button>
          </form>
        </CardContent></Card>

        <Card><CardContent className="p-4">
          {project.tasks?.length === 0 ? <EmptyState title="No tasks yet" icon={ListChecks} /> : (
            <div className="space-y-2">
              {project.tasks.map((task: any) => (
                <div key={task.id} className="flex items-center gap-3 p-2 rounded border border-border">
                  <select
                    className="flex h-7 rounded border border-input bg-transparent px-1 py-0 text-xs"
                    value={task.status}
                    onChange={e => updateTaskStatus(task.id, e.target.value)}
                  >
                    <option value="todo">To do</option>
                    <option value="in-progress">In progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{task.title}</div>
                    {task.description && <div className="text-xs text-muted-foreground mt-0.5">{task.description}</div>}
                    {task.assignee && <div className="text-xs text-muted-foreground mt-0.5">→ {task.assignee.name}</div>}
                  </div>
                  <Badge variant="outline" className="text-[10px]">{task.priority}</Badge>
                  {task.dueDate && <span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(task.dueDate, locale)}</span>}
                </div>
              ))}
            </div>
          )}
        </CardContent></Card>
      </TabsContent>

      {/* MEMBERS */}
      <TabsContent value="members">
        {isOwner && (
          <Card className="mb-3"><CardContent className="p-4">
            <form onSubmit={inviteMember} className="flex flex-wrap gap-2 items-end">
              <div className="flex-1 min-w-[200px]">
                <Label className="text-xs">Email</Label>
                <Input type="email" required placeholder="user@example.org" value={newMemberEmail} onChange={e => setNewMemberEmail(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Role</Label>
                <select className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm" value={newMemberRole} onChange={e => setNewMemberRole(e.target.value)}>
                  <option value="member">Member</option>
                  <option value="lead">Lead</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              <Button type="submit" size="sm" disabled={loading}>Invite</Button>
            </form>
          </CardContent></Card>
        )}

        <Card><CardContent className="p-4">
          <div className="space-y-2">
            {project.members?.map((m: any) => (
              <div key={m.id} className="flex items-center justify-between p-2 rounded border border-border">
                <div>
                  <div className="text-sm font-medium">{m.user.name}</div>
                  <Badge variant="outline" className="text-[10px] mt-0.5">{m.role}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => navigate(`researchers/${m.user.id}`)} className="text-xs text-primary hover:underline">{t('researchers.viewProfile')}</button>
                  {(isOwner || m.userId === currentUser?.id) && m.role !== 'owner' && (
                    <button onClick={() => removeMember(m.id)} className="text-xs text-destructive hover:underline">Remove</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent></Card>
      </TabsContent>

      {/* MILESTONES */}
      <TabsContent value="milestones">
        <Card className="mb-3"><CardContent className="p-4">
          <form onSubmit={(e) => { e.preventDefault(); createItem('milestone', { ...newMilestone, dueDate: newMilestone.dueDate || null }) }} className="flex gap-2 items-end">
            <div className="flex-1">
              <Label className="text-xs">Title</Label>
              <Input required value={newMilestone.title} onChange={e => setNewMilestone(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <Label className="text-xs">Due date</Label>
              <Input type="date" value={newMilestone.dueDate} onChange={e => setNewMilestone(f => ({ ...f, dueDate: e.target.value }))} />
            </div>
            <Button type="submit" size="sm" disabled={loading}>{t('projects.addMilestone')}</Button>
          </form>
        </CardContent></Card>

        <Card><CardContent className="p-4">
          {project.milestones?.length === 0 ? <EmptyState title="No milestones" icon={Calendar} /> : (
            <div className="space-y-2">
              {project.milestones.map((m: any) => (
                <div key={m.id} className="flex items-center gap-3 p-2 rounded border border-border">
                  <button onClick={() => toggleMilestone(m.id, !m.completed)} className="flex-shrink-0">
                    {m.completed ? <ListChecks className="h-5 w-5 text-emerald-600" /> : <Calendar className="h-5 w-5 text-muted-foreground" />}
                  </button>
                  <div className={`flex-1 text-sm ${m.completed ? 'line-through text-muted-foreground' : ''}`}>{m.title}</div>
                  {m.dueDate && <span className="text-xs text-muted-foreground">{formatDate(m.dueDate, locale)}</span>}
                </div>
              ))}
            </div>
          )}
        </CardContent></Card>
      </TabsContent>

      {/* RESOURCES */}
      <TabsContent value="resources">
        <Card className="mb-3"><CardContent className="p-4">
          <form onSubmit={(e) => { e.preventDefault(); createItem('resource', newResource) }} className="space-y-2">
            <Input placeholder="Resource title" required value={newResource.title} onChange={e => setNewResource(f => ({ ...f, title: e.target.value }))} />
            <Input type="url" placeholder="URL (optional)" value={newResource.url} onChange={e => setNewResource(f => ({ ...f, url: e.target.value }))} />
            <Input placeholder="Notes (optional)" value={newResource.notes} onChange={e => setNewResource(f => ({ ...f, notes: e.target.value }))} />
            <Button type="submit" size="sm" disabled={loading}>{t('projects.addResource')}</Button>
          </form>
        </CardContent></Card>

        <Card><CardContent className="p-4">
          {project.resources?.length === 0 ? <EmptyState title="No resources" icon={FileText} /> : (
            <div className="space-y-2">
              {project.resources.map((r: any) => (
                <div key={r.id} className="p-2 rounded border border-border">
                  <div className="text-sm font-medium">{r.title}</div>
                  {r.url && <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">{r.url}</a>}
                  {r.notes && <p className="text-xs text-muted-foreground mt-1">{r.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </CardContent></Card>
      </TabsContent>

      {/* NOTES */}
      <TabsContent value="notes">
        <Card className="mb-3"><CardContent className="p-4">
          <form onSubmit={(e) => { e.preventDefault(); createItem('note', newNote) }} className="space-y-2">
            <Input placeholder="Note title" required value={newNote.title} onChange={e => setNewNote(f => ({ ...f, title: e.target.value }))} />
            <Textarea placeholder="Note body" required rows={3} value={newNote.body} onChange={e => setNewNote(f => ({ ...f, body: e.target.value }))} />
            <Button type="submit" size="sm" disabled={loading}>{t('projects.addNote')}</Button>
          </form>
        </CardContent></Card>

        <Card><CardContent className="p-4">
          {project.notes?.length === 0 ? <EmptyState title="No notes" icon={Lightbulb} /> : (
            <div className="space-y-2">
              {project.notes.map((n: any) => (
                <div key={n.id} className="p-2 rounded border border-border">
                  <div className="text-sm font-medium">{n.title}</div>
                  <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">{n.body}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent></Card>
      </TabsContent>
    </Tabs>
  )
}
