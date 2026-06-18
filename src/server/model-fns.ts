import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { z } from 'zod'
import { db } from '../../db/index'
import { mlModel, projectModel } from '../../db/schema'

// Fetch all global catalog models from DB
export const getGlobalModels = createServerFn({ method: 'GET' }).handler(async () => {
  return db.select().from(mlModel).orderBy(mlModel.name)
})

// Fetch all project-specific models (joins with global model to retrieve framework & architecture)
export const getProjectModels = createServerFn({ method: 'GET' }).handler(async ({ data }) => {
  const projectId = z.string().parse(data)

  return db
    .select({
      id: projectModel.id,
      projectId: projectModel.projectId,
      modelId: projectModel.modelId,
      name: projectModel.name,
      status: projectModel.status,
      version: projectModel.version,
      metrics: projectModel.metrics,
      description: projectModel.description,
      fileUrl: projectModel.fileUrl,
      fileSize: projectModel.fileSize,
      createdAt: projectModel.createdAt,
      updatedAt: projectModel.updatedAt,
      baseModelName: mlModel.name,
      framework: mlModel.framework,
      architecture: mlModel.architecture,
    })
    .from(projectModel)
    .innerJoin(mlModel, eq(projectModel.modelId, mlModel.id))
    .where(eq(projectModel.projectId, projectId))
    .orderBy(projectModel.createdAt)
})

// Schema for project model creation
export const createProjectModelSchema = z.object({
  projectId: z.string(),
  modelId: z.string(),
  name: z.string().min(1),
  version: z.string().min(1),
  status: z.enum(['draft', 'training', 'ready', 'deployed', 'archived']),
  description: z.string().optional(),
  metrics: z.string().optional(), // Expected JSON string
  fileUrl: z.string().optional(),
  fileSize: z.number().optional(),
})

// Create project model
export const createProjectModel = createServerFn({ method: 'POST' }).handler(async ({ data }) => {
  const input = createProjectModelSchema.parse(data)

  const newModel = {
    id: nanoid(),
    projectId: input.projectId,
    modelId: input.modelId,
    name: input.name,
    version: input.version,
    status: input.status,
    description: input.description || null,
    metrics: input.metrics || null,
    fileUrl: input.fileUrl || null,
    fileSize: input.fileSize || null,
  }

  await db.insert(projectModel).values(newModel)
  return newModel
})

// Delete project model
export const deleteProjectModel = createServerFn({ method: 'POST' }).handler(async ({ data }) => {
  const id = z.string().parse(data)
  await db.delete(projectModel).where(eq(projectModel.id, id))
  return { success: true }
})

// Schema for global model creation
export const createGlobalModelSchema = z.object({
  name: z.string().min(1),
  framework: z.string().min(1),
  architecture: z.string().min(1),
  version: z.string().min(1),
  description: z.string().optional(),
})

// Create global model in catalog
export const createGlobalModel = createServerFn({ method: 'POST' }).handler(async ({ data }) => {
  const input = createGlobalModelSchema.parse(data)

  const newModel = {
    id: nanoid(),
    name: input.name,
    framework: input.framework,
    architecture: input.architecture,
    version: input.version,
    description: input.description || null,
  }

  await db.insert(mlModel).values(newModel)
  return newModel
})

// Delete global model from catalog
export const deleteGlobalModel = createServerFn({ method: 'POST' }).handler(async ({ data }) => {
  const id = z.string().parse(data)
  await db.delete(mlModel).where(eq(mlModel.id, id))
  return { success: true }
})
