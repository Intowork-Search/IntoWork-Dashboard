# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

INTOWORK Search is a B2B2C recruitment platform with AI-powered job matching. The platform serves two main user types: candidates seeking jobs and employers managing hiring.

**Current Status**: Phase 2 - Candidate Dashboard (Active Development)
- Phase 1 (Complete): Foundation with authentication, basic user management
- Phase 2 (In Progress): Candidate dashboard with profile, CV management, job applications
- Phase 3 (Planned): Employer dashboard with ATS (Applicant Tracking System)
- Phase 4 (Planned): AI matching system

## Architecture

### Stack Overview

**Backend** (`/backend`):
- FastAPI 0.104+ with async/await support
- SQLAlchemy 2.0+ ORM with declarative models
- PostgreSQL 15 (development: port 5433)
- Alembic for database migrations
- Clerk Backend API 4.2+ for authentication

**Frontend** (`/frontend`):
- Next.js 14 (App Router with React Server Components)
- TypeScript with strict type checking
- Tailwind CSS 4 with PostCSS
- Clerk Next.js for authentication
- Axios for API communication

### Authentication Flow

The application uses **Clerk** for authentication with a custom sync flow:

1. User signs up/signs in via Clerk (supports Microsoft/Azure AD)
2. Frontend receives Clerk session and JWT token
3. Frontend calls `/api/auth/sync` to create/update user in backend database
4. User completes onboarding at `/onboarding` to set role (candidate/employer)
5. Backend creates role-specific profile (Candidate or Employer record)
6. All authenticated API calls include `Authorization: Bearer <clerk-token>` header
7. Backend validates JWT using Clerk PEM public key (RS256 algorithm)

**Key Authentication Files**:
- Backend: `backend/app/auth.py` - ClerkAuth class with JWT verification
- Frontend: `frontend/src/lib/api.ts` - createAuthenticatedClient() function
- Middleware: `frontend/src/middleware.ts.bak` - Route protection (currently not active)

### Database Schema

**Core Models** (in `backend/app/models/base.py`):

1. **User** - Base user account linked to Clerk
   - `clerk_id` (unique): Links to Clerk authentication
   - `role`: Enum (candidate, employer, admin)
   - `email`, `first_name`, `last_name`
   - Relations: `candidate` (one-to-one), `employer` (one-to-one)

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

### API Structure

**Backend API** (`/backend/app/api`):
- `auth.py` - Authentication, user sync, onboarding
- `users.py` - User CRUD operations
- `candidates.py` - Candidate profiles, CV upload, experiences, education, skills
- `companies.py` - Company management for employers
- `jobs.py` - Job posting CRUD, search with filters
- `applications.py` - Job applications (candidate & employer views)
- `dashboard.py` - Dashboard stats and recent activities
- `ping.py` - Health check endpoint

**Frontend API Client** (`/frontend/src/lib/api.ts`):
- Centralized API client with axios
- `createAuthenticatedClient(token)` for auth'd requests
- Typed interfaces for all API responses
- API modules: `authAPI`, `candidatesAPI`, `jobsAPI`, `applicationsAPI`, `companiesAPI`, `dashboardAPI`

### Frontend Structure

**App Router Structure** (`/frontend/src/app`):
- `/` - Marketing landing page
- `/sign-in`, `/sign-up` - Clerk authentication pages
- `/onboarding` - Role selection after signup
- `/dashboard` - Main dashboard (role-based routing)
  - `/dashboard/candidates` - Candidate pages (profile, CV, applications)
  - `/dashboard/job-posts` - Employer job management
  - `/dashboard/company` - Employer company settings
  - `/dashboard/settings` - User settings (notifications, privacy)
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
# Clerk authentication
CLERK_SECRET_KEY=sk_test_xxxxx
CLERK_PEM_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----xxxxx

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/intowork

# Optional: Deployment
RAILWAY_ENVIRONMENT=production  # For Railway deployment
```

### Frontend `.env.local`

Required variables in `frontend/.env.local`:
```env
# Clerk public keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# Clerk routes
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8001/api  # Development
# NEXT_PUBLIC_API_URL=https://your-api.railway.app/api  # Production
```

## Key Development Patterns

### Adding a New API Endpoint

1. **Backend**:
   - Add route handler in appropriate file under `backend/app/api/`
   - Use `ClerkAuth.get_current_user()` dependency for protected routes
   - Define Pydantic models for request/response validation
   - Add database operations using SQLAlchemy ORM

2. **Frontend**:
   - Add TypeScript interface in `frontend/src/lib/api.ts`
   - Add API function to appropriate module (e.g., `candidatesAPI`)
   - Use `createAuthenticatedClient(token)` for protected endpoints
   - Handle errors with try/catch and toast notifications

### Database Schema Changes

1. Modify models in `backend/app/models/base.py`
2. Create migration: `alembic revision --autogenerate -m "description"`
3. Review generated migration in `backend/alembic/versions/`
4. Apply migration: `alembic upgrade head`
5. Update TypeScript interfaces in `frontend/src/lib/api.ts`

### Role-Based Access Control

- Check user role via `user.role` (candidate, employer, admin)
- Frontend: Use `useUser()` from Clerk to check authentication
- Backend: Use `ClerkAuth.get_current_user()` to get authenticated user
- Candidate routes: `/dashboard/candidates/*`, `/api/candidates/*`
- Employer routes: `/dashboard/job-posts/*`, `/dashboard/company/*`, `/api/jobs/*`, `/api/companies/*`

### Job Application System

The application system uses a `has_applied` flag for efficient checking:
- `has_applied` is computed dynamically when fetching jobs (if user is authenticated)
- Backend checks `JobApplication` table for existing application
- Frontend uses this flag to show "Applied" vs "Apply Now" buttons
- Applications are soft-deleted (status changes, not removed from DB)

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
5. **Clerk Issuer**: JWT validation requires correct issuer URL (check `auth.py`)
6. **File Uploads**: Backend serves uploads via `/uploads` StaticFiles mount
7. **has_applied Flag**: Only available when user is authenticated; computed per-request
8. **Migration Order**: Always review autogenerated migrations before applying
