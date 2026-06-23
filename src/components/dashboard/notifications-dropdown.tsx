import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useI18n } from '@/i18n/context'
import { userNotificationsQuery } from '@/server/query-keys'
import { markAllNotificationsRead } from '@/server/notification-fns'
import type { NotificationType } from '@/server/notification-fns'
import { Bell, Check, Shield, UserCheck, UserMinus, UserPlus, UserX, Users } from 'lucide-react'

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const date = new Date(dateStr).getTime()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

const NOTIFICATION_ICONS: Record<NotificationType, React.ElementType> = {
  invitation_received: UserPlus,
  member_joined: UserCheck,
  invitation_rejected: UserX,
  member_added: Users,
  member_removed: UserMinus,
  role_changed: Shield,
}

function getNotificationText(type: NotificationType, t: Record<string, any>): string {
  const map: Record<NotificationType, string> = {
    invitation_received: t.notifications?.invitedYou ?? 'invited you to join',
    member_joined: t.notifications?.memberJoined ?? 'joined',
    invitation_rejected: t.notifications?.invitationRejected ?? 'declined the invitation to',
    member_added: t.notifications?.memberAdded ?? 'You were added to',
    member_removed: t.notifications?.memberRemoved ?? 'You were removed from',
    role_changed: t.notifications?.roleChanged ?? 'Your role was changed in',
  }
  return map[type]
}

export function NotificationsDropdown() {
  const { t } = useI18n()
  const queryClient = useQueryClient()

  const { data } = useQuery({
    ...userNotificationsQuery(),
    refetchInterval: 15_000,
    refetchOnMount: true,
  })

  const notifications = data?.notifications ?? []
  const unreadCount = data?.unreadCount ?? 0

  const markAllRead = useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-notifications'] })
    },
  })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon-sm" className="rounded-full" />}
      >
        <div className="relative">
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2 rounded-full bg-red-400 ring-1.5 ring-background">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            </span>
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" sideOffset={8}>
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center justify-between">
            <span className="font-semibold text-sm">
              {t.sidebar?.notifications ?? 'Notifications'}
            </span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllRead.mutate()}
                className="text-primary text-xs font-medium hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Check className="size-3" />
                {t.notifications?.markAllRead ?? 'Mark all read'}
              </button>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup className="max-h-[300px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {t.notifications?.empty ?? 'No recent activity'}
              </div>
            ) : (
              notifications.map((n) => {
                const Icon = NOTIFICATION_ICONS[n.type] || Bell
                const description = getNotificationText(n.type, t)
                const isSelfAction =
                  n.type === 'member_added' ||
                  n.type === 'member_removed' ||
                  n.type === 'role_changed'

                return (
                  <DropdownMenuItem
                    key={n.id}
                    className="flex items-start gap-3 py-3 px-3 cursor-pointer"
                  >
                    {n.actorImage ? (
                      <Avatar className="mt-0.5 size-8 shrink-0">
                        <AvatarImage src={n.actorImage} alt={n.actorName || ''} />
                        <AvatarFallback className="text-[10px]">
                          {getInitials(n.actorName || '?')}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                        <Icon className="size-4 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col gap-0.5">
                      <p className="text-sm leading-snug">
                        {isSelfAction ? (
                          <>
                            <span className="text-muted-foreground">{description}</span>{' '}
                            <span className="font-semibold">{n.organizationName}</span>
                            {n.type === 'role_changed' && n.metadata?.newRole && (
                              <span className="text-muted-foreground"> ({n.metadata.newRole})</span>
                            )}
                          </>
                        ) : (
                          <>
                            <span className="font-semibold">{n.actorName}</span>{' '}
                            <span className="text-muted-foreground">{description}</span>{' '}
                            <span className="font-semibold">{n.organizationName}</span>
                          </>
                        )}
                      </p>
                      <span className="text-[11px] text-muted-foreground/70 font-medium">
                        {timeAgo(n.createdAt)}
                      </span>
                    </div>
                    {!n.read && <span className="bg-primary mt-2 size-2 shrink-0 rounded-full" />}
                  </DropdownMenuItem>
                )
              })
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="justify-center text-xs font-medium text-muted-foreground hover:text-foreground py-2 cursor-pointer">
            {t.notifications?.viewAll ?? 'View all notifications'}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
