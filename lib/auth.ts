import { dash, sentinel } from '@better-auth/infra'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin, multiSession, openAPI, organization } from 'better-auth/plugins'
import { createAccessControl } from 'better-auth/plugins/access'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { eq } from 'drizzle-orm'
import React from 'react'
import { db } from '../db/index'
import * as schema from '../db/schema'
import { InvitationEmail } from '../src/emails/invitation'
import { ResetPassword } from '../src/emails/reset-password'
import { SecurityAlert } from '../src/emails/security-alert'
import { VerifyEmail } from '../src/emails/verify-email'
import { createNotification, notifyOrgAdmins } from '../src/server/notification-helpers'
import { sendEmail } from './email'
import { getBaseURL } from './env'

const ac = createAccessControl({
  dashboard: ['read'],
  member: ['read', 'create', 'update', 'delete'],
  invitation: ['read', 'create', 'update', 'delete', 'cancel'],
  organization: ['update', 'delete'],
  project: ['create', 'read', 'update', 'delete'],
  role: ['create', 'read', 'update', 'delete'],
  ac: ['create', 'read', 'update', 'delete'],
})

const memberRole = ac.newRole({
  dashboard: ['read'],
  member: [],
  invitation: [],
  project: ['create', 'read', 'update'],
})

const adminRole = ac.newRole({
  dashboard: ['read'],
  member: ['read', 'create', 'update'],
  invitation: ['read', 'create', 'delete', 'cancel'],
  project: ['create', 'read', 'update', 'delete'],
  ac: ['read'],
})

const ownerRole = ac.newRole({
  dashboard: ['read'],
  member: ['read', 'create', 'update', 'delete'],
  invitation: ['read', 'create', 'update', 'delete', 'cancel'],
  organization: ['update', 'delete'],
  project: ['create', 'read', 'update', 'delete'],
  role: ['create', 'read', 'update', 'delete'],
  ac: ['create', 'read', 'update', 'delete'],
})

