import { GithubLogoIcon } from '@phosphor-icons/react'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { animate, motion, useMotionValue, useTransform } from 'framer-motion'
import {
  ArrowRight,
  ArrowRightCircle,
  Code2,
  Eye,
  FileOutput,
  FolderLock,
  Layers,
  Rocket,
  ScanSearch,
  ShieldCheck,
  ShieldCheck as ShieldCheckLucide,
  Tags,
  Upload,
  Users,
} from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Header } from '@/components/shared/header'
import { Logo } from '@/components/shared/logo'
import { Badge } from '@/components/ui/badge'
import { BorderBeam } from '@/components/ui/border-beam'
import { Button } from '@/components/ui/button'
import { DotPattern } from '@/components/ui/dot-pattern'
import { Marquee } from '@/components/ui/marquee'
import { TypingAnimation } from '@/components/ui/typing-animation'
import { useI18n } from '@/i18n/context'
import { cn } from '@/lib/utils'
import { getServerSession } from '@/server/auth-fns'
import { userOrgsQuery } from '@/server/query-keys'

export const Route = createFileRoute('/')({
  loader: async ({ context }) => {
    const { session } = await getServerSession()
    if (session) {
      const { orgs } = await context.queryClient.ensureQueryData(userOrgsQuery())
      if (orgs.length === 0) throw redirect({ to: '/onboarding' })

      throw redirect({
        to: '/organizations/$slug/dashboard',
        params: { slug: orgs[0]?.slug },
        search: { page: 1 },
      })
    }
    return {}
  },
  component: LandingPage,
})

