import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useIsMobile } from './use-mobile'

describe('useIsMobile hook', () => {
  let changeCallback: (() => void) | null = null
  const addEventListenerMock = vi.fn((event, callback) => {
    if (event === 'change') {
      changeCallback = callback
    }
  })
  const removeEventListenerMock = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('innerWidth', 1024)
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: addEventListenerMock,
        removeEventListener: removeEventListenerMock,
        dispatchEvent: vi.fn(),
      })),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    changeCallback = null
    addEventListenerMock.mockClear()
    removeEventListenerMock.mockClear()
  })

  it('should return false on desktop sizes', () => {
    vi.stubGlobal('innerWidth', 1024)
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })

  it('should return true on mobile sizes', () => {
    vi.stubGlobal('innerWidth', 375)
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })

  it('should update state when media query listener fires', () => {
    vi.stubGlobal('innerWidth', 1024)
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)

    // Simulate window resizing to mobile and triggering listener
    act(() => {
      vi.stubGlobal('innerWidth', 375)
      if (changeCallback) {
        changeCallback()
      }
    })

    expect(result.current).toBe(true)
  })

  it('should clean up the listener on unmount', () => {
    const { unmount } = renderHook(() => useIsMobile())
    expect(addEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function))
    unmount()
    expect(removeEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function))
  })
})
