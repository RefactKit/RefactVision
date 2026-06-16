import { createFileRoute, useParams } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getProjectById,
  createCategory,
  bulkLabelFiles,
  linkProjectFile,
  deleteFiles,
} from '@/server/project-fns'
import { uploadFile } from '@/server/storage-fns'
import { LabelingGallery } from '@/components/projects/labeling-gallery'
import { ProjectFilesTable } from '@/components/projects/project-files-table'
import { EditProjectDialog } from '@/components/projects/edit-project-dialog'
import { useI18n } from '@/i18n/context'
import { Skeleton } from '@/components/ui/skeleton'
import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { orgBySlugQuery } from '@/server/query-keys'
import { cn } from '@/lib/utils'
import {
  Folder,
  LayoutGrid,
  List,
  MoreHorizontal,
  Pencil,
  Github,
  Globe,
  Plus,
  ArrowLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/organizations/$slug/projects/$projectId')({
  component: ProjectStudioPage,
})

function ProjectStudioPage() {
  const { slug, projectId } = useParams({ from: '/_app/organizations/$slug/projects/$projectId' })
  const { t } = useI18n()
  const queryClient = useQueryClient()
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isEditOpen, setIsEditOpen] = useState(false)

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProjectById({ data: projectId }),
  })

  const { data: org } = useQuery(orgBySlugQuery(slug))

  const handleUpload = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files
      if (!files) return

      toast.promise(
        async () => {
          for (const file of Array.from(files)) {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('bucket', 'projects')
            formData.append('path', `dataset-${project?.slug}/unlabeled`)

            const result = await uploadFile({ data: formData })

            if (result.url) {
              await linkProjectFile({
                data: {
                  projectId,
                  categoryId: selectedCategoryId,
                  name: file.name,
                  path: result.path,
                  url: result.url,
                  mimeType: file.type,
                  size: file.size,
                  uploadedBy: project.userId,
                },
              })
            }
          }
          queryClient.invalidateQueries({ queryKey: ['project', projectId] })
        },
        {
          loading: 'Uploading files...',
          success: 'Files uploaded successfully',
          error: 'Failed to upload some files',
        },
      )
    }
    input.click()
  }

  if (isLoading || !project)
    return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
        {/* Back button skeleton */}
        <Skeleton className="size-8 rounded-lg" />

        {/* Project header skeleton */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-64 rounded-lg" />
            <Skeleton className="size-8 rounded-lg" />
          </div>
          <Skeleton className="h-6 w-96 rounded-lg" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-24 rounded-lg" />
            <Skeleton className="h-4 w-28 rounded-lg" />
          </div>
        </div>

        {/* Gallery controls skeleton */}
        <div className="flex items-center justify-between border-b border-border/40 pb-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-28 rounded-lg" />
            <Skeleton className="h-6 w-8 rounded-lg" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-20 rounded-xl" />
            <Skeleton className="h-10 w-28 rounded-xl" />
          </div>
        </div>

        {/* File grid skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="aspect-4/3 rounded-2xl" />
              <Skeleton className="h-4 w-full rounded-lg" />
              <Skeleton className="h-3 w-2/3 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    )

  return (
    <div className="flex flex-col gap-4 max-w-6xl mx-auto w-full">
      {/* Project Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/organizations/$slug/projects"
            params={{ slug }}
            className="flex items-center justify-center size-8 rounded-md hover:bg-muted text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 mr-1"
          >
            <ArrowLeft className="size-5 stroke-[2.5px]" />
          </Link>
          <h1 className="text-3xl font-medium tracking-tight text-foreground">{project.title}</h1>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-lg"
            onClick={() => setIsEditOpen(true)}
          >
            <Pencil className="size-4 text-muted-foreground" />
          </Button>
        </div>

        {/* Edit Project Dialog */}
        <EditProjectDialog
          projectId={projectId}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
        />

        <div className="flex flex-col gap-1">
          <p className="text-lg text-muted-foreground">
            {project.description || 'Project de classification -thèse'}
          </p>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              <Github className="size-4" />
              GitHub
            </a>
          )}
          {project.otherUrl && (
            <a
              href={project.otherUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              <Globe className="size-4" />
              Website
            </a>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-6">
        {/* Gallery Section Controls */}
        <div className="flex items-center justify-between border-b border-border/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-foreground font-medium">
              <Folder className="size-5" />
              Project Files
            </div>
            <Badge
              variant="outline"
              className="rounded-lg px-2 h-6 text-xs font-medium bg-muted/30"
            >
              {project.files.length}
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-muted/30 p-1 rounded-xl">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                className={cn(
                  'size-8 rounded-lg',
                  viewMode === 'grid' && 'bg-background shadow-sm',
                )}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="size-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                className={cn(
                  'size-8 rounded-lg',
                  viewMode === 'list' && 'bg-background shadow-sm',
                )}
                onClick={() => setViewMode('list')}
              >
                <List className="size-4" />
              </Button>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button className="rounded-xl h-10 px-5 gap-2 font-medium shadow-sm">
                    <Plus className="size-4" />
                    Actions
                    <MoreHorizontal className="size-4 ml-1" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-48 rounded-xl">
                <DropdownMenuItem onClick={handleUpload}>Upload Images</DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    const name = prompt('New class name:')
                    if (name) {
                      createCategory({ data: { projectId, name } }).then(() => {
                        queryClient.invalidateQueries({ queryKey: ['project', projectId] })
                        toast.success('Category added')
                      })
                    }
                  }}
                >
                  Create Class
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Studio Content */}
        <div className="w-full">
          {viewMode === 'grid' ? (
            <LabelingGallery
              files={project.files}
              selectedCategoryId={selectedCategoryId}
              onBulkLabel={(ids) => {
                bulkLabelFiles({ data: { fileIds: ids, categoryId: selectedCategoryId } }).then(
                  () => {
                    queryClient.invalidateQueries({ queryKey: ['project', projectId] })
                    toast.success('Files labeled')
                  },
                )
              }}
              onDeleteFiles={(ids) => {
                deleteFiles({ data: ids }).then(() => {
                  queryClient.invalidateQueries({ queryKey: ['project', projectId] })
                  toast.success('Files deleted')
                })
              }}
              onUploadClick={handleUpload}
            />
          ) : (
            <ProjectFilesTable
              files={project.files}
              selectedCategoryId={selectedCategoryId}
              onBulkLabel={(ids) => {
                bulkLabelFiles({ data: { fileIds: ids, categoryId: selectedCategoryId } }).then(
                  () => {
                    queryClient.invalidateQueries({ queryKey: ['project', projectId] })
                    toast.success('Files labeled')
                  },
                )
              }}
              onDeleteFiles={(ids) => {
                deleteFiles({ data: ids }).then(() => {
                  queryClient.invalidateQueries({ queryKey: ['project', projectId] })
                  toast.success('Files deleted')
                })
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
