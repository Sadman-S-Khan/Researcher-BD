import { PrismaClient } from '@prisma/client'
import fs from 'node:fs'
import path from 'node:path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Resolve the connection URL.
// • Postgres (DATABASE_URL / POSTGRES_PRISMA_URL) is used as-is.
// • Demo mode on Vercel: the build ships a seeded SQLite file (prisma/template.db). The deployment
//   filesystem is read-only, so it is copied to /tmp on cold start. Data written there is not durable.
function resolveDatabaseUrl(): string | undefined {
  const pg = [process.env.DATABASE_URL, process.env.POSTGRES_PRISMA_URL, process.env.POSTGRES_URL].find(
    (u) => u && /^postgres(ql)?:\/\//.test(u),
  )
  if (pg) {
    // Neon/PgBouncer pooled connections: Prisma needs pgbouncer=true; allow time for Neon cold starts.
    try {
      const u = new URL(pg)
      if (u.hostname.includes('-pooler') && !u.searchParams.has('pgbouncer')) u.searchParams.set('pgbouncer', 'true')
      if (!u.searchParams.has('connect_timeout')) u.searchParams.set('connect_timeout', '15')
      return u.toString()
    } catch {
      return pg
    }
  }
  if (process.env.VERCEL || process.env.NEXT_PUBLIC_DB_MODE === 'demo') {
    const target = '/tmp/researcher-bd.db'
    try {
      if (!fs.existsSync(target)) {
        const tpl = path.join(process.cwd(), 'prisma', 'template.db')
        fs.copyFileSync(tpl, target)
      }
      return 'file:' + target
    } catch (e) {
      console.error('[db] could not prepare demo SQLite database', e)
    }
  }
  return process.env.DATABASE_URL
}

const resolvedUrl = resolveDatabaseUrl()

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: resolvedUrl,
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['warn', 'error'],
  })

globalForPrisma.prisma = db

// Case-insensitive "contains" filter. SQLite LIKE is already case-insensitive for ASCII;
// PostgreSQL needs mode: 'insensitive'. Typed loosely because the generated client differs by provider.
const IS_POSTGRES = /^postgres(ql)?:\/\//.test(resolvedUrl ?? '')
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ci(value: string): any {
  return IS_POSTGRES ? { contains: value, mode: 'insensitive' } : { contains: value }
}
