import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { useColorTheme } from './use-color-theme'

describe('useColorTheme hook', () => {
  const COLOR_THEME_KEY = 'RefactVision-color-theme'

  afterEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  it('should initialize with default theme when localStorage is empty', () => {
    const { result } = renderHook(() => useColorTheme())
    expect(result.current.colorTheme).toBe('default')
    expect(document.documentElement.getAttribute('data-theme')).toBeNull()
  })

  it('should initialize with saved theme from localStorage', () => {
    localStorage.setItem(COLOR_THEME_KEY, 'maia')
    const { result } = renderHook(() => useColorTheme())
    expect(result.current.colorTheme).toBe('maia')
    expect(document.documentElement.getAttribute('data-theme')).toBe('maia')
  })

  it('should set theme and update localStorage and document attributes', () => {
    const { result } = renderHook(() => useColorTheme())

    // Set to non-default theme
    act(() => {
      result.current.setColorTheme('lyra')
    })
    expect(result.current.colorTheme).toBe('lyra')
    expect(localStorage.getItem(COLOR_THEME_KEY)).toBe('lyra')
    expect(document.documentElement.getAttribute('data-theme')).toBe('lyra')

    // Set back to default
    act(() => {
      result.current.setColorTheme('default')
    })
    expect(result.current.colorTheme).toBe('default')
    expect(localStorage.getItem(COLOR_THEME_KEY)).toBe('default')
    expect(document.documentElement.getAttribute('data-theme')).toBeNull()
  })
})
