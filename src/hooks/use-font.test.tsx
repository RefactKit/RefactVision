import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { useFont } from './use-font'

describe('useFont hook', () => {
  const FONT_KEY = 'RefactVision-font'

  afterEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-font')
  })

  it('should initialize with default font when localStorage is empty', () => {
    const { result } = renderHook(() => useFont())
    expect(result.current.font).toBe('default')
    expect(document.documentElement.getAttribute('data-font')).toBeNull()
  })

  it('should initialize with saved font from localStorage', () => {
    localStorage.setItem(FONT_KEY, 'geist')
    const { result } = renderHook(() => useFont())
    expect(result.current.font).toBe('geist')
    expect(document.documentElement.getAttribute('data-font')).toBe('geist')
  })

  it('should set font and update localStorage and document attributes', () => {
    const { result } = renderHook(() => useFont())

    // Set to non-default font
    act(() => {
      result.current.setFont('zain')
    })
    expect(result.current.font).toBe('zain')
    expect(localStorage.getItem(FONT_KEY)).toBe('zain')
    expect(document.documentElement.getAttribute('data-font')).toBe('zain')

    // Set back to default
    act(() => {
      result.current.setFont('default')
    })
    expect(result.current.font).toBe('default')
    expect(localStorage.getItem(FONT_KEY)).toBe('default')
    expect(document.documentElement.getAttribute('data-font')).toBeNull()
  })
})