export const auth = betterAuth({
  appName: process.env.APP_NAME || 'RefactKit',
  baseURL: getBaseURL(),
  experimental: {
    joins: true,
  },
  secret: process.env.BETTER_AUTH_SECRET,
  trustHost: true,
  trustedOrigins: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://refact-kit-multitenancy.vercel.app', // Your actual production domain
    'https://refactkit.com',
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
  ],

  database: drizzleAdapter(db, { provider: 'pg', schema }),

  user: {
    deleteUser: {
      enabled: true,
    },

    additionalFields: {
      imageUrl: {
        type: 'string',
        defaultValue: '',
        required: false,
        input: false,
      },
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: process.env.ENABLE_EMAIL_VERIFICATION !== 'false',
    customSyntheticUser: ({ coreFields, additionalFields, id }) => ({
      ...coreFields,
      role: 'user',
      banned: false,
      banReason: null,
      banExpires: null,
      ...additionalFields,
      id,
    }),
    revokeSessionsOnPasswordReset: true,
    minPasswordLength: 11,
    maxPasswordLength: 128, // Prevent DoS via bcrypt long-password attacks
    resetPasswordTokenExpiresIn: 60 * 30, // 30 min (default is 1 hour)
    sendResetPassword: async ({ user, url }) => {
      sendEmail({
        to: user.email,
        subject: 'Reset your password',
        template: React.createElement(ResetPassword, { url }),
      })
    },
    // Called when someone tries to sign up with an already-registered email.
    // Because requireEmailVerification: true enables anti-enumeration mode,
    // the API always returns 200 OK — so we notify the real account owner instead.
    onExistingUserSignUp: async ({ user }) => {
      // If the user is not verified yet, they are likely retrying the signup process
      // or a double-submit occurred. We don't want to send a security alert in this case.
      if (!user.emailVerified) {
        return
      }

      const loginUrl = `${getBaseURL()}/login`
      sendEmail({
        to: user.email,
        subject: 'Sign-in attempt on your account',
        template: React.createElement(SecurityAlert, {
          userName: user.name || 'there',
          email: user.email,
          loginUrl,
        }),
      })
    },
    onPasswordReset: async ({ user }) => {
      // If a user successfully resets their password, they have proven ownership of the email.
      // We should mark them as verified to allow immediate sign-in.
      if (!user.emailVerified) {
        await db.update(schema.user).set({ emailVerified: true }).where(eq(schema.user.id, user.id))
      }
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
    linkedin: {
      clientId: process.env.LINKEDIN_CLIENT_ID || '',
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
      // Explicitly define standard OIDC scopes
      scope: ['openid', 'profile', 'email'],
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    },
    twitter: {
      clientId: process.env.TWITTER_CLIENT_ID || '',
      clientSecret: process.env.TWITTER_CLIENT_SECRET || '',
    },
    microsoft: {
      clientId: process.env.MICROSOFT_CLIENT_ID || '',
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
      tenantId: 'common',
      scope: ['openid', 'profile', 'email', 'User.Read'],
      prompt: 'select_account',
    },
  },

  account: {
    encryptOAuthTokens: true, // AES-256-GCM encryption for social tokens
    accountLinking: {
      enabled: true,
      trustedProviders: ['google', 'linkedin', 'github', 'twitter', 'microsoft'],
    },
  },

  // OWASP: Brute force protection — persistent DB storage survives Vercel restarts
  rateLimit: {
    enabled: true,
    customRules: {
      '/api/auth/sign-in/email': { window: 60, max: 5 },
      '/api/auth/sign-up/email': { window: 60, max: 3 },
      '/api/auth/forget-password': { window: 60, max: 3 },
    },
  },

  // Session with encrypted cookie cache — reduces DB queries, JWE = encrypted
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh every 24h
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 min client-side cache
      strategy: 'jwe', // AES-256-GCM encrypted — safest for SaaS
    },
    additionalFields: {
      provider: {
        type: 'string',
        required: false,
      },
    },
  },

  // OWASP: Audit logging for sensitive user/session events
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          return {
            data: {
              ...session,
              provider: session.provider || 'password',
            },
          }
        },
        after: async (session) => {
          if (session?.userId) {
            console.log(`[AUDIT] New session created for user: ${session.userId}`)
          }
        },
      },
    },
    user: {
      create: {
        after: async (user) => {
          // Field Consistency: Sync social 'image' to custom 'imageUrl' on first login
          if (user.image) {
            await db
              .update(schema.user)
              .set({ imageUrl: user.image })
              .where(eq(schema.user.id, user.id))
          }
        },
      },
      update: {
        after: async ({ data, oldData }) => {
          if (data && oldData?.email !== data.email) {
            console.log(
              `[AUDIT] Email changed for user ${data.id}: ${oldData?.email} → ${data.email}`,
            )
          }
        },
      },
    },
  },

  advanced: {
    useSecureCookies: process.env.NODE_ENV === 'production',
    backgroundTasks: {
      handler: (promise) => {
        // Platform-specific handler
        // Vercel/Nitro support waitUntil
        const globalWithWaitUntil = globalThis as typeof globalThis & {
          waitUntil?: (p: Promise<unknown>) => void
        }
        if (typeof globalWithWaitUntil.waitUntil === 'function') {
          globalWithWaitUntil.waitUntil(promise)
        }
      },
    },
    // Vercel sits behind a proxy — read real client IP from forwarded header
    ipAddress: {
      ipAddressHeaders: ['x-forwarded-for'],
    },
  },

  emailVerification: {
    sendOnSignUp: process.env.ENABLE_EMAIL_VERIFICATION !== 'false',
    autoSignIn: true,
    sendVerificationEmail: async ({ user, url }) => {
      if (process.env.ENABLE_EMAIL_VERIFICATION === 'false') return
      console.log(`Sending verification email to: ${user.email}`)
      sendEmail({
        to: user.email,
        subject: 'Verify your email address',
        template: React.createElement(VerifyEmail, { url }),
      })
    },
  },

  plugins: [
    dash(),
    admin(),
    organization({
      dynamicAccessControl: { enabled: true },
      organizationLimit: 5,
      membershipLimit: 100,
      allowUserToCreateOrganization: false, // Enforced via server-side logic in org-fns.ts
      invitationExpiresIn: 60 * 60 * 24 * 7, // 7 days (default is 48h — better UX)
      ac,
      roles: {
        member: memberRole,
        admin: adminRole,
        owner: ownerRole,
      },
      sendInvitationEmail: async (data) => {
        console.log(`Sending invitation email to: ${data.email} for org: ${data.organization.name}`)
        const acceptUrl = `${getBaseURL()}/accept-invite?id=${data.invitation.id}`
        sendEmail({
          to: data.email,
          subject: `Join ${data.organization.name} on RefactVision`,
          template: React.createElement(InvitationEmail, {
            orgName: data.organization.name,
            inviterName: data.inviter.user.name || 'Someone',
            url: acceptUrl,
            orgLogo: data.organization.logo || undefined,
          }),
        })
      },
      organizationHooks: {
        afterCreateInvitation: async ({ invitation, inviter, organization }) => {
          // → Notify the INVITEE: "[Inviter] invited you to join [Org]"
          await createNotification({
            recipientEmail: invitation.email,
            type: 'invitation_received',
            actorId: inviter?.user?.id,
            actorName: inviter?.user?.name,
            actorImage: inviter?.user?.image,
            organizationId: organization.id,
            organizationName: organization.name,
            metadata: { role: invitation.role || 'member' },
          })
        },
        afterAcceptInvitation: async ({ _invitation, _member, user, organization }) => {
          // → Notify ORG ADMINS: "[User] joined [Org]"
          await notifyOrgAdmins({
            organizationId: organization.id,
            excludeUserId: user.id,
            type: 'member_joined',
            actorId: user.id,
            actorName: user.name,
            actorImage: user.image,
            organizationName: organization.name,
          })
        },
        afterRejectInvitation: async ({ invitation, user, organization }) => {
          // → Notify the INVITER: "[User] declined the invitation to [Org]"
          await createNotification({
            recipientId: invitation.inviterId,
            type: 'invitation_rejected',
            actorId: user.id,
            actorName: user.name,
            organizationId: organization.id,
            organizationName: organization.name,
          })
        },
        afterAddMember: async ({ _member, user, organization }) => {
          // → Notify the NEW MEMBER: "You were added to [Org]"
          await createNotification({
            recipientId: user.id,
            type: 'member_added',
            organizationId: organization.id,
            organizationName: organization.name,
          })
        },
        afterRemoveMember: async ({ _member, user, organization }) => {
          // → Notify the REMOVED MEMBER: "You were removed from [Org]"
          await createNotification({
            recipientId: user.id,
            type: 'member_removed',
            organizationId: organization.id,
            organizationName: organization.name,
          })
        },
        afterUpdateMemberRole: async ({ member, previousRole, user, organization }) => {
          // → Notify the MEMBER: "Your role changed to [role] in [Org]"
          await createNotification({
            recipientId: user.id,
            type: 'role_changed',
            organizationId: organization.id,
            organizationName: organization.name,
            metadata: { newRole: member.role, previousRole: previousRole || '' },
          })
        },
      },
    }),
    openAPI({
      path: '/openapi.json',
      nonce: process.env.OPENAPI_NONCE || 'refactVision-openapi-nonce',
    }),
    multiSession(),
    sentinel(),
    tanstackStartCookies(),
  ], // must be last
})
