"use client"

import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { dictionaries } from '@/lib/dictionaries'
import { useNavigate } from '@/lib/router'
import { useSession } from '@/lib/session-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PageHeader, DemoBanner, formatDate } from '@/components/shared/ui-helpers'
import { FadeInUp, StaggerContainer, StaggerItem, CountUp, Floating, ScaleIn } from '@/components/shared/motion'
import {
  Compass, FlaskConical, BookOpen, Database, Users, GraduationCap,
  FolderKanban, Languages, ShieldCheck, ArrowRight, Sparkles, Award,
  CalendarDays, Microscope, Landmark, Lightbulb, MessageSquare, Send,
  FileText, PenLine, Search, Bookmark, Bell, Zap, Globe2, Network,
} from 'lucide-react'

export function HomePage() {
  const { t, locale } = useI18n()
  const [query, setQuery] = useState('')
  const otherHeroTitle = (dictionaries as any)[locale === 'en' ? 'bn' : 'en']?.home?.heroTitle ?? ''
  const navigate = useNavigate()
  const { user } = useSession()
  const [stats, setStats] = useState({ opportunities: 0, researchers: 0, journals: 0, datasets: 0 })
  const [recentOpps, setRecentOpps] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/seed?stats=1', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => {})
    fetch('/api/opportunities?limit=5&sort=deadline', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => setRecentOpps(d.items ?? []))
      .catch(() => {})
  }, [])

  const closingSoon = [...recentOpps]
    .filter(o => !o.deadline || new Date(o.deadline).getTime() > Date.now() - 86400000)
    .sort((a, b) => (a.deadline ? new Date(a.deadline).getTime() : Infinity) - (b.deadline ? new Date(b.deadline).getTime() : Infinity))
    .slice(0, 5)

  const features = [
    { icon: FlaskConical, title: t('home.f1Title'), desc: t('home.f1Desc'), path: 'opportunities', color: 'from-emerald-500/20 to-teal-500/10' },
    { icon: BookOpen, title: t('home.f2Title'), desc: t('home.f2Desc'), path: 'journals', color: 'from-amber-500/20 to-orange-500/10' },
    { icon: Database, title: t('home.f3Title'), desc: t('home.f3Desc'), path: 'datasets', color: 'from-teal-500/20 to-cyan-500/10' },
    { icon: Users, title: t('home.f4Title'), desc: t('home.f4Desc'), path: 'researchers', color: 'from-violet-500/20 to-purple-500/10' },
    { icon: GraduationCap, title: t('home.f5Title'), desc: t('home.f5Desc'), path: 'learn', color: 'from-emerald-500/20 to-green-500/10' },
    { icon: FolderKanban, title: t('home.f6Title'), desc: t('home.f6Desc'), path: 'projects', color: 'from-amber-500/20 to-yellow-500/10' },
    { icon: Languages, title: t('home.f7Title'), desc: t('home.f7Desc'), path: 'about', color: 'from-teal-500/20 to-emerald-500/10' },
    { icon: ShieldCheck, title: t('home.f8Title'), desc: t('home.f8Desc'), path: 'integrity', color: 'from-rose-500/20 to-red-500/10' },
  ]

  const steps = [
    { title: t('home.step1Title'), desc: t('home.step1Desc'), icon: Search },
    { title: t('home.step2Title'), desc: t('home.step2Desc'), icon: GraduationCap },
    { title: t('home.step3Title'), desc: t('home.step3Desc'), icon: Users },
    { title: t('home.step4Title'), desc: t('home.step4Desc'), icon: FolderKanban },
    { title: t('home.step5Title'), desc: t('home.step5Desc'), icon: FileText },
    { title: t('home.step6Title'), desc: t('home.step6Desc'), icon: Sparkles },
  ]

  const exploreTiles = [
    { icon: FlaskConical, label: t('nav.opportunities'), path: 'opportunities' },
    { icon: Award, label: t('nav.funding'), path: 'funding' },
    { icon: BookOpen, label: t('nav.journals'), path: 'journals' },
    { icon: Users, label: t('nav.conferences'), path: 'conferences' },
    { icon: Database, label: t('nav.datasets'), path: 'datasets' },
    { icon: CalendarDays, label: t('nav.events'), path: 'events' },
    { icon: Users, label: t('nav.researchers'), path: 'researchers' },
    { icon: GraduationCap, label: t('nav.mentors'), path: 'mentors' },
    { icon: Microscope, label: t('nav.laboratories'), path: 'laboratories' },
    { icon: Landmark, label: t('nav.organizations'), path: 'organizations' },
    { icon: Lightbulb, label: t('nav.collaboration'), path: 'collaboration' },
    { icon: GraduationCap, label: t('nav.learn'), path: 'learn' },
    { icon: MessageSquare, label: t('nav.community'), path: 'community' },
    { icon: FolderKanban, label: t('nav.projects'), path: 'projects' },
    { icon: Send, label: t('nav.contact'), path: 'contact' },
    { icon: ShieldCheck, label: t('nav.integrity'), path: 'integrity' },
  ]

  return (
    <div className="relative">
      {/* Hero: bilingual lockup + live "closing soon" list */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-12 sm:py-16 lg:py-20 grid gap-10 lg:grid-cols-[1.35fr_1fr] lg:gap-14 items-start">
          <div className="animate-fade-in-up">
            <p className="text-sm font-medium text-primary">{t('brand.positioning')}</p>
            <h1 className="mt-4 text-4xl sm:text-5xl lg:text-[3.6rem] leading-[1.05] text-foreground max-w-[18ch]">
              {t('home.heroTitle')}
            </h1>
            <p lang={locale === 'en' ? 'bn' : 'en'} className="font-display mt-3 text-2xl sm:text-3xl text-shapla/90 leading-snug">
              {otherHeroTitle}
            </p>
            <div className="stitch-divider mt-7 w-40" aria-hidden="true" />
            <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-[60ch] leading-relaxed">
              {t('home.heroSubtitle')}
            </p>

            <form
              className="mt-8 flex max-w-xl gap-2"
              onSubmit={(e) => { e.preventDefault(); const q = query.trim(); navigate(q ? `search?q=${encodeURIComponent(q)}` : 'discover') }}
              role="search"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={locale === 'bn' ? 'সুযোগ, জার্নাল, ডেটাসেট, গবেষক খুঁজুন' : 'Search opportunities, journals, datasets, people'}
                  aria-label={t('common.search')}
                  className="h-12 w-full rounded-lg border border-input bg-card pl-10 pr-3 text-sm outline-none focus:border-primary"
                />
              </div>
              <Button type="submit" size="lg" className="h-12">{t('common.search')}</Button>
            </form>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              {!user ? (
                <button onClick={() => navigate('register')} className="font-medium text-primary hover:underline">{t('home.ctaRegister')}</button>
              ) : (
                <button onClick={() => navigate('dashboard')} className="font-medium text-primary hover:underline">{t('nav.dashboard')}</button>
              )}
              <button onClick={() => navigate('discover')} className="text-muted-foreground hover:text-foreground">{t('home.ctaExplore')}</button>
            </div>

            <dl className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-y-4 max-w-xl">
              {[
                { label: t('home.statOpportunities'), value: stats.opportunities },
                { label: t('home.statResearchers'), value: stats.researchers },
                { label: t('home.statJournals'), value: stats.journals },
                { label: t('home.statDatasets'), value: stats.datasets },
              ].map(s => (
                <div key={s.label} className="border-l-2 border-primary/30 pl-3">
                  <dt className="text-xs text-muted-foreground">{s.label}</dt>
                  <dd className="font-display text-2xl text-foreground tabular-nums"><CountUp value={s.value} /></dd>
                </div>
              ))}
            </dl>
          </div>

          <aside aria-labelledby="closing-soon" className="rounded-xl border border-border bg-card">
            <div className="flex items-baseline justify-between px-5 pt-5 pb-3">
              <h2 id="closing-soon" className="text-xl">{locale === 'bn' ? 'শীঘ্রই শেষ হচ্ছে' : 'Closing soon'}</h2>
              <button onClick={() => navigate('opportunities')} className="text-sm text-primary hover:underline">{t('common.view')}</button>
            </div>
            <ul className="divide-y divide-border">
              {closingSoon.length === 0 && (
                <li className="px-5 py-6 text-sm text-muted-foreground">{locale === 'bn' ? 'এখনো কোনো খোলা সুযোগ নেই।' : 'No open opportunities yet. Be the first to post one.'}</li>
              )}
              {closingSoon.map(o => {
                const days = o.deadline ? Math.ceil((new Date(o.deadline).getTime() - Date.now()) / 86400000) : null
                return (
                  <li key={o.id}>
                    <button onClick={() => navigate(`opportunities/${o.id}`)} className="w-full text-left px-5 py-4 hover:bg-muted/60 transition-colors grid grid-cols-[1fr_auto] gap-3">
                      <span>
                        <span className="block text-sm font-medium leading-snug line-clamp-2">{o.title}</span>
                        <span className="block text-xs text-muted-foreground mt-1">{[o.organization, o.location].filter(Boolean).join(', ')}</span>
                      </span>
                      {days !== null && (
                        <span className={`self-start text-xs font-medium rounded-md px-2 py-1 tabular-nums ${days <= 14 ? 'bg-accent text-accent-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                          {days <= 0 ? (locale === 'bn' ? 'আজ' : 'today') : locale === 'bn' ? `${days} দিন` : `${days} days`}
                        </span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
            <div className="px-5 py-4 border-t border-border">
              <DemoBanner />
            </div>
          </aside>
        </div>
      </section>

      {/* Explore tiles */}
      <section className="py-12 sm:py-16 container mx-auto px-4">
        <FadeInUp>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-center sm:text-left">{t('nav.discover')}</h2>
          <p className="text-sm text-muted-foreground mb-6 text-center sm:text-left">Jump straight to any section of the platform.</p>
        </FadeInUp>
        <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3">
          {exploreTiles.map(tile => (
            <StaggerItem key={tile.path + tile.label}>
              <button
                onClick={() => navigate(tile.path)}
                className="group flex flex-col items-center gap-2 rounded-xl border border-border/60 bg-card/50 p-3 sm:p-4 hover:bg-accent hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 text-center w-full card-hover"
              >
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <tile.icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium leading-tight">{tile.label}</span>
              </button>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* Features */}
      <section className="py-12 sm:py-20 relative mesh-bg">
        <div className="container mx-auto px-4">
          <FadeInUp>
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                {t('home.featuresTitle')}
              </h2>
              <p className="mt-3 text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">{t('home.featuresSubtitle')}</p>
            </div>
          </FadeInUp>
          <StaggerContainer className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-4">
            {features.map(f => (
              <StaggerItem key={f.title}>
                <Card
                  className="group cursor-pointer h-full card-hover overflow-hidden shadow-none"
                  onClick={() => navigate(f.path)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-secondary mb-2">
                      <f.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base group-hover:text-primary transition-colors">{f.title}</CardTitle>
                    <CardDescription className="text-sm">{f.desc}</CardDescription>
                  </CardHeader>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 sm:py-20 bg-muted/20 rounded-xl my-8 mx-4 sm:mx-auto sm:max-w-6xl">
        <FadeInUp>
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold">{t('home.howItWorksTitle')}</h2>
            <p className="mt-2 text-sm text-muted-foreground">From discovery to showcase — six steps</p>
          </div>
        </FadeInUp>
        <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 sm:gap-6 px-4">
          {steps.map((s, i) => (
            <StaggerItem key={s.title}>
              <div className="flex flex-col items-center text-center group">
                <div className="relative mb-3">
                                    <div className="relative flex items-center justify-center h-14 w-14 rounded-full border-2 border-primary/30 bg-card text-primary">
                    <s.icon className="h-6 w-6" />
                  </div>
                  <span className="absolute -top-1 -right-1 text-[10px] font-bold bg-background border border-border rounded-full h-5 w-5 flex items-center justify-center shadow-sm">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-sm font-semibold">{s.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{s.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* CTA bottom */}
      <FadeInUp>
        <section className="py-16 sm:py-24 text-center container mx-auto px-4">
          <div className="relative inline-block">
                        <div className="relative">
              <h2 className="text-3xl sm:text-4xl">{t('home.ctaBottomTitle')}</h2>
              <div className="stitch-divider mx-auto mt-5 w-24" aria-hidden="true" />
              <p className="mt-3 text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">{t('home.ctaBottomDesc')}</p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="lg" className="btn-glow bg-gradient-primary text-primary-foreground" onClick={() => navigate(user ? 'dashboard' : 'register')}>
                  {user ? t('nav.dashboard') : t('nav.register')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('discover')}>
                  {t('home.ctaExplore')}
                </Button>
              </div>
            </div>
          </div>
        </section>
      </FadeInUp>
    </div>
  )
}

function HomeLogo({ size = 80 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      role="img"
      aria-label="Researcher BD logo"
      className="shrink-0 drop-shadow-lg"
    >
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0b6e4f" />
          <stop offset="50%" stopColor="#0b6e4f" />
          <stop offset="100%" stopColor="#0b6e4f" />
        </linearGradient>
        <filter id="logoGlow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#logoGrad)" />
      {/* Network nodes with glow */}
      <g filter="url(#logoGlow)">
        <circle cx="32" cy="17" r="4.5" fill="#ffffff" />
        <line x1="32" y1="17" x2="22" y2="26" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="32" y1="17" x2="42" y2="26" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="32" y1="17" x2="32" y2="29" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" opacity="0.85" />
        <circle cx="22" cy="26" r="2.6" fill="#ffffff" />
        <circle cx="42" cy="26" r="2.6" fill="#ffffff" />
      </g>
      {/* Open book */}
      <path d="M32 34 L14 38 L14 49 L32 45 Z" fill="#ffffff" opacity="0.95" />
      <path d="M32 34 L50 38 L50 49 L32 45 Z" fill="#ffffff" opacity="0.8" />
      <line x1="32" y1="34" x2="32" y2="45" stroke="#0b6e4f" strokeWidth="1.4" />
      <line x1="19" y1="41" x2="28" y2="39.5" stroke="#0b6e4f" strokeWidth="0.9" strokeLinecap="round" opacity="0.5" />
      <line x1="19" y1="44" x2="28" y2="42.5" stroke="#0b6e4f" strokeWidth="0.9" strokeLinecap="round" opacity="0.5" />
      <line x1="36" y1="39.5" x2="45" y2="41" stroke="#0b6e4f" strokeWidth="0.9" strokeLinecap="round" opacity="0.5" />
      <line x1="36" y1="42.5" x2="45" y2="44" stroke="#0b6e4f" strokeWidth="0.9" strokeLinecap="round" opacity="0.5" />
    </svg>
  )
}
