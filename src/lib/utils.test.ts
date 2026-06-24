import { describe, expect, it } from 'vitest'
import { cn, getFileCategoryIds } from './utils'

describe('cn helper', () => {
  it('should merge class names correctly', () => {
    expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white')
  })

  it('should handle conditional classes', () => {
    expect(cn('bg-red-500', false && 'text-white', true && 'font-bold')).toBe(
      'bg-red-500 font-bold',
    )
  })

  it('should merge conflicting Tailwind classes', () => {
    expect(cn('px-2 py-1', 'p-4')).toBe('p-4')
  })

  it('should handle empty/undefined inputs', () => {
    expect(cn('', undefined, null)).toBe('')
  })
})

describe('getFileCategoryIds helper', () => {
  it('should return an empty array if no categoryId or metadata is provided', () => {
    const file = { categoryId: null }
    expect(getFileCategoryIds(file)).toEqual([])
  })

  it('should include categoryId if present', () => {
    const file = { categoryId: 'cat-1' }
    expect(getFileCategoryIds(file)).toEqual(['cat-1'])
  })

  it('should parse metadata and append categoryIds', () => {
    const file = {
      categoryId: 'cat-1',
      metadata: JSON.stringify({ categoryIds: ['cat-2', 'cat-3'] }),
    }
    expect(getFileCategoryIds(file)).toEqual(['cat-1', 'cat-2', 'cat-3'])
  })

  it('should deduplicate categoryIds if they match categoryId or each other', () => {
    const file = {
      categoryId: 'cat-1',
      metadata: JSON.stringify({ categoryIds: ['cat-1', 'cat-2', 'cat-2'] }),
    }
    expect(getFileCategoryIds(file)).toEqual(['cat-1', 'cat-2'])
  })

  it('should handle invalid JSON in metadata gracefully', () => {
    const file = {
      categoryId: 'cat-1',
      metadata: '{ invalid json }',
    }
    expect(getFileCategoryIds(file)).toEqual(['cat-1'])
  })

  it('should handle metadata without categoryIds or when categoryIds is not an array', () => {
    const file1 = {
      categoryId: 'cat-1',
      metadata: JSON.stringify({ otherField: 'test' }),
    }
    const file2 = {
      categoryId: 'cat-1',
      metadata: JSON.stringify({ categoryIds: 'not-an-array' }),
    }
    expect(getFileCategoryIds(file1)).toEqual(['cat-1'])
    expect(getFileCategoryIds(file2)).toEqual(['cat-1'])
  })
})
