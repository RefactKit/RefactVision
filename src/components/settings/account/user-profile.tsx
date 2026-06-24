import { useAuth } from '@better-auth-ui/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { type SyntheticEvent, useState } from 'react'
import { toast } from 'sonner'
import { ImageUpload } from '@/components/shared/image-upload'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Field, FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import { updateUser as updateUserFn } from '@/server/auth-fns'
import { useSession } from '../../../../lib/auth-client'

interface UserProfileProps {
  className?: string
}

export function UserProfile({ className }: UserProfileProps) {
  const { localization } = useAuth()
  const { data: session, refetch } = useSession()
  const router = useRouter()
  const queryClient = useQueryClient()

  const [imageUrl, setImageUrl] = useState<string | undefined>(session?.user.image || undefined)

  const { mutate: updateProfile, isPending } = useMutation({
    mutationFn: (data: { name?: string; imageUrl?: string }) =>
      updateUserFn({ data } as Parameters<typeof updateUserFn>[0]),
    onError: (error: { message?: string }) => toast.error(error.message || 'An error occurred'),
    onSuccess: async () => {
      toast.success(localization.settings.profileUpdatedSuccess)
      await refetch()
      queryClient.invalidateQueries()
      router.invalidate()
    },
  })

  const [fieldErrors, setFieldErrors] = useState<{ name?: string }>({})

  function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    updateProfile({ name, imageUrl })
  }

  return (
    <div>
      <h2 className="text-sm font-semibold mb-3">{localization.settings.profile}</h2>

      <form onSubmit={handleSubmit}>
        <Card className={cn(className)}>
          <CardContent className="flex flex-col gap-6">
            {/* Avatar display */}
            <Field>
              <Label>{localization.settings.avatar}</Label>
              <div className="flex items-center gap-6">
                <ImageUpload
                  name={session?.user.name || 'User'}
                  defaultValue={session?.user.image || undefined}
                  onUploadSuccess={(url) => setImageUrl(url)}
                  bucket="avatars"
                />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Profile Photo</p>
                  <p className="text-xs text-muted-foreground">
                    This photo will be visible to other members of your organizations. Max size 2MB.
                  </p>
                </div>
              </div>
            </Field>

            {/* Name */}
            <Field data-invalid={!!fieldErrors.name}>
              <Label htmlFor="name">{localization.auth.name}</Label>
              {session ? (
                <Input
                  key={session?.user.name}
                  id="name"
                  name="name"
                  autoComplete="name"
                  defaultValue={session?.user.name}
                  placeholder={localization.auth.name}
                  disabled={isPending}
                  required
                  onChange={() => setFieldErrors((p) => ({ ...p, name: undefined }))}
                  onInvalid={(e) => {
                    e.preventDefault()
                    setFieldErrors((p) => ({
                      ...p,
                      name: (e.target as HTMLInputElement).validationMessage,
                    }))
                  }}
                  aria-invalid={!!fieldErrors.name}
                />
              ) : (
                <Skeleton>
                  <Input className="invisible" />
                </Skeleton>
              )}
              <FieldError>{fieldErrors.name}</FieldError>
            </Field>
          </CardContent>

          <CardFooter>
            <Button type="submit" size="sm" disabled={isPending || !session}>
              {isPending && <Spinner />}
              {localization.settings.saveChanges}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
