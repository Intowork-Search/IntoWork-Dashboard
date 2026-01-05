# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

INTOWORK Search is a B2B2C recruitment platform with AI-powered job matching. The platform serves two main user types: candidates seeking jobs and employers managing hiring.

**Current Status**: Phase 2 - Multi-Role Dashboard (Complete)
- Phase 1 (Complete): Foundation with NextAuth authentication, user management
- Phase 2 (Complete): Candidate and Employer dashboards with full functionality
  - Candidate: Profile, CV upload, job search, applications, notifications
  - Employer: Company profile, job posting management, application tracking, notifications
- Phase 3 (In Progress): Admin dashboard and platform management
- Phase 4 (Planned): AI matching system and advanced analytics

## Architecture

### Stack Overview

**Backend** (`/backend`):
- FastAPI 0.104+ with **full async/await support** (AsyncSession, async routes)
- SQLAlchemy 2.0+ ORM with **async engine** and declarative models
- PostgreSQL 15 (development: port 5433)
- Alembic for database migrations
- NextAuth v5 with JWT authentication (HS256)
- bcrypt for password hashing
- Resend for email delivery (password reset)
- SlowAPI for rate limiting

**Frontend** (`/frontend`):
- Next.js 16 (App Router with React Server Components)
- TypeScript with strict type checking
- Tailwind CSS 4 with PostCSS
- DaisyUI 5.5+ for component library
- NextAuth v5 for authentication with JWT strategy
- **TanStack React Query v5** for server state management and caching
- Axios for API communication
- React Hot Toast for notifications

### Authentication Flow

The application uses **NextAuth v5** for authentication with native JWT:

1. User signs up via `/auth/signup` with email/password (bcrypt hashing)
2. User signs in via `/auth/signin` - backend returns JWT access token
3. NextAuth stores JWT in session (client-side, 24-hour expiration)
4. User completes onboarding at `/onboarding` to set role (candidate/employer)
5. Backend creates role-specific profile (Candidate or Employer record)
6. All authenticated API calls include `Authorization: Bearer <jwt-token>` header
7. Backend validates JWT using NEXTAUTH_SECRET (HS256 algorithm)
8. Password reset via email tokens (Resend service, 24-hour expiration)

**Key Authentication Files**:
- Backend: `backend/app/auth.py` - Auth class with JWT verification, PasswordHasher
- Backend: `backend/app/services/email_service.py` - EmailService for password reset
- Frontend: `frontend/src/auth.ts` - NextAuth v5 configuration with CredentialsProvider
- Frontend: `frontend/src/lib/api.ts` - createAuthenticatedClient() function

**Migration Note**: Project was migrated from Clerk to NextAuth v5, saving $300k-600k/year. Legacy `clerk_id` field remains in User model for transition purposes but is nullable.

### Database Schema

**Core Models** (in `backend/app/models/base.py`):

1. **User** - Base user account with NextAuth
   - `email` (unique): User email address
   - `password_hash`: bcrypt hashed password
   - `role`: Enum (candidate, employer, admin)
   - `first_name`, `last_name`, `name`: User identification
   - `email_verified`: Timestamp of email verification
   - `image`: Avatar URL (optional)
   - `clerk_id` (legacy, nullable): From previous Clerk migration
   - Relations: `candidate` (one-to-one), `employer` (one-to-one), `accounts`, `sessions`

2. **Candidate** - Candidate profile and preferences
   - Links to User via `user_id` (one-to-one)
   - Profile: `title`, `summary`, `phone`, `location`
   - CV fields: `cv_url`, `cv_filename`, `cv_uploaded_at`
   - Relations: `experiences`, `educations`, `skills`, `cvs` (multiple CV support)

3. **CandidateCV** - Multiple CV file management
   - Links to Candidate via `candidate_id`
   - `filename`, `file_path`, `file_size`, `is_active`

4. **Experience**, **Education**, **Skill** - Candidate profile details
   - All link to Candidate via `candidate_id`
   - Cascade delete when candidate is deleted

5. **Company** - Company information for employers
   - Company details, industry, size, location, branding

6. **Employer** - Employer profile linking User to Company
   - Links User to Company with permissions

7. **Job** - Job postings
   - Links to Company via `company_id`
   - `status`: draft, active, closed, archived
   - `location_type`: on_site, remote, hybrid
   - `job_type`: full_time, part_time, contract, temporary, internship

