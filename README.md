
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
│   ├── auth.ts                # Better Auth config (RBAC, rate limiting, hooks)
│   ├── auth-client.ts         # Browser auth client (organizationClient plugin)
│   ├── email.ts               # Resend transactional email service
│   ├── env.ts                 # Environment variable helpers
│   └── supabase.ts            # Supabase client for storage
├── src/
│   ├── components/
│   │   ├── dashboard/         # Sidebar, Navbar, Breadcrumbs
│   │   ├── settings/          # Account, Security, Appearance tabs
│   │   ├── shared/            # Header, AuthShell, shared UI
│   │   ├── landing/           # Landing page components
│   │   └── ui/                # Base UI primitives (Button, Input, Dialog...)
│   ├── hooks/                 # useFont, useTheme
│   ├── i18n/
│   │   ├── context.tsx        # React context provider
│   │   ├── index.ts           # Locale detection & cookie management
│   │   └── locales/           # en, fr, es, pt, ar translations
│   ├── routes/
│   │   ├── __root.tsx         # Root layout (providers, meta, fonts)
│   │   ├── index.tsx          # Landing page
│   │   ├── _auth/             # Public: login, signup, forgot/reset-password
│   │   ├── _app/              # Protected: dashboard shell, settings
│   │   │   └── organizations/
│   │   │       └── $slug/     # Org workspace: dashboard, members, gallery, settings
│   │   ├── api/auth/          # Better Auth API route handler
│   │   ├── onboarding.tsx     # First-time org creation
│   │   └── accept-invite.tsx  # Invitation acceptance flow
│   ├── server/
│   │   ├── auth-fns.ts        # Session helpers
│   │   ├── org-fns.ts         # CRUD organizations + membership checks
│   │   ├── dashboard-fns.ts   # Org statistics
│   │   ├── gallery-fns.ts     # Gallery CRUD
│   │   ├── storage-fns.ts     # Supabase file upload (server-only)
│   │   └── query-keys.ts      # TanStack Query option factories
│   └── styles/
│       └── globals.css        # Tailwind v4, CSS variables, font imports
├── e2e/                       # Playwright E2E test scenarios
├── vite.config.ts             # Vite + TanStack Start + Nitro + Tailwind
├── drizzle.config.ts          # Drizzle Kit configuration
├── playwright.config.ts       # Playwright multi-browser config
├── biome.json                 # Biome linter/formatter config
└── package.json               # Scripts, dependencies
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

### Role Hierarchy

```mermaid
graph TB
    Owner["🔑 Owner<br/>Full control over org,<br/>members, invitations,<br/>settings, deletion"]
    Admin["🛡️ Admin<br/>Manage members (non-owners),<br/>send invitations,<br/>read dashboard"]
    Member["👤 Member<br/>View dashboard only.<br/>No management access."]

    Owner --> Admin --> Member
```

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

### Reactivity Best Practices

| Pattern | Rule |
|---|---|
| **Stable Keys** | Never use array indexes. Always use `key={item.id}`. |
| **Org Switch Reset** | Use `key={org.id}` on the page container to reset state on org change. |
| **Derived State** | For images: `const currentImg = uploadedImg \|\| defaultValue` to avoid flickering. |
| **Cache Invalidation** | After mutations: `queryClient.invalidateQueries()` + `router.invalidate()`. |

---

## ⚙️ Backend Architecture

### Server Functions (createServerFn)

All backend logic runs through **TanStack Start Server Functions** — type-safe functions that execute exclusively on Nitro v3. They never ship to the client bundle.

```mermaid
graph LR
    Client["Client Component"] -->|"call fn({ data })"| SF["Server Function<br/>(runs on Nitro)"]
    SF -->|"Zod validation"| Val["z.object().parse()"]
    Val --> Auth["getSession(headers)"]
    Auth -->|"membership check"| DB["Drizzle → PostgreSQL"]
    DB -->|"typed result"| SF
    SF -->|"JSON response"| Client
```

**Server function files** (`src/server/`):

| File | Responsibility |
|---|---|
| `auth-fns.ts` | Session retrieval helpers |
| `org-fns.ts` | Create, read, update, delete organizations + membership validation |
| `dashboard-fns.ts` | Organization statistics (member count, etc.) |
| `gallery-fns.ts` | Gallery image CRUD (scoped to org) |
| `storage-fns.ts` | Supabase file upload (server-only, service role key) |
| `query-keys.ts` | TanStack Query option factories for consistent cache keys |

