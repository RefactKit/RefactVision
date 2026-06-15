import {
  Building2,
  ExternalLink,
  Image,
  LayoutGrid,
  LifeBuoy,
  MessageSquareText,
  Settings,
  ShieldCheck,
  Users,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { useI18n } from '@/i18n/context'
import { useQuery } from '@tanstack/react-query'
import { NavMain } from './nav-main'
import { NavSecondary } from './nav-secondary'
import { NavUser } from './nav-user'
import { OrgSwitcher } from './org-switcher'
import { projectsCountQuery } from '@/server/query-keys'

interface Org {
  id: string
  name: string
  slug: string
  logo?: string | null
  role: string
}

interface AppSidebarProps {
  orgs: Org[]
  currentSlug?: string
  currentOrg?: { id: string; name: string; slug: string } | null
}

export function AppSidebar({ orgs, currentSlug }: AppSidebarProps) {
  const { t, dir } = useI18n()
  const slug = currentSlug ?? orgs[0]?.slug ?? ''
  const currentOrg = orgs?.find((o) => o.slug === slug)
  const userRole = currentOrg?.role

  const { data: projectsCount } = useQuery({
    ...projectsCountQuery(currentOrg?.id || ''),
    enabled: !!currentOrg?.id,
  })

  // Group 1: Workspace Core items (Always visible)
  const platformItems = slug
    ? [
        {
          title: t.sidebar.dashboard,
          to: `/organizations/${slug}/dashboard`,
          icon: LayoutGrid,
        },
        {
          title: t.sidebar.gallery,
          to: `/organizations/${slug}/gallery`,
          icon: Image,
        },
        {
          title: t.projects.title,
          to: `/organizations/${slug}/projects`,
          icon: LayoutGrid,
          badge: projectsCount ?? 0,
        },
      ]
    : []

  // Group 2: Management / Administration (Only for Owner & Admin per matrix)
  const adminItems =
    slug && userRole !== 'member'
      ? [
          {
            title: t.sidebar.team,
            to: `/organizations/${slug}/members`,
            icon: Users,
          },
          {
            title: t.sidebar.workspaceSettings,
            to: `/organizations/${slug}/settings`,
            icon: Settings,
          },
          ...(userRole === 'owner'
            ? [
                {
                  title: 'Rôles & Permissions',
                  to: `/organizations/${slug}/roles`,
                  icon: ShieldCheck,
                },
              ]
            : []),
        ]
      : []

  // Group 3: Account / Personal (Flat as requested)
  const accountItems = [
    {
      title: t.sidebar.accountSettings,
      to: '/settings',
      icon: Settings,
    },
  ]

  // Group 4: Secondary / Footer items
  const secondaryItems = [
    {
      title: t.sidebar.feedback,
      url: '#',
      icon: MessageSquareText,
    },
    {
      title: t.sidebar.support,
      url: '#',
      icon: LifeBuoy,
    },
    {
      title: t.sidebar.documentation,
      url: 'https://docs.refactkit.com',
      icon: ExternalLink,
      isExternal: true,
    },
    /*
    {
      title: t.sidebar.apiReference,
      url: '/api-reference',
      icon: ArrowSquareOut,
      isExternal: true,
    },
    */
  ]

  return (
    <Sidebar collapsible="icon" side={dir === 'rtl' ? 'right' : 'left'}>
      <SidebarHeader className="gap-4 group-data-[collapsible=icon]:p-2 p-4 pb-2">
        <OrgSwitcher orgs={orgs} currentSlug={slug} />
      </SidebarHeader>
      <SidebarContent>
        {/* Workspace Operations & Personal Account (Merged for consistent spacing) */}
        <NavMain items={[...platformItems, ...accountItems]} label="GENERAL" />

        {/* Administration & Global Organizations (Collapsible) */}
        <NavMain
          items={[
            ...adminItems,
            { title: t.sidebar.workspaces, to: '/organizations', icon: Building2 },
          ]}
          label={t.sidebar.administration.toUpperCase()}
          collapsible
        />

        {/* Secondary Navigation (Feedback, Support, Documentation) */}
        <NavSecondary items={secondaryItems} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator className="mb-2" />
        <NavUser slug={slug} userRole={userRole} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
