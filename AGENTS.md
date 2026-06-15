# AGENTS.md 🤖

This file provides context and instructions for AI coding agents working on the **RefactKit** project.

## 🌟 Project Overview
**RefactKit** is a high-performance SaaS boilerplate built with **TanStack Start** and **React 19**. It is designed for multi-tenant applications with a focus on type-safety, accessibility (Base UI), and universal deployment (Nitro v3).

## 🛠️ Setup & Commands
- **Install dependencies**: `pnpm install`
- **Development server**: `pnpm dev` (runs on http://localhost:3000)
- **Database synchronization**: `npx drizzle-kit push`
- **Database UI**: `npx drizzle-kit studio`
- **Lint & Format**: `pnpm format` (uses Biome)

## 🤖 AI Skills & Context
To help you work better, you can ask the user to add specialized skills:
- `pnpm dlx skills add shadcn/ui`
- `pnpm dlx skills add tanstack`
- `pnpm dlx skills add drizzle`
- `pnpm dlx skills add supabase`
- `pnpm dlx skills add better-auth`

## 🏗️ Architecture & Routing
- **Meta-Framework**: TanStack Start (Server-side rendering + Hydration).
- **Server Engine**: Nitro v3. Server logic resides in `src/server/` using `createServerFn`. Add custom business logic (e.g. data processing, external API calls) as new `-fns.ts` files here instead of creating traditional API routes.
- **Routing**: File-based routing in `src/routes/`.
    - `_auth/`: Public authentication flows.
    - `_app/`: Main application shell.
    - `$slug/`: Dynamic organization-specific workspace.
- **Authentication**: Powered by **Better Auth**. Config in `lib/auth.ts`, client in `lib/auth-client.ts`. Supports Multi-tenancy (Organizations).

## 🎨 Styling & UI
- **CSS**: Tailwind CSS v4. Use utility classes and CSS variables.
- **Components**: Based on **Base UI** primitives. Follow the "segmented" (pill) style for tabs and "compact" designs for navigation.
- **Icons**: Use `lucide-react`.
- **Theming**: Supports Light/Dark/System modes. Logic in `src/components/settings/account/appearance.tsx`.

## 🌍 Internationalization (i18n) & Typography
- **Framework**: `i18next` with custom React context in `src/i18n/context.tsx`.
- **Locales**: Located in `src/i18n/locales/`. Supports 12 languages: `en`, `fr`, `es`, `pt`, `be`, `de`, `hi`, `zh`, `it`, `ru`, and Arabic variants `ar`, `ar-ma` (RTL).
- **Convention**: Always use `t.key.path` for translations.
- **Dynamic Fonts**: Typography automatically switches based on document direction (Google Sans Flex for LTR, Zain for RTL).

## 🔐 Database & Schema
- **ORM**: Drizzle ORM.
- **Database**: PostgreSQL (Supabase).
- **Schema**: Defined in `db/schema.ts`. Always sync changes using `drizzle-kit push`.
- **RBAC**: Roles (member, admin, owner) are managed via Better Auth and reflected in the `db/schema.ts`.
- **Field Consistency**: Ensure fields like `image_url` (users) and `logo_url` (organizations) are used in tandem with standard Better Auth fields for reliable storage URL retrieval.

## 🖼️ Storage & Media
- **Workflow**: All uploads MUST be handled server-side via `src/server/storage-fns.ts`.
- **Security**: Never use the `SUPABASE_SERVICE_ROLE_KEY` on the client.
- **Derived State Pattern**: Always use a derived state for images (e.g., `const currentImg = uploadedImg || defaultValue`) to avoid UI flickering and ensure instant display from cache.

## ⚡ Reactivity & Performance
- **TanStack Query**: Use `ensureQueryData` in route loaders to seed the cache.
- **Form State**: Reset local form state on organization switch by using a `key` property (e.g., `key={org.id}`) on the page container or `useEffect` hooks.
- **Context Propagation**: Ensure all context-dependent data (like organization details) is fetched using TanStack Query keys that include the organization ID or slug.

## 🧪 Testing
- **Unit/Integration**: `pnpm test` (Vitest).
- **End-to-End**: `pnpm test:e2e` (Playwright).
- **Convention**: Add tests for any new server functions or complex UI logic.

## 📝 Coding Standards
- **TypeScript**: Strict mode enabled. No `any`. Use interfaces for component props.
- **React**: Use React 19 features (e.g., `use` hook, Actions).
- **Formatting**: Biome is the source of truth. Do not use Prettier or ESLint commands manually.
- **PRs**: Ensure `pnpm format` and `pnpm lint` pass before submitting.

## 🚀 Deployment
- **Vercel**: Optimized for Vercel using the Nitro v3 engine.
- **Build Command**: Uses `NITRO_PRESET=vercel vite build`. Requires `DATABASE_URL` and `BETTER_AUTH_SECRET` environment variables.