### Server Function Pattern

Every server function follows the same security pattern:

```typescript
export const myFunction = createServerFn({ method: 'POST' }).handler(async ({ data }) => {
  // 1. Validate input with Zod
  const { name, orgId } = z.object({ name: z.string(), orgId: z.string() }).parse(data)

  // 2. Authenticate — get session from cookies
  const request = getRequest()
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) throw new Error('Unauthorized')

  // 3. Authorize — verify org membership + role
  const membership = await db.query.member.findFirst({
    where: and(eq(member.organizationId, orgId), eq(member.userId, session.user.id)),
  })
  if (!membership || membership.role !== 'owner') throw new Error('Forbidden')

  // 4. Execute business logic
  return await db.insert(myTable).values({ name, organizationId: orgId }).returning()
})
```

### Storage — Secure Upload Workflow

Uploads are **server-only** to protect the `SUPABASE_SERVICE_ROLE_KEY`:

```mermaid
sequenceDiagram
    participant C as Client (ImageUpload)
    participant SF as Server Function (storage-fns.ts)
    participant S3 as Supabase Storage

    C->>C: User selects file
    C->>SF: FormData { file, bucket: "avatars" }
    SF->>SF: Validate: size ≤ 2MB, type check
    SF->>SF: Generate random filename
    SF->>S3: upload(fileName, arrayBuffer, { contentType })
    S3-->>SF: Success
    SF->>S3: getPublicUrl(fileName)
    S3-->>SF: https://...supabase.co/storage/v1/object/public/...
    SF-->>C: { url: publicUrl }
    C->>C: setState(url) → instant preview via derived state
```

### API Routes

Better Auth handles its own API at `src/routes/api/auth/`:

| Endpoint | Handler |
|---|---|
| `/api/auth/*` | Better Auth catch-all (sign-in, sign-up, session, OAuth callbacks, org operations) |
| `/api/test` | Health check endpoint |

### How to Add a New API Endpoint

```typescript
// src/routes/api/my-endpoint.ts
import { createAPIFileRoute } from '@tanstack/react-start/api'

export const APIRoute = createAPIFileRoute('/api/my-endpoint')({
  GET: async ({ request }) => {
    return new Response(JSON.stringify({ status: 'ok' }), {
      headers: { 'Content-Type': 'application/json' },
    })
  },
})
```

---

## 🗄️ Database & Schema

### Entity Relationship Diagram

```mermaid
erDiagram
    USER {
        text id PK
        text name
        text email UK
        boolean email_verified
        text image
        text image_url
        timestamp created_at
        timestamp updated_at
    }

    SESSION {
        text id PK
        timestamp expires_at
        text token UK
        text ip_address
        text user_agent
        text user_id FK
        text active_organization_id
        text provider
    }

    ACCOUNT {
        text id PK
        text account_id
        text provider_id
        text user_id FK
        text access_token
        text refresh_token
        text id_token
        timestamp access_token_expires_at
        timestamp refresh_token_expires_at
        text scope
        text password
    }

    VERIFICATION {
        text id PK
        text identifier
        text value
        timestamp expires_at
        timestamp created_at
        timestamp updated_at
    }

    ORGANIZATION {
        text id PK
        text name
        text slug UK
        text logo
        text logo_url
        text metadata
        timestamp created_at
    }

    MEMBER {
        text id PK
        text organization_id FK
        text user_id FK
        text role
        timestamp created_at
    }

    INVITATION {
        text id PK
        text organization_id FK
        text email
        text role
        text status
        timestamp expires_at
        timestamp created_at
        text inviter_id FK
    }

    GALLERY_IMAGE {
        text id PK
        text name
        text url
        text size
        text organization_id FK
        timestamp created_at
    }

    USER ||--o{ SESSION : "has"
    USER ||--o{ ACCOUNT : "has"
    USER ||--o{ MEMBER : "belongs to"
    USER ||--o{ INVITATION : "invites"
    ORGANIZATION ||--o{ MEMBER : "has"
    ORGANIZATION ||--o{ INVITATION : "has"
    ORGANIZATION ||--o{ GALLERY_IMAGE : "owns"
```

### Multi-Tenancy Pattern

Every tenant-scoped table includes an `organizationId` foreign key with cascade delete:

```typescript
export const myTable = pgTable("my_table", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("my_table_organizationId_idx").on(table.organizationId),
])
```

