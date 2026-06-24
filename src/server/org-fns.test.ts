// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock react-start createServerFn BEFORE importing fns
vi.mock('@tanstack/react-start', () => {
  return {
    createServerFn: () => ({
      // biome-ignore lint/suspicious/noExplicitAny: Mock handler
      handler: (fn: any) => {
        // biome-ignore lint/suspicious/noExplicitAny: Mock server function
        return async (args: any) => fn(args)
      },
    }),
  }
})

// Mock react-start/server helpers
vi.mock('@tanstack/react-start/server', () => ({
  getRequest: () => ({
    headers: new Headers({
      cookie: 'test-cookie',
    }),
  }),
}))

// Mock Drizzle
const mockMemberFindMany = vi.fn()
const mockMemberFindFirst = vi.fn()
const mockOrgFindFirst = vi.fn()
const mockRoleFindFirst = vi.fn()
const mockUpdate = vi.fn().mockResolvedValue({ success: true })
const mockSet = vi.fn().mockImplementation(() => ({
  where: mockUpdate,
}))
const mockInsert = vi.fn().mockResolvedValue({ success: true })

vi.mock('../../db/index', () => {
  return {
    db: {
      update: vi.fn(() => ({
        set: mockSet,
      })),
      insert: vi.fn(() => ({
        values: mockInsert,
      })),
      query: {
        member: {
          findMany: (...args: unknown[]) => mockMemberFindMany(...args),
          findFirst: (...args: unknown[]) => mockMemberFindFirst(...args),
        },
        organization: {
          findFirst: (...args: unknown[]) => mockOrgFindFirst(...args),
        },
        organizationRole: {
          findFirst: (...args: unknown[]) => mockRoleFindFirst(...args),
        },
      },
    },
  }
})

// Mock Better Auth
const mockGetSession = vi.fn()
const mockCreateOrg = vi.fn()
const mockDeleteOrg = vi.fn()

vi.mock('../../lib/auth', () => ({
  auth: {
    api: {
      getSession: (...args: unknown[]) => mockGetSession(...args),
      createOrganization: (...args: unknown[]) => mockCreateOrg(...args),
      deleteOrganization: (...args: unknown[]) => mockDeleteOrg(...args),
    },
  },
}))

import {
  checkUserHasOrg,
  createOrganization,
  deleteOrganization,
  getOrgBySlug,
  getUserOrgs,
  updateOrganization,
} from './org-fns'

