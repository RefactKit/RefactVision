import { AnimatePresence, motion } from 'framer-motion'
import {
  Check,
  CheckCheck,
  Download,
  FileArchive,
  FileAudio,
  FileCode,
  File as FileIcon,
  FileJson,
  FileSpreadsheet,
  FileText,
  FileVideo,
  MoreHorizontal,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useI18n } from '@/i18n/context'
import { cn } from '@/lib/utils'

interface ProjectFile {
  id: string
  name: string
  url: string
  categoryId: string | null
  size: number
  mimeType: string
  uploadedAt: string | Date
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

interface ProjectFilesTableProps {
  files: ProjectFile[]
  categories: Array<{ id: string; name: string }>
  selectedCategoryId: string | null
  onBulkLabel: (fileIds: string[], categoryId: string | null) => Promise<void>
  onDeleteFiles: (fileIds: string[]) => void
  onCreateCategory: (name: string) => void
  onRenameFile?: (fileId: string, newName: string) => void // Optional update action
}

export function ProjectFilesTable({
  files,
  categories,
  selectedCategoryId,
  onBulkLabel,
  onDeleteFiles,
  onCreateCategory,
  onRenameFile,
}: ProjectFilesTableProps) {
  const { t } = useI18n()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
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

  const totalPages = Math.max(1, Math.ceil(filteredFiles.length / itemsPerPage))
  const paginatedFiles = filteredFiles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedFiles.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(paginatedFiles.map((f) => f.id))
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
  }

