import { db } from '@/lib/db'

/**
 * Create a notification for a user, respecting their notification preferences.
 * If the user has disabled this notification type, the notification is not created.
 */
export async function createNotification(params: {
  userId: string
  type: string
  title: string
  body?: string
  link?: string
}) {
  const user = await db.user.findUnique({
    where: { id: params.userId },
    select: { notifTypes: true, isBanned: true },
  })
  if (!user || user.isBanned) return null

  // Check if user has this notification type enabled
  const enabledTypes = user.notifTypes ? user.notifTypes.split(',').filter(Boolean) : []
  if (enabledTypes.length > 0 && !enabledTypes.includes(params.type)) {
    return null // user has disabled this type
  }

  return db.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      body: params.body,
      link: params.link,
    },
  })
}

/**
 * Personalized alerts — when a new discovery record matches a user's research
 * interests or saved searches, create an "opportunity-match" notification.
 *
 * Matching logic:
 * - For each user with researchInterests set in their profile
 * - If any of their interest keywords appear in the new record's title, domain, or description
 * - Create an opportunity-match notification (if they have that type enabled)
 *
 * Called from the POST handlers of opportunities, datasets, and events.
 * Best-effort — failures are swallowed so they don't block the submission.
 */
export async function notifyMatchingUsers(
  entityType: 'opportunity' | 'dataset' | 'event',
  record: { id: string; title: string; researchDomain?: string | null; type?: string | null; description?: string | null }
) {
  try {
    // Find all users who have research interests set
    const users = await db.user.findMany({
      where: {
        isBanned: false,
        profile: { researchInterests: { not: null } },
      },
      select: { id: true, profile: { select: { researchInterests: true } } },
    })

    const haystack = `${record.title} ${record.researchDomain ?? ''} ${record.description ?? ''}`.toLowerCase()

    for (const user of users) {
      const interests = user.profile?.researchInterests
      if (!interests) continue
      // Split interests by comma, take first 5 keywords
      const keywords = interests.split(',').map(s => s.trim().toLowerCase()).filter(Boolean).slice(0, 5)
      const matched = keywords.some(kw => haystack.includes(kw))
      if (!matched) continue

      await createNotification({
        userId: user.id,
        type: 'opportunity-match',
        title: `New ${entityType} matches your interests`,
        body: record.title,
        link: `#/${entityType === 'opportunity' ? 'opportunities' : entityType + 's'}/${record.id}`,
      })
    }
  } catch (e) {
    // Best-effort — log but don't throw
    console.error('[alerts] notifyMatchingUsers failed:', e)
  }
}
