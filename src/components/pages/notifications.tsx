"use client"

import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { useNavigate } from '@/lib/router'
import { PageHeader, EmptyState, formatDate } from '@/components/shared/ui-helpers'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, CheckCheck } from 'lucide-react'

export function NotificationsPage() {
  const { t, locale } = useI18n()
  const navigate = useNavigate()
  const [items, setItems] = useState<any[]>([])

  const load = () => {
    fetch('/api/notifications', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => setItems(d.items ?? []))
  }
  useEffect(() => { load() }, [])

  const markAll = async () => {
    await fetch('/api/notifications', { method: 'POST' })
    load()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <PageHeader
        title={t('dashboard.myNotifications')}
        action={items.some(i => !i.isRead) && <Button variant="outline" onClick={markAll}><CheckCheck className="mr-2 h-4 w-4" /> Mark all read</Button>}
      />
      {items.length === 0 ? <EmptyState title="No notifications" icon={Bell} /> :
        <div className="space-y-2">
          {items.map(n => (
            <Card key={n.id} className={n.isRead ? 'opacity-60' : ''}>
              <CardContent className="p-3 flex items-start gap-3">
                <Bell className="mt-0.5 h-4 w-4 text-primary" />
                <div className="flex-1">
                  <div className="text-sm font-medium">{n.title}</div>
                  {n.body && <div className="text-xs text-muted-foreground mt-0.5">{n.body}</div>}
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px]">{n.type}</Badge>
                    <span className="text-xs text-muted-foreground">{formatDate(n.createdAt, locale)}</span>
                  </div>
                </div>
                {n.link && <Button size="sm" variant="ghost" onClick={() => navigate(n.link!)}>View</Button>}
              </CardContent>
            </Card>
          ))}
        </div>
      }
    </div>
  )
}
