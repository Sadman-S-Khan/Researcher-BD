"use client"

import { useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { useNavigate } from '@/lib/router'
import { useSession } from '@/lib/session-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'
import { GraduationCap, FlaskConical, Users, Landmark } from 'lucide-react'

export function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { refresh } = useSession()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', role: 'STUDENT',
  })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'register') {
        if (form.password !== form.confirmPassword) {
          toast.error(t('auth.passwordMismatch')); return
        }
        if (form.password.length < 8) {
          toast.error(t('auth.weakPassword')); return
        }
        if (!form.name.trim()) {
          toast.error(t('auth.nameRequired')); return
        }
      }
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const body = mode === 'login'
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password, role: form.role }
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? (mode === 'login' ? t('auth.loginError') : t('auth.registerError')))
        return
      }
      toast.success(mode === 'login' ? t('dashboard.welcome') : t('auth.registerSuccess'))
      await refresh()
      navigate('dashboard')
    } catch (e) {
      toast.error(mode === 'login' ? t('auth.loginError') : t('auth.registerError'))
    } finally {
      setLoading(false)
    }
  }

  const roles = [
    { value: 'STUDENT', label: t('auth.roleStudent'), icon: GraduationCap },
    { value: 'RESEARCHER', label: t('auth.roleResearcher'), icon: FlaskConical },
    { value: 'FACULTY', label: t('auth.roleFaculty'), icon: Users },
    { value: 'ORG_REP', label: t('auth.roleOrgRep'), icon: Landmark },
  ]

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">
            {mode === 'login' ? t('auth.loginTitle') : t('auth.registerTitle')}
          </CardTitle>
          <CardDescription>
            {mode === 'login' ? t('auth.loginSubtitle') : t('auth.registerSubtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-1.5">
                <Label htmlFor="name">{t('auth.name')}</Label>
                <Input
                  id="name" required value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  autoComplete="name"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input
                id="email" type="email" required value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                autoComplete="email"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input
                id="password" type="password" required value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </div>
            {mode === 'register' && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="confirm">{t('auth.confirmPassword')}</Label>
                  <Input
                    id="confirm" type="password" required value={form.confirmPassword}
                    onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                    autoComplete="new-password"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('auth.role')}</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {roles.map(r => {
                      const Icon = r.icon
                      return (
                        <button
                          key={r.value}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, role: r.value }))}
                          className={`flex items-center gap-2 rounded-md border px-3 py-2 text-xs text-left transition ${
                            form.role === r.value
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border hover:bg-accent'
                          }`}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          {r.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('common.loading') : (mode === 'login' ? t('auth.loginBtn') : t('auth.registerBtn'))}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            {mode === 'login' ? (
              <>
                <span className="text-muted-foreground">{t('auth.noAccount')} </span>
                <button onClick={() => navigate('register')} className="text-primary hover:underline font-medium">
                  {t('nav.register')}
                </button>
              </>
            ) : (
              <>
                <span className="text-muted-foreground">{t('auth.haveAccount')} </span>
                <button onClick={() => navigate('login')} className="text-primary hover:underline font-medium">
                  {t('nav.login')}
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
