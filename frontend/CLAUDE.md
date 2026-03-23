# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> This file covers the **frontend** only. See the root `CLAUDE.md` for the full project (backend, DB, deployment, env vars, key gotchas).

## Commands

```bash
npm run dev      # Dev server on port 3000
npm run build    # Production build
npm run start    # Run production build locally
npm run lint     # ESLint (eslint-config-next)
```

## Key Corrections vs Root CLAUDE.md

- **`getApiUrl.ts` is NOT hardcoded** — it correctly reads `NEXT_PUBLIC_API_URL || 'http://localhost:8001/api'`. The root CLAUDE.md note about this is outdated.
- **`middleware.ts` is still named `middleware.ts`** (not renamed to `proxy.ts`). It wraps NextAuth's `auth()` and runs on the Edge runtime — do not add Node.js APIs here.

## Stack Details

- **Next.js 16** with React Compiler enabled (`reactCompiler: true` in `next.config.ts`)
- **Tailwind CSS 4** — config is **inline in `src/app/globals.css`** via `@plugin "daisyui/theme"`. There is no `tailwind.config.js` file. All theme tokens (colors, radii, etc.) live in that CSS file.
- **DaisyUI 5.5** — use DaisyUI component classes (`btn`, `card`, `modal`, etc.) rather than hand-rolling Tailwind utility combinations for common UI patterns.
- **React Compiler** is active — avoid manual `useMemo`/`useCallback` unless profiling shows it's needed; the compiler handles most memoization automatically.

## Auth Architecture

`src/auth.ts` exports `{ handlers, signIn, signOut, auth }` from NextAuth v5 with a single `CredentialsProvider`:
- `authorize()` calls `POST /api/auth/signin` → gets `{ access_token, user }` from backend
- JWT callback stores `id`, `role`, `accessToken` on the token
- Session callback exposes `session.user.id`, `session.user.role`, `session.accessToken`

`src/middleware.ts` wraps `auth()` and enforces:
- Public paths: `/`, `/signin`, `/signup`, `/forgot-password`, `/reset-password`, `/onboarding`, `/terms`, `/privacy`, `/offres`, `/entreprises`, `/support`, `/templates-final`
- Unauthenticated → `/dashboard/*` redirects to `/signin?callbackUrl=...`
- Non-admin → `/dashboard/admin` redirects to `/dashboard`
- Authenticated on auth pages → redirects to `/dashboard`

## Data Fetching

All server state goes through **TanStack React Query v5** via custom hooks in `src/hooks/`:

```typescript
import { useJobs, useCreateJob, useAuth } from '@/hooks';
// or import individual hooks from their files

// All query cache keys are in src/lib/queryKeys.ts
import { queryKeys } from '@/lib/queryKeys';
queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
```

Every resource has a corresponding hook file (`useJobs.ts`, `useApplications.ts`, `useCandidates.ts`, etc.). Mutations call `queryClient.invalidateQueries()` on success — always follow this pattern for new mutations.

Authenticated requests:
```typescript
const { getToken } = useAuth();
const token = await getToken();
const client = createAuthenticatedClient(token); // from src/lib/api.ts
```

## Component Organization

```
src/components/
  DashboardLayout.tsx     Shell with sidebar + header (wraps all dashboard pages)
  Sidebar.tsx             Role-aware navigation sidebar
  NotificationPanel.tsx   Slide-in notification drawer
  UserButton.tsx          Avatar dropdown (sign out, settings)
  profile/                Modals and sections for candidate profile page
  settings/               Modals for email/password change
  brand/                  Brand design system components
```

Dashboard pages use `DashboardLayout` directly — it is a client component. The `src/app/dashboard/layout.tsx` client guard uses `useUser()` to check auth; unauthenticated users get redirected before `DashboardLayout` renders.

## Styling Conventions

- Primary brand green: `oklch(64% 0.2 131.684)` → use `bg-primary`, `text-primary` DaisyUI tokens
- Brand colors are also imported from `src/styles/brand-colors.css` as CSS custom properties
- Landing page (`src/app/page.tsx`) uses **Plus Jakarta Sans** font and brand green `#6B9B5F` — distinct from the dashboard Tailwind/DaisyUI theme
- `src/components/brand/BrandComponents.tsx` has reusable brand-aligned primitives for the landing page

## Types

- `src/types/index.ts` — domain types (User, Job, Application, Candidate, etc.)
- `src/types/api.ts` — API response envelope types
- `src/types/next-auth.d.ts` — augments NextAuth session/token to include `role`, `accessToken`, `id`
