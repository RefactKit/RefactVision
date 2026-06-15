import { Link, useLocation, useParams } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { LayoutDashboard, Image, Users, Settings, LayoutGrid, Home } from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { useI18n } from '@/i18n/context'

interface HeaderBreadcrumbProps {
  orgName?: string
}

export function HeaderBreadcrumb({ orgName }: HeaderBreadcrumbProps) {
  const { t } = useI18n()
  const { pathname } = useLocation()
  const params = useParams({ strict: false }) as { slug?: string; projectId?: string }
  const { slug, projectId } = params
  const queryClient = useQueryClient()

  // Read the project title from cache if we're on a project detail page
  const cachedProject = projectId
    ? queryClient.getQueryData<{ title?: string }>(['project', projectId])
    : null

  // Break down the path to determine current page
  const segments = pathname.split('/').filter(Boolean)
  const lastSegment = segments[segments.length - 1]

  // Detect current view/page for titles
  const getPageConfig = () => {
    if (lastSegment === 'dashboard') return { title: t.sidebar.dashboard, icon: LayoutDashboard }
    if (lastSegment === 'gallery') return { title: t.sidebar.gallery, icon: Image }
    if (lastSegment === 'members') return { title: t.sidebar.members, icon: Users }
    if (lastSegment === 'settings') return { title: t.sidebar.settings, icon: Settings }
    if (lastSegment === 'projects') return { title: t.projects.title, icon: LayoutGrid }

    // Individual Project Page — use cached project title
    if (pathname.includes('/projects/') && lastSegment !== 'projects') {
      return {
        parent: { title: t.projects.title, to: `/organizations/${slug}/projects` },
        title: cachedProject?.title ?? t.projects.studio.labeling,
        icon: LayoutGrid,
      }
    }

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

  const { title: pageTitle, icon: PageIcon, parent } = getPageConfig()

  const isDashboard = lastSegment === 'dashboard'

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink
            render={
              <Link
                to={slug ? '/organizations/$slug/dashboard' : '/'}
                params={slug ? { slug } : {}}
                className="flex items-center gap-1.5"
              />
            }
          >
            <Home className="size-3.5" />
            {orgName || 'Home'}
          </BreadcrumbLink>
        </BreadcrumbItem>

        {parent && (
          <>
            <BreadcrumbSeparator> / </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink
                render={<Link to={parent.to} className="flex items-center gap-1.5" />}
              >
                {parent.title}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </>
        )}

        {pageTitle && !isDashboard && (
          <>
            <BreadcrumbSeparator> / </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                {pageTitle}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
