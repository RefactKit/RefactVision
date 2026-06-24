import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { OrgSettingsPage } from './settings'

// Mock OrgRoute
vi.mock('./route', () => ({
  Route: {
    useLoaderData: () => ({
      org: { id: 'org-1', name: 'Original Name', slug: 'original-slug', logo: 'logo.png' },
      role: 'admin',
    }),
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
    data: {
      org: { id: 'org-1', name: 'Original Name', slug: 'original-slug', logo: 'logo.png' },
      role: 'admin',
    },
    isLoading: false,
  }),
  useMutation: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
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
      },
      sidebar: {
        workspaceSettings: 'Workspace Settings',
      },
      orgsPage: {
        deleteConfirm: 'Confirm delete',
        deleteConfirmDesc: 'Are you sure?',
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
  ImageUpload: () => <div data-testid="image-upload">Image Upload Mock</div>,
}))

describe('OrgSettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders settings page headers and forms correctly', () => {
    render(<OrgSettingsPage />)

    // Verify basic inputs and layout
    expect(screen.getByLabelText('Workspace URL (Slug)')).toBeInTheDocument()
    expect(screen.getByLabelText('Organization Name')).toBeInTheDocument()
    expect(screen.getByTestId('image-upload')).toBeInTheDocument()
  })
})
