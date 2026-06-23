import { createServerFn } from '@tanstack/react-start'
import { and, count, eq, sql } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../../db/index'
import { galleryImage, invitation, member } from '../../db/schema'

export const getOrgStats = createServerFn({ method: 'GET' }).handler(async ({ data }) => {
  const { organizationId } = z.object({ organizationId: z.string() }).parse(data)

  // Get members count
  const [memberRes] = await db
    .select({ count: count() })
    .from(member)
    .where(eq(member.organizationId, organizationId))

  // Get gallery stats
  const [galleryStats] = await db
    .select({
      count: count(),
      totalSize: sql<number>`COALESCE(SUM(CAST(${galleryImage.size} AS BIGINT)), 0)`,
    })
    .from(galleryImage)
    .where(eq(galleryImage.organizationId, organizationId))
  // Get pending invitations count
  const [invitationRes] = await db
    .select({ count: count() })
    .from(invitation)
    .where(and(eq(invitation.organizationId, organizationId), eq(invitation.status, 'pending')))

  return {
    memberCount: memberRes.count,
    pendingInvitationCount: invitationRes.count,
    imageCount: galleryStats.count,
    totalSizeBytes: Number(galleryStats.totalSize),
  }
})
