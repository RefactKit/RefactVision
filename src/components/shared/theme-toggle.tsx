import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler'
import { cn } from '@/lib/utils'

export function ThemeToggle({ className }: { className?: string }) {
  return (
    <AnimatedThemeToggler
      className={cn(
        'rounded-full transition-colors hover:bg-muted p-2 flex items-center justify-center',
        className,
      )}
    />
  )
}
