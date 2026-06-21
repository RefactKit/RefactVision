import { useForm } from '@tanstack/react-form'
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/ui/password-input'
import { useI18n } from '@/i18n/context'
import { authClient } from '../../../lib/auth-client'
import { AuthShell } from './-shared'

export const Route = createFileRoute('/_auth/reset-password')({
  component: ResetPasswordPage,
})

const schema = z
  .object({
    password: z.string().min(11, 'Password must be at least 11 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

function ResetPasswordPage() {
  const { t } = useI18n()
  const l = t.auth.resetPassword
  const navigate = useNavigate()
  const { token } = useSearch({ from: '/_auth/reset-password' }) as { token?: string }
  const [isSubmitted, setIsSubmitted] = useState(false)

  const form = useForm({
    defaultValues: { password: '', confirmPassword: '' },
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      if (!token) {
        toast.error('Invalid or missing reset token')
        return
      }

      const { error } = await authClient.resetPassword({
        newPassword: value.password,
        token,
      })

      if (error) {
        toast.error(error.message ?? l.error)
        return
      }

      toast.success(l.success)
      setIsSubmitted(true)
    },
  })

  if (!token) {
    return (
      <AuthShell
        badge={l.title}
        heading="Invalid link"
        subheading="The password reset link is missing or invalid."
      >
        <div className="flex flex-col gap-6">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            <Link
              to="/forgot-password"
              className="font-semibold text-teal-600 dark:text-teal-400 hover:opacity-80"
            >
              Request a new link
            </Link>
          </p>
        </div>
      </AuthShell>
    )
  }

  if (isSubmitted) {
    return (
      <AuthShell
        badge={l.title}
        heading={l.success}
        subheading="Your password has been updated. You can now sign in with your new password."
      >
        <div className="flex flex-col gap-6">
          <div className="flex justify-center py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 dark:bg-teal-500/10">
              <span className="h-2.5 w-2.5 rounded-full bg-teal-500" />
            </div>
          </div>
          <Button onClick={() => navigate({ to: '/login' })} className="w-full">
            Sign in
          </Button>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell badge={l.title} heading={l.title} subheading={l.subtitle}>
      <div className="flex flex-col gap-6">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
          className="flex flex-col gap-4"
        >
          <form.Field name="password">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={field.name}>{l.password}</Label>
                <PasswordInput
                  id={field.name}
                  autoComplete="new-password"
                  placeholder={l.passwordPlaceholder}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.isTouched && field.state.meta.errors[0] && (
                  <p className="text-xs text-red-500">{String(field.state.meta.errors[0])}</p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="confirmPassword">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={field.name}>Confirm password</Label>
                <PasswordInput
                  id={field.name}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.isTouched && field.state.meta.errors[0] && (
                  <p className="text-xs text-red-500">{String(field.state.meta.errors[0])}</p>
                )}
              </div>
            )}
          </form.Field>

          <form.Subscribe selector={(s) => s.isSubmitting}>
            {(isSubmitting) => (
              <Button type="submit" disabled={isSubmitting} className="mt-1 h-10 w-full">
                {isSubmitting ? l.submitting : l.submit}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </div>
    </AuthShell>
  )
}
