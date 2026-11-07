"use client"

import { useI18n } from '@/lib/i18n'
import { useNavigate } from '@/lib/router'
import { PageHeader, DemoBanner, VerificationBadge } from '@/components/shared/ui-helpers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  ShieldCheck, AlertTriangle, BookOpen, FileText, Lightbulb, Users,
  Send, ScrollText, Award, FolderKanban, ListChecks, Users2, Bookmark,
} from 'lucide-react'

export function StaticPage({ which }: { which: 'about' | 'contact' | 'integrity' | 'privacy' | 'terms' | 'applications' | 'teams' | 'contributions' }) {
  const { t, tList } = useI18n()
  const navigate = useNavigate()
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sending, setSending] = useState(false)

  if (which === 'about') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <PageHeader title={t('about.title')} subtitle={t('brand.tagline')} />
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Lightbulb className="h-5 w-5 text-primary" /> {t('about.mission')}</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">{t('about.missionText')}</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> {t('about.vision')}</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">{t('about.visionText')}</p></CardContent>
          </Card>
        </div>
        <Card className="mt-6">
          <CardHeader><CardTitle>{t('about.objectives')}</CardTitle></CardHeader>
          <CardContent>
            <ol className="list-decimal pl-5 space-y-2 text-sm">
              {tList('about.objectivesList').map((o, i) => <li key={i}>{o}</li>)}
            </ol>
          </CardContent>
        </Card>
        <div className="mt-6"><DemoBanner /></div>
      </div>
    )
  }

  if (which === 'contact') {
    const submit = async (e: React.FormEvent) => {
      e.preventDefault()
      setSending(true)
      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(contactForm),
        })
        if (!res.ok) {
          const d = await res.json()
          toast.error(d.error ?? 'Failed to send')
          return
        }
        toast.success(t('contact.sent'))
        setContactForm({ name: '', email: '', subject: '', message: '' })
      } finally { setSending(false) }
    }
    return (
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <PageHeader title={t('contact.title')} subtitle={t('contact.subtitle')} />
        <Card>
          <CardContent className="p-6">
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">{t('contact.yourName')}</Label>
                <Input id="name" required value={contactForm.name} onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">{t('contact.yourEmail')}</Label>
                <Input id="email" type="email" required value={contactForm.email} onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="subject">{t('contact.subject')}</Label>
                <Input id="subject" required value={contactForm.subject} onChange={e => setContactForm(f => ({ ...f, subject: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="message">{t('contact.message')}</Label>
                <Textarea id="message" required rows={5} value={contactForm.message} onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))} />
              </div>
              <Button type="submit" className="w-full" disabled={sending}>
                <Send className="mr-2 h-4 w-4" /> {sending ? t('common.loading') : t('contact.send')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (which === 'integrity') {
    const educationItems = [
      { key: 'predatory', icon: AlertTriangle, desc: 'Recognize the warning signs of predatory publishers and avoid them.' },
      { key: 'plagiarism', icon: FileText, desc: 'Understand plagiarism, paraphrasing, and proper attribution.' },
      { key: 'authorship', icon: Users, desc: 'Determine authorship order and contributor roles.' },
      { key: 'misconduct', icon: AlertTriangle, desc: 'Identify and report research misconduct: fabrication, falsification, plagiarism.' },
      { key: 'ethics', icon: ShieldCheck, desc: 'Apply ethical principles throughout the research lifecycle.' },
      { key: 'data', icon: BookOpen, desc: 'Maintain data integrity and reproducibility.' },
      { key: 'peerReview', icon: Users, desc: 'Conduct fair, constructive peer review.' },
      { key: 'retractions', icon: AlertTriangle, desc: 'Understand retractions, corrections, and editorial expressions of concern.' },
      { key: 'ai', icon: Lightbulb, desc: 'Use AI tools responsibly in research and writing.' },
    ]
    const verificationRows = [
      { entity: 'Researcher', states: ['self-reported', 'email verified', 'affiliation verified'] },
      { entity: 'Publication', states: ['claimed', 'imported', 'authorship confirmed'] },
      { entity: 'Dataset', states: ['submitted', 'reviewed', 'verified'] },
      { entity: 'Opportunity', states: ['submitted', 'source checked', 'expired'] },
      { entity: 'Journal', states: ['listed', 'information checked', 'under review'] },
      { entity: 'Conference', states: ['listed', 'information checked', 'under review'] },
      { entity: 'Institution', states: ['submitted', 'official source confirmed'] },
      { entity: 'Laboratory', states: ['submitted', 'institution confirmed'] },
    ]
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <PageHeader title={t('integrity.title')} subtitle={t('integrity.subtitle')} />
        <Card className="mb-6">
          <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> {t('integrity.verificationTitle')}</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {verificationRows.map(r => (
                <div key={r.entity} className="flex flex-col sm:flex-row sm:items-center gap-2 pb-3 border-b border-border last:border-0">
                  <div className="font-medium text-sm w-32 shrink-0">{r.entity}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {r.states.map(s => <VerificationBadge key={s} status={s} />)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="mb-6">
          <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> {t('integrity.moderationTitle')}</CardTitle></CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>Submission review and content approval</li>
              <li>Rejection with documented reasons</li>
              <li>User reports and correction requests</li>
              <li>Appeals process and moderator notes</li>
              <li>Verification history and audit logs</li>
              <li>Expired content handling</li>
            </ul>
          </CardContent>
        </Card>
        <Card className="mb-6">
          <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /> {t('integrity.educationTitle')}</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {educationItems.map(item => {
                const Icon = item.icon
                return (
                  <button key={item.key} onClick={() => navigate(`learn?cat=ethics`)} className="flex items-start gap-3 p-3 rounded-md border border-border hover:bg-accent text-left">
                    <Icon className="mt-0.5 h-4 w-4 text-primary shrink-0" />
                    <div>
                      <div className="text-sm font-medium">{t(`integrity.education.${item.key}`)}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{item.desc}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
        <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-900 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{t('integrity.disclaimer')}</span>
        </div>
      </div>
    )
  }

  if (which === 'privacy' || which === 'terms') {
    const title = which === 'privacy' ? t('nav.privacy') : t('nav.terms')
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl prose prose-sm dark:prose-invert">
        <PageHeader title={title} />
        {which === 'privacy' ? (
          <div className="space-y-4 text-sm text-muted-foreground">
            <p><strong className="text-foreground">1. Information we collect.</strong> We collect account information (name, email, role), profile information you provide (institution, research interests, etc.), and platform activity (bookmarks, projects, questions, submissions).</p>
            <p><strong className="text-foreground">2. How we use information.</strong> To provide research discovery, networking, learning, and collaboration features; to verify researchers and institutions; to moderate content; and to improve the platform.</p>
            <p><strong className="text-foreground">3. Public vs. private information.</strong> You control whether your profile is public. Private contact details are never exposed to other users. Private projects are accessible only to members.</p>
            <p><strong className="text-foreground">4. Data retention and deletion.</strong> You can download your profile data from your profile page. To delete your account, contact us through the Contact page and we will remove your account and personal data.</p>
            <p><strong className="text-foreground">5. Cookies and sessions.</strong> We use HTTP-only cookies for authentication. No third-party tracking cookies.</p>
            <p><strong className="text-foreground">6. Security.</strong> Passwords are hashed with bcrypt, sessions use signed HTTP-only cookies, and access to private data is checked on the server for every request.</p>
            <p><strong className="text-foreground">7. Third-party integrations.</strong> When you import a publication by DOI, the DOI is sent to Crossref or OpenAlex to fetch its metadata. No other personal data is shared with them. The site is hosted on Vercel.</p>
            <p><strong className="text-foreground">8. Children.</strong> The platform is intended for users aged 16 and above.</p>
            <p className="text-xs">Last updated 7 November 2026. Questions? Use the Contact page.</p>
          </div>
        ) : (
          <div className="space-y-4 text-sm text-muted-foreground">
            <p><strong className="text-foreground">1. Acceptance.</strong> By using Researcher BD, you agree to these terms.</p>
            <p><strong className="text-foreground">2. Eligibility.</strong> You must be 16 or older and provide accurate information.</p>
            <p><strong className="text-foreground">3. User conduct.</strong> Do not post false information, harassment, plagiarism, or content you do not have rights to. Do not attempt to escalate privileges or access private data.</p>
            <p><strong className="text-foreground">4. Verification.</strong> Verification statuses reflect the level of checking performed. They are not endorsements. We never assert indexing claims without a verifiable source.</p>
            <p><strong className="text-foreground">5. Submissions and moderation.</strong> All submissions are subject to review. We may reject, edit, or remove content. Contact us if you think a decision was wrong.</p>
            <p><strong className="text-foreground">6. Intellectual property.</strong> You retain rights to your content. You grant us a license to display it on the platform.</p>
            <p><strong className="text-foreground">7. External links.</strong> We link to external sites. We are not responsible for their content or practices.</p>
            <p><strong className="text-foreground">8. Limitation of liability.</strong> The platform is provided &ldquo;as is&rdquo;. We are not liable for damages arising from use.</p>
            <p><strong className="text-foreground">9. Termination.</strong> We may suspend or terminate accounts that violate these terms.</p>
            <p className="text-xs">Last updated 7 November 2026. Questions? Use the Contact page.</p>
          </div>
        )}
      </div>
    )
  }

  // Stub pages for applications, teams, contributions — redirect to dashboard sections
  const titles: Record<string, string> = {
    applications: t('nav.applications'),
    teams: t('nav.teams'),
    contributions: t('nav.contributions'),
  }
  const icons: Record<string, any> = { applications: Send, teams: Users2, contributions: Award }
  const Icon = icons[which]
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <PageHeader title={titles[which]} subtitle="This section is part of your research workspace." />
      <Card>
        <CardContent className="p-6 text-center">
          <Icon className="h-10 w-10 mx-auto text-primary mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            This view is consolidated in your dashboard. View your projects, teams, tasks, and contributions there.
          </p>
          <Button onClick={() => navigate('dashboard')}>{t('nav.dashboard')}</Button>
        </CardContent>
      </Card>
    </div>
  )
}
