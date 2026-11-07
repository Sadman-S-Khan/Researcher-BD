"use client"

import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { useNavigate } from '@/lib/router'
import { PageHeader, EmptyState, formatDate } from '@/components/shared/ui-helpers'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ListChecks } from 'lucide-react'

export function TasksPage() {
  const { t, locale } = useI18n()
  const navigate = useNavigate()
  const [projects, setProjects] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/projects?limit=100', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => setProjects(d.items ?? []))
  }, [])

  // Collect tasks from all projects
  const tasks: any[] = []
  projects.forEach(p => {
    if (p.tasks) {
      p.tasks.forEach((task: any) => {
        tasks.push({ ...task, project: p })
      })
    }
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader title={t('dashboard.myTasks')} subtitle="Tasks assigned to you across all your projects." />
      {tasks.length === 0 ? <EmptyState title="No tasks yet" icon={ListChecks} message="Tasks you create or are assigned will appear here." /> :
        <div className="space-y-2">
          {tasks.map(task => (
            <Card key={task.id} className="cursor-pointer hover:shadow-md" onClick={() => navigate(`projects/${task.project.id}`)}>
              <CardContent className="p-3 flex items-center gap-3">
                <Badge variant="outline" className="text-[10px]">{task.status}</Badge>
                <div className="flex-1">
                  <div className="font-medium text-sm">{task.title}</div>
                  <div className="text-xs text-muted-foreground">{task.project.title}</div>
                </div>
                {task.dueDate && <span className="text-xs text-muted-foreground">{formatDate(task.dueDate, locale)}</span>}
              </CardContent>
            </Card>
          ))}
        </div>
      }
    </div>
  )
}
