"use client"

import { ReactNode } from 'react'
import { Info } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-muted-foreground mt-1 max-w-2xl text-sm sm:text-base">{subtitle}</p>}
      </div>
      {action && <div className="flex flex-wrap gap-2 shrink-0">{action}</div>}
    </div>
  )
}

export function DemoBanner() {
  return (
    <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-900 dark:text-amber-200">
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>
        Records shown are <strong>fictional demonstration data</strong> clearly marked. They are
        placeholders to show the platform&rsquo;s features and are not real opportunities, journals,
        datasets, or people.
      </span>
    </div>
  )
}

const verificationColors: Record<string, string> = {
  verified: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30',
  'official-source-confirmed': 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30',
  'authorship-confirmed': 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30',
  approved: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30',
  imported: 'bg-sky-500/15 text-sky-700 border-sky-500/30',
  'information-checked': 'bg-sky-500/15 text-sky-700 border-sky-500/30',
  'source-checked': 'bg-sky-500/15 text-sky-700 border-sky-500/30',
  listed: 'bg-muted text-muted-foreground border-border',
  submitted: 'bg-amber-500/15 text-amber-700 border-amber-500/30',
  pending: 'bg-amber-500/15 text-amber-700 border-amber-500/30',
  claimed: 'bg-amber-500/15 text-amber-700 border-amber-500/30',
  'self-reported': 'bg-amber-500/15 text-amber-700 border-amber-500/30',
  'under-review': 'bg-orange-500/15 text-orange-700 border-orange-500/30',
  rejected: 'bg-red-500/15 text-red-700 border-red-500/30',
  disputed: 'bg-red-500/15 text-red-700 border-red-500/30',
  expired: 'bg-zinc-500/15 text-zinc-700 border-zinc-500/30',
}

export function VerificationBadge({ status }: { status: string }) {
  const cls = verificationColors[status] ?? 'bg-muted text-muted-foreground border-border'
  return (
    <Badge variant="outline" className={`text-[10px] font-medium ${cls}`}>
      {status.replace(/-/g, ' ')}
    </Badge>
  )
}

export function EmptyState({ title, message, icon: Icon }: { title: string; message?: string; icon?: any }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && <Icon className="h-10 w-10 text-muted-foreground/50 mb-3" />}
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      {message && <p className="text-xs text-muted-foreground mt-1 max-w-md">{message}</p>}
    </div>
  )
}

export function formatDate(d: string | Date | null | undefined, locale: string = 'en') {
  if (!d) return '—'
  const date = typeof d === 'string' ? new Date(d) : d
  if (isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}