// --- Animated Counter Component ---
function AnimatedCounter({ value, duration = 2 }: { value: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const motionVal = useMotionValue(0)
  const rounded = useTransform(motionVal, (v) => Math.round(v))

  useEffect(() => {
    const controls = animate(motionVal, value, { duration, ease: 'easeOut' })
    const unsub = rounded.on('change', (v) => {
      if (ref.current) ref.current.textContent = String(v)
    })
    return () => {
      controls.stop()
      unsub()
    }
  }, [value, duration, motionVal, rounded])

  return <span ref={ref}>0</span>
}

// --- Feature Card Icons ---
const featureIcons = [
  <Tags className="size-6" key="tags" />,
  <Users className="size-6" key="users" />,
  <ShieldCheckLucide className="size-6" key="shield" />,
  <FileOutput className="size-6" key="export" />,
  <FolderLock className="size-6" key="lock" />,
  <Code2 className="size-6" key="code" />,
]

const featureGradients = [
  'from-emerald-500/20 to-teal-500/20',
  'from-blue-500/20 to-indigo-500/20',
  'from-amber-500/20 to-orange-500/20',
  'from-violet-500/20 to-purple-500/20',
  'from-rose-500/20 to-pink-500/20',
  'from-cyan-500/20 to-sky-500/20',
]

const featureIconColors = [
  'text-emerald-500',
  'text-blue-500',
  'text-amber-500',
  'text-violet-500',
  'text-rose-500',
  'text-cyan-500',
]

// --- Workflow Step Icons ---
const workflowIcons = [
  <Users className="size-5" key="w1" />,
  <Upload className="size-5" key="w2" />,
  <ScanSearch className="size-5" key="w3" />,
  <ArrowRightCircle className="size-5" key="w4" />,
]

// --- Integration Logos ---
const integrations = [
  { name: 'Ultralytics', src: '/ultra.jpeg', description: 'YOLO Training' },
  { name: 'Roboflow', src: '/roboflow.png', description: 'Dataset Management' },
  { name: 'Supabase', src: '/supabase.png', description: 'Backend & Storage' },
  { name: 'Drizzle', src: '/drizzle.png', description: 'TypeScript ORM' },
  { name: 'TanStack', src: '/tanstack.png', description: 'Full-Stack Framework' },
  { name: 'Better Auth', src: '/better.png', description: 'Authentication' },
  { name: 'S3 Storage', src: '/s3.png', description: 'Object Storage' },
  { name: 'Docker', src: '/docker.png', description: 'Containerization' },
]

// --- Stagger container ---
const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

function LandingPage() {
  const { t } = useI18n()
  const l = t.landing

  const featureKeys = [
    'collaborative',
    'multiTenant',
    'reviewGovernance',
    'exportReady',
    'privacyFirst',
    'openSource',
  ] as const

  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground selection:bg-primary/10 selection:text-primary">
      <Header />

      <main className="flex flex-1 flex-col items-center">
        {/* ─── HERO SECTION ─── */}
        <section className="relative flex w-full flex-col items-center justify-center px-6 pt-32 pb-20 text-center sm:px-12 lg:px-24 overflow-hidden">
          <DotPattern
            cr={1.5}
            className="[mask-image:radial-gradient(800px_circle_at_center,white,transparent)] opacity-40 text-primary/30"
          />

          {/* Animated gradient orbs */}
          <div className="absolute top-20 -left-40 size-[500px] rounded-full bg-gradient-to-br from-primary/10 to-violet-500/10 blur-3xl animate-pulse" />
          <div
            className="absolute bottom-10 -right-40 size-[400px] rounded-full bg-gradient-to-br from-cyan-500/10 to-emerald-500/10 blur-3xl animate-pulse"
            style={{ animationDelay: '1s' }}
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
                  {l.hero.getStarted} <ArrowRight className="size-5" />
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
                href="https://github.com/refactvision"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="h-14 w-full gap-2 rounded-full border-2 px-8 text-base transition-all hover:bg-muted/50 sm:w-auto"
                >
                  <GithubLogoIcon weight="bold" className="size-5" /> Star on GitHub
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
                <FolderLock className="size-5 text-primary" />
                <span className="text-sm font-semibold tracking-wide uppercase">
                  {l.hero.security.encrypted}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="size-5 text-primary" />
                <span className="text-sm font-semibold tracking-wide uppercase">
                  {l.hero.security.tenant}
                </span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ─── FEATURES GRID ─── */}
        <section className="w-full py-28 px-6 bg-background">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-20"
            >
              <span className="text-primary font-semibold text-sm tracking-wider uppercase mb-4 block">
                Core Capabilities
              </span>
              <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl mb-4">
                Everything your CV team needs
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                From collaborative annotation to production-ready export — one platform, zero
                friction.
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {featureKeys.map((key, i) => {
                const feature = (
                  l.features as Record<string, { title: string; description: string }>
                )[key]
                if (!feature) return null
                return (
                  <motion.div
                    key={key}
                    variants={fadeInUp}
                    className="group relative flex flex-col gap-4 rounded-3xl border border-border/40 bg-card p-8 shadow-sm transition-all hover:shadow-lg hover:border-primary/20 hover:-translate-y-1"
                  >
                    {/* Gradient glow on hover */}
                    <div
                      className={cn(
                        'absolute inset-0 rounded-3xl bg-gradient-to-br opacity-0 transition-opacity group-hover:opacity-100',
                        featureGradients[i],
                      )}
                    />
                    <div className="relative z-10">
                      <div
                        className={cn(
                          'flex size-12 items-center justify-center rounded-2xl bg-muted/50 mb-2 transition-colors group-hover:bg-background',
                          featureIconColors[i],
                        )}
                      >
                        {featureIcons[i]}
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mt-2">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
        </section>

        {/* ─── WORKFLOW TIMELINE ─── */}
        <section className="w-full py-28 px-6 bg-muted/5 border-y border-border/40 overflow-hidden">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-20"
            >
              <span className="text-primary font-semibold text-sm tracking-wider uppercase mb-4 block">
                How It Works
              </span>
              <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl mb-4">
                {l.workflow.title}
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {l.workflow.subtitle}
              </p>
            </motion.div>

            <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Connector line (desktop only) */}
              <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />

              {l.workflow.steps.map((step: { title: string; description: string }, i: number) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                  className="relative flex flex-col items-center text-center"
                >
                  {/* Step circle */}
                  <div className="relative z-10 flex size-20 items-center justify-center rounded-full bg-card border-2 border-primary/30 shadow-lg shadow-primary/10 mb-6 group">
                    <div className="absolute inset-1 rounded-full bg-gradient-to-br from-primary/10 to-primary/5" />
                    <div className="relative text-primary">{workflowIcons[i]}</div>
                    <span className="absolute -top-2 -right-2 flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-md">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px]">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── USE CASES ─── */}
        <section className="w-full py-28 px-6 bg-background">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-20"
            >
              <span className="text-primary font-semibold text-sm tracking-wider uppercase mb-4 block">
                Use Cases
              </span>
              <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl mb-4">
                {l.useCases.title}
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {l.useCases.subtitle}
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {l.useCases.items.map(
                (item: { title: string; description: string; emoji: string }) => (
                  <motion.div
                    key={item.title}
                    variants={fadeInUp}
                    className="group relative flex flex-col gap-3 rounded-3xl border border-border/40 bg-card p-7 transition-all hover:shadow-lg hover:border-primary/20 hover:-translate-y-1"
                  >
                    <span className="text-3xl mb-1">{item.emoji}</span>
                    <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </motion.div>
                ),
              )}
            </motion.div>
          </div>
        </section>

        {/* ─── INTEGRATIONS MARQUEE ─── */}
        <section className="w-full py-24 bg-muted/5 border-y border-border/40 overflow-hidden">
          <div className="container mx-auto px-6 max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <span className="text-primary font-semibold text-sm tracking-wider uppercase mb-4 block">
                Integrations
              </span>
              <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl mb-4">
                {l.integrations.title}
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {l.integrations.subtitle}
              </p>
            </motion.div>

            <Marquee pauseOnHover className="[--duration:30s] [--gap:2rem]">
              {integrations.map((tech) => (
                <div
                  key={tech.name}
                  className="group flex items-center gap-4 rounded-2xl border border-border/40 bg-card px-6 py-4 shadow-sm transition-all hover:shadow-md hover:border-primary/20 min-w-[220px]"
                >
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-muted/50 overflow-hidden">
                    <img
                      src={tech.src}
                      alt={tech.name}
                      className="size-8 object-contain transition-all duration-300 grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground">{tech.name}</span>
                    <span className="text-xs text-muted-foreground">{tech.description}</span>
                  </div>
                </div>
              ))}
            </Marquee>
          </div>
        </section>

        {/* ─── DASHBOARD SHOWCASE ─── */}
        <section className="w-full py-32 px-6 lg:px-24 bg-background">
          <div className="container mx-auto text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-primary font-semibold text-sm tracking-wider uppercase mb-4 block">
                Platform Preview
              </span>
              <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl mb-4">
                {l.dashboard.title}
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {l.dashboard.subtitle}
              </p>
            </motion.div>
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
              <img
                src="/dashboard.png"
                alt="RefactVision Labeling Interface"
                className="w-full h-auto"
              />

              {/* Floating annotation overlay mock */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="absolute bottom-6 right-6 flex items-center gap-3 rounded-2xl bg-card/90 backdrop-blur-xl border border-border/40 px-5 py-3 shadow-2xl"
              >
                <div className="flex -space-x-2">
                  <div className="size-3.5 rounded-full bg-emerald-500 border-2 border-background" />
                  <div className="size-3.5 rounded-full bg-blue-500 border-2 border-background" />
                  <div className="size-3.5 rounded-full bg-rose-500 border-2 border-background" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  <AnimatedCounter value={247} /> annotations
                </span>
                <Eye className="size-4 text-primary" />
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ─── STATS COUNTER ─── */}
        <section className="w-full py-20 px-6 bg-muted/5 border-y border-border/40">
          <div className="container mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8"
            >
              {[
                { value: 5, suffix: '+', label: 'Annotation Roles' },
                { value: 12, suffix: '', label: 'Languages Supported' },
                { value: 100, suffix: '%', label: 'Open Source' },
                { value: 4, suffix: '', label: 'Export Formats' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-4xl sm:text-5xl font-bold text-primary">
                    <AnimatedCounter value={stat.value} />
                    {stat.suffix}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 font-medium">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ─── CTA SECTION ─── */}
        <section className="w-full py-32 px-6">
          <div className="container mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative rounded-[3.5rem] bg-primary px-8 py-24 text-center text-primary-foreground shadow-2xl shadow-primary/40 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent pointer-events-none" />

              {/* Floating dots decoration */}
              <div className="absolute top-10 left-10 size-3 rounded-full bg-white/20 animate-pulse" />
              <div
                className="absolute top-20 right-16 size-2 rounded-full bg-white/15 animate-pulse"
                style={{ animationDelay: '0.5s' }}
              />
              <div
                className="absolute bottom-16 left-20 size-2.5 rounded-full bg-white/20 animate-pulse"
                style={{ animationDelay: '1s' }}
              />

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
                    {l.cta.button} <Rocket className="ml-2 size-6" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-border/40 py-16 text-center text-sm text-muted-foreground bg-background">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10 max-w-6xl">
          <div className="flex flex-col items-center md:items-start gap-4">
            <Logo />
            <p className="max-w-xs text-muted-foreground/60 text-center md:text-left">
              The collaborative control layer between raw image data and production CV pipelines.
            </p>
          </div>
          <div className="flex flex-col items-center md:items-end gap-6">
            <p>{l.footer.madeWith} Y.BERDAI</p>
            <div className="flex items-center gap-8 font-medium">
              <a href="/privacy" className="hover:text-primary transition-colors">
                Privacy
              </a>
              <a href="/terms" className="hover:text-primary transition-colors">
                Terms
              </a>
              <a
                href="https://github.com/refactvision"
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
