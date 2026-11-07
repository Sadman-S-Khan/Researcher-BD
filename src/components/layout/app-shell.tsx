"use client"

import { useRouter } from '@/lib/router'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { AutoLogout } from '@/components/shared/auto-logout'
import { lazy, Suspense, useEffect } from 'react'
import { useSession } from '@/lib/session-context'

// Lazy load page components to keep initial bundle small
const HomePage = lazy(() => import('@/components/pages/home').then(m => ({ default: m.HomePage })))
const AuthPage = lazy(() => import('@/components/pages/auth').then(m => ({ default: m.AuthPage })))
const DiscoverPage = lazy(() => import('@/components/pages/discover').then(m => ({ default: m.DiscoverPage })))
const OpportunitiesPage = lazy(() => import('@/components/pages/opportunities').then(m => ({ default: m.OpportunitiesPage })))
const FundingPage = lazy(() => import('@/components/pages/funding').then(m => ({ default: m.FundingPage })))
const JournalsPage = lazy(() => import('@/components/pages/journals').then(m => ({ default: m.JournalsPage })))
const ConferencesPage = lazy(() => import('@/components/pages/conferences').then(m => ({ default: m.ConferencesPage })))
const DatasetsPage = lazy(() => import('@/components/pages/datasets').then(m => ({ default: m.DatasetsPage })))
const ResearchersPage = lazy(() => import('@/components/pages/researchers').then(m => ({ default: m.ResearchersPage })))
const MentorsPage = lazy(() => import('@/components/pages/mentors').then(m => ({ default: m.MentorsPage })))
const OrganizationsPage = lazy(() => import('@/components/pages/organizations').then(m => ({ default: m.OrganizationsPage })))
const LaboratoriesPage = lazy(() => import('@/components/pages/laboratories').then(m => ({ default: m.LaboratoriesPage })))
const LearnPage = lazy(() => import('@/components/pages/learn').then(m => ({ default: m.LearnPage })))
const EventsPage = lazy(() => import('@/components/pages/events').then(m => ({ default: m.EventsPage })))
const CommunityPage = lazy(() => import('@/components/pages/community').then(m => ({ default: m.CommunityPage })))
const ProjectsPage = lazy(() => import('@/components/pages/projects').then(m => ({ default: m.ProjectsPage })))
const CollaborationPage = lazy(() => import('@/components/pages/collaboration').then(m => ({ default: m.CollaborationPage })))
const DashboardPage = lazy(() => import('@/components/pages/dashboard').then(m => ({ default: m.DashboardPage })))
const ProfilePage = lazy(() => import('@/components/pages/profile').then(m => ({ default: m.ProfilePage })))
const AdminPage = lazy(() => import('@/components/pages/admin').then(m => ({ default: m.AdminPage })))
const TasksPage = lazy(() => import('@/components/pages/tasks').then(m => ({ default: m.TasksPage })))
const BookmarksPage = lazy(() => import('@/components/pages/bookmarks').then(m => ({ default: m.BookmarksPage })))
const NotificationsPage = lazy(() => import('@/components/pages/notifications').then(m => ({ default: m.NotificationsPage })))
const SearchPage = lazy(() => import('@/components/pages/search').then(m => ({ default: m.SearchPage })))
const StaticPage = lazy(() => import('@/components/pages/static').then(m => ({ default: m.StaticPage })))
const NotFoundPage = lazy(() => import('@/components/pages/not-found').then(m => ({ default: m.NotFoundPage })))

function Loader() {
  return (
    <div className="container mx-auto px-4 py-12 flex items-center justify-center">
      <div className="text-sm text-muted-foreground">Loading…</div>
    </div>
  )
}

export function AppShell() {
  const { route, navigate } = useRouter()
  const { user, loading } = useSession()

  // In local development, seed demo data on first visit (production seeds during the build)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') fetch('/api/seed', { method: 'GET' }).catch(() => {})
  }, [])

  const path = route.segments[0] ?? ''
  const sub = route.segments[1] ?? ''

  // Start each new page at the top
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [path, sub])

  // Auth-gated routes
  const authGated = ['dashboard', 'profile', 'admin', 'projects', 'tasks', 'bookmarks', 'notifications', 'applications', 'teams', 'contributions']
  if (!loading && authGated.includes(path) && !user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12 text-center">
          <h2 className="text-xl font-semibold">Sign in required</h2>
          <p className="text-muted-foreground mt-2">Please sign in to access this page.</p>
          <div className="mt-4 flex gap-2 justify-center">
            <button onClick={() => navigate('login')} className="text-primary hover:underline">Sign in</button>
            <span className="text-muted-foreground">·</span>
            <button onClick={() => navigate('register')} className="text-primary hover:underline">Register</button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Admin role gate
  if (!loading && path === 'admin' && user && user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12 text-center">
          <h2 className="text-xl font-semibold">Forbidden</h2>
          <p className="text-muted-foreground mt-2">You need admin or moderator privileges to access this page.</p>
        </main>
        <Footer />
      </div>
    )
  }

  let page: React.ReactNode
  switch (path) {
    case '':
      page = <HomePage />; break
    case 'login':
      page = <AuthPage mode="login" />; break
    case 'register':
      page = <AuthPage mode="register" />; break
    case 'discover':
      page = <DiscoverPage />; break
    case 'opportunities':
      page = <OpportunitiesPage id={sub} />; break
    case 'funding':
      page = <FundingPage />; break
    case 'journals':
      page = <JournalsPage id={sub} />; break
    case 'conferences':
      page = <ConferencesPage id={sub} />; break
    case 'datasets':
      page = <DatasetsPage id={sub} />; break
    case 'events':
      page = <EventsPage id={sub} />; break
    case 'researchers':
      page = <ResearchersPage id={sub} />; break
    case 'mentors':
      page = <MentorsPage />; break
    case 'organizations':
      page = <OrganizationsPage id={sub} />; break
    case 'laboratories':
      page = <LaboratoriesPage id={sub} />; break
    case 'learn':
      page = <LearnPage slug={sub || route.query.cat || ''} />; break
    case 'community':
      page = <CommunityPage id={sub} />; break
    case 'projects':
      page = <ProjectsPage id={sub} />; break
    case 'collaboration':
      page = <CollaborationPage />; break
    case 'tasks':
      page = <TasksPage />; break
    case 'bookmarks':
      page = <BookmarksPage />; break
    case 'notifications':
      page = <NotificationsPage />; break
    case 'dashboard':
      page = <DashboardPage />; break
    case 'profile':
      page = <ProfilePage />; break
    case 'admin':
      page = <AdminPage />; break
    case 'search':
      page = <SearchPage />; break
    case 'about':
      page = <StaticPage which="about" />; break
    case 'contact':
      page = <StaticPage which="contact" />; break
    case 'integrity':
      page = <StaticPage which="integrity" />; break
    case 'privacy':
      page = <StaticPage which="privacy" />; break
    case 'terms':
      page = <StaticPage which="terms" />; break
    case 'applications':
    case 'teams':
    case 'contributions':
      page = <StaticPage which={path as any} />; break
    default:
      page = <NotFoundPage />; break
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AutoLogout />
      {process.env.NEXT_PUBLIC_DB_MODE === 'demo' && (
        <div className="bg-accent text-accent-foreground text-xs sm:text-sm text-center px-4 py-2">
          Preview mode: the permanent database is not connected yet, so accounts and posts you add may be reset.
        </div>
      )}
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<Loader />}>
          {page}
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
