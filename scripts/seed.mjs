// Seeds the database pointed to by DATABASE_URL with demo data (only empty tables are filled).
import { PrismaClient } from '@prisma/client'
import { seedDemoData } from '../src/lib/seed.mjs'

const db = new PrismaClient()
try {
  await seedDemoData(db, {
    adminPassword: process.env.SEED_ADMIN_PASSWORD || undefined,
    adminEmail: process.env.ADMIN_EMAIL || undefined,
    log: (m) => console.log('[seed]', m),
  })
  console.log('[seed] users:', await db.user.count(), 'opportunities:', await db.opportunity.count())
} finally {
  await db.$disconnect()
}
