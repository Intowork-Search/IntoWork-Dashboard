# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

INTOWORK Search is a B2B2C recruitment platform with AI-powered job matching serving candidates and employers.

**Current Status**: ATS Phase 2 complete (February 2026)
- Phases 1-2: Auth, candidate/employer dashboards, job posting, applications, notifications
- ATS Phase 2: AI scoring, CV builder, email templates, job alerts, calendar integrations (Google/Outlook), LinkedIn, TargetYM, employer collaboration
- Phase 3 (In Progress): Admin dashboard and platform management

## Architecture

### Stack

**Backend** (`/backend`):
- FastAPI 0.104+ with **full async/await** (AsyncSession, async routes — never use synchronous SQLAlchemy)
- SQLAlchemy 2.0+ with async engine, declarative models in `backend/app/models/base.py`
- PostgreSQL 15 (development: port **5433**, not default 5432)
- Alembic migrations in `backend/alembic/versions/`
- HS256 JWT via `NEXTAUTH_SECRET` (shared with frontend)
- SlowAPI rate limiting, Prometheus metrics, Redis cache (optional)

**Frontend** (`/frontend`):
- Next.js 16 (App Router), TypeScript strict
- Tailwind CSS 4 (inline theming, no separate config file) + DaisyUI 5.5+
- NextAuth v5 (JWT strategy, 24h session)
- TanStack React Query v5 for all server state
- Axios via `createAuthenticatedClient(token)` from `lib/api.ts`
- React Hot Toast for notifications

### Critical Known Issue — Hardcoded API URL

`frontend/src/lib/getApiUrl.ts` currently **hardcodes the Railway production URL** instead of reading `NEXT_PUBLIC_API_URL`. This means local dev calls hit production. When fixing backend features, check and restore env-var-based routing:

```ts
// Should be:
return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api';
```

### Authentication

NextAuth v5 with CredentialsProvider (`frontend/src/auth.ts`):
1. Sign up → `/signup`, sign in → `/signin` (**not** `/auth/signin`)
2. Frontend calls `POST /api/auth/signin` → backend returns JWT access token
3. JWT stored in NextAuth session (`session.accessToken`)
4. All API calls use `Authorization: Bearer <token>`
5. Backend verifies JWT using `NEXTAUTH_SECRET` (HS256)

**Auth pages (actual routes)**: `/signin`, `/signup`, `/forgot-password`, `/reset-password`, `/onboarding`

**Dashboard auth guard**: `frontend/src/app/dashboard/layout.tsx` is a **client component** using `useUser()` hook — NOT server-side `auth()`. Route protection happens client-side.

**Auth hooks** (`frontend/src/hooks/useNextAuth.ts`):
- `useAuth()` — returns `getToken()`, `isSignedIn`, `userId`
- `useUser()` — returns `user`, `isLoaded`, `isSignedIn`

**Migration note**: Clerk → NextAuth v5. `clerk_id` field in User model is nullable and kept for compatibility. `@clerk/nextjs` in package.json is unused legacy.

### Backend API Routes

All routes prefixed with `/api`:

| Prefix | File | Description |
|--------|------|-------------|
| `/api` | `ping.py`, `users.py` | Health check, user management |
| `/api/auth` | `auth_routes.py` | signup, signin, forgot/reset password |
| `/api/candidates` | `candidates.py` | Profile, CV upload, experiences, education, skills |
| `/api/jobs` | `jobs.py` | Job CRUD, search with filters (role-aware) |
| `/api/applications` | `applications.py`, `applications_update.py` | Job applications, status updates |
| `/api/companies` | `companies.py` | Company management |
| `/api/dashboard` | `dashboard.py` | Stats and recent activities |
| `/api/notifications` | `notifications.py` | Notification CRUD, mark as read |
| `/api/admin` | `admin.py` | Admin-only (user management, platform stats) |
| `/api/cv-builder` | `cv_builder.py` | CV builder (ATS Phase 2) |
| `/api/ai-scoring` | `ai_scoring.py` | AI candidate scoring (ATS Phase 2) |
| `/api` | `email_templates.py` | Email templates (ATS Phase 2) |
| `/api` | `job_alerts.py` | Job alerts (ATS Phase 2) |
| `/api` | `collaboration.py` | Employer collaboration (ATS Phase 2) |
| `/api` | `integrations.py` | External integrations (ATS Phase 2) |

Static files: `backend/uploads/` served at `/uploads` via FastAPI StaticFiles with CORS headers.

### Backend Services (`backend/app/services/`)

- `email_service.py` — Resend email (password reset, notifications)
- `cloudinary_service.py` — Image/media uploads
- `ai_scoring.py` — AI-powered candidate scoring
- `targetym_service.py` — TargetYM ATS integration
- `google_calendar_service.py` / `outlook_calendar_service.py` — Interview scheduling
- `linkedin_service.py` — LinkedIn profile import

### Frontend Routes (`frontend/src/app`)

```
/                         Marketing landing page (page.tsx — Plus Jakarta Sans, green #6B9B5F)
/signin, /signup          Auth pages
/forgot-password          Password reset request
/reset-password           Reset form (with token query param)
/onboarding               Role selection (candidate/employer)
/onboarding/employer      Employer-specific onboarding
/dashboard                Main dashboard (role-aware)
  /candidates             Candidate profile
  /cv                     CV management
  /jobs, /jobs/[id]       Job search and detail
  /applications           Applications list
  /job-posts              Employer job management
  /company                Employer company settings
  /settings               Account/notifications/privacy
  /ai-scoring/[jobId]     AI scoring for a job (ATS Phase 2)
  /email-templates        Email templates manager (ATS Phase 2)
  /job-alerts             Job alerts (ATS Phase 2)
  /integrations           External integrations (ATS Phase 2)
  /admin                  Admin panel
/cv-builder               Public CV builder
/cv/[slug]                Public CV viewer
/offres                   Public job listings
/entreprises              Public company directory
/templates-final/         5 landing page template variants (template-13 to 17) — design exploration
```

