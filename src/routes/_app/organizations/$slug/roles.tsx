import { createFileRoute } from '@tanstack/react-router'
import { ForbiddenContent } from '@/components/shared/forbidden-content'
import { RoleMatrix } from '@/components/settings/roles/role-matrix'
import { Route as OrgRoute } from './route'

export const Route = createFileRoute('/_app/organizations/$slug/roles')({
  component: OrgRolesPage,
})

function OrgRolesPage() {
  const { role } = OrgRoute.useLoaderData()

  // Only owners can manage roles
  if (role !== 'owner') {
    return <ForbiddenContent />
  }

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full py-4 px-4 sm:px-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Rôles & Permissions
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Gérez l'accès aux différentes ressources de l'organisation.
        </p>
      </div>

      <div className="rounded-3xl border border-border/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden bg-card">
        <div className="p-7">
          <RoleMatrix />
        </div>
      </div>
    </div>
  )
}
