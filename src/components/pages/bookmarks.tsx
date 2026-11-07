"use client"

import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { useNavigate } from '@/lib/router'
import { PageHeader, EmptyState, formatDate } from '@/components/shared/ui-helpers'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bookmark } from 'lucide-react'

export function BookmarksPage() {
  const { t, locale } = useI18n()
  const navigate = useNavigate()
  const [items, setItems] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/bookmarks', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => setItems(d.items ?? []))
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader title={t('dashboard.myBookmarks')} subtitle="Records you have saved across the platform." />
      {items.length === 0 ? <EmptyState title="No bookmarks yet" icon={Bookmark} message="Save opportunities, datasets, events and more by clicking the bookmark button." /> :
        <div className="space-y-2">
          {items.map(b => (
            <Card key={b.id} className="cursor-pointer hover:shadow-md" onClick={() => navigate(`${b.targetType}s/${b.targetId}`)}>
              <CardContent className="p-3 flex items-center gap-3">
                <Badge variant="secondary" className="text-[10px]">{b.targetType}</Badge>
                <div className="flex-1 text-sm">
                  Saved on {formatDate(b.createdAt, locale)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      }
    </div>
  )
}
