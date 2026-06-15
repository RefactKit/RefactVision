import { createFileRoute, redirect } from '@tanstack/react-router'
import { userOrgsQuery } from '@/server/query-keys'

export const Route = createFileRoute('/_app/dashboard')({
  loader: async ({ context }) => {
    const { orgs } = await context.queryClient.ensureQueryData(userOrgsQuery())
    if (orgs.length === 0) throw redirect({ to: '/onboarding' })

    throw redirect({
      to: '/organizations/$slug/dashboard',
      params: { slug: orgs[0]?.slug },
      search: { page: 1 },
    })
  },
})
