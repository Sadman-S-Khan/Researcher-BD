"use client"

import { useEffect, useRef, useCallback } from 'react'
import { useSession } from '@/lib/session-context'
import { toast } from 'sonner'

const INACTIVITY_TIMEOUT = 30 * 60 * 1000  // 30 minutes
const WARNING_BEFORE = 2 * 60 * 1000       // warn 2 minutes before logout
const CHECK_INTERVAL = 60 * 1000           // check every minute
const STORAGE_KEY = 'rbd_last_activity'

const ACTIVITY_EVENTS = [
  'mousedown',
  'mousemove',
  'keypress',
  'scroll',
  'touchstart',
  'click',
  'keydown',
] as const

/**
 * AutoLogout — tracks user activity and logs out after 30 minutes of inactivity.
 *
 * Behavior:
 * - Records last activity time in localStorage (shared across tabs)
 * - On any user interaction, resets the timer
 * - 2 minutes before logout, shows a warning toast with an "Extend" button
 * - On timeout, calls /api/auth/logout and reloads
 * - On app load, checks if the last activity was >30 min ago → auto-logout
 * - Multi-tab sync: if one tab logs out, others detect it via storage events
 *
 * Session persistence:
 * - If a user closes the tab and reopens within 30 min, they stay logged in
 *   (the last-activity timestamp is recent)
 * - If they reopen after 30+ min, they're auto-logged out
 */
export function AutoLogout() {
  const { user, refresh } = useSession()
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const warnedRef = useRef(false)
  // Use refs to hold the latest callbacks so the effect doesn't re-run
  const refreshRef = useRef(refresh)
  useEffect(() => { refreshRef.current = refresh }, [refresh])

  const performLogout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {}
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
    toast.info('You have been signed out due to inactivity.', { id: 'inactivity-logout' })
    await refreshRef.current()
    if (typeof window !== 'undefined') {
      window.location.hash = '#/'
    }
  }, [])

  // Use a ref to break the circular dependency between showWarning and recordActivity
  const scheduleTimersRef = useRef<() => void>(() => {})

  const showWarning = useCallback(() => {
    if (warnedRef.current) return
    warnedRef.current = true
    toast.warning(
      'You will be signed out in 2 minutes due to inactivity.',
      {
        id: 'inactivity-warning',
        duration: WARNING_BEFORE,
        action: {
          label: 'Extend session',
          onClick: () => {
            const now = Date.now()
            try { localStorage.setItem(STORAGE_KEY, String(now)) } catch {}
            warnedRef.current = false
            toast.dismiss('inactivity-warning')
            scheduleTimersRef.current()
          },
        },
      }
    )
  }, [])

  const recordActivity = useCallback(() => {
    const now = Date.now()
    try { localStorage.setItem(STORAGE_KEY, String(now)) } catch {}
    if (warnedRef.current) {
      warnedRef.current = false
      toast.dismiss('inactivity-warning')
    }
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current)
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current)
    warningTimerRef.current = setTimeout(() => showWarning(), INACTIVITY_TIMEOUT - WARNING_BEFORE)
    logoutTimerRef.current = setTimeout(() => performLogout(), INACTIVITY_TIMEOUT)
  }, [showWarning, performLogout])

  // Keep the ref updated so the toast onClick can call it
  useEffect(() => { scheduleTimersRef.current = recordActivity }, [recordActivity])

  useEffect(() => {
    if (!user) return

    // Check stored last activity (from this or another tab)
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const elapsed = Date.now() - parseInt(stored, 10)
        if (elapsed >= INACTIVITY_TIMEOUT) {
          performLogout()
          return
        }
      } else {
        recordActivity()
      }
    } catch {
      recordActivity()
    }

    // Schedule initial timers
    recordActivity()

    // Add activity listeners
    ACTIVITY_EVENTS.forEach(event => {
      window.addEventListener(event, recordActivity, { passive: true })
    })

    // Periodic check — catches cases where timers were throttled by the browser
    intervalRef.current = setInterval(() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const elapsed = Date.now() - parseInt(stored, 10)
          if (elapsed >= INACTIVITY_TIMEOUT) {
            performLogout()
          }
        }
      } catch {}
    }, CHECK_INTERVAL)

    // Multi-tab sync
    const onStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        if (warnedRef.current) {
          warnedRef.current = false
          toast.dismiss('inactivity-warning')
        }
        if (warningTimerRef.current) clearTimeout(warningTimerRef.current)
        if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current)
        warningTimerRef.current = setTimeout(() => showWarning(), INACTIVITY_TIMEOUT - WARNING_BEFORE)
        logoutTimerRef.current = setTimeout(() => performLogout(), INACTIVITY_TIMEOUT)
      }
    }
    window.addEventListener('storage', onStorageChange)

    return () => {
      ACTIVITY_EVENTS.forEach(event => {
        window.removeEventListener(event, recordActivity)
      })
      window.removeEventListener('storage', onStorageChange)
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current)
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [user, recordActivity, performLogout, showWarning])

  return null
}
