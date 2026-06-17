import { useAuth } from '@better-auth-ui/react'
import { cn } from '@/lib/utils'
import { ActiveSessions } from './active-sessions'
import { ChangePassword } from './change-password'
import { DangerZone } from './danger-zone'

interface SecuritySettingsProps {
  className?: string
}

export function SecuritySettings({ className }: SecuritySettingsProps) {
  const { deleteUser, emailAndPassword } = useAuth()

  return (
    <div className={cn('flex w-full flex-col gap-4 md:gap-6', className)}>
      {emailAndPassword?.enabled && <ChangePassword />}
      <ActiveSessions />
      {deleteUser?.enabled && <DangerZone />}
    </div>
  )
}
