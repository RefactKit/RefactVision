/**
 * Server-only notification helpers.
 * These functions are ONLY imported by lib/auth.ts (server-side hooks).
 * They must NEVER be imported from client-side code.
 */
import { and, eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { db } from '../../db/index'
import { member, notification, user } from '../../db/schema'

// ── Types ────────────────────────────────────────────────────────────────────

export type NotificationType =
  | 'invitation_received'
  | 'member_joined'
  | 'invitation_rejected'
  | 'member_added'
  | 'member_removed'
  | 'role_changed'

interface CreateNotificationParams {
  recipientId?: string
  recipientEmail?: string
  type: NotificationType
  actorId?: string
  actorName?: string
  actorImage?: string | null
  organizationId?: string
  organizationName?: string
  metadata?: Record<string, string>
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Create a single notification row */
export async function createNotification(params: CreateNotificationParams) {
  let recipientId = params.recipientId

  // If we only have an email, look up the user
  if (!recipientId && params.recipientEmail) {
    const existingUser = await db.query.user.findFirst({
      where: eq(user.email, params.recipientEmail),
    })
    if (!existingUser) return // User doesn't exist yet — they'll get the email
    recipientId = existingUser.id
  }

  if (!recipientId) return

  await db.insert(notification).values({
    id: nanoid(),
    recipientId,
    type: params.type,
    actorId: params.actorId,
    actorName: params.actorName,
    actorImage: params.actorImage,
    organizationId: params.organizationId,
    organizationName: params.organizationName,
    metadata: params.metadata ? JSON.stringify(params.metadata) : null,
    read: false,
  })
}

/** Create notifications for all admins/owners of an organization */
export async function notifyOrgAdmins(params: {
  organizationId: string
  excludeUserId?: string
  type: NotificationType
  actorId?: string
  actorName?: string
  actorImage?: string | null
  organizationName?: string
  metadata?: Record<string, string>
}) {
  // Find all members of this org
  const admins = await db.query.member.findMany({
    where: eq(member.organizationId, params.organizationId),
  })

  const recipients = admins.filter(
    (m) => (m.role === 'admin' || m.role === 'owner') && m.userId !== params.excludeUserId,
  )

  // Batch insert notifications
  if (recipients.length === 0) return

  await db.insert(notification).values(
    recipients.map((r) => ({
      id: nanoid(),
      recipientId: r.userId,
      type: params.type,
      actorId: params.actorId,
      actorName: params.actorName,
      actorImage: params.actorImage,
      organizationId: params.organizationId,
      organizationName: params.organizationName,
      metadata: params.metadata ? JSON.stringify(params.metadata) : null,
      read: false,
    })),
  )
}
