import { Crown, Shield, User } from '@phosphor-icons/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import {
  AlertTriangle,
  Building2,
  ExternalLink,
  MoreVertical,
  Plus,
  Settings,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { CreateOrgDialog } from '@/components/dashboard/create-org-dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { useI18n } from '@/i18n/context'
import { deleteOrganization } from '@/server/org-fns'
import { userOrgsQuery } from '@/server/query-keys'

export const Route = createFileRoute('/_app/organizations/')({
  component: OrganizationsPage,
})

const roleConfig = {
  owner: {
    icon: Crown,
    label: 'Owner',
    className:
      'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/20',
  },
  admin: {
    icon: Shield,
    label: 'Admin',
    className:
      'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-500/15 dark:text-cyan-400 dark:border-cyan-500/20',
  },
  member: {
    icon: User,
    label: 'Member',
    className:
      'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/15 dark:text-slate-400 dark:border-slate-500/20',
  },
}

function OrganizationsPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery(userOrgsQuery())
  const orgs = data?.orgs ?? []

  const getInitials = (name: string) => {
    const words = name.trim().split(/\s+/)
    if (words.length > 1) {
      return (words[0][0] + words[1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  const [orgToDelete, setOrgToDelete] = useState<{ id: string; name: string } | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: (organizationId: string) => deleteOrganization({ data: { organizationId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-orgs'] })
      toast.success(t.orgsPage.deleteSuccess)
      setOrgToDelete(null)
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to delete organization'
      toast.error(message)
    },
  })

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{t.orgsPage.title}</h1>
          <p className="text-muted-foreground mt-2">{t.orgsPage.subtitle}</p>
        </div>
        {(orgs.length === 0 || orgs.some((o) => o.role === 'owner' || o.role === 'admin')) && (
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98] w-full sm:w-auto shrink-0"
          >
            <Plus className="size-4" />
            {t.orgsPage.createNew}
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex flex-col gap-4 rounded-3xl border border-border/40 bg-card p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
            >
              <div className="flex items-start justify-between">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="size-5 rounded-md" />
              </div>
              <div className="flex flex-col gap-2 mt-auto">
                <Skeleton className="h-9 w-2/3" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : orgs.length === 0 ? (
        <Card
          className="border-dashed cursor-pointer rounded-3xl"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <CardContent className="flex flex-col items-center justify-center py-24 text-center">
            <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-6">
              <Building2 className="size-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-xl mb-2">{t.orgsPage.createNew}</CardTitle>
            <CardDescription className="max-w-xs text-base">
              {t.orgsPage.createNewDesc}
            </CardDescription>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {orgs.map((org, index) => {
            const role = roleConfig[org.role as keyof typeof roleConfig] ?? roleConfig.member
            const RoleIcon = role.icon
            const isOwner = org.role === 'owner'

            return (
              <div key={org.id} className="group relative">
                <Link
                  to="/organizations/$slug/dashboard"
                  params={{ slug: org.slug }}
                  search={{ page: 1 }}
                  className="block h-full outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-3xl"
                >
                  <div className="flex flex-col rounded-3xl border border-border/40 bg-card p-5 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-border/80">
                    <div className="flex items-center gap-5 pr-10 rtl:pr-0 rtl:pl-10">
                      <Avatar
                        shape="square"
                        className="size-14 sm:size-16 after:hidden shrink-0 transition-colors group-hover:opacity-90 rounded-2xl"
                      >
                        {org.logo && <AvatarImage src={org.logo} className="object-cover" />}
                        <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-2xl">
                          {getInitials(org.name)}
                        </AvatarFallback>
                        {index === 0 && (
                          <AvatarBadge className="bg-emerald-500 border-2 border-card size-4 right-[-2px] bottom-[-2px]" />
                        )}
                      </Avatar>

                      <div className="flex flex-col gap-1.5 min-w-0">
                        <h3 className="text-xl font-semibold text-foreground tracking-tight leading-tight line-clamp-1">
                          {org.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-1.5 py-0 h-5.5 gap-1 rounded-md font-semibold uppercase tracking-wider ${role.className}`}
                          >
                            {RoleIcon && <RoleIcon weight="duotone" className="size-3" />}
                            {role.label}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-muted-foreground/50">
                          {t.sidebar.workspace}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>

                <div className="absolute top-5 sm:top-6 right-5 sm:right-6 rtl:right-auto rtl:left-5 sm:rtl:left-6 z-20">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-foreground transition-all rounded-full hover:bg-muted"
                          onClick={(e) => e.preventDefault()}
                        />
                      }
                    >
                      <MoreVertical className="size-4" />
                      <span className="sr-only">Actions</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onClick={() =>
                          navigate({
                            to: '/organizations/$slug/dashboard',
                            params: { slug: org.slug },
                            search: { page: 1 },
                          })
                        }
                      >
                        <ExternalLink className="mr-2 size-4" />
                        {t.sidebar.workspace}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          navigate({
                            to: '/organizations/$slug/settings',
                            params: { slug: org.slug },
                          })
                        }
                      >
                        <Settings className="mr-2 size-4" />
                        {t.sidebar.workspaceSettings}
                      </DropdownMenuItem>
                      {isOwner && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setOrgToDelete({ id: org.id, name: org.name })}
                          >
                            <Trash2 className="mr-2 size-4" />
                            {t.common.delete}
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <CreateOrgDialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />

      {/* Shared Deletion Dialog */}
      <AlertDialog open={!!orgToDelete} onOpenChange={(open) => !open && setOrgToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <AlertTriangle className="size-5" />
            </AlertDialogMedia>
            <AlertDialogTitle>{t.orgsPage.deleteConfirm}</AlertDialogTitle>
            <AlertDialogDescription>{t.orgsPage.deleteConfirmDesc}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => orgToDelete && deleteMutation.mutate(orgToDelete.id)}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? t.common.deleting : t.common.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
