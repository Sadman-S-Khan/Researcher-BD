"use client"

import { useState, useEffect } from 'react'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetHeader,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Menu, Search, Bell, Compass, Users, GraduationCap, MessageSquare,
  FolderKanban, User as UserIcon, LogOut, LayoutDashboard, Shield,
  ChevronDown, BookOpen, FlaskConical, Database, CalendarDays, Landmark,
  Microscope, UsersRound, Lightbulb, FileText, Award, PenLine, ShieldCheck,
  HelpCircle, Megaphone, Bookmark, Folder, ListChecks, Users2, Send,
} from 'lucide-react'
import { useRouter, useNavigate } from '@/lib/router'
import { useI18n } from '@/lib/i18n'
import { ThemeToggle, LanguageToggle } from './toggles'
import { useSession } from '@/lib/session-context'
import { Badge } from '@/components/ui/badge'

export function Navbar() {
  const { t } = useI18n()
  const { route } = useRouter()
  const navigate = useNavigate()
  const { user, loading } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifCount, setNotifCount] = useState(0)

  useEffect(() => {
    if (user) {
      fetch('/api/notifications?count=1', { cache: 'no-store' })
        .then(r => r.json())
        .then(d => setNotifCount(d.unread ?? 0))
        .catch(() => {})
    }
  }, [user, route.hash])

  const isActive = (path: string) => {
    return route.segments[0] === path || (path === '' && route.segments.length === 0)
  }

  const go = (path: string) => {
    navigate(path)
    setMobileOpen(false)
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.reload()
  }

  interface MenuItem { label: string; path: string; icon: any; desc?: string }
  interface MenuGroup { label: string; items: MenuItem[] }

  const groups: MenuGroup[] = [
    {
      label: t('nav.discover'),
      items: [
        { label: t('nav.opportunities'), path: 'opportunities', icon: FlaskConical, desc: 'Scholarships, fellowships, PhD positions' },
        { label: t('nav.funding'), path: 'funding', icon: Award, desc: 'Grants and research awards' },
        { label: t('nav.journals'), path: 'journals', icon: BookOpen, desc: 'Verified journal directory' },
        { label: t('nav.conferences'), path: 'conferences', icon: UsersRound, desc: 'Upcoming conferences' },
        { label: t('nav.datasets'), path: 'datasets', icon: Database, desc: 'Research datasets' },
        { label: t('nav.events'), path: 'events', icon: CalendarDays, desc: 'Seminars, workshops, webinars' },
      ],
    },
    {
      label: t('nav.people'),
      items: [
        { label: t('nav.researchers'), path: 'researchers', icon: Users, desc: 'Researcher directory' },
        { label: t('nav.mentors'), path: 'mentors', icon: GraduationCap, desc: 'Supervisors and mentors' },
        { label: t('nav.laboratories'), path: 'laboratories', icon: Microscope, desc: 'Research labs' },
        { label: t('nav.groups'), path: 'researchers?filter=groups', icon: Users2, desc: 'Research groups' },
        { label: t('nav.organizations'), path: 'organizations', icon: Landmark, desc: 'Universities and institutions' },
        { label: t('nav.collaboration'), path: 'collaboration', icon: Lightbulb, desc: 'Collaboration board' },
      ],
    },
    {
      label: t('nav.learn'),
      items: [
        { label: t('nav.fundamentals'), path: 'learn?cat=fundamentals', icon: Compass, desc: 'Introduction to research' },
        { label: t('nav.methodology'), path: 'learn?cat=fundamentals&path=methodology', icon: Lightbulb, desc: 'Research methodology' },
        { label: t('nav.literature'), path: 'learn?cat=literature', icon: BookOpen, desc: 'Literature review methods' },
        { label: t('nav.dataAnalysis'), path: 'learn?cat=data-analysis', icon: Database, desc: 'Statistics and computing' },
        { label: t('nav.tools'), path: 'learn?cat=tools', icon: PenLine, desc: 'Zotero, LaTeX, GitHub' },
        { label: t('nav.writing'), path: 'learn?cat=writing', icon: FileText, desc: 'Academic writing' },
        { label: t('nav.ethics'), path: 'learn?cat=ethics', icon: ShieldCheck, desc: 'Research ethics' },
        { label: t('nav.learningPaths'), path: 'learn?tab=paths', icon: GraduationCap, desc: 'Guided learning paths' },
      ],
    },
    {
      label: t('nav.community'),
      items: [
        { label: t('nav.questions'), path: 'community?tab=questions', icon: HelpCircle, desc: 'Research Q&A' },
        { label: t('nav.discussions'), path: 'community?tab=discussions', icon: MessageSquare, desc: 'Academic discussions' },
        { label: t('nav.support'), path: 'community?tab=support', icon: HelpCircle, desc: 'Technical support' },
        { label: t('nav.announcements'), path: 'community?tab=announcements', icon: Megaphone, desc: 'Research announcements' },
      ],
    },
    {
      label: t('nav.myResearch'),
      items: [
        { label: t('nav.projects'), path: 'projects', icon: Folder, desc: 'Research projects' },
        { label: t('nav.tasks'), path: 'tasks', icon: ListChecks, desc: 'Tasks assigned to you' },
        { label: t('nav.teams'), path: 'teams', icon: Users2, desc: 'Your teams' },
        { label: t('nav.applications'), path: 'applications', icon: Send, desc: 'Applications and requests' },
        { label: t('nav.bookmarks'), path: 'bookmarks', icon: Bookmark, desc: 'Saved records' },
        { label: t('nav.contributions'), path: 'contributions', icon: Award, desc: 'Publications and contributions' },
      ],
    },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 glass-strong">
      <div className="container mx-auto flex h-16 items-center gap-1 sm:gap-2 px-3 sm:px-4">
        {/* Mobile menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="xl:hidden" aria-label="Menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[360px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle
                className="flex items-center gap-2 cursor-pointer hover:bg-accent rounded-md p-1 -m-1 transition-colors"
                onClick={() => go('')}
              >
                <LogoMark />
                {t('brand.name')}
                <span className="ml-auto text-[10px] text-muted-foreground font-normal">{t('nav.home')}</span>
              </SheetTitle>
            </SheetHeader>
            <nav className="mt-6 flex flex-col gap-1">
              <MobileLink active={isActive('discover')} onClick={() => go('discover')} label={t('nav.discover')} icon={Compass} />
              <MobileLink active={isActive('opportunities')} onClick={() => go('opportunities')} label={t('nav.opportunities')} icon={FlaskConical} />
              <MobileLink active={isActive('funding')} onClick={() => go('funding')} label={t('nav.funding')} icon={Award} />
              <MobileLink active={isActive('journals')} onClick={() => go('journals')} label={t('nav.journals')} icon={BookOpen} />
              <MobileLink active={isActive('conferences')} onClick={() => go('conferences')} label={t('nav.conferences')} icon={UsersRound} />
              <MobileLink active={isActive('datasets')} onClick={() => go('datasets')} label={t('nav.datasets')} icon={Database} />
              <MobileLink active={isActive('events')} onClick={() => go('events')} label={t('nav.events')} icon={CalendarDays} />
              <MobileLink active={isActive('researchers')} onClick={() => go('researchers')} label={t('nav.researchers')} icon={Users} />
              <MobileLink active={isActive('mentors')} onClick={() => go('mentors')} label={t('nav.mentors')} icon={GraduationCap} />
              <MobileLink active={isActive('laboratories')} onClick={() => go('laboratories')} label={t('nav.laboratories')} icon={Microscope} />
              <MobileLink active={isActive('organizations')} onClick={() => go('organizations')} label={t('nav.organizations')} icon={Landmark} />
              <MobileLink active={isActive('collaboration')} onClick={() => go('collaboration')} label={t('nav.collaboration')} icon={Lightbulb} />
              <MobileLink active={isActive('learn')} onClick={() => go('learn')} label={t('nav.learn')} icon={GraduationCap} />
              <MobileLink active={isActive('community')} onClick={() => go('community')} label={t('nav.community')} icon={MessageSquare} />
              <MobileLink active={isActive('projects')} onClick={() => go('projects')} label={t('nav.projects')} icon={Folder} />
              <MobileLink active={isActive('integrity')} onClick={() => go('integrity')} label={t('nav.integrity')} icon={ShieldCheck} />
              <MobileLink active={isActive('about')} onClick={() => go('about')} label={t('nav.about')} icon={BookOpen} />
              <MobileLink active={isActive('contact')} onClick={() => go('contact')} label={t('nav.contact')} icon={Send} />
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo + Home button (clicking the logo navigates home) */}
        <button
          className={`group flex items-center gap-2 mr-1 sm:mr-2 cursor-pointer rounded-lg px-1.5 py-1 transition-all hover:bg-secondary shrink-0`}
          onClick={() => go('')}
          aria-label={t('brand.name') + ' — ' + t('nav.home')}
          title={t('nav.home')}
        >
          <LogoMark />
          <span className="hidden sm:inline font-semibold text-base leading-none">{t('brand.name')}</span>
        </button>

        {/* Desktop nav (Home is the logo, so we start with Discover) */}
        <NavigationMenu className="hidden xl:flex">
          <NavigationMenuList>
            {groups.map(group => (
              <NavigationMenuItem key={group.label}>
                <NavigationMenuTrigger>{group.label}</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[420px] gap-2 p-3 md:w-[520px] md:grid-cols-2">
                    {group.items.map(item => {
                      const Icon = item.icon
                      return (
                        <li key={item.path}>
                          <button
                            onClick={() => go(item.path)}
                            className="flex w-full items-start gap-3 rounded-md p-3 text-left hover:bg-secondary transition-colors"
                          >
                            <Icon className="mt-0.5 h-4 w-4 text-primary shrink-0" />
                            <div className="flex-1">
                              <div className="text-sm font-medium">{item.label}</div>
                              {item.desc && (
                                <div className="text-xs text-muted-foreground mt-0.5">{item.desc}</div>
                              )}
                            </div>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="ml-auto flex items-center gap-0.5 sm:gap-1 shrink-0">
          {/* Search shortcut */}
          <Button
            variant="ghost"
            size="sm"
            className="hidden xl:flex gap-2 text-muted-foreground"
            onClick={() => go('search')}
          >
            <Search className="h-4 w-4" />
            <span className="text-sm">{t('common.search')}</span>
          </Button>
          <Button variant="ghost" size="icon" className="hidden sm:inline-flex xl:hidden" onClick={() => go('search')} aria-label={t('common.search')}>
            <Search className="h-5 w-5" />
          </Button>

          {/* Notifications */}
          {user && (
            <Button variant="ghost" size="icon" onClick={() => go('notifications')} aria-label={t('nav.notifications')} className="relative">
              <Bell className="h-5 w-5" />
              {notifCount > 0 && (
                <span className="absolute top-1 right-1 h-4 min-w-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] leading-4 font-semibold">
                  {notifCount > 9 ? '9+' : notifCount}
                </span>
              )}
            </Button>
          )}

          <LanguageToggle />
          <ThemeToggle />

          {/* Auth */}
          {loading ? (
            <div className="h-9 w-9" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="ml-1 flex items-center gap-2 rounded-full p-0.5 hover:bg-accent transition" aria-label="Account">
                  <Avatar className="h-8 w-8 border border-border">
                    {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {user.name?.charAt(0)?.toUpperCase() ?? 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="hidden sm:block h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                    <Badge variant="secondary" className="mt-1 w-fit text-[10px]">{user.role}</Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => go('dashboard')}>
                  <LayoutDashboard className="mr-2 h-4 w-4" /> {t('nav.dashboard')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => go('profile')}>
                  <UserIcon className="mr-2 h-4 w-4" /> {t('nav.myProfile')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => go('projects')}>
                  <FolderKanban className="mr-2 h-4 w-4" /> {t('nav.projects')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => go('notifications')}>
                  <Bell className="mr-2 h-4 w-4" /> {t('nav.notifications')}
                </DropdownMenuItem>
                {user.role === 'ADMIN' || user.role === 'MODERATOR' ? (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => go('admin')}>
                      <Shield className="mr-2 h-4 w-4" /> {t('nav.admin')}
                    </DropdownMenuItem>
                  </>
                ) : null}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" /> {t('nav.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => go('login')} className="ml-1 shrink-0">
                {t('nav.login')}
              </Button>
              <Button size="sm" onClick={() => go('register')} className="hidden sm:inline-flex shrink-0">
                {t('nav.register')}
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

function MobileLink({ active, onClick, label, icon: Icon }: { active: boolean; onClick: () => void; label: string; icon: any }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm text-left hover:bg-accent ${active ? 'bg-accent font-medium' : ''}`}
    >
      <Icon className="h-4 w-4 text-primary" />
      {label}
    </button>
  )
}

function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      role="img"
      aria-label="Researcher BD"
      className="shrink-0"
    >
      {/* Emerald rounded square background */}
      <rect width="64" height="64" rx="14" fill="#0b6e4f" />
      {/* Central researcher node */}
      <circle cx="32" cy="17" r="4.5" fill="#ffffff" />
      {/* Radiating connections */}
      <line x1="32" y1="17" x2="22" y2="26" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="32" y1="17" x2="42" y2="26" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="32" y1="17" x2="32" y2="29" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" opacity="0.85" />
      {/* Connected researcher nodes */}
      <circle cx="22" cy="26" r="2.6" fill="#ffffff" />
      <circle cx="42" cy="26" r="2.6" fill="#ffffff" />
      {/* Open book — two pages meeting at a spine */}
      <path d="M32 34 L14 38 L14 49 L32 45 Z" fill="#ffffff" opacity="0.95" />
      <path d="M32 34 L50 38 L50 49 L32 45 Z" fill="#ffffff" opacity="0.8" />
      {/* Spine */}
      <line x1="32" y1="34" x2="32" y2="45" stroke="#0b6e4f" strokeWidth="1.4" />
      {/* Page content lines */}
      <line x1="19" y1="41" x2="28" y2="39.5" stroke="#0b6e4f" strokeWidth="0.9" strokeLinecap="round" opacity="0.5" />
      <line x1="19" y1="44" x2="28" y2="42.5" stroke="#0b6e4f" strokeWidth="0.9" strokeLinecap="round" opacity="0.5" />
      <line x1="36" y1="39.5" x2="45" y2="41" stroke="#0b6e4f" strokeWidth="0.9" strokeLinecap="round" opacity="0.5" />
      <line x1="36" y1="42.5" x2="45" y2="44" stroke="#0b6e4f" strokeWidth="0.9" strokeLinecap="round" opacity="0.5" />
    </svg>
  )
}
