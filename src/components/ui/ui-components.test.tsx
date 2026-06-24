import { act, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AnimatedThemeToggler } from './animated-theme-toggler'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from './field'
import { TypingAnimation } from './typing-animation'

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: vi.fn(),
    resolvedTheme: 'light',
  }),
}))

// Stub IntersectionObserver for framer-motion useInView
vi.stubGlobal(
  'IntersectionObserver',
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
)

describe('UI Components', () => {
  describe('TypingAnimation', () => {
    it('renders with text child successfully', () => {
      vi.useFakeTimers()
      render(<TypingAnimation startOnView={false} duration={10} words={['Hello World']} />)

      for (let i = 0; i < 12; i++) {
        act(() => {
          vi.advanceTimersByTime(15)
        })
      }

      expect(screen.getByText(/Hello/i)).toBeInTheDocument()
      vi.useRealTimers()
    })
  })

  describe('AnimatedThemeToggler', () => {
    it('renders theme toggler button', () => {
      render(<AnimatedThemeToggler />)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })

  describe('Field Components Group', () => {
    it('renders form fields with labels, legends, and errors', () => {
      const errorList = [{ message: 'Field name is required' }]

      render(
        <FieldSet>
          <FieldLegend>Legend Title</FieldLegend>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="test-input">Test Label</FieldLabel>
              <FieldTitle>Test Title</FieldTitle>
              <FieldContent>
                <input id="test-input" defaultValue="val" />
              </FieldContent>
              <FieldDescription>Description of input field</FieldDescription>
              <FieldError errors={errorList} />
            </Field>
          </FieldGroup>
        </FieldSet>,
      )

      expect(screen.getByText('Legend Title')).toBeInTheDocument()
      expect(screen.getByText('Test Label')).toBeInTheDocument()
      expect(screen.getByText('Test Title')).toBeInTheDocument()
      expect(screen.getByText('Description of input field')).toBeInTheDocument()
      expect(screen.getByText('Field name is required')).toBeInTheDocument()
    })
  })
})
