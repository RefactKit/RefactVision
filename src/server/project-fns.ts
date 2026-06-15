import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { and, count, eq, sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { z } from 'zod'
import { db } from '../../db/index'
import { member, project, projectCategory, projectFile, projectType } from '../../db/schema'
import { auth } from '../../lib/auth'
import { supabase } from '@/lib/supabase'

// --- Types & Schemas ---

export const createProjectSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  githubUrl: z.string().optional(),
  otherUrl: z.string().optional(),
  organizationId: z.string(),
  typeId: z.string().optional(),
})

export const updateProjectSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  githubUrl: z.string().optional(),
  otherUrl: z.string().optional(),
  typeId: z.string().optional(),
})

// --- Helpers ---

/**
 * Robust permission check that works with both static and dynamic roles.
 * Includes a fallback for 'owner' role to ensure baseline reliability.
 */
async function checkProjectPermission(
  request: Request,
  organizationId: string,
  permission: 'create' | 'read' | 'update' | 'delete',
) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) return false

  const permissionString = `project:${permission}`

  // 1. Try standard Better Auth permission check
  const check = await auth.api
    .hasPermission({
      body: {
        organizationId,
        permissions: {
          project: [permission],
        },
      },
      headers: request.headers,
    })
    .catch((err) => {
      console.error(`[RBAC] Permission check failed for ${permissionString}:`, err)
      return null
    })

  if (check?.hasPermission) return true

  // 2. Fallback: Check membership directly via DB using the organizationId we already have
  //    (getActiveMember requires setActiveOrganization, which this app doesn't use)
  const memberData = await db.query.member.findFirst({
    where: and(eq(member.organizationId, organizationId), eq(member.userId, session.user.id)),
  })

  if (memberData?.role === 'owner' || memberData?.role === 'admin') return true

  // Members can still read
  if (memberData && permission === 'read') return true

  return false
}

// --- Functions ---

/** Get all projects for an organization */
export const getProjects = createServerFn({ method: 'GET' }).handler(async ({ data }) => {
  const organizationId = z.string().parse(data)
  const request = getRequest()

  const hasAccess = await checkProjectPermission(request, organizationId, 'read')
  if (!hasAccess) throw new Error('Unauthorized')

  return db
    .select({
      id: project.id,
      title: project.title,
      description: project.description,
      slug: project.slug,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      type: projectType.name,
      fileCount: sql<number>`count(${projectFile.id})::int`,
      topImages: sql<string[] | null>`(
        SELECT json_agg(url)
        FROM (
          SELECT url 
          FROM project_file 
          WHERE project_id = project.id AND mime_type LIKE 'image/%'
          LIMIT 3
        ) sub
      )`,
      topFiles: sql<{ url: string; name: string; mimeType: string }[] | null>`(
        SELECT json_agg(row_to_json(sub))
        FROM (
          SELECT url, name, mime_type AS "mimeType"
          FROM project_file
          WHERE project_id = project.id
          ORDER BY created_at DESC
          LIMIT 3
        ) sub
      )`,
      ownerName: sql<string>`(select name from "user" where id = ${project.userId})`,
      ownerEmail: sql<string>`(select email from "user" where id = ${project.userId})`,
    })
    .from(project)
    .leftJoin(projectType, eq(project.typeId, projectType.id))
    .leftJoin(projectFile, eq(project.id, projectFile.projectId))
    .where(eq(project.organizationId, organizationId))
    .groupBy(project.id, projectType.name)
})

/** Get project count for an organization */
export const getProjectCount = createServerFn({ method: 'GET' }).handler(async ({ data }) => {
  const organizationId = z.string().parse(data)
  const request = getRequest()

  const hasAccess = await checkProjectPermission(request, organizationId, 'read')
  if (!hasAccess) throw new Error('Unauthorized')

  const [res] = await db
    .select({ count: count() })
    .from(project)
    .where(eq(project.organizationId, organizationId))

  return res.count
})
export const getProjectById = createServerFn({ method: 'GET' }).handler(async ({ data }) => {
  const projectId = z.string().parse(data)
  const request = getRequest()

  const [proj] = await db.select().from(project).where(eq(project.id, projectId)).limit(1)
  if (!proj) return null

  const hasAccess = await checkProjectPermission(request, proj.organizationId, 'read')
  if (!hasAccess) throw new Error('Unauthorized')

  const files = await db.select().from(projectFile).where(eq(projectFile.projectId, projectId))
  const categories = await db
    .select()
    .from(projectCategory)
    .where(eq(projectCategory.projectId, projectId))

  return { ...proj, files, categories }
})

/** Create a new project */
export const createProject = createServerFn({ method: 'POST' }).handler(async ({ data }) => {
  const request = getRequest()
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) throw new Error('Unauthorized')

  const validated = createProjectSchema.parse(data)

  const hasPermission = await checkProjectPermission(request, validated.organizationId, 'create')
  if (!hasPermission) {
    throw new Error('Unauthorized: You do not have permission to create a project')
  }

  const id = nanoid()
  const slug = validated.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + nanoid(4)

  await db.insert(project).values({
    id,
    userId: session.user.id,
    organizationId: validated.organizationId,
    title: validated.title,
    description: validated.description || '',
    githubUrl: validated.githubUrl || null,
    otherUrl: validated.otherUrl || null,
    slug,
    typeId: validated.typeId,
  })

  console.log(
    `[PROJECT] Created new project: ${validated.title} in org ${validated.organizationId}`,
  )
  return { id, slug }
})

