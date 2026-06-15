import type { User } from 'better-auth'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useSession } from '../../../lib/auth-client'
import { UserAvatar } from './user-avatar'

interface UserViewProps {
  className?: string
  isPending?: boolean
  user?: User & { username?: string | null; displayUsername?: string | null }
}

export function UserView({ className, isPending, user }: UserViewProps) {
  const { data: session, isPending: sessionPending } = useSession()

  const resolvedUser = user ?? session?.user

  if ((isPending || sessionPending) && !user) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <UserAvatar isPending />
        <div className="grid flex-1 gap-1 text-left text-sm">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <UserAvatar />
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium text-foreground">
          {resolvedUser?.name || resolvedUser?.email}
        </span>
        {resolvedUser?.name && (
          <span className="text-muted-foreground truncate text-xs">{resolvedUser?.email}</span>
        )}
      </div>
    </div>
  )
}
