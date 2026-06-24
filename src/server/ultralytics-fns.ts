import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { and, eq, inArray } from 'drizzle-orm'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { getFileCategoryIds } from '@/lib/utils'
import { db } from '../../db/index'
import { member, project, projectCategory, projectFile } from '../../db/schema'
import { auth } from '../../lib/auth'
import { decrypt, encrypt } from './crypto-fns'

// --- Permission helper (same as project-fns.ts) ---
async function checkProjectPermission(
  request: Request,
  organizationId: string,
  permission: 'create' | 'read' | 'update' | 'delete',
) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) return false

  const check = await auth.api
    .hasPermission({
      body: { organizationId, permissions: { project: [permission] } },
      headers: request.headers,
    })
    .catch(() => null)

  if (check?.hasPermission) return true

  const memberData = await db.query.member.findFirst({
    where: and(eq(member.organizationId, organizationId), eq(member.userId, session.user.id)),
  })

  if (memberData?.role === 'owner' || memberData?.role === 'admin') return true
  if (memberData && permission === 'read') return true
  return false
}

// --- Save Ultralytics API Key ---
export const saveUltralyticsConfig = createServerFn({ method: 'POST' }).handler(
  async ({ data }) => {
    const { projectId, apiKey } = z
      .object({ projectId: z.string(), apiKey: z.string().min(1) })
      .parse(data)

    const request = getRequest()
    const [proj] = await db.select().from(project).where(eq(project.id, projectId)).limit(1)
    if (!proj) throw new Error('Project not found')

    const hasAccess = await checkProjectPermission(request, proj.organizationId, 'update')
    if (!hasAccess) throw new Error('Unauthorized')

    const secretKey = process.env.BETTER_AUTH_SECRET
    if (!secretKey) throw new Error('Encryption secret is not configured on the server')

    let encryptedKey = proj.ultralyticsApiKey
    if (apiKey !== '••••••••') {
      encryptedKey = encrypt(apiKey, secretKey)
    }

    await db
      .update(project)
      .set({ ultralyticsApiKey: encryptedKey })
      .where(eq(project.id, projectId))

    console.log(`[ULTRALYTICS] Configured integration for project: ${projectId}`)
    return { success: true }
  },
)

// --- Disconnect Ultralytics ---
export const disconnectUltralytics = createServerFn({ method: 'POST' }).handler(
  async ({ data }) => {
    const { projectId } = z.object({ projectId: z.string() }).parse(data)
    const request = getRequest()

    const [proj] = await db.select().from(project).where(eq(project.id, projectId)).limit(1)
    if (!proj) throw new Error('Project not found')

    const hasAccess = await checkProjectPermission(request, proj.organizationId, 'update')
    if (!hasAccess) throw new Error('Unauthorized')

    await db.update(project).set({ ultralyticsApiKey: null }).where(eq(project.id, projectId))

    console.log(`[ULTRALYTICS] Disconnected integration for project: ${projectId}`)
    return { success: true }
  },
)

