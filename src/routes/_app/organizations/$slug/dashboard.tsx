import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { FolderIcon, HardDriveIcon, LayoutDashboardIcon, UsersIcon } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useI18n } from '@/i18n/context'
import { cn } from '@/lib/utils'
import { orgStatsQuery } from '@/server/query-keys'
import { Route as OrgRoute } from './route'

export const Route = createFileRoute('/_app/organizations/$slug/dashboard')({
  component: DashboardPage,
})

function formatBytes(bytes: number, decimals = 1) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`
}

function DashboardPage() {
  const { t } = useI18n()
  const { org } = OrgRoute.useLoaderData()

  const { data: stats, isLoading } = useQuery(orgStatsQuery(org.id))

  const statCards = [
    {
      title: t.dashboard.inactiveMembers,
      value: stats?.pendingInvitationCount ?? 0,
      subtitle: t.dashboard.pendingInvites,
      icon: UsersIcon,
      color: 'text-slate-400',
    },
    {
      title: t.projects.title,
      value: stats?.imageCount ?? 0,
      subtitle: t.dashboard.totalFiles,
      icon: FolderIcon,
      color: 'text-purple-400',
    },
    {
      title: t.dashboard.storageTotal,
      value: formatBytes(stats?.totalSizeBytes ?? 0).split(' ')[0],
      unit: formatBytes(stats?.totalSizeBytes ?? 0).split(' ')[1],
      subtitle: t.dashboard.totalOf.replace('{{total}}', '15 GB'),
      icon: HardDriveIcon,
      color: 'text-slate-400',
    },
    {
      title: t.dashboard.activeMembers,
      value: Math.min(1, stats?.memberCount ?? 0),
      subtitle: t.dashboard.currentSessions,
      icon: LayoutDashboardIcon,
      color: 'text-blue-500',
    },
  ]

  return (
    <div className="flex flex-col gap-10 max-w-7xl mx-auto w-full py-4 px-4 sm:px-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {t.dashboard.welcome.replace('{{org}}', org.name)}
        </h1>
      </div>

      <div className="grid gap-3 sm:gap-6 grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="group relative flex flex-col gap-2 sm:gap-3 rounded-2xl sm:rounded-3xl border border-border/40 bg-card p-4 sm:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-border/80"
          >
            <div className="flex flex-col gap-0.5 sm:gap-1">
              <div className="flex items-baseline gap-1 overflow-hidden">
                {isLoading ? (
                  <Skeleton className="h-7 sm:h-10 w-16 sm:w-20" />
                ) : (
                  <>
                    <span className="text-xl sm:text-4xl font-semibold tracking-tighter text-foreground truncate">
                      {card.value}
                    </span>
                    {card.unit && (
                      <span className="text-sm sm:text-2xl font-semibold tracking-tighter text-foreground">
                        {card.unit}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="flex items-start justify-between mt-auto pt-2">
              <div className="flex flex-col gap-0.5 min-w-0">
                <h3 className="text-xs sm:text-sm font-semibold text-foreground/90 tracking-tight leading-tight line-clamp-1">
                  {card.title}
                </h3>
                <p className="text-[10px] sm:text-xs font-medium text-muted-foreground/50 line-clamp-1">
                  {card.subtitle}
                </p>
              </div>
              <card.icon
                className={cn('size-4 sm:size-5 opacity-40 shrink-0 mt-0.5', card.color)}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <div className="flex flex-col gap-4 rounded-xl border border-dashed border-border/60 p-12 items-center justify-center text-center bg-muted/5">
          <div className="size-12 rounded-full bg-background border flex items-center justify-center mb-1 text-muted-foreground/40">
            <HardDriveIcon className="size-6" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-medium text-foreground">Analytics coming soon</p>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              We're building deeper insights to help you manage your organization efficiently.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
