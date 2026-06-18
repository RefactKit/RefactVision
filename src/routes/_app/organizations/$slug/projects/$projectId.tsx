import { GithubIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link, useParams } from '@tanstack/react-router'
import {
  ArrowLeft,
  BarChart,
  Cpu,
  Database,
  Globe,
  LayoutGrid,
  List,
  MoreHorizontal,
  Network,
  Pencil,
  Plus,
  Tags,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { ClassesTable } from '@/components/projects/classes-table'
import { EditProjectDialog } from '@/components/projects/edit-project-dialog'
import { LabelingGallery } from '@/components/projects/labeling-gallery'
import { ModelsTable } from '@/components/projects/models-table'
import { ProjectFilesTable } from '@/components/projects/project-files-table'
import { ProjectStats } from '@/components/projects/project-stats'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useI18n } from '@/i18n/context'
import { cn } from '@/lib/utils'
import {
  bulkLabelFiles,
  createCategory,
  deleteFiles,
  getProjectById,
  getProjectStats,
  linkProjectFile,
} from '@/server/project-fns'
import { orgBySlugQuery } from '@/server/query-keys'
import { uploadFile } from '@/server/storage-fns'

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
  const [activeTab, setActiveTab] = useState('dataset')
  const [ultraKey, setUltraKey] = useState('')
  const [roboflowKey, setRoboflowKey] = useState('')
  const [isUltraImporting, setIsUltraImporting] = useState(false)
  const [isRoboflowImporting, setIsRoboflowImporting] = useState(false)

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProjectById({ data: projectId }),
  })

  const { data: stats } = useQuery({
    queryKey: ['project-stats', projectId],
    queryFn: () => getProjectStats({ data: projectId }),
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
        <EditProjectDialog projectId={projectId} open={isEditOpen} onOpenChange={setIsEditOpen} />

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
              <HugeiconsIcon icon={GithubIcon} size={24} className="size-4" />
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

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full flex flex-col gap-6 mt-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <TabsList className="h-11 p-1 bg-muted/80 dark:bg-muted/40 rounded-xl border border-border/60 dark:border-border/20 shadow-inner w-full sm:w-auto flex shrink-0 overflow-x-auto">
            <TabsTrigger
              value="dataset"
              className="px-4 py-2 rounded-lg data-active:bg-background data-active:text-foreground dark:data-active:bg-background/15 data-active:shadow-sm font-medium transition-all gap-2"
            >
              <Database className="size-4 shrink-0" />
              {t.projects.tabs.dataset}
            </TabsTrigger>
            <TabsTrigger
              value="classes"
              className="px-4 py-2 rounded-lg data-active:bg-background data-active:text-foreground dark:data-active:bg-background/15 data-active:shadow-sm font-medium transition-all gap-2"
            >
              <Tags className="size-4 shrink-0" />
              {t.projects.tabs.classes}
            </TabsTrigger>
            <TabsTrigger
              value="models"
              className="px-4 py-2 rounded-lg data-active:bg-background data-active:text-foreground dark:data-active:bg-background/15 data-active:shadow-sm font-medium transition-all gap-2"
            >
              <Cpu className="size-4 shrink-0" />
              {t.projects.tabs.models}
            </TabsTrigger>
            <TabsTrigger
              value="integration"
              className="px-4 py-2 rounded-lg data-active:bg-background data-active:text-foreground dark:data-active:bg-background/15 data-active:shadow-sm font-medium transition-all gap-2"
            >
              <Network className="size-4 shrink-0" />
              {t.projects.tabs.integration}
            </TabsTrigger>
            <TabsTrigger
              value="stats"
              className="px-4 py-2 rounded-lg data-active:bg-background data-active:text-foreground dark:data-active:bg-background/15 data-active:shadow-sm font-medium transition-all gap-2"
            >
              <BarChart className="size-4 shrink-0" />
              {t.projects.tabs.stats}
            </TabsTrigger>
          </TabsList>

          {activeTab === 'dataset' && (
            <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
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
          )}
        </div>

        <TabsContent value="dataset" className="mt-0 flex flex-col gap-6">
          {/* Category Pills & Progress Bar */}
          <div className="flex flex-col gap-4">
            <div className="bg-muted/20 dark:bg-muted/15 p-1 rounded-2xl flex items-center gap-1 w-fit max-w-full overflow-x-auto border border-border/50 dark:border-border/25 shadow-sm">
              <button
                type="button"
                onClick={() => setSelectedCategoryId(null)}
                className={cn(
                  'relative flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-xl transition-all whitespace-nowrap',
                  selectedCategoryId === null
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                All
                <span className="text-[10px] text-muted-foreground align-super -mt-2">
                  {project.files.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCategoryId('__unlabeled__')}
                className={cn(
                  'relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all whitespace-nowrap',
                  selectedCategoryId === '__unlabeled__'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <span className="size-2.5 rounded-full shrink-0 bg-muted-foreground/30" />
                Not Labelled
                <span className="text-[10px] text-muted-foreground align-super -mt-2">
                  {project.files.filter((f) => f.categoryId === null).length}
                </span>
              </button>

              {project.categories.map((cat, idx) => {
                const count = project.files.filter((f) => f.categoryId === cat.id).length
                const isActive = selectedCategoryId === cat.id
                const dotColor = colorsPalette[idx % colorsPalette.length]
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={cn(
                      'relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all',
                      isActive
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <span className={cn('size-2.5 rounded-full shrink-0', dotColor)} />
                    {cat.name}
                    {count > 0 && (
                      <span className="text-[10px] text-muted-foreground align-super -mt-2">
                        {count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Segmented Progress Bar */}
            {project.files.length > 0 && (
              <div className="h-2 w-full rounded-full flex overflow-hidden bg-muted/20 border border-border/10 shadow-inner">
                {project.categories.map((cat, idx) => {
                  const count = project.files.filter((f) => f.categoryId === cat.id).length
                  if (count === 0) return null
                  const percentage = (count / project.files.length) * 100
                  const dotColor = colorsPalette[idx % colorsPalette.length]
                  return (
                    <div
                      key={cat.id}
                      style={{ width: `${percentage}%` }}
                      className={cn('h-full transition-all duration-500', dotColor)}
                      title={`${cat.name}: ${count} files (${percentage.toFixed(1)}%)`}
                    />
                  )
                })}
                {/* Unlabeled Files segment */}
                {(() => {
                  const unlabeledCount = project.files.filter((f) => f.categoryId === null).length
                  if (unlabeledCount === 0) return null
                  const percentage = (unlabeledCount / project.files.length) * 100
                  return (
                    <div
                      style={{ width: `${percentage}%` }}
                      className="h-full bg-muted-foreground/20 transition-all duration-500"
                      title={`Unlabeled: ${unlabeledCount} files (${percentage.toFixed(1)}%)`}
                    />
                  )
                })()}
              </div>
            )}
          </div>

          {/* Studio Content */}
          <div className="w-full">
            {viewMode === 'grid' ? (
              <LabelingGallery
                files={project.files}
                categories={project.categories}
                selectedCategoryId={selectedCategoryId}
                onBulkLabel={(ids, catId) =>
                  bulkLabelFiles({ data: { fileIds: ids, categoryId: catId } }).then(() => {
                    queryClient.invalidateQueries({ queryKey: ['project', projectId] })
                    toast.success('Files labeled')
                  })
                }
                onDeleteFiles={(ids) => {
                  deleteFiles({ data: ids }).then(() => {
                    queryClient.invalidateQueries({ queryKey: ['project', projectId] })
                    toast.success('Files deleted')
                  })
                }}
                onCreateCategory={(name) => {
                  createCategory({ data: { projectId, name } }).then(() => {
                    queryClient.invalidateQueries({ queryKey: ['project', projectId] })
                    toast.success('Category added')
                  })
                }}
                onUploadClick={handleUpload}
              />
            ) : (
              <ProjectFilesTable
                files={project.files}
                categories={project.categories}
                selectedCategoryId={selectedCategoryId}
                onBulkLabel={(ids, catId) =>
                  bulkLabelFiles({ data: { fileIds: ids, categoryId: catId } }).then(() => {
                    queryClient.invalidateQueries({ queryKey: ['project', projectId] })
                    toast.success('Files labeled')
                  })
                }
                onDeleteFiles={(ids) => {
                  deleteFiles({ data: ids }).then(() => {
                    queryClient.invalidateQueries({ queryKey: ['project', projectId] })
                    toast.success('Files deleted')
                  })
                }}
                onCreateCategory={(name) => {
                  createCategory({ data: { projectId, name } }).then(() => {
                    queryClient.invalidateQueries({ queryKey: ['project', projectId] })
                    toast.success('Category added')
                  })
                }}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="integration" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {/* Ultralytics Card */}
            <Card className="flex flex-col gap-6">
              <CardHeader className="flex flex-col items-center text-center gap-4 pb-0">
                <div className="flex items-center justify-center h-20 w-full p-2 bg-white rounded-2xl border border-border/10 shadow-sm dark:bg-white dark:border-white/20">
                  <img
                    src="/ultra.jpeg"
                    alt="Ultralytics Hub Logo"
                    className="h-12 w-auto object-contain"
                  />
                </div>
                <CardDescription className="text-center text-sm font-normal text-muted-foreground leading-relaxed max-w-sm">
                  Transfer your datasets, projects, models, and account balance.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-end">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (!ultraKey) {
                      toast.error('Please enter an Ultralytics HUB API Key')
                      return
                    }
                    setIsUltraImporting(true)
                    setTimeout(() => {
                      setIsUltraImporting(false)
                      toast.success('Ultralytics HUB integration configured successfully!')
                      setUltraKey('')
                    }, 2000)
                  }}
                  className="flex flex-col gap-4"
                >
                  <Field>
                    <FieldLabel className="text-left font-medium text-foreground">
                      Ultralytics HUB API Key
                    </FieldLabel>
                    <Input
                      type="password"
                      placeholder="Enter your Ultralytics HUB API Key"
                      value={ultraKey}
                      onChange={(e) => setUltraKey(e.target.value)}
                      className="rounded-xl h-10 w-full"
                    />
                  </Field>
                  <Button
                    type="submit"
                    className="rounded-xl h-10 w-full font-medium shadow-sm transition-all"
                    disabled={isUltraImporting || !ultraKey.trim()}
                  >
                    {isUltraImporting ? (
                      <>
                        <Spinner data-icon="inline-start" />
                        Importing...
                      </>
                    ) : (
                      'Import'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Roboflow Card */}
            <Card className="flex flex-col gap-6">
              <CardHeader className="flex flex-col items-center text-center gap-4 pb-0">
                <div className="flex items-center justify-center h-20 w-full p-2 bg-white rounded-2xl border border-border/10 shadow-sm dark:bg-white dark:border-white/20">
                  <img
                    src="/roboflow.png"
                    alt="Roboflow Logo"
                    className="h-12 w-auto object-contain"
                  />
                </div>
                <CardDescription className="text-center text-sm font-normal text-muted-foreground leading-relaxed max-w-sm">
                  Import every dataset from your Roboflow workspace. Re-run to pull in new datasets.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-end">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (!roboflowKey) {
                      toast.error('Please enter a Roboflow API Key')
                      return
                    }
                    setIsRoboflowImporting(true)
                    setTimeout(() => {
                      setIsRoboflowImporting(false)
                      toast.success('Roboflow integration configured successfully!')
                      setRoboflowKey('')
                    }, 2000)
                  }}
                  className="flex flex-col gap-4"
                >
                  <Field>
                    <FieldLabel className="text-left font-medium text-foreground">
                      Roboflow API Key
                    </FieldLabel>
                    <Input
                      type="password"
                      placeholder="Enter your Roboflow API key..."
                      value={roboflowKey}
                      onChange={(e) => setRoboflowKey(e.target.value)}
                      className="rounded-xl h-10 w-full"
                    />
                  </Field>
                  <Button
                    type="submit"
                    className="rounded-xl h-10 w-full font-medium shadow-sm transition-all"
                    disabled={isRoboflowImporting || !roboflowKey.trim()}
                  >
                    {isRoboflowImporting ? (
                      <>
                        <Spinner data-icon="inline-start" />
                        Importing...
                      </>
                    ) : (
                      'Import'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="classes" className="mt-0">
          <ClassesTable categories={project.categories} files={project.files} />
        </TabsContent>

        <TabsContent value="models" className="mt-0">
          <ModelsTable projectId={projectId} />
        </TabsContent>

        <TabsContent value="stats" className="mt-0">
          <ProjectStats stats={stats} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
