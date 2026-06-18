import { useAuth } from '@better-auth-ui/react'
import { cn } from '@/lib/utils'
import { ChangeEmail } from './change-email'
import { UserProfile } from './user-profile'

interface AccountSettingsProps {
  className?: string
}

export function AccountSettings({ className }: AccountSettingsProps) {
  const { emailAndPassword, magicLink } = useAuth()

  return (
    <div className={cn('flex w-full flex-col gap-4 md:gap-6', className)}>
      <UserProfile />
      {(emailAndPassword?.enabled || magicLink) && <ChangeEmail />}
    </div>
  )
}
