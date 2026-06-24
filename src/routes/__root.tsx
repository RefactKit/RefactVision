import { AuthProvider } from '@better-auth-ui/react'
import { type QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Link as RouterLink,
  Scripts,
  useNavigate,
} from '@tanstack/react-router'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { getServerLocale } from '@/i18n'
import { I18nProvider } from '@/i18n/context'
import { authClient } from '../../lib/auth-client'
import { getBaseURL } from '../../lib/env'
import appCss from '../styles/globals.css?url'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  loader: async () => {
    const locale = await getServerLocale()
    return { locale }
  },
  head: (_ctx) => {
    const baseUrl = getBaseURL()
    const ogImage = `${baseUrl}/og.png`
    const title = 'Build your SaaS, with production-ready code — RefactVision'
    const description =
      'The ultimate full-stack starter for founders, devs, and indie hackers. Built with React 19 & TanStack, featuring a production-ready backend API, secure multi-tenancy, and an enterprise-grade dashboard.'

    return {
      meta: [
        { charSet: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { title },
        { name: 'description', content: description },
        // Open Graph / Facebook
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: baseUrl },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:image', content: ogImage },
        { property: 'og:site_name', content: 'RefactVision' },
        // Twitter
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:url', content: baseUrl },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: ogImage },
      ],
      links: [
        { rel: 'stylesheet', href: appCss },
        { rel: 'icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', href: '/logo192.png' },
      ],
    }
  },
  component: RootComponent,
  shellComponent: RootDocument,
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-2xl font-semibold">404 — Page not found</p>
    </div>
  ),
})

function RootComponent() {
  const navigate = useNavigate()
  const { queryClient } = Route.useRouteContext()
  const data = Route.useLoaderData()
  const locale = data?.locale ?? 'en'

  return (
    <I18nProvider initialLocale={locale}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider
            authClient={authClient}
            navigate={(href) => navigate({ to: href as string })}
            Link={({ href, children, ...props }) => (
              <RouterLink to={href as string} {...props}>
                {children}
              </RouterLink>
            )}
            basePaths={{ auth: '', settings: '/settings' }}
            viewPaths={{
              auth: { signIn: 'login', signUp: 'signup', signOut: 'logout' },
              settings: { account: '', security: '/security' },
            }}
          >
            <Outlet />
            <Toaster richColors position="top-center" />
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </I18nProvider>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const data = Route.useLoaderData()
  const locale = (data?.locale as string) ?? 'fr'
  const dir = locale === 'ar' ? 'rtl' : 'ltr'

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        <HeadContent />
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Initial font and theme settings from localStorage to prevent shift
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const font = localStorage.getItem('RefactVision-font');
                  if (font && font !== 'default') {
                    document.documentElement.setAttribute('data-font', font);
                  }
                  
                  const colorTheme = localStorage.getItem('RefactVision-color-theme');
                  if (colorTheme && colorTheme !== 'default') {
                    document.documentElement.setAttribute('data-theme', colorTheme);
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
