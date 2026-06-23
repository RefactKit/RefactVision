import { useAuth } from '@better-auth-ui/react'
import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type Font, useFont } from '@/hooks/use-font'
import { type ColorTheme, useColorTheme } from '@/hooks/use-color-theme'
import { cn } from '@/lib/utils'
import { useSession } from '../../../../lib/auth-client'

interface AppearanceProps {
  className?: string
}

const THEMES = [
  { value: 'system', label: 'System', Icon: Monitor },
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
] as const

const COLOR_PRESETS = [
  { value: 'default', label: 'Nova', color: 'bg-zinc-900 dark:bg-zinc-100' },
  { value: 'vega', label: 'Vega', color: 'bg-blue-600' },
  { value: 'maia', label: 'Maia', color: 'bg-emerald-600' },
  { value: 'lyra', label: 'Lyra', color: 'bg-purple-600' },
  { value: 'mira', label: 'Mira', color: 'bg-orange-500' },
  { value: 'luma', label: 'Luma', color: 'bg-rose-500' },
  { value: 'refactkit', label: 'RefactKit', color: 'bg-lime-400' },
] as const

export function Appearance({ className }: AppearanceProps) {
  const { localization } = useAuth()
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const { font, setFont } = useFont()
  const { colorTheme, setColorTheme } = useColorTheme()

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-sm font-semibold mb-3">{localization.settings.theme}</h2>
        <Card className={cn(className)}>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {THEMES.map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  disabled={!session}
                  onClick={() => setTheme(value)}
                  className={cn(
                    'flex flex-col gap-2 rounded-lg border-2 p-3 text-left transition-all',
                    theme === value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-muted-foreground/40',
                  )}
                >
                  {/* Preview box */}
                  <div
                    className={cn(
                      'w-full h-12 rounded-md border flex items-center justify-center',
                      value === 'light'
                        ? 'bg-white'
                        : value === 'dark'
                          ? 'bg-gray-950'
                          : 'bg-gradient-to-r from-white to-gray-950',
                    )}
                  >
                    <Icon
                      className={cn(
                        'size-4',
                        value === 'light'
                          ? 'text-gray-900'
                          : value === 'dark'
                            ? 'text-white'
                            : 'text-gray-500',
                      )}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">{label}</span>
                    {theme === value && (
                      <span className="text-[10px] text-primary font-semibold">Active</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-sm font-semibold mb-3">{localization.settings.font || 'Font'}</h2>
        <Card className={cn(className)}>
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Select
                value={font}
                onValueChange={(value) => setFont(value as Font)}
                disabled={!session}
              >
                <SelectTrigger className="w-full sm:w-[240px]">
                  <SelectValue placeholder="Select a font" />
                </SelectTrigger>
                <SelectContent align="start">
                  <SelectItem value="default">Auto (Smart Switching)</SelectItem>
                  <SelectItem value="google-sans">Google Sans Flex</SelectItem>
                  <SelectItem value="zain">Zain</SelectItem>
                  <SelectItem value="geist">Geist</SelectItem>
                  <SelectItem value="baloo">Baloo Bhaijaan 2</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {localization.settings.fontDescription}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-sm font-semibold mb-3">Color Theme</h2>
        <Card className={cn(className)}>
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Select
                value={colorTheme}
                onValueChange={(value) => setColorTheme(value as ColorTheme)}
                disabled={!session}
              >
                <SelectTrigger className="w-full sm:w-[240px]">
                  <SelectValue placeholder="Select a preset" />
                </SelectTrigger>
                <SelectContent align="start">
                  {COLOR_PRESETS.map((preset) => (
                    <SelectItem key={preset.value} value={preset.value}>
                      <div className="flex items-center gap-2">
                        <div className={cn('size-3 rounded-full shadow-sm', preset.color)} />
                        <span>{preset.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Choose the primary color palette of the application.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
