"use client"

import dynamic from 'next/dynamic'

// Load the AppShell client-side (avoids SSR issues with the hash router and localStorage)
const AppShell = dynamic(
  () => import('@/components/layout/app-shell').then(m => ({ default: m.AppShell })),
  { ssr: false, loading: () => (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary text-primary-foreground font-bold">R</div>
        <div>
          <div className="font-semibold text-lg">Researcher BD</div>
          <div className="text-xs text-muted-foreground">Bangladesh Research &amp; Innovation Network</div>
        </div>
      </div>
      <div className="text-sm text-muted-foreground">Loading platform…</div>
    </div>
  ) }
)

export default function Home() {
  return <AppShell />
}
