import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link, useParams } from '@tanstack/react-router'
import {
  ArrowRight,
  Code,
  Compass,
  Database,
  FolderIcon,
  HardDriveIcon,
  Image as ImageIcon,
  LayoutDashboardIcon,
  Lock,
  Package,
  Plus,
  Upload,
  UsersIcon,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { CreateProjectDialog } from '@/components/projects/create-project-dialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useI18n } from '@/i18n/context'
import { cn } from '@/lib/utils'
import { createProject, getProjects, getProjectTypes, linkProjectFile } from '@/server/project-fns'
import { orgStatsQuery } from '@/server/query-keys'
import { uploadFile } from '@/server/storage-fns'
import { useSession } from '../../../../../lib/auth-client'
import { Route as OrgRoute } from './route'

export const Route = createFileRoute('/_app/organizations/$slug/dashboard')({
  component: DashboardPage,
})

function formatBytes(bytes: number, decimals = 1) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`
}

// biome-ignore lint/suspicious/noExplicitAny: TanStack Start server functions client typing workaround
const callServerFn = (fn: any, args: any) => fn(args)

function DashboardPage() {
  const { t } = useI18n()
  const { org } = OrgRoute.useLoaderData()
  const { slug } = useParams({ from: '/_app/organizations/$slug/dashboard' })
  const queryClient = useQueryClient()
  const { data: session } = useSession()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isDraggingDataset, setIsDraggingDataset] = useState(false)
  const [isDraggingModel, setIsDraggingModel] = useState(false)

  const datasetInputRef = useRef<HTMLInputElement | null>(null)
  const modelInputRef = useRef<HTMLInputElement | null>(null)

  const { data: stats, isLoading } = useQuery(orgStatsQuery(org.id))

  const { data: projects } = useQuery({
    queryKey: ['projects', org.id],
    queryFn: () => callServerFn(getProjects, { data: org.id }),
    enabled: !!org.id,
  })

  const { data: projectTypes } = useQuery({
    queryKey: ['project-types', org.id],
    queryFn: () => callServerFn(getProjectTypes, { data: org.id }),
    enabled: !!org.id,
  })

  const createMutation = useMutation({
    mutationFn: (data: {
      title: string
      organizationId: string
      description?: string
      typeId?: string
      githubUrl?: string
      otherUrl?: string
    }) => callServerFn(createProject, { data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['projects-count'] })
      queryClient.invalidateQueries({ queryKey: ['org-stats'] })
      toast.success('Project created successfully')
      setIsCreateOpen(false)
    },
    onError: (err: Error) => {
      toast.error(err instanceof Error ? err.message : 'Failed to create project')
    },
  })

  const handleUploadFiles = async (files: File[], type: 'dataset' | 'model') => {
    if (!org?.id) return

    const targetProject = projects?.[0]

    // Check if a project exists to link files to
    if (!targetProject) {
      toast.error('Please create a project first before uploading files.')
      setIsCreateOpen(true)
      return
    }

    // Validation for model card
    if (type === 'model') {
      const invalidFiles = files.filter((f) => !f.name.endsWith('.pt'))
      if (invalidFiles.length > 0) {
        toast.error('Only .pt model files are allowed in this zone.')
        return
      }
    }

    toast.promise(
      async () => {
        for (const file of files) {
          const formData = new FormData()
          formData.append('file', file)
          formData.append('bucket', 'projects')

          const pathPrefix = type === 'model' ? 'models' : 'unlabeled'
          formData.append('path', `dataset-${targetProject.slug}/${pathPrefix}`)

          const result = await callServerFn(uploadFile, { data: formData })

          if (result.url) {
            await callServerFn(linkProjectFile, {
              data: {
                projectId: targetProject.id,
                categoryId: null,
                name: file.name,
                path: result.path,
                url: result.url,
                mimeType:
                  file.type || (type === 'model' ? 'application/octet-stream' : 'image/jpeg'),
                size: file.size,
                uploadedBy: session?.user?.id || 'unknown',
              },
            })
          }
        }
        // Invalidate queries to refresh dashboard/stats in real-time
        queryClient.invalidateQueries({ queryKey: ['org-stats', org.id] })
        queryClient.invalidateQueries({ queryKey: ['projects', org.id] })
      },
      {
        loading: `Uploading ${files.length} file(s) to project "${targetProject.title}"...`,
        success: 'Files uploaded successfully!',
        error: 'Failed to upload some files.',
      },
    )
  }

  const statCards = [
    {
      title: t.dashboard.inactiveMembers,
      value: stats?.pendingInvitationCount ?? 0,
      subtitle: t.dashboard.pendingInvites,
      icon: UsersIcon,
      color: 'text-slate-400',
    },
    {
      title: t.projects.title,
      value: stats?.imageCount ?? 0,
      subtitle: t.dashboard.totalFiles,
      icon: FolderIcon,
      color: 'text-purple-400',
    },
    {
      title: t.dashboard.storageTotal,
      value: formatBytes(stats?.totalSizeBytes ?? 0).split(' ')[0],
      unit: formatBytes(stats?.totalSizeBytes ?? 0).split(' ')[1],
      subtitle: t.dashboard.totalOf.replace('{{total}}', '100 GB'),
      icon: HardDriveIcon,
      color: 'text-slate-400',
    },
    {
      title: t.dashboard.activeMembers,
      value: Math.min(1, stats?.memberCount ?? 0),
      subtitle: t.dashboard.currentSessions,
      icon: LayoutDashboardIcon,
      color: 'text-blue-500',
    },
  ]

  // Calculate proportional progress shares
  const totalUsed = stats?.totalSizeBytes ?? 0
  const datasetSize = stats?.datasetSizeBytes ?? 0
  const modelSize = stats?.modelSizeBytes ?? 0

  const limitBytes = 100 * 1024 * 1024 * 1024 // 100 GB
  const totalUsedPercent = Math.min(100, (totalUsed / limitBytes) * 100)
  // Give the colored bar a minimum visible length if files are uploaded
  const displayPercent = totalUsed > 0 ? Math.max(8, totalUsedPercent) : 0
  const datasetShare = totalUsed > 0 ? (datasetSize / totalUsed) * displayPercent : 0
  const modelShare = totalUsed > 0 ? (modelSize / totalUsed) * displayPercent : 0

  return (
    <div className="flex flex-col gap-10 max-w-7xl mx-auto w-full py-4 px-4 sm:px-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {t.dashboard.welcome.replace('{{org}}', org.name)}
        </h1>
      </div>

      <div className="grid gap-3 sm:gap-6 grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="group relative flex flex-col gap-2 sm:gap-3 rounded-2xl sm:rounded-3xl border border-border/40 bg-card p-4 sm:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-border/80"
          >
            <div className="flex flex-col gap-0.5 sm:gap-1">
              <div className="flex items-baseline gap-1 overflow-hidden">
                {isLoading ? (
                  <Skeleton className="h-7 sm:h-10 w-16 sm:w-20" />
                ) : (
                  <>
                    <span className="text-xl sm:text-4xl font-semibold tracking-tighter text-foreground truncate">
                      {card.value}
                    </span>
                    {card.unit && (
                      <span className="text-sm sm:text-2xl font-semibold tracking-tighter text-foreground">
                        {card.unit}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="flex items-start justify-between mt-auto pt-2">
              <div className="flex flex-col gap-0.5 min-w-0">
                <h3 className="text-xs sm:text-sm font-semibold text-foreground/90 tracking-tight leading-tight line-clamp-1">
                  {card.title}
                </h3>
                <p className="text-[10px] sm:text-xs font-medium text-muted-foreground/50 line-clamp-1">
                  {card.subtitle}
                </p>
              </div>
              <card.icon
                className={cn('size-4 sm:size-5 opacity-40 shrink-0 mt-0.5', card.color)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Grid containing the 3 custom cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Datasets Card */}
        <div className="group relative flex flex-col gap-4 rounded-3xl border border-border/40 bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-50 dark:bg-emerald-950/30 p-2 rounded-xl text-emerald-600 dark:text-emerald-400">
                <Database className="size-5" />
              </div>
              <h3 className="font-semibold text-lg text-foreground tracking-tight">Datasets</h3>
            </div>
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="bg-black hover:bg-neutral-900 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-black rounded-xl text-xs font-semibold px-3 py-1.5 h-auto flex items-center gap-1 transition-all shadow-sm"
            >
              <Plus className="size-3.5" />
              New Dataset
            </Button>
          </div>
          <p className="text-muted-foreground/80 text-xs sm:text-sm -mt-2">
            Upload images, videos, and datasets
          </p>

          <input
            type="file"
            ref={datasetInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleUploadFiles(Array.from(e.target.files), 'dataset')
              }
            }}
            multiple
            className="hidden"
          />

          {/* biome-ignore lint/a11y/useKeyWithClickEvents: click helper */}
          {/* biome-ignore lint/a11y/noStaticElementInteractions: click helper */}
          <div
            onClick={() => datasetInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDraggingDataset(true)
            }}
            onDragLeave={() => setIsDraggingDataset(false)}
            onDrop={(e) => {
              e.preventDefault()
              setIsDraggingDataset(false)
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleUploadFiles(Array.from(e.dataTransfer.files), 'dataset')
              }
            }}
            className={cn(
              'border-2 border-dashed border-border/60 hover:border-primary/50 transition-all rounded-2xl p-6 cursor-pointer text-center bg-muted/5 hover:bg-muted/10 flex flex-col items-center justify-center min-h-[140px] gap-2',
              isDraggingDataset && 'border-primary bg-primary/5',
            )}
          >
            <Upload className="size-6 text-muted-foreground/50" />
            <div className="flex flex-col gap-1">
              <p className="text-xs sm:text-sm font-medium text-foreground">
                Drop images, videos or datasets
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground/50 leading-relaxed">
                Images &lt;50 MB · Videos &lt;1 GB · Datasets &lt;10 GB — ZIP, TAR, NDJSON
              </p>
            </div>
          </div>
        </div>

        {/* Projects Card */}
        <div className="group relative flex flex-col gap-4 rounded-3xl border border-border/40 bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-purple-50 dark:bg-purple-950/30 p-2 rounded-xl text-purple-600 dark:text-purple-400">
                <FolderIcon className="size-5" />
              </div>
              <h3 className="font-semibold text-lg text-foreground tracking-tight">Projects</h3>
            </div>
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="bg-black hover:bg-neutral-900 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-black rounded-xl text-xs font-semibold px-3 py-1.5 h-auto flex items-center gap-1 transition-all shadow-sm"
            >
              <Plus className="size-3.5" />
              New Project
            </Button>
          </div>
          <p className="text-muted-foreground/80 text-xs sm:text-sm -mt-2">
            Create a project to organize models
          </p>

          <input
            type="file"
            ref={modelInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleUploadFiles(Array.from(e.target.files), 'model')
              }
            }}
            accept=".pt"
            multiple
            className="hidden"
          />

          {/* biome-ignore lint/a11y/useKeyWithClickEvents: click helper */}
          {/* biome-ignore lint/a11y/noStaticElementInteractions: click helper */}
          <div
            onClick={() => modelInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDraggingModel(true)
            }}
            onDragLeave={() => setIsDraggingModel(false)}
            onDrop={(e) => {
              e.preventDefault()
              setIsDraggingModel(false)
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleUploadFiles(Array.from(e.dataTransfer.files), 'model')
              }
            }}
            className={cn(
              'border-2 border-dashed border-border/60 hover:border-primary/50 transition-all rounded-2xl p-6 cursor-pointer text-center bg-muted/5 hover:bg-muted/10 flex flex-col items-center justify-center min-h-[140px] gap-2',
              isDraggingModel && 'border-primary bg-primary/5',
            )}
          >
            <Upload className="size-6 text-muted-foreground/50" />
            <div className="flex flex-col gap-1">
              <p className="text-xs sm:text-sm font-medium text-foreground">Drop .pt model files</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground/50">
                PyTorch models up to 1 GB
              </p>
            </div>
          </div>

          {projects && projects.length > 0 ? (
            <Link
              to="/organizations/$slug/projects/$projectId"
              params={{ slug, projectId: projects[0].id }}
              className="flex items-center justify-between border border-border/60 rounded-2xl p-3 bg-muted/10 hover:bg-muted/20 transition-all mt-auto"
            >
              <div className="flex items-center gap-3">
                <div className="bg-red-500 text-white font-bold size-10 rounded-xl flex items-center justify-center text-lg shadow-sm">
                  {projects[0].title.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-sm text-foreground truncate">
                      {projects[0].title}
                    </span>
                    <Lock className="size-3 text-muted-foreground/60 shrink-0" />
                  </div>
                  <span className="text-[11px] text-muted-foreground/80 font-medium">
                    {stats?.modelsCount ?? 0} model{(stats?.modelsCount ?? 0) !== 1 ? 's' : ''} ·{' '}
                    {formatBytes(stats?.modelSizeBytes ?? 0)}
                  </span>
                </div>
              </div>
            </Link>
          ) : (
            <div className="flex items-center justify-between border border-border/60 rounded-2xl p-3 bg-muted/10 mt-auto">
              <div className="flex items-center gap-3">
                <div className="bg-red-500 text-white font-bold size-10 rounded-xl flex items-center justify-center text-lg shadow-sm">
                  E
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-sm text-foreground">Example Project</span>
                    <Lock className="size-3 text-muted-foreground/60 shrink-0" />
                  </div>
                  <span className="text-[11px] text-muted-foreground/80 font-medium">
                    1 model · 5.3 MB
                  </span>
                </div>
              </div>
            </div>
          )}

          <Link
            to="/organizations/$slug/projects"
            params={{ slug }}
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 w-fit"
          >
            View all <ArrowRight className="size-3" />
          </Link>
        </div>

        {/* Storage Card */}
        <div className="group relative flex flex-col gap-4 rounded-3xl border border-border/40 bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-xl text-slate-700 dark:text-slate-300">
                <HardDriveIcon className="size-5" />
              </div>
              <h3 className="font-semibold text-lg text-foreground tracking-tight">Storage</h3>
            </div>
          </div>
          <span className="text-xs text-muted-foreground -mt-2">
            {formatBytes(stats?.totalSizeBytes ?? 0)} / 100 GB (
            {Math.max(0, ((stats?.totalSizeBytes ?? 0) / (100 * 1024 * 1024 * 1024)) * 100).toFixed(
              2,
            )}
            %)
          </span>

          <div className="h-3 w-full bg-muted/60 rounded-full overflow-hidden flex">
            {totalUsed > 0 ? (
              <>
                <div
                  style={{ width: `${datasetShare}%` }}
                  className="bg-emerald-500 h-full transition-all"
                />
                <div
                  style={{ width: `${modelShare}%` }}
                  className="bg-purple-500 h-full transition-all"
                />
              </>
            ) : (
              <div className="bg-muted h-full w-full" />
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-500" />
              <Database className="size-3 text-emerald-600 dark:text-emerald-400" />
              <span className="text-muted-foreground">
                Datasets ({formatBytes(stats?.datasetSizeBytes ?? 0)})
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-purple-500" />
              <Package className="size-3 text-purple-600 dark:text-purple-400" />
              <span className="text-muted-foreground">
                Models ({formatBytes(stats?.modelSizeBytes ?? 0)})
              </span>
            </div>
          </div>

          <div className="border-t border-border/40 my-1" />

          <div className="flex flex-col gap-2.5">
            <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Resources
            </h4>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <div className="flex items-center gap-2 text-foreground/85">
                  <FolderIcon className="size-3.5 text-muted-foreground/60" />
                  <span>Projects</span>
                </div>
                <span className="text-foreground font-semibold">{stats?.projectCount ?? 0}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-medium">
                <div className="flex items-center gap-2 text-foreground/85">
                  <Database className="size-3.5 text-muted-foreground/60" />
                  <span>Datasets</span>
                </div>
                <span className="text-foreground font-semibold">{stats?.projectCount ?? 0}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-medium">
                <div className="flex items-center gap-2 text-foreground/85">
                  <Package className="size-3.5 text-muted-foreground/60" />
                  <span>Models</span>
                </div>
                <span className="text-foreground font-semibold">
                  {stats?.modelsCount ?? 0} / 100
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-medium">
                <div className="flex items-center gap-2 text-foreground/85">
                  <ImageIcon className="size-3.5 text-muted-foreground/60" />
                  <span>Images</span>
                </div>
                <span className="text-foreground font-semibold">{stats?.imageCount ?? 0}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-medium">
                <div className="flex items-center gap-2 text-foreground/85">
                  <Compass className="size-3.5 text-muted-foreground/60" />
                  <span>Deployments</span>
                </div>
                <span className="text-foreground font-semibold">0 / 3</span>
              </div>
            </div>
          </div>

          <div className="border-t border-border/40 my-1" />

          <div className="flex flex-col gap-2 mt-auto">
            <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Largest items
            </h4>
            <div className="flex flex-col gap-1.5">
              {stats?.largestFiles && stats.largestFiles.length > 0 ? (
                stats.largestFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between text-xs font-medium"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Code className="size-3.5 text-purple-500 shrink-0" />
                      <span className="text-foreground truncate max-w-[150px]">{file.name}</span>
                    </div>
                    <span className="text-muted-foreground shrink-0">{formatBytes(file.size)}</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-muted-foreground/60 italic">
                  No files uploaded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <CreateProjectDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        isPending={createMutation.isPending}
        projectTypes={projectTypes}
        onSubmit={(data) => {
          if (!session?.user?.id) {
            toast.error('You must be logged in to create a project')
            return
          }
          createMutation.mutate({
            ...data,
            organizationId: org.id,
          })
        }}
      />
    </div>
  )
}
