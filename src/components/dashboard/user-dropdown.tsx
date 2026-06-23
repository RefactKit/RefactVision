import { useAuth } from '@better-auth-ui/react'
import {
  BadgeCheck,
  Bell,
  BookOpen,
  CreditCard,
  LifeBuoy,
  LogOut,
  Plus,
  Sparkles,
  Users,
} from 'lucide-react'
import { useRouter } from '@tanstack/react-router'
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
import { useSession } from '../../../lib/auth-client'
import { UserAvatar } from './user-avatar'

interface UserDropdownProps {
  children: React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  slug?: string
  userRole?: string
}

export function UserDropdown({
  children,
  side = 'bottom',
  align = 'end',
  slug,
  userRole,
}: UserDropdownProps) {
  const { data: session } = useSession()
  const { basePaths, viewPaths, Link } = useAuth()
  const { t } = useI18n()
  const router = useRouter()

  if (!session) return null
  const user = session.user

  const isAdminOrOwner = userRole === 'admin' || userRole === 'owner'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={children} />
      <DropdownMenuContent side={side} align={align} sideOffset={4} className="min-w-56 rounded-lg">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <UserAvatar className="size-8 rounded-lg" />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
              </div>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Sparkles className="size-4" />
            {t.sidebar.upgradeToPro}
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {slug && isAdminOrOwner && (
          <>
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => router.navigate({ to: `/organizations/${slug}/members` })}
              >
                <Users className="size-4" />
                {t.sidebar.team}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.navigate({ to: `/organizations/${slug}/members` })}
              >
                <Plus className="size-4" />
                {t.sidebar.inviteMembers}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuGroup>
          <DropdownMenuItem
            render={<Link href={`${basePaths.settings}/${viewPaths.settings.account}`} />}
          >
            <BadgeCheck className="size-4" />
            {t.sidebar.account}
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard className="size-4" />
            {t.sidebar.billing}
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Bell className="size-4" />
            {t.sidebar.notifications}
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => window.open('#', '_blank')}>
            <LifeBuoy className="size-4" />
            {t.sidebar.support}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => window.open('https://docs.refactkit.com', '_blank')}>
            <BookOpen className="size-4" />
            {t.sidebar.documentation}
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => router.navigate({ to: '/logout' })}
            render={<Link href={`${basePaths.auth}/${viewPaths.auth.signOut}`} />}
          >
            <LogOut className="size-4" />
            {t.sidebar.logOut}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
