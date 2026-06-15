import { Link } from '@tanstack/react-router'
import { Check, Languages, Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { LanguageToggle, ThemeToggle } from '@/components/shared/auth-ui'
import { Header } from '@/components/shared/header'
import { DotPattern } from '@/components/ui/dot-pattern'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Locale } from '@/i18n'
import { useI18n } from '@/i18n/context'

export function AuthShell({
  children,
  badge,
  heading,
  subheading,
  features,
}: {
  children: React.ReactNode
  badge: string
  heading: string
  subheading: string
  features?: string[]
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header hideAuthButtons />
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <div className="relative hidden w-1/2 flex-col lg:flex border-r border-border/40 bg-muted/5">
          <DotPattern
            cr={1.5}
            className="[mask-image:radial-gradient(500px_circle_at_center,white,transparent)] opacity-40 text-primary/30"
          />
          <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[140px]" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-primary/5 blur-[120px]" />
          <div className="relative z-10 flex h-full flex-col justify-center p-12">
            <div className="max-w-md">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-3 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="text-xs font-medium text-primary">{badge}</span>
              </div>
              <h1 className="text-4xl font-semibold leading-tight text-foreground">{heading}</h1>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{subheading}</p>
              {features && (
                <ul className="mt-8 space-y-3">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Check className="h-3 w-3 text-primary" strokeWidth={3} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="absolute bottom-12 left-12">
            <p className="text-sm text-muted-foreground/60">
              © {new Date().getFullYear()} RefactKit
            </p>
          </div>
        </div>

        {/* Right panel */}
        <div className="relative flex w-full flex-col overflow-y-auto lg:w-1/2 bg-background">
          <div className="flex flex-1 items-center justify-center px-5 py-10">
            <div className="w-full max-w-[360px]">{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <img
        src="/logo.png"
        alt="RefactKit"
        className="h-8 w-auto object-contain sm:h-12 dark:hidden"
      />
      <img
        src="/logo-dark.png"
        alt="RefactKit"
        className="h-8 w-auto object-contain sm:h-12 hidden dark:block"
      />
    </Link>
  )
}

export function Divider() {
  const { t } = useI18n()
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 border-t border-gray-200 dark:border-gray-800" />
      <span className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-600">
        {t.common.or}
      </span>
      <div className="flex-1 border-t border-gray-200 dark:border-gray-800" />
    </div>
  )
}

export function GoogleIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
      <title>Google</title>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}
export function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('h-4 w-4 shrink-0', className)} viewBox="0 0 24 24" fill="currentColor">
      <title>LinkedIn</title>
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.238 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  )
}

export function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('h-4 w-4 shrink-0', className)} viewBox="0 0 24 24" fill="currentColor">
      <title>GitHub</title>
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  )
}

export function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('h-4 w-4 shrink-0', className)} viewBox="0 0 24 24" fill="currentColor">
      <title>Twitter (X)</title>
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.294 19.497h2.039L6.482 3.239H4.293L17.607 20.65z" />
    </svg>
  )
}

export function MicrosoftIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('h-4 w-4 shrink-0', className)} viewBox="0 0 23 23">
      <title>Microsoft</title>
      <path fill="#f3f3f3" d="M0 0h23v23H0z" />
      <path fill="#f35325" d="M1 1h10v10H1z" />
      <path fill="#81bc06" d="M12 1h10v10H12z" />
      <path fill="#05a6f0" d="M1 12h10v10H1z" />
      <path fill="#ffba08" d="M12 12h10v10H12z" />
    </svg>
  )
}

export function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ')
}
