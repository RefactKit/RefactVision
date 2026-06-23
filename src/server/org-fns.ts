import { slugify } from '@/lib/slugify'
import { createServerFn } from '@tanstack/react-start'
import { and, eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { z } from 'zod'
import { db } from '../../db/index'
import { member, organization } from '../../db/schema'

const DEMO_USER_ID = 'Z7TOkT4WXVVYeHwwxXZ2F2LkXG8ZWkQn'

/** Get all active orgs for the current user */
export const getUserOrgs = createServerFn({ method: 'GET' }).handler(async () => {
  const session = { user: { id: DEMO_USER_ID } }

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
  const session = { user: { id: DEMO_USER_ID } }

  const userMembership = await db.query.member.findFirst({
    where: eq(member.userId, session.user.id),
  })

  return { hasOrg: !!userMembership }
})

/** Get org by slug and verify the current user is a member */
export const getOrgBySlug = createServerFn({ method: 'GET' }).handler(async ({ data }) => {
  const { slug } = z.object({ slug: z.string() }).parse(data)
  const session = { user: { id: DEMO_USER_ID } }

  const org = await db.query.organization.findFirst({
    where: eq(organization.slug, slug),
  })
  if (!org) return { org: null, role: null }

  const userMembership = await db.query.member.findFirst({
    where: and(eq(member.organizationId, org.id), eq(member.userId, session.user.id)),
  })
  if (!userMembership) return { org: null, role: null }

  return {
    org: {
      id: org.id,
      name: org.name,
      slug: org.slug,
      logo: org.logoUrl || org.logo,
    },
    role: userMembership.role,
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

  const session = { user: { id: DEMO_USER_ID } }

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

  const orgId = nanoid()

  await db.insert(organization).values({
    id: orgId,
    name: name.trim(),
    slug,
    logo: logo,
    logoUrl: logo || '',
    createdAt: new Date(),
  })

  await db.insert(member).values({
    id: nanoid(),
    organizationId: orgId,
    userId: DEMO_USER_ID,
    role: 'owner',
    createdAt: new Date(),
  })

  return {
    org: { id: orgId, name: name.trim(), slug, logo },
  }
})

/** Delete an organization (Owner only) */
export const deleteOrganization = createServerFn({ method: 'POST' }).handler(async ({ data }) => {
  const { organizationId } = z.object({ organizationId: z.string() }).parse(data)

  const session = { user: { id: DEMO_USER_ID } }

  // Verify the user is actually the owner of THIS organization
  const userMembership = await db.query.member.findFirst({
    where: and(eq(member.organizationId, organizationId), eq(member.userId, session.user.id)),
  })

  if (!userMembership || userMembership.role !== 'owner') {
    throw new Error('Only the owner can delete the organization')
  }

  await db.delete(organization).where(eq(organization.id, organizationId))

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

  const session = { user: { id: DEMO_USER_ID } }

  // Verify the user is at least an admin of the organization
  const userMembership = await db.query.member.findFirst({
    where: and(eq(member.organizationId, organizationId), eq(member.userId, session.user.id)),
  })

  if (!userMembership || (userMembership.role !== 'admin' && userMembership.role !== 'owner')) {
    throw new Error('Only admins or owners can update the organization settings')
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
