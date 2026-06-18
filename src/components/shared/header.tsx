import { Link } from '@tanstack/react-router'
import { ColorThemeToggle, LanguageToggle, ThemeToggle } from '@/components/shared/auth-ui'
import { Logo } from '@/components/shared/logo'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n/context'

export function Header({ hideAuthButtons = false }: { hideAuthButtons?: boolean }) {
  const { t } = useI18n()
  const l = t.landing

  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-border/40 bg-background/95 dark:bg-black px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:supports-[backdrop-filter]:bg-black lg:px-12">
      <div className="flex items-center gap-2">
        <Logo />
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        {!hideAuthButtons && (
          <>
            <Link to="/login" className="hidden sm:block">
              <Button variant="ghost" className="rounded-full">
                {l.header.signIn}
              </Button>
            </Link>
            <Link to="/login" className="hidden sm:block">
              <Button className="rounded-full shadow-sm shadow-primary/20">
                {l.header.getStarted}
              </Button>
            </Link>
          </>
        )}
        <div className="flex items-center gap-2">
          <ColorThemeToggle />
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
