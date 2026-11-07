"use client"

import { useEffect, useState, type FormEvent } from 'react'
import { useI18n } from '@/lib/i18n'
import { useRouter, useNavigate } from '@/lib/router'
import { PageHeader, VerificationBadge, formatDate } from '@/components/shared/ui-helpers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useSession } from '@/lib/session-context'
import { toast } from 'sonner'
import { Save, Download, Globe, Lock, ExternalLink, Search as SearchIcon, Link2, AlertCircle, Check, FileText, Plus, Camera } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function ProfilePage() {
  const { t, locale } = useI18n()
  const navigate = useNavigate()
  const { user, refresh } = useSession()
  const [form, setForm] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/profile', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => {
        if (d.user) {
          setForm({
            displayName: d.user.displayName ?? '',
            bio: d.user.bio ?? '',
            isPublic: d.user.isPublic ?? true,
            locale: d.user.locale ?? 'en',
            institution: d.user.profile?.institution ?? '',
            department: d.user.profile?.department ?? '',
            position: d.user.profile?.position ?? '',
            education: d.user.profile?.education ?? '',
            researchInterests: d.user.profile?.researchInterests ?? '',
            technicalSkills: d.user.profile?.technicalSkills ?? '',
            orcid: d.user.profile?.orcid ?? '',
            scholarLink: d.user.profile?.scholarLink ?? '',
            githubLink: d.user.profile?.githubLink ?? '',
            linkedinLink: d.user.profile?.linkedinLink ?? '',
            websiteLink: d.user.profile?.websiteLink ?? '',
            location: d.user.profile?.location ?? '',
            contactEmail: d.user.profile?.contactEmail ?? '',
            contactPhone: d.user.profile?.contactPhone ?? '',
            awards: d.user.profile?.awards ?? '',
            experience: d.user.profile?.experience ?? '',
          })
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const d = await res.json()
        toast.error(d.error ?? 'Save failed')
        return
      }
      toast.success(t('profile.saved'))
      await refresh()
    } finally { setSaving(false) }
  }

  const exportCV = () => {
    const cv = {
      name: user?.name,
      email: user?.email,
      role: user?.role,
      ...form,
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(cv, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${user?.name?.replace(/\s/g, '_')}_cv.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading || !user) return <div className="container mx-auto px-4 py-8">{t('common.loading')}</div>

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <PageHeader
        title={t('profile.title')}
        subtitle={user.email}
        action={
          <>
            <Button variant="outline" onClick={exportCV} size="sm"><Download className="mr-2 h-4 w-4" /> {t('profile.generateCV')}</Button>
            <Button onClick={save} disabled={saving} size="sm"><Save className="mr-2 h-4 w-4" /> {saving ? t('common.loading') : t('profile.saveProfile')}</Button>
          </>
        }
      />
      <Tabs defaultValue="basic">
        <TabsList className="flex-wrap overflow-x-auto max-w-full">
          <TabsTrigger value="basic">{t('profile.basicInfo')}</TabsTrigger>
          <TabsTrigger value="academic">{t('profile.academicInfo')}</TabsTrigger>
          <TabsTrigger value="research">{t('profile.researchInterests')}</TabsTrigger>
          <TabsTrigger value="external">{t('profile.externalProfiles')}</TabsTrigger>
          <TabsTrigger value="publications">{t('nav.publications')}</TabsTrigger>
          <TabsTrigger value="contact">{t('profile.contactInfo')}</TabsTrigger>
          <TabsTrigger value="privacy">{t('profile.privacy')}</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">{locale === 'bn' ? 'পাসওয়ার্ড' : 'Password'}</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card><CardContent className="p-4 space-y-3">
            <AvatarUploader
              currentAvatarUrl={user.avatarUrl ?? undefined}
              name={user.name}
              onUploaded={(url) => { refresh(); toast.success('Avatar updated') }}
            />
            <div><Label>{t('auth.name')}</Label><Input value={user.name} disabled /></div>
            <div><Label>{t('auth.email')}</Label><Input value={user.email} disabled /></div>
            <div><Label>Display name</Label><Input value={form.displayName} onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))} /></div>
            <div><Label>Bio</Label><Textarea rows={3} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} /></div>
            <div><Label>{t('profile.education')}</Label><Textarea rows={3} value={form.education} onChange={e => setForm(f => ({ ...f, education: e.target.value }))} placeholder="BSc Computer Science, Demo University, 2024 (demo)" /></div>
            <div><Label>{t('profile.experience')}</Label><Textarea rows={3} value={form.experience} onChange={e => setForm(f => ({ ...f, experience: e.target.value }))} /></div>
            <div><Label>{t('profile.awards')}</Label><Textarea rows={2} value={form.awards} onChange={e => setForm(f => ({ ...f, awards: e.target.value }))} /></div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="academic">
          <Card><CardContent className="p-4 space-y-3">
            <div><Label>{t('researchers.institution')}</Label><Input value={form.institution} onChange={e => setForm(f => ({ ...f, institution: e.target.value }))} /></div>
            <div><Label>{t('researchers.department')}</Label><Input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} /></div>
            <div><Label>{t('researchers.position')}</Label><Input value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} placeholder="Assistant Professor / PhD candidate / etc." /></div>
            <div><Label>{t('researchers.location')}</Label><Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} /></div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="research">
          <Card><CardContent className="p-4 space-y-3">
            <div><Label>{t('researchers.interests')}</Label><Textarea rows={3} value={form.researchInterests} onChange={e => setForm(f => ({ ...f, researchInterests: e.target.value }))} placeholder="NLP, Computer Vision, Climate modeling (comma-separated)" /></div>
            <div><Label>{t('researchers.skills')}</Label><Textarea rows={3} value={form.technicalSkills} onChange={e => setForm(f => ({ ...f, technicalSkills: e.target.value }))} placeholder="Python, PyTorch, R, LaTeX (comma-separated)" /></div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="external">
          <Card><CardContent className="p-4 space-y-3">
            <div><Label>ORCID</Label><Input value={form.orcid} onChange={e => setForm(f => ({ ...f, orcid: e.target.value }))} placeholder="0000-0000-0000-0000" /></div>
            <div><Label>Google Scholar</Label><Input value={form.scholarLink} onChange={e => setForm(f => ({ ...f, scholarLink: e.target.value }))} placeholder="https://scholar.google.com/…" /></div>
            <div><Label>GitHub</Label><Input value={form.githubLink} onChange={e => setForm(f => ({ ...f, githubLink: e.target.value }))} placeholder="https://github.com/…" /></div>
            <div><Label>LinkedIn</Label><Input value={form.linkedinLink} onChange={e => setForm(f => ({ ...f, linkedinLink: e.target.value }))} placeholder="https://linkedin.com/in/…" /></div>
            <div><Label>Website</Label><Input value={form.websiteLink} onChange={e => setForm(f => ({ ...f, websiteLink: e.target.value }))} placeholder="https://…" /></div>
            <p className="text-xs text-muted-foreground mt-2">External links are displayed on your public profile only if it is public.</p>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="publications">
          <PublicationsTab userId={user.id} />
        </TabsContent>

        <TabsContent value="contact">
          <Card><CardContent className="p-4 space-y-3">
            <div><Label>{t('contact.yourEmail')} (public)</Label><Input value={form.contactEmail} onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))} placeholder="If different from your account email and you want it visible publicly" /></div>
            <div><Label>Phone</Label><Input value={form.contactPhone} onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))} placeholder="Only visible if profile is public" /></div>
            <p className="text-xs text-muted-foreground">Account email and password are managed separately. Contact details are private unless you mark your profile public.</p>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card><CardContent className="p-4 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="font-medium text-sm flex items-center gap-2">
                  {form.isPublic ? <Globe className="h-4 w-4 text-emerald-600" /> : <Lock className="h-4 w-4 text-muted-foreground" />}
                  {t('profile.isPublic')}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{t('profile.isPublicDesc')}</p>
              </div>
              <Switch checked={form.isPublic} onCheckedChange={v => setForm(f => ({ ...f, isPublic: v }))} />
            </div>
            <div className="pt-4 border-t border-border">
              <Label>{t('common.language')}</Label>
              <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm mt-1" value={form.locale} onChange={e => setForm(f => ({ ...f, locale: e.target.value }))}>
                <option value="en">English</option>
                <option value="bn">বাংলা</option>
              </select>
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationsPreferencesTab />
        </TabsContent>

        <TabsContent value="security">
          <ChangePasswordTab />
        </TabsContent>
      </Tabs>

      <div className="mt-4">
        <Button onClick={save} disabled={saving}><Save className="mr-2 h-4 w-4" /> {saving ? t('common.loading') : t('profile.saveProfile')}</Button>
      </div>
    </div>
  )
}

