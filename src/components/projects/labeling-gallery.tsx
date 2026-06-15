import { useState, useMemo } from 'react'
import { Check, Image as ImageIcon, Upload, Trash2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useI18n } from '@/i18n/context'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Download, FileText, FileSpreadsheet, File as FileIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProjectFile {
  id: string
  name: string
  url: string
  categoryId: string | null
  size: number
  mimeType: string
  category?: {
    id: string
    name: string
  } | null
}

interface LabelingGalleryProps {
  files: ProjectFile[]
  selectedCategoryId: string | null
  onBulkLabel: (fileIds: string[]) => void
  onDeleteFiles: (fileIds: string[]) => void
  onUploadClick: () => void
}

export function LabelingGallery({
  files,
  selectedCategoryId,
  onBulkLabel,
  onDeleteFiles,
  onUploadClick,
}: LabelingGalleryProps) {
  const { t } = useI18n()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  const filteredFiles = useMemo(() => {
    return files.filter((f) => (selectedCategoryId ? f.categoryId === selectedCategoryId : true))
  }, [files, selectedCategoryId])

  const totalPages = Math.ceil(filteredFiles.length / itemsPerPage)
  const paginatedFiles = filteredFiles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('image')) return <ImageIcon className="size-10 text-primary/40" />
    if (mimeType.includes('spreadsheet') || mimeType.includes('csv') || mimeType.includes('excel'))
      return <FileSpreadsheet className="size-10 text-green-500/40" />
    if (mimeType.includes('pdf') || mimeType.includes('text'))
      return <FileText className="size-10 text-blue-500/40" />
    return <FileIcon className="size-10 text-muted-foreground/40" />
  }

  const getBadgeColor = (name: string, mimeType: string) => {
    const ext = name.split('.').pop()?.toLowerCase()

    // Exact extensions for brand colors
    if (['xls', 'xlsx', 'csv'].includes(ext || '')) return 'bg-emerald-600 text-white'
    if (['doc', 'docx'].includes(ext || '')) return 'bg-blue-600 text-white'
    if (['ppt', 'pptx'].includes(ext || '')) return 'bg-orange-500 text-white'
    if (ext === 'pdf') return 'bg-red-500 text-white'

    // Mime type fallbacks
    if (mimeType.includes('image')) return 'bg-indigo-500 text-white'
    if (mimeType.includes('spreadsheet') || mimeType.includes('csv') || mimeType.includes('excel'))
      return 'bg-emerald-600 text-white'
    if (mimeType.includes('pdf')) return 'bg-red-500 text-white'

    return 'bg-slate-600 text-white'
  }

  const getFileExtension = (name: string, mimeType: string) => {
    const ext = name.split('.').pop()?.toUpperCase()
    if (ext && ext !== name.toUpperCase() && ext.length <= 4) {
      return ext
    }
    // Fallback if no valid extension found
    if (mimeType.includes('image')) return 'IMG'
    if (mimeType.includes('pdf')) return 'PDF'
    return 'FILE'
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Selection Actions Overlay (when selected) */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-3 bg-card border border-border/50 rounded-2xl shadow-2xl backdrop-blur-xl"
          >
            <span className="text-sm font-medium">{selectedIds.length} files selected</span>
            <div className="h-4 w-px bg-border" />
            <Button size="sm" onClick={() => onBulkLabel(selectedIds)} className="rounded-xl">
              Apply Label
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDeleteFiles(selectedIds)}
              className="rounded-xl"
            >
              Delete
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedIds([])}
              className="rounded-xl"
            >
              Cancel
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid - Matching Screenshot */}
      <div className="flex-1">
        {paginatedFiles.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {paginatedFiles.map((file) => (
              <div
                key={file.id}
                className={cn(
                  'group relative flex flex-col bg-card border border-border/50 rounded-2xl overflow-hidden transition-all hover:shadow-lg',
                  selectedIds.includes(file.id) && 'ring-2 ring-primary border-primary',
                )}
                onClick={() => toggleSelect(file.id)}
              >
                {/* Image / Icon Preview */}
                <div className="relative aspect-4/3 bg-muted/20 flex items-center justify-center overflow-hidden">
                  {file.mimeType.includes('image') ? (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    getFileIcon(file.mimeType)
                  )}

                  {/* Type Badge (Top Left) */}
                  <div className="absolute top-2 left-2">
                    <Badge
                      className={cn(
                        'h-5 px-1.5 text-[10px] rounded-lg border-0',
                        getBadgeColor(file.name, file.mimeType),
                      )}
                    >
                      {file.mimeType.includes('image') && <ImageIcon className="size-3 mr-1" />}
                      {getFileExtension(file.name, file.mimeType)}
                    </Badge>
                  </div>

                  {/* Selection Checkbox */}
                  <div
                    className={cn(
                      'absolute top-2 right-2 size-5 rounded-full border-2 transition-all flex items-center justify-center',
                      selectedIds.includes(file.id)
                        ? 'bg-primary border-primary'
                        : 'bg-black/20 border-white/40 opacity-0 group-hover:opacity-100',
                    )}
                  >
                    <Check
                      className={cn(
                        'size-3 text-white',
                        !selectedIds.includes(file.id) && 'hidden',
                      )}
                    />
                  </div>
                </div>

                {/* File Metadata */}
                <div className="p-3 flex flex-col gap-1">
                  <p className="text-sm font-medium truncate text-foreground">{file.name}</p>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <span>• {formatSize(file.size)}</span>
                    <span>• {getFileExtension(file.name, file.mimeType)}</span>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="mt-auto border-t border-border/40 p-2 flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-[10px] gap-1 rounded-lg text-primary hover:bg-primary/5"
                    asChild
                  >
                    <a href={file.url} download={file.name} onClick={(e) => e.stopPropagation()}>
                      <Download className="size-3" />
                      Download
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteFiles([file.id])
                    }}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 rounded-[3rem] border-2 border-dashed border-border/50 bg-muted/5">
            <div className="rounded-full bg-muted p-8 mb-6">
              <ImageIcon className="size-12 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-medium mb-2">{t.projects.studio.noFiles}</h3>
            <p className="text-muted-foreground">No files found in this category.</p>
          </div>
        )}
      </div>

      {/* Pagination - Matching Screenshot */}
      {totalPages > 1 && (
        <div className="mt-10 py-4 border-t border-border/40">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    setCurrentPage((p) => Math.max(1, p - 1))
                  }}
                  className={cn(currentPage === 1 && 'pointer-events-none opacity-50')}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      setCurrentPage(i + 1)
                    }}
                    isActive={currentPage === i + 1}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }}
                  className={cn(currentPage === totalPages && 'pointer-events-none opacity-50')}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}
