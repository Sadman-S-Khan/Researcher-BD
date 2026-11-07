"use client"

import { useEffect, useState, useCallback } from 'react'

// Parse a hash like #/researchers/abc?tab=publications into segments and query
export interface Route {
  segments: string[]      // e.g. ['researchers', 'abc']
  query: Record<string, string>
  hash: string             // raw hash without leading '#'
}

function parseHash(hash: string): Route {
  let raw = hash.replace(/^#\/?/, '') // remove '#/' or '#'
  // separate query string
  const qIndex = raw.indexOf('?')
  let path = raw
  let queryStr = ''
  if (qIndex >= 0) {
    path = raw.slice(0, qIndex)
    queryStr = raw.slice(qIndex + 1)
  }
  const segments = path.split('/').filter(Boolean)
  const query: Record<string, string> = {}
  if (queryStr) {
    new URLSearchParams(queryStr).forEach((v, k) => { query[k] = v })
  }
  return { segments, query, hash: raw }
}

export function useRouter() {
  const [route, setRoute] = useState<Route>(() => {
    if (typeof window === 'undefined') return { segments: [], query: {}, hash: '' }
    return parseHash(window.location.hash)
  })

  useEffect(() => {
    const onHashChange = () => {
      setRoute(parseHash(window.location.hash))
      // Scroll to top on route change (unless we have an anchor)
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    }
    window.addEventListener('hashchange', onHashChange)
    // Initialize if no hash
    if (!window.location.hash) {
      window.location.hash = '#/'
    } else if (parseHash(window.location.hash).hash !== route.hash) {
       
      setRoute(parseHash(window.location.hash))
    }
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const navigate = useCallback((path: string) => {
    const clean = path.startsWith('/') ? path.slice(1) : path
    window.location.hash = '#/' + clean
  }, [])

  return { route, navigate }
}

// Convenience hook for components that only need navigation
export function useNavigate() {
  const { navigate } = useRouter()
  return navigate
}
