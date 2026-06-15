import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { orgBySlugQuery } from '@/server/query-keys'

export const Route = createFileRoute('/_app/organizations/$slug')({
  loader: async ({ params, context }) => {
    // Session is already verified by the parent _app layout.
    // getOrgBySlug also checks session internally.
    const { org, role } = await context.queryClient.ensureQueryData(orgBySlugQuery(params.slug))
    if (!org) throw redirect({ to: '/organizations' })

    return { org, role }
  },
  component: () => <Outlet />,
})
