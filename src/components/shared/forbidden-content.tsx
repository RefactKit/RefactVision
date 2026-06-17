import { Link, useParams } from '@tanstack/react-router'
import { ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n/context'

export function ForbiddenContent() {
  const { t } = useI18n()
  const params = useParams({ strict: false }) as { slug?: string }

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-6 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <ShieldAlert className="h-10 w-10" />
      </div>
      <h1 className="mb-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {t.forbidden.title}
      </h1>
      <p className="mb-6 max-w-md text-muted-foreground">{t.forbidden.description}</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          variant="outline"
          render={<Link to="/organizations/$slug/dashboard" params={{ slug: params.slug || '' }} />}
        >
          {t.forbidden.backToDashboard}
        </Button>
      </div>
    </div>
  )
}
