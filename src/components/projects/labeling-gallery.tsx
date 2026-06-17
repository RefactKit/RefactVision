import { AnimatePresence, motion } from 'framer-motion'
import {
  Check,
  CheckCheck,
  Download,
  File as FileIcon,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useI18n } from '@/i18n/context'
import { cn } from '@/lib/utils'

interface ProjectFile {
  id: string
  name: string
  url: string
  categoryId: string | null
  size: number
  mimeType: string
  metadata: string | null
  category?: {
    id: string
    name: string
  } | null
}

const colorsPalette = [
  'bg-emerald-500',
  'bg-blue-500',
  'bg-violet-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-pink-500',
  'bg-cyan-500',
  'bg-yellow-500',
  'bg-indigo-500',
  'bg-teal-500',
]

interface LabelingGalleryProps {
  files: ProjectFile[]
  categories: Array<{ id: string; name: string }>
  selectedCategoryId: string | null
  onBulkLabel: (fileIds: string[], categoryId: string | null) => Promise<void>
  onDeleteFiles: (fileIds: string[]) => void
  onCreateCategory: (name: string) => void
  onUploadClick: () => void
}

export function LabelingGallery({
  files,
  categories,
  selectedCategoryId,
  onBulkLabel,
  onDeleteFiles,
  onCreateCategory,
  onUploadClick,
}: LabelingGalleryProps) {
  const { t } = useI18n()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newClassName, setNewClassName] = useState('')
  const [checkedClassIds, setCheckedClassIds] = useState<string[]>([])

  const filteredFiles = useMemo(() => {
    return files.filter((f) => {
      if (!selectedCategoryId) return true
      if (selectedCategoryId === '__unlabeled__') return f.categoryId === null
      return f.categoryId === selectedCategoryId
    })
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
    return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('image')) return <ImageIcon className="size-10 text-primary/40" />
    if (mimeType.includes('spreadsheet') || mimeType.includes('csv') || mimeType.includes('excel'))
      return <FileSpreadsheet className="size-10 text-green-500/40" />
    if (mimeType.includes('pdf') || mimeType.includes('text'))
      return <FileText className="size-10 text-blue-500/40" />
    return <FileIcon className="size-10 text-muted-foreground/40" />
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
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 bg-card border border-border/50 rounded-2xl shadow-2xl backdrop-blur-xl sm:gap-4 sm:px-6"
          >
            <span className="text-sm font-medium">{selectedIds.length} files selected</span>
            <div className="h-4 w-px bg-border" />
            <Popover
              open={popoverOpen}
              onOpenChange={(open) => {
                setPopoverOpen(open)
                if (!open) {
                  setIsCreating(false)
                  setNewClassName('')
                  setCheckedClassIds([])
                }
              }}
            >
              <PopoverTrigger
                render={
                  <Button size="sm" className="rounded-xl gap-1.5 font-medium shadow-sm">
                    <Plus className="size-4" />
                    Select Class
                  </Button>
                }
              />
              <PopoverContent align="center" className="w-56 p-1 rounded-2xl">
                {!isCreating ? (
                  <div className="flex flex-col gap-0.5">
                    {categories.length > 0 ? (
                      categories.map((cat, idx) => {
                        const isChecked = checkedClassIds.includes(cat.id)
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              setCheckedClassIds((prev) =>
                                prev.includes(cat.id)
                                  ? prev.filter((id) => id !== cat.id)
                                  : [...prev, cat.id],
                              )
                            }}
                            className={cn(
                              'flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm outline-hidden select-none text-left transition-colors',
                              isChecked
                                ? 'bg-primary/10 text-primary'
                                : 'hover:bg-accent hover:text-accent-foreground',
                            )}
                          >
                            <span
                              className={cn(
                                'size-2.5 rounded-full shrink-0',
                                colorsPalette[idx % colorsPalette.length],
                              )}
                            />
                            <span className="truncate flex-1">{cat.name}</span>
                            {isChecked && <Check className="size-3.5 text-primary shrink-0" />}
                          </button>
                        )
                      })
                    ) : (
                      <div className="p-3 text-xs text-muted-foreground text-center">
                        No classes created yet.
                      </div>
                    )}
                    {checkedClassIds.length > 0 && (
                      <>
                        <div className="h-px bg-border my-1" />
                        <div className="px-1 pb-1">
                          <Button
                            type="button"
                            size="sm"
                            onClick={async () => {
                              for (const classId of checkedClassIds) {
                                await onBulkLabel(selectedIds, classId)
                              }
                              setSelectedIds([])
                              setCheckedClassIds([])
                              setPopoverOpen(false)
                            }}
                            className="w-full h-8 rounded-xl gap-1.5 text-xs font-semibold"
                          >
                            <CheckCheck className="size-3.5" />
                            Apply {checkedClassIds.length}{' '}
                            {checkedClassIds.length === 1 ? 'class' : 'classes'}
                          </Button>
                        </div>
                      </>
                    )}
                    {categories.length > 0 && (
                      <>
                        <div className="h-px bg-border my-1" />
                        <button
                          type="button"
                          onClick={async () => {
                            await onBulkLabel(selectedIds, null)
                            setSelectedIds([])
                            setCheckedClassIds([])
                            setPopoverOpen(false)
                          }}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-destructive hover:bg-destructive/10 hover:text-destructive outline-hidden select-none text-left transition-colors"
                        >
                          <span className="size-2.5 rounded-full shrink-0 bg-muted-foreground/20" />
                          Remove Label
                        </button>
                      </>
                    )}
                    <div className="h-px bg-border my-1" />
                    <button
                      type="button"
                      onClick={() => setIsCreating(true)}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground outline-hidden select-none text-left transition-colors"
                    >
                      <Plus className="size-4 text-muted-foreground" />
                      Create Class
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      if (newClassName.trim()) {
                        onCreateCategory(newClassName.trim())
                        setNewClassName('')
                        setIsCreating(false)
                        setPopoverOpen(false)
                      }
                    }}
                    className="p-3 flex flex-col gap-3"
                  >
                    <PopoverHeader className="p-0">
                      <PopoverTitle className="text-sm font-semibold">New Class</PopoverTitle>
                      <PopoverDescription className="text-xs text-muted-foreground">
                        Create a new label class.
                      </PopoverDescription>
                    </PopoverHeader>
                    <FieldGroup className="gap-2">
                      <Field>
                        <Input
                          autoFocus
                          placeholder="Class name"
                          value={newClassName}
                          onChange={(e) => setNewClassName(e.target.value)}
                          className="h-8 text-sm px-2.5 rounded-lg"
                        />
                      </Field>
                    </FieldGroup>
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsCreating(false)
                          setNewClassName('')
                        }}
                        className="h-7 text-xs px-2.5 rounded-lg"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={!newClassName.trim()}
                        className="h-7 text-xs px-2.5 rounded-lg"
                      >
                        Create
                      </Button>
                    </div>
                  </form>
                )}
              </PopoverContent>
            </Popover>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setSelectedIds([])}
              className="size-8 rounded-xl"
              aria-label="Cancel"
            >
              <X className="size-4" />
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

                  {/* Category Color Dots (Top Left) — replaces file type badge */}
                  {(file.categoryId || file.metadata) && (() => {
                    let catIds: string[] = []
                    if (file.categoryId) catIds.push(file.categoryId)
                    if (file.metadata) {
                      try {
                        const metaObj = JSON.parse(file.metadata)
                        if (metaObj.categoryIds && Array.isArray(metaObj.categoryIds)) {
                          catIds = Array.from(new Set([...catIds, ...metaObj.categoryIds]))
                        }
                      } catch (e) {}
                    }
                    if (catIds.length === 0) return null

                    return (
                      <div className="absolute top-2 left-2 z-20 pointer-events-none flex items-center -space-x-1.5">
                        {catIds.map((cId, i) => {
                          const catIndex = categories.findIndex((c) => c.id === cId)
                          const colorClass = catIndex >= 0 ? colorsPalette[catIndex % colorsPalette.length] : 'bg-gray-400'
                          return (
                            <div
                              key={cId}
                              className={cn(
                                'size-4 rounded-full border-2 border-background shadow-md transition-all',
                                colorClass
                              )}
                              style={{ zIndex: 10 - i }}
                            />
                          )
                        })}
                      </div>
                    )
                  })()}

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