8. **JobApplication** - Candidate applications to jobs
   - Links Candidate to Job with application status
   - `status`: applied, pending, viewed, shortlisted, interview, accepted, rejected
   - Tracks application lifecycle and has_applied flag

9. **Session** - NextAuth session management
   - Links to User via `user_id`
   - `session_token`: Unique session identifier
   - `expires`: Session expiration timestamp

10. **Account** - OAuth provider accounts (NextAuth)
   - Links to User via `user_id`
   - Supports multiple OAuth providers per user

11. **PasswordResetToken** - Password reset tokens
   - `email`: User email requesting reset
   - `token`: Unique reset token (UUID)
   - `expires`: Token expiration (24 hours)
   - Single-use tokens, deleted after use

12. **Notification** - User notifications
   - Links to User via `user_id`
   - `type`: Notification type (new_application, status_change, etc.)
   - `is_read`: Read status tracking
   - Supports real-time notification system

### API Structure

**Backend API** (`/backend/app/api`):
- `auth_routes.py` - Authentication (signup, signin, password reset request/reset)
- `users.py` - User CRUD operations, profile management
- `candidates.py` - Candidate profiles, CV upload, experiences, education, skills
- `employers.py` - Employer-specific profile operations
- `companies.py` - Company management for employers
- `jobs.py` - Job posting CRUD, search with filters (role-aware)
- `applications.py` - Job applications (candidate & employer views)
- `applications_update.py` - Application status updates
- `dashboard.py` - Dashboard stats and recent activities
- `notifications.py` - Notification CRUD, mark as read
- `admin.py` - Admin-only routes (user management, platform stats)
- `ping.py` - Health check endpoint

**Frontend API Client** (`/frontend/src/lib/api.ts`):
- Centralized API client with axios
- `createAuthenticatedClient(token)` for auth'd requests
- Typed interfaces for all API responses
- API modules: `authAPI`, `candidatesAPI`, `jobsAPI`, `applicationsAPI`, `companiesAPI`, `dashboardAPI`

### Frontend Structure

**App Router Structure** (`/frontend/src/app`):
- `/` - Marketing landing page
- `/auth/signin`, `/auth/signup` - NextAuth authentication pages
- `/auth/forgot-password` - Password reset request page
- `/auth/reset-password` - Password reset form (with token)
- `/onboarding` - Role selection after signup
- `/dashboard` - Main dashboard (role-based routing)
  - `/dashboard/candidates` - Candidate pages (profile, CV, applications)
  - `/dashboard/job-posts` - Employer job management
  - `/dashboard/company` - Employer company settings
  - `/dashboard/settings` - User settings (account, notifications, privacy)
  - `/dashboard/jobs` - Job search and browsing
  - `/dashboard/jobs/[id]` - Job detail page with apply functionality

**Component Organization** (`/frontend/src/components`):
- `DashboardLayout.tsx` - Main dashboard wrapper with sidebar
- `Sidebar.tsx` - Navigation sidebar (role-aware)
- `ToastProvider.tsx` - Toast notification wrapper (react-hot-toast)
- `ToggleButton.tsx` - Reusable toggle component
- `profile/` - Profile-specific components

### File Upload System

CV uploads are handled via:
1. Frontend sends multipart/form-data to `/api/candidates/cv/upload`
2. Backend saves to `backend/uploads/cvs/{candidate_id}/` directory
3. File metadata stored in `CandidateCV` table
4. Files served via FastAPI StaticFiles at `/uploads` endpoint
5. Support for multiple CVs per candidate with `is_active` flag

## Development Commands

### Quick Start

```bash
# Start both backend and frontend simultaneously
./start-dev.sh
# OR
make dev
```

### Backend Commands

```bash
cd backend

# Start development server (port 8001)
uvicorn app.main:app --reload --port 8001

# Start PostgreSQL (Docker)
docker run --name postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=intowork -p 5433:5432 -d postgres:15

# Database migrations
alembic upgrade head                    # Apply all migrations
alembic revision --autogenerate -m "Description"  # Create new migration
alembic downgrade -1                    # Rollback one migration

# Test API connectivity
python test_api.py
```

### Frontend Commands

