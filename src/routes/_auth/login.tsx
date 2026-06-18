import { useForm } from '@tanstack/react-form'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/ui/password-input'
import { useI18n } from '@/i18n/context'
import { getUserOrgs } from '@/server/org-fns'
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

export const Route = createFileRoute('/_auth/login')({
  validateSearch: (search: Record<string, unknown>): { callbackURL?: string } => {
    return {
      callbackURL: search.callbackURL as string | undefined,
    }
  },
  component: LoginPage,
})

function LoginPage() {
  const { t } = useI18n()
  const l = t.auth.login
  const navigate = useNavigate()
  const { callbackURL } = Route.useSearch()

  const schema = z.object({
    email: z.string().email(l.error),
    password: z.string().min(11, 'Password must be at least 11 characters'),
  })

  const form = useForm({
    defaultValues: { email: '', password: '' },
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      const { error } = await authClient.signIn.email({
        email: value.email,
        password: value.password,
      })
      if (error) {
        // OWASP: Always use generic message — never reveal if email exists or password is wrong
        toast.error(l.error)
        return
      }

      // If we have a callbackURL, go there instead of dashboard
      if (callbackURL) {
        window.location.href = callbackURL
        return
      }

      // Navigate directly to the dashboard — skip the "/" redirect chain
      const { orgs } = await getUserOrgs()
      if (orgs.length === 0) {
        navigate({ to: '/onboarding' })
      } else {
        navigate({
          to: '/organizations/$slug/dashboard',
          params: { slug: orgs[0]?.slug },
          search: { page: 1 },
        })
      }

      // Keep the button in "Signing in..." state until navigation unmounts this component
      await new Promise(() => {})
    },
  })

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

          <form.Field name="password">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor={field.name}>{l.password}</Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    {l.forgotPassword}
                  </Link>
                </div>
                <PasswordInput
                  id={field.name}
                  autoComplete="current-password"
                  placeholder={l.passwordPlaceholder}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
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
          {l.noAccount}{' '}
          <Link
            to="/signup"
            search={{ callbackURL: callbackURL }}
            className="font-semibold text-teal-600 dark:text-teal-400 hover:opacity-80"
          >
            {l.signUpLink}
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}
