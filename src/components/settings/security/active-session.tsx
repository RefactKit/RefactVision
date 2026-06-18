import { useAuth } from '@better-auth-ui/react'
import { useNavigate } from '@tanstack/react-router'
import type { Session } from 'better-auth'
import Bowser from 'bowser'
import { Key, LogOut, Monitor, Smartphone, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import {
  GithubIcon,
  GoogleIcon,
  LinkedinIcon,
  MicrosoftIcon,
  TwitterIcon,
} from '@/routes/_auth/-shared'
import { authClient, useSession } from '../../../../lib/auth-client'

function formatRelativeTime(date: Date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  const absSeconds = Math.abs(seconds)
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
  const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
    ['second', 1],
  ]
  for (const [unit, threshold] of UNITS) {
    if (absSeconds >= threshold) {
      return rtf.format(-Math.floor(seconds / threshold), unit)
    }
  }
  return rtf.format(0, 'second')
}

interface ActiveSessionProps {
  activeSession: Session & { provider?: string }
  providers?: string[]
}

export function ActiveSession({ activeSession, providers }: ActiveSessionProps) {
  const { localization } = useAuth()
  const { data: session } = useSession()
  const navigate = useNavigate()

  const [isRevoking, setIsRevoking] = useState(false)

  const handleRevokeSession = async (sessionToRevoke: Session) => {
    setIsRevoking(true)
    const { error } = await authClient.revokeSession({
      token: sessionToRevoke.token,
    })
    setIsRevoking(false)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success(localization.settings.revokeSessionSuccess, {
        action: {
          label: 'Undo',
          onClick: () => {
            toast.info('Session restoration is not possible without re-authentication.')
          },
        },
      })
    }
  }

  const isCurrentSession = activeSession.token === session?.session.token
  const ua = Bowser.parse(activeSession.userAgent || '')
  const isMobile = ua.platform.type === 'mobile' || ua.platform.type === 'tablet'

  const getProviderBadge = (provider?: string) => {
    switch (provider?.toLowerCase()) {
      case 'google':
        return (
          <div className="flex items-center gap-1.5 rounded-full bg-blue-500/5 px-2 py-0.5 text-[10px] font-medium text-blue-600 border border-blue-500/10">
            <GoogleIcon />
            <span>Google</span>
          </div>
        )
      case 'github':
        return (
          <div className="flex items-center gap-1.5 rounded-full bg-slate-900/5 px-2 py-0.5 text-[10px] font-medium text-slate-900 border border-slate-900/10 dark:bg-white/5 dark:text-white dark:border-white/10">
            <GithubIcon className="size-3" />
            <span>GitHub</span>
          </div>
        )
      case 'linkedin':
        return (
          <div className="flex items-center gap-1.5 rounded-full bg-[#0077b5]/5 px-2 py-0.5 text-[10px] font-medium text-[#0077b5] border border-[#0077b5]/10">
            <LinkedinIcon className="size-3" />
            <span>LinkedIn</span>
          </div>
        )
      case 'twitter':
        return (
          <div className="flex items-center gap-1.5 rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-medium text-black border border-black/10 dark:bg-white/5 dark:text-white dark:border-white/10">
            <TwitterIcon className="size-3" />
            <span>Twitter (X)</span>
          </div>
        )
      case 'microsoft':
        return (
          <div className="flex items-center gap-1.5 rounded-full bg-gray-500/5 px-2 py-0.5 text-[10px] font-medium text-gray-600 border border-gray-500/10 dark:bg-white/5 dark:text-white dark:border-white/10">
            <MicrosoftIcon className="size-3" />
            <span>Microsoft</span>
          </div>
        )
      default:
        return (
          <div className="flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground border border-border">
            <Key className="size-3" />
            <span>Password</span>
          </div>
        )
    }
  }

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:border-primary/20 hover:shadow-md dark:hover:bg-muted/30">
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted/50 border border-border/50">
            {isMobile ? <Smartphone className="size-4" /> : <Monitor className="size-4" />}
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-2 text-sm font-medium">
              <span>{ua.browser.name || 'Unknown Browser'}</span>
              <span className="text-muted-foreground/30">•</span>
              <span>{ua.os.name || 'Unknown OS'}</span>
              {ua.platform.model && (
                <>
                  <span className="text-muted-foreground/30">•</span>
                  <span className="text-muted-foreground">{ua.platform.model}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-3 mt-1">
              {isCurrentSession && (
                <span className="rounded-full bg-teal-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-teal-600">
                  {localization.settings.currentSession}
                </span>
              )}
              <div className="mt-0.5 flex flex-wrap gap-1">
                {activeSession.provider
                  ? getProviderBadge(activeSession.provider)
                  : providers && providers.length > 0
                    ? providers.map((p) => <div key={p}>{getProviderBadge(p)}</div>)
                    : getProviderBadge('password')}
              </div>
            </div>
          </div>

          <Button
            className="shrink-0"
            variant="ghost"
            size="icon"
            onClick={() =>
              isCurrentSession ? navigate({ to: '/logout' }) : handleRevokeSession(activeSession)
            }
            disabled={isRevoking}
          >
            {isRevoking ? (
              <Spinner />
            ) : isCurrentSession ? (
              <LogOut className="size-4" />
            ) : (
              <X className="size-4" />
            )}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-muted/50 pt-3 md:grid-cols-5">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              IP Address
            </span>
            <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded w-fit">
              {activeSession.ipAddress || '—'}
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Last seen
            </span>
            <span className="text-xs text-foreground">
              {activeSession.updatedAt
                ? formatRelativeTime(new Date(activeSession.updatedAt))
                : '—'}
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Created
            </span>
            <span className="text-xs text-foreground">
              {activeSession.createdAt
                ? formatRelativeTime(new Date(activeSession.createdAt))
                : '—'}
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Expires
            </span>
            <span className="text-xs text-foreground/80 italic">
              {activeSession.expiresAt
                ? formatRelativeTime(new Date(activeSession.expiresAt))
                : '—'}
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Status
            </span>
            <div className="flex items-center gap-1.5">
              <div className="size-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-foreground">Active</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
