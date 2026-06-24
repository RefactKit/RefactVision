import { useMutation, useQuery } from '@tanstack/react-query'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ProjectStudioPage } from './$projectId'

// Mock react-router
vi.mock('@tanstack/react-router', () => ({
  // biome-ignore lint/suspicious/noExplicitAny: Test mock requires flexible typing
  createFileRoute: () => (config: any) => ({
    options: config,
  }),
  useParams: () => ({ slug: 'test-org', projectId: 'test-project-1' }),
  // biome-ignore lint/suspicious/noExplicitAny: Test mock requires flexible typing
  Link: ({ children, to, params }: any) => {
    return (
      <a href={typeof to === 'string' ? to : '#'} data-params={JSON.stringify(params)}>
        {children}
      </a>
    )
  },
  lazyRouteComponent: () => () => null,
}))

// Mock i18n
vi.mock('@/i18n/context', () => ({
  useI18n: () => ({
    t: {
      projects: {
        tabs: {
          dataset: 'Dataset',
          classes: 'Classes',
          models: 'Models',
          integration: 'Integration',
          stats: 'Stats',
        },
      },
    },
  }),
}))

// Mock queries and mutations
const mockInvalidateQueries = vi.fn()
vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: mockInvalidateQueries,
  }),
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  // biome-ignore lint/suspicious/noExplicitAny: Test mock requires flexible typing
  queryOptions: (options: any) => options,
}))

// Mock project sub-components
vi.mock('@/components/projects/labeling-gallery', () => ({
  LabelingGallery: () => <div data-testid="labeling-gallery">Labeling Gallery Mock</div>,
}))

vi.mock('@/components/projects/classes-table', () => ({
  ClassesTable: () => <div data-testid="classes-table">Classes Table Mock</div>,
}))

vi.mock('@/components/projects/models-table', () => ({
  ModelsTable: () => <div data-testid="models-table">Models Table Mock</div>,
}))

vi.mock('@/components/projects/project-stats', () => ({
  ProjectStats: () => <div data-testid="project-stats">Project Stats Mock</div>,
}))

vi.mock('@/components/projects/edit-project-dialog', () => ({
  EditProjectDialog: () => <div data-testid="edit-project-dialog">Edit Project Dialog Mock</div>,
}))

vi.mock('@/components/projects/project-files-table', () => ({
  ProjectFilesTable: () => <div data-testid="project-files-table">Project Files Table Mock</div>,
}))

// biome-ignore lint/suspicious/noExplicitAny: Test mock requires flexible typing
const mockUseQuery = useQuery as any
// biome-ignore lint/suspicious/noExplicitAny: Test mock requires flexible typing
const mockUseMutation = useMutation as any

