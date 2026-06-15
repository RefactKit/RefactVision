import { ChevronsUpDown } from 'lucide-react'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import { useSession } from '../../../lib/auth-client'
import { UserAvatar } from './user-avatar'
import { UserDropdown } from './user-dropdown'

export function NavUser({ slug, userRole }: { slug?: string; userRole?: string }) {
  const { isMobile } = useSidebar()
  const { data: session, isPending } = useSession()

  if (isPending) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="flex items-center gap-3.5 px-3 h-14 w-full">
            <Skeleton className="h-9 w-9 rounded-xl" />
            <div className="grid flex-1 gap-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  if (!session) return null
  const user = session.user

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <UserDropdown
          side={isMobile ? 'bottom' : 'right'}
          align="end"
          slug={slug}
          userRole={userRole}
        >
          <SidebarMenuButton
            size="lg"
            className="h-14 gap-3.5 data-[popup-open]:bg-sidebar-accent data-[popup-open]:text-sidebar-accent-foreground px-3"
          >
            <UserAvatar className="rounded-xl size-9" />
            <div className="grid flex-1 text-left leading-tight">
              <span className="truncate font-semibold text-[15px]">{user.name}</span>
              <span className="truncate text-xs text-muted-foreground/70">{user.email}</span>
            </div>
            <ChevronsUpDown className="ml-auto text-muted-foreground/60 size-4" />
          </SidebarMenuButton>
        </UserDropdown>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
