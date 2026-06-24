// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock react-start createServerFn BEFORE importing fns
vi.mock('@tanstack/react-start', () => {
  return {
    createServerFn: () => {
      console.log('[MOCK_SERVER_FN] createServerFn called')
      return {
        // biome-ignore lint/suspicious/noExplicitAny: Mock handler
        handler: (fn: any) => {
          console.log('[MOCK_SERVER_FN] handler registered')
          // biome-ignore lint/suspicious/noExplicitAny: Mock server function
          return async (args: any) => {
            console.log('[MOCK_SERVER_FN] executing handler with args:', args)
            const result = await fn(args)
            console.log('[MOCK_SERVER_FN] handler returned result:', result)
            return result
          }
        },
      }
    },
  }
})

import { projectCategory, projectFile } from '../../db/schema'
import { decrypt, encrypt } from './crypto-fns'
import {
  disconnectUltralytics,
  exportToUltralytics,
  saveUltralyticsConfig,
} from './ultralytics-fns'

// Mock database
// biome-ignore lint/suspicious/noExplicitAny: Mock variables require flexible shapes
let mockProject: any = null
// biome-ignore lint/suspicious/noExplicitAny: Mock variables require flexible shapes
let mockFiles: any[] = []
// biome-ignore lint/suspicious/noExplicitAny: Mock variables require flexible shapes
let mockCategories: any[] = []
const mockUpdate = vi.fn().mockResolvedValue({ success: true })
const mockSet = vi.fn().mockImplementation(() => ({
  where: mockUpdate,
}))
const mockFindFirstMember = vi.fn()

vi.mock('../../db/index', () => {
  return {
    db: {
      select: vi.fn(() => ({
        from: vi.fn((table) => ({
          where: vi.fn(() => {
            // biome-ignore lint/suspicious/noExplicitAny: Mock return value requires thenable shape
            const result: any = {
              limit: vi.fn().mockResolvedValue(mockProject ? [mockProject] : []),
              // biome-ignore lint/suspicious/noExplicitAny: Mock return value requires thenable shape
              // biome-ignore lint/suspicious/noThenProperty: Mocking Drizzle query builder thenable interface
              then: (onFulfilled: any) => {
                if (table === projectFile) {
                  return Promise.resolve(mockFiles).then(onFulfilled)
                }
                if (table === projectCategory) {
                  return Promise.resolve(mockCategories).then(onFulfilled)
                }
                return Promise.resolve([]).then(onFulfilled)
              },
            }
            return result
          }),
        })),
      })),
      update: vi.fn(() => ({
        set: mockSet,
      })),
      query: {
        member: {
          // biome-ignore lint/suspicious/noExplicitAny: Mock call forwarder
          findFirst: (...args: any[]) => mockFindFirstMember(...args),
        },
      },
    },
  }
})

// Mock Better Auth
const mockGetSession = vi.fn()
const mockHasPermission = vi.fn()
vi.mock('../../lib/auth', () => ({
  auth: {
    api: {
      // biome-ignore lint/suspicious/noExplicitAny: Mock call forwarder
      getSession: (...args: any[]) => mockGetSession(...args),
      // biome-ignore lint/suspicious/noExplicitAny: Mock call forwarder
      hasPermission: (...args: any[]) => mockHasPermission(...args),
    },
  },
}))

// Mock Supabase
// biome-ignore lint/suspicious/noExplicitAny: Mock upload error
let mockUploadError: any = null
const mockUpload = vi.fn()
vi.mock('@/lib/supabase', () => ({
  supabase: {
    storage: {
      from: () => ({
        // biome-ignore lint/suspicious/noExplicitAny: Mock call forwarder
        upload: (...args: any[]) => {
          mockUpload(...args)
          return Promise.resolve({ error: mockUploadError })
        },
        getPublicUrl: () => ({
          data: { publicUrl: 'https://supabase.com/public/ndjson-file.ndjson' },
        }),
      }),
    },
  },
}))

// Mock global fetch
const mockFetch = vi.fn()
// biome-ignore lint/suspicious/noExplicitAny: Mock call forwarder
vi.stubGlobal('fetch', (...args: any[]) => mockFetch(...args))

// Mock react-start/server helpers
vi.mock('@tanstack/react-start/server', () => ({
  getRequest: () => ({
    headers: new Headers({
      cookie: 'test-cookie',
    }),
  }),
}))

