import { createServerFn } from '@tanstack/react-start'
import { and, count, eq, sql } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../../db/index'
import { galleryImage, invitation, member, project, projectFile } from '../../db/schema'

export const getOrgStats = createServerFn({ method: 'GET' }).handler(async ({ data }) => {
  const { organizationId } = z.object({ organizationId: z.string() }).parse(data)

  // Get members count
  const [memberRes] = await db
    .select({ count: count() })
    .from(member)
    .where(eq(member.organizationId, organizationId))

  // Get project files stats
  const [projectStats] = await db
    .select({
      count: count(),
      totalSize: sql<number>`COALESCE(SUM(${projectFile.size}), 0)`,
    })
    .from(projectFile)
    .innerJoin(project, eq(projectFile.projectId, project.id))
    .where(eq(project.organizationId, organizationId))
  // Get pending invitations count
  const [invitationRes] = await db
    .select({ count: count() })
    .from(invitation)
    .where(and(eq(invitation.organizationId, organizationId), eq(invitation.status, 'pending')))

  return {
    memberCount: memberRes.count,
    pendingInvitationCount: invitationRes.count,
    imageCount: projectStats.count,
    totalSizeBytes: Number(projectStats.totalSize),
  }
})
