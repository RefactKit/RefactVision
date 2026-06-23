import { Building2, ChevronsUpDown, Crown, Plus, Shield, User } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { useI18n } from '@/i18n/context'
import { CreateOrgDialog } from './create-org-dialog'

interface Org {
  id: string
  name: string
  slug: string
  logo?: string | null
  role: string
}

interface OrgSwitcherProps {
  orgs: Org[]
  currentSlug: string
}

export function OrgSwitcher({ orgs, currentSlug }: OrgSwitcherProps) {
  const { isMobile } = useSidebar()
  const { t } = useI18n()
  const navigate = useNavigate()

  const [isModalOpen, setIsModalOpen] = useState(false)

  const activeOrg = orgs.find((o) => o.slug === currentSlug) ?? orgs[0]

  if (!activeOrg) return null

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger
              className="w-full"
              render={
                <SidebarMenuButton
                  size="lg"
                  className="h-14 gap-3.5 bg-sidebar-accent text-sidebar-accent-foreground px-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
                />
              }
            >
              <div className="flex aspect-square size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-semibold text-lg shrink-0 overflow-hidden">
                {activeOrg.logo ? (
                  <img
                    src={activeOrg.logo}
                    alt={activeOrg.name}
                    className="size-full object-cover"
                  />
                ) : (
                  (activeOrg.name[0]?.toUpperCase() ?? 'O')
                )}
              </div>
              <div className="grid flex-1 text-left leading-tight min-w-0 group-data-[collapsible=icon]:hidden">
                <span className="truncate font-semibold text-[15px]">{activeOrg.name}</span>
                <div className="flex items-center mt-0.5">
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0 h-4 gap-1 leading-none font-medium capitalize
                      ${
                        activeOrg.role === 'owner'
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/20'
                          : activeOrg.role === 'admin'
                            ? 'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-500/15 dark:text-cyan-400 dark:border-cyan-500/20'
                            : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/15 dark:text-slate-400 dark:border-slate-500/20'
                      }`}
                  >
                    {activeOrg.role === 'owner' && <Crown className="size-2.5 shrink-0" />}
                    {activeOrg.role === 'admin' && <Shield className="size-2.5 shrink-0" />}
                    {activeOrg.role === 'member' && <User className="size-2.5 shrink-0" />}
                    {/* Fallback translation or capitalized role */}
                    {(t.members?.roles as any)?.[activeOrg.role] || activeOrg.role}
                  </Badge>
                </div>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-muted-foreground/60 shrink-0 group-data-[collapsible=icon]:hidden" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              align="start"
              side={isMobile ? 'bottom' : 'right'}
              sideOffset={4}
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  {t.sidebar.organizationsLabel}
                </DropdownMenuLabel>
                {orgs.map((org) => (
                  <DropdownMenuItem
                    key={org.id}
                    onClick={() => {
                      const currentPath = window.location.pathname
                      // If we are already in an organization context, swap the slug in the current URL
                      if (currentPath.includes(`/organizations/${currentSlug}`)) {
                        const newPath = currentPath.replace(
                          `/organizations/${currentSlug}`,
                          `/organizations/${org.slug}`,
                        )
                        navigate({ to: newPath as any })
                      } else {
                        // Otherwise (or if global), go to dashboard
                        navigate({
                          to: '/organizations/$slug/dashboard',
                          params: { slug: org.slug },
                          search: { page: 1 },
                        })
                      }
                    }}
                    className="gap-2 p-2"
                  >
                    <div className="flex size-6 items-center justify-center rounded-md border overflow-hidden">
                      {org.logo ? (
                        <img src={org.logo} alt={org.name} className="size-full object-cover" />
                      ) : (
                        <Building2
                          className={`size-4 shrink-0 ${org.slug === activeOrg.slug ? 'text-primary' : 'text-muted-foreground'}`}
                        />
                      )}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="truncate text-sm">{org.name}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant="outline"
                        className={`text-[9px] px-1.5 py-0 h-[14px] gap-1 leading-none font-medium capitalize shrink-0
                          ${
                            org.role === 'owner'
                              ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/20'
                              : org.role === 'admin'
                                ? 'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-500/15 dark:text-cyan-400 dark:border-cyan-500/20'
                                : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/15 dark:text-slate-400 dark:border-slate-500/20'
                          }`}
                      >
                        {org.role === 'owner' && <Crown className="size-2.5 shrink-0" />}
                        {org.role === 'admin' && <Shield className="size-2.5 shrink-0" />}
                        {org.role === 'member' && <User className="size-2.5 shrink-0" />}
                        {(t.members?.roles as any)?.[org.role] || org.role}
                      </Badge>
                      {org.slug === activeOrg.slug && (
                        <span className="text-xs text-primary shrink-0 w-3 text-right">✓</span>
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              {(orgs.length === 0 ||
                orgs.some((o) => o.role === 'owner' || o.role === 'admin')) && (
                <DropdownMenuItem className="gap-2 p-2" onClick={() => setIsModalOpen(true)}>
                  <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                    <Plus className="size-4" />
                  </div>
                  <div className="font-medium text-muted-foreground">
                    {t.sidebar.createOrganization}
                  </div>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <CreateOrgDialog open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  )
}