// --- Export to Ultralytics via NDJSON (no binary download) ---
export const exportToUltralytics = createServerFn({ method: 'POST' }).handler(async ({ data }) => {
  const { projectId } = z.object({ projectId: z.string() }).parse(data)

  const request = getRequest()
  const [proj] = await db.select().from(project).where(eq(project.id, projectId)).limit(1)
  if (!proj) throw new Error('Project not found')

  const hasAccess = await checkProjectPermission(request, proj.organizationId, 'update')
  if (!hasAccess) throw new Error('Unauthorized')

  if (!proj.ultralyticsApiKey) {
    return {
      success: false,
      message: 'Ultralytics is not configured for this project',
      exported: 0,
    }
  }

  const secretKey = process.env.BETTER_AUTH_SECRET
  if (!secretKey) throw new Error('Encryption secret is not configured on the server')

  const apiKey = decrypt(proj.ultralyticsApiKey, secretKey)
  const datasetName = proj.title

  // 1. Fetch labeled files
  const files = await db
    .select({
      id: projectFile.id,
      name: projectFile.name,
      url: projectFile.url,
      categoryId: projectFile.categoryId,
      labeled: projectFile.labeled,
      metadata: projectFile.metadata,
    })
    .from(projectFile)
    .where(eq(projectFile.projectId, projectId))

  const labeledFiles = files.filter((f) => f.labeled && f.categoryId !== null)

  if (labeledFiles.length === 0) {
    return { success: false, message: 'No labeled images to export', exported: 0 }
  }

  // 2. Fetch all categories (multi-label support)
  const allCategoryIdsSet = new Set<string>()
  for (const f of labeledFiles) {
    for (const id of getFileCategoryIds(f)) {
      allCategoryIdsSet.add(id)
    }
  }

  const categories = await db
    .select({ id: projectCategory.id, name: projectCategory.name })
    .from(projectCategory)
    .where(inArray(projectCategory.id, [...allCategoryIdsSet]))

  const classIndexMap = Object.fromEntries(categories.map((c, i) => [c.id, i]))
  const classNames = categories.map((c) => c.name)
  const classNamesObj = Object.fromEntries(categories.map((c, i) => [i, c.name]))

  // 3. Build NDJSON
  const lines: string[] = []
  lines.push(
    JSON.stringify({
      type: 'dataset',
      task: 'detect',
      name: datasetName,
      class_names: classNamesObj,
    }),
  )

  let exportedCount = 0

  for (const file of labeledFiles) {
    const allCategoryIds = getFileCategoryIds(file)
    const boxes = allCategoryIds
      .map((catId) => classIndexMap[catId])
      .filter((id) => id !== undefined)
      .map((classId) => [classId, 0.5, 0.5, 0.05, 0.05])

    if (boxes.length === 0) continue

    lines.push(
      JSON.stringify({
        type: 'image',
        file: file.name,
        url: file.url,
        split: 'train',
        annotations: { boxes },
      }),
    )
    exportedCount++
  }

  const ndjsonContent = lines.join('\n')

  // 4. Upload NDJSON to Supabase
  if (!supabase) {
    return { success: false, message: 'Storage not configured', exported: 0 }
  }

  const ndjsonPath = `dataset-${proj.slug}/exports/ultralytics-${Date.now()}.ndjson`
  const { error: uploadError } = await supabase.storage
    .from('projects')
    .upload(ndjsonPath, new Blob([ndjsonContent], { type: 'application/x-ndjson' }), {
      contentType: 'application/x-ndjson',
      upsert: true,
    })

  if (uploadError) {
    return {
      success: false,
      message: `Failed to prepare export: ${uploadError.message}`,
      exported: 0,
    }
  }

  const {
    data: { publicUrl: ndjsonUrl },
  } = supabase.storage.from('projects').getPublicUrl(ndjsonPath)

  // 5. Create dataset + ingest NDJSON
  try {
    const slug = datasetName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const createRes = await fetch('https://platform.ultralytics.com/api/datasets', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug,
        name: datasetName,
        task: 'detect',
        description: 'Exported from RefactVision project',
        visibility: 'private',
        classNames,
      }),
    })

    const createText = await createRes.text()
    let createResult: Record<string, unknown>
    try {
      createResult = JSON.parse(createText)
    } catch {
      createResult = { error: createText }
    }

    let datasetId: string

    if (createRes.status === 409) {
      const listRes = await fetch(
        `https://platform.ultralytics.com/api/datasets?slug=${encodeURIComponent(slug)}`,
        { headers: { Authorization: `Bearer ${apiKey}` } },
      )
      const listResult = await listRes.json()
      const existing = listResult.datasets?.[0]
      if (!existing) {
        return {
          success: false,
          message: 'Dataset conflict but could not resolve existing dataset',
          exported: 0,
        }
      }
      datasetId = existing._id
    } else if (!createRes.ok) {
      return {
        success: false,
        message: createResult.error || `Failed to create dataset (${createRes.status})`,
        exported: 0,
      }
    } else {
      datasetId = createResult.datasetId
    }

    const ingestRes = await fetch('https://platform.ultralytics.com/api/datasets/ingest', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceUrl: ndjsonUrl, datasetId }),
    })

    const ingestText = await ingestRes.text()
    let ingestResult: Record<string, unknown>
    try {
      ingestResult = JSON.parse(ingestText)
    } catch {
      ingestResult = { error: ingestText }
    }

    if (!ingestRes.ok) {
      return {
        success: false,
        message: ingestResult.error || `Ultralytics ingest error (${ingestRes.status})`,
        exported: 0,
      }
    }

    return {
      success: true,
      exported: exportedCount,
      message: `${exportedCount} images sent to Ultralytics Platform`,
      jobId: ingestResult.jobId,
      datasetId,
    }
  } catch (err: unknown) {
    return {
      success: false,
      message: `Network error: ${err instanceof Error ? err.message : String(err)}`,
      exported: 0,
    }
  }
})
