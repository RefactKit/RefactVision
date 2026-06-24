import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HeaderBreadcrumb } from './header-breadcrumb'
import { NavMain } from './nav-main'
import { OrgSwitcher } from './org-switcher'

const mockNavigate = vi.fn()
let mockPathname = '/organizations/org-1/dashboard'
let mockParams: Record<string, string | undefined> = { slug: 'org-1' }
const mockMatchRoute = vi.fn()

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    to,
    ...props
  }: {
    children?: React.ReactNode
    to?: string
    [key: string]: unknown
  }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  useLocation: () => ({ pathname: mockPathname }),
  useParams: () => mockParams,
  useNavigate: () => mockNavigate,
  useMatchRoute: () => mockMatchRoute,
}))

vi.mock('@/i18n/context', () => ({
  useI18n: () => ({
    t: {
      sidebar: {
        dashboard: 'Tableau de bord',
        members: 'Membres',
        settings: 'Paramètres',
        accountSettings: 'Mon Compte',
        organizationsLabel: 'Organisations',
        createOrganization: 'Créer une organisation',
      },
      projects: {
        title: 'Projets',
        studio: {
          labeling: 'Studio de labellisation',
        },
      },
      members: {
        roles: {
          owner: 'Propriétaire',
          admin: 'Administrateur',
          member: 'Membre',
        },
      },
    },
  }),
}))

vi.mock('@/components/ui/sidebar', () => {
  return {
    SidebarMenu: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
    SidebarMenuButton: ({
      children,
      className,
      ...props
    }: {
      children?: React.ReactNode
      className?: string
      [key: string]: unknown
    }) => (
      <button className={className} {...props}>
        {children}
      </button>
    ),
    SidebarMenuItem: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
    useSidebar: () => ({ isMobile: false }),
    SidebarGroup: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
    SidebarGroupLabel: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
    SidebarMenuSub: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
    SidebarMenuSubItem: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
    SidebarMenuSubButton: ({
      children,
      render,
      ...props
    }: {
      children?: React.ReactNode
      render?: React.ReactElement
      [key: string]: unknown
    }) => {
      if (render) {
        return React.cloneElement(render, props, children)
      }
      return <button {...props}>{children}</button>
    },
  }
})

vi.mock('@/components/ui/dropdown-menu', () => {
  return {
    DropdownMenu: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
    DropdownMenuTrigger: ({
      children,
      render,
      ...props
    }: {
      children?: React.ReactNode
      render?: React.ReactElement
      [key: string]: unknown
    }) => {
      if (render) {
        return React.cloneElement(render, props, children)
      }
      return <button {...props}>{children}</button>
    },
    DropdownMenuContent: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
    DropdownMenuGroup: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
    DropdownMenuItem: ({
      children,
      onClick,
      className,
    }: {
      children?: React.ReactNode
      onClick?: () => void
      className?: string
    }) => (
      <button type="button" onClick={onClick} className={className}>
        {children}
      </button>
    ),
    DropdownMenuLabel: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
    DropdownMenuSeparator: () => <hr />,
  }
})

