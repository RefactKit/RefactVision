import { supabase } from '@/lib/supabase'
import { getFileCategoryIds } from '@/lib/utils'
import { createServerFn } from '@tanstack/react-start'
import { eq, inArray } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../../db/index'
import { project, projectCategory, projectFile } from '../../db/schema'

export const exportToUltralytics = createServerFn({ method: 'POST' }).handler(async ({ data }) => {
  const { projectId, apiKey, datasetName } = z
    .object({
      projectId: z.string(),
      apiKey: z.string().min(1),
      datasetName: z.string().min(1),
    })
    .parse(data)

  const [proj] = await db
    .select({ slug: project.slug })
    .from(project)
    .where(eq(project.id, projectId))
    .limit(1)

  if (!proj) {
    return { success: false, message: 'Project not found', exported: 0 }
  }

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

  const allCategoryIdsSet = new Set<string>()
  for (const f of labeledFiles) {
    for (const id of getFileCategoryIds(f)) {
      allCategoryIdsSet.add(id)
    }
  }
  const categoryIds = [...allCategoryIdsSet]

  const categories = await db
    .select({ id: projectCategory.id, name: projectCategory.name })
    .from(projectCategory)
    .where(inArray(projectCategory.id, categoryIds))

  const classIndexMap = Object.fromEntries(categories.map((c, i) => [c.id, i]))
  const classNames = categories.map((c) => c.name)
  const classNamesObj = Object.fromEntries(categories.map((c, i) => [i, c.name]))

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
    return { success: false, message: `Failed to prepare export: ${uploadError.message}`, exported: 0 }
  }

  const {
    data: { publicUrl: ndjsonUrl },
  } = supabase.storage.from('projects').getPublicUrl(ndjsonPath)

  try {
    const slug = datasetName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const createRes = await fetch('https://platform.ultralytics.com/api/datasets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        slug,
        name: datasetName,
        task: 'detect',
        description: `Exported from RefactVision project`,
        visibility: 'private',
        classNames,
      }),
    })

    const createText = await createRes.text()
    let createResult: any
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
        return { success: false, message: 'Dataset conflict but could not resolve existing dataset', exported: 0 }
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
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sourceUrl: ndjsonUrl, datasetId }),
    })

    const ingestText = await ingestRes.text()
    let ingestResult: any
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
  } catch (err: any) {
    return { success: false, message: `Network error: ${err.message}`, exported: 0 }
  }
})