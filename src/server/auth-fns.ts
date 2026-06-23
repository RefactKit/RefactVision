import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

export const getServerSession = createServerFn({ method: 'GET' }).handler(async () => {
  return {
    session: {
      session: { id: 'Z7TOkT4WXVVYeHwwxXZ2F2LkXG8ZWkQn', token: 'demo-token' },
      user: { id: 'Z7TOkT4WXVVYeHwwxXZ2F2LkXG8ZWkQn', name: 'Demo User', email: 'demo@demo.com', image: null, emailVerified: true },
    },
  }
})

export const updateUser = createServerFn({ method: 'POST' }).handler(async ({ data }) => {
  const { name, imageUrl } = z
    .object({
      name: z.string().min(1).optional(),
      imageUrl: z.string().optional(),
    })
    .parse(data)

  return { success: true }
})