import { useForm } from '@tanstack/react-form'
import { useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Building2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useI18n } from '@/i18n/context'
import { createOrganization } from '@/server/org-fns'

export const Route = createFileRoute('/_app/organizations/new')({
  component: NewOrgPage,
})

export function NewOrgPage() {
  const { t } = useI18n()
  const l = t.newOrg
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const schema = z.object({
    name: z.string().min(2, l.nameMin).max(64, l.nameMax),
  })

  const form = useForm({
    defaultValues: { name: '' },
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      try {
        const result = await createOrganization({ data: { name: value.name } } as {
          data: { name: string }
        })
        queryClient.invalidateQueries({ queryKey: ['user-orgs'] })
        toast.success(l.success)
        navigate({
          to: '/organizations/$slug/dashboard',
          params: { slug: result.org.slug },
          search: { page: 1 },
        })
      } catch (err: unknown) {
        if (err instanceof Error && err.message === 'Organization name already taken') {
          toast.error(t.onboarding.nameTaken)
        } else {
          toast.error(err instanceof Error ? err.message : l.error)
        }
      }
    },
  })

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{l.title}</h1>
        <p className="text-muted-foreground mt-2">{l.subtitle}</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">Organization Details</CardTitle>
          <CardDescription>Enter the name of your new organization.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit()
            }}
            className="space-y-6"
          >
            <form.Field name="name">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>{l.nameLabel}</Label>
                  <Input
                    id={field.name}
                    placeholder={l.namePlaceholder}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.isTouched && field.state.meta.errors[0] && (
                    <p className="text-xs text-red-500 font-medium">
                      {String(field.state.meta.errors[0])}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <div className="flex items-center justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate({ to: '/organizations' })}
              >
                {t.common.cancel}
              </Button>
              <form.Subscribe selector={(s) => s.isSubmitting}>
                {(isSubmitting) => (
                  <Button type="submit" disabled={isSubmitting} className="min-w-32">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {l.submitting}
                      </>
                    ) : (
                      l.submit
                    )}
                  </Button>
                )}
              </form.Subscribe>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
