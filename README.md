# RefactKit 🚀 — Multi-Tenant SaaS Boilerplate

![Edition](https://img.shields.io/badge/edition-Community-10b981?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)
![React](https://img.shields.io/badge/React-19-blue?logo=react&style=flat-square)
![Framework](https://img.shields.io/badge/TanStack-Start-orange?style=flat-square)
![Engine](https://img.shields.io/badge/Nitro-v3-green?style=flat-square)
![Auth](https://img.shields.io/badge/Better--Auth-1.6+-purple?style=flat-square)
![DB](https://img.shields.io/badge/Drizzle-ORM-yellow?style=flat-square)
![Deploy](https://img.shields.io/badge/Vercel-Ready-black?logo=vercel&style=flat-square)

> **RefactKit** is a production-ready, **full-stack SaaS boilerplate** — front-end UI *and* a scalable backend API — built on **React 19** and the **TanStack ecosystem** (Start, Router, Query, Form). It ships with authentication, organizations, RBAC, internationalization, and a premium design system — all wired together with end-to-end type safety and zero compromise on performance.

> [!NOTE]
> **RefactKit Community Edition** — free and open-source under the MIT license. Build with it, learn from it, share what you create. Contributions, bug reports, and showcases are warmly welcome. 🙌

## 🆓 Community (Free)
[![Open Source](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![RefactKit](https://img.shields.io/badge/RefactKit-Boilerplate-blue)](https://github.com/yourrepo/refactkit)

| Feature | Description |
|---------|-------------|
| 🔑 User Management | View, edit & manage all users |
| 📋 Audit Logs | Full auth event history |
| 🛡️ Security Monitoring | Real-time threat detection |
| 🗄️ Database Monitoring | Live DB health dashboard |
| 🏢 Organizations | Multi-tenant + team management |
| 🎨 Branding | Custom auth page theming |
| 🔄 Log Drains | Stream logs to your analytics stack |

---

**Table of Contents**

- [🌟 Introduction](#-introduction)
- [🚀 Quick Start](#-quick-start)
- [🛠️ Tech Stack](#️-tech-stack)
- [🏗️ Architecture](#️-architecture)
- [🔒 Authentication & Security](#-authentication--security)
- [👥 Roles & RBAC](#-roles--rbac)
- [💻 Frontend Architecture](#-frontend-architecture)
- [⚙️ Backend Architecture](#️-backend-architecture)
- [🗄️ Database & Schema](#️-database--schema)
- [🌐 Internationalization](#-internationalization)
- [📝 Forms & Design System](#-forms--design-system)
- [🧪 DevOps, Observability & Testing](#-devops-observability--testing)
- [💳 Payments & Billing (Pro)](#-payments--billing-pro)
- [🤖 AI-Assisted Development](#-ai-assisted-development)
- [📄 License](#-license)

---

## 🌟 Introduction

**RefactKit** is designed for developers building B2B platforms, B2C SaaS products, or internal tools that require workspace isolation. Every piece of data flows through an organization context, making tenant separation a first-class architectural concern rather than an afterthought.

### Core Philosophy

| Principle | How It's Enforced |
|---|---|
| **Multi-tenancy First** | Every data table includes `organizationId`. Server functions validate tenant membership before any query. |
| **Type-Safety Everywhere** | TypeScript strict mode, Drizzle typed SQL, Zod runtime validation, TanStack typed routes. |
| **Accessible by Default** | Base UI primitives ensure WAI-ARIA compliance. Semantic color tokens prevent hardcoded values. |
| **OWASP-Compliant Security** | Anti-enumeration, rate limiting, JWE-encrypted sessions, audit logging — all built in. |
| **Universal Deployment** | Nitro v3 engine targets Vercel, Cloudflare, Node.js, and AWS with a single build. |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+
- **pnpm** (recommended) — `npm install -g pnpm`
- **Supabase** account with a PostgreSQL project
- **Resend** account for transactional emails

### 1. Clone & Install

```bash
git clone https://github.com/your-org/refactkit-multitenancy.git
cd refactkit-multitenancy
pnpm install
```

### 2. Environment Variables — Where to Get Each Value

Copy `.env.example` to `.env.local`, then follow the steps below to retrieve each variable.

---

#### 🗄️ Supabase — `DATABASE_URL`, `VITE_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

1. Create a free project at **[supabase.com](https://supabase.com)** → **New Project**
2. Once created, go to **Project Settings → Database**
3. Scroll to **Connection string** → select **URI** tab → copy the **Transaction pooler** string (port `6543`) → this is your `DATABASE_URL`

```env
# ✅ Use port 6543 (Transaction pooler) — required for serverless/Vercel
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"
```

4. Go to **Project Settings → API**
   - Copy **Project URL** → `VITE_SUPABASE_URL`
   - Copy **`service_role` secret key** → `SUPABASE_SERVICE_ROLE_KEY`

```env
VITE_SUPABASE_URL="https://xxxxxxxxxxxx.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

> [!CAUTION]
> `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security. **Never expose it client-side.** Keep it server-only and never prefix it with `VITE_`.

📖 Supabase docs: [Database connection strings](https://supabase.com/docs/guides/database/connecting-to-postgres) · [API keys](https://supabase.com/docs/guides/api/api-keys)

---

#### 📧 Resend — `RESEND_API_KEY`, `EMAIL_FROM`

1. Create a free account at **[resend.com](https://resend.com)**
2. Go to **API Keys** → **Create API Key** → copy the key

```env
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
EMAIL_FROM="RefactKit <noreply@yourdomain.com>"
```

3. Verify your sending domain under **Domains** → add the provided DNS records (SPF, DKIM) to your DNS provider.

> [!NOTE]
> During development you can use Resend's sandbox — no domain verification required. For production, a verified domain is mandatory to avoid emails landing in spam.

📖 Resend docs: [Getting started](https://resend.com/docs/introduction) · [Domains](https://resend.com/docs/dashboard/domains/introduction)

---

#### 🔐 Better Auth — `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`

Generate a strong secret with:

```bash
openssl rand -base64 32
```

```env
BETTER_AUTH_SECRET="paste-the-output-here"
BETTER_AUTH_URL="http://localhost:3000"        # In production: https://yourdomain.com
```

> [!WARNING]
> Rotating `BETTER_AUTH_SECRET` in production invalidates **all existing sessions**. Plan any secret rotation accordingly.

##### 🧭 Better Auth Dashboard (Optional)

RefactKit ships with the `dash()` plugin from `@better-auth/infra`, which exposes a built-in admin panel to monitor users, sessions, and organizations.

| Mode | How to access | Use case |
|---|---|---|
| **Local dev** | `http://localhost:3000/api/auth/dashboard` | Inspect sessions during development |
| **Self-hosted** (Infra) | Deploy `@better-auth/infra` on your own server | Full control, no third-party |
| **Better Auth Cloud** | [better-auth.com](https://better-auth.com) | Managed dashboard, no setup needed |

```env
# Required to access the /api/auth/dashboard panel
BETTER_AUTH_API_KEY="ba_xxxxxxxxxxxxxxxxxxxxxxxx"
```

📖 Better Auth docs: [Dashboard plugin](https://better-auth.com/docs/plugins/admin) · [better-auth/infra](https://github.com/better-auth/infra)

---

#### Full `.env` Reference

| Variable | Required | Where to find it |
|---|:---:|---|
| `DATABASE_URL` | ✅ | Supabase → Project Settings → Database → Transaction pooler URI (port 6543) |
| `BETTER_AUTH_SECRET` | ✅ | Generate with `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | ✅ | Your app's public URL (`http://localhost:3000` in dev) |
| `RESEND_API_KEY` | ✅ | Resend → API Keys |
| `EMAIL_FROM` | ✅ | Your verified sender address (e.g. `App <noreply@yourdomain.com>`) |
| `VITE_SUPABASE_URL` | ✅ | Supabase → Project Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase → Project Settings → API → `service_role` key |
| `BETTER_AUTH_API_KEY` | ⚪ Optional | Better Auth dashboard → API Keys (only needed for admin panel) |
| `OPENAPI_NONCE` | ⚪ Optional | Static nonce for OpenAPI CSP |
| `VITE_APP_URL` | ⚪ Optional | Override base URL for the auth client (defaults to relative) |

---

### 3. Database Setup

```bash
# Push schema to Supabase (run after every schema change)
npx drizzle-kit push

# (Optional) Open visual database browser at https://local.drizzle.studio
npx drizzle-kit studio
```

📖 Drizzle docs: [drizzle-kit push](https://orm.drizzle.team/docs/drizzle-kit-push) · [Supabase + Drizzle guide](https://supabase.com/docs/guides/database/drizzle)

### 4. Supabase Storage

RefactKit requires two public buckets: `avatars` (for profiles) and `app-images` (for the gallery module).

In your **Supabase Dashboard → SQL Editor**, run:

```sql
-- Create the buckets (public read)
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('app-images', 'app-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access for both buckets
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id IN ('avatars', 'app-images'));
```

> [!TIP]
> You can also create these buckets visually in **Supabase Dashboard → Storage → New bucket**. Ensure both are set to **Public** and add the same SELECT policy.

### 5. Seed Gallery Images (Optional)

To test the gallery module, you can use the provided seeding script to upload 25 sample images:

```bash
# Set a valid Organization ID in your .env first
TEST_ORG_ID="your-org-id" 

# Run the upload script
node scripts/upload-images.js
```

### 6. Launch

```bash
pnpm dev    # → http://localhost:3000
```

---
## 🛠️ Tech Stack

### Core Framework
- **Runtime**: Node.js 22+  
- **Build/Server**: Nitro v3  
- **UI Framework**: React 19  
- **Type System**: TypeScript 5.x  

### Authentication
- **Identity Provider**: Better Auth (self-hosted)  
- **Database Adapter**: Supabase PostgreSQL  
- **Session Storage**: Encrypted cookies (JWE)  

### Data Layer
- **Database**: PostgreSQL (Supabase)  
- **ORM/Query Builder**: Drizzle ORM  
- **Storage**: Supabase Storage (S3-compatible)  

### Forms & State Management
- **Form Builder**: TanStack Form  
- **Validation**: Zod + Superforms  
- **Client State**: TanStack Query  

### UI Components
- **Base Primitives**: shadcn/ui built on Base UI — preset-based theming, fully customizable
- **Icon System**: Phosphor Icons + Lucide React
- **Design Tokens**: CSS variables via `@theme` (Tailwind CSS v4)

### Routing & Navigation
- **Type-Safe Router**: TanStack Router  

### Infrastructure & DevOps
- **Deployment**: Vercel (primary), Cloudflare, Node.js, AWS  
- **Package Manager**: pnpm  
- **Code Quality**: Biome (lint/format)  
- **Testing**: Vitest (unit), Playwright (E2E)  

## 🏗️ Architecture

### High-Level Design (HLD)

```mermaid
graph TB
    subgraph Client["Client — Browser"]
        UI["React 19 UI"]
        Router["TanStack Router"]
        Query["TanStack Query Cache"]
        Form["TanStack Form"]
    end

    subgraph Server["Server — Nitro v3"]
        SSR["SSR / Hydration"]
        SF["Server Functions<br/>(createServerFn)"]
        Auth["Better Auth<br/>Middleware"]
        Email["Resend<br/>Email Service"]
    end

    subgraph Data["Data Layer"]
        DB["PostgreSQL<br/>(Supabase)"]
        S3["Supabase Storage<br/>(S3-compatible)"]
        ORM["Drizzle ORM"]
    end

    UI --> Router
    Router --> Query
    Query --> SF
    Form --> SF
    SF --> Auth
    Auth --> ORM
    ORM --> DB
    SF --> S3
    Auth --> Email
    SSR --> SF
    SSR --> UI
```

### Low-Level Design (LLD) — Module Interaction

```mermaid
graph LR
    subgraph Routes["src/routes/"]
        AuthRoutes["_auth/<br/>login, signup,<br/>forgot-password"]
        AppRoutes["_app/<br/>dashboard, settings"]
        OrgRoutes["$slug/<br/>dashboard, members,<br/>gallery, settings"]
    end

    subgraph ServerFns["src/server/"]
        AuthFns["auth-fns.ts"]
        OrgFns["org-fns.ts"]
        DashFns["dashboard-fns.ts"]
        StorageFns["storage-fns.ts"]
        GalleryFns["gallery-fns.ts"]
        QueryKeys["query-keys.ts"]
    end

    subgraph Core["lib/"]
        AuthConfig["auth.ts<br/>(Better Auth config)"]
        AuthClient["auth-client.ts<br/>(Browser client)"]
        EmailLib["email.ts<br/>(Resend)"]
        EnvLib["env.ts"]
    end

    subgraph DB["db/"]
        Schema["schema.ts"]
        DBConn["index.ts<br/>(postgres.js pool)"]
    end

    AuthRoutes --> AuthFns
    AppRoutes --> OrgFns
    OrgRoutes --> DashFns & GalleryFns & StorageFns
    OrgFns --> AuthConfig
    AuthFns --> AuthConfig
    AuthConfig --> EmailLib
    AuthConfig --> DBConn
    OrgFns --> DBConn
    DashFns --> DBConn
    DBConn --> Schema
```

### Request Lifecycle — SSR + Hydration Flow

```mermaid
sequenceDiagram
    participant B as Browser
    participant N as Nitro v3 (SSR)
    participant R as TanStack Router
    participant SF as Server Function
    participant BA as Better Auth
    participant DB as PostgreSQL

    B->>N: GET /organizations/acme/dashboard
    N->>R: Match route → _app/$slug/dashboard
    R->>R: beforeLoad → check session
    R->>SF: loader → getOrgBySlug("acme")
    SF->>BA: getSession(headers)
    BA->>DB: SELECT session WHERE token = ?
    DB-->>BA: Session { userId, activeOrgId }
    BA-->>SF: Authenticated ✅
    SF->>DB: SELECT org WHERE slug = "acme"
    SF->>DB: SELECT member WHERE orgId AND userId
    DB-->>SF: Org data + role
    SF-->>R: { org, role }
    R->>R: ensureQueryData → seed cache
    N-->>B: Full HTML + dehydrated query cache
    B->>B: Hydrate → React 19 takes over
    B->>B: TanStack Query uses cached data (no refetch)
```

### Folder Structure

```
RefactKit-multitenancy/
├── db/
│   ├── schema.ts              # Single source of truth — all tables & relations
│   └── index.ts               # postgres.js connection pool (Supabase pooler)
├── lib/
│   ├── auth.ts                # Better Auth config (RBAC, dynamic roles, hooks)
│   ├── auth-client.ts         # Browser auth client (organizationClient plugin)
│   ├── email.ts               # Resend transactional email service
│   ├── env.ts                 # Environment variable helpers
│   └── supabase.ts            # Supabase client for storage
├── src/
│   ├── components/
│   │   ├── dashboard/         # Sidebar, Navbar, Breadcrumbs
│   │   ├── settings/          # Account, Security, Appearance
│   │   │   └── roles/         # Dynamic RBAC matrix component
│   │   ├── projects/          # Project management components
│   │   ├── shared/            # Header, AuthShell, shared UI
│   │   └── ui/                # Base UI + Shadcn primitives (Button, Input, Checkbox...)
│   ├── i18n/
│   │   ├── context.tsx        # React context provider
│   │   ├── locales/           # en, fr, es, pt, ar... (12 languages)
│   │   └── index.ts           # Locale detection & persistence
│   ├── routes/
│   │   ├── __root.tsx         # Root layout (providers, meta, fonts)
│   │   ├── index.tsx          # Landing page
│   │   ├── _auth/             # Public: login, signup, forgot/reset-password
│   │   ├── _app/              # Protected: dashboard shell, settings
│   │   │   └── organizations/
│   │   │       └── $slug/     # Org: dashboard, members, roles, gallery, settings
│   │   ├── api/auth/          # Better Auth API route handler
│   │   └── onboarding.tsx     # Workspace setup flow
│   ├── server/
│   │   ├── auth-fns.ts        # Session & auth helpers
│   │   ├── org-fns.ts         # CRUD organizations & members
│   │   ├── project-fns.ts     # Project management logic
│   │   ├── storage-fns.ts     # Supabase file upload (server-only)
│   │   └── query-keys.ts      # TanStack Query option factories
│   └── styles/
│       └── globals.css        # Tailwind v4 & global tokens
└── package.json               # Scripts & dependencies
```

---



| Layer | Technology | Version | Role in Architecture |
|---|---|---|---|
| **Meta-Framework** | TanStack Start | latest | Full-stack React framework. Provides SSR, file-based routing, server functions, and hydration via Nitro v3. |
| **Server Engine** | Nitro v3 | 3.0.x-beta | Universal deployment engine. Powers SSR, server functions, and API routes. Single build targets Vercel, Cloudflare, Node.js. |
| **UI Framework** | React | 19.2+ | Core UI library. Uses React 19 features: Server Functions, Actions, `use` hook. |
| **Router** | TanStack Router | latest | Type-safe file-based routing with `beforeLoad` guards, loaders, search params validation, and code splitting. |
| **Data Fetching** | TanStack Query | 5.x | Server-state synchronization. `queryOptions` factory pattern, `ensureQueryData` for SSR cache seeding, automatic background refetching. |
| **Forms** | TanStack Form | 1.x | Type-safe form state management with Zod validators, field-level error tracking, and submit state. |
| **Tables** | TanStack Table | 8.x | Headless table engine for members list, gallery grid, and data tables. |
| **Authentication** | Better Auth | 1.6+ | Full auth system: email/password, OAuth (Google, Microsoft, GitHub, LinkedIn, Twitter), organizations, RBAC, rate limiting, session management, OWASP compliance. |
| **ORM** | Drizzle ORM | 0.45+ | Type-safe SQL query builder. Schema-as-code with `pgTable`, relational queries, zero-overhead. |
| **Database** | Supabase (PostgreSQL) | — | Managed PostgreSQL with connection pooling (port 6543), Row Level Security, and dashboard for visual data management. |
| **Storage** | Supabase Storage | — | S3-compatible object storage for avatars, logos, gallery images. Server-only uploads via service role key. |
| **Styling** | Tailwind CSS | v4 | Utility-first CSS with CSS variables, `@theme` directives, and ultra-fast Vite plugin compilation. |
| **UI Primitives** | shadcn/ui (Base UI) | 4.5+ | Accessible WAI-ARIA components built on Base UI primitives. Preset-based theming — generate and apply any theme with `npx shadcn apply --preset`. Tailwind CSS v4 powered. |
| **Emails** | Resend | — | Transactional email API for verification, password reset, invitations, and security alerts. |
| **i18n** | Custom (i18next-based) | — | 12 languages (EN, FR, ES, PT, AR, AR-MA, BE, DE, HI, ZH, IT, RU). RTL support. Cookie-based locale persistence. Server-side locale detection. |
| **Icons** | Phosphor Icons + Lucide React | latest | Dual icon system — Phosphor for expressive, multi-weight icons; Lucide for crisp, consistent UI icons. Both tree-shakeable. |
| **Animations** | Framer Motion | 12.x | Smooth page transitions and micro-interactions. |
| **Validation** | Zod | 4.x | Runtime type validation for server functions, form inputs, and search params. |
| **Code Quality** | Biome | 2.4+ | Rust-based linter + formatter. Replaces ESLint + Prettier with 10x speed. |
| **Unit Tests** | Vitest | 4.x | Fast unit/integration testing with JSDOM, React Testing Library, and v8 coverage. |
| **E2E Tests** | Playwright | 1.59+ | Cross-browser E2E testing (Chromium, Firefox, WebKit). Auto-starts dev server. |
| **Build** | Vite | 8.x | Next-gen build tool. Plugins: TanStack Start, React, Tailwind CSS, Nitro. |

### ⚠️ Dependency Coupling Warnings

> [!WARNING]
> **TanStack Start + Nitro v3**: These are tightly coupled. The `nitro` package is pinned to `3.0.x-beta`. Do **not** blindly run `pnpm update` on `@tanstack/react-start`, `@tanstack/react-router`, or `nitro` — version mismatches crash the SSR server.

> [!WARNING]
> **Better Auth (v1.6+)**: Updates often introduce new DB columns (especially for the `organization` plugin). Always check the changelog and run `npx drizzle-kit push` after updating.

> [!CAUTION]
> **React 19**: This boilerplate uses React 19 features (Server Functions, Actions). Do not install legacy UI libraries requiring React 18, and never downgrade the core `react` packages.

---

## 🔒 Authentication & Security

RefactKit uses **Better Auth** with a hardened, OWASP-compliant configuration. Authentication and organization state are tightly coupled — users can **never** access data outside their workspace.

### Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant C as Client
    participant BA as Better Auth
    participant DB as Database
    participant E as Resend Email

    Note over U,E: Sign-Up Flow
    U->>C: Fill signup form
    C->>BA: signUp.email({ name, email, password })
    BA->>DB: Check if email exists
    alt New User
        BA->>DB: INSERT user + account (scrypt hash)
        BA->>E: Send verification email
        BA-->>C: 200 OK { user }
        C-->>U: "Check your inbox" screen
    else Existing User (anti-enumeration)
        BA->>E: Send "someone tried to sign up" alert
        BA-->>C: 200 OK (identical response)
        C-->>U: Same "Check your inbox" screen
    end

    Note over U,E: Sign-In Flow
    U->>C: Fill login form
    C->>BA: signIn.email({ email, password })
    BA->>DB: Verify credentials (scrypt)
    BA->>DB: CREATE session token
    BA-->>C: Set-Cookie: session_token (HttpOnly, Secure, SameSite=Lax)
    C-->>U: Redirect to dashboard

    Note over U,E: Subsequent Requests
    C->>BA: Request with cookie
    BA->>BA: Check JWE cookie cache (5 min TTL)
    alt Cache Hit
        BA-->>C: Session from encrypted cache ⚡
    else Cache Miss
        BA->>DB: SELECT session WHERE token = ?
        BA-->>C: Refresh cache + return session
    end
```

### OWASP Security Checklist

Every item below is implemented in `lib/auth.ts`:

| # | OWASP Control | Implementation | Config |
|---|---|---|---|
| 1 | **Account Enumeration Prevention** | Signup returns identical 200 for new + existing emails. `onExistingUserSignUp` notifies real owner. | `requireEmailVerification: true` |
| 2 | **Brute Force Protection** | Rate limiting on all auth endpoints, persisted in DB (survives serverless restarts). | `rateLimit: { storage: 'database' }` |
| 3 | **Rate Limit Rules** | Sign-in: 5/min, Sign-up: 3/min, Forgot-password: 3/min. | `customRules: { ... }` |
| 4 | **Encrypted Session Cache** | JWE (AES-256-GCM) encrypted cookie cache eliminates DB queries for 5 min windows. | `cookieCache: { strategy: 'jwe' }` |
| 5 | **Password Policy** | Min 12 chars, max 128 chars (prevents bcrypt DoS). | `minPasswordLength / maxPasswordLength` |
| 6 | **Session Revocation** | All sessions revoked on password reset. | `revokeSessionsOnPasswordReset: true` |
| 7 | **Reset Token Expiry** | Tokens expire in 30 minutes (default was 1 hour). Single-use. | `resetPasswordTokenExpiresIn: 60 * 30` |
| 8 | **Audit Logging** | `databaseHooks` log session creation and email changes. | `databaseHooks: { session, user }` |
| 9 | **Proxy IP Tracking** | Reads real client IP from `x-forwarded-for` (Vercel proxy). | `ipAddress.ipAddressHeaders` |
| 10 | **CSRF Protection** | Multi-layer: origin validation, Fetch Metadata, first-login protection. | Default enabled |
| 11 | **Generic Error Messages** | Login/forgot-password never reveal if email exists. | Client: `toast.error(l.error)` |
| 12 | **Background Task Safety** | Email sending uses `waitUntil` to prevent timing attacks. | `backgroundTasks.handler` |

### ✅ Security Best Practices Compliance

The authentication implementation in RefactKit strictly follows the official **Better Auth Best Practices** and **OWASP ASVS** standards. Every aspect has been hardened for production-ready deployment.

- **Universal Rate Limiting**: Uses `storage: 'database'` to ensure consistent brute-force protection across all environments (Vercel, Netlify, Cloudflare).
- **JWE Encryption**: Session cookies are encrypted using **AES-256-GCM**, ensuring no sensitive data is readable or modifiable client-side.
- **Hardened OAuth Protection**: Google integration includes token encryption (`encryptOAuthTokens`) and strict `trustedOrigins` validation.
- **Account Enumeration Prevention**: Signup and password recovery flows are designed to never confirm user existence to attackers.
- **Audit Logging**: Full traceability via `databaseHooks` for critical events (session creation, email changes).
- **Redirect Security**: Strict whitelist of authorized domains (`trustedOrigins`) to prevent malicious redirects after login.

| `src/routes/_auth/forgot-password.tsx` | Always shows "check inbox" regardless of email existence |

### ⚡ Performance & Configuration Best Practices

- **Optimized Database Queries**: `experimental.joins` is enabled in Better Auth. This allows fetching related data (User, Session, Organization) in a single optimized SQL query instead of sequential queries, improving latency by 2-3x. This works out-of-the-box because RefactKit includes complete Drizzle ORM `relations()` definitions.
- **Dynamic Application Identity**: The `appName` is configured dynamically via the `APP_NAME` environment variable (e.g., in `.env`). This ensures your branding is automatically applied to all Better Auth systems, including email templates and the internal Better Auth Dashboard plugin.

### 🔑 Social OAuth Flow & Security

RefactKit implements Social OAuth flows (Google, Microsoft, GitHub, LinkedIn, Twitter) with maximum security (PKCE + AES Encryption).

#### Sequence Diagram

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend (React)
    participant B as Backend (Better Auth)
    participant G as Google OAuth
    participant DB as Supabase (PostgreSQL)

    U->>F: Clicks "Continue with Google"
    F->>B: POST /api/auth/sign-in/social (provider: 'google')
    B-->>B: Generates State & Code Verifier (PKCE)
    B-->>F: Set-Cookie (state) + Redirect to Google
    F->>G: Redirect to Consent Screen
    U->>G: Approves access
    G-->>F: Redirect back to /api/auth/callback/google?code=...
    F->>B: GET /api/auth/callback/google
    B->>G: Exchange Code for Tokens (Access/Refresh)
    B-->>B: Encrypts Tokens with BETTER_AUTH_SECRET (AES-256-GCM)
    B->>DB: Saves User + Account (Encrypted Tokens)
    B-->>F: Set-Cookie (session) + Redirect to /dashboard
    F->>U: Displays Dashboard
```

#### OAuth Token Security
Unlike standard integrations, RefactKit **systematically encrypts** access and refresh tokens before storage.

1.  **Encryption at Rest**: All Google tokens are encrypted via AES-256-GCM using your `BETTER_AUTH_SECRET`. Even in the event of a database leak, your users remain protected.
2.  **Client Isolation**: The browser **never** sees the Google tokens. Decryption occurs exclusively server-side during authenticated API calls.
3.  **PKCE Protection**: Automatic protection against authorization code interception, ensuring only your server can finalize the token exchange.

| File | Purpose |
|---|---|
| `lib/auth.ts` | Server-side Better Auth configuration with all OWASP controls |
| `lib/auth-client.ts` | Browser client with `organizationClient()` + `sentinelClient()` plugins |
| `src/routes/_auth/signup.tsx` | Anti-enumeration safe signup (same UI for new + existing emails) |
| `src/routes/_auth/login.tsx` | Generic error messages only |
| `src/routes/_auth/forgot-password.tsx` | Always shows "check inbox" regardless of email existence |

---

## 👥 Roles & RBAC

RefactKit uses Better Auth's `createAccessControl` with a granular resource→action permission model.

### Permission Matrix

| Resource → Action | Member | Admin | Owner |
|---|:---:|:---:|:---:|
| `dashboard:read` | ✅ | ✅ | ✅ |
| `member:read` | — | ✅ | ✅ |
| `member:create` | — | ✅ | ✅ |
| `member:update` | — | ✅ | ✅ |
| `member:delete` | — | — | ✅ |
| `invitation:read` | — | ✅ | ✅ |
| `invitation:create` | — | ✅ | ✅ |
| `invitation:update` | — | — | ✅ |
| `invitation:delete` | — | ✅ | ✅ |
| `organization:update` | — | — | ✅ |
| `organization:delete` | — | — | ✅ |

### Role Hierarchy & Custom Roles (Dynamic Access Control)

By default, an organization comes with three static roles:

```mermaid
graph TB
    Owner["🔑 Owner<br/>Full control over org,<br/>members, invitations,<br/>settings, deletion"]
    Admin["🛡️ Admin<br/>Manage members (non-owners),<br/>send invitations,<br/>read dashboard"]
    Member["👤 Member<br/>View dashboard only.<br/>No management access."]

    Owner --> Admin --> Member
```

**Creating Custom Roles (Dynamic Access Control)**:
While the three default roles cover most use cases, SaaS users (Tenants) have the freedom to create **custom roles** dynamically via the **"Roles & Permissions"** tab in their organization settings. 
Thanks to Better Auth's `dynamicAccessControl` feature, Owners and Admins can create new roles (e.g., "Editor", "Billing Manager") and granularly select the permissions they want to grant for each resource via a visual matrix. These custom roles are safely persisted in the database (`organization_role` table).

### Organization RBAC vs. Global Super Admin

It's crucial to understand the two distinct layers of administration provided in RefactKit:

| Layer | Scope | Target Audience | Storage | Purpose |
|---|---|---|---|---|
| **Dynamic Access Control (RBAC)** | **Organization** | SaaS Tenants | `member.role` | Allows an organization owner to manage their own team's permissions and create custom roles within their isolated workspace. |
| **Admin Plugin (Super Admin)** | **Global** | SaaS Owner (You) | `user.role` | Gives you ultimate power over the entire app. You can access the Better Auth dashboard at `/api/auth/dashboard` to manage/ban all users and oversee the system. |

### How RBAC Is Enforced

1. **Server-side** (`lib/auth.ts`): `createAccessControl` defines resources and actions. Roles are assigned via `ac.newRole()`.
2. **Membership check** (`src/server/org-fns.ts`): Every server function queries `member` table to verify the user belongs to the organization and has the required role.
3. **Route guards** (`_app/route.tsx`): `beforeLoad` verifies session existence before rendering any protected route.
4. **Owner protection**: Better Auth prevents removing the last owner. Ownership must be transferred first.

### Adding a New Permission Resource

```typescript
// 1. Add to access control (lib/auth.ts)
const ac = createAccessControl({
  dashboard: ['read'],
  member: ['read', 'create', 'update', 'delete'],
  billing: ['read', 'manage'],  // ← NEW
})

// 2. Assign to roles
const adminRole = ac.newRole({
  billing: ['read'],  // Admin can view billing
})
const ownerRole = ac.newRole({
  billing: ['read', 'manage'],  // Owner can manage billing
})

// 3. Check in server functions
const { data } = await authClient.organization.hasPermission({
  permission: 'billing:manage',
})
```

---

## 💻 Frontend Architecture

### TanStack Router — File-Based Routing

Routes are organized by access level using layout route prefixes:

| Prefix | Access | Layout | Purpose |
|---|---|---|---|
| `_auth/` | Public | `AuthShell` | Login, signup, password flows |
| `_app/` | Protected | Dashboard shell (sidebar + navbar) | Organization workspace |
| `$slug/` | Protected + org-scoped | Inherits `_app` | Org-specific pages (dashboard, members, gallery) |

**Route protection** happens in `_app/route.tsx` via `beforeLoad`:

```typescript
export const Route = createFileRoute('/_app')({
  beforeLoad: async ({ context }) => {
    const session = await getSession({ headers: getRequest().headers })
    if (!session) throw redirect({ to: '/login' })
    return { session }
  },
  component: AppLayout,
})
```

### TanStack Query — Data Fetching Strategy

RefactKit uses a **query options factory pattern** (`src/server/query-keys.ts`) to ensure consistent cache keys across SSR and client:

```typescript
// Define once
export const orgBySlugQuery = (slug: string) =>
  queryOptions({
    queryKey: ['org', slug] as const,
    queryFn: () => getOrgBySlug({ data: { slug } }),
  })

// Use in route loader (SSR)
loader: async ({ context, params }) => {
  await context.queryClient.ensureQueryData(orgBySlugQuery(params.slug))
}

// Use in component (client)
const { data } = useQuery(orgBySlugQuery(slug))
// → No refetch! Data is already in cache from SSR.
```

**Caching configuration** (`src/router.tsx`):

| Setting | Value | Effect |
|---|---|---|
| `staleTime` | 30 seconds | Queries won't refetch for 30s after becoming stale |
| `defaultPreloadStaleTime` | 30 seconds | Preloaded data stays fresh during navigation |
| `scrollRestoration` | `true` | Scroll position restored on back navigation |
| `defaultPreload` | `'intent'` | Routes preload on hover/focus intent |

### Creating a New Page

**Step 1** — Create the route file:
```typescript
// src/routes/_app/organizations/$slug/my-page.tsx
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

export const Route = createFileRoute('/_app/organizations/$slug/my-page')({
  component: MyPage,
  loader: async ({ context, params }) => {
    // Seed cache for SSR — no client-side refetch needed
    await context.queryClient.ensureQueryData(myDataQuery(params.slug))
  },
})

function MyPage() {
  const { slug } = Route.useParams()
  const { data } = useQuery(myDataQuery(slug))
  return <div>{/* Your UI */}</div>
}
```

**Step 2** — Create the server function:
```typescript
// src/server/my-fns.ts
import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { z } from 'zod'
import { db } from '../../db/index'
import { auth } from '../../lib/auth'

export const getMyData = createServerFn({ method: 'GET' }).handler(async ({ data }) => {
  const { slug } = z.object({ slug: z.string() }).parse(data)
  const request = getRequest()
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) throw new Error('Unauthorized')
  // ... your query logic
})
```

**Step 3** — Create the query option:
```typescript
// src/server/query-keys.ts
export const myDataQuery = (slug: string) =>
  queryOptions({
    queryKey: ['my-data', slug] as const,
    queryFn: () => getMyData({ data: { slug } }),
  })
```

**Step 4** — Update RBAC Permissions (`lib/auth.ts`):
If your new page introduces a new entity (e.g., `my-data`), you must declare it in the Better Auth access control matrix to enforce security at the server level.
```typescript
// lib/auth.ts
const ac = createAccessControl({
  // ... existing entities
  myData: ['create', 'read', 'update', 'delete'],
})
```
