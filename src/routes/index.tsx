import { Header } from '@/components/shared/header'
import { Badge } from '@/components/ui/badge'
import { BorderBeam } from '@/components/ui/border-beam'
import { Button } from '@/components/ui/button'
import { DotPattern } from '@/components/ui/dot-pattern'
import { TypingAnimation } from '@/components/ui/typing-animation'
import { useI18n } from '@/i18n/context'
import { cn } from '@/lib/utils'
import { userOrgsQuery } from '@/server/query-keys'
import {
  ArrowRight,
  BookOpen,
  LockKey,
  RocketLaunch,
  ShieldCheck,
  Stack
} from '@phosphor-icons/react'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { motion } from 'framer-motion'

export const Route = createFileRoute('/')({
  loader: async ({ context }) => {
    const { orgs } = await context.queryClient.ensureQueryData(userOrgsQuery())
    if (orgs.length === 0) throw redirect({ to: '/onboarding' })
    throw redirect({
      to: '/organizations/$slug/dashboard',
      params: { slug: orgs[0]?.slug },
      search: { page: 1 },
    })
  },
  component: LandingPage,
})

type TechLogo = { name: string; description: string; src: string }

const techLogos: TechLogo[] = [
  { name: 'TanStack Start', description: 'Full-stack framework', src: '/tanstack.png' },
  { name: 'TanStack AI', description: 'AI integration', src: '/tanstack-ai.png' },
  { name: 'Better Auth', description: 'Modern authentication', src: '/better.png' },
  { name: 'Resend', description: 'Email for developers', src: '/resend.png' },
  { name: 'Polar', description: 'Monetization platform', src: '/polar.png' },
  { name: 'Stripe', description: 'Payment processing', src: '/stripe.png' },
  { name: 'Docker', description: 'Containerization', src: '/docker.png' },
  { name: 'S3 Storage', description: 'File storage adapter', src: '/s3.png' },
  { name: 'Supabase', description: 'Backend-as-a-Service', src: '/supabase.png' },
  { name: 'Tailwind CSS', description: 'Utility-first CSS', src: '/tailwind.png' },
  { name: 'shadcn/ui', description: 'Accessible components', src: '/shadcn.png' },
  { name: 'Drizzle', description: 'TypeScript ORM', src: '/drizzle.png' },
  { name: 'i18n', description: 'Internationalization', src: '/i18.png' },
]

