import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { Settings } from '@/components/settings/settings'
import { useI18n } from '@/i18n/context'

const settingsSearchSchema = z.object({
  view: z.enum(['account', 'security', 'appearance']).optional().default('account'),
})

export const Route = createFileRoute('/_app/settings')({
  validateSearch: (search) => settingsSearchSchema.parse(search),
  component: SettingsPage,
})

function SettingsPage() {
  const { t } = useI18n()
  const { view } = Route.useSearch()

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{t.settings.title}</h1>
        <p className="text-muted-foreground mt-2">{t.settings.subtitle}</p>
      </div>
      <Settings view={view} />
    </div>
  )
}
