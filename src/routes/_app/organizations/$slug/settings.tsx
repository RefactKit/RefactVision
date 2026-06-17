import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { AlertTriangle, Building2, Save, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { ForbiddenContent } from '@/components/shared/forbidden-content'
import { ImageUpload } from '@/components/shared/image-upload'
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { useI18n } from '@/i18n/context'
import { deleteOrganization, updateOrganization } from '@/server/org-fns'
import { orgBySlugQuery } from '@/server/query-keys'
import { Route as OrgRoute } from './route'

export const Route = createFileRoute('/_app/organizations/$slug/settings')({
  component: OrgSettingsPage,
})

function OrgSettingsPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const params = useParams({ strict: false }) as { slug?: string }
  const queryClient = useQueryClient()
  const { org: initialOrg, role: initialRole } = OrgRoute.useLoaderData()

  const { data } = useQuery({
    ...orgBySlugQuery(params.slug || initialOrg.slug),
    initialData: { org: initialOrg, role: initialRole },
  })

  const org = data?.org || initialOrg
  const role = data?.role || initialRole

  const [name, setName] = useState(org.name)
  const [slug, setSlug] = useState(org.slug)
  const [logo, setLogo] = useState(org.logo)

  // Explicitly sync state when org data changes (e.g. via Sidebar switch)
  useEffect(() => {
    setName(org.name)
    setSlug(org.slug)
    setLogo(org.logo)
  }, [org.name, org.slug, org.logo])

  // Render forbidden state if user is just a member
  if (role === 'member') {
    return <ForbiddenContent />
  }

  const isOwner = role === 'owner'
  const canUpdate = role === 'admin' || role === 'owner'

  const updateMutation = useMutation({
    mutationFn: (data: { name: string; slug: string; logo?: string }) =>
      updateOrganization({ data: { organizationId: org.id, ...data } }),
    onSuccess: (data: { org: { slug: string } }) => {
      queryClient.invalidateQueries({ queryKey: ['user-orgs'] })
      queryClient.invalidateQueries({ queryKey: ['org', org.slug] })
      toast.success(t.orgSettings.saved, {
        action: {
          label: 'Undo',
          onClick: () => {
            // Revert changes logic
            updateMutation.mutate({ name: org.name, slug: org.slug, logo: org.logo || undefined })
          },
        },
      })
      if (data.org.slug !== org.slug) {
        navigate({
          to: '/organizations/$slug/settings',
          params: { slug: data.org.slug },
          replace: true,
        })
      }
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to update organization'
      toast.error(message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteOrganization({ data: { organizationId: org.id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-orgs'] })
      toast.success(t.orgsPage.deleteSuccess, {
        action: {
          label: 'Undo',
          onClick: () => {
            toast.info('Critical data deletion cannot be reversed via this action.')
          },
        },
      })
      navigate({ to: '/organizations', replace: true })
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to delete organization'
      toast.error(message)
    },
  })

  const hasChanges = name !== org.name || slug !== org.slug || logo !== org.logo

  return (
    <div key={org.id} className="flex flex-col gap-8 max-w-6xl mx-auto w-full py-4 px-4 sm:px-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {t.orgSettings.title}
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">{t.orgSettings.subtitle}</p>
      </div>

      <div className="flex flex-col gap-6">
        {/* General Settings */}
        <Card className="rounded-3xl border-border/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <CardHeader className="p-7 pb-0">
            <CardTitle className="text-lg font-semibold">{t.sidebar.workspaceSettings}</CardTitle>
            <CardDescription>{t.orgSettings.subtitle}</CardDescription>
          </CardHeader>
          <CardContent className="p-7 space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-8 pb-4">
              <ImageUpload
                name={name}
                defaultValue={logo || undefined}
                onUploadSuccess={(url) => setLogo(url)}
                bucket="avatars"
                shape="square"
              />
              <div className="flex-1 space-y-1 text-center sm:text-left">
                <p className="text-sm font-medium">Organization Logo</p>
                <p className="text-xs text-muted-foreground">
                  This logo will be displayed in the sidebar and organization switcher. Max size
                  2MB.
                </p>
              </div>
            </div>

            <div className="grid gap-6">
              <Field>
                <Label htmlFor="name">{t.orgSettings.nameLabel}</Label>
                <div className="relative">
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={updateMutation.isPending || !canUpdate}
                    className="pl-9"
                  />
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">{t.orgSettings.nameHelp}</p>
              </Field>

              <Field>
                <Label htmlFor="slug">Workspace URL (Slug)</Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Input
                      id="slug"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      disabled={updateMutation.isPending || !canUpdate}
                      className="pl-3"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Changing your workspace URL can break existing links. Use with caution.
                </p>
              </Field>
            </div>
          </CardContent>
          <CardFooter className="p-7 bg-muted/5 border-t border-border/40">
            <Button
              onClick={() => updateMutation.mutate({ name, slug, logo: logo || undefined })}
              disabled={!hasChanges || updateMutation.isPending || !canUpdate}
              className="gap-2"
            >
              {updateMutation.isPending ? (
                <Spinner className="size-4" />
              ) : (
                <Save className="size-4" />
              )}
              {t.orgSettings.saveChanges}
            </Button>
          </CardFooter>
        </Card>

        {/* Danger Zone */}
        {isOwner && (
          <Card className="rounded-3xl border-destructive/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
            <CardHeader className="p-7 pb-0">
              <CardTitle className="text-lg font-semibold text-destructive">
                {t.orgSettings.danger}
              </CardTitle>
              <CardDescription>{t.orgSettings.deleteDesc}</CardDescription>
            </CardHeader>
            <CardContent className="p-7">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-destructive/10 bg-destructive/5">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">
                    {t.orgSettings.deleteTitle}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    This action is permanent and cannot be undone.
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger
                    render={<Button variant="destructive" className="gap-2 shrink-0" />}
                  >
                    <Trash2 className="size-4" />
                    {t.orgSettings.deleteButton}
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogMedia className="bg-destructive/10 text-destructive">
                        <AlertTriangle className="size-5" />
                      </AlertDialogMedia>
                      <AlertDialogTitle>{t.orgsPage.deleteConfirm}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t.orgsPage.deleteConfirmDesc}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteMutation.mutate()}
                        disabled={deleteMutation.isPending}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {deleteMutation.isPending ? t.common.deleting : t.common.delete}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
