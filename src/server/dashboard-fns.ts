import { createServerFn } from '@tanstack/react-start'
import { and, count, eq, sql } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../../db/index'
import { invitation, member, project, projectFile } from '../../db/schema'

export const getOrgStats = createServerFn({ method: 'GET' }).handler(async ({ data }) => {
  const { organizationId } = z.object({ organizationId: z.string() }).parse(data)

  // Get members count
  const [memberRes] = await db
    .select({ count: count() })
    .from(member)
    .where(eq(member.organizationId, organizationId))

  // Get detailed files stats
  const [detailedStats] = await db
    .select({
      totalCount: count(),
      totalSize: sql<number>`COALESCE(SUM(${projectFile.size}), 0)`,
      datasetSize: sql<number>`COALESCE(SUM(CASE WHEN ${projectFile.name} NOT LIKE '%.pt' THEN ${projectFile.size} ELSE 0 END), 0)`,
      modelSize: sql<number>`COALESCE(SUM(CASE WHEN ${projectFile.name} LIKE '%.pt' THEN ${projectFile.size} ELSE 0 END), 0)`,
      modelsCount: sql<number>`COUNT(CASE WHEN ${projectFile.name} LIKE '%.pt' THEN 1 END)`,
      imagesCount: sql<number>`COUNT(CASE WHEN ${projectFile.mimeType} LIKE 'image/%' THEN 1 END)`,
    })
    .from(projectFile)
    .innerJoin(project, eq(projectFile.projectId, project.id))
    .where(eq(project.organizationId, organizationId))

  // Get project count
  const [projectCountRes] = await db
    .select({ count: count() })
    .from(project)
    .where(eq(project.organizationId, organizationId))

  // Get pending invitations count
  const [invitationRes] = await db
    .select({ count: count() })
    .from(invitation)
    .where(and(eq(invitation.organizationId, organizationId), eq(invitation.status, 'pending')))

  // Get top 5 largest files
  const largestFiles = await db
    .select({
      id: projectFile.id,
      name: projectFile.name,
      size: projectFile.size,
      url: projectFile.url,
      mimeType: projectFile.mimeType,
    })
    .from(projectFile)
    .innerJoin(project, eq(projectFile.projectId, project.id))
    .where(eq(project.organizationId, organizationId))
    .orderBy(sql`${projectFile.size} DESC`)
    .limit(5)

  return {
    memberCount: memberRes.count,
    pendingInvitationCount: invitationRes.count,
    imageCount: detailedStats.imagesCount,
    totalSizeBytes: Number(detailedStats.totalSize),
    datasetSizeBytes: Number(detailedStats.datasetSize),
    modelSizeBytes: Number(detailedStats.modelSize),
    modelsCount: detailedStats.modelsCount,
    projectCount: projectCountRes.count,
    largestFiles,
  }
})
