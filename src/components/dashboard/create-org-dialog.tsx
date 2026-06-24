import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { ImageUpload } from '@/components/shared/image-upload'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useI18n } from '@/i18n/context'
import { createOrganization } from '@/server/org-fns'

interface CreateOrgDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateOrgDialog({ open, onOpenChange }: CreateOrgDialogProps) {
  const { t } = useI18n()
  const navigate = useNavigate()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [newOrgName, setNewOrgName] = useState('')
  const [logo, setLogo] = useState<string | undefined>()

  const createMutation = useMutation({
    mutationFn: (data: { name: string; logo?: string }) =>
      createOrganization({ data } as Parameters<typeof createOrganization>[0]),
    onSuccess: async (result) => {
      onOpenChange(false)
      setNewOrgName('')
      setLogo(undefined)
      queryClient.invalidateQueries({ queryKey: ['user-orgs'] })
      await router.invalidate()
      navigate({
        to: '/organizations/$slug/dashboard',
        params: { slug: result.org.slug },
        search: { page: 1 },
      })
      toast.success(t.newOrg.success)
    },
    onError: (err: Error) => {
      if (err?.message === 'Organization name already taken') {
        toast.error(t.onboarding.nameTaken)
      } else {
        toast.error(err?.message ?? 'Failed to create organization')
      }
    },
  })

  const handleCreateOrg = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newOrgName.trim()) return
    createMutation.mutate({ name: newOrgName, logo })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleCreateOrg}>
          <DialogHeader>
            <DialogTitle>{t.orgsPage.createNew}</DialogTitle>
            <DialogDescription>{t.orgsPage.createNewDesc}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="flex flex-col items-center justify-center gap-4">
              <ImageUpload
                name={newOrgName || 'Organization'}
                defaultValue={logo}
                onUploadSuccess={setLogo}
                shape="square"
                bucket="avatars"
              />
              <div className="text-center space-y-1">
                <Label className="text-sm font-semibold">Workspace Logo</Label>
                <p className="text-xs text-muted-foreground">
                  Choose a logo for your new organization.
                </p>
              </div>
            </div>

            <div className="grid gap-2.5">
              <Label htmlFor="name" className="text-sm font-medium ml-1">
                {t.newOrg.nameLabel}
              </Label>
              <Input
                id="name"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                placeholder={t.newOrg.namePlaceholder}
                autoFocus
                className="h-11 rounded-xl px-4"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createMutation.isPending}
            >
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={createMutation.isPending || !newOrgName.trim()}>
              {createMutation.isPending ? t.newOrg.submitting : t.common.create}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
