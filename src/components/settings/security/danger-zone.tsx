import { useAuth } from '@better-auth-ui/react'
import { cn } from '@/lib/utils'
import { DeleteUser } from './delete-user'

interface DangerZoneProps {
  className?: string
}

export function DangerZone({ className }: DangerZoneProps) {
  const { localization } = useAuth()

  return (
    <div className={cn(className)}>
      <h2 className="text-sm font-semibold mb-3">{localization.settings.dangerZone}</h2>
      <DeleteUser />
    </div>
  )
}
