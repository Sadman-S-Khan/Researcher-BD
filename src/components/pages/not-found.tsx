"use client"

import { useNavigate } from '@/lib/router'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <div className="text-6xl font-bold text-primary mb-4">404</div>
      <h2 className="text-xl font-semibold mb-2">Page not found</h2>
      <p className="text-muted-foreground mb-6">The page you are looking for does not exist.</p>
      <Button onClick={() => navigate('')}>Back to home</Button>
    </div>
  )
}