describe('ProjectStudioPage tab routing and integration', () => {
  // biome-ignore lint/suspicious/noExplicitAny: Test mock data requires flexible shape
  let projectData: any
  // biome-ignore lint/suspicious/noExplicitAny: Test mock data requires flexible shape
  let statsData: any
  // biome-ignore lint/suspicious/noExplicitAny: Test mock data requires flexible shape
  let orgData: any

  beforeEach(() => {
    vi.clearAllMocks()

    projectData = {
      id: 'test-project-1',
      title: 'Potato Disease Classifier',
      description: 'AI model to detect potato plant leaves disease',
      slug: 'potato-disease',
      githubUrl: 'https://github.com/test/potato',
      otherUrl: 'https://potato-app.com',
      roboflowApiKey: null,
      roboflowWorkspace: null,
      roboflowProject: null,
      files: [],
      categories: [],
    }

    statsData = {
      totalFiles: 10,
      labeledFiles: 5,
    }

    orgData = {
      id: 'test-org-id',
      name: 'Farmer Co',
    }

    // Default mock query resolves
    // biome-ignore lint/suspicious/noExplicitAny: Test mock callback requires flexible typing
    mockUseQuery.mockImplementation(({ queryKey }: any) => {
      if (queryKey[0] === 'project') {
        return { data: projectData, isLoading: false }
      }
      if (queryKey[0] === 'project-stats') {
        return { data: statsData, isLoading: false }
      }
      if (queryKey[0] === 'org') {
        return { data: orgData, isLoading: false }
      }
      return { data: null, isLoading: false }
    })

    // Default mock mutations
    mockUseMutation.mockImplementation(() => ({
      mutate: vi.fn(),
      isPending: false,
    }))
  })

  it('renders tab headers and the default dataset tab content', () => {
    render(<ProjectStudioPage />)

    // Check project heading
    expect(screen.getByText('Potato Disease Classifier')).toBeInTheDocument()
    expect(screen.getByText('AI model to detect potato plant leaves disease')).toBeInTheDocument()

    // Check all tab triggers are present
    expect(screen.getByText('Dataset')).toBeInTheDocument()
    expect(screen.getByText('Classes')).toBeInTheDocument()
    expect(screen.getByText('Models')).toBeInTheDocument()
    expect(screen.getByText('Integration')).toBeInTheDocument()
    expect(screen.getByText('Stats')).toBeInTheDocument()

    // Dataset is selected by default
    expect(screen.getByTestId('labeling-gallery')).toBeInTheDocument()
  })

  it('switches to Classes tab and renders ClassesTable component', () => {
    render(<ProjectStudioPage />)

    const classesTab = screen.getByText('Classes')
    fireEvent.click(classesTab)

    expect(screen.getByTestId('classes-table')).toBeInTheDocument()
  })

  it('switches to Models tab and renders ModelsTable component', () => {
    render(<ProjectStudioPage />)

    const modelsTab = screen.getByText('Models')
    fireEvent.click(modelsTab)

    expect(screen.getByTestId('models-table')).toBeInTheDocument()
  })

  it('switches to Stats tab and renders ProjectStats component', () => {
    render(<ProjectStudioPage />)

    const statsTab = screen.getByText('Stats')
    fireEvent.click(statsTab)

    expect(screen.getByTestId('project-stats')).toBeInTheDocument()
  })

  describe('Integration Tab - Roboflow BYOK', () => {
    it('renders unconfigured integration state with inputs when credentials are missing', () => {
      render(<ProjectStudioPage />)

      const integrationTab = screen.getByText('Integration')
      fireEvent.click(integrationTab)

      // Logo and Description should be there
      expect(screen.getByAltText('Roboflow Logo')).toBeInTheDocument()
      expect(
        screen.getByText(/Securely configure your own Roboflow credentials/i),
      ).toBeInTheDocument()

      // Inputs should be present
      expect(screen.getByLabelText('Roboflow API Key')).toBeInTheDocument()
      expect(screen.getByLabelText('Workspace ID')).toBeInTheDocument()
      expect(screen.getByLabelText('Project ID (slug)')).toBeInTheDocument()

      // Button should be disabled by default (scope to Roboflow card to avoid collision with Ultralytics card)
      const roboflowCard = screen
        .getByAltText('Roboflow Logo')
        .closest('[data-slot="card"]') as HTMLElement
      const connectButton = within(roboflowCard).getByRole('button', {
        name: 'Save & Connect Integration',
      })
      expect(connectButton).toBeInTheDocument()
      expect(connectButton).toBeDisabled()
    })

    it('renders configured integration state when credentials exist in the project object', () => {
      projectData.roboflowApiKey = '••••••••'
      projectData.roboflowWorkspace = 'farmer-workspace'
      projectData.roboflowProject = 'potato-leaf-detector'

      render(<ProjectStudioPage />)

      const integrationTab = screen.getByText('Integration')
      fireEvent.click(integrationTab)

      // Should show connection status badge
      expect(screen.getByText('Connected')).toBeInTheDocument()
      expect(screen.getByText('Secure active integration')).toBeInTheDocument()

      // Should display parameters
      expect(screen.getByText('farmer-workspace')).toBeInTheDocument()
      expect(screen.getByText('potato-leaf-detector')).toBeInTheDocument()
      expect(screen.getByText('••••••••')).toBeInTheDocument()

      // Actions should be present
      expect(screen.getByRole('button', { name: /Push Labeled Images/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Sync Models' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Disconnect' })).toBeInTheDocument()
    })

    it('submits config form to save credentials when fields are filled', () => {
      const mutateMock = vi.fn()
      mockUseMutation.mockImplementation(() => ({
        mutate: mutateMock,
        isPending: false,
      }))

      render(<ProjectStudioPage />)

      const integrationTab = screen.getByText('Integration')
      fireEvent.click(integrationTab)

      const apiKeyInput = screen.getByPlaceholderText('Enter private API Key...')
      const workspaceInput = screen.getByPlaceholderText('e.g. my-workspace')
      const projectInput = screen.getByPlaceholderText('e.g. object-detection-xyz')

      fireEvent.change(apiKeyInput, { target: { value: 'rf_key_123' } })
      fireEvent.change(workspaceInput, { target: { value: 'my-space' } })
      fireEvent.change(projectInput, { target: { value: 'my-proj' } })

      // Scope to Roboflow card to avoid collision with Ultralytics card
      const roboflowCard = screen
        .getByAltText('Roboflow Logo')
        .closest('[data-slot="card"]') as HTMLElement
      const connectButton = within(roboflowCard).getByRole('button', {
        name: 'Save & Connect Integration',
      })
      expect(connectButton).toBeEnabled()
      fireEvent.click(connectButton)

      expect(mutateMock).toHaveBeenCalledWith({
        apiKey: 'rf_key_123',
        workspace: 'my-space',
        project: 'my-proj',
      })
    })
  })
})