function PublicationsTab({ userId }: { userId: string }) {
  const { t, locale } = useI18n()
  const [publications, setPublications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [doi, setDoi] = useState('')
  const [lookup, setLookup] = useState<any>(null)
  const [looking, setLooking] = useState(false)
  const [claimAuthorship, setClaimAuthorship] = useState(true)

  const load = () => {
    fetch(`/api/publications?userId=${userId}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(d => setPublications(d.items ?? []))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [userId])

  const lookupDoi = async () => {
    if (!doi.trim()) return
    setLooking(true)
    setLookup(null)
    try {
      const res = await fetch(`/api/publications/doi-lookup?doi=${encodeURIComponent(doi)}`, { cache: 'no-store' })
      const d = await res.json()
      setLookup(d)
    } finally { setLooking(false) }
  }

  const savePub = async () => {
    if (!lookup?.metadata) return
    const res = await fetch('/api/publications/doi-lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metadata: lookup.metadata, claimAuthorship }),
    })
    if (res.ok) {
      toast.success('Publication saved')
      setLookup(null)
      setDoi('')
      load()
    } else {
      const d = await res.json()
      toast.error(d.error ?? 'Failed')
    }
  }

  return (
    <Card><CardContent className="p-4 space-y-4">
      {/* DOI lookup */}
      <div>
        <Label className="text-sm font-semibold flex items-center gap-1.5"><SearchIcon className="h-4 w-4 text-primary" /> Import a publication by DOI</Label>
        <p className="text-xs text-muted-foreground mt-1 mb-2">
          Looks up metadata via Crossref or OpenAlex. Always review the retrieved details before saving. Authorship claims require moderation review.
        </p>
        <div className="flex gap-2">
          <Input placeholder="10.xxxx/xxxxx or https://doi.org/..." value={doi} onChange={e => setDoi(e.target.value)} onKeyDown={e => e.key === 'Enter' && lookupDoi()} />
          <Button onClick={lookupDoi} disabled={looking || !doi.trim()}>{looking ? t('common.loading') : 'Look up'}</Button>
        </div>
      </div>

      {lookup?.error && (
        <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <div>
              <div className="font-medium">{lookup.error}</div>
              {lookup.detail && <div className="mt-0.5">{lookup.detail}</div>}
            </div>
          </div>
        </div>
      )}

      {lookup?.metadata && (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px]">{lookup.metadata.source}</Badge>
              <Badge variant="outline" className="text-[10px]">imported</Badge>
            </div>
            <span className="text-xs text-muted-foreground">Retrieved {new Date(lookup.metadata.retrievedAt).toLocaleDateString()}</span>
          </div>
          <div className="font-medium text-sm">{lookup.metadata.title}</div>
          {(() => {
            let authors: string[] = []
            try { authors = JSON.parse(lookup.metadata.authorsList || '[]') } catch {}
            return authors.length > 0 ? <div className="text-xs text-muted-foreground mt-0.5">{authors.join(', ')}</div> : null
          })()}
          {(lookup.metadata.venue || lookup.metadata.year) && (
            <div className="text-xs text-muted-foreground mt-0.5">{lookup.metadata.venue}{lookup.metadata.year ? ` · ${lookup.metadata.year}` : ''}</div>
          )}
          {lookup.metadata.doi && (
            <a href={`https://doi.org/${lookup.metadata.doi}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary mt-1 hover:underline">
              <Link2 className="h-3 w-3" /> {lookup.metadata.doi}
            </a>
          )}
          {lookup.existing && (
            <div className="text-xs text-amber-700 dark:text-amber-300 mt-2">⚠ This DOI already exists in your records.</div>
          )}
          <div className="mt-3 flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs">
              <input type="checkbox" checked={claimAuthorship} onChange={e => setClaimAuthorship(e.target.checked)} />
              Claim authorship (creates a pending claim for review)
            </label>
            <Button size="sm" onClick={savePub}><Check className="mr-1 h-3 w-3" /> Save publication</Button>
          </div>
        </div>
      )}

      {/* Existing publications */}
      <div className="pt-3 border-t border-border">
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5"><FileText className="h-4 w-4 text-primary" /> Your publications ({publications.length})</h3>
        {loading ? <p className="text-sm text-muted-foreground">{t('common.loading')}</p> :
          publications.length === 0 ? (
            <p className="text-xs text-muted-foreground">No publications yet. Import one by DOI above, or ask an admin to verify your claims.</p>
          ) : (
            <div className="space-y-2">
              {publications.map(p => (
                <div key={p.id} className="p-2 rounded border border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-[10px]">{p.type}</Badge>
                    <VerificationBadge status={p.verification} />
                    <Badge variant="outline" className="text-[10px]">{p.source}</Badge>
                  </div>
                  <div className="font-medium text-sm">{p.title}</div>
                  {(() => {
                    let authors: string[] = []
                    try { authors = JSON.parse(p.authorsList || '[]') } catch {}
                    return authors.length > 0 ? <div className="text-xs text-muted-foreground mt-0.5">{authors.join(', ')}</div> : null
                  })()}
                  {(p.venue || p.year) && <div className="text-xs text-muted-foreground mt-0.5">{p.venue}{p.year ? ` · ${p.year}` : ''}</div>}
                  {p.doi && <a href={`https://doi.org/${p.doi}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary mt-0.5 hover:underline"><Link2 className="h-3 w-3" /> {p.doi}</a>}
                </div>
              ))}
            </div>
          )
        }
      </div>
    </CardContent></Card>
  )
}

function NotificationsPreferencesTab() {
  const { t } = useI18n()
  const [enabledTypes, setEnabledTypes] = useState<string[]>([])
  const [emailEnabled, setEmailEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const typeLabels: Record<string, string> = {
    'deadline': 'Deadline reminders',
    'collaboration': 'Collaboration requests',
    'project': 'Project invitations & task assignments',
    'submission': 'Submission decisions (approve/reject)',
    'verification': 'Verification updates',
    'learning': 'Learning activity reminders',
    'opportunity-match': 'New opportunities matching your interests',
  }
  const typeDescriptions: Record<string, string> = {
    'deadline': 'Get notified when an opportunity, event, or conference deadline is approaching.',
    'collaboration': 'When someone requests collaboration on your post, or accepts/rejects your request.',
    'project': 'When you are invited to a project or assigned a task.',
    'submission': 'When your submitted opportunity, dataset, journal, or event is approved or rejected.',
    'verification': 'When your profile, publication, or affiliation verification status changes.',
    'learning': 'Reminders about your learning path progress and new lessons.',
    'opportunity-match': 'Personalized alerts when new opportunities match your research interests.',
  }

  const load = async () => {
    try {
      const res = await fetch('/api/notifications/preferences', { cache: 'no-store' })
      const d = await res.json()
      setEnabledTypes(d.types ?? [])
      setEmailEnabled(d.email ?? false)
    } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const toggleType = (type: string) => {
    setEnabledTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type])
  }

  const save = async () => {
    setSaving(true)
    try {
      await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ types: enabledTypes, email: emailEnabled }),
      })
      toast.success('Notification preferences saved')
    } finally { setSaving(false) }
  }

  if (loading) return <p className="text-sm text-muted-foreground">{t('common.loading')}</p>

  return (
    <Card><CardContent className="p-4 space-y-4">
      <div>
        <h3 className="text-sm font-semibold mb-1">In-app notifications</h3>
        <p className="text-xs text-muted-foreground mb-3">Choose which types of notifications you want to receive in the platform.</p>
        <div className="space-y-2">
          {Object.entries(typeLabels).map(([type, label]) => (
            <label key={type} className="flex items-start gap-3 p-2 rounded border border-border cursor-pointer hover:bg-accent">
              <input
                type="checkbox"
                checked={enabledTypes.includes(type)}
                onChange={() => toggleType(type)}
                className="mt-0.5"
              />
              <div className="flex-1">
                <div className="text-sm font-medium">{label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{typeDescriptions[type]}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-border">
        <h3 className="text-sm font-semibold mb-1">Email notifications</h3>
        <p className="text-xs text-muted-foreground mb-3">Receive a copy of in-app notifications by email. Requires an email provider to be configured by the platform admin.</p>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={emailEnabled}
            onChange={e => setEmailEnabled(e.target.checked)}
          />
          <span className="text-sm">Send notifications to my email address</span>
        </label>
        <p className="text-xs text-amber-700 dark:text-amber-300 mt-2 flex items-start gap-1">
          <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
          Email sending is not yet configured on this platform. Your preference will be saved and applied once email is enabled.
        </p>
      </div>

      <div className="pt-3 border-t border-border">
        <Button onClick={save} disabled={saving}><Save className="mr-2 h-3 w-3" /> {saving ? t('common.loading') : 'Save preferences'}</Button>
      </div>
    </CardContent></Card>
  )
}

function AvatarUploader({ currentAvatarUrl, name, onUploaded }: {
  currentAvatarUrl?: string
  name: string
  onUploaded: (url: string) => void
}) {
  const { t } = useI18n()
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | undefined>(currentAvatarUrl)

  const handleFile = async (file: File) => {
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File too large. Maximum 2 MB.')
      return
    }
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      toast.error('Invalid file type. Use JPG, PNG, WebP, or GIF.')
      return
    }
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      const res = await fetch('/api/profile/avatar', { method: 'POST', body: formData })
      const d = await res.json()
      if (!res.ok) {
        toast.error(d.error ?? 'Upload failed')
        return
      }
      setPreview(d.avatarUrl + '?v=' + Date.now())
      onUploaded(d.avatarUrl)
    } finally {
      setUploading(false)
    }
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-16 w-16 border border-border">
        {preview && <AvatarImage src={preview} alt={name} />}
        <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">{name?.charAt(0)?.toUpperCase() ?? 'U'}</AvatarFallback>
      </Avatar>
      <div>
        <Label className="text-sm font-medium">Profile photo</Label>
        <p className="text-xs text-muted-foreground mt-0.5 mb-2">JPG, PNG, WebP, or GIF. Maximum 2 MB.</p>
        <label className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-xs font-medium cursor-pointer hover:bg-primary/90">
          <Camera className="h-3.5 w-3.5" />
          {uploading ? t('common.loading') : 'Upload photo'}
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={onChange} className="hidden" disabled={uploading} />
        </label>
      </div>
    </div>
  )
}


function ChangePasswordTab() {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (next.length < 8) { toast.error('New password must be at least 8 characters'); return }
    if (next !== confirm) { toast.error('The new passwords do not match'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/auth/password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword: current, newPassword: next }) })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(d.error || 'Could not change password')
      toast.success('Password changed')
      setCurrent(''); setNext(''); setConfirm('')
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setSaving(false)
    }
  }
  return (
    <Card><CardContent className="p-4">
      <form onSubmit={submit} className="space-y-3 max-w-sm">
        <div><Label htmlFor="pw-current">Current password</Label><Input id="pw-current" type="password" autoComplete="current-password" value={current} onChange={e => setCurrent(e.target.value)} required /></div>
        <div><Label htmlFor="pw-new">New password</Label><Input id="pw-new" type="password" autoComplete="new-password" value={next} onChange={e => setNext(e.target.value)} required minLength={8} /></div>
        <div><Label htmlFor="pw-confirm">Confirm new password</Label><Input id="pw-confirm" type="password" autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} required /></div>
        <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Change password'}</Button>
      </form>
    </CardContent></Card>
  )
}
