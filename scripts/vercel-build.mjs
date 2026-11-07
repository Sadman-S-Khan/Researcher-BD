// Build script used on Vercel (and by `npm run build`).
//
// Database modes
//  • postgres — DATABASE_URL (or POSTGRES_PRISMA_URL, set by the Neon/Vercel Postgres integration)
//    is a postgres:// URL. The Prisma schema is switched to PostgreSQL, the schema is pushed
//    (non-destructive: the build fails instead of dropping data), and empty tables are seeded.
//  • demo — no Postgres configured. A seeded SQLite file is built into the deployment and copied
//    to /tmp at runtime. Everything works, but data written by users is NOT durable
//    (it resets whenever Vercel starts a fresh instance). Connect a Postgres database for real use.
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const env = { ...process.env }
const pgUrl = [env.DATABASE_URL, env.POSTGRES_PRISMA_URL, env.POSTGRES_URL].find((u) => u && /^postgres(ql)?:\/\//.test(u))
const run = (cmd, extra = {}) => execSync(cmd, { stdio: 'inherit', env: { ...env, ...extra } })

const schemaPath = path.resolve('prisma/schema.prisma')
let schema = fs.readFileSync(schemaPath, 'utf8')

if (pgUrl) {
  const direct = env.DATABASE_URL_UNPOOLED || env.DIRECT_URL || env.POSTGRES_URL_NON_POOLING || pgUrl
  schema = schema
    .replace(/provider\s*=\s*"sqlite"/, 'provider  = "postgresql"')
    .replace(/url\s*=\s*env\("DATABASE_URL"\)/, 'url       = env("DATABASE_URL")\n  directUrl = env("RBD_DIRECT_URL")')
  fs.writeFileSync(schemaPath, schema)
  env.DATABASE_URL = pgUrl
  env.RBD_DIRECT_URL = direct
  env.NEXT_PUBLIC_DB_MODE = 'postgres'
  console.log('[build] Database mode: postgres')
  run('npx prisma generate')
  run('npx prisma db push --skip-generate')
  run('node scripts/seed.mjs')
} else {
  const tpl = path.resolve('prisma/template.db')
  fs.rmSync(tpl, { force: true })
  env.DATABASE_URL = 'file:' + tpl
  env.NEXT_PUBLIC_DB_MODE = env.VERCEL ? 'demo' : 'local'
  console.log('[build] Database mode: ' + env.NEXT_PUBLIC_DB_MODE + ' (SQLite template at prisma/template.db)')
  run('npx prisma generate')
  run('npx prisma db push --skip-generate')
  run('node scripts/seed.mjs')
}

run('npx next build')
