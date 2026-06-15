# Security Policy — RefactKit 🔒

RefactKit is built with **OWASP-compliant security** as a first-class concern. This document details the security architecture, hardening measures, responsible disclosure process, and production checklist.

---

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | ✅ Active support   |
| < 1.0   | ❌ Not supported    |

---

## Reporting a Vulnerability

If you discover a security vulnerability in RefactKit, **please report it responsibly**.

- **Email**: [security@refactkit.com](mailto:security@refactkit.com)
- **Response time**: We aim to acknowledge reports within **48 hours** and provide a resolution timeline within **5 business days**.
- **Scope**: Authentication, authorization, session management, data isolation, storage access, CSRF, XSS, and injection vulnerabilities.
- **Out of scope**: Supabase infrastructure vulnerabilities (report to [Supabase Security](https://supabase.com/security)), third-party dependency CVEs (report upstream).

> **Do NOT open a public GitHub issue for security vulnerabilities.** Use the email above.

---

## Authentication Security

RefactKit uses **Better Auth** (v1.6+) with a hardened, self-hosted configuration. All controls are defined in `lib/auth.ts`.

### Password Policy

| Control | Value | Rationale |
|---|---|---|
| Minimum length | **12 characters** | NIST SP 800-63B recommendation |
| Maximum length | **128 characters** | Prevents bcrypt/scrypt long-password DoS attacks |
| Hashing algorithm | **scrypt** | Better Auth default — memory-hard, GPU-resistant |
| Email verification | **Required** | Prevents account creation with unverified emails |

### Account Enumeration Prevention

The sign-up endpoint **always returns `200 OK`** regardless of whether the email is new or already registered. When a duplicate sign-up is attempted:

1. The API returns an identical success response (no information leakage).
2. The real account owner receives a security alert email via `onExistingUserSignUp`.
3. The UI shows the same "Check your inbox" screen in both cases.

This behavior is enabled by `requireEmailVerification: true`.

### Brute Force Protection

Rate limiting is enabled on all authentication endpoints with **database-backed storage** (persists across serverless cold starts):

| Endpoint | Window | Max Requests |
|---|---|---|
| `/api/auth/sign-in/email` | 60 seconds | 5 |
| `/api/auth/sign-up/email` | 60 seconds | 3 |
| `/api/auth/forget-password` | 60 seconds | 3 |

```typescript
rateLimit: {
  enabled: true,
  storage: 'database', // Survives Vercel/serverless restarts
  customRules: { ... }
}
```

### Password Reset

| Control | Value |
|---|---|
| Token expiry | **30 minutes** (default is 1 hour) |
| Token type | Single-use, cryptographically random |
| Session revocation | **All existing sessions are revoked** on password reset |
| UI behavior | "Check your inbox" shown regardless of email existence |

---

## Session Security

### Session Lifecycle

| Parameter | Value | Description |
|---|---|---|
| `expiresIn` | **7 days** | Maximum session lifetime |
| `updateAge` | **24 hours** | Session token refreshed every 24h |
| `cookieCache.maxAge` | **5 minutes** | Encrypted client-side cache — eliminates DB queries for 5 min windows |
| `cookieCache.strategy` | **JWE** | AES-256-GCM encryption — session data is encrypted, not just signed |

### Cookie Configuration

| Attribute | Value | Purpose |
|---|---|---|
| `HttpOnly` | ✅ | Prevents JavaScript access (XSS protection) |
| `Secure` | ✅ | HTTPS-only transmission |
| `SameSite` | `Lax` | CSRF protection while allowing top-level navigations |
| `Path` | `/` | Available across all routes |

### Session Revocation

Sessions are automatically revoked in these scenarios:
- User resets their password → **all sessions revoked**
- User deletes their account → **all sessions and data deleted**
- Admin removes a member from an organization → membership invalidated on next request

---

## CSRF Protection

Better Auth provides multi-layer CSRF protection:

1. **Origin validation**: Requests are checked against `trustedOrigins` in `lib/auth.ts`.
2. **Fetch Metadata**: Modern browsers send `Sec-Fetch-Site` headers — Better Auth validates these automatically.
3. **Cookie SameSite**: `Lax` prevents cross-origin form submissions.

### Trusted Origins

```typescript
trustedOrigins: [
  'https://refactkit.com',
  ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
]
```

> **Production action**: Update `trustedOrigins` with your actual production domain(s).

---

## Multi-Tenancy & Data Isolation

### Tenant Isolation Model

RefactKit uses a **shared database, schema-level isolation** model. Every tenant-scoped table includes an `organizationId` foreign key with `ON DELETE CASCADE`.

### Authorization Enforcement

Every server function (`src/server/*.ts`) follows a **3-step security pattern**:

```
1. Zod Validation    → Validate input shape and types
2. Authentication    → getSession(headers) — verify the user is logged in
3. Authorization     → Query `member` table — verify org membership + role
```

**No data is ever returned without verifying the user belongs to the target organization.**

### RBAC — Role-Based Access Control

| Resource → Action | Member | Admin | Owner |
|---|:---:|:---:|:---:|
| `dashboard:read` | ✅ | ✅ | ✅ |
| `member:read` | — | ✅ | ✅ |
| `member:create` | — | ✅ | ✅ |
| `member:update` | — | ✅ | ✅ |
| `member:delete` | — | — | ✅ |
| `invitation:create` | — | ✅ | ✅ |
| `organization:update` | — | — | ✅ |
| `organization:delete` | — | — | ✅ |

### Owner Protection

Better Auth prevents removing the last owner of an organization. Ownership must be transferred before the current owner can leave or be removed.

### Organization Limits

| Limit | Value |
|---|---|
| Max organizations per user | **5** |
| Max members per organization | **100** |
| Invitation expiry | **7 days** |

---

## Storage Security

### Upload Workflow

All file uploads are processed **server-side only** via `src/server/storage-fns.ts`. The `SUPABASE_SERVICE_ROLE_KEY` **never** reaches the client bundle.

### Upload Validation

| Check | Value |
|---|---|
| Maximum file size | **2 MB** |
| Filename | Randomly generated (`Math.random().toString(36)`) — prevents path traversal |
| Content type | Passed from `file.type` to Supabase `contentType` |
| Authentication | Session required — unauthenticated uploads are rejected |

### Supabase Storage Policies

The `avatars` bucket uses a public read policy for serving images, but **write access is restricted to the service role key** (server-only):

```sql
-- Public read access
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Writes happen via service role key (server-side only) — no client-side writes
```

---

## Audit Logging

RefactKit logs sensitive events via `databaseHooks` in `lib/auth.ts`:

| Event | Log Format |
|---|---|
| Session creation | `[AUDIT] New session created for user: {userId}` |
| Email change | `[AUDIT] Email changed for user {id}: {old} → {new}` |
| Invitation sent | `Sending invitation email to: {email} for org: {name}` |

### Production Recommendation

In production, forward `[AUDIT]` logs to a log aggregator (e.g., Datadog, Axiom, Vercel Logs) for persistent audit trails. The current implementation uses `console.log` which is sufficient for development and Vercel Function Logs.

---

## IP Address Tracking

Behind reverse proxies (Vercel, Cloudflare), the real client IP is extracted from the `x-forwarded-for` header:

```typescript
advanced: {
  ipAddress: {
    ipAddressHeaders: ['x-forwarded-for'],
  },
}
```

IP addresses are stored with sessions for security auditing and suspicious activity detection.

---

## Background Task Safety

Email sending uses a platform-aware `waitUntil` handler to prevent:
- **Timing attacks**: Response time doesn't vary based on whether an email was sent.
- **Dropped tasks**: On serverless platforms, background work completes even after the response is sent.

```typescript
backgroundTasks: {
  handler: (promise) => {
    if (typeof globalThis.waitUntil === 'function') {
      globalThis.waitUntil(promise)
    }
  },
}
```

---

## Email Security

### Default Provider: Resend

RefactKit ships with **Resend** as the default transactional email provider via API (`lib/email.ts`). The `.env.example` also includes SMTP configuration variables as a base fallback — you can switch to any SMTP-compatible provider (Mailgun, SendGrid, Amazon SES, or your own SMTP server) by modifying `lib/email.ts` to use Nodemailer with the `SMTP_*` environment variables.

### Transactional Emails Sent

| Email | Trigger | Template Location |
|---|---|---|
| Email verification | User signs up | `lib/auth.ts` → `emailVerification.sendVerificationEmail` |
| Password reset | User requests reset | `lib/auth.ts` → `emailAndPassword.sendResetPassword` |
| Sign-up alert | Duplicate email sign-up | `lib/auth.ts` → `emailAndPassword.onExistingUserSignUp` |
| Invitation | Admin/Owner invites member | `lib/auth.ts` → `organization.sendInvitationEmail` |

### Email Security Best Practices

- **Domain verification**: Configure SPF, DKIM, and DMARC records for your sending domain to prevent spoofing.
- **`EMAIL_FROM`**: Always use a verified domain — never send from free email providers.
- **Rate limiting**: Resend applies its own rate limits — monitor your Resend dashboard for bounces and complaints.

---

## Environment Variable Security

### Secret Management

| Variable | Sensitivity | Notes |
|---|---|---|
| `BETTER_AUTH_SECRET` | 🔴 **Critical** | Session encryption key — generate with `openssl rand -base64 32`. Never commit to version control. |
| `SUPABASE_SERVICE_ROLE_KEY` | 🔴 **Critical** | Full database + storage access — server-side only, never expose to client. |
| `DATABASE_URL` | 🔴 **Critical** | Direct database access — use Supabase connection pooler (port 6543). |
| `RESEND_API_KEY` | 🟡 **Sensitive** | Can send emails on your behalf — rotate if compromised. |
| `BETTER_AUTH_API_KEY` | 🟡 **Sensitive** | Admin dashboard access — restrict to authorized personnel. |

### Vite Client Exposure

Only variables prefixed with `VITE_` are exposed to the client bundle:
- `VITE_SUPABASE_URL` — Public project URL (safe to expose)
- `VITE_APP_URL` — Application base URL (safe to expose)

> ⚠️ **Never prefix a secret with `VITE_`** — it will be bundled into client-side JavaScript.

---

## Production Security Checklist

Before deploying to production, verify the following:

- [ ] `BETTER_AUTH_SECRET` is a strong, unique 32+ character string
- [ ] `trustedOrigins` in `lib/auth.ts` contains only your actual production domain(s)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set only in server environment variables (never in client/VITE_ prefixed)
- [ ] Email domain (SPF, DKIM, DMARC) is properly configured
- [ ] `EMAIL_FROM` uses your verified domain
- [ ] Supabase RLS policies are reviewed for custom tables
- [ ] Rate limiting is tested and appropriate for your traffic
- [ ] Database connection uses the pooler endpoint (port 6543) for serverless
- [ ] All `[AUDIT]` logs are forwarded to a persistent log storage
- [ ] Invitation, password reset, and verification emails are customized with your branding
- [ ] HTTPS is enforced (Vercel does this automatically)
- [ ] `prepare: false` is set in the database connection (required for Supabase pooler)

---

## Database Security

### Connection Security

| Setting | Value | Reason |
|---|---|---|
| SSL | `require` | Encrypted connection to Supabase PostgreSQL |
| `prepare: false` | Required | Supabase transaction pooler doesn't support prepared statements |
| Connection pooling | `max: 10` | Prevents connection exhaustion in serverless |
| Idle timeout | `20 seconds` | Releases unused connections promptly |

### Supabase Row Level Security (RLS)

RefactKit uses **application-level security** (server functions validate membership) rather than RLS for tenant isolation. If you enable Supabase RLS for additional defense-in-depth, ensure your policies allow the service role to bypass them for server-side operations.

---

## Dependency Security

- Run `pnpm audit` regularly to check for known vulnerabilities.
- Pin critical dependencies (`nitro`, `better-auth`, `@tanstack/react-start`) — version mismatches can introduce SSR security issues.
- Review Better Auth changelogs before updating — new versions may introduce database schema changes.

---

## License

This security policy applies to the RefactKit boilerplate. MIT License — see [LICENSE](LICENSE).
