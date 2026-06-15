import {
  Folder,
  User,
  Trash2,
  Pencil,
  Globe,
  MoreVertical,
  Copy,
  Share2,
  ExternalLink,
  FileText,
  FileCode,
  FileSpreadsheet,
  FileArchive,
  FileVideo,
  FileAudio,
  FileJson,
  File as FileIcon,
} from 'lucide-react'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { useI18n } from '@/i18n/context'
import { motion } from 'framer-motion'
import { Link } from '@tanstack/react-router'
import { authClient } from 'lib/auth-client'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface TopFile {
  url: string
  name: string
  mimeType: string
}

interface ProjectCardProps {
  id: string
  slug: string
  title: string
  description: string | null
  fileCount: number
  ownerName: string
  ownerEmail: string
  updatedAt: Date | string
  type?: string | null
  topImages?: string[] | null
  topFiles?: TopFile[] | null
  onDelete?: () => void
  onEdit?: () => void
  userRole?: string
  orgSlug: string
  permissions?: any
}

export function ProjectCard({
  id,
  title,
  description,
  fileCount,
  ownerName,
  ownerEmail,
  updatedAt,
  type,
  topImages,
  topFiles,
  onDelete,
  onEdit,
  userRole,
  orgSlug,
  permissions,
}: ProjectCardProps) {
  const { t, dateLocale } = useI18n()

  const hasPermission = (resource: string, action: string) => {
    if (userRole === 'owner') return true
    if (permissions && permissions[resource]) {
      return permissions[resource].includes(action)
    }
    // Fallback to static check if no dynamic permissions loaded
    if (userRole) {
      return authClient.organization.checkRolePermission({
        role: userRole,
        permission: {
          [resource]: [action as any],
        },
      })
    }
    return false
  }

  const canDelete = hasPermission('project', 'delete')
  const canUpdate = hasPermission('project', 'update')

  const formattedDate = new Date(updatedAt).toLocaleDateString(dateLocale, {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  })

  // Prefer topFiles (richer), fall back to topImages for backwards compat
  const previewFiles: TopFile[] =
    topFiles && topFiles.length > 0
      ? topFiles
      : (topImages || []).map((url) => ({ url, name: '', mimeType: 'image/jpeg' }))

  const getFilePreviewContent = (file: TopFile) => {
    const ext = file.name?.split('.').pop()?.toLowerCase() || ''
    const mime = file.mimeType || ''

    if (mime.includes('image')) {
      return (
        <img
          src={file.url}
          alt={file.name || 'Image'}
          className="size-full object-cover"
          loading="lazy"
        />
      )
    }
    if (ext === 'pdf' || mime.includes('pdf')) {
      return (
        <div className="flex flex-col items-center justify-center gap-0.5 size-full bg-red-50 dark:bg-red-950/30">
          <FileText className="size-4 text-red-500" />
          <span className="text-[8px] font-bold text-red-500 leading-none">PDF</span>
        </div>
      )
    }
    if (ext === 'html' || ext === 'htm' || mime.includes('html')) {
      return (
        <div className="flex flex-col items-center justify-center gap-0.5 size-full bg-orange-50 dark:bg-orange-950/30">
          <FileCode className="size-4 text-orange-500" />
          <span className="text-[8px] font-bold text-orange-500 leading-none">HTML</span>
        </div>
      )
    }
    if (ext === 'json' || mime.includes('json')) {
      return (
        <div className="flex flex-col items-center justify-center gap-0.5 size-full bg-yellow-50 dark:bg-yellow-950/30">
          <FileJson className="size-4 text-yellow-500" />
          <span className="text-[8px] font-bold text-yellow-500 leading-none">JSON</span>
        </div>
      )
    }
    if (['csv', 'xls', 'xlsx'].includes(ext) || mime.includes('spreadsheet') || mime.includes('csv') || mime.includes('excel')) {
      return (
        <div className="flex flex-col items-center justify-center gap-0.5 size-full bg-emerald-50 dark:bg-emerald-950/30">
          <FileSpreadsheet className="size-4 text-emerald-500" />
          <span className="text-[8px] font-bold text-emerald-500 leading-none">{ext.toUpperCase() || 'CSV'}</span>
        </div>
      )
    }
    if (['zip', 'rar', 'gz', 'tar', '7z'].includes(ext) || mime.includes('zip') || mime.includes('compressed')) {
      return (
        <div className="flex flex-col items-center justify-center gap-0.5 size-full bg-violet-50 dark:bg-violet-950/30">
          <FileArchive className="size-4 text-violet-500" />
          <span className="text-[8px] font-bold text-violet-500 leading-none">{ext.toUpperCase() || 'ZIP'}</span>
        </div>
      )
    }
    if (mime.includes('video')) {
      return (
        <div className="flex flex-col items-center justify-center gap-0.5 size-full bg-blue-50 dark:bg-blue-950/30">
          <FileVideo className="size-4 text-blue-500" />
          <span className="text-[8px] font-bold text-blue-500 leading-none">{ext.toUpperCase() || 'VID'}</span>
        </div>
      )
    }
    if (mime.includes('audio')) {
      return (
        <div className="flex flex-col items-center justify-center gap-0.5 size-full bg-pink-50 dark:bg-pink-950/30">
          <FileAudio className="size-4 text-pink-500" />
          <span className="text-[8px] font-bold text-pink-500 leading-none">{ext.toUpperCase() || 'AUD'}</span>
        </div>
      )
    }
    return (
      <div className="flex flex-col items-center justify-center gap-0.5 size-full">
        <FileIcon className="size-4 text-muted-foreground" />
        {ext && <span className="text-[8px] font-bold text-muted-foreground leading-none">{ext.toUpperCase()}</span>}
      </div>
    )
  }

  const filesToShow = previewFiles.slice(0, 3)
  const remainder = fileCount - filesToShow.length

  return (
    <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }} className="h-full">
      <Card
        size="sm"
        className="h-full flex flex-col overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-colors hover:border-primary/30 group"
      >
        <CardHeader>
          <div className="row-span-2 flex items-center gap-3 min-w-0">
            {filesToShow.length > 0 ? (
              <div className="flex -space-x-2 shrink-0">
                {filesToShow.map((file, index) => (
                  <div
                    key={index}
                    className="size-8 rounded-full ring-2 ring-background overflow-hidden border border-border/50 bg-muted shrink-0"
                  >
                    {getFilePreviewContent(file)}
                  </div>
                ))}
                {remainder > 0 && (
                  <div className="size-8 rounded-full ring-2 ring-background bg-muted/70 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-medium text-muted-foreground">+{remainder}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl bg-primary/10 p-2.5 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground shrink-0">
                <Folder className="size-5" />
              </div>
            )}
            <div className="flex flex-col gap-0.5 min-w-0 overflow-hidden">
              <div className="group-hover:text-primary transition-colors truncate">
                <CardTitle className="truncate">
                  <Link
                    to="/organizations/$slug/projects/$projectId"
                    params={{ slug: orgSlug, projectId: id }}
                    className="block truncate"
                  >
                    {title}
                  </Link>
                </CardTitle>
              </div>
              <CardDescription className="truncate">
                {fileCount} {fileCount === 1 ? t.projects.card.files : t.projects.card.files_plural}
              </CardDescription>
            </div>
          </div>
          <CardAction>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="secondary"
                    size="icon"
                    className="size-8 rounded-full bg-muted/50 hover:bg-muted/80"
                  >
                    <MoreVertical className="size-4 text-foreground/70" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-48 rounded-xl">
                <DropdownMenuItem asChild>
                  <Link
                    to="/organizations/$slug/projects/$projectId"
                    params={{ slug: orgSlug, projectId: id }}
                    className="cursor-pointer"
                  >
                    <ExternalLink className="mr-2 size-4 text-muted-foreground" />
                    Open Project
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    navigator.clipboard.writeText(id)
                    toast.success('Project ID copied to clipboard')
                  }}
                >
                  <Copy className="mr-2 size-4 text-muted-foreground" />
                  Copy ID
                </DropdownMenuItem>

                {canUpdate && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit?.()
                    }}
                  >
                    <Pencil className="mr-2 size-4 text-muted-foreground" />
                    Edit Project
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    const url = `${window.location.origin}/organizations/${orgSlug}/projects/${id}`
                    navigator.clipboard.writeText(url)
                    toast.success('Project link copied to clipboard')
                  }}
                >
                  <Share2 className="mr-2 size-4 text-muted-foreground" />
                  Share Link
                </DropdownMenuItem>

                {canDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                          onSelect={(e) => e.preventDefault()}
                          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                        >
                          <Trash2 className="mr-2 size-4" />
                          Delete Project
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t.projects.card.deleteTitle}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t.projects.card.deleteDesc}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
                            {t.common.cancel}
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={(e) => {
                              e.stopPropagation()
                              onDelete?.()
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {t.actions.delete}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </CardAction>
        </CardHeader>

        <CardContent className="flex-1">
          <div className="flex flex-col gap-2">
            <CardDescription className="truncate">
              {description || t.projects.form.noDescription}
            </CardDescription>
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between mt-auto pt-4 border-t border-border/40">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <User className="size-3.5" />
            <span className="truncate max-w-[120px]">{ownerName}</span>
          </div>
          <div className="text-xs font-medium text-muted-foreground">{formattedDate}</div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
