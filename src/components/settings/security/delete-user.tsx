import { useAuth, useDeleteUser, useListAccounts } from '@better-auth-ui/react'
import { TriangleAlert } from 'lucide-react'
import { type SyntheticEvent, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

interface DeleteUserProps {
  className?: string
}

export function DeleteUser({ className }: DeleteUserProps) {
  const { basePaths, deleteUser: deleteUserConfig, localization, viewPaths, navigate } = useAuth()
  const { data: accounts } = useListAccounts()

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [password, setPassword] = useState('')

  const hasCredentialAccount = accounts?.some((a) => a.providerId === 'credential')
  const needsPassword = !deleteUserConfig?.sendDeleteAccountVerification && hasCredentialAccount

  const { mutate: deleteUser, isPending } = useDeleteUser()

  function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    deleteUser(needsPassword ? { password } : {}, {
      onSuccess: () => {
        setConfirmOpen(false)
        setPassword('')
        if (deleteUserConfig?.sendDeleteAccountVerification) {
          toast.success(localization.settings.deleteUserVerificationSent)
        } else {
          toast.success(localization.settings.deleteUserSuccess)
          navigate({ to: `${basePaths.auth}/${viewPaths.auth.signIn}`, replace: true })
        }
      },
      onError: (error) => toast.error(error.error?.message || error.message),
    })
  }

  return (
    <Card className={cn('border-destructive', className)}>
      <CardContent className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium leading-tight">{localization.settings.deleteUser}</p>
          <p className="text-muted-foreground text-xs mt-0.5">
            {localization.settings.deleteUserDescription}
          </p>
        </div>

        {!confirmOpen ? (
          <Button
            variant="destructive"
            size="sm"
            disabled={!accounts}
            onClick={() => setConfirmOpen(true)}
          >
            {localization.settings.deleteUser}
          </Button>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 text-sm text-destructive font-medium">
              <TriangleAlert className="size-4" />
              {localization.settings.deleteUserDescription}
            </div>

            {needsPassword && (
              <Field>
                <Label htmlFor="delete-password">{localization.auth.password}</Label>
                <Input
                  id="delete-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder={localization.auth.passwordPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isPending}
                  required
                />
                <FieldError />
              </Field>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setConfirmOpen(false)
                  setPassword('')
                }}
                disabled={isPending}
              >
                {localization.settings.cancel}
              </Button>
              <Button type="submit" variant="destructive" size="sm" disabled={isPending}>
                {isPending && <Spinner />}
                {localization.settings.deleteUser}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