  const formatDate = (date: string | Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date))
  }

  const getBadgeColor = (name: string, mimeType: string) => {
    const ext = name.split('.').pop()?.toLowerCase()
    if (['xls', 'xlsx', 'csv'].includes(ext || '')) return 'bg-emerald-600 text-white'
    if (['doc', 'docx'].includes(ext || '')) return 'bg-blue-600 text-white'
    if (['ppt', 'pptx'].includes(ext || '')) return 'bg-orange-500 text-white'
    if (ext === 'pdf') return 'bg-red-500 text-white'
    if (mimeType.includes('image')) return 'bg-indigo-500 text-white'
    if (mimeType.includes('spreadsheet') || mimeType.includes('csv') || mimeType.includes('excel'))
      return 'bg-emerald-600 text-white'
    if (mimeType.includes('pdf')) return 'bg-red-500 text-white'
    return 'bg-slate-600 text-white'
  }

  const getFileExtension = (name: string, mimeType: string) => {
    const ext = name.split('.').pop()?.toUpperCase()
    if (ext && ext !== name.toUpperCase() && ext.length <= 4) return ext
    if (mimeType.includes('image')) return 'IMG'
    if (mimeType.includes('pdf')) return 'PDF'
    return 'FILE'
  }

  const getFilePreview = (file: ProjectFile) => {
    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    const mime = file.mimeType

    // Images → real thumbnail
    if (mime.includes('image')) {
      return (
        <img src={file.url} alt={file.name} className="size-full object-cover" loading="lazy" />
      )
    }

    // PDF
    if (ext === 'pdf' || mime.includes('pdf')) {
      return (
        <div className="flex flex-col items-center justify-center gap-0.5">
          <FileText className="size-5 text-red-500" />
          <span className="text-[9px] font-bold text-red-500 leading-none">PDF</span>
        </div>
      )
    }

    // HTML
    if (ext === 'html' || ext === 'htm' || mime.includes('html')) {
      return (
        <div className="flex flex-col items-center justify-center gap-0.5">
          <FileCode className="size-5 text-orange-500" />
          <span className="text-[9px] font-bold text-orange-500 leading-none">HTML</span>
        </div>
      )
    }

    // JSON
    if (ext === 'json' || mime.includes('json')) {
      return (
        <div className="flex flex-col items-center justify-center gap-0.5">
          <FileJson className="size-5 text-yellow-500" />
          <span className="text-[9px] font-bold text-yellow-500 leading-none">JSON</span>
        </div>
      )
    }

    // CSV / Spreadsheet
    if (
      ['csv', 'xls', 'xlsx'].includes(ext) ||
      mime.includes('spreadsheet') ||
      mime.includes('csv') ||
      mime.includes('excel')
    ) {
      return (
        <div className="flex flex-col items-center justify-center gap-0.5">
          <FileSpreadsheet className="size-5 text-emerald-500" />
          <span className="text-[9px] font-bold text-emerald-500 leading-none">
            {ext.toUpperCase() || 'CSV'}
          </span>
        </div>
      )
    }

    // ZIP / Archive
    if (
      ['zip', 'rar', 'gz', 'tar', '7z'].includes(ext) ||
      mime.includes('zip') ||
      mime.includes('compressed') ||
      mime.includes('archive')
    ) {
      return (
        <div className="flex flex-col items-center justify-center gap-0.5">
          <FileArchive className="size-5 text-violet-500" />
          <span className="text-[9px] font-bold text-violet-500 leading-none">
            {ext.toUpperCase() || 'ZIP'}
          </span>
        </div>
      )
    }

    // Video
    if (mime.includes('video')) {
      return (
        <div className="flex flex-col items-center justify-center gap-0.5">
          <FileVideo className="size-5 text-blue-500" />
          <span className="text-[9px] font-bold text-blue-500 leading-none">
            {ext.toUpperCase() || 'VID'}
          </span>
        </div>
      )
    }

    // Audio
    if (mime.includes('audio')) {
      return (
        <div className="flex flex-col items-center justify-center gap-0.5">
          <FileAudio className="size-5 text-pink-500" />
          <span className="text-[9px] font-bold text-pink-500 leading-none">
            {ext.toUpperCase() || 'AUD'}
          </span>
        </div>
      )
    }

    // Text / doc
    if (mime.includes('text') || ['txt', 'md', 'doc', 'docx'].includes(ext)) {
      return (
        <div className="flex flex-col items-center justify-center gap-0.5">
          <FileText className="size-5 text-sky-500" />
          <span className="text-[9px] font-bold text-sky-500 leading-none">
            {ext.toUpperCase() || 'TXT'}
          </span>
        </div>
      )
    }

    // Fallback
    return (
      <div className="flex flex-col items-center justify-center gap-0.5">
        <FileIcon className="size-5 text-muted-foreground" />
        {ext && (
          <span className="text-[9px] font-bold text-muted-foreground leading-none">
            {ext.toUpperCase()}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
      {/* Floating Selection Action Bar */}
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

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12 pl-4">
                <Checkbox
                  checked={
                    paginatedFiles.length > 0 && selectedIds.length === paginatedFiles.length
                  }
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead className="w-[400px]">File Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead className="w-12 text-right pr-4"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedFiles.length > 0 ? (
              paginatedFiles.map((file) => (
                <TableRow
                  key={file.id}
                  className={cn(
                    'group cursor-pointer',
                    selectedIds.includes(file.id) && 'bg-primary/5',
                  )}
                  onClick={() => toggleSelect(file.id)}
                >
                  <TableCell className="pl-4" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedIds.includes(file.id)}
                      onCheckedChange={() => toggleSelect(file.id)}
                      aria-label={`Select ${file.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {/* Rich file type preview */}
                      <div className="flex-shrink-0 size-10 rounded-lg overflow-hidden bg-muted/30 border border-border/50 flex items-center justify-center">
                        {getFilePreview(file)}
                      </div>
                      <span className="font-medium text-foreground truncate max-w-[250px]">
                        {file.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        'h-5 px-1.5 text-[10px] rounded-md border-0',
                        getBadgeColor(file.name, file.mimeType),
                      )}
                    >
                      {getFileExtension(file.name, file.mimeType)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {file.categoryId ? (
                      (() => {
                        const cat = categories.find((c) => c.id === file.categoryId)
                        const catIdx = categories.findIndex((c) => c.id === file.categoryId)
                        const dotColor = colorsPalette[catIdx % colorsPalette.length]
                        return (
                          <div className="flex items-center gap-1.5">
                            <span className={cn('size-2 rounded-full shrink-0', dotColor)} />
                            <span className="text-sm font-medium text-foreground">
                              {cat?.name || 'Class'}
                            </span>
                          </div>
                        )
                      })()
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatSize(file.size)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(file.uploadedAt)}
                  </TableCell>
                  <TableCell className="text-right pr-4" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon" className="size-8 rounded-lg">
                            <MoreHorizontal className="size-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end" className="w-40 rounded-xl">
                        <DropdownMenuItem asChild>
                          <a href={file.url} download={file.name} className="cursor-pointer">
                            <Download className="mr-2 size-4" />
                            Download
                          </a>
                        </DropdownMenuItem>
                        {onRenameFile && (
                          <DropdownMenuItem
                            onClick={() => {
                              const newName = prompt('Enter new file name:', file.name)
                              if (newName && newName !== file.name) {
                                onRenameFile(file.id, newName)
                              }
                            }}
                          >
                            Rename File
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => onDeleteFiles([file.id])}
                          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                        >
                          <Trash2 className="mr-2 size-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <FileIcon className="size-8 mb-2 opacity-50" />
                    <p>No files found.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="py-4 border-t border-border/40 bg-muted/5">
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