**Landing page design reference**: `frontend/design-system.md` — tokens, colors, components, animations for intowork.co brand.

### Key Patterns

**Backend async pattern**:
```python
# Query
result = await db.execute(select(Model).filter(Model.field == value))
obj = result.scalar_one_or_none()

# Count
result = await db.execute(select(func.count()).select_from(Model))
count = result.scalar()

# Eager loading
result = await db.execute(
    select(Model).options(selectinload(Model.relationship))
)
```

**Auth dependencies** (from `backend/app/auth.py`):
```python
from app.auth import require_user, require_candidate, require_employer, require_admin

async def endpoint(user: Annotated[User, Depends(require_user)]): ...
async def endpoint(candidate: Annotated[Candidate, Depends(require_candidate)]): ...
```

**React Query pattern** (frontend):
```typescript
// Use custom hooks — all defined in frontend/src/hooks/
const { data: jobs, isLoading } = useJobs(filters);
const createJob = useCreateJob(); // auto-invalidates cache on success

// Query keys
import { queryKeys } from '@/lib/queryKeys';
queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
```

**Authenticated API call**:
```typescript
const { getToken } = useAuth();
const token = await getToken();
const client = createAuthenticatedClient(token);
const response = await client.get('/candidates/profile');
```

## Development Commands

```bash
# Start both services
make dev          # or ./start-dev.sh

# Backend (activate venv first)
cd backend
source venv/bin/activate      # Windows: venv\Scripts\activate
uvicorn app.main:app --reload --port 8001

# Frontend
cd frontend && npm run dev    # port 3000

# Database
docker run --name postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=intowork -p 5433:5432 -d postgres:15
alembic upgrade head
alembic revision --autogenerate -m "description"

# Tests
cd backend
python test_api.py              # API connectivity
python test_complete_backend.py # Comprehensive

# Git (dual GitHub repos — always use make)
make commit MSG="message"   # commit + push to both repos
make push                   # push to both repos
make status-all             # check sync status
```

## Environment Variables

**`backend/.env`**:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/intowork
NEXTAUTH_SECRET=<min 32 chars — must match frontend>
JWT_SECRET=<jwt signing key>
RESEND_API_KEY=re_...
FROM_EMAIL=INTOWORK <noreply@intowork.com>
FRONTEND_URL=http://localhost:3000
```

**`frontend/.env.local`**:
```
NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET=<same as backend NEXTAUTH_SECRET>
NEXT_PUBLIC_API_URL=http://localhost:8001/api
```

`DATABASE_URL` is auto-converted from `postgresql://` to `postgresql+asyncpg://` for async support.

## Database Schema

Core models (`backend/app/models/base.py`):
- **User** — email, password_hash, role (candidate/employer/admin), first_name, last_name, clerk_id (legacy nullable)
- **Candidate** → User (1:1) — profile, CV fields, relations: experiences, educations, skills, cvs
- **CandidateCV** → Candidate — multiple CVs with is_active flag
- **Experience**, **Education**, **Skill** → Candidate (cascade delete)
- **Company** — company info for employers
- **Employer** → User + Company (1:1)
- **Job** → Company — status: draft/active/closed/archived; job_type stored as VARCHAR (not enum, after migration)
- **JobApplication** → Candidate + Job — status: applied/pending/viewed/shortlisted/interview/accepted/rejected
- **Notification** → User
- **PasswordResetToken** — single-use, 24h expiry
- **Account**, **Session** — NextAuth OAuth support

**Note**: `job_type` and `location_type` columns on Job are VARCHAR (enums were converted in migration `q8h9i0j1k2l3`).

## Deployment

- **Frontend**: Vercel → `intowork.co`, auto-deploys from GitHub main
- **Backend**: Railway → `intowork-dashboard-production-1ede.up.railway.app`, migrations run automatically via `backend/start.sh`
- CORS: `allowed_origins` in `main.py` + regex `https://.*\.vercel\.app` for preview URLs

### MCP Servers Available

- **Railway MCP**: deploy backend, view logs, manage env vars
- **Context7 MCP**: query up-to-date docs for FastAPI, Next.js, SQLAlchemy, React Query

## Key Gotchas

1. **getApiUrl.ts is hardcoded** to Railway prod URL — fix for local dev by restoring `NEXT_PUBLIC_API_URL` env var
2. **Dashboard layout is client-side guard** — uses `useUser()` hook, not `auth()` server-side
3. **Backend venv required** before any `python` or `uvicorn` commands
4. **NEXTAUTH_SECRET must be identical** in backend `.env` and frontend `.env.local`
5. **Job enums are VARCHAR** in DB (after `q8h9i0j1k2l3` migration) — don't use SQLEnum for new job-related queries
6. **`/api` prefix required** — `NEXT_PUBLIC_API_URL` must end with `/api`
7. **React Query cache** — always call `queryClient.invalidateQueries()` after mutations
8. **Migrations must be reviewed** before applying — check async compatibility in Alembic versions
9. **File uploads** stored at `backend/uploads/cvs/{candidate_id}/` — served at `/uploads` with public CORS
10. **Railway startup** runs `alembic upgrade head` automatically — new migrations deploy on next push
