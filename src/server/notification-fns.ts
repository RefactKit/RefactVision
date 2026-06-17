/**
 * Notification server functions (exposed to client via TanStack Start RPC).
 * These use createServerFn which handles server/client code splitting automatically.
 * Do NOT import notification-helpers.ts here — it contains server-only code.
 */
import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { and, desc, eq, lt } from 'drizzle-orm'
import { z } from 'zod'
import { notification } from '../../db/schema'
import { db } from '../../db/index'

// ── Shared type (safe for client import) ─────────────────────────────────────

export type NotificationType =
  | 'invitation_received'
  | 'member_joined'
  | 'invitation_rejected'
  | 'member_added'
  | 'member_removed'
  | 'role_changed'

// ── Lazy TTL cleanup ─────────────────────────────────────────────────────────

let lastCleanup = 0
const ONE_DAY = 86_400_000

async function maybeCleanup() {
  if (Date.now() - lastCleanup > ONE_DAY) {
    lastCleanup = Date.now()
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    db.delete(notification)
      .where(and(eq(notification.read, true), lt(notification.createdAt, ninetyDaysAgo)))
      .then(() => console.log('[CLEANUP] Purged old read notifications'))
      .catch(console.error)
  }
}

// ── Server functions ─────────────────────────────────────────────────────────

/** Get the latest 20 notifications for the current user */
export const getUserNotifications = createServerFn({ method: 'GET' }).handler(async () => {
  const { db } = await import('../../db/index')
  const { notification } = await import('../../db/schema')
  const { auth } = await import('../../lib/auth')

  const request = getRequest()
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) return { notifications: [], unreadCount: 0 }

  // Fire-and-forget TTL cleanup
  maybeCleanup()

  const items = await db.query.notification.findMany({
    where: eq(notification.recipientId, session.user.id),
    orderBy: [desc(notification.createdAt)],
    limit: 20,
  })

  // Fetch pending invitations for the user
  const { invitation } = await import('../../db/schema')
  const pendingInvitations = await db.query.invitation.findMany({
    where: and(eq(invitation.email, session.user.email), eq(invitation.status, 'pending')),
    with: {
      organization: true,
      user: true, // Inviter
    },
  })

  const unreadCount = items.filter((n) => !n.read).length

  return {
    notifications: items.map((n) => ({
      id: n.id,
      type: n.type as NotificationType,
      actorName: n.actorName,
      actorImage: n.actorImage,
      organizationName: n.organizationName,
      metadata: n.metadata ? JSON.parse(n.metadata) : null,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
    })),
    invitations: pendingInvitations.map((inv) => ({
      id: inv.id,
      organizationName: inv.organization?.name || 'Unknown',
      inviterName: inv.user?.name || 'Someone',
      inviterImage: inv.user?.image || null,
      createdAt: inv.createdAt.toISOString(),
    })),
    unreadCount: unreadCount + pendingInvitations.length, // Treat pending invitations as unread
  }
})

/** Mark a single notification as read */
export const markNotificationRead = createServerFn({ method: 'POST' }).handler(async ({ data }) => {
  const { db } = await import('../../db/index')
  const { notification } = await import('../../db/schema')
  const { auth } = await import('../../lib/auth')

  const { notificationId } = z.object({ notificationId: z.string() }).parse(data)
  const request = getRequest()
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) throw new Error('Unauthorized')

  await db
    .update(notification)
    .set({ read: true })
    .where(and(eq(notification.id, notificationId), eq(notification.recipientId, session.user.id)))

  return { success: true }
})

/** Mark all notifications as read for the current user */
export const markAllNotificationsRead = createServerFn({ method: 'POST' }).handler(async () => {
  const { db } = await import('../../db/index')
  const { notification } = await import('../../db/schema')
  const { auth } = await import('../../lib/auth')

  const request = getRequest()
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) throw new Error('Unauthorized')

  await db
    .update(notification)
    .set({ read: true })
    .where(and(eq(notification.recipientId, session.user.id), eq(notification.read, false)))

  return { success: true }
})
