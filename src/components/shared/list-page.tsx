"use client"

import { useEffect, useState, ReactNode } from 'react'
import { useI18n } from '@/lib/i18n'
import { useRouter } from '@/lib/router'
import { PageHeader, DemoBanner, EmptyState } from '@/components/shared/ui-helpers'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface Field { key: string; label?: string }
interface TypeFilter { value: string; label: string }

interface ListPageProps {
  title: string
  subtitle: string
  endpoint: string
  typeFilters?: TypeFilter[]
  typeParam?: string
  renderItem: (item: any) => ReactNode
  navigateBase: string
  icon?: any
  action?: ReactNode
  pageSize?: number
}

export function ListPage({
  title, subtitle, endpoint, typeFilters, typeParam = 'type',
  renderItem, navigateBase, icon, action, pageSize = 12,
}: ListPageProps) {
  const { t } = useI18n()
  const { navigate } = useRouter()
  const [items, setItems] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [type, setType] = useState('all')
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const load = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (type !== 'all' && typeFilters) params.set(typeParam, type)
      params.set('limit', String(pageSize))
      params.set('offset', String((page - 1) * pageSize))
      const res = await fetch(`${endpoint}?${params}`, { cache: 'no-store' })
      const d = await res.json()
      setItems(d.items ?? [])
      setTotal(d.total ?? 0)
    } finally { setLoading(false) }
  }

  useEffect(() => {
    setPage(1)
    load()
  }, [type])

  useEffect(() => {
    load()
  }, [page])

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return
    setPage(p)
  }

  // Build page numbers (show first, last, current ± 1, with ellipsis)
  const pageNumbers: (number | '...')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pageNumbers.push(i)
  } else {
    pageNumbers.push(1)
    if (page > 3) pageNumbers.push('...')
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pageNumbers.push(i)
    }
    if (page < totalPages - 2) pageNumbers.push('...')
    pageNumbers.push(totalPages)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader title={title} subtitle={subtitle} action={action} />
      <div className="mb-4"><DemoBanner /></div>
      <div className="grid gap-2 sm:grid-cols-3 mb-6">
        <Input placeholder={t('common.searchPlaceholder')} value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { setPage(1); load() } }} />
        {typeFilters && (
          <Select value={type} onValueChange={setType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all')}</SelectItem>
              {typeFilters.map(tf => <SelectItem key={tf.value} value={tf.value}>{tf.label}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        <Button onClick={() => { setPage(1); load() }} variant="secondary">{t('common.filter')}</Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
      ) : items.length === 0 ? (
        <EmptyState title={t('common.noResults')} icon={icon} />
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {items.map(item => (
              <div key={item.id} className="cursor-pointer card-hover rounded-lg" onClick={() => navigate(`${navigateBase}/${item.id}`)}>
                {renderItem(item)}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground order-2 sm:order-1">
                Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
              </p>
              <div className="flex items-center gap-1 flex-wrap justify-center order-1 sm:order-2 max-w-full">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => goToPage(1)} disabled={page === 1} aria-label="First page">
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => goToPage(page - 1)} disabled={page === 1} aria-label="Previous page">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {pageNumbers.map((pn, i) =>
                  pn === '...' ? (
                    <span key={`e${i}`} className="px-2 text-muted-foreground text-sm">…</span>
                  ) : (
                    <Button
                      key={pn}
                      variant={pn === page ? 'default' : 'outline'}
                      size="icon"
                      className="h-8 w-8 text-sm"
                      onClick={() => goToPage(pn)}
                      aria-label={`Page ${pn}`}
                      aria-current={pn === page ? 'page' : undefined}
                    >
                      {pn}
                    </Button>
                  )
                )}
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => goToPage(page + 1)} disabled={page === totalPages} aria-label="Next page">
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => goToPage(totalPages)} disabled={page === totalPages} aria-label="Last page">
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
