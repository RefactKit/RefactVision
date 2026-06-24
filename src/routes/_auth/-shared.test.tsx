import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import {
  AuthShell,
  cn,
  Divider,
  GithubIcon,
  GoogleIcon,
  LinkedinIcon,
  Logo,
  MicrosoftIcon,
  TwitterIcon,
} from './-shared'

// Mock subcomponents
vi.mock('@/components/shared/header', () => ({
  Header: () => <div data-testid="mock-header">Mock Header</div>,
}))

vi.mock('@/components/ui/dot-pattern', () => ({
  DotPattern: () => <div data-testid="mock-dot-pattern">Mock Dot Pattern</div>,
}))

vi.mock('@/components/shared/logo', () => ({
  Logo: () => <div data-testid="mock-logo">Mock Logo</div>,
}))

// Mock translations
vi.mock('@/i18n/context', () => ({
  useI18n: () => ({
    t: {
      common: {
        or: 'OR-DIVIDER-TEXT',
      },
    },
  }),
}))

describe('Auth shared components and helpers', () => {
  describe('cn local helper', () => {
    it('should filter out falsy values and join with space', () => {
      expect(cn('class1', null, 'class2', undefined, false, 'class3')).toBe('class1 class2 class3')
    })

    it('should return empty string if no truthy values are provided', () => {
      expect(cn(null, undefined, false)).toBe('')
    })
  })

  describe('Logo component', () => {
    it('renders the shared Logo mock', () => {
      render(<Logo />)
      expect(screen.getByTestId('mock-logo')).toBeInTheDocument()
    })
  })

  describe('Divider component', () => {
    it('renders divider with internationalized or text', () => {
      render(<Divider />)
      expect(screen.getByText('OR-DIVIDER-TEXT')).toBeInTheDocument()
    })
  })

  describe('Icon components', () => {
    it('renders all social login icons', () => {
      const { rerender } = render(<GoogleIcon />)
      expect(screen.getByTitle('Google')).toBeInTheDocument()

      rerender(<LinkedinIcon />)
      expect(screen.getByTitle('LinkedIn')).toBeInTheDocument()

      rerender(<GithubIcon />)
      expect(screen.getByTitle('GitHub')).toBeInTheDocument()

      rerender(<TwitterIcon />)
      expect(screen.getByTitle('Twitter (X)')).toBeInTheDocument()

      rerender(<MicrosoftIcon />)
      expect(screen.getByTitle('Microsoft')).toBeInTheDocument()
    })
  })

  describe('AuthShell component', () => {
    it('renders header, children, badges, and features list', () => {
      const testFeatures = ['Feature A', 'Feature B']
      render(
        <AuthShell
          badge="Beta Release"
          heading="Welcome back"
          subheading="Please log in to your account"
          features={testFeatures}
        >
          <div data-testid="auth-child">Auth Child Content</div>
        </AuthShell>,
      )

      // Verify header is rendered
      expect(screen.getByTestId('mock-header')).toBeInTheDocument()

      // Verify basic content elements
      expect(screen.getByText('Beta Release')).toBeInTheDocument()
      expect(screen.getByText('Welcome back')).toBeInTheDocument()
      expect(screen.getByText('Please log in to your account')).toBeInTheDocument()

      // Verify custom children content
      expect(screen.getByTestId('auth-child')).toBeInTheDocument()

      // Verify feature bullet points are rendered
      for (const feature of testFeatures) {
        expect(screen.getByText(feature)).toBeInTheDocument()
      }
    })

    it('renders correctly without features list', () => {
      render(
        <AuthShell badge="Beta" heading="Hello" subheading="World">
          <div>Content</div>
        </AuthShell>,
      )

      expect(screen.queryByRole('list')).toBeNull()
    })
  })
})
