// Seeds Researcher BD with its real starter content (see ./seed-content.mjs).
// Plain JavaScript (no TS syntax) so it runs both inside Next.js and from `node scripts/seed.mjs`
// during the Vercel build. Each table is only filled when empty, so re-running is safe and
// never overwrites records that people or moderators have changed.
import bcrypt from 'bcryptjs'
import {
  CHECKED_AT, CONFERENCES, JOURNALS, FUNDING, OPPORTUNITIES, ORGANIZATIONS, DATASETS, EVENTS,
  LEARNING_CATEGORIES, LESSONS, LEARNING_PATHS, DISCUSSION_CATEGORIES,
} from './seed-content.mjs'

const DEMO_DOMAIN = '@demo.researcherbd.org'

// Remove fictional records left over from the old demonstration build.
async function purgeDemoContent(db, log) {
  const byTitle = { startsWith: '[Demo]' }
  const steps = [
    () => db.question.deleteMany({ where: { title: byTitle } }),
    () => db.collaborationPost.deleteMany({ where: { title: byTitle } }),
    () => db.researchProject.deleteMany({ where: { title: byTitle } }),
    () => db.laboratory.deleteMany({ where: { name: byTitle } }),
    () => db.organization.deleteMany({ where: { name: byTitle } }),
    () => db.opportunity.deleteMany({ where: { title: byTitle } }),
    () => db.fundingCall.deleteMany({ where: { title: byTitle } }),
    () => db.journal.deleteMany({ where: { title: byTitle } }),
    () => db.conference.deleteMany({ where: { title: byTitle } }),
    () => db.dataset.deleteMany({ where: { title: byTitle } }),
    () => db.academicEvent.deleteMany({ where: { title: byTitle } }),
    () => db.user.deleteMany({ where: { email: { endsWith: DEMO_DOMAIN } } }),
  ]
  for (const step of steps) {
    try {
      const r = await step()
      if (r.count) log(`removed ${r.count} demo record(s)`)
    } catch (e) {
      log('demo purge step skipped: ' + (e && e.message ? e.message.split('\n')[0] : e))
    }
  }
}

async function ensureAdmin(db, { adminEmail, adminPassword, log }) {
  if (!adminEmail) return null
  const email = adminEmail.trim().toLowerCase()
  const existing = await db.user.findUnique({ where: { email } })
  if (existing) {
    if (existing.role !== 'ADMIN') await db.user.update({ where: { email }, data: { role: 'ADMIN' } })
    return existing
  }
  if (!adminPassword) {
    log('ADMIN_EMAIL set but no SEED_ADMIN_PASSWORD: register with that email, then redeploy to promote it')
    return null
  }
  const admin = await db.user.create({
    data: { email, name: 'Site Administrator', passwordHash: await bcrypt.hash(adminPassword, 10), role: 'ADMIN', isEmailVerified: true },
  })
  await db.profile.create({ data: { userId: admin.id } })
  log('created admin account ' + email)
  return admin
}

// Insert rows whose key (title/name) is not in the table yet. Existing rows are never modified,
// so moderator edits survive and new starter content still appears on later deploys.
async function addMissing(model, rows, log, name, key = 'title') {
  const existing = new Set((await model.findMany({ select: { [key]: true } })).map(r => r[key]))
  const missing = rows.filter(r => !existing.has(r[key]))
  for (const data of missing) await model.create({ data })
  if (missing.length) log(`added ${missing.length} ${name}`)
}

async function fillIfEmpty(model, rows, log, name) {
  if ((await model.count()) > 0) return
  for (const data of rows) await model.create({ data })
  log(`added ${rows.length} ${name}`)
}

export async function seedDemoData(db, { adminPassword, adminEmail, log = () => {} } = {}) {
  await purgeDemoContent(db, log)
  const admin = await ensureAdmin(db, { adminEmail, adminPassword, log })

  await addMissing(db.conference, CONFERENCES.map(c => ({ ...c, lastCheckedAt: CHECKED_AT })), log, 'conferences')
  await addMissing(db.journal, JOURNALS.map(j => ({ ...j, lastCheckedAt: CHECKED_AT })), log, 'journals')
  await addMissing(db.fundingCall, FUNDING, log, 'funding calls')
  await addMissing(db.opportunity, OPPORTUNITIES, log, 'opportunities')
  await addMissing(db.dataset, DATASETS, log, 'datasets')
  await addMissing(db.academicEvent, EVENTS, log, 'events')

  if (admin) {
    await addMissing(db.organization, ORGANIZATIONS.map(o => ({ ...o, ownerId: admin.id })), log, 'organizations', 'name')
  }

  await fillIfEmpty(db.discussionCategory, DISCUSSION_CATEGORIES, log, 'discussion categories')

  if ((await db.lesson.count()) === 0) {
    if ((await db.learningCategory.count()) === 0) {
      for (const c of LEARNING_CATEGORIES) await db.learningCategory.create({ data: c })
    }
    const paths = {}
    if ((await db.learningPath.count()) === 0) {
      for (const p of LEARNING_PATHS) paths[p.slug] = await db.learningPath.create({ data: p })
    }
    const pathFor = (slug) => {
      if (['intro-to-research', 'research-questions', 'literature-search', 'descriptive-statistics', 'python-for-research'].includes(slug)) return paths['first-research-project']?.id
      return paths['publishing-responsibly']?.id
    }
    let order = 0
    for (const l of LESSONS) {
      const cat = await db.learningCategory.findUnique({ where: { slug: l.category } })
      await db.lesson.create({
        data: { ...l, categoryId: cat?.id ?? null, pathId: pathFor(l.slug) ?? null, order: order++ },
      })
    }
    log(`added ${LESSONS.length} lessons`)
  }
}

export { seedDemoData as seedContent }
