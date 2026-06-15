import { useForm } from '@tanstack/react-form'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useI18n } from '@/i18n/context'
import { authClient } from '../../../lib/auth-client'
import { AuthShell } from './-shared'

export const Route = createFileRoute('/_auth/forgot-password')({
  component: ForgotPasswordPage,
})

const schema = z.object({
  email: z.string().email(),
})

function ForgotPasswordPage() {
  const { t } = useI18n()
  const l = t.auth.forgotPassword
  const [isSubmitted, setIsSubmitted] = useState(false)

  const form = useForm({
    defaultValues: { email: '' },
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      // OWASP: Never reveal if email exists — always show "check your inbox".
      // Better Auth performs dummy operations server-side for unknown emails
      // so response timing stays consistent regardless of whether email is registered.
      await authClient.requestPasswordReset({
        email: value.email,
        redirectTo: '/reset-password',
      })
      setIsSubmitted(true)
    },
  })

  if (isSubmitted) {
    return (
      <AuthShell badge={l.title} heading={l.success} subheading={l.subtitle}>
        <div className="flex flex-col gap-6">
          <div className="flex justify-center py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 dark:bg-teal-500/10">
              <span className="h-2.5 w-2.5 rounded-full bg-teal-500" />
            </div>
          </div>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            <Link
              to="/login"
              className="font-semibold text-teal-600 dark:text-teal-400 hover:opacity-80"
            >
              {l.backToSignIn}
            </Link>
          </p>
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
          <form.Field name="email">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={field.name}>{l.email}</Label>
                <Input
                  id={field.name}
                  type="email"
                  autoComplete="email"
                  placeholder={l.emailPlaceholder}
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

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          <Link
            to="/login"
            className="font-semibold text-teal-600 dark:text-teal-400 hover:opacity-80"
          >
            {l.backToSignIn}
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}
