"use client"

import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { useNavigate } from '@/lib/router'
import { PageHeader, VerificationBadge, formatDate } from '@/components/shared/ui-helpers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Users, Award, Database, BookOpen, CalendarDays, Microscope, Landmark,
  FileText, AlertTriangle, ListChecks, FolderKanban, FlaskConical,
  Shield, Check, X, Ban, Search as SearchIcon, ScrollText,
} from 'lucide-react'
import { toast } from 'sonner'

export function AdminPage() {
  const { t, locale } = useI18n()
  const [metrics, setMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin', { cache: 'no-store' }).then(r => r.json()).then(d => setMetrics(d.metrics)).finally(() => setLoading(false))
  }, [])

  const metricCards = metrics ? [
    { label: t('admin.metricsList.users'), value: metrics.users, icon: Users },
    { label: t('admin.metricsList.researchers'), value: metrics.researchers, icon: Users },
    { label: t('admin.metricsList.submissions'), value: metrics.submissions, icon: ListChecks },
    { label: t('admin.metricsList.opportunities'), value: metrics.opportunities, icon: FlaskConical },
    { label: t('admin.metricsList.datasets'), value: metrics.datasets, icon: Database },
    { label: t('admin.metricsList.institutions'), value: metrics.institutions, icon: Landmark },
    { label: t('admin.metricsList.laboratories'), value: metrics.laboratories, icon: Microscope },
    { label: t('admin.metricsList.learning'), value: metrics.learning, icon: BookOpen },
    { label: t('admin.metricsList.events'), value: metrics.events, icon: CalendarDays },
    { label: t('admin.metricsList.reports'), value: metrics.reports, icon: AlertTriangle },
    { label: t('admin.metricsList.publications'), value: metrics.publications, icon: FileText },
    { label: t('admin.metricsList.journals'), value: metrics.journals, icon: BookOpen },
    { label: t('admin.metricsList.conferences'), value: metrics.conferences, icon: Users },
    { label: t('admin.metricsList.projects'), value: metrics.projects, icon: FolderKanban },
  ] : []

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader title={t('admin.title')} subtitle={t('admin.subtitle')} />
      <RefreshPanel />
      <ScimagoImportPanel />
      {loading ? <p className="text-sm text-muted-foreground">{t('common.loading')}</p> : (
        <>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">{t('admin.metrics')}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
              {metricCards.map(m => (
                <Card key={m.label}>
                  <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
                    <div className="flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 rounded-md bg-primary/10 text-primary shrink-0">
                      <m.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-lg sm:text-xl font-bold">{m.value}</div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground truncate">{m.label}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Tabs defaultValue="moderation">
            <TabsList className="flex-wrap overflow-x-auto max-w-full">
              <TabsTrigger value="moderation">{t('admin.moderation')} ({metrics.submissions})</TabsTrigger>
              <TabsTrigger value="users">{t('admin.userManagement')}</TabsTrigger>
              <TabsTrigger value="reports">{t('admin.reports')} ({metrics.reports})</TabsTrigger>
              <TabsTrigger value="audit">{t('admin.auditLogs')}</TabsTrigger>
            </TabsList>

            <TabsContent value="moderation">
              <ModerationQueue />
            </TabsContent>

            <TabsContent value="users">
              <UserManagement />
            </TabsContent>

            <TabsContent value="reports">
              <ReportsQueue />
            </TabsContent>

            <TabsContent value="audit">
              <AuditLogView />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}

function ModerationQueue() {
  const { t, locale } = useI18n()
  const navigate = useNavigate()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewNote, setReviewNote] = useState<Record<string, string>>({})

  const load = () => {
    setLoading(true)
    fetch('/api/admin/submissions?status=pending', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => setItems(d.items ?? []))
      .finally(() => setLoading(false))
  }
  useEffect(() => {
     
    load()
  }, [])

  const act = async (submissionId: string, action: 'approve' | 'reject') => {
    const note = reviewNote[submissionId] ?? ''
    const res = await fetch('/api/admin/submissions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submissionId, action, reviewNote: note }),
    })
    if (res.ok) {
      toast.success(action === 'approve' ? t('admin.approve') + 'd' : t('admin.reject') + 'ed')
      load()
    } else {
      const d = await res.json()
      toast.error(d.error ?? 'Failed')
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground">{t('common.loading')}</p>

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">{t('admin.moderation')}</CardTitle></CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Approving a submission updates the linked entity&rsquo;s verification status and creates an audit log entry. The submitter receives a notification.
        </p>
        {items.length === 0 ? (
          <div className="rounded-md border border-border p-6 text-center text-sm text-muted-foreground">
            {t('admin.noPending')}
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(s => (
              <div key={s.id} className="p-3 rounded-md border border-border">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-[10px]">{s.entityType}</Badge>
                      <Badge variant="outline" className="text-[10px]">{s.status}</Badge>
                      <span className="text-xs text-muted-foreground">{formatDate(s.createdAt, locale)}</span>
                    </div>
                    <div className="text-sm font-medium mt-1">Entity ID: {s.entityId}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Submitted by {s.submitter?.name} ({s.submitter?.email})</div>
                    <button
                      onClick={() => navigate(`#${s.entityType === 'opportunity' ? 'opportunities' : s.entityType + 's'}/${s.entityId}`)}
                      className="text-xs text-primary hover:underline mt-1 inline-block"
                    >
                      View {s.entityType} →
                    </button>
                  </div>
                </div>
                <div className="mt-2">
                  <Input
                    placeholder="Review note (optional)"
                    value={reviewNote[s.id] ?? ''}
                    onChange={e => setReviewNote(r => ({ ...r, [s.id]: e.target.value }))}
                    className="mb-2"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => act(s.id, 'approve')}>
                      <Check className="mr-1 h-3 w-3" /> {t('admin.approve')}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => act(s.id, 'reject')}>
                      <X className="mr-1 h-3 w-3" /> {t('admin.reject')}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function UserManagement() {
  const { t, locale } = useI18n()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  const load = () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (roleFilter !== 'all') params.set('role', roleFilter)
    fetch(`/api/admin/users?${params}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(d => setItems(d.items ?? []))
      .finally(() => setLoading(false))
  }
  useEffect(() => {
     
    load()
  }, [roleFilter])

  const changeRole = async (userId: string, role: string) => {
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action: 'role', value: role }),
    })
    if (res.ok) { toast.success('Role updated'); load() }
    else { const d = await res.json(); toast.error(d.error ?? 'Failed') }
  }

  const toggleBan = async (userId: string, currentlyBanned: boolean) => {
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action: 'ban', value: !currentlyBanned }),
    })
    if (res.ok) { toast.success(!currentlyBanned ? 'User banned' : 'User unbanned'); load() }
    else { const d = await res.json(); toast.error(d.error ?? 'Failed') }
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">{t('admin.userManagement')}</CardTitle></CardHeader>
      <CardContent>
        <div className="grid gap-2 sm:grid-cols-3 mb-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-10" placeholder="Search by name or email" value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()} />
          </div>
          <select className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="all">All roles</option>
            <option value="STUDENT">Student</option>
            <option value="RESEARCHER">Researcher</option>
            <option value="FACULTY">Faculty</option>
            <option value="ORG_REP">Org rep</option>
            <option value="MODERATOR">Moderator</option>
            <option value="ADMIN">Admin</option>
          </select>
          <Button onClick={load} variant="secondary">{t('common.filter')}</Button>
        </div>

        {loading ? <p className="text-sm text-muted-foreground">{t('common.loading')}</p> :
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {items.map(u => (
              <div key={u.id} className="p-3 rounded-md border border-border">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{u.name?.charAt(0) ?? '?'}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate">{u.name} {u.isBanned && <span className="text-destructive">(banned)</span>}</div>
                      <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Joined {formatDate(u.createdAt, locale)} · {u._count.opportunities} opps · {u._count.publications} pubs · {u._count.questions} questions
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground">Role:</span>
                  <select
                    className="flex h-7 rounded border border-input bg-transparent px-2 py-0 text-xs"
                    value={u.role}
                    onChange={e => changeRole(u.id, e.target.value)}
                  >
                    <option value="STUDENT">Student</option>
                    <option value="RESEARCHER">Researcher</option>
                    <option value="FACULTY">Faculty</option>
                    <option value="ORG_REP">Org rep</option>
                    <option value="MODERATOR">Moderator</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                  <Button size="sm" variant={u.isBanned ? 'outline' : 'destructive'} onClick={() => toggleBan(u.id, u.isBanned)}>
                    {u.isBanned ? <><Check className="mr-1 h-3 w-3" /> {t('admin.unban')}</> : <><Ban className="mr-1 h-3 w-3" /> {t('admin.ban')}</>}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        }
      </CardContent>
    </Card>
  )
}

function ReportsQueue() {
  const { t, locale } = useI18n()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [resolution, setResolution] = useState<Record<string, string>>({})

  const load = () => {
    setLoading(true)
    fetch('/api/admin/reports?status=open', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => setItems(d.items ?? []))
      .finally(() => setLoading(false))
  }
  useEffect(() => {
     
    load()
  }, [])

  const handle = async (reportId: string, status: 'resolved' | 'dismissed') => {
    const res = await fetch('/api/admin/reports', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportId, status, resolution: resolution[reportId] ?? '' }),
    })
    if (res.ok) { toast.success(`Report ${status}`); load() }
  }

  if (loading) return <p className="text-sm text-muted-foreground">{t('common.loading')}</p>

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">{t('admin.reports')}</CardTitle></CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="rounded-md border border-border p-6 text-center text-sm text-muted-foreground">
            No open reports
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(r => (
              <div key={r.id} className="p-3 rounded-md border border-border">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <Badge variant="secondary" className="text-[10px]">{r.targetType}</Badge>
                  <Badge variant="outline" className="text-[10px]">{r.status}</Badge>
                  <span className="text-xs text-muted-foreground">{formatDate(r.createdAt, locale)}</span>
                </div>
                <div className="text-sm">Target ID: <span className="font-mono">{r.targetId}</span></div>
                <div className="text-sm mt-1"><strong>Reason:</strong> {r.reason}</div>
                <div className="text-xs text-muted-foreground mt-1">Reported by {r.reporter?.name} ({r.reporter?.email})</div>
                <Input
                  placeholder="Resolution note (optional)"
                  value={resolution[r.id] ?? ''}
                  onChange={e => setResolution(s => ({ ...s, [r.id]: e.target.value }))}
                  className="mt-2"
                />
                <div className="flex gap-2 mt-2">
                  <Button size="sm" onClick={() => handle(r.id, 'resolved')}><Check className="mr-1 h-3 w-3" /> Resolve</Button>
                  <Button size="sm" variant="outline" onClick={() => handle(r.id, 'dismissed')}><X className="mr-1 h-3 w-3" /> Dismiss</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function AuditLogView() {
  const { t, locale } = useI18n()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/audit', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => setItems(d.items ?? []))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-sm text-muted-foreground">{t('common.loading')}</p>

  return (
    <Card>
      <CardHeader><CardTitle className="text-base flex items-center gap-2"><ScrollText className="h-4 w-4" /> {t('admin.auditLogs')}</CardTitle></CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="rounded-md border border-border p-6 text-center text-sm text-muted-foreground">
            No audit log entries yet
          </div>
        ) : (
          <div className="space-y-1 max-h-[600px] overflow-y-auto text-sm">
            {items.map((l, i) => (
              <div key={l.id} className="py-1 border-b border-border last:border-0 flex items-start gap-2">
                <span className="text-xs text-muted-foreground shrink-0 w-32">{formatDate(l.createdAt, locale)}</span>
                <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded shrink-0">{l.action}</span>
                <span className="text-xs flex-1">
                  {l.actor?.name ?? 'system'}
                  {l.targetType && ` → ${l.targetType}`}
                  {l.targetId && `:${l.targetId.slice(-6)}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}


// Automatic content updates: runs daily via Vercel Cron; admins can also run it on demand.
function RefreshPanel() {
  const [running, setRunning] = useState(false)
  const run = async () => {
    setRunning(true)
    try {
      const res = await fetch('/api/cron/daily', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Update failed')
      const r = data.report
      toast.success(`Update finished: ${r.doajAdded} journals added, ${r.doajUpdated + r.openalexUpdated} journals updated, ${r.metricsUpdated} journal metrics refreshed, ${r.eventsClosed} events closed${r.errors.length ? ` (${r.errors.length} source errors)` : ''}`)
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setRunning(false)
    }
  }
  return (
    <Card className="mb-6">
      <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <p className="text-sm font-medium">Automatic updates</p>
          <p className="text-xs text-muted-foreground mt-1">Runs every day at 03:00 (Dhaka): adds Bangladeshi journals from DOAJ, fills missing ISSNs and citation metrics from OpenAlex, and closes past events. Results appear in the audit log.</p>
        </div>
        <Button onClick={run} disabled={running} variant="outline" className="shrink-0">{running ? 'Updating…' : 'Run update now'}</Button>
      </CardContent>
    </Card>
  )
}


// Parse a semicolon-separated SCImago CSV (quoted fields may contain ';').
function parseScimagoCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = [], field = '', quoted = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (quoted) {
      if (ch === '"') { if (text[i + 1] === '"') { field += '"'; i++ } else quoted = false }
      else field += ch
    } else if (ch === '"') quoted = true
    else if (ch === ';') { row.push(field); field = '' }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      row.push(field); field = ''
      if (row.length > 1 || row[0]) rows.push(row)
      row = []
    } else field += ch
  }
  if (field || row.length) { row.push(field); rows.push(row) }
  return rows
}

// Import the SCImago Journal Rank file: adds Scopus-indexed journals with quartile, SJR and H-index.
function ScimagoImportPanel() {
  const [year, setYear] = useState(new Date().getFullYear() - 1)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState('')
  const onFile = async (file: File) => {
    setBusy(true); setProgress('Reading file…')
    try {
      const rows = parseScimagoCsv(await file.text())
      const header = rows[0].map(h => h.trim().toLowerCase())
      const col = (name: string) => header.findIndex(h => h === name.toLowerCase())
      const c = { sid: col('Sourceid'), title: col('Title'), type: col('Type'), issn: col('Issn'), sjr: col('SJR'), q: col('SJR Best Quartile'), h: col('H index'), country: col('Country'), publisher: col('Publisher'), cats: col('Categories'), areas: col('Areas') }
      if (c.sid < 0 || c.title < 0 || c.issn < 0) throw new Error('This does not look like a SCImago file (missing Sourceid/Title/Issn columns).')
      const num = (v?: string) => { if (!v) return null; const n = parseFloat(v.includes(',') ? v.replace(/\./g, '').replace(',', '.') : v); return Number.isFinite(n) ? n : null }
      const journals = rows.slice(1)
        .filter(r => (c.type < 0 || (r[c.type] ?? '').trim().toLowerCase() === 'journal') && r[c.title])
        .map(r => ({
          sourceId: (r[c.sid] ?? '').trim(),
          title: (r[c.title] ?? '').trim(),
          issns: (r[c.issn] ?? '').split(',').map(x => x.trim()).filter(Boolean).slice(0, 4),
          sjr: c.sjr >= 0 ? num(r[c.sjr]) : null,
          quartile: c.q >= 0 && /^Q[1-4]$/.test((r[c.q] ?? '').trim()) ? (r[c.q].trim() as 'Q1') : null,
          hIndex: c.h >= 0 ? (parseInt(r[c.h] ?? '', 10) || null) : null,
          country: c.country >= 0 ? (r[c.country] ?? '').trim() || null : null,
          publisher: c.publisher >= 0 ? (r[c.publisher] ?? '').trim().slice(0, 300) || null : null,
          categories: c.cats >= 0 ? (r[c.cats] ?? '').trim().slice(0, 2000) || null : null,
          areas: c.areas >= 0 ? (r[c.areas] ?? '').trim().slice(0, 1000) || null : null,
        }))
        .filter(j => j.sourceId && j.title)
      let added = 0, updated = 0
      const size = 1500
      for (let i = 0; i < journals.length; i += size) {
        setProgress(`Importing ${Math.min(i + size, journals.length).toLocaleString()} of ${journals.length.toLocaleString()} journals…`)
        const res = await fetch('/api/admin/journal-import', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ year, rows: journals.slice(i, i + size) }) })
        const d = await res.json()
        if (!res.ok) throw new Error(d.error || 'Import failed')
        added += d.added; updated += d.updated
      }
      await fetch('/api/admin/journal-import', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ year, file: file.name, journals: journals.length, added, updated }) })
      setProgress(`Done: ${added.toLocaleString()} journals added, ${updated.toLocaleString()} updated (SCImago ${year}).`)
      toast.success('SCImago import finished')
    } catch (e) {
      setProgress('')
      toast.error((e as Error).message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <Card className="mb-6">
      <CardContent className="p-4 space-y-3">
        <div>
          <p className="text-sm font-medium">Import Scopus journals from SCImago</p>
          <p className="text-xs text-muted-foreground mt-1">
            Download the free journal list at <a className="text-primary underline" href="https://www.scimagojr.com/journalrank.php" target="_blank" rel="noreferrer">scimagojr.com/journalrank.php</a> (button &ldquo;Download data&rdquo;, CSV), then choose the file here.
            Adds every journal in the file (all are Scopus-indexed) with quartile, SJR and H-index, and updates journals already listed. Re-import each year when SCImago publishes new rankings.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
          <div>
            <Label htmlFor="sjr-year" className="text-xs">SCImago year</Label>
            <Input id="sjr-year" type="number" className="w-28" value={year} onChange={e => setYear(parseInt(e.target.value, 10) || year)} />
          </div>
          <Input type="file" accept=".csv,text/csv" disabled={busy} onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f) }} className="sm:max-w-sm" />
        </div>
        {progress && <p className="text-xs text-muted-foreground">{progress}</p>}
      </CardContent>
    </Card>
  )
}
