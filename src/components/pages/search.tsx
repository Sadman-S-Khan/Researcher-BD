"use client"

import { useEffect, useState } from 'react'
import { useNavigate } from '@/lib/router'
import { useI18n } from '@/lib/i18n'
import { PageHeader, formatDate } from '@/components/shared/ui-helpers'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search as SearchIcon, Bookmark, Trash2 } from 'lucide-react'
import { useRouter } from '@/lib/router'
import { useSession } from '@/lib/session-context'
import { toast } from 'sonner'

export function SearchPage() {
  const { t, locale } = useI18n()
  const { route, navigate } = useRouter()
  const { user } = useSession()
  const [q, setQ] = useState(route.query.q ?? '')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [savedSearches, setSavedSearches] = useState<any[]>([])
  const [saveName, setSaveName] = useState('')

  useEffect(() => {
    if (route.query.q) {
      setQ(route.query.q)
      doSearch(route.query.q)
    }
  }, [route.query.q])

  useEffect(() => {
    if (user) {
      fetch('/api/saved-searches', { cache: 'no-store' })
        .then(r => r.json())
        .then(d => setSavedSearches(d.items ?? []))
        .catch(() => {})
    }
  }, [user])

  const doSearch = async (query: string) => {
    if (!query || query.length < 2) { setResults([]); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { cache: 'no-store' })
      const d = await res.json()
      setResults(d.results ?? [])
    } finally { setLoading(false) }
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(`search?q=${encodeURIComponent(q)}`)
  }

  const saveSearch = async () => {
    if (!saveName.trim() || !q.trim()) return
    const res = await fetch('/api/saved-searches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: saveName, query: q }),
    })
    if (res.ok) {
      toast.success('Search saved')
      setSaveName('')
      const d = await res.json()
      setSavedSearches(s => [d.savedSearch, ...s])
    }
  }

  const deleteSaved = async (id: string) => {
    await fetch(`/api/saved-searches?id=${id}`, { method: 'DELETE' })
    setSavedSearches(s => s.filter(x => x.id !== id))
    toast.success('Removed')
  }

  const typeIcons: Record<string, string> = {
    opportunity: '🧪', journal: '📚', conference: '👥', dataset: '💾', event: '📅',
    researcher: '👤', organization: '🏛️', laboratory: '🔬', lesson: '🎓', question: '❓',
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <PageHeader title={t('nav.search')} />
      <form onSubmit={onSubmit} className="relative mb-6">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          autoFocus
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder={t('common.searchPlaceholder')}
          className="pl-10"
        />
      </form>

      {/* Save search */}
      {user && q.length >= 2 && (
        <div className="flex gap-2 mb-4">
          <Input placeholder="Save this search as..." value={saveName} onChange={e => setSaveName(e.target.value)} className="flex-1" />
          <Button onClick={saveSearch} variant="outline" size="sm"><Bookmark className="mr-1 h-3 w-3" /> Save</Button>
        </div>
      )}

      {/* Saved searches */}
      {savedSearches.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Saved searches</h3>
          <div className="flex flex-wrap gap-2">
            {savedSearches.map(s => (
              <div key={s.id} className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-2 py-1">
                <button onClick={() => navigate(`search?q=${encodeURIComponent(s.query)}`)} className="text-xs hover:underline">
                  <strong>{s.name}</strong> · "{s.query}"
                </button>
                <button onClick={() => deleteSaved(s.id)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && <p className="text-sm text-muted-foreground">{t('common.loading')}</p>}
      {!loading && q.length >= 2 && results.length === 0 && (
        <p className="text-sm text-muted-foreground">{t('common.noResults')}</p>
      )}
      <div className="space-y-2">
        {results.map(r => (
          <Card key={r.type + r.id} className="cursor-pointer hover:shadow-md" onClick={() => navigate(r.path)}>
            <CardContent className="p-3 flex items-center gap-3">
              <span className="text-xl">{typeIcons[r.type] ?? '📄'}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{r.title}</div>
                {r.subtitle && <div className="text-xs text-muted-foreground truncate">{r.subtitle}</div>}
              </div>
              <span className="text-xs rounded bg-muted px-2 py-0.5 text-muted-foreground">{r.type}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