vi.mock('@/components/ui/collapsible', () => ({
  Collapsible: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  CollapsibleTrigger: ({
    children,
    render,
    ...props
  }: {
    children?: React.ReactNode
    render?: React.ReactElement
    [key: string]: unknown
  }) => {
    if (render) {
      return React.cloneElement(render, props, children)
    }
    return <button {...props}>{children}</button>
  },
  CollapsibleContent: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('./create-org-dialog', () => ({
  CreateOrgDialog: ({ open }: { open: boolean }) =>
    open ? <div data-testid="mock-create-org-dialog">Mock Dialog</div> : null,
}))

describe('Dashboard Components', () => {
  const queryClient = new QueryClient()

  beforeEach(() => {
    vi.clearAllMocks()
    mockPathname = '/organizations/org-1/dashboard'
    mockParams = { slug: 'org-1' }
  })

  describe('HeaderBreadcrumb', () => {
    it('renders breadcrumb for dashboard page', () => {
      render(
        <QueryClientProvider client={queryClient}>
          <HeaderBreadcrumb orgName="My Org" />
        </QueryClientProvider>,
      )
      expect(screen.getByText('My Org')).toBeInTheDocument()
    })

    it('renders breadcrumb for projects page', () => {
      mockPathname = '/organizations/org-1/projects'
      mockParams = { slug: 'org-1' }
      render(
        <QueryClientProvider client={queryClient}>
          <HeaderBreadcrumb orgName="My Org" />
        </QueryClientProvider>,
      )
      expect(screen.getByText('Projets')).toBeInTheDocument()
    })

    it('renders breadcrumb for single project detail page using cached query data', () => {
      mockPathname = '/organizations/org-1/projects/proj-123'
      mockParams = { slug: 'org-1', projectId: 'proj-123' }
      queryClient.setQueryData(['project', 'proj-123'], { title: 'Amazing ML Project' })

      render(
        <QueryClientProvider client={queryClient}>
          <HeaderBreadcrumb orgName="My Org" />
        </QueryClientProvider>,
      )
      expect(screen.getByText('Amazing ML Project')).toBeInTheDocument()
      expect(screen.getByText('Projets')).toBeInTheDocument()
    })

    it('renders breadcrumb for account settings view=security subpage', () => {
      mockPathname = '/settings/account'
      mockParams = {}
      const originalLocation = window.location
      // @ts-expect-error
      delete window.location
      window.location = { ...originalLocation, search: '?view=security' } as unknown as Location

      render(
        <QueryClientProvider client={queryClient}>
          <HeaderBreadcrumb />
        </QueryClientProvider>,
      )
      expect(screen.getByText('Mon Compte')).toBeInTheDocument()
      expect(screen.getByText('Sécurité')).toBeInTheDocument()

      window.location = originalLocation
    })
  })

  describe('NavMain', () => {
    const mockItems = [
      {
        title: 'Dashboard',
        to: '/dashboard',
        icon: () => <span>Icon</span>,
      },
      {
        title: 'Settings',
        to: '/settings',
        icon: () => <span>Icon</span>,
        items: [
          { title: 'General', to: '/settings/general' },
          { title: 'Billing', to: '/settings/billing' },
        ],
      },
    ]

    it('renders nav items, expands matching collapsible sub-items', () => {
      mockMatchRoute.mockImplementation(({ to }: { to: string }) => to === '/settings')

      render(<NavMain items={mockItems} label="Main Navigation" collapsible={true} />)

      expect(screen.getByText('Main Navigation')).toBeInTheDocument()
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('General')).toBeInTheDocument()
      expect(screen.getByText('Billing')).toBeInTheDocument()
    })

    it('navigates when clicking items', () => {
      mockMatchRoute.mockReturnValue(false)
      render(<NavMain items={mockItems} />)

      const dashboardBtn = screen.getByRole('button', { name: /Dashboard/i })
      fireEvent.click(dashboardBtn)
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/dashboard', search: undefined })
    })

    it('navigates when clicking sub-items', () => {
      mockMatchRoute.mockReturnValue(false)
      render(<NavMain items={mockItems} />)

      const generalBtn = screen.getByRole('button', { name: /General/i })
      fireEvent.click(generalBtn)
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/settings/general', search: undefined })
    })

    it('returns null if items array is empty', () => {
      const { container } = render(<NavMain items={[]} />)
      expect(container.firstChild).toBeNull()
    })
  })

  describe('OrgSwitcher', () => {
    const orgs = [
      { id: '1', name: 'Org One', slug: 'org-one', role: 'owner', logo: null },
      { id: '2', name: 'Org Two', slug: 'org-two', role: 'admin', logo: 'logo-url' },
      { id: '3', name: 'Org Three', slug: 'org-three', role: 'member', logo: null },
    ]

    it('renders current organization and lists others inside dropdown trigger click', () => {
      render(<OrgSwitcher orgs={orgs} currentSlug="org-one" />)

      expect(screen.getAllByText('Org One').length).toBeGreaterThan(0)

      const trigger = screen.getByRole('button', { name: /Org One/i })
      fireEvent.click(trigger)

      expect(screen.getByText('Organisations')).toBeInTheDocument()
      expect(screen.getByText('Org Two')).toBeInTheDocument()
      expect(screen.getByText('Org Three')).toBeInTheDocument()
    })

    it('handles org switching by replacing URL path if in organization context', () => {
      const originalLocation = window.location
      // @ts-expect-error
      delete window.location
      window.location = {
        ...originalLocation,
        pathname: '/organizations/org-one/projects',
        href: '',
      } as unknown as Location

      render(<OrgSwitcher orgs={orgs} currentSlug="org-one" />)
      const trigger = screen.getByRole('button', { name: /Org One/i })
      fireEvent.click(trigger)

      const secondOrgBtn = screen.getByRole('menuitem', { name: /Org Two/i })
      fireEvent.click(secondOrgBtn)

      expect(window.location.href).toBe('/organizations/org-two/projects')

      window.location = originalLocation
    })

    it('handles org switching by navigating to dashboard if not in organization context', () => {
      const originalLocation = window.location
      // @ts-expect-error
      delete window.location
      window.location = {
        ...originalLocation,
        pathname: '/settings',
        href: '',
      } as unknown as Location

      render(<OrgSwitcher orgs={orgs} currentSlug="org-one" />)
      const trigger = screen.getByRole('button', { name: /Org One/i })
      fireEvent.click(trigger)

      const secondOrgBtn = screen.getByRole('menuitem', { name: /Org Two/i })
      fireEvent.click(secondOrgBtn)

      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/organizations/$slug/dashboard',
        params: { slug: 'org-two' },
        search: { page: 1 },
      })

      window.location = originalLocation
    })

    it('opens CreateOrgDialog when clicking create organization', () => {
      render(<OrgSwitcher orgs={orgs} currentSlug="org-one" />)
      const trigger = screen.getByRole('button', { name: /Org One/i })
      fireEvent.click(trigger)

      const createBtn = screen.getByRole('menuitem', { name: /Créer une organisation/i })
      fireEvent.click(createBtn)

      expect(screen.getByTestId('mock-create-org-dialog')).toBeInTheDocument()
    })
  })
})
