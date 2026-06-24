import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { OrgSettingsPage } from './settings'

let mockLoaderData = {
  org: { id: 'org-1', name: 'Original Name', slug: 'original-slug', logo: 'logo.png' },
  role: 'admin',
}

// Mock OrgRoute
vi.mock('./route', () => ({
  Route: {
    useLoaderData: () => mockLoaderData,
  },
}))

// Mock react-router
const mockNavigate = vi.fn()
vi.mock('@tanstack/react-router', () => ({
  createFileRoute: () => (config: unknown) => config,
  useNavigate: () => mockNavigate,
  useParams: () => ({ slug: 'original-slug' }),
}))

// Mock react-query
vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
  }),
  queryOptions: (options: unknown) => options,
  useQuery: () => ({
    data: mockLoaderData,
    isLoading: false,
  }),
  useMutation: ({
    mutationFn,
    onSuccess,
    onError,
  }: {
    mutationFn: (variables: any) => Promise<any>
    onSuccess?: (data: any) => void
    onError?: (error: any) => void
  }) => {
    return {
      mutate: async (args: any) => {
        try {
          const res = await mutationFn(args)
          if (onSuccess) onSuccess(res)
        } catch (err) {
          if (onError) onError(err)
        }
      },
      isPending: false,
    }
  },
}))

// Mock server fns
const mockUpdateOrg = vi.fn()
const mockDeleteOrg = vi.fn()
vi.mock('@/server/org-fns', () => ({
  updateOrganization: (...args: unknown[]) => mockUpdateOrg(...args),
  deleteOrganization: (...args: unknown[]) => mockDeleteOrg(...args),
}))

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

// Mock i18n
vi.mock('@/i18n/context', () => ({
  useI18n: () => ({
    t: {
      orgSettings: {
        title: 'Settings',
        subtitle: 'Workspace Settings',
        nameLabel: 'Organization Name',
        nameHelp: 'Help text',
        saveChanges: 'Save Changes',
        danger: 'Danger Zone',
        deleteDesc: 'Delete description',
        deleteTitle: 'Delete title',
        deleteButton: 'Delete button',
        saved: 'Changes saved',
      },
      sidebar: {
        workspaceSettings: 'Workspace Settings',
      },
      orgsPage: {
        deleteConfirm: 'Confirm delete',
        deleteConfirmDesc: 'Are you sure?',
        deleteSuccess: 'Deleted successfully',
      },
      common: {
        cancel: 'Cancel',
        delete: 'Delete',
        deleting: 'Deleting...',
      },
    },
  }),
}))

// Mock custom components to keep rendering simple
vi.mock('@/components/shared/forbidden-content', () => ({
  ForbiddenContent: () => <div data-testid="forbidden-content">Forbidden Mock</div>,
}))

vi.mock('@/components/shared/image-upload', () => ({
  ImageUpload: ({ onUploadSuccess }: { onUploadSuccess: (url: string) => void }) => (
    <button
      data-testid="image-upload-btn"
      type="button"
      onClick={() => onUploadSuccess('new-logo.png')}
    >
      Upload Image
    </button>
  ),
}))

vi.mock('@/components/ui/alert-dialog', () => ({
  AlertDialog: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  AlertDialogTrigger: ({
    children,
    render,
    ...props
  }: {
    children?: React.ReactNode
    render?: React.ReactElement
    [key: string]: unknown
  }) => {
    if (render) return React.cloneElement(render, props, children)
    return <button {...props}>{children}</button>
  },
  AlertDialogContent: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  AlertDialogHeader: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  AlertDialogTitle: ({ children }: { children?: React.ReactNode }) => <h2>{children}</h2>,
  AlertDialogDescription: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  AlertDialogFooter: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  AlertDialogCancel: ({
    children,
    onClick,
    ...props
  }: {
    children?: React.ReactNode
    onClick?: () => void
    [key: string]: unknown
  }) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
  AlertDialogAction: ({
    children,
    onClick,
    ...props
  }: {
    children?: React.ReactNode
    onClick?: () => void
    [key: string]: unknown
  }) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
  AlertDialogMedia: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
}))

