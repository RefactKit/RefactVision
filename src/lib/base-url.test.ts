import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getBaseURL } from './base-url'

describe('getBaseURL utility', () => {
  const originalPROD = import.meta.env.PROD
  const originalURL = import.meta.env.VITE_APP_URL

  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    // Restore original env properties
    // biome-ignore lint/suspicious/noExplicitAny: Mutating env properties for testing
    ;(import.meta.env as any).PROD = originalPROD
    // biome-ignore lint/suspicious/noExplicitAny: Mutating env properties for testing
    ;(import.meta.env as any).VITE_APP_URL = originalURL
  })

  it('should return undefined in a browser environment', () => {
    // Stub window global to simulate browser environment
    vi.stubGlobal('window', {})
    expect(getBaseURL()).toBeUndefined()
  })

  it('should return relative or specified URL on server-side production', () => {
    // Ensure window is undefined (simulating server)
    vi.stubGlobal('window', undefined)
    // biome-ignore lint/suspicious/noExplicitAny: Mutating env properties for testing
    ;(import.meta.env as any).PROD = true

    // Scenario A: VITE_APP_URL is empty -> should return undefined
    // biome-ignore lint/suspicious/noExplicitAny: Mutating env properties for testing
    ;(import.meta.env as any).VITE_APP_URL = ''
    expect(getBaseURL()).toBeUndefined()

    // Scenario B: VITE_APP_URL is set -> should return the URL
    // biome-ignore lint/suspicious/noExplicitAny: Mutating env properties for testing
    ;(import.meta.env as any).VITE_APP_URL = 'https://my-app.vercel.app'
    expect(getBaseURL()).toBe('https://my-app.vercel.app')
  })

  it('should return VITE_APP_URL or fallback on server-side development', () => {
    // Ensure window is undefined (simulating server)
    vi.stubGlobal('window', undefined)
    // biome-ignore lint/suspicious/noExplicitAny: Mutating env properties for testing
    ;(import.meta.env as any).PROD = false

    // Scenario A: VITE_APP_URL is empty -> should return localhost:3000
    // biome-ignore lint/suspicious/noExplicitAny: Mutating env properties for testing
    ;(import.meta.env as any).VITE_APP_URL = ''
    expect(getBaseURL()).toBe('http://localhost:3000')

    // Scenario B: VITE_APP_URL is set -> should return the URL
    // biome-ignore lint/suspicious/noExplicitAny: Mutating env properties for testing
    ;(import.meta.env as any).VITE_APP_URL = 'http://localhost:5000'
    expect(getBaseURL()).toBe('http://localhost:5000')
  })
})
