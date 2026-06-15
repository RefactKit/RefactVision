import {
  useAuth,
  useChangePassword,
  useListAccounts,
  useRequestPasswordReset,
} from '@better-auth-ui/react'
import { Eye, EyeOff } from 'lucide-react'
import { type SyntheticEvent, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Field, FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import { useSession } from '../../../../lib/auth-client'

interface ChangePasswordProps {
  className?: string
}

export function ChangePassword({ className }: ChangePasswordProps) {
  const { emailAndPassword, localization } = useAuth()
  const { data: session } = useSession()
  const { data: accounts, isPending: isAccountsPending } = useListAccounts({})

  const hasCredentialAccount = accounts?.some((a) => a.providerId === 'credential')

  if (!isAccountsPending && !hasCredentialAccount) {
    return <SetPassword className={className} />
  }

  return (
    <ChangePasswordForm
      className={className}
      emailAndPassword={emailAndPassword}
      localization={localization}
      session={isAccountsPending ? undefined : session}
    />
  )
}

function SetPassword({ className }: { className?: string }) {
  const { localization } = useAuth()
  const { data: session } = useSession()

  const { mutate: requestPasswordReset, isPending } = useRequestPasswordReset()

  return (
    <div>
      <h2 className="text-sm font-semibold mb-3">{localization.settings.changePassword}</h2>
      <Card className={cn(className)}>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium leading-tight">{localization.settings.setPassword}</p>
            <p className="text-muted-foreground text-xs mt-0.5">
              {localization.settings.setPasswordDescription}
            </p>
          </div>
          <Button
            size="sm"
            disabled={isPending || !session}
            onClick={() =>
              session &&
              requestPasswordReset(
                { email: session.user.email },
                {
                  onError: (error: any) => toast.error(error.error?.message || error.message),
                  onSuccess: () => toast.success(localization.auth.passwordResetEmailSent),
                },
              )
            }
          >
            {isPending && <Spinner />}
            {localization.auth.sendResetLink}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function ChangePasswordForm({
  className,
  emailAndPassword,
  localization,
  session,
}: {
  className?: string
  emailAndPassword: {
    minPasswordLength?: number
    maxPasswordLength?: number
    confirmPassword?: boolean
  }
  localization: Record<string, any>
  session: { user: { email: string } } | null | undefined
}) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const { mutate: changePassword, isPending } = useChangePassword()

  function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (emailAndPassword?.confirmPassword && newPassword !== confirmPassword) {
      toast.error(localization.auth.passwordsDoNotMatch)
      return
    }
    changePassword(
      { currentPassword, newPassword, revokeOtherSessions: true },
      {
        onError: (error: any) => {
          setCurrentPassword('')
          setNewPassword('')
          setConfirmPassword('')
          toast.error(error.error?.message || error.message)
        },
        onSuccess: () => {
          setCurrentPassword('')
          setNewPassword('')
          setConfirmPassword('')
          toast.success(localization.settings.changePasswordSuccess)
        },
      },
    )
  }

  return (
    <div>
      <h2 className="text-sm font-semibold mb-3">{localization.settings.changePassword}</h2>
      <form onSubmit={handleSubmit}>
        <Card className={cn(className)}>
          <CardContent className="flex flex-col gap-6">
            {/* Current password */}
            <Field data-invalid={!!fieldErrors.currentPassword}>
              <Label htmlFor="currentPassword">{localization.settings.currentPassword}</Label>
              {session ? (
                <Input
                  id="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  placeholder={localization.settings.currentPasswordPlaceholder}
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value)
                    setFieldErrors((p) => ({ ...p, currentPassword: '' }))
                  }}
                  disabled={isPending}
                  required
                />
              ) : (
                <Skeleton>
                  <Input className="invisible" />
                </Skeleton>
              )}
              <FieldError>{fieldErrors.currentPassword}</FieldError>
            </Field>

            {/* New password */}
            <Field data-invalid={!!fieldErrors.newPassword}>
              <Label htmlFor="newPassword">{localization.auth.newPassword}</Label>
              {session ? (
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNew ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder={localization.auth.newPasswordPlaceholder}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value)
                      setFieldErrors((p) => ({ ...p, newPassword: '' }))
                    }}
                    minLength={emailAndPassword?.minPasswordLength}
                    maxLength={emailAndPassword?.maxPasswordLength}
                    disabled={isPending}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              ) : (
                <Skeleton>
                  <Input className="invisible" />
                </Skeleton>
              )}
              <FieldError>{fieldErrors.newPassword}</FieldError>
            </Field>

            {/* Confirm password */}
            {emailAndPassword?.confirmPassword && (
              <Field data-invalid={!!fieldErrors.confirmPassword}>
                <Label htmlFor="confirmPassword">{localization.auth.confirmPassword}</Label>
                {session ? (
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirm ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder={localization.auth.confirmPasswordPlaceholder}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value)
                        setFieldErrors((p) => ({ ...p, confirmPassword: '' }))
                      }}
                      minLength={emailAndPassword?.minPasswordLength}
                      maxLength={emailAndPassword?.maxPasswordLength}
                      disabled={isPending}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                ) : (
                  <Skeleton>
                    <Input className="invisible" />
                  </Skeleton>
                )}
                <FieldError>{fieldErrors.confirmPassword}</FieldError>
              </Field>
            )}
          </CardContent>

          <CardFooter>
            <Button type="submit" size="sm" disabled={isPending || !session}>
              {isPending && <Spinner />}
              {localization.settings.updatePassword}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
