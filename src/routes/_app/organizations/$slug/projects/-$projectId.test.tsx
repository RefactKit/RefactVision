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
  queryOptions: (options: unknown) => options,
}))

// Mock server functions
const mockSaveUltralyticsConfig = vi.fn().mockResolvedValue({ success: true })
const mockDisconnectUltralytics = vi.fn().mockResolvedValue({ success: true })
const mockExportToUltralytics = vi.fn().mockResolvedValue({ success: true, message: 'Exported' })

vi.mock('@/server/ultralytics-fns', () => ({
  saveUltralyticsConfig: (...args: unknown[]) => mockSaveUltralyticsConfig(...args),
  disconnectUltralytics: (...args: unknown[]) => mockDisconnectUltralytics(...args),
  exportToUltralytics: (...args: unknown[]) => mockExportToUltralytics(...args),
}))

const mockUploadFile = vi
  .fn()
  .mockResolvedValue({ url: 'http://img.jpg', path: 'projects/img.jpg' })
vi.mock('@/server/storage-fns', () => ({
  uploadFile: (...args: unknown[]) => mockUploadFile(...args),
}))

const mockLinkProjectFile = vi.fn().mockResolvedValue({ success: true })
vi.mock('@/server/project-fns', () => ({
  bulkLabelFiles: vi.fn(),
  createCategory: vi.fn(),
  deleteFiles: vi.fn(),
  disconnectRoboflow: vi.fn(),
  getProjectById: vi.fn(),
  getProjectStats: vi.fn(),
  linkProjectFile: (...args: unknown[]) => mockLinkProjectFile(...args),
  pushProjectFilesToRoboflow: vi.fn(),
  saveRoboflowConfig: vi.fn(),
  syncRoboflowModels: vi.fn(),
}))

// Mock project sub-components
vi.mock('@/components/projects/labeling-gallery', () => ({
  // biome-ignore lint/suspicious/noExplicitAny: Mock props
  LabelingGallery: ({ onUploadClick }: any) => (
    <div data-testid="labeling-gallery">
      Labeling Gallery Mock
      <button type="button" data-testid="upload-button" onClick={onUploadClick}>
        Upload Mock
      </button>
    </div>
  ),
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
    mockUseMutation.mockImplementation((options: { mutationFn?: (args: unknown) => void }) => ({
      mutate: vi.fn((args: unknown) => {
        if (options?.mutationFn) {
          options.mutationFn(args)
        }
      }),
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

  describe('Integration Tab - Ultralytics BYOK', () => {
    it('renders unconfigured integration state with inputs when credentials are missing', () => {
      render(<ProjectStudioPage />)

      const integrationTab = screen.getByText('Integration')
      fireEvent.click(integrationTab)

      // Logo and Description should be there
      expect(screen.getAllByAltText('Ultralytics Logo')).toHaveLength(1)
      expect(screen.getByText(/Securely configure your Ultralytics API key/i)).toBeInTheDocument()

      // Inputs should be present
      expect(screen.getByLabelText('Ultralytics API Key')).toBeInTheDocument()

      // Button should be disabled by default (scope to Ultralytics card)
      const ultralyticsCard = screen
        .getByPlaceholderText('Enter your Ultralytics API Key...')
        .closest('[data-slot="card"]') as HTMLElement
      const connectButton = within(ultralyticsCard).getByRole('button', {
        name: 'Save & Connect Integration',
      })
      expect(connectButton).toBeInTheDocument()
      expect(connectButton).toBeDisabled()
    })

    it('renders configured integration state when credentials exist in the project object', () => {
      projectData.ultralyticsApiKey = '••••••••'

      render(<ProjectStudioPage />)

      const integrationTab = screen.getByText('Integration')
      fireEvent.click(integrationTab)

      // Should show connection status badge
      expect(screen.getByText('Connected')).toBeInTheDocument()

      // Should display parameters
      expect(screen.getByText('••••••••')).toBeInTheDocument()

      // Actions should be present
      expect(screen.getByRole('button', { name: /Export Labeled Images/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Disconnect' })).toBeInTheDocument()
    })

    it('submits config form to save credentials when fields are filled', () => {
      render(<ProjectStudioPage />)

      const integrationTab = screen.getByText('Integration')
      fireEvent.click(integrationTab)

      const apiKeyInput = screen.getByPlaceholderText('Enter your Ultralytics API Key...')
      fireEvent.change(apiKeyInput, { target: { value: 'ultra_key_123' } })

      const ultralyticsCard = apiKeyInput.closest('[data-slot="card"]') as HTMLElement
      const connectButton = within(ultralyticsCard).getByRole('button', {
        name: 'Save & Connect Integration',
      })
      expect(connectButton).toBeEnabled()
      fireEvent.click(connectButton)

      expect(mockSaveUltralyticsConfig).toHaveBeenCalledWith({
        data: { projectId: 'test-project-1', apiKey: 'ultra_key_123' },
      })
    })

    it('triggers disconnect integration', () => {
      projectData.ultralyticsApiKey = '••••••••'

      render(<ProjectStudioPage />)

      const integrationTab = screen.getByText('Integration')
      fireEvent.click(integrationTab)

      const disconnectButton = screen.getByRole('button', { name: 'Disconnect' })
      fireEvent.click(disconnectButton)

      expect(mockDisconnectUltralytics).toHaveBeenCalledWith({
        data: { projectId: 'test-project-1' },
      })
    })

    it('triggers export integration', () => {
      projectData.ultralyticsApiKey = '••••••••'

      render(<ProjectStudioPage />)

      const integrationTab = screen.getByText('Integration')
      fireEvent.click(integrationTab)

      const exportButton = screen.getByRole('button', { name: /Export Labeled Images/i })
      fireEvent.click(exportButton)

      expect(mockExportToUltralytics).toHaveBeenCalledWith({
        data: { projectId: 'test-project-1' },
      })
    })
  })

  describe('File Upload Interaction', () => {
    it('simulates file upload and database linking', async () => {
      const mockInput = {
        type: '',
        multiple: false,
        onchange: null as ((event: unknown) => void) | null,
        click: vi.fn(() => {
          if (mockInput.onchange) {
            const event = {
              target: {
                files: [new File(['test'], 'image1.jpg', { type: 'image/jpeg' })],
              },
            }
            mockInput.onchange(event)
          }
        }),
      }

      const originalCreateElement = document.createElement
      const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
        if (tagName === 'input') return mockInput as unknown as HTMLInputElement
        return originalCreateElement.call(document, tagName)
      })

      render(<ProjectStudioPage />)

      // Trigger upload by clicking the upload button rendered in the mocked LabelingGallery
      const uploadBtn = screen.getByTestId('upload-button')
      await fireEvent.click(uploadBtn)

      expect(createElementSpy).toHaveBeenCalledWith('input')
      expect(mockInput.click).toHaveBeenCalled()
      expect(mockUploadFile).toHaveBeenCalled()
      expect(mockLinkProjectFile).toHaveBeenCalled()

      createElementSpy.mockRestore()
    })
  })
})
