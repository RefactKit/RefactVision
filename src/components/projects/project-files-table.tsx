import { useState, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  MoreHorizontal,
  Download,
  Trash2,
  Image as ImageIcon,
  FileSpreadsheet,
  FileText,
  FileCode,
  FileArchive,
  FileVideo,
  FileAudio,
  FileJson,
  File as FileIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useI18n } from '@/i18n/context'
import { AnimatePresence, motion } from 'framer-motion'

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

interface ProjectFilesTableProps {
  files: ProjectFile[]
  selectedCategoryId: string | null
  onBulkLabel: (fileIds: string[]) => void
  onDeleteFiles: (fileIds: string[]) => void
  onRenameFile?: (fileId: string, newName: string) => void // Optional update action
}

export function ProjectFilesTable({
  files,
  selectedCategoryId,
  onBulkLabel,
  onDeleteFiles,
  onRenameFile,
}: ProjectFilesTableProps) {
  const { t } = useI18n()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const filteredFiles = useMemo(() => {
    return files.filter((f) => (selectedCategoryId ? f.categoryId === selectedCategoryId : true))
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
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
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
        <img
          src={file.url}
          alt={file.name}
          className="size-full object-cover"
          loading="lazy"
        />
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
    if (['csv', 'xls', 'xlsx'].includes(ext) || mime.includes('spreadsheet') || mime.includes('csv') || mime.includes('excel')) {
      return (
        <div className="flex flex-col items-center justify-center gap-0.5">
          <FileSpreadsheet className="size-5 text-emerald-500" />
          <span className="text-[9px] font-bold text-emerald-500 leading-none">{ext.toUpperCase() || 'CSV'}</span>
        </div>
      )
    }

    // ZIP / Archive
    if (['zip', 'rar', 'gz', 'tar', '7z'].includes(ext) || mime.includes('zip') || mime.includes('compressed') || mime.includes('archive')) {
      return (
        <div className="flex flex-col items-center justify-center gap-0.5">
          <FileArchive className="size-5 text-violet-500" />
          <span className="text-[9px] font-bold text-violet-500 leading-none">{ext.toUpperCase() || 'ZIP'}</span>
        </div>
      )
    }

    // Video
    if (mime.includes('video')) {
      return (
        <div className="flex flex-col items-center justify-center gap-0.5">
          <FileVideo className="size-5 text-blue-500" />
          <span className="text-[9px] font-bold text-blue-500 leading-none">{ext.toUpperCase() || 'VID'}</span>
        </div>
      )
    }

    // Audio
    if (mime.includes('audio')) {
      return (
        <div className="flex flex-col items-center justify-center gap-0.5">
          <FileAudio className="size-5 text-pink-500" />
          <span className="text-[9px] font-bold text-pink-500 leading-none">{ext.toUpperCase() || 'AUD'}</span>
        </div>
      )
    }

    // Text / doc
    if (mime.includes('text') || ['txt', 'md', 'doc', 'docx'].includes(ext)) {
      return (
        <div className="flex flex-col items-center justify-center gap-0.5">
          <FileText className="size-5 text-sky-500" />
          <span className="text-[9px] font-bold text-sky-500 leading-none">{ext.toUpperCase() || 'TXT'}</span>
        </div>
      )
    }

    // Fallback
    return (
      <div className="flex flex-col items-center justify-center gap-0.5">
        <FileIcon className="size-5 text-muted-foreground" />
        {ext && <span className="text-[9px] font-bold text-muted-foreground leading-none">{ext.toUpperCase()}</span>}
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
      {/* Floating Selection Action Bar */}
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
              onClick={() => {
                onDeleteFiles(selectedIds)
                setSelectedIds([])
              }}
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
