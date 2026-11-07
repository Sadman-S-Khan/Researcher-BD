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
  if (pg) return pg
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

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: resolveDatabaseUrl(),
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['warn', 'error'],
  })

globalForPrisma.prisma = db