```bash
cd frontend

# Start development server (port 3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Makefile Commands

```bash
make help       # Show all commands
make dev        # Start both services
make backend    # Start backend only
make frontend   # Start frontend only
make install    # Install all dependencies
make stop       # Stop all services
make clean      # Clean temporary files

# Git automation (dual-repo: GitHub + GitLab)
make push       # Push to both GitHub and GitLab
make commit MSG="message"  # Commit and push to both repos
make sync       # Synchronize both repositories
make status-all # Show status of both repos
```

### Testing

```bash
# Backend API tests
cd backend
python test_api.py              # Basic API connectivity test
python test_password_reset.py   # Test password reset flow
python test_auth_jobs.py        # Test authentication and job endpoints

# Test deployment readiness
./test-railway-deployment.sh    # Test Railway deployment configuration
./test-pre-push.sh              # Pre-push verification checks
```

## Environment Configuration

### Backend `.env`

Required variables in `backend/.env`:
```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/intowork

# NextAuth JWT Configuration (must match frontend)
NEXTAUTH_SECRET=your-nextauth-secret-min-32-characters
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_ALGORITHM=HS256

# Email Service (Resend) - for password reset
RESEND_API_KEY=re_your_resend_api_key_here
FROM_EMAIL=INTOWORK <noreply@intowork.com>
FRONTEND_URL=http://localhost:3000

# Optional: General security
SECRET_KEY=your-super-secret-key-change-me-in-production

# Optional: Deployment
RAILWAY_ENVIRONMENT=production  # For Railway deployment
```

### Frontend `.env.local`

Required variables in `frontend/.env.local`:
```env
# NextAuth Configuration (must match backend NEXTAUTH_SECRET)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-min-32-characters-same-as-backend
AUTH_SECRET=your-nextauth-secret-min-32-characters-same-as-backend  # Alias for NextAuth v5

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8001/api  # Development
# NEXT_PUBLIC_API_URL=https://your-api.railway.app/api  # Production

# Environment
NODE_ENV=development
```

## Key Development Patterns

### Async/Await Backend (SQLAlchemy 2.0)

**IMPORTANT**: All backend routes and database operations use async/await. See `backend/ASYNC_PATTERN_REFERENCE.md` for migration guide.

**Key Patterns**:
```python
# Database dependency
async def get_db() -> AsyncGenerator[AsyncSession, None]

# Query pattern
result = await db.execute(select(Model).filter(Model.field == value))
obj = result.scalar_one_or_none()  # or .scalars().all()

# Count pattern
result = await db.execute(select(func.count()).select_from(Model))
count = result.scalar()

# Update pattern
await db.execute(update(Model).where(Model.id == id).values(field=value))
await db.commit()

