import { Crown, Shield, User } from '@phosphor-icons/react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Link2, Mail, Plus, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { ForbiddenContent } from '@/components/shared/forbidden-content'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useI18n } from '@/i18n/context'
import { authClient } from '../../../../../lib/auth-client'
import { Route as OrgRoute } from './route'

export const Route = createFileRoute('/_app/organizations/$slug/members')({
  component: MembersPage,
})

function MembersPage() {
  const { t } = useI18n()
  const { org, role } = OrgRoute.useLoaderData()
  const queryClient = useQueryClient()
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('member')

  const { data: sessionData } = authClient.useSession()

  const { data, isLoading } = useQuery({
    queryKey: ['org-members', org.id],
    enabled: role !== 'member',
    queryFn: async () => {
      await authClient.organization.setActive({ organizationId: org.id })
      const { data } = await authClient.organization.getFullOrganization()
      return data
    },
  })

  // Render forbidden state if user is just a member
  if (role === 'member') {
    return <ForbiddenContent />
  }

  const members = data?.members ?? []
  const invitations = data?.invitations ?? []

  const handleInvite = async () => {
    if (!inviteEmail) return
    const { error } = await authClient.organization.inviteMember({
      email: inviteEmail,
      role: inviteRole as 'member' | 'admin' | 'owner',
      organizationId: org.id,
    })

    if (error) {
      toast.error(error.message || 'Failed to send invite')
      return
    }

    toast.success('Invite sent successfully')
    setInviteEmail('')
    queryClient.invalidateQueries({ queryKey: ['org-members', org.id] })
  }

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    const { error } = await authClient.organization.updateMemberRole({
      memberId,
      role: newRole as 'member' | 'admin' | 'owner',
    })

    if (error) {
      toast.error(error.message || 'Failed to update role')
      return
    }

    toast.success('Role updated successfully')
    queryClient.invalidateQueries({ queryKey: ['org-members', org.id] })
  }

  const handleRemove = async (id: string, status: string) => {
    if (status === 'invited') {
      const { error } = await authClient.organization.cancelInvitation({
        invitationId: id,
      })
      if (error) {
        toast.error(error.message || 'Failed to cancel invitation')
        return
      }
      toast.success('Invitation cancelled successfully')
    } else {
      const { error } = await authClient.organization.removeMember({
        memberIdOrEmail: id,
      })
      if (error) {
        toast.error(error.message || 'Failed to remove member')
        return
      }
      toast.success('Member removed successfully')
    }
    queryClient.invalidateQueries({ queryKey: ['org-members', org.id] })
  }

  const allUsers = [
    ...members.map((m) => ({
      ...m,
      name: m.user?.name || m.userId,
      email: m.user?.email || '',
      status: 'member',
    })),
    ...invitations
      .filter((i) => i.status === 'pending' && !members.some((m) => m.user?.email === i.email))
      .map((i) => ({ id: i.id, name: '-', email: i.email, role: i.role, status: 'invited' })),
  ]

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{t.members.title}</h1>
        <p className="text-muted-foreground mt-2">{t.members.subtitle}</p>
      </div>

      {/* Invite Cards Grid - Only visible to Admin/Owner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Invite by Email */}
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <Mail className="size-4 text-primary" />
              <CardTitle className="text-lg">Invite by Email</CardTitle>
            </div>
            <CardDescription>
              Invite a new member to join your organization via email.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Input
                placeholder="Email address"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={inviteRole} onValueChange={(val) => setInviteRole(val ?? '')}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {/* Owners can invite anyone, Admins can only invite up to Admin */}
                  {role === 'owner' && (
                    <SelectItem value="owner">{t.members.roles.owner}</SelectItem>
                  )}
                  <SelectItem value="admin">{t.members.roles.admin}</SelectItem>
                  <SelectItem value="member">{t.members.roles.member}</SelectItem>
                </SelectContent>
              </Select>
              <Button className="shrink-0" onClick={handleInvite}>
                <UserPlus className="size-4 mr-2" />
                Invite
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Invite by Link */}
        <Card className="flex flex-col border-dashed opacity-60">
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <Link2 className="size-4 text-primary" />
              <CardTitle className="text-lg">Invite by Link</CardTitle>
            </div>
            <CardDescription>
              Generate a unique invite link to share with your team.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                readOnly
                placeholder="Invite link will appear here..."
                className="bg-muted/50"
              />
              <Button variant="outline" disabled>
                <Plus className="size-4 mr-2" />
                Create Link
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Members</CardTitle>
          <CardDescription>A list of all users currently in this organization.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 py-2 border-b">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/6" />
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 py-4 border-b">
                  <Skeleton className="h-5 w-1/4" />
                  <Skeleton className="h-5 w-1/4" />
                  <Skeleton className="h-8 w-[130px]" />
                  <Skeleton className="h-5 w-1/6" />
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.members.name}</TableHead>
                  <TableHead>{t.members.email}</TableHead>
                  <TableHead>{t.members.role}</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allUsers.map((member) => {
                  const isSelf = member.userId === sessionData?.user?.id
                  const isOwner = member.role === 'owner'

                  // Role change permissions:
                  // 1. Cannot modify own role
                  // 2. Admins cannot modify owners
                  const canChangeRole =
                    member.status === 'member' &&
                    !isSelf &&
                    (role === 'owner' || (role === 'admin' && !isOwner))

                  return (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarImage
                              src={member.user?.image || undefined}
                              className="object-cover"
                            />
                            <AvatarFallback className="text-[10px]">
                              {member.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {member.name}
                        </div>
                      </TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>
                        {canChangeRole ? (
                          <Select
                            defaultValue={member.role}
                            onValueChange={(val) => handleUpdateRole(member.id, val)}
                          >
                            <SelectTrigger className="h-8 w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {role === 'owner' && (
                                <SelectItem value="owner">
                                  <Badge
                                    variant="outline"
                                    className="text-[11px] px-2 py-0 h-6 gap-1 bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/20"
                                  >
                                    <Crown weight="duotone" className="size-3 shrink-0" />
                                    {t.members.roles.owner}
                                  </Badge>
                                </SelectItem>
                              )}
                              <SelectItem value="admin">
                                <Badge
                                  variant="outline"
                                  className="text-[11px] px-2 py-0 h-6 gap-1 bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-500/15 dark:text-cyan-400 dark:border-cyan-500/20"
                                >
                                  <Shield weight="duotone" className="size-3 shrink-0" />
                                  {t.members.roles.admin}
                                </Badge>
                              </SelectItem>
                              <SelectItem value="member">
                                <Badge
                                  variant="outline"
                                  className="text-[11px] px-2 py-0 h-6 gap-1 bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/15 dark:text-slate-400 dark:border-slate-500/20"
                                >
                                  <User weight="duotone" className="size-3 shrink-0" />
                                  {t.members.roles.member}
                                </Badge>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge
                            variant="outline"
                            className={`text-[11px] px-2 py-0 h-6 gap-1 ${
                              member.role === 'owner'
                                ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/20'
                                : member.role === 'admin'
                                  ? 'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-500/15 dark:text-cyan-400 dark:border-cyan-500/20'
                                  : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/15 dark:text-slate-400 dark:border-slate-500/20'
                            }`}
                          >
                            {member.role === 'owner' && (
                              <Crown weight="duotone" className="size-3 shrink-0" />
                            )}
                            {member.role === 'admin' && (
                              <Shield weight="duotone" className="size-3 shrink-0" />
                            )}
                            {member.role === 'member' && (
                              <User weight="duotone" className="size-3 shrink-0" />
                            )}
                            {t.members.roles[member.role as keyof typeof t.members.roles]}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            member.status === 'member'
                              ? 'success'
                              : member.status === 'invited'
                                ? 'secondary'
                                : 'destructive'
                          }
                          className="capitalize"
                        >
                          {member.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {(role === 'owner' || (role === 'admin' && member.role !== 'owner')) &&
                          !isSelf && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemove(member.id, member.status)}
                            >
                              Remove
                            </Button>
                          )}
                      </TableCell>
                    </TableRow>
                  )
                })}
                {allUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                      No members found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
