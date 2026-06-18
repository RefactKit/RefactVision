import { sentinelClient } from '@better-auth/infra/client'
import {
  adminClient,
  inferAdditionalFields,
  multiSessionClient,
  organizationClient,
} from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'
import { getBaseURL } from '@/lib/base-url'
import type { auth } from './auth'

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  plugins: [
    adminClient(),
    organizationClient({
      dynamicAccessControl: { enabled: true },
    }),
    sentinelClient(),
    multiSessionClient(),
    inferAdditionalFields<typeof auth>(),
  ],
})

declare module '@better-auth-ui/react' {
  interface AuthConfig {
    AuthClient: typeof authClient
  }
}

export const { signIn, signUp, signOut, useSession } = authClient
