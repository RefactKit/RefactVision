import type { User } from 'better-auth'
import { User2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useSession } from '../../../lib/auth-client'

interface UserAvatarProps {
  className?: string
  isPending?: boolean
  user?: User & { username?: string | null; displayUsername?: string | null }
}

export function UserAvatar({ className, isPending, user }: UserAvatarProps) {
  const { data: session, isPending: sessionPending } = useSession()

  if ((isPending || sessionPending) && !user) {
    return <Skeleton className={cn('size-8 rounded-full', className)} />
  }

  const resolvedUser = user ?? session?.user
  const initials = (resolvedUser?.name || resolvedUser?.email || '')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <Avatar className={cn('size-8 rounded-full', className)}>
      <AvatarImage src={resolvedUser?.image ?? undefined} alt={resolvedUser?.name || ''} />
      <AvatarFallback className="rounded-full bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold">
        {initials || <User2 className="size-4" />}
      </AvatarFallback>
    </Avatar>
  )
}
