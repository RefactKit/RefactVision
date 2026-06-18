import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Plus, ShieldAlert, Trash2 } from 'lucide-react'
import React, { useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useI18n } from '@/i18n/context'
import { cn } from '@/lib/utils'
import { authClient } from '../../../../lib/auth-client'

const AVAILABLE_RESOURCES = {
  project: ['create', 'read', 'update', 'delete'],
  member: ['read', 'create', 'update', 'delete'],
  invitation: ['read', 'create', 'update', 'delete'],
  organization: ['update', 'delete'],
  dashboard: ['read'],
  ac: ['create', 'read', 'update', 'delete'],
} as const

const DEFAULT_STATIC_ROLES: Record<string, Record<string, string[]>> = {
  owner: {
    dashboard: ['read'],
    member: ['read', 'create', 'update', 'delete'],
    invitation: ['read', 'create', 'update', 'delete'],
    organization: ['update', 'delete'],
    project: ['create', 'read', 'update', 'delete'],
    ac: ['create', 'read', 'update', 'delete'],
  },
  admin: {
    dashboard: ['read'],
    member: ['read', 'create', 'update'],
    invitation: ['read', 'create', 'delete'],
    project: ['create', 'read', 'update', 'delete'],
    ac: ['read'],
  },
  member: {
    dashboard: ['read'],
    project: ['create', 'read', 'update'],
  },
}