describe('Ultralytics Server Functions', () => {
  const SECRET_KEY = 'my-super-secret-key-that-is-32-chars-long-or-more'

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.BETTER_AUTH_SECRET = SECRET_KEY

    // Reset database mock values
    mockProject = {
      id: 'proj-1',
      title: 'Potato Leaves',
      slug: 'potato-leaves',
      organizationId: 'org-1',
      ultralyticsApiKey: null,
    }
    mockFiles = []
    mockCategories = []
    mockUploadError = null

    // Default permissions: authorized
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockHasPermission.mockResolvedValue({ hasPermission: true })
    mockFindFirstMember.mockResolvedValue({ role: 'admin' })
  })

  afterEach(() => {
    delete process.env.BETTER_AUTH_SECRET
  })

  describe('saveUltralyticsConfig', () => {
    it('saves encrypted key successfully when user has permissions', async () => {
      const result = await saveUltralyticsConfig({
        data: { projectId: 'proj-1', apiKey: 'ultra-api-key-xyz' },
      })

      expect(result).toEqual({ success: true })
      expect(mockSet).toHaveBeenCalled()

      // The key should have been encrypted
      const encryptedValue = mockSet.mock.calls[0][0].ultralyticsApiKey
      expect(encryptedValue).not.toBe('ultra-api-key-xyz')
      expect(decrypt(encryptedValue, SECRET_KEY)).toBe('ultra-api-key-xyz')
    })

    it('throws unauthorized error if user does not have permission', async () => {
      mockHasPermission.mockResolvedValue({ hasPermission: false })
      mockFindFirstMember.mockResolvedValue(null)

      await expect(
        saveUltralyticsConfig({
          data: { projectId: 'proj-1', apiKey: 'key' },
        }),
      ).rejects.toThrow('Unauthorized')
    })

    it('throws encryption secret error if secret key is missing', async () => {
      delete process.env.BETTER_AUTH_SECRET
      await expect(
        saveUltralyticsConfig({
          data: { projectId: 'proj-1', apiKey: 'key' },
        }),
      ).rejects.toThrow('Encryption secret is not configured on the server')
    })
  })

  describe('disconnectUltralytics', () => {
    it('sets integration key to null successfully', async () => {
      const result = await disconnectUltralytics({
        data: { projectId: 'proj-1' },
      })

      expect(result).toEqual({ success: true })
      expect(mockSet).toHaveBeenCalledWith({ ultralyticsApiKey: null })
    })
  })

  describe('exportToUltralytics', () => {
    it('returns error if integration is not configured', async () => {
      mockProject.ultralyticsApiKey = null
      const result = await exportToUltralytics({
        data: { projectId: 'proj-1' },
      })
      expect(result).toEqual({
        success: false,
        message: 'Ultralytics is not configured for this project',
        exported: 0,
      })
    })

    it('returns error if no labeled files are found', async () => {
      mockProject.ultralyticsApiKey = encrypt('api-key', SECRET_KEY)
      mockFiles = [
        {
          id: 'f-1',
          name: 'unlabeled.jpg',
          url: 'http://img.jpg',
          labeled: false,
          categoryId: null,
        },
      ]

      const result = await exportToUltralytics({
        data: { projectId: 'proj-1' },
      })
      expect(result).toEqual({
        success: false,
        message: 'No labeled images to export',
        exported: 0,
      })
    })

    it('creates and ingests dataset successfully when labeled images exist', async () => {
      mockProject.ultralyticsApiKey = encrypt('api-key', SECRET_KEY)
      mockFiles = [
        { id: 'f-1', name: 'f1.jpg', url: 'http://f1.jpg', labeled: true, categoryId: 'cat-1' },
      ]
      mockCategories = [{ id: 'cat-1', name: 'healthy' }]

      // Mock fetch: A. Create dataset success, B. Ingest success
      // biome-ignore lint/suspicious/noExplicitAny: Mock fetch callback
      mockFetch.mockImplementation((url: string, _init: any) => {
        if (url.includes('/api/datasets/ingest')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            text: () => Promise.resolve(JSON.stringify({ jobId: 'job-999' })),
          })
        }
        if (url.includes('/api/datasets')) {
          return Promise.resolve({
            ok: true,
            status: 201,
            text: () => Promise.resolve(JSON.stringify({ datasetId: 'dataset-123' })),
          })
        }
        return Promise.reject(new Error(`Unhandled fetch url: ${url}`))
      })

      const result = await exportToUltralytics({
        data: { projectId: 'proj-1' },
      })

      expect(mockUpload).toHaveBeenCalled()
      expect(result).toEqual({
        success: true,
        exported: 1,
        message: '1 images sent to Ultralytics Platform',
        jobId: 'job-999',
        datasetId: 'dataset-123',
      })
    })

    it('resolves existing dataset on conflict (409 status)', async () => {
      mockProject.ultralyticsApiKey = encrypt('api-key', SECRET_KEY)
      mockFiles = [
        { id: 'f-1', name: 'f1.jpg', url: 'http://f1.jpg', labeled: true, categoryId: 'cat-1' },
      ]
      mockCategories = [{ id: 'cat-1', name: 'healthy' }]

      // biome-ignore lint/suspicious/noExplicitAny: Mock fetch callback
      mockFetch.mockImplementation((url: string, _init: any) => {
        if (url.includes('/api/datasets/ingest')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            text: () => Promise.resolve(JSON.stringify({ jobId: 'job-999' })),
          })
        }
        if (url.includes('/api/datasets?slug=')) {
          // List endpoint mock to resolve conflict
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ datasets: [{ _id: 'existing-dataset-id' }] }),
          })
        }
        if (url.includes('/api/datasets')) {
          // Conflict status code
          return Promise.resolve({
            ok: false,
            status: 409,
            text: () => Promise.resolve('Conflict dataset'),
          })
        }
        return Promise.reject(new Error('Unknown url'))
      })

      const result = await exportToUltralytics({
        data: { projectId: 'proj-1' },
      })

      expect(result.success).toBe(true)
      expect(result.datasetId).toBe('existing-dataset-id')
    })
  })
})
