"use client"

// Layout wrappers kept for API compatibility. The design uses a single page-load reveal
// (the hero, via .animate-fade-in-up) instead of scroll-triggered effects on every section,
// so these render plain elements.
import type { ReactNode } from 'react'

type Wrap = { children: ReactNode; className?: string; delay?: number; duration?: number; onClick?: () => void }

export function FadeInUp({ children, className = '' }: Wrap) {
  return <div className={className}>{children}</div>
}

export function StaggerContainer({ children, className = '' }: Wrap) {
  return <div className={className}>{children}</div>
}

export function StaggerItem({ children, className = '' }: Wrap) {
  return <div className={className}>{children}</div>
}

export function AnimatedCard({ children, className = '', onClick }: Wrap) {
  return <div className={className} onClick={onClick}>{children}</div>
}

export function Floating({ children, className = '' }: Wrap) {
  return <div className={className}>{children}</div>
}

export function ScaleIn({ children, className = '' }: Wrap) {
  return <div className={className}>{children}</div>
}

export function CountUp({ value, className = '' }: { value: number; duration?: number; className?: string }) {
  return <span className={className}>{Number.isFinite(value) ? value.toLocaleString() : 0}</span>
}