/** Update an existing project */
export const updateProject = createServerFn({ method: 'POST' }).handler(async ({ data }) => {
  const { id, ...updates } = updateProjectSchema.parse(data)
  const request = getRequest()

  const [proj] = await db.select().from(project).where(eq(project.id, id)).limit(1)
  if (!proj) throw new Error('Project not found')

  const hasAccess = await checkProjectPermission(request, proj.organizationId, 'update')
  if (!hasAccess) throw new Error('Unauthorized')

  await db.update(project).set(updates).where(eq(project.id, id))
  return { success: true }
})

/** Delete a project */
export const deleteProject = createServerFn({ method: 'POST' }).handler(async ({ data }) => {
  const { projectId } = z.object({ projectId: z.string() }).parse(data)
  const request = getRequest()

  const [proj] = await db.select().from(project).where(eq(project.id, projectId)).limit(1)
  if (!proj) throw new Error('Project not found')

  const hasAccess = await checkProjectPermission(request, proj.organizationId, 'delete')
  if (!hasAccess) throw new Error('Unauthorized')

  await db.delete(project).where(eq(project.id, projectId))
  console.log(`[PROJECT] Deleted project: ${projectId}`)
  return { success: true }
})

// --- Category Management ---

/** Create a category for labeling */
export const createCategory = createServerFn({ method: 'POST' }).handler(async ({ data }) => {
  const { projectId, name, parentId } = z
    .object({ projectId: z.string(), name: z.string(), parentId: z.string().optional() })
    .parse(data)

  const id = nanoid()
  await db.insert(projectCategory).values({
    id,
    projectId,
    name,
    parentId,
  })
  return { id }
})

// --- Labeling ---

/** Bulk update categories and move files in storage */
export const bulkLabelFiles = createServerFn({ method: 'POST' }).handler(async ({ data }) => {
  const { fileIds, categoryId } = z
    .object({ fileIds: z.array(z.string()), categoryId: z.string().nullable() })
    .parse(data)

  if (!fileIds.length) return { success: true }

  // 1. Fetch the files to know their current paths
  const files = await db.select().from(projectFile).where(sql`${projectFile.id} IN ${fileIds}`)

  // 2. Determine target state
  const isLabeling = categoryId !== null
  const targetFolder = isLabeling ? 'labeled' : 'unlabeled'
  const sourceFolder = isLabeling ? 'unlabeled' : 'labeled'

  // 3. Move files in storage and collect updates
  for (const file of files) {
    if (!file.path.includes(`/${sourceFolder}/`)) continue // Skip if already in correct state or custom path

    const newPath = file.path.replace(`/${sourceFolder}/`, `/${targetFolder}/`)

    if (file.path !== newPath) {
      const { error: moveError } = await supabase.storage.from('projects').move(file.path, newPath)

      if (moveError) {
        console.error(`Failed to move file ${file.path}:`, moveError)
        continue // Skip DB update if storage move fails
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('projects').getPublicUrl(newPath)

      // 4. Update DB for this specific file
      await db
        .update(projectFile)
        .set({
          categoryId,
          labeled: isLabeling,
          path: newPath,
          url: publicUrl,
        })
        .where(eq(projectFile.id, file.id))
    } else {
      // Just update category if path replacement didn't happen (edge case)
      await db
        .update(projectFile)
        .set({ categoryId, labeled: isLabeling })
        .where(eq(projectFile.id, file.id))
    }
  }

  return { success: true }
})

// --- Project Types ---

/** Get or seed project types for an organization */
export const getProjectTypes = createServerFn({ method: 'GET' }).handler(async ({ data }) => {
  const organizationId = z.string().parse(data)
  const types = await db
    .select()
    .from(projectType)
    .where(eq(projectType.organizationId, organizationId))

  if (types.length === 0) {
    const defaultTypes = ['THESE', 'STAGE', 'AUTRE']
    const seededTypes = []
    for (const name of defaultTypes) {
      const id = nanoid()
      await db.insert(projectType).values({ id, name, organizationId })
      seededTypes.push({ id, name, organizationId })
    }
    return seededTypes
  }

  return types
})

/** Create a custom project type */
export const createProjectType = createServerFn({ method: 'POST' }).handler(async ({ data }) => {
  const { organizationId, name } = z
    .object({ organizationId: z.string(), name: z.string() })
    .parse(data)

  const id = nanoid()
  await db.insert(projectType).values({
    id,
    name,
    organizationId,
  })
  return { id }
})

/** Delete project files from the database */
export const deleteFiles = createServerFn({ method: 'POST' }).handler(async ({ data }) => {
  const fileIds = z.array(z.string()).parse(data)
  if (fileIds.length === 0) return { success: true }
  await db.delete(projectFile).where(sql`${projectFile.id} IN ${fileIds}`)
  return { success: true }
})

/** Link an uploaded file to a project */
export const linkProjectFile = createServerFn({ method: 'POST' }).handler(async ({ data }) => {
  const validated = z
    .object({
      projectId: z.string(),
      categoryId: z.string().nullable(),
      name: z.string(),
      path: z.string(),
      url: z.string(),
      mimeType: z.string(),
      size: z.number(),
      uploadedBy: z.string(),
    })
    .parse(data)

  const id = nanoid()
  await db.insert(projectFile).values({
    id,
    ...validated,
  })
  return { id }
})
