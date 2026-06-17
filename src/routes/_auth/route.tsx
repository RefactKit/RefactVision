import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { getServerSession } from '@/server/auth-fns'

export const Route = createFileRoute('/_auth')({
  loader: async ({ location }) => {
    if (location.pathname === '/') return {}
    const { session } = await getServerSession()
    if (session) throw redirect({ to: '/dashboard' })
    return {}
  },
  component: () => <Outlet />,
})
