import { useForm } from '@tanstack/react-form'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Mail } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/ui/password-input'
import { useI18n } from '@/i18n/context'
import { authClient } from '../../../lib/auth-client'
import {
  AuthShell,
  Divider,
  GithubIcon,
  GoogleIcon,
  LinkedinIcon,
  MicrosoftIcon,
  TwitterIcon,
} from './-shared'

export const Route = createFileRoute('/_auth/signup')({
  validateSearch: (search: Record<string, unknown>): { callbackURL?: string } => {
    return {
      callbackURL: search.callbackURL as string | undefined,
    }
  },
  component: SignupPage,
})

function SignupPage() {
  const { t } = useI18n()
  const l = t.auth.signup
  const { callbackURL } = Route.useSearch()
  const [isSignedUp, setIsSignedUp] = useState(false)

  const schema = z.object({
    name: z.string().min(2, l.nameMin),
    email: z.string().email(l.emailInvalid),
    password: z.string().min(11, 'Password must be at least 11 characters'),
  })

  const form = useForm({
    defaultValues: { name: '', email: '', password: '' },
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      const { error } = await authClient.signUp.email({
        name: value.name,
        email: value.email,
        password: value.password,
        callbackURL: '/login', // Go to login after verification to avoid flashing
      })

      if (error) {
        // Only surface genuine technical errors (network failures, validation, etc.)
        // Per the security skill: never reveal whether an email is registered.
        // Better Auth with requireEmailVerification already uses anti-enumeration
        // mode — USER_ALREADY_EXISTS triggers onExistingUserSignUp on the server
        // (notifies the real account owner) but returns 200 OK to this client.
        // Any unexpected error code still gets a generic message.
        toast.error(l.error)
        return
      }

      // In all success cases — new signup or duplicate email — show the same
      // "check your inbox" screen. The real owner is notified via onExistingUserSignUp.
      // This is the correct OWASP-compliant account-enumeration-safe UX pattern.
      setIsSignedUp(true)
    },
  })

  if (isSignedUp) {
    return (
      <AuthShell badge={l.badge} heading={l.heading} subheading={l.subheading}>
        <div className="flex flex-col gap-6 text-center py-4">
          <div className="h-16 w-16 rounded-full bg-teal-500/10 flex items-center justify-center mx-auto">
            <Mail className="h-8 w-8 text-teal-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {l.verifyEmailTitle}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{l.verifyEmailSubtitle}</p>
          </div>
          <Button variant="outline" className="w-full mt-4" onClick={() => setIsSignedUp(false)}>
            {l.backToSignUp}
          </Button>
        </div>
      </AuthShell>
    )
  }

  const fields = [
    {
      name: 'name' as const,
      label: l.name,
      type: 'text',
      placeholder: l.namePlaceholder,
      autoComplete: 'name',
    },
    {
      name: 'email' as const,
      label: l.email,
      type: 'email',
      placeholder: l.emailPlaceholder,
      autoComplete: 'email',
    },
    {
      name: 'password' as const,
      label: l.password,
      type: 'password',
      placeholder: l.passwordPlaceholder,
      autoComplete: 'new-password',
    },
  ]

  return (
    <AuthShell badge={l.badge} heading={l.heading} subheading={l.subheading}>
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{l.title}</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{l.subtitle}</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
          className="flex flex-col gap-4"
        >
          {fields.map((f) => (
            <form.Field key={f.name} name={f.name}>
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={field.name}>{f.label}</Label>
                  {f.type === 'password' ? (
                    <PasswordInput
                      id={field.name}
                      autoComplete={f.autoComplete}
                      placeholder={f.placeholder}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  ) : (
                    <Input
                      id={field.name}
                      type={f.type}
                      autoComplete={f.autoComplete}
                      placeholder={f.placeholder}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  )}
                  {field.state.meta.isTouched && field.state.meta.errors[0] && (
                    <p className="text-xs text-red-500">
                      {field.state.meta.errors
                        .map((error: any) =>
                          typeof error === 'string' ? error : error?.message || 'Invalid value',
                        )
                        .join(', ')}
                    </p>
                  )}
                </div>
              )}
            </form.Field>
          ))}

          <form.Subscribe selector={(s) => s.isSubmitting}>
            {(isSubmitting) => (
              <Button type="submit" disabled={isSubmitting} className="mt-1 h-10 w-full">
                {isSubmitting ? l.submitting : l.submit}
              </Button>
            )}
          </form.Subscribe>
        </form>

        <Divider />

        <div className="flex flex-col gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-12 w-full gap-3 rounded-full border-gray-200 shadow-sm hover:bg-gray-50 dark:border-gray-800 flex items-center justify-center"
            onClick={() =>
              authClient.signIn.social({ provider: 'google', callbackURL: '/dashboard' })
            }
          >
            <GoogleIcon />
            <span className="font-medium text-gray-700 dark:text-gray-300">{l.google}</span>
          </Button>

          <Button
            type="button"
            className="h-12 w-full gap-3 rounded-full bg-[#0077b5] text-white hover:bg-[#006699] border-none shadow-sm flex items-center justify-center"
            onClick={() =>
              authClient.signIn.social({ provider: 'linkedin', callbackURL: '/dashboard' })
            }
          >
            <LinkedinIcon className="text-white" />
            <span className="font-medium">{l.linkedin}</span>
          </Button>

          <Button
            type="button"
            className="h-12 w-full gap-3 rounded-full bg-[#24292e] text-white hover:bg-[#1b1f23] border-none shadow-sm flex items-center justify-center"
            onClick={() =>
              authClient.signIn.social({ provider: 'github', callbackURL: '/dashboard' })
            }
          >
            <GithubIcon className="text-white" />
            <span className="font-medium">{l.github}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            className="h-12 w-full gap-3 rounded-full border-gray-200 shadow-sm hover:bg-gray-50 dark:border-gray-800 flex items-center justify-center"
            onClick={() =>
              authClient.signIn.social({ provider: 'microsoft', callbackURL: '/dashboard' })
            }
          >
            <MicrosoftIcon />
            <span className="font-medium text-gray-700 dark:text-gray-300">{l.microsoft}</span>
          </Button>

          <Button
            type="button"
            className="h-12 w-full gap-3 rounded-full bg-black text-white hover:bg-slate-900 border border-white/10 shadow-sm flex items-center justify-center"
            onClick={() =>
              authClient.signIn.social({ provider: 'twitter', callbackURL: '/dashboard' })
            }
          >
            <TwitterIcon className="text-white" />
            <span className="font-medium">{l.twitter}</span>
          </Button>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          {l.hasAccount}{' '}
          <Link
            to="/login"
            search={{ callbackURL }}
            className="font-semibold text-teal-600 dark:text-teal-400 hover:opacity-80"
          >
            {l.signInLink}
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}
