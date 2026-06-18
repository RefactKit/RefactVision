import { Link } from '@tanstack/react-router'
import { Scan } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  iconClassName?: string
  iconSize?: number
  textSize?: string
}

export function Logo({ className, iconClassName, iconSize = 18, textSize = 'text-xl' }: LogoProps) {
  return (
    <Link
      to="/"
      className={cn(
        'flex items-center gap-2 font-bold tracking-tight select-none group',
        className,
      )}
    >
      <div
        className={cn(
          'relative flex items-center justify-center size-8 rounded-lg bg-gradient-to-tr from-primary to-primary/80 text-primary-foreground shadow-sm shadow-primary/20 transition-all duration-300 group-hover:scale-105',
          iconClassName,
        )}
      >
        <Scan size={iconSize} className="text-white shrink-0" strokeWidth={2.5} />
      </div>
      <span className={cn('font-sans font-extrabold tracking-tight transition-colors', textSize)}>
        <span className="text-foreground">Refact</span>
        <span className="bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent">
          Vision
        </span>
      </span>
    </Link>
  )
}
