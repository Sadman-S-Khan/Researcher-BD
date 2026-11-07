"use client"

import { useI18n } from '@/lib/i18n'
import { useNavigate } from '@/lib/router'
import { FlaskConical, BookOpen, Database, Users, GraduationCap, CalendarDays, Landmark, Microscope, ShieldCheck, MessageSquare, Lightbulb, Send } from 'lucide-react'

export function Footer() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const year = new Date().getFullYear()

  const sections: { title: string; links: { label: string; path: string }[] }[] = [
    {
      title: t('nav.discover'),
      links: [
        { label: t('nav.opportunities'), path: 'opportunities' },
        { label: t('nav.funding'), path: 'funding' },
        { label: t('nav.journals'), path: 'journals' },
        { label: t('nav.conferences'), path: 'conferences' },
        { label: t('nav.datasets'), path: 'datasets' },
        { label: t('nav.events'), path: 'events' },
      ],
    },
    {
      title: t('nav.people'),
      links: [
        { label: t('nav.researchers'), path: 'researchers' },
        { label: t('nav.mentors'), path: 'mentors' },
        { label: t('nav.laboratories'), path: 'laboratories' },
        { label: t('nav.organizations'), path: 'organizations' },
        { label: t('nav.collaboration'), path: 'collaboration' },
      ],
    },
    {
      title: t('nav.learn'),
      links: [
        { label: t('nav.fundamentals'), path: 'learn?cat=fundamentals' },
        { label: t('nav.literature'), path: 'learn?cat=literature' },
        { label: t('nav.dataAnalysis'), path: 'learn?cat=data-analysis' },
        { label: t('nav.tools'), path: 'learn?cat=tools' },
        { label: t('nav.writing'), path: 'learn?cat=writing' },
        { label: t('nav.ethics'), path: 'learn?cat=ethics' },
        { label: t('nav.learningPaths'), path: 'learn?tab=paths' },
      ],
    },
    {
      title: t('nav.community'),
      links: [
        { label: t('nav.questions'), path: 'community?tab=questions' },
        { label: t('nav.discussions'), path: 'community?tab=discussions' },
        { label: t('nav.support'), path: 'community?tab=support' },
        { label: t('nav.announcements'), path: 'community?tab=announcements' },
      ],
    },
    {
      title: t('footer.legal'),
      links: [
        { label: t('nav.about'), path: 'about' },
        { label: t('nav.integrity'), path: 'integrity' },
        { label: t('nav.privacy'), path: 'privacy' },
        { label: t('nav.terms'), path: 'terms' },
        { label: t('nav.contact'), path: 'contact' },
      ],
    },
  ]

  return (
    <footer className="mt-auto border-t border-border bg-muted/20 dot-grid relative overflow-hidden">
      <div className="absolute inset-0 mesh-bg opacity-50" />
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-6">
          {/* Brand block */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <FooterLogo />
              <span className="font-semibold">{t('brand.name')}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{t('brand.positioning')}</p>
            <p className="text-xs text-muted-foreground italic">{t('footer.tagline')}</p>
          </div>
          {sections.map(s => (
            <div key={s.title}>
              <h4 className="text-sm font-semibold mb-3">{s.title}</h4>
              <ul className="space-y-2">
                {s.links.map(l => (
                  <li key={l.path + l.label}>
                    <button
                      onClick={() => navigate(l.path)}
                      className="text-sm text-muted-foreground hover:text-foreground text-left"
                    >
                      {l.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">{t('footer.copyright', { year })}</p>
          <p className="text-xs text-muted-foreground">{t('footer.disclaimer')}</p>
        </div>
      </div>
    </footer>
  )
}

function FooterLogo({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      role="img"
      aria-label="Researcher BD"
      className="shrink-0"
    >
      <rect width="64" height="64" rx="14" fill="#0b6e4f" />
      <circle cx="32" cy="17" r="4.5" fill="#ffffff" />
      <line x1="32" y1="17" x2="22" y2="26" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="32" y1="17" x2="42" y2="26" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="32" y1="17" x2="32" y2="29" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" opacity="0.85" />
      <circle cx="22" cy="26" r="2.6" fill="#ffffff" />
      <circle cx="42" cy="26" r="2.6" fill="#ffffff" />
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