function LandingPage() {
  const { t } = useI18n()
  const l = t.landing

  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground selection:bg-primary/10 selection:text-primary">
      <Header />

      <main className="flex flex-1 flex-col items-center">
        {/* Hero Section */}
        <section className="relative flex w-full flex-col items-center justify-center px-6 pt-32 pb-16 text-center sm:px-12 lg:px-24">
          <DotPattern
            cr={1.5}
            className="[mask-image:radial-gradient(800px_circle_at_center,white,transparent)] opacity-40 text-primary/30"
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10"
          >
            <Badge
              variant="outline"
              className="mb-8 gap-2 rounded-full border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary shadow-sm"
            >
              <span className="flex size-2 animate-pulse rounded-full bg-primary" />
              {l.hero.badge}
            </Badge>

            <h1 className="text-balance mb-8 max-w-5xl mx-auto text-4xl font-semibold tracking-tight sm:text-6xl lg:text-7xl flex flex-col sm:block">
              <span>{l.hero.title}</span>{' '}
              <TypingAnimation
                as="span"
                words={l.hero.titleWords}
                duration={60}
                pauseDelay={2500}
                className="text-primary"
              />
            </h1>

            <p className="text-balance mb-12 max-w-4xl mx-auto text-xl leading-relaxed text-foreground/80 sm:text-2xl">
              {l.hero.subheading}
            </p>

            <div className="flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row">
              <Link to="/login" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="relative h-14 w-full gap-2 rounded-full px-8 text-base shadow-lg shadow-primary/25 transition-all hover:scale-105 sm:w-auto overflow-hidden"
                >
                  {l.hero.getStarted} <ArrowRight weight="bold" className="size-5" />
                  <BorderBeam
                    size={80}
                    duration={8}
                    borderWidth={2}
                    colorFrom="var(--color-primary)"
                    colorTo="var(--color-primary-foreground)"
                  />
                </Button>
              </Link>

              <a
                href="https://docs.refactkit.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="h-14 w-full gap-2 rounded-full border-2 px-8 text-base transition-all hover:bg-muted/50 sm:w-auto"
                >
                  {l.hero.viewDocs} <BookOpen weight="bold" className="size-5" />
                </Button>
              </a>
            </div>

            {/* Trust Markers */}
            <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 opacity-70">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-primary" />
                <span className="text-sm font-semibold tracking-wide uppercase">
                  {l.hero.security.owasp}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <LockKey className="size-5 text-primary" />
                <span className="text-sm font-semibold tracking-wide uppercase">
                  {l.hero.security.encrypted}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Stack className="size-5 text-primary" />
                <span className="text-sm font-semibold tracking-wide uppercase">
                  {l.hero.security.tenant}
                </span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Tech Stack Section (Static Grid) */}
        <section className="w-full py-24 bg-background border-y border-border/40 overflow-hidden">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="text-center mb-20">
              <span className="text-primary font-semibold text-sm tracking-wider uppercase mb-4 block">
                Built with
              </span>
              <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                {l.techStack.title}
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 border border-border/40 rounded-3xl overflow-hidden">
              {techLogos.map((tech, i) => (
                <div
                  key={tech.name}
                  className={cn(
                    'group relative flex flex-col items-center justify-center p-8 text-center transition-all hover:bg-muted/30',
                    // Borders for the grid
                    i % 4 !== 3 && 'md:border-r border-border/40',
                    i % 2 !== 1 && 'border-r md:border-r-0 border-border/40',
                    i < 8 && 'border-b border-border/40',
                  )}
                >
                  <div className="relative mb-6 flex size-16 items-center justify-center sm:size-20">
                    <img
                      src={tech.src}
                      alt={tech.name}
                      className="h-full w-auto object-contain transition-all duration-500 grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-base font-semibold tracking-tight text-foreground">
                      {tech.name}
                    </h3>
                    <p className="text-xs font-medium text-muted-foreground">{tech.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Dashboard Showcase Section */}
        <section className="w-full py-32 px-6 lg:px-24 bg-muted/5">
          <div className="container mx-auto text-center mb-16">
            <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl mb-4">
              {l.dashboard.title}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {l.dashboard.subtitle}
            </p>
          </div>
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="relative mx-auto max-w-6xl rounded-3xl shadow-[0_0_100px_-20px_rgba(var(--primary-rgb),0.2)] border border-border/40 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent pointer-events-none" />
              <img src="/dashboard.png" alt="RefactKit Dashboard" className="w-full h-auto" />
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-32 px-6">
          <div className="container mx-auto max-w-5xl">
            <div className="relative rounded-[3.5rem] bg-primary px-8 py-24 text-center text-primary-foreground shadow-2xl shadow-primary/40 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent pointer-events-none" />
              <div className="relative z-10 max-w-2xl mx-auto">
                <h2 className="text-4xl font-semibold tracking-tight sm:text-6xl mb-8 leading-tight">
                  {l.cta.title}
                </h2>
                <p className="text-xl text-primary-foreground/80 mb-12 leading-relaxed">
                  {l.cta.subtitle}
                </p>
                <Link to="/login">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="h-16 px-12 rounded-full text-lg font-semibold shadow-xl transition-all hover:scale-105 active:scale-95"
                  >
                    {l.cta.button} <RocketLaunch weight="bold" className="ml-2 size-6" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-border/40 py-16 text-center text-sm text-muted-foreground bg-background">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10 max-w-6xl">
          <div className="flex flex-col items-center md:items-start gap-4">
            <img src="/logo.png" alt="RefactKit" className="h-8 w-auto opacity-80 dark:hidden" />
            <img
              src="/logo-dark.png"
              alt="RefactKit"
              className="h-8 w-auto opacity-80 hidden dark:block"
            />
            <p className="max-w-xs text-muted-foreground/60 text-center md:text-left">
              The high-performance SaaS boilerplate for modern developers.
            </p>
          </div>
          <div className="flex flex-col items-center md:items-end gap-6">
            <p>{l.footer.madeWith} Y.BERDAI</p>
            <div className="flex items-center gap-8 font-medium">
              <a href="#" className="hover:text-primary transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Terms
              </a>
              <a
                href="https://twitter.com/refactkit"
                className="hover:text-primary transition-colors"
              >
                Twitter
              </a>
              <a
                href="https://github.com/refactkit"
                className="hover:text-primary transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
