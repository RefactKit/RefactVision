import { Languages, Monitor, Moon, Paintbrush, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { type ColorTheme, useColorTheme } from '@/hooks/use-color-theme'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Locale } from '@/i18n'
import { useI18n } from '@/i18n/context'

const languageMap: Record<Locale, { label: string; flag: string }> = {
  en: { label: 'English', flag: '🇺🇸' },
  fr: { label: 'Français', flag: '🇫🇷' },
  be: { label: 'Belgique-Fr', flag: '🇧🇪' },
  de: { label: 'Deutsch', flag: '🇩🇪' },
  hi: { label: 'हिन्दी', flag: '🇮🇳' },
  es: { label: 'Español', flag: '🇪🇸' },
  ar: { label: 'العربية', flag: '🇦🇪' },
  'ar-ma': { label: 'العربية (المغرب)', flag: '🇲🇦' },
  pt: { label: 'Português', flag: '🇵🇹' },
  zh: { label: '简体中文', flag: '🇨🇳' },
  it: { label: 'Italiano', flag: '🇮🇹' },
  ru: { label: 'Русский', flag: '🇷🇺' },
  tr: { label: 'Türkçe', flag: '🇹🇷' },
}

export function LanguageToggle() {
  const { locale, setLocale } = useI18n()
  const current = languageMap[locale]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/50 text-muted-foreground hover:text-foreground transition-all hover:bg-muted dark:bg-muted/10 dark:hover:bg-muted/20">
        <span className="text-base">{current?.flag}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuRadioGroup value={locale} onValueChange={(v) => setLocale(v as Locale)}>
          {(Object.entries(languageMap) as [Locale, (typeof languageMap)['en']][]).map(
            ([code, { label, flag }]) => (
              <DropdownMenuRadioItem key={code} value={code} className="gap-2">
                <span className="text-base">{flag}</span>
                <span>{label}</span>
              </DropdownMenuRadioItem>
            ),
          )}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted)
    return (
      <div
        className={`h-8 w-[90px] rounded-full bg-muted/50 dark:bg-muted/10 ${className ?? ''}`}
      />
    )

  return (
    <div
      className={`flex items-center gap-0.5 rounded-full border border-border/40 bg-muted/50 p-0.5 dark:bg-muted/10 ${className ?? ''}`}
    >
      {(
        [
          ['light', Sun],
          ['system', Monitor],
          ['dark', Moon],
        ] as const
      ).map(([v, Icon]) => (
        <button
          type="button"
          key={v}
          onClick={() => setTheme(v)}
          className={`flex h-7 w-7 items-center justify-center rounded-full transition-all ${
            theme === v
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  )
}

const COLOR_PRESETS = [
  { value: 'default', label: 'Nova', color: 'bg-zinc-900 dark:bg-zinc-100' },
  { value: 'vega', label: 'Vega', color: 'bg-blue-600' },
  { value: 'maia', label: 'Maia', color: 'bg-emerald-600' },
  { value: 'lyra', label: 'Lyra', color: 'bg-purple-600' },
  { value: 'mira', label: 'Mira', color: 'bg-orange-500' },
  { value: 'luma', label: 'Luma', color: 'bg-rose-500' },
  { value: 'refactkit', label: 'RefactKit', color: 'bg-lime-400' },
] as const

export function ColorThemeToggle() {
  const { colorTheme, setColorTheme } = useColorTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/50 text-muted-foreground hover:text-foreground transition-all hover:bg-muted dark:bg-muted/10 dark:hover:bg-muted/20">
        <Paintbrush className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuRadioGroup
          value={colorTheme}
          onValueChange={(v) => setColorTheme(v as ColorTheme)}
        >
          {COLOR_PRESETS.map((preset) => (
            <DropdownMenuRadioItem key={preset.value} value={preset.value} className="gap-2">
              <div className={cn('size-3 rounded-full shadow-sm', preset.color)} />
              <span>{preset.label}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