> [!TIP]
> Always add an index on `organizationId` — it's queried on every tenant-scoped request.

### Database Connection

`db/index.ts` uses `postgres.js` with Supabase transaction pooler settings:

```typescript
const client = postgres(process.env.DATABASE_URL, {
  ssl: 'require',
  prepare: false,    // CRITICAL for Supabase Pooler (port 6543)
  max: 10,           // Connection pool size
  idle_timeout: 20,  // Seconds before idle connection is closed
  connect_timeout: 10,
})
export const db = drizzle(client, { schema })
```

### Database Commands

| Command | Purpose |
|---|---|
| `npx drizzle-kit push` | Sync schema.ts changes directly to PostgreSQL |
| `npx drizzle-kit studio` | Visual database browser at https://local.drizzle.studio |
| `npx drizzle-kit generate` | Generate SQL migration files (for version control) |

---

## 🌐 Internationalization

RefactKit uses a **custom React context** wrapping i18next for full SSR-compatible internationalization.

### Supported Locales

| Locale | Language | Direction | Default Font |
|---|---|---|---|
| `en` | English | LTR | Google Sans Flex |
| `fr` | French | LTR | Google Sans Flex |
| `es` | Spanish | LTR | Google Sans Flex |
| `pt` | Portuguese | LTR | Google Sans Flex |
| `de` | German | LTR | Google Sans Flex |
| `zh` | Chinese | LTR | Google Sans Flex |
| `be` | Belarusian | LTR | Google Sans Flex |
| `hi` | Hindi | LTR | Baloo Bhaijaan 2 |
| `it` | Italian | LTR | Google Sans Flex |
| `ru` | Russian | LTR | Google Sans Flex |
| `ar` | Arabic | RTL | Zain |
| `ar-ma`| Moroccan Arabic| RTL | Zain |

### How It Works

1. **Server**: `getServerLocale()` reads the `locale` cookie from the request headers during SSR.
2. **Root layout**: Passes locale to `<I18nProvider initialLocale={locale}>` and sets `<html lang dir>`.
3. **Components**: Use `const { t, locale, dir } = useI18n()` to access translations.
4. **Switching**: `setLocale('ar')` updates state + persists cookie + flips `document.dir`.

### Adding a New Locale

1. Create `src/i18n/locales/de.ts` with all translation keys.
2. Register it in `src/i18n/index.ts`:
   ```typescript
   import de from './locales/de'
   const translations = { en, fr, es, pt, ar, de }
   export type Locale = 'en' | 'fr' | 'es' | 'pt' | 'ar' | 'de'
   ```
3. Add the font (if needed) in `src/styles/globals.css`.

---

## 📝 Forms & Design System

### TanStack Form + Zod Validation

Forms use **TanStack Form** with Zod schema validators and **Base UI** primitives:

```tsx
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
})

const form = useForm({
  defaultValues: { name: '', email: '' },
  validators: { onSubmit: schema },
  onSubmit: async ({ value }) => {
    await myServerFunction({ data: value })
  },
})
```

### Design System Rules

| Rule | Do | Don't |
|---|---|---|
| **Colors** | `bg-primary`, `text-muted-foreground` | `bg-blue-500`, `dark:bg-slate-900` |
| **Spacing** | `flex flex-col gap-4` | `space-y-4` |
| **Dimensions** | `size-10` (equal w/h) | `w-10 h-10` |
| **Icons** | `data-icon="inline-start"` | Raw SVG inline |
| **Themes** | CSS variables via `@theme` | Hardcoded color values |

### 🎨 Adding Selectable Color Themes

RefactKit supports multiple runtime color themes via CSS data attributes (`[data-theme="..."]`), allowing users to switch colors instantly without recompiling.

To add a new color preset (e.g., "Neon"):

1. **Add CSS Variables**: Append your palette to `src/styles/globals.css`. Ensure you target your new `data-theme` attribute for both light and `.dark` modes.
   ```css
   /* Preset: Neon */
   [data-theme="neon"] {
     --primary: oklch(0.6 0.2 320);
     --primary-foreground: oklch(0.985 0 0);
     /* ... other variables ... */
   }
   .dark[data-theme="neon"] {
     --primary: oklch(0.7 0.18 320);
     /* ... other variables ... */
   }
   ```

