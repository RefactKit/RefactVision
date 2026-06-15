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
import { authClient } from '../../../lib/auth-client'
import { toast } from 'sonner'
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
  const invitations = data?.invitations ?? []
  const unreadCount = data?.unreadCount ?? 0

  const markAllRead = useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-notifications'] })
    },
  })

  const handleAccept = async (id: string) => {
    const { error } = await authClient.organization.acceptInvitation({ invitationId: id })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Invitation accepted')
      queryClient.invalidateQueries({ queryKey: ['user-notifications'] })
      queryClient.invalidateQueries({ queryKey: ['organizations'] }) // Refresh org list if needed
    }
  }

  const handleReject = async (id: string) => {
    const { error } = await authClient.organization.rejectInvitation({ invitationId: id })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Invitation declined')
      queryClient.invalidateQueries({ queryKey: ['user-notifications'] })
    }
  }

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
            {notifications.length === 0 && invitations.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {t.notifications?.empty ?? 'No recent activity'}
              </div>
            ) : (
              <>
                {invitations.map((inv: any, index: number) => (
                  <div key={inv.id}>
                    <DropdownMenuItem
                      className="flex flex-col items-start gap-2 py-3 px-3 cursor-default focus:bg-transparent hover:bg-transparent"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <div className="relative mt-0.5">
                          {/* Unread dot */}
                          <span className="absolute -top-0.5 -left-0.5 size-2.5 bg-blue-500 rounded-full border-2 border-background z-10" />
                          {inv.inviterImage ? (
                            <Avatar className="size-8 shrink-0">
                              <AvatarImage src={inv.inviterImage} alt={inv.inviterName || ''} />
                              <AvatarFallback className="text-[10px]">
                                {getInitials(inv.inviterName || '?')}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                              <UserPlus className="size-4 text-muted-foreground" />
                            </div>
                          )}
                          {/* Small icon overlay */}
                          {inv.inviterImage && (
                            <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5 border-2 border-background z-10 text-white">
                              <Users className="size-2.5" />
                            </div>
                          )}
                        </div>

                        <div className="flex flex-1 flex-col gap-1 w-full">
                          <div className="flex justify-between items-start w-full gap-2">
                            <p className="text-sm leading-snug">
                              <span className="font-semibold">{inv.inviterName}</span>{' '}
                              <span className="text-muted-foreground">
                                {t.notifications?.invitedYou ?? 'invited you to join'}
                              </span>{' '}
                              <span className="font-semibold bg-secondary/50 border border-border/50 px-1.5 py-0.5 rounded-md inline-flex items-center gap-1.5 shadow-sm text-xs mt-0.5 align-middle">
                                <span className="text-primary text-[10px]">■</span>
                                {inv.organizationName}
                              </span>
                            </p>
                            <div className="flex flex-col items-end gap-0.5 shrink-0">
                              <span className="text-[11px] text-muted-foreground/70 font-medium">
                                {timeAgo(inv.createdAt)}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-2 w-fit mt-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs cursor-pointer shadow-none px-4 bg-muted/50 hover:bg-muted"
                              onClick={() => handleReject(inv.id)}
                            >
                              {t.common?.cancel ?? 'Cancel'}
                            </Button>
                            <Button
                              size="sm"
                              className="h-8 text-xs cursor-pointer px-4"
                              onClick={() => handleAccept(inv.id)}
                            >
                              {t.actions?.accept ?? 'Accept'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </DropdownMenuItem>

                    {/* Smooth Divider */}
                    {(index < invitations.length - 1 || notifications.length > 0) && (
                      <div className="w-[85%] mx-auto h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
                    )}
                  </div>
                ))}

                {notifications.map((n, index) => {
                  const Icon = NOTIFICATION_ICONS[n.type] || Bell

                  const description = getNotificationText(n.type, t)
                  const isSelfAction =
                    n.type === 'member_added' ||
                    n.type === 'member_removed' ||
                    n.type === 'role_changed'

                  return (
                    <div key={n.id}>
                      <DropdownMenuItem className="flex items-start gap-3 py-3 px-3 cursor-pointer">
                        <div className="relative mt-0.5">
                          {!n.read && (
                            <span className="absolute -top-0.5 -left-0.5 size-2.5 bg-blue-500 rounded-full border-2 border-background z-10" />
                          )}
                          {n.actorImage ? (
                            <Avatar className="size-8 shrink-0">
                              <AvatarImage src={n.actorImage} alt={n.actorName || ''} />
                              <AvatarFallback className="text-[10px]">
                                {getInitials(n.actorName || '?')}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                              <Icon className="size-4 text-muted-foreground" />
                            </div>
                          )}
                          {/* Small icon overlay for notifications as well */}
                          {n.actorImage && (
                            <div className="absolute -bottom-1 -right-1 bg-muted-foreground/20 text-muted-foreground rounded-full p-0.5 border-2 border-background z-10">
                              <Icon className="size-2.5" />
                            </div>
                          )}
                        </div>

                        <div className="flex flex-1 flex-col gap-0.5 w-full">
                          <div className="flex justify-between items-start w-full gap-2">
                            <p className="text-sm leading-snug">
                              {isSelfAction ? (
                                <>
                                  <span className="text-muted-foreground">{description}</span>{' '}
                                  <span className="font-semibold">{n.organizationName}</span>
                                  {n.type === 'role_changed' && n.metadata?.newRole && (
                                    <span className="text-muted-foreground">
                                      {' '}
                                      ({n.metadata.newRole})
                                    </span>
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
                            <span className="text-[11px] text-muted-foreground/70 font-medium shrink-0 mt-0.5">
                              {timeAgo(n.createdAt)}
                            </span>
                          </div>
                        </div>
                      </DropdownMenuItem>

                      {/* Smooth Divider */}
                      {index < notifications.length - 1 && (
                        <div className="w-[85%] mx-auto h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
                      )}
                    </div>
                  )
                })}
              </>
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
