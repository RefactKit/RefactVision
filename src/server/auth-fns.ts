import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../../db'
import { user } from '../../db/schema'
import { auth } from '../../lib/auth'

export const getServerSession = createServerFn({ method: 'GET' }).handler(async () => {
  const request = getRequest()
  const session = await auth.api.getSession({ headers: request.headers })
  return { session }
})

export const updateUser = createServerFn({ method: 'POST' }).handler(async ({ data }) => {
  const { name, imageUrl } = z
    .object({
      name: z.string().min(1).optional(),
      imageUrl: z.string().optional(),
    })
    .parse(data)

  const request = getRequest()
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) throw new Error('Unauthorized')

  await db
    .update(user)
    .set({
      ...(name && { name }),
      ...(imageUrl !== undefined && { imageUrl, image: imageUrl }),
    })
    .where(eq(user.id, session.user.id))

  return { success: true }
})
