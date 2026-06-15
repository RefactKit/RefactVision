import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { authClient } from '../../lib/auth-client'

export const Route = createFileRoute('/logout')({
  component: LogoutComponent,
})

function LogoutComponent() {
  const navigate = useNavigate()

  useEffect(() => {
    async function handleLogout() {
      try {
        await authClient.signOut()
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        navigate({ to: '/login', replace: true })
      }
    }
    handleLogout()
  }, [navigate])

  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-950">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-900 dark:text-white">Signing out</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Please wait while we secure your session...
          </p>
        </div>
      </div>
    </div>
  )
}
