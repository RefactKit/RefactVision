import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AnimatedThemeToggler } from './animated-theme-toggler'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from './field'
import { TypingAnimation } from './typing-animation'

const mockSetTheme = vi.fn()
let mockTheme = {
  theme: 'light',
  setTheme: mockSetTheme,
  resolvedTheme: 'light',
}

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: () => mockTheme,
}))

// Stub IntersectionObserver for framer-motion useInView
vi.stubGlobal('IntersectionObserver', class {
  observe() {}
  unobserve() {}
  disconnect() {}
})

// Define global stubs for JSDOM
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

if (typeof document !== 'undefined') {
  Object.defineProperty(document.documentElement, 'animate', {
    writable: true,
    configurable: true,
    value: vi.fn().mockReturnValue({
      finished: Promise.resolve(),
      cancel: vi.fn(),
    }),
  })
}

describe('UI Components', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockTheme = {
      theme: 'light',
      setTheme: mockSetTheme,
      resolvedTheme: 'light',
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

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

    it('renders block and underscore cursor styles', () => {
      const { unmount: unmountBlock } = render(
        <TypingAnimation startOnView={false} cursorStyle="block" words={['A']} />
      )
      expect(screen.getByText('▌')).toBeInTheDocument()
      unmountBlock()

      const { unmount: unmountUnderscore } = render(
        <TypingAnimation startOnView={false} cursorStyle="underscore" words={['A']} />
      )
      expect(screen.getByText('_')).toBeInTheDocument()
      unmountUnderscore()
    })

    it('goes through typing, pause, and deleting phases with multiple words', () => {
      vi.useFakeTimers()
      render(
        <TypingAnimation
          startOnView={false}
          duration={5}
          typeSpeed={5}
          deleteSpeed={5}
          pauseDelay={10}
          loop={true}
          words={['Hi', 'Go']}
        />
      )

      for (let i = 0; i < 20; i++) {
        act(() => {
          vi.advanceTimersByTime(5)
        })
      }
      vi.useRealTimers()
    })
  })

  describe('AnimatedThemeToggler', () => {
    it('renders theme toggler button', () => {
      render(<AnimatedThemeToggler />)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('toggles theme using fallback when startViewTransition is not available', () => {
      render(<AnimatedThemeToggler />)
      const button = screen.getByRole('button')
      fireEvent.click(button)
      expect(mockSetTheme).toHaveBeenCalledWith('dark')
    })

    it('toggles theme with view transition when startViewTransition is available', () => {
      mockTheme = {
        theme: 'dark',
        setTheme: mockSetTheme,
        resolvedTheme: 'dark',
      }

      const readyPromise = Promise.resolve()
      const mockStartViewTransition = vi.fn((callback: () => void) => {
        callback()
        return {
          ready: readyPromise,
          finished: {
            finally: (cb: () => void) => cb(),
          },
        }
      })

      // Stub startViewTransition on document
      Object.defineProperty(document, 'startViewTransition', {
        value: mockStartViewTransition,
        writable: true,
        configurable: true,
      })

      const variants: ('circle' | 'square' | 'triangle' | 'diamond' | 'hexagon' | 'rectangle' | 'star')[] = [
        'circle',
        'square',
        'triangle',
        'diamond',
        'hexagon',
        'rectangle',
        'star'
      ]

      for (const variant of variants) {
        const { unmount } = render(
          <AnimatedThemeToggler variant={variant} fromCenter={true} />
        )
        const button = screen.getByRole('button')
        fireEvent.click(button)
        expect(mockStartViewTransition).toHaveBeenCalled()
        expect(mockSetTheme).toHaveBeenCalledWith('light')
        vi.clearAllMocks()
        unmount()
      }

      // Test with fromCenter = false and undefined shape/variant
      const { unmount } = render(
        <AnimatedThemeToggler fromCenter={false} />
      )
      const button = screen.getByRole('button')
      fireEvent.click(button)
      expect(mockStartViewTransition).toHaveBeenCalled()
      unmount()

      // Clean up
      // @ts-ignore
      delete document.startViewTransition
    })

    it('uses fallback when prefers-reduced-motion is true', () => {
      const mockStartViewTransition = vi.fn()
      Object.defineProperty(document, 'startViewTransition', {
        value: mockStartViewTransition,
        writable: true,
        configurable: true,
      })

      const originalMatchMedia = window.matchMedia
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        configurable: true,
        value: vi.fn().mockReturnValue({ matches: true }),
      })

      render(<AnimatedThemeToggler />)
      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(mockStartViewTransition).not.toHaveBeenCalled()
      expect(mockSetTheme).toHaveBeenCalledWith('dark')

      // @ts-ignore
      delete document.startViewTransition
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        configurable: true,
        value: originalMatchMedia,
      })
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

    it('renders fields with different orientations and legend variants', () => {
      render(
        <FieldSet>
          <FieldLegend variant="label">Label Legend</FieldLegend>
          <FieldGroup>
            <Field orientation="horizontal">
              <FieldLabel>Horizontal Label</FieldLabel>
            </Field>
            <Field orientation="responsive">
              <FieldLabel>Responsive Label</FieldLabel>
            </Field>
          </FieldGroup>
        </FieldSet>
      )
      expect(screen.getByText('Label Legend')).toBeInTheDocument()
      expect(screen.getByText('Horizontal Label')).toBeInTheDocument()
      expect(screen.getByText('Responsive Label')).toBeInTheDocument()
    })

    it('renders FieldSeparator with and without children', () => {
      const { rerender } = render(<FieldSeparator />)
      expect(screen.getByRole('separator')).toBeInTheDocument()

      rerender(<FieldSeparator>Or</FieldSeparator>)
      expect(screen.getByText('Or')).toBeInTheDocument()
    })

    it('renders FieldError with custom children or multiple errors', () => {
      const { rerender } = render(<FieldError>Custom Error Message</FieldError>)
      expect(screen.getByText('Custom Error Message')).toBeInTheDocument()

      const errors = [
        { message: 'Error A' },
        { message: 'Error B' },
        { message: 'Error A' },
      ]
      rerender(<FieldError errors={errors} />)
      expect(screen.getByText('Error A')).toBeInTheDocument()
      expect(screen.getByText('Error B')).toBeInTheDocument()
    })
  })
})