export function RoleMatrix() {
  const { t } = useI18n()
  const queryClient = useQueryClient()
  const { data: activeOrg } = authClient.useActiveOrganization()
  const [newRoleName, setNewRoleName] = useState('')

  const { data: orgRolesResponse, isLoading } = useQuery({
    queryKey: ['orgRoles', activeOrg?.id],
    queryFn: async () => {
      if (!activeOrg?.id) return null
      return authClient.organization.listRoles({ query: { organizationId: activeOrg.id } })
    },
    enabled: !!activeOrg?.id,
  })

  const dynamicRoles = orgRolesResponse?.data || []

  const allRoleNames = Array.from(
    new Set([...Object.keys(DEFAULT_STATIC_ROLES), ...dynamicRoles.map((r: any) => r.role)]),
  )

  const createRoleMutation = useMutation({
    mutationFn: async (roleName: string) => {
      return authClient.organization.createRole({
        role: roleName.toLowerCase().replace(/\s+/g, '-'),
        permission: {},
      })
    },
    onSuccess: (res) => {
      if (res.error) {
        toast.error(res.error.message || t.roles.createError)
      } else {
        toast.success(t.roles.createSuccess)
        setNewRoleName('')
        queryClient.invalidateQueries({ queryKey: ['orgRoles', activeOrg?.id] })
      }
    },
  })

  const togglePermissionMutation = useMutation({
    mutationFn: async ({
      role,
      resource,
      action,
      currentPermissions,
    }: {
      role: any // The full role object or string for static
      resource: string
      action: string
      currentPermissions: Record<string, string[]>
    }) => {
      if (typeof role === 'string' && Object.keys(DEFAULT_STATIC_ROLES).includes(role)) {
        throw new Error(t.roles.systemRoleNote)
      }

      const newPermissions = { ...currentPermissions }
      if (!newPermissions[resource]) {
        newPermissions[resource] = []
      }

      if (newPermissions[resource].includes(action)) {
        newPermissions[resource] = newPermissions[resource].filter((a) => a !== action)
      } else {
        newPermissions[resource] = [...newPermissions[resource], action]
      }

      return authClient.organization.updateRole({
        roleId: role.id,
        permission: newPermissions,
      })
    },
    onSuccess: (res) => {
      if (res.error) {
        toast.error(res.error.message || t.roles.updateError)
      } else {
        queryClient.invalidateQueries({ queryKey: ['orgRoles', activeOrg?.id] })
      }
    },
    onError: (err: any) => {
      toast.error(err.message)
    },
  })

  const deleteRoleMutation = useMutation({
    mutationFn: async (roleId: string) => {
      return authClient.organization.deleteRole({
        roleId,
      })
    },
    onSuccess: (res) => {
      if (res.error) {
        toast.error(res.error.message)
      } else {
        toast.success(t.roles.deleteSuccess)
        queryClient.invalidateQueries({ queryKey: ['orgRoles', activeOrg?.id] })
      }
    },
  })

  if (!activeOrg) return null

  const getRolePermissions = (roleName: string) => {
    const dynamicRole = dynamicRoles.find((r: any) => r.role === roleName)
    if (dynamicRole) {
      try {
        return typeof dynamicRole.permission === 'string'
          ? JSON.parse(dynamicRole.permission)
          : dynamicRole.permission
      } catch {
        return {}
      }
    }
    return DEFAULT_STATIC_ROLES[roleName] || {}
  }

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRoleName.trim()) return
    createRoleMutation.mutate(newRoleName)
  }

  const handleToggle = (role: any, resource: string, action: string) => {
    const roleName = typeof role === 'string' ? role : role.role
    const currentPermissions = getRolePermissions(roleName)
    togglePermissionMutation.mutate({ role, resource, action, currentPermissions })
  }

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle>{t.roles.title}</CardTitle>
            <CardDescription>{t.roles.subtitle}</CardDescription>
          </div>
          <form onSubmit={handleCreateRole} className="flex items-center gap-2">
            <Input
              placeholder={t.roles.newRolePlaceholder}
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              className="w-[180px]"
            />
            <Button type="submit" disabled={createRoleMutation.isPending || !newRoleName.trim()}>
              {createRoleMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-1" />
              )}
              {t.roles.add}
            </Button>
          </form>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border overflow-hidden bg-background">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[200px] font-bold">{t.roles.resourceAction}</TableHead>
                {allRoleNames.map((rn) => {
                  const isStatic = Object.keys(DEFAULT_STATIC_ROLES).includes(rn)
                  const dynamicRole = dynamicRoles.find((dr: any) => dr.role === rn)

                  return (
                    <TableHead key={rn} className="text-center font-bold">
                      <div className="flex items-center justify-center gap-2">
                        <Badge variant={isStatic ? 'outline' : 'secondary'} className="capitalize">
                          {rn}
                        </Badge>
                        {!isStatic && dynamicRole && (
                          <button
                            className="text-muted-foreground hover:text-destructive transition-colors"
                            onClick={() => {
                              if (confirm(t.roles.deleteConfirm.replace('{{role}}', rn))) {
                                deleteRoleMutation.mutate(dynamicRole.id)
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </TableHead>
                  )
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={allRoleNames.length + 1}
                    className="h-32 text-center text-muted-foreground"
                  >
                    {t.common.loading}
                  </TableCell>
                </TableRow>
              ) : (
                Object.entries(AVAILABLE_RESOURCES).map(([resource, actions]) => (
                  <React.Fragment key={resource}>
                    <TableRow className="bg-muted/30">
                      <TableCell
                        colSpan={allRoleNames.length + 1}
                        className="py-2 font-bold text-[10px] uppercase tracking-widest text-muted-foreground/70"
                      >
                        {t.resources[resource as keyof typeof t.resources] || resource}
                      </TableCell>
                    </TableRow>
                    {actions.map((action) => (
                      <TableRow
                        key={`${resource}-${action}`}
                        className="hover:bg-muted/10 transition-colors"
                      >
                        <TableCell className="pl-6 py-3 text-sm text-muted-foreground">
                          {t.actions[action as keyof typeof t.actions] || action}
                        </TableCell>
                        {allRoleNames.map((rn) => {
                          const isStatic = Object.keys(DEFAULT_STATIC_ROLES).includes(rn)
                          const dynamicRole = dynamicRoles.find((dr: any) => dr.role === rn)
                          const roleObj = isStatic ? rn : dynamicRole
                          const isOwner = rn === 'owner'
                          const isDisabled = isStatic || togglePermissionMutation.isPending

                          return (
                            <TableCell key={`${resource}-${action}-${rn}`} className="text-center">
                              <div className="flex justify-center">
                                <Checkbox
                                  checked={getRolePermissions(rn)[resource]?.includes(action)}
                                  onCheckedChange={() =>
                                    !isDisabled && handleToggle(roleObj, resource, action)
                                  }
                                  disabled={isDisabled}
                                  className={cn(
                                    isStatic && 'opacity-40 grayscale cursor-not-allowed',
                                    isOwner &&
                                      'data-[checked]:bg-muted data-[checked]:text-muted-foreground data-[checked]:border-muted',
                                  )}
                                />
                              </div>
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    ))}
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldAlert className="h-4 w-4 text-amber-500" />
          {t.roles.ownerNote}
        </div>
      </CardContent>
    </Card>
  )
}
