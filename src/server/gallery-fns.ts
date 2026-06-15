import { createServerFn } from '@tanstack/react-start'
import { count, desc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../../db/index'
import { galleryImage } from '../../db/schema'

export const getGalleryImages = createServerFn({ method: 'GET' }).handler(async ({ data }) => {
  const {
    orgId,
    page: rawPage,
    limit: rawLimit,
  } = z
    .object({
      orgId: z.string(),
      page: z.number().optional(),
      limit: z.number().optional(),
    })
    .parse(data)

  const page = rawPage ?? 1
  const limit = rawLimit ?? 20
  const offset = (page - 1) * limit

  const [totalCount] = await db
    .select({ value: count() })
    .from(galleryImage)
    .where(eq(galleryImage.organizationId, orgId))

  const images = await db
    .select()
    .from(galleryImage)
    .where(eq(galleryImage.organizationId, orgId))
    .orderBy(desc(galleryImage.createdAt))
    .limit(limit)
    .offset(offset)

  return {
    images,
    totalCount: totalCount.value,
    totalPages: Math.ceil(totalCount.value / limit),
  }
})