2. **Update TypeScript Definitions**: Add the new theme ID to the `ColorTheme` union type in `src/hooks/use-color-theme.ts`.
   ```ts
   export type ColorTheme = 'default' | 'vega' | 'maia' | 'lyra' | 'mira' | 'luma' | 'neon'
   ```

3. **Add to the UI Switcher**: Add your preset configuration to the `COLOR_PRESETS` array in both `src/components/shared/auth-ui.tsx` and `src/components/settings/account/appearance.tsx`.
   ```tsx
   { value: 'neon', label: 'Neon', color: 'bg-pink-500' }
   ```

### Applying a Base Shadcn Theme

Generate a preset at [ui.shadcn.com](https://ui.shadcn.com) and apply:
```bash
npx shadcn@latest apply --preset <your-preset-code>
```

---

## 🧪 DevOps, Observability & Testing

### Deployment

#### Vercel (Primary — Recommended)

Pre-configured in `package.json`:
```bash
"build": "NITRO_PRESET=vercel vite build"
```

**Required environment variables** (Vercel Dashboard → Settings → Environment Variables):

| Variable | Value | Required |
|---|---|---|
| `DATABASE_URL` | Supabase connection string (port 6543 for pooler) | ✅ |
| `BETTER_AUTH_SECRET` | `openssl rand -base64 32` | ✅ |
| `BETTER_AUTH_URL` | `https://your-domain.com` | ✅ |
| `RESEND_API_KEY` | `re_...` from Resend dashboard | ✅ |
| `VITE_SUPABASE_URL` | `https://xxx.supabase.co` | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | From Supabase dashboard | ✅ |
| `VITE_APP_URL` | `https://your-domain.com` | Optional |
| `OPENAPI_NONCE` | `refactkit-openapi-nonce` | Optional |

#### Other Targets (Cloudflare, Node.js)

Change the Nitro preset:
```bash
# Cloudflare Workers
NITRO_PRESET=cloudflare-module vite build

# Standalone Node.js
NITRO_PRESET=node vite build
node .output/server/index.mjs
```

### Observability

| Tool | What It Shows | How to Access |
|---|---|---|
| **Drizzle Studio** | Visual database browser — view/edit all tables | `npx drizzle-kit studio` |
| **Supabase Dashboard** | Database logs, storage browser, RLS policies | `https://app.supabase.com` |
| **Server Audit Logs** | `[AUDIT]` prefixed console logs for session/email events | Terminal / Vercel Function Logs |
| **Better Auth Dash** | Built-in admin panel (`dash()` plugin) | `/api/auth/admin` |
| **TanStack DevTools** | Query cache inspector, router state | Auto-loaded in dev mode |

### Code Quality

| Tool | Command | Purpose |
|---|---|---|
| **Biome Lint** | `pnpm lint` | Catch code issues (Rust-speed) |
| **Biome Format** | `pnpm format` | Auto-format all files |
| **Biome Check** | `pnpm check` | Lint + format in one pass |
| **TypeScript** | Strict mode enabled in `tsconfig.json` | Compile-time type safety |

### Testing

#### Unit & Integration Tests (Vitest)

```bash
pnpm test              # Run all tests (includes Biome check)
pnpm test:watch        # Watch mode for development
pnpm test:coverage     # Generate v8 coverage report → coverage/
npx vitest --ui        # Visual test runner in browser
```

- **Framework**: Vitest 4.x + React Testing Library + JSDOM
- **Location**: `src/**/*.{test,spec}.{ts,tsx}`
- **Setup**: `src/test/setup.ts`

#### End-to-End Tests (Playwright)

```bash
pnpm test:e2e                  # Run all E2E tests
npx playwright test --ui       # Interactive mode with trace viewer
npx playwright test --headed   # See browser during test
```

- **Framework**: Playwright 1.59+ (Chromium, Firefox, WebKit)
- **Location**: `e2e/` directory
- **Auto-server**: Playwright starts `pnpm dev` automatically before tests
- **Config**: `playwright.config.ts` — HTML reporter, trace on first retry

### Pre-Deploy Checklist

```bash
pnpm check           # Biome lint + format
pnpm test            # Unit tests pass
pnpm test:e2e        # E2E tests pass
npx drizzle-kit push # Schema synced
```

---


---

## 🤖 AI-Assisted Development

RefactKit includes specialized **Skills** in `.agents/skills/` that teach AI coding assistants the exact patterns, APIs, and conventions of this stack.

### Available Skills

| Skill | When to Use |
|---|---|
| `better-auth-best-practices` | Auth config, sessions, plugins, database adapters |
| `better-auth-security-best-practices` | Rate limiting, CSRF, cookies, IP tracking, audit logging |
| `email-and-password-best-practices` | Email verification, password reset, hashing |
| `organization-best-practices` | Orgs, members, invitations, RBAC, teams |
| `create-auth-skill` | Scaffolding auth from scratch |
| `shadcn` | UI components, theming, presets |

### How to Use with Your AI

When prompting your AI assistant, **@mention** the relevant skill:

```
"Add a billing page with Stripe integration.
 Read @.agents/skills/shadcn/SKILL.md for UI patterns
 and @AGENTS.md for the overall architecture."
```

### Adding New Skills

```bash
pnpm dlx skills add shadcn/ui    # UI & Base UI components
pnpm dlx skills add tanstack     # Router, Query, Start, Form
pnpm dlx skills add drizzle      # Database & ORM
pnpm dlx skills add supabase     # Storage & Infrastructure
pnpm dlx skills add better-auth  # Authentication & Organizations
```

> [!TIP]
> The more explicitly you reference skill files in your prompts, the less hallucination you get — code will match the project's strict typing and composition rules.

---

## 💳 Payments & Billing (Pro)

> [!NOTE]
> Payment and billing features are **not included in the Community Edition**. They are reserved for **RefactKit Pro**, currently in development.

RefactKit Pro will ship with a complete, production-ready billing system built around two providers:

### Stripe — Subscriptions & One-Time Payments

| Feature | Details |
|---|---|
| Checkout | Stripe Checkout (hosted) + Elements (custom UI) |
| Pricing models | Flat-rate, per-seat (synced with org `membershipLimit`), metered usage, one-off payments |
| Subscription lifecycle | `trial → active → past_due → cancelled → expired` with automatic status sync via webhooks |
| Webhook handler | `/api/billing/webhook` — signature verification, event routing, DB sync |
| Customer portal | Self-service billing: manage plans, payment methods, download invoices |
| Test/Live mode | Single `STRIPE_SECRET_KEY` env swap — no code changes needed |

### Polar — Open-Source Friendly Monetization

| Feature | Details |
|---|---|
| Subscriptions | Usage-based and flat-rate plans |
| One-time purchases | Lifetime licenses, add-ons |
| Open-source integration | Designed for developer tools and open-core products |
| Benefits | Grant GitHub repo access, Discord roles, or file downloads on purchase |

### What Billing Unlocks in Pro

```
Community (this repo)          Pro (coming soon)
──────────────────────         ──────────────────
✅ Auth & Organizations         ✅ Everything in Community
✅ RBAC                         ✅ Stripe Subscriptions & Webhooks
✅ Multi-tenancy                ✅ Polar Integration
✅ i18n (5 languages)           ✅ Admin Dashboard
✅ Storage uploads              ✅ Super-admin Impersonation
✅ Gallery module               ✅ Per-seat Billing
                                ✅ Customer Portal
                                ✅ Priority Support
```

> [!TIP]
> Want to be notified when RefactKit Pro launches? Star the repo and watch for releases.

---

## 📄 License

RefactKit is released under the **MIT License** — free to use, modify, and distribute, for any purpose, including commercial projects.

See [LICENSE](LICENSE) for the full text.

---

### 🤝 Contributing

This project is community-driven and every contribution matters — whether it's a bug fix, a new feature, a translation, or simply spreading the word.

- **Found a bug?** [Open an issue](https://github.com/your-org/refactkit-multitenancy/issues)
- **Have an idea?** [Start a discussion](https://github.com/your-org/refactkit-multitenancy/discussions)
- **Want to contribute code?** Fork the repo, create a branch, and open a pull request. Make sure `pnpm format` and `pnpm lint` pass before submitting.
- **Built something with RefactKit?** Share it in the [Discussions → Show & Tell](https://github.com/your-org/refactkit-multitenancy/discussions) section — we'd love to see what you build. 🚀

> [!TIP]
> If RefactKit saves you time, the best way to give back is to ⭐ **star the repo** — it helps other developers discover the project and grows the community.

---

<div align="center">

Built with care by **[@devh2t](https://github.com/devh2t)** — a Software Builder who believes great tooling should be accessible to everyone.

*Made with ❤️ for indie developers, makers, and founders shipping their next big thing.*


</div>