# Eager loading relationships
result = await db.execute(
    select(Model).options(selectinload(Model.relationship))
)
```

**Reference Documents**:
- `backend/ASYNC_PATTERN_REFERENCE.md` - Complete async patterns guide
- `backend/ASYNC_MIGRATION_PATTERNS.md` - Migration examples for all API routes

### React Query for Data Fetching (Frontend)

**IMPORTANT**: All data fetching uses React Query for caching, revalidation, and optimistic updates.

**Setup Files**:
- `frontend/src/lib/queryClient.ts` - QueryClient configuration
- `frontend/src/lib/queryKeys.ts` - Centralized cache keys
- `frontend/src/components/QueryProvider.tsx` - Provider wrapper
- `frontend/src/hooks/*` - Custom hooks per resource (useJobs, useApplications, etc.)

**Key Patterns**:
```typescript
// Using custom hooks
const { data: jobs, isLoading } = useJobs(filters);
const { data: applications } = useApplications(candidateId);

// Mutations with automatic cache invalidation
const createJobMutation = useCreateJob();
await createJobMutation.mutateAsync(jobData);
// Cache automatically invalidated via onSuccess callback

// Query keys
import { queryKeys } from '@/lib/queryKeys';
queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
```

**Reference Documents**:
- `frontend/REACT_QUERY_SETUP.md` - Setup and configuration guide
- `frontend/REACT_QUERY_HOOKS.md` - Hook usage patterns

### Adding a New API Endpoint

1. **Backend**:
   - Add **async** route handler in appropriate file under `backend/app/api/`
   - Use `require_user` dependency for basic authentication
   - Use `require_role(UserRole.X)` for role-based access control
   - Use `require_candidate`, `require_employer`, or `require_admin` shortcuts
   - Define Pydantic models for request/response validation
   - Use **async/await** for all database operations (see async patterns above)

2. **Frontend**:
   - Add TypeScript interface in `frontend/src/lib/api.ts`
   - Add API function to appropriate module (e.g., `candidatesAPI`)
   - Create custom React Query hook in `frontend/src/hooks/`
   - Use query keys from `frontend/src/lib/queryKeys.ts`
   - Implement cache invalidation in mutation callbacks
   - Handle errors with try/catch and toast notifications (react-hot-toast)

### Database Schema Changes

1. Modify models in `backend/app/models/base.py`
2. Create migration: `alembic revision --autogenerate -m "description"`
3. **IMPORTANT**: Review generated migration in `backend/alembic/versions/`
   - Verify async compatibility (use `await op.run_async()` if needed)
   - Check for missing indexes (see `PostgreSQL_Database_Analysis.md` for optimization guide)
   - Ensure proper constraints and foreign keys
4. Apply migration: `alembic upgrade head`
5. Update TypeScript interfaces in `frontend/src/lib/api.ts`
6. Update React Query hooks if response shape changed

**Performance Note**: Recent database analysis identified 15 critical missing indexes. See `PostgreSQL_Database_Analysis.md` for optimization opportunities. A production-ready migration is available at `backend/alembic/versions/h8c2d6e5f4g3_critical_indexes_and_constraints.py`.

### Role-Based Access Control

- Check user role via `user.role` enum: `UserRole.CANDIDATE`, `UserRole.EMPLOYER`, `UserRole.ADMIN`
- Frontend: Use `await auth()` from NextAuth to get session with user role
- Frontend: Access user info via `session.user.role`, `session.user.email`, etc.
- Backend: Use `require_user` to get authenticated user (any role)
- Backend: Use `require_role(UserRole.X)` to enforce specific roles
- Backend shortcuts: `require_candidate`, `require_employer`, `require_admin`, `require_employer_or_admin`
- Candidate routes: `/dashboard/candidates/*`, `/api/candidates/*`
- Employer routes: `/dashboard/job-posts/*`, `/dashboard/company/*`, `/api/jobs/*`, `/api/companies/*`, `/api/employers/*`
- Admin routes: `/dashboard/admin/*`, `/api/admin/*`

### Job Application System

The application system uses a `has_applied` flag for efficient checking:
- `has_applied` is computed dynamically when fetching jobs (if user is authenticated)
- Backend checks `JobApplication` table for existing application
- Frontend uses this flag to show "Applied" vs "Apply Now" buttons
- Applications are soft-deleted (status changes, not removed from DB)

### Password Reset System

Password reset uses email-based token flow:
1. User requests reset at `/auth/forgot-password` (frontend)
2. Backend generates UUID token, stores in `PasswordResetToken` table (24h expiration)
3. Email sent via Resend service with reset link containing token
4. User clicks link, redirected to `/auth/reset-password?token=xxx`
5. Frontend submits new password with token to backend
6. Backend validates token, hashes new password with bcrypt, updates user
7. Token is deleted after successful use (single-use)

**Key Files**:
- Backend: `backend/app/api/auth_routes.py` - `/auth/forgot-password` and `/auth/reset-password` endpoints
- Backend: `backend/app/services/email_service.py` - Email template and Resend integration
- Frontend: `frontend/src/app/auth/forgot-password/page.tsx` - Request form
- Frontend: `frontend/src/app/auth/reset-password/page.tsx` - Reset form with token

**Note**: Email service gracefully degrades if Resend API key not configured (logs warning but doesn't crash)

### Password Validation and Security

The platform implements comprehensive password validation:

**Frontend Components**:

- `frontend/src/lib/passwordValidation.ts` - Validation logic and strength calculation
- `frontend/src/components/PasswordStrengthIndicator.tsx` - Visual strength indicator

**Password Requirements**:


- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character
- Visual strength indicator (weak/medium/strong/very strong)

**Implementation Pattern**:

```typescript
import { validatePassword, getPasswordStrength } from '@/lib/passwordValidation';

const validation = validatePassword(password);
const strength = getPasswordStrength(password);
// validation: { isValid: boolean, errors: string[] }
// strength: { score: 0-4, label: string, color: string }
```

Used in:

- Sign up page (`/auth/signup`)
- Password reset page (`/auth/reset-password`)
- Change password modal (dashboard settings)

## Deployment

**Backend**: Railway (PostgreSQL + FastAPI)
- Use `./scripts/deploy-railway.sh` for backend deployment
- Or use `./scripts/deploy-all.sh` to deploy both backend and frontend
- Migrations run automatically via `backend/start.sh`
- Environment variables set in Railway dashboard

**Frontend**: Vercel (Next.js)
- Use `./scripts/deploy-vercel.sh` for frontend deployment
- Or use `./scripts/deploy-all.sh` to deploy both backend and frontend
- Connected to GitHub repository
- Environment variables set in Vercel dashboard
- Automatic deployments on git push

**Deployment Utilities** (`/scripts`):

- `deploy-all.sh` - Deploy both backend and frontend
- `deploy-railway.sh` - Deploy backend to Railway
- `deploy-vercel.sh` - Deploy frontend to Vercel
- `generate-secrets.sh` - Generate secure environment secrets
- `verify-deployment.sh` - Verify deployment status
- `push-all.sh` - Push to GitHub and GitLab simultaneously
- `commit-and-push-all.sh` - Commit and push to both repos
- `setup-github-ssh.sh` - Setup GitHub SSH authentication

**Documentation**: See `docs/deployment/` for detailed deployment guides

## Project Documentation

The project has comprehensive documentation organized in the `docs/` directory:

- **Guides** (`docs/guides/`) - Installation, quickstart, implementation guides
- **Deployment** (`docs/deployment/`) - Railway, Vercel deployment guides and checklists
- **Authentication** (`docs/authentication/`) - Password reset, authentication setup
- **Email** (`docs/email/`) - Email service configuration and templates
- **API** (`docs/api/`) - API documentation and examples
- **Design** (`docs/design/`) - UI/UX design guidelines
- **Git Automation** (`docs/git-automation/`) - Dual-repo setup and workflows

See `docs/README.md` for complete documentation index.

## Git Repository Setup

This project uses a **dual-repository setup** for redundancy:

- **Primary**: GitLab (origin)
- **Mirror**: GitHub (old-origin)

All git operations are automated via scripts in `/scripts`:

- Push to both repos: `make push` or `./scripts/push-all.sh`
- Commit and push: `make commit MSG="message"`
- Check status: `make status-all`

## Common Gotchas

1. **Port Configuration**: Backend uses port 8001 (not 8000) to avoid conflicts
2. **PostgreSQL Port**: Development DB uses port 5433 (not default 5432)
3. **CORS**: Backend explicitly allows frontend origins in `main.py`
4. **Token Format**: Always use `Bearer <token>` in Authorization header
5. **NEXTAUTH_SECRET Sync**: Must be identical in both backend and frontend `.env` files
6. **API URL**: Frontend `NEXT_PUBLIC_API_URL` MUST include `/api` suffix (e.g., `http://localhost:8001/api`) since all backend routes use this prefix
7. **JWT Algorithm**: Backend uses HS256 (symmetric) not RS256 (asymmetric like Clerk)
8. **Password Hashing**: Use `PasswordHasher.hash_password()` and `verify_password()` from `auth.py`
9. **Email Service**: Resend API key required for password reset; gracefully disabled if not configured
10. **File Uploads**: Backend serves uploads via `/uploads` StaticFiles mount
11. **has_applied Flag**: Only available when user is authenticated; computed per-request
12. **Migration Order**: Always review autogenerated migrations before applying
13. **Session Strategy**: NextAuth uses JWT strategy (not database sessions) for performance
14. **Legacy Fields**: `clerk_id` field in User model is nullable and kept for migration compatibility
15. **Dual Repos**: Always push to both GitHub and GitLab using `make push` to keep them in sync
16. **Async/Await**: ALL backend routes and database operations use async/await - never use synchronous SQLAlchemy patterns
17. **React Query Cache**: Frontend data is cached - use `queryClient.invalidateQueries()` after mutations to ensure UI updates
18. **Database Performance**: Check `PostgreSQL_Database_Analysis.md` before writing queries that scan large tables