describe('OrgSettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLoaderData = {
      org: { id: 'org-1', name: 'Original Name', slug: 'original-slug', logo: 'logo.png' },
      role: 'admin',
    }
  })

  it('renders settings page headers and forms correctly for admin', () => {
    render(<OrgSettingsPage />)

    expect(screen.getByLabelText('Workspace URL (Slug)')).toBeInTheDocument()
    expect(screen.getByLabelText('Organization Name')).toBeInTheDocument()
    expect(screen.getByTestId('image-upload-btn')).toBeInTheDocument()
    expect(screen.queryByText('Danger Zone')).not.toBeInTheDocument()
  })

  it('renders ForbiddenContent when role is member', () => {
    mockLoaderData.role = 'member'
    render(<OrgSettingsPage />)
    expect(screen.getByTestId('forbidden-content')).toBeInTheDocument()
  })

  it('submits update organization successfully and handles Undo', async () => {
    mockUpdateOrg.mockResolvedValue({ org: { slug: 'new-slug' } })

    render(<OrgSettingsPage />)

    // Trigger logo upload
    const uploadBtn = screen.getByTestId('image-upload-btn')
    fireEvent.click(uploadBtn)

    // Change slug and name
    const nameInput = screen.getByLabelText('Organization Name')
    fireEvent.change(nameInput, { target: { value: 'New Name' } })

    const slugInput = screen.getByLabelText('Workspace URL (Slug)')
    fireEvent.change(slugInput, { target: { value: 'new-slug' } })

    const saveBtn = screen.getByRole('button', { name: 'Save Changes' })
    fireEvent.click(saveBtn)

    await waitFor(() => {
      expect(mockUpdateOrg).toHaveBeenCalledWith({
        data: {
          organizationId: 'org-1',
          name: 'New Name',
          slug: 'new-slug',
          logo: 'new-logo.png',
        },
      })
      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/organizations/$slug/settings',
        params: { slug: 'new-slug' },
        replace: true,
      })
      expect(toast.success).toHaveBeenCalled()
    })

    // Simulate Undo click
    const successCalls = vi.mocked(toast.success).mock.calls
    const options = successCalls[successCalls.length - 1][1] as any
    if (options?.action?.onClick) {
      options.action.onClick()
      expect(mockUpdateOrg).toHaveBeenCalledTimes(2)
    }
  })

  it('handles update organization error branch', async () => {
    mockUpdateOrg.mockRejectedValue(new Error('Update failed'))

    render(<OrgSettingsPage />)

    const nameInput = screen.getByLabelText('Organization Name')
    fireEvent.change(nameInput, { target: { value: 'New Name' } })

    const saveBtn = screen.getByRole('button', { name: 'Save Changes' })
    fireEvent.click(saveBtn)

    await waitFor(() => {
      expect(mockUpdateOrg).toHaveBeenCalled()
      expect(toast.error).toHaveBeenCalledWith('Update failed')
    })
  })

  it('renders danger zone and deletes organization successfully and handles delete error / Undo', async () => {
    mockLoaderData.role = 'owner'
    mockDeleteOrg.mockResolvedValue({ success: true })

    const { rerender } = render(<OrgSettingsPage />)

    expect(screen.getByText('Danger Zone')).toBeInTheDocument()

    const deleteBtn = screen.getByRole('button', { name: 'Delete button' })
    fireEvent.click(deleteBtn)

    const confirmBtn = screen.getByRole('button', { name: 'Delete' })
    fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(mockDeleteOrg).toHaveBeenCalledWith({
        data: { organizationId: 'org-1' },
      })
      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/organizations',
        replace: true,
      })
      expect(toast.success).toHaveBeenCalled()
    })

    // Test Delete Undo
    const successCalls = vi.mocked(toast.success).mock.calls
    const options = successCalls[successCalls.length - 1][1] as any
    if (options?.action?.onClick) {
      options.action.onClick()
      expect(toast.info).toHaveBeenCalledWith(
        'Critical data deletion cannot be reversed via this action.',
      )
    }

    // Test Delete error branch
    mockDeleteOrg.mockRejectedValue(new Error('Delete failed'))
    rerender(<OrgSettingsPage />)
    fireEvent.click(deleteBtn)
    fireEvent.click(confirmBtn)
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Delete failed')
    })
  })
})
