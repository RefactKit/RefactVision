import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { Loader2, UserPlus } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { authClient } from '../../lib/auth-client'

export const Route = createFileRoute('/accept-invite')({
  validateSearch: (search: Record<string, unknown>): { id?: string; accept?: boolean } => {
    return {
      id: search.id as string | undefined,
      accept: search.accept === true || search.accept === 'true',
    }
  },
  loaderDeps: ({ search: { id, accept } }) => ({ id, accept }),
  loader: async ({ deps: { id, accept } }) => {
    if (!id) {
      throw redirect({ to: '/' })
    }
    return { id, accept }
  },
  component: AcceptInvitePage,
})

function AcceptInvitePage() {
  const { id, accept: shouldAutoAccept } = Route.useLoaderData()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [isAccepting, setIsAccepting] = useState(false)
  const [isVerifying, setIsVerifying] = useState(true)
  const [session, setSession] = useState<any>(null)
  const hasAttemptedAutoAccept = useRef(false)

  const handleAcceptAction = useCallback(async () => {
    setIsAccepting(true)
    setError(null)

    const { data: sessionData } = await authClient.getSession()

    if (!sessionData?.session) {
      // Not logged in. Redirect to login.
      const returnUrl = `/accept-invite?id=${id}&accept=true`
      navigate({
        to: '/login',
        search: { callbackURL: returnUrl },
      })
      return
    }

    const { error: acceptError } = await authClient.organization.acceptInvitation({
      invitationId: id,
    })

    if (acceptError) {
      if (acceptError.message?.includes('already a member')) {
        toast.success('You are already a member of this organization.')
        navigate({ to: '/dashboard' })
        return
      }
      setError(acceptError.message || 'Failed to accept invitation. It may have expired.')
      toast.error(acceptError.message || 'Failed to accept invitation.')
      setIsAccepting(false)
    } else {
      toast.success('Invitation accepted successfully!')
      navigate({ to: '/dashboard' })
    }
  }, [id, navigate])

  // Verify session on mount and trigger auto-accept if needed
  useEffect(() => {
    async function init() {
      const { data } = await authClient.getSession()
      const currentSession = data?.session || null
      setSession(currentSession)
      setIsVerifying(false)

      // Only attempt auto-accept once
      if (shouldAutoAccept && !hasAttemptedAutoAccept.current) {
        hasAttemptedAutoAccept.current = true
        if (currentSession) {
          handleAcceptAction()
        } else {
          // If no session but we were told to auto-accept,
          // the user probably needs to log in.
          const returnUrl = `/accept-invite?id=${id}&accept=true`
          navigate({
            to: '/login',
            search: { callbackURL: returnUrl },
          })
        }
      }
    }
    init()
  }, [shouldAutoAccept, handleAcceptAction, id, navigate])

  // If we are currently auto-accepting, show the loader
  if (isAccepting || (shouldAutoAccept && isVerifying)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm w-full p-8 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
          <Loader2 className="h-8 w-8 text-teal-600 animate-spin" />
          <h1 className="text-xl font-semibold dark:text-white">Joining organization...</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Finalizing your invitation, please wait.
          </p>
        </div>
      </div>
    )
  }

  if (isVerifying) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
        <Loader2 className="h-8 w-8 text-teal-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="flex flex-col items-center gap-6 text-center max-w-sm w-full p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
        <div className="h-16 w-16 rounded-full bg-teal-500/10 flex items-center justify-center">
          {error ? (
            <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
              <span className="text-red-600 text-2xl font-semibold">!</span>
            </div>
          ) : (
            <UserPlus className="h-8 w-8 text-teal-600" />
          )}
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold dark:text-white">
            {error ? 'Invitation Error' : 'Join Organization'}
          </h1>
          {error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              You have been invited to join an organization. Click the button below to accept and
              start collaborating.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full pt-2">
          {!error && (
            <Button
              size="lg"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold h-12"
              onClick={handleAcceptAction}
              disabled={isAccepting}
            >
              {isAccepting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Accepting...
                </>
              ) : (
                'Accept Invitation'
              )}
            </Button>
          )}

          <Button
            variant="ghost"
            className="w-full text-gray-500 hover:text-gray-700"
            onClick={() => navigate({ to: '/' })}
          >
            {error ? 'Go Home' : 'Maybe Later'}
          </Button>
        </div>

        {!session && !error && (
          <p className="text-[10px] text-gray-400 mt-2">
            You will be asked to sign in or create an account after clicking accept.
          </p>
        )}
      </div>
    </div>
  )
}
