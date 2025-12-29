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
- FastAPI 0.104+ with async/await support
- SQLAlchemy 2.0+ ORM with declarative models
- PostgreSQL 15 (development: port 5433)
- Alembic for database migrations
- NextAuth v5 with JWT authentication (HS256)
- bcrypt for password hashing
- Resend for email delivery (password reset)

**Frontend** (`/frontend`):
- Next.js 14+ (App Router with React Server Components)
- TypeScript with strict type checking
- Tailwind CSS 4 with PostCSS
- NextAuth v5 for authentication with JWT strategy
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

### Adding a New API Endpoint

1. **Backend**:
   - Add route handler in appropriate file under `backend/app/api/`
   - Use `require_user` dependency for basic authentication
   - Use `require_role(UserRole.X)` for role-based access control
   - Use `require_candidate`, `require_employer`, or `require_admin` shortcuts
   - Define Pydantic models for request/response validation
   - Add database operations using SQLAlchemy ORM

2. **Frontend**:
   - Add TypeScript interface in `frontend/src/lib/api.ts`
   - Add API function to appropriate module (e.g., `candidatesAPI`)
   - Get session with NextAuth: `const session = await auth()`
   - Use `createAuthenticatedClient(session.accessToken)` for protected endpoints
   - Handle errors with try/catch and toast notifications (react-hot-toast)

### Database Schema Changes

1. Modify models in `backend/app/models/base.py`
2. Create migration: `alembic revision --autogenerate -m "description"`
3. Review generated migration in `backend/alembic/versions/`
4. Apply migration: `alembic upgrade head`
5. Update TypeScript interfaces in `frontend/src/lib/api.ts`

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

## Deployment

**Backend**: Railway (PostgreSQL + FastAPI)
- Use `backend/deploy.sh` for deployment
- Migrations run automatically via `backend/start.sh`
- Environment variables set in Railway dashboard

**Frontend**: Vercel (Next.js)
- Connected to GitHub repository
- Environment variables set in Vercel dashboard
- Automatic deployments on git push

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
