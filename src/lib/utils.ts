import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getFileCategoryIds(file: {
  categoryId: string | null
  metadata?: string | null
}): string[] {
  const ids: string[] = []
  if (file.categoryId) ids.push(file.categoryId)
  if (file.metadata) {
    try {
      const meta = JSON.parse(file.metadata)
      if (Array.isArray(meta.categoryIds)) {
        for (const id of meta.categoryIds) {
          if (!ids.includes(id)) ids.push(id)
        }
      }
    } catch {}
  }
  return ids
}