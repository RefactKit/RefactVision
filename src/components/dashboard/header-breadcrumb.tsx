import { Link, useLocation, useNavigate, useParams } from '@tanstack/react-router'
import { ChevronDown, Home, LayoutDashboard, Image, Users, Settings } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useI18n } from '@/i18n/context'

interface HeaderBreadcrumbProps {
  orgName?: string
}

export function HeaderBreadcrumb({ orgName }: HeaderBreadcrumbProps) {
  const { t } = useI18n()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { slug } = useParams({ strict: false }) as { slug?: string }

  // Break down the path to determine current page
  const segments = pathname.split('/').filter(Boolean)
  const lastSegment = segments[segments.length - 1]

  // Detect current view/page for titles
  const getPageConfig = () => {
    if (lastSegment === 'dashboard') return { title: t.sidebar.dashboard, icon: LayoutDashboard }
    if (lastSegment === 'gallery') return { title: t.sidebar.gallery, icon: Image }
    if (lastSegment === 'members') return { title: t.sidebar.members, icon: Users }
    if (lastSegment === 'settings') return { title: t.sidebar.settings, icon: Settings }

    // Global Settings Page
    if (pathname.includes('/settings')) {
      const search = window.location.search
      let subPage = 'Général'
      if (search.includes('view=security')) subPage = 'Sécurité'
      if (search.includes('view=appearance')) subPage = 'Apparence'

      return {
        parent: { title: t.sidebar.accountSettings, to: '/settings' },
        title: subPage,
        icon: Settings,
      }
    }

    return { title: '' }
  }

  const { title: pageTitle, parent, icon: PageIcon } = getPageConfig()

  const quickNav = [
    { title: t.sidebar.dashboard, to: `/organizations/${slug}/dashboard`, icon: LayoutDashboard },
    { title: t.sidebar.gallery, to: `/organizations/${slug}/gallery`, icon: Image },
    { title: t.sidebar.members, to: `/organizations/${slug}/members`, icon: Users },
    { title: t.sidebar.settings, to: `/organizations/${slug}/settings`, icon: Settings },
  ]

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* Organization Name (Link to Dashboard) */}
        {slug && (
          <>
            <BreadcrumbItem>
              <Link to={`/organizations/${slug}/dashboard`}>
                <Badge
                  variant="outline"
                  className="gap-1.5 px-2 py-0.5 font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <Home className="size-3" />
                  {orgName ?? slug}
                </Badge>
              </Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        )}

        {/* Parent Page (if defined) */}
        {parent && (
          <>
            <BreadcrumbItem>
              <Link to={parent.to} search={{ view: 'account' }}>
                <Badge
                  variant="outline"
                  className="px-2 py-0.5 font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {parent.title}
                </Badge>
              </Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        )}

        {/* Current Page with Dropdown */}
        {pageTitle && (
          <BreadcrumbItem>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-semibold transition-colors hover:text-primary outline-hidden">
                <BreadcrumbPage className="flex items-center gap-1.5 transition-colors group-hover:text-primary">
                  {PageIcon && <PageIcon className="size-3.5" />}
                  {pageTitle}
                  {slug && <ChevronDown className="size-3.5 opacity-50" />}
                </BreadcrumbPage>
              </DropdownMenuTrigger>
              {slug && (
                <DropdownMenuContent align="start" className="w-48">
                  {quickNav.map((item) => (
                    <DropdownMenuItem
                      key={item.to}
                      onClick={() => navigate({ to: item.to as any })}
                      className="gap-2 cursor-pointer"
                    >
                      <item.icon className="size-4 opacity-70" />
                      {item.title}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              )}
            </DropdownMenu>
          </BreadcrumbItem>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
