// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock react-start createServerFn BEFORE importing fns
vi.mock('@tanstack/react-start', () => ({
  createServerFn: () => ({
    // biome-ignore lint/suspicious/noExplicitAny: Mock handler
    handler: (fn: any) => {
      // biome-ignore lint/suspicious/noExplicitAny: Mock server function
      return async (args: any) => fn(args)
    },
  }),
}))

// Mock S3 Client
const { mockSend } = vi.hoisted(() => ({
  mockSend: vi.fn(),
}))

vi.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: class {
      send = mockSend
    },
    PutObjectCommand: class {},
  }
})

import { uploadFile } from './storage-fns'

describe('Storage Server Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSend.mockResolvedValue({})
  })

  it('uploads a file successfully and returns URL and path details', async () => {
    const file = new File(['file-content-here'], 'test-image.jpg', { type: 'image/jpeg' })
    const formData = new FormData()
    formData.append('file', file)
    formData.append('bucket', 'test-bucket')
    formData.append('path', 'custom-folder')

    const result = await uploadFile({ data: formData })

    expect(result.success ?? true).toBe(true)
    expect(result.url).toContain('test-bucket/custom-folder/')
    expect(result.name).toBe('test-image.jpg')
    expect(result.type).toBe('image/jpeg')
    expect(mockSend).toHaveBeenCalled()
  })

  it('throws an error if no file is provided', async () => {
    const formData = new FormData()
    formData.append('bucket', 'test-bucket')

    await expect(uploadFile({ data: formData })).rejects.toThrow('No file provided')
  })

  it('throws an error if file size exceeds 50MB limit', async () => {
    const file = new File([''], 'huge-file.dat')
    // Mock the size property
    Object.defineProperty(file, 'size', { value: 60 * 1024 * 1024 })

    const formData = new FormData()
    formData.append('file', file)

    await expect(uploadFile({ data: formData })).rejects.toThrow('File size exceeds 50MB limit')
  })

  it('throws a descriptive error when S3 upload fails', async () => {
    mockSend.mockRejectedValue(new Error('S3 Network Connection Timeout'))
    const file = new File(['content'], 'test.png', { type: 'image/png' })
    const formData = new FormData()
    formData.append('file', file)

    await expect(uploadFile({ data: formData })).rejects.toThrow(
      'Upload failed: S3 Network Connection Timeout',
    )
  })
})
