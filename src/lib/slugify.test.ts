import { describe, expect, it } from 'vitest'
import { slugify } from './slugify'

describe('slugify utility', () => {
  it('should convert to lowercase', () => {
    expect(slugify('RefactKit')).toBe('refactkit')
  })

  it('should replace spaces with hyphens', () => {
    expect(slugify('Launch Kit Pro')).toBe('launch-kit-pro')
  })

  it('should handle special characters by replacing them with hyphens', () => {
    expect(slugify('L@unch! K#t?')).toBe('l-unch-k-t')
  })

  it('should handle accents correctly', () => {
    expect(slugify('Écrit en Français')).toBe('ecrit-en-francais')
  })

  it('should collapse multiple hyphens', () => {
    expect(slugify('launch---kit')).toBe('launch-kit')
  })

  it('should trim trailing hyphens', () => {
    expect(slugify('launch-kit-')).toBe('launch-kit')
  })

  it('should truncate to 48 characters', () => {
    const longName = 'a'.repeat(100)
    expect(slugify(longName)).toHaveLength(48)
  })
})
