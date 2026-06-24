import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { OnboardingPage, Route } from './onboarding'

// Mock server fns
const mockCreateOrg = vi.fn()
vi.mock('@/server/org-fns', () => ({
  createOrganization: (...args: unknown[]) => mockCreateOrg(...args),
}))

let mockSession: { user: { id: string } } | null = { user: { id: 'user-1' } }
vi.mock('@/server/auth-fns', () => ({
  getServerSession: () => Promise.resolve({ session: mockSession }),
}))

// Mock query client
const mockInvalidateQueries = vi.fn()
vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: mockInvalidateQueries,
  }),
}))

// Mock router
const mockNavigate = vi.fn()
vi.mock('@tanstack/react-router', () => ({
  createFileRoute: () => (config: any) => ({
    ...config,
    options: config,
  }),
  useNavigate: () => mockNavigate,
  redirect: (config: unknown) => {
    const err = new Error('Redirect')
    // @ts-ignore
    err.redirectConfig = config
    return err
  },
}))

// Mock i18n
vi.mock('@/i18n/context', () => ({
  useI18n: () => ({
    t: {
      onboarding: {
        badge: 'Onboarding Badge',
        heading: 'Welcome to Onboarding',
        subheading: 'Setup your workspace',
        features: ['Feature 1', 'Feature 2'],
        title: 'Workspace Setup',
        subtitle: 'Setup organization details',
        nameLabel: 'Organization Name',
        namePlaceholder: 'Enter organization name',
        submit: 'Create Workspace',
        submitting: 'Creating...',
        success: 'Workspace created',
        nameMin: 'Minimum 2 characters',
        nameMax: 'Maximum 64 characters',
        error: 'Failed to create workspace',
        nameTaken: 'Name already taken',
      },
      common: {
        cancel: 'Cancel',
      },
    },
  }),
}))

// Mock DotPattern and ThemeToggle to keep render simple
vi.mock('@/components/ui/dot-pattern', () => ({
  DotPattern: () => <div data-testid="dot-pattern" />,
}))

vi.mock('@/components/shared/auth-ui', () => ({
  ThemeToggle: () => <button type="button">Theme Toggle</button>,
}))

vi.mock('./_auth/-shared', () => ({
  Logo: () => <div data-testid="logo">Logo Mock</div>,
}))

describe('OnboardingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSession = { user: { id: 'user-1' } }
  })

  it('renders onboarding and form fields', () => {
    render(<OnboardingPage />)

    expect(screen.getByText('Welcome to Onboarding')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter organization name')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create Workspace' })).toBeInTheDocument()
  })

  it('submits onboarding form successfully and redirects', async () => {
    mockCreateOrg.mockResolvedValue({ org: { slug: 'my-org' } })

    render(<OnboardingPage />)

    const input = screen.getByPlaceholderText('Enter organization name')
    fireEvent.change(input, { target: { value: 'Acme Corp' } })

    const submitBtn = screen.getByRole('button', { name: 'Create Workspace' })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(mockCreateOrg).toHaveBeenCalledWith({ data: { name: 'Acme Corp' } })
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['user-orgs'] })
      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/organizations/$slug/dashboard',
        params: { slug: 'my-org' },
        search: { page: 1 },
      })
    })
  })

  it('handles onboarding error branches', async () => {
    mockCreateOrg.mockRejectedValue(new Error('Organization name already taken'))

    render(<OnboardingPage />)

    const input = screen.getByPlaceholderText('Enter organization name')
    fireEvent.change(input, { target: { value: 'Conflict Org' } })

    const submitBtn = screen.getByRole('button', { name: 'Create Workspace' })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(mockCreateOrg).toHaveBeenCalled()
    })
  })

  it('handles general onboarding error', async () => {
    mockCreateOrg.mockRejectedValue(new Error('Generic failure'))

    render(<OnboardingPage />)

    const input = screen.getByPlaceholderText('Enter organization name')
    fireEvent.change(input, { target: { value: 'Failure Org' } })

    const submitBtn = screen.getByRole('button', { name: 'Create Workspace' })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(mockCreateOrg).toHaveBeenCalled()
    })
  })

  it('loader returns empty object when user is authenticated', async () => {
    // @ts-ignore
    const result = await Route.options.loader()
    expect(result).toEqual({})
  })

  it('loader redirects when user is not authenticated', async () => {
    mockSession = null
    // @ts-ignore
    await expect(Route.options.loader()).rejects.toThrow('Redirect')
  })
})
