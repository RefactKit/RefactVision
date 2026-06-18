import { useNavigate } from '@tanstack/react-router'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useI18n } from '@/i18n/context'
import { cn } from '@/lib/utils'
import { AccountSettings } from './account/account-settings'
import { Appearance } from './account/appearance'
import { GlobalModelsSettings } from './global-models-settings'
import { SecuritySettings } from './security/security-settings'

export type SettingsView = 'account' | 'security' | 'appearance' | 'models'

interface SettingsProps {
  className?: string
  view?: SettingsView
}

export function Settings({ className, view = 'account' }: SettingsProps) {
  const navigate = useNavigate()
  const { t } = useI18n()

  return (
    <div className={cn('w-full flex flex-col gap-4 md:gap-6', className)}>
      <Tabs
        value={view}
        onValueChange={(val) =>
          navigate({
            search: (prev: Record<string, unknown>) => ({ ...prev, view: val as SettingsView }),
          })
        }
        className="w-full flex flex-col gap-6"
      >
        <TabsList className="h-10 p-1 bg-muted rounded-lg border border-border/50">
          <TabsTrigger value="account" className="px-4 py-2">
            {t.settings.account}
          </TabsTrigger>
          <TabsTrigger value="security" className="px-4 py-2">
            {t.settings.security}
          </TabsTrigger>
          <TabsTrigger value="appearance" className="px-4 py-2">
            {t.settings.appearance}
          </TabsTrigger>
          <TabsTrigger value="models" className="px-4 py-2">
            ML Models
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="mt-0">
          <AccountSettings />
        </TabsContent>
        <TabsContent value="security" className="mt-0">
          <SecuritySettings />
        </TabsContent>
        <TabsContent value="appearance" className="mt-0">
          <Appearance />
        </TabsContent>
        <TabsContent value="models" className="mt-0">
          <GlobalModelsSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}
