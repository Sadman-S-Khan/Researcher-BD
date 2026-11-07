"use client"

import { useTheme } from 'next-themes'
import { Moon, Sun, Monitor } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const { t } = useI18n()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Theme">
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Sun className="mr-2 h-4 w-4" /> {t('common.light')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Moon className="mr-2 h-4 w-4" /> {t('common.dark')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <Monitor className="mr-2 h-4 w-4" /> {t('common.system')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function LanguageToggle() {
  const { locale, setLocale, t } = useI18n()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 font-medium">
          <span className="text-xs uppercase rounded border border-border px-1.5 py-0.5">
            {locale}
          </span>
          <span className="sr-only">{t('common.language')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLocale('en')}>
          <span className="mr-2">🇬🇧</span> English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLocale('bn')}>
          <span className="mr-2">🇧🇩</span> বাংলা
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
