import { useState } from 'react'
import { authClient } from 'lib/auth-client'
import { ProjectCard } from './project-card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Filter, SortAsc, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n/context'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from '@/components/ui/empty'
interface Project {
  id: string
  title: string
  description: string | null
  slug: string
  createdAt: Date | string
  updatedAt: Date | string
  type: string | null
  fileCount: number
  topImages: string[] | null
  topFiles?: { url: string; name: string; mimeType: string }[] | null
  ownerName: string
  ownerEmail: string
}

interface ProjectListProps {
  projects: Project[]
  orgSlug: string
  userRole?: string
  permissions?: any
  onDelete?: (id: string) => void
  onEdit?: (id: string) => void
  onCreate?: () => void
}

export function ProjectList({
  projects,
  orgSlug,
  userRole,
  permissions,
  onDelete,
  onEdit,
  onCreate,
}: ProjectListProps) {
  const { t } = useI18n()
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')
  const [typeFilter, setTypeFilter] = useState('all')

  const canCreate =
    userRole === 'owner' ||
    (permissions && permissions.project?.includes('create')) ||
    (!permissions &&
      userRole &&
      authClient.organization.checkRolePermission({
        role: userRole,
        permission: { project: ['create'] },
      }))

  const filteredProjects = projects
    .filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase())
      const matchesType = typeFilter === 'all' || p.type === typeFilter
      return matchesSearch && matchesType
    })
    .sort((a, b) => {
      if (sort === 'newest')
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      if (sort === 'oldest')
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      if (sort === 'az') return a.title.localeCompare(b.title)
      if (sort === 'za') return b.title.localeCompare(a.title)
      return 0
    })

  return (
    <div className="space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input
            placeholder={t.projects.search}
            className="pl-10 h-11 rounded-2xl bg-card border-border focus:bg-card transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[140px] h-11 rounded-2xl border-border bg-card">
              <SortAsc className="mr-2 size-4 text-muted-foreground" />
              <SelectValue placeholder={t.projects.form.sortNewest} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">{t.projects.form.sortNewest}</SelectItem>
              <SelectItem value="oldest">{t.projects.form.sortOldest}</SelectItem>
              <SelectItem value="az">{t.projects.form.sortAZ}</SelectItem>
              <SelectItem value="za">{t.projects.form.sortZA}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px] h-11 rounded-2xl border-border bg-card">
              <Filter className="mr-2 size-4 text-muted-foreground" />
              <SelectValue placeholder={t.projects.form.filterAll} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.projects.form.filterAll}</SelectItem>
              <SelectItem value="THESE">{t.projects.types.THESE}</SelectItem>
              <SelectItem value="STAGE">{t.projects.types.STAGE}</SelectItem>
              <SelectItem value="AUTRE">{t.projects.types.AUTRE}</SelectItem>
            </SelectContent>
          </Select>

          {canCreate && (
            <Button
              onClick={onCreate}
              className="h-11 px-6 rounded-xl gap-2 font-semibold shadow-lg shadow-primary/20"
            >
              <Plus className="size-4" />
              {t.projects.createNew}
            </Button>
          )}
        </div>
      </div>

      {/* Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              {...project}
              orgSlug={orgSlug}
              userRole={userRole}
              permissions={permissions}
              onDelete={() => onDelete?.(project.id)}
              onEdit={() => onEdit?.(project.id)}
            />
          ))}
        </div>
      ) : (
        <Empty className="py-24 rounded-[2rem] border-2 border-border/50 bg-muted/10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Search />
            </EmptyMedia>
            <EmptyTitle>{t.projects.noProjects}</EmptyTitle>
            <EmptyDescription>{t.projects.emptyDesc}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  )
}
