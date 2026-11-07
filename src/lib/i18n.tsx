"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export type Locale = 'en' | 'bn'

interface I18nContextValue {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: string, vars?: Record<string, string | number>) => string
  /** Resolve a dictionary key that holds a list of strings (e.g. about.objectivesList). */
  tList: (key: string) => string[]
}

const I18nContext = createContext<I18nContextValue | null>(null)

// Import the static dictionaries (bundled at build time)
import { dictionaries } from './dictionaries'

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')

  useEffect(() => {
    const stored = (typeof window !== 'undefined' &&
      (localStorage.getItem('rbd_locale') as Locale | null)) || 'en'
     
    if (stored !== locale) setLocaleState(stored)
    document.documentElement.lang = stored
  }, [])

  const setLocale = (l: Locale) => {
    setLocaleState(l)
    if (typeof window !== 'undefined') {
      localStorage.setItem('rbd_locale', l)
      document.documentElement.lang = l
    }
  }

  const lookup = (dict: unknown, key: string): unknown =>
    key.split('.').reduce<unknown>((acc, k) => {
      return acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[k] : undefined
    }, dict)

  const t = (key: string, vars?: Record<string, string | number>) => {
    const dict = dictionaries[locale] || dictionaries.en
    let found = lookup(dict, key)
    if (found === undefined) {
      // Fallback to English
      found = lookup(dictionaries.en, key)
    }
    if (typeof found !== 'string') return key
    let value: string = found
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        value = value.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
      })
    }
    return value
  }

  const tList = (key: string): string[] => {
    const dict = dictionaries[locale] || dictionaries.en
    const found = lookup(dict, key) ?? lookup(dictionaries.en, key)
    return Array.isArray(found) ? found.map(String) : []
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, tList }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
