import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useParams } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { CreateProjectDialog } from '@/components/projects/create-project-dialog'
import { EditProjectDialog } from '@/components/projects/edit-project-dialog'
import { ProjectList } from '@/components/projects/project-list'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useI18n } from '@/i18n/context'
import { createProject, deleteProject, getProjects, getProjectTypes } from '@/server/project-fns'
import { orgBySlugQuery } from '@/server/query-keys'
import { useSession } from '../../../../../../lib/auth-client'

export const Route = createFileRoute('/_app/organizations/$slug/projects/')({
  component: ProjectsPage,
})

function ProjectsPage() {
  const { slug } = useParams({ from: '/_app/organizations/$slug/projects/' })
  const { t } = useI18n()
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editProjectId, setEditProjectId] = useState<string | null>(null)

  const { data: orgData } = useQuery(orgBySlugQuery(slug))
  const org = orgData?.org
  const userRole = orgData?.role
  const permissions = orgData?.permissions

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects', org?.id],
    queryFn: () => getProjects({ data: org?.id as string }),
    enabled: !!org?.id,
  })

  const { data: projectTypes } = useQuery({
    queryKey: ['project-types', org?.id],
    queryFn: () => getProjectTypes({ data: org?.id as string }),
    enabled: !!org?.id,
  })

  const createMutation = useMutation({
    mutationFn: (data: {
      title: string
      organizationId: string
      description?: string
      typeId?: string
      githubUrl?: string
      otherUrl?: string
    }) => createProject({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['projects-count'] })
      toast.success('Project created successfully')
      setIsCreateOpen(false)
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message || 'Failed to create project')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (projectId: string) => deleteProject({ data: { projectId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['projects-count'] })
      toast.success('Project deleted successfully')
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message || 'Failed to delete project')
    },
  })

  if (isLoading || !org)
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner />
      </div>
    )

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {t.projects.title}
        </h1>
        <p className="text-muted-foreground">{t.projects.subtitle}</p>
      </div>

      <ProjectList
        projects={projects || []}
        orgSlug={slug}
        userRole={userRole}
        permissions={permissions}
        onDelete={(id) => deleteMutation.mutate(id)}
        onEdit={(id) => setEditProjectId(id)}
        onCreate={() => setIsCreateOpen(true)}
      />

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

      <EditProjectDialog
        projectId={editProjectId}
        open={!!editProjectId}
        onOpenChange={(open) => {
          if (!open) setEditProjectId(null)
        }}
        projectTypes={projectTypes}
      />
    </div>
  )
}
