import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NewOrgPage } from './new'

// Mock server fns
const mockCreateOrg = vi.fn()
vi.mock('@/server/org-fns', () => ({
  createOrganization: (...args: unknown[]) => mockCreateOrg(...args),
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
  createFileRoute: () => (config: unknown) => config,
  useNavigate: () => mockNavigate,
}))

// Mock i18n
vi.mock('@/i18n/context', () => ({
  useI18n: () => ({
    t: {
      newOrg: {
        title: 'Create Organization',
        subtitle: 'Subtitle text',
        nameLabel: 'Organization Name',
        namePlaceholder: 'Enter organization name',
        submit: 'Create Organization',
        success: 'Organization created successfully',
        nameMin: 'Minimum 2 characters',
        nameMax: 'Maximum 64 characters',
        error: 'An error occurred',
      },
      common: {
        cancel: 'Cancel',
      },
      onboarding: {
        nameTaken: 'Organization name is already taken',
      },
    },
  }),
}))

describe('NewOrgPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders organization creation form details', () => {
    render(<NewOrgPage />)

    expect(screen.getByRole('heading', { name: 'Create Organization' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter organization name')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create Organization' })).toBeInTheDocument()
  })

  it('submits form successfully and navigates on success', async () => {
    mockCreateOrg.mockResolvedValue({ org: { slug: 'new-org-slug' } })

    render(<NewOrgPage />)

    const input = screen.getByPlaceholderText('Enter organization name')
    fireEvent.change(input, { target: { value: 'My Awesome Company' } })

    const submitBtn = screen.getByRole('button', { name: 'Create Organization' })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(mockCreateOrg).toHaveBeenCalledWith({ data: { name: 'My Awesome Company' } })
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['user-orgs'] })
      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/organizations/$slug/dashboard',
        params: { slug: 'new-org-slug' },
        search: { page: 1 },
      })
    })
  })

  it('handles name conflict error branch', async () => {
    mockCreateOrg.mockRejectedValue(new Error('Organization name already taken'))

    render(<NewOrgPage />)

    const input = screen.getByPlaceholderText('Enter organization name')
    fireEvent.change(input, { target: { value: 'Conflict Company' } })

    const submitBtn = screen.getByRole('button', { name: 'Create Organization' })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(mockCreateOrg).toHaveBeenCalled()
    })
  })

  it('handles generic server error branch', async () => {
    mockCreateOrg.mockRejectedValue(new Error('Internal Server Error'))

    render(<NewOrgPage />)

    const input = screen.getByPlaceholderText('Enter organization name')
    fireEvent.change(input, { target: { value: 'Failed Company' } })

    const submitBtn = screen.getByRole('button', { name: 'Create Organization' })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(mockCreateOrg).toHaveBeenCalled()
    })
  })

  it('navigates back to organizations on cancel', () => {
    render(<NewOrgPage />)

    const cancelBtn = screen.getByRole('button', { name: 'Cancel' })
    fireEvent.click(cancelBtn)

    expect(mockNavigate).toHaveBeenCalledWith({ to: '/organizations' })
  })
})
