import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { CreateProjectDialog } from './create-project-dialog'

vi.mock('@/i18n/context', () => ({
  useI18n: () => ({
    t: {
      projects: {
        createNew: 'Create New Project',
        form: {
          configureDesc: 'Configure your project settings',
          title: 'Project Title',
          placeholderTitle: 'Enter project title',
          type: 'Project Type',
          selectType: 'Select project type',
          description: 'Description',
          placeholderDesc: 'Enter description',
          github: 'GitHub Repository',
          other: 'Other URL',
        },
        types: {
          THESE: 'Thèse',
          STAGE: 'Stage',
          AUTRE: 'Autre',
        },
      },
      common: {
        cancel: 'Cancel',
      },
    },
    dir: 'ltr',
    locale: 'en',
  }),
}))

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: { children?: React.ReactNode; open?: boolean }) => open ? <div>{children}</div> : null,
  DialogContent: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children?: React.ReactNode }) => <h2>{children}</h2>,
  DialogDescription: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  DialogFooter: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: { children?: React.ReactNode; value?: string; onValueChange: (val: string) => void }) => (
    <select data-testid="mock-select" value={value} onChange={(e) => onValueChange(e.target.value)}>
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>,
  SelectContent: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  SelectItem: ({ children, value }: { children?: React.ReactNode; value: string }) => <option value={value}>{children}</option>,
}))

vi.mock('@/components/ui/spinner', () => ({
  Spinner: () => <div data-testid="spinner">Loading...</div>,
}))

describe('CreateProjectDialog', () => {
  const mockOnOpenChange = vi.fn()
  const mockOnSubmit = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when open is false', () => {
    const { container } = render(
      <CreateProjectDialog
        open={false}
        onOpenChange={mockOnOpenChange}
        onSubmit={mockOnSubmit}
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders fields and handles submission with custom project types', () => {
    const projectTypes = [
      { id: 'type-1', name: 'Type One' },
      { id: 'type-2', name: 'Type Two' },
    ]

    render(
      <CreateProjectDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSubmit={mockOnSubmit}
        projectTypes={projectTypes}
      />
    )

    expect(screen.getByRole('heading', { name: 'Create New Project' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter project title')).toBeInTheDocument()

    // Fill form
    fireEvent.change(screen.getByPlaceholderText('Enter project title'), { target: { value: 'My ML Project' } })
    fireEvent.change(screen.getByPlaceholderText('Enter description'), { target: { value: 'Project description' } })
    fireEvent.change(screen.getByPlaceholderText('https://github.com/...'), { target: { value: 'https://github.com/my/project' } })
    fireEvent.change(screen.getByPlaceholderText('https://...'), { target: { value: 'https://other-url.com' } })

    // Change type via select mock
    const select = screen.getByTestId('mock-select')
    fireEvent.change(select, { target: { value: 'type-2' } })

    // Submit
    const submitBtn = screen.getByRole('button', { name: 'Create New Project' })
    fireEvent.click(submitBtn)

    expect(mockOnSubmit).toHaveBeenCalledWith({
      title: 'My ML Project',
      description: 'Project description',
      typeId: 'type-2',
      githubUrl: 'https://github.com/my/project',
      otherUrl: 'https://other-url.com',
    })
  })

  it('uses default project types when projectTypes is not provided', () => {
    render(
      <CreateProjectDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSubmit={mockOnSubmit}
      />
    )

    // Option for default types should be rendered
    expect(screen.getByText('Thèse')).toBeInTheDocument()
    expect(screen.getByText('Stage')).toBeInTheDocument()
    expect(screen.getByText('Autre')).toBeInTheDocument()
  })

  it('triggers onOpenChange(false) when cancel button is clicked', () => {
    render(
      <CreateProjectDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSubmit={mockOnSubmit}
      />
    )

    const cancelBtn = screen.getByRole('button', { name: 'Cancel' })
    fireEvent.click(cancelBtn)

    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('renders spinner when isPending is true', () => {
    render(
      <CreateProjectDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSubmit={mockOnSubmit}
        isPending={true}
      />
    )

    expect(screen.getByTestId('spinner')).toBeInTheDocument()
  })
})
