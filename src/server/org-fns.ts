import { slugify } from '@/lib/slugify'
import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { and, eq, sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { z } from 'zod'
import { db } from '../../db/index'
import { member, organization, organizationRole, projectType } from '../../db/schema'
import { auth } from '../../lib/auth'

/** Get all active orgs for the current user */
export const getUserOrgs = createServerFn({ method: 'GET' }).handler(async () => {
  const request = getRequest()
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) return { orgs: [] }

  const memberships = await db.query.member.findMany({
    where: eq(member.userId, session.user.id),
    with: { organization: true },
  })

  return {
    orgs: memberships.map((m) => ({
      id: m.organization.id,
      name: m.organization.name,
      slug: m.organization.slug,
      logo: m.organization.logoUrl || m.organization.logo,
      role: m.role,
    })),
  }
})

/** Check if current user has any org */
export const checkUserHasOrg = createServerFn({ method: 'GET' }).handler(async () => {
  const request = getRequest()
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) return { hasOrg: false }

  const userMembership = await db.query.member.findFirst({
    where: eq(member.userId, session.user.id),
  })

  return { hasOrg: !!userMembership }
})

/** Get org by slug and verify the current user is a member */
export const getOrgBySlug = createServerFn({ method: 'GET' }).handler(async ({ data }) => {
  const { slug } = z.object({ slug: z.string() }).parse(data)
  const request = getRequest()
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) return { org: null, role: null }

  const org = await db.query.organization.findFirst({
    where: eq(organization.slug, slug),
  })
  if (!org) return { org: null, role: null }

  const userMembership = await db.query.member.findFirst({
    where: and(eq(member.organizationId, org.id), eq(member.userId, session.user.id)),
  })
  if (!userMembership) return { org: null, role: null, permissions: null }

  // Fetch permissions for this role
  let permissions: any = null
  const dynamicRole = await db.query.organizationRole.findFirst({
    where: and(
      eq(organizationRole.organizationId, org.id),
      eq(organizationRole.role, userMembership.role),
    ),
  })

  if (dynamicRole) {
    try {
      permissions =
        typeof dynamicRole.permission === 'string'
          ? JSON.parse(dynamicRole.permission)
          : dynamicRole.permission
    } catch (e) {
      console.error('Failed to parse dynamic role permissions:', e)
    }
  }

  return {
    org: {
      id: org.id,
      name: org.name,
      slug: org.slug,
      logo: org.logoUrl || org.logo,
    },
    role: userMembership.role,
    permissions,
  }
})

/** Create an organization and assign the current user as owner */
export const createOrganization = createServerFn({ method: 'POST' }).handler(async ({ data }) => {
  const { name, logo } = z
    .object({
      name: z.string().min(1),
      logo: z.string().optional(),
    })
    .parse(data)
  if (!name.trim()) throw new Error('Organization name is required')

  const request = getRequest()
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) throw new Error('Unauthorized')

  // Restriction: If user already has orgs, they must be owner/admin in at least one to create more
  const existingMemberships = await db.query.member.findMany({
    where: eq(member.userId, session.user.id),
  })

  const hasAnyOwnership = existingMemberships.some((m) => m.role === 'owner' || m.role === 'admin')
  const isNewUser = existingMemberships.length === 0

  if (!isNewUser && !hasAnyOwnership) {
    throw new Error('As a member, you do not have permission to create new organizations.')
  }

  // Check if an org with this exact name already exists (case-insensitive)
  const existingName = await db.query.organization.findFirst({
    where: eq(organization.name, name.trim()),
  })
  if (existingName) throw new Error('Organization name already taken')

  const slug = slugify(name) || nanoid(8)

  // Also check slug uniqueness just in case
  const existingSlug = await db.query.organization.findFirst({
    where: eq(organization.slug, slug),
  })
  if (existingSlug) throw new Error('Organization name already taken')

  // Use Better Auth to create the organization
  // Note: We provide userId instead of headers to bypass header-based session checks that might be tricky in server functions
  const createdOrg = await auth.api.createOrganization({
    body: {
      name: name.trim(),
      slug,
      userId: session.user.id,
      logo: logo,
    },
  })

  // Update logo_url as well
  if (logo) {
    await db.update(organization).set({ logoUrl: logo }).where(eq(organization.id, createdOrg.id))
  }

  // Seed default project types
  const defaultTypes = ['THESE', 'STAGE', 'AUTRE']
  for (const typeName of defaultTypes) {
    await db.insert(projectType).values({
      id: nanoid(),
      name: typeName,
      organizationId: createdOrg.id,
    })
  }

  return {
    org: { id: createdOrg.id, name: createdOrg.name, slug: createdOrg.slug, logo: createdOrg.logo },
  }
})

/** Delete an organization (Owner only) */
export const deleteOrganization = createServerFn({ method: 'POST' }).handler(async ({ data }) => {
  const { organizationId } = z.object({ organizationId: z.string() }).parse(data)

  const request = getRequest()
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) throw new Error('Unauthorized')

  // Verify the user is actually the owner of THIS organization
  const userMembership = await db.query.member.findFirst({
    where: and(eq(member.organizationId, organizationId), eq(member.userId, session.user.id)),
  })

  if (!userMembership || userMembership.role !== 'owner') {
    throw new Error('Only the owner can delete the organization')
  }

  // Delete using Better Auth API to ensure all associated data is cleaned up
  await auth.api.deleteOrganization({
    body: {
      organizationId,
    },
    headers: request.headers,
  })

  return { success: true }
})

/** Update an organization (Admin/Owner only) */
export const updateOrganization = createServerFn({ method: 'POST' }).handler(async ({ data }) => {
  const { organizationId, name, slug, logo } = z
    .object({
      organizationId: z.string(),
      name: z.string().min(1).optional(),
      slug: z.string().min(1).optional(),
      logo: z.string().optional(),
    })
    .parse(data)

  const request = getRequest()
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) throw new Error('Unauthorized')

  // Verify the user is at least an admin of the organization
  const userMembership = await db.query.member.findFirst({
    where: and(eq(member.organizationId, organizationId), eq(member.userId, session.user.id)),
  })

  if (!userMembership || (userMembership.role !== 'admin' && userMembership.role !== 'owner')) {
    throw new Error('Only admins or owners can update the organization settings')
  }

    // Check if the new name is already taken by another organization
  if (name) {
    const existingName = await db.query.organization.findFirst({
      where: sql`LOWER(${organization.name}) = LOWER(${name.trim()})`,
    })
    if (existingName && existingName.id !== organizationId) {
      throw new Error('Organization name already taken')
    }
  }

  // Check if the new slug is already taken by another organization
  if (slug) {
    const newSlug = slugify(slug)
    const existingSlug = await db.query.organization.findFirst({
      where: eq(organization.slug, newSlug),
    })
    if (existingSlug && existingSlug.id !== organizationId) {
      throw new Error('Organization slug already taken')
    }
  }

  // Update using Drizzle directly to ensure all fields (including logo_url) are saved correctly
  await db
    .update(organization)
    .set({
      ...(name && { name: name.trim() }),
      ...(slug && { slug: slugify(slug) }),
      ...(logo !== undefined && { logo, logoUrl: logo }),
    })
    .where(eq(organization.id, organizationId))

  const updatedOrg = await db.query.organization.findFirst({
    where: eq(organization.id, organizationId),
  })

  return { org: updatedOrg }
})