describe('Organization Server Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default: Authorized user
    mockGetSession.mockResolvedValue({
      user: { id: 'user-1', name: 'Alice', email: 'alice@example.com' },
    })
  })

  describe('getUserOrgs', () => {
    it('returns empty list if not logged in', async () => {
      mockGetSession.mockResolvedValue(null)
      const result = await getUserOrgs()
      expect(result).toEqual({ orgs: [] })
    })

    it('returns memberships maps correctly', async () => {
      mockMemberFindMany.mockResolvedValue([
        {
          role: 'owner',
          organization: {
            id: 'org-1',
            name: 'Workspace Alpha',
            slug: 'workspace-alpha',
            logoUrl: 'http://logo.png',
          },
        },
      ])

      const result = await getUserOrgs()
      expect(result.orgs).toHaveLength(1)
      expect(result.orgs[0]).toEqual({
        id: 'org-1',
        name: 'Workspace Alpha',
        slug: 'workspace-alpha',
        logo: 'http://logo.png',
        role: 'owner',
      })
    })
  })

  describe('checkUserHasOrg', () => {
    it('returns false if not logged in', async () => {
      mockGetSession.mockResolvedValue(null)
      const result = await checkUserHasOrg()
      expect(result).toEqual({ hasOrg: false })
    })

    it('returns true if user has memberships', async () => {
      mockMemberFindFirst.mockResolvedValue({ id: 'mem-1' })
      const result = await checkUserHasOrg()
      expect(result).toEqual({ hasOrg: true })
    })

    it('returns false if user has no memberships', async () => {
      mockMemberFindFirst.mockResolvedValue(null)
      const result = await checkUserHasOrg()
      expect(result).toEqual({ hasOrg: false })
    })
  })

  describe('getOrgBySlug', () => {
    it('returns null if not logged in', async () => {
      mockGetSession.mockResolvedValue(null)
      const result = await getOrgBySlug({ data: { slug: 'org-1' } })
      expect(result).toEqual({ org: null, role: null })
    })

    it('returns null if organization not found', async () => {
      mockOrgFindFirst.mockResolvedValue(null)
      const result = await getOrgBySlug({ data: { slug: 'org-not-found' } })
      expect(result).toEqual({ org: null, role: null })
    })

    it('returns null if user is not a member of the organization', async () => {
      mockOrgFindFirst.mockResolvedValue({ id: 'org-1', name: 'Org 1', slug: 'org-1' })
      mockMemberFindFirst.mockResolvedValue(null)
      const result = await getOrgBySlug({ data: { slug: 'org-1' } })
      expect(result).toEqual({ org: null, role: null, permissions: null })
    })

    it('returns organization details and role for a member', async () => {
      mockOrgFindFirst.mockResolvedValue({
        id: 'org-1',
        name: 'Org 1',
        slug: 'org-1',
        logoUrl: 'http://logo.png',
      })
      mockMemberFindFirst.mockResolvedValue({ role: 'admin' })
      mockRoleFindFirst.mockResolvedValue({
        permission: '{"project":["create","read"]}',
      })

      const result = await getOrgBySlug({ data: { slug: 'org-1' } })
      expect(result.org).toEqual({
        id: 'org-1',
        name: 'Org 1',
        slug: 'org-1',
        logo: 'http://logo.png',
      })
      expect(result.role).toBe('admin')
      expect(result.permissions).toEqual({ project: ['create', 'read'] })
    })

    it('handles fallback string permissions and json parsing errors', async () => {
      mockOrgFindFirst.mockResolvedValue({ id: 'org-1', name: 'Org 1', slug: 'org-1' })
      mockMemberFindFirst.mockResolvedValue({ role: 'member' })
      mockRoleFindFirst.mockResolvedValue({ permission: 'invalid-json' })

      const result = await getOrgBySlug({ data: { slug: 'org-1' } })
      expect(result.permissions).toBeNull()
    })
  })

  describe('createOrganization', () => {
    it('throws error if organization name is empty', async () => {
      await expect(createOrganization({ data: { name: '  ' } })).rejects.toThrow(
        'Organization name is required',
      )
    })

    it('throws error if not logged in', async () => {
      mockGetSession.mockResolvedValue(null)
      await expect(createOrganization({ data: { name: 'My Org' } })).rejects.toThrow('Unauthorized')
    })

    it('blocks members from creating orgs if they are not owners/admins in any existing org', async () => {
      mockMemberFindMany.mockResolvedValue([{ role: 'member' }])
      await expect(createOrganization({ data: { name: 'New Org' } })).rejects.toThrow(
        'As a member, you do not have permission to create new organizations.',
      )
    })

    it('throws error if organization name is already taken', async () => {
      mockMemberFindMany.mockResolvedValue([])
      mockOrgFindFirst.mockResolvedValue({ id: 'existing-org-id', name: 'Conflict Org' })

      await expect(createOrganization({ data: { name: 'Conflict Org' } })).rejects.toThrow(
        'Organization name already taken',
      )
    })

    it('throws error if organization slug is already taken', async () => {
      mockMemberFindMany.mockResolvedValue([])
      // First findFirst (for name) is null
      mockOrgFindFirst.mockResolvedValueOnce(null)
      // Second findFirst (for slug check) has a value
      mockOrgFindFirst.mockResolvedValueOnce({ id: 'existing-org-id', slug: 'conflict-slug' })

      await expect(createOrganization({ data: { name: 'conflict-slug' } })).rejects.toThrow(
        'Organization name already taken',
      )
    })

    it('creates organization successfully and seeds default project types', async () => {
      mockMemberFindMany.mockResolvedValue([])
      mockOrgFindFirst.mockResolvedValue(null)
      mockCreateOrg.mockResolvedValue({
        id: 'new-org-123',
        name: 'Success Org',
        slug: 'success-org',
        logo: 'logo.jpg',
      })

      const result = await createOrganization({ data: { name: 'Success Org', logo: 'logo.jpg' } })

      expect(result.org.id).toBe('new-org-123')
      expect(mockCreateOrg).toHaveBeenCalled()
      expect(mockUpdate).toHaveBeenCalled()
      expect(mockInsert).toHaveBeenCalledTimes(3) // THESE, STAGE, AUTRE
    })
  })

  describe('deleteOrganization', () => {
    it('throws error if not logged in', async () => {
      mockGetSession.mockResolvedValue(null)
      await expect(deleteOrganization({ data: { organizationId: 'org-1' } })).rejects.toThrow(
        'Unauthorized',
      )
    })

    it('throws error if user is not the owner', async () => {
      mockMemberFindFirst.mockResolvedValue({ role: 'admin' })
      await expect(deleteOrganization({ data: { organizationId: 'org-1' } })).rejects.toThrow(
        'Only the owner can delete the organization',
      )
    })

    it('deletes organization successfully if owner', async () => {
      mockMemberFindFirst.mockResolvedValue({ role: 'owner' })
      const result = await deleteOrganization({ data: { organizationId: 'org-1' } })
      expect(result).toEqual({ success: true })
      expect(mockDeleteOrg).toHaveBeenCalled()
    })
  })

  describe('updateOrganization', () => {
    it('throws error if not logged in', async () => {
      mockGetSession.mockResolvedValue(null)
      await expect(
        updateOrganization({ data: { organizationId: 'org-1', name: 'Updated' } }),
      ).rejects.toThrow('Unauthorized')
    })

    it('throws error if user has no role or is not admin/owner', async () => {
      mockMemberFindFirst.mockResolvedValue(null)
      await expect(
        updateOrganization({ data: { organizationId: 'org-1', name: 'Updated' } }),
      ).rejects.toThrow('Only admins or owners can update the organization settings')
    })

    it('throws error if organization name is already taken by another organization', async () => {
      mockMemberFindFirst.mockResolvedValue({ role: 'admin' })
      mockOrgFindFirst.mockResolvedValue({ id: 'other-org-id', name: 'Taken Name' })

      await expect(
        updateOrganization({ data: { organizationId: 'org-1', name: 'Taken Name' } }),
      ).rejects.toThrow('Organization name already taken')
    })

    it('throws error if organization slug is already taken by another organization', async () => {
      mockMemberFindFirst.mockResolvedValue({ role: 'owner' })
      mockOrgFindFirst.mockResolvedValueOnce(null) // Name check is ok
      mockOrgFindFirst.mockResolvedValueOnce({ id: 'other-org-id', slug: 'taken-slug' }) // Slug conflict

      await expect(
        updateOrganization({
          data: { organizationId: 'org-1', name: 'Ok Name', slug: 'taken-slug' },
        }),
      ).rejects.toThrow('Organization slug already taken')
    })

    it('updates organization parameters successfully', async () => {
      mockMemberFindFirst.mockResolvedValue({ role: 'owner' })
      // No name/slug conflicts
      mockOrgFindFirst.mockResolvedValue(null)
      // Return value for findFirst after update
      mockOrgFindFirst.mockResolvedValue({
        id: 'org-1',
        name: 'New Name',
        slug: 'new-slug',
        logoUrl: 'logo.png',
      })

      const result = await updateOrganization({
        data: { organizationId: 'org-1', name: 'New Name', slug: 'new-slug', logo: 'logo.png' },
      })

      expect(result.org).toBeDefined()
      expect(result.org?.name).toBe('New Name')
      expect(mockSet).toHaveBeenCalled()
    })
  })
})
