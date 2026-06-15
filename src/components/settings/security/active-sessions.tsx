import { useAuth } from '@better-auth-ui/react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { authClient, useSession } from '../../../../lib/auth-client'
import { ActiveSession } from './active-session'

interface ActiveSessionsProps {
  className?: string
}

export function ActiveSessions({ className }: ActiveSessionsProps) {
  const { localization } = useAuth()
  const { data: session } = useSession()

  const { data: sessions, isPending: isSessionsPending } = useQuery({
    queryKey: ['active-sessions'],
    queryFn: async () => {
      const { data, error } = await authClient.listSessions()
      if (error) throw error
      return data
    },
  })

  const { data: accounts, isPending: isAccountsPending } = useQuery({
    queryKey: ['user-accounts'],
    queryFn: async () => {
      const { data, error } = await authClient.listAccounts()
      if (error) throw error
      return data
    },
  })

  const isPending = isSessionsPending || isAccountsPending
  const activeSessions = (sessions ?? []).sort((s) => (s.id === session?.session.id ? -1 : 1))
  const providers = accounts?.map((a) => a.providerId) || []

  const handleRevokeOthers = async () => {
    const { error } = await authClient.revokeOtherSessions()
    if (error) toast.error(error.message)
    else toast.success(localization.settings.revokeSessionSuccess)
  }

  const handleRevokeAll = async () => {
    const { error } = await authClient.revokeSessions()
    if (error) toast.error(error.message)
    else toast.success(localization.settings.revokeSessionSuccess)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">{localization.settings.activeSessions}</h2>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-[10px] uppercase font-semibold"
            onClick={handleRevokeOthers}
          >
            Revoke Others
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-[10px] uppercase font-semibold text-destructive hover:text-destructive"
            onClick={handleRevokeAll}
          >
            Revoke All
          </Button>
        </div>
      </div>

      <div className="grid gap-3">
        {isPending ? (
          <SessionRowSkeleton />
        ) : (
          activeSessions.map((activeSession) => (
            <ActiveSession
              key={activeSession.id}
              activeSession={activeSession}
              providers={providers}
            />
          ))
        )}
      </div>
    </div>
  )
}

function SessionRowSkeleton() {
  return (
    <Card className="bg-transparent border-0 ring-0 shadow-none">
      <CardContent className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-md" />
        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-32" />
        </div>
      </CardContent>
    </Card>
  )
}
