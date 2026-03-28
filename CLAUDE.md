# CLAUDE.md — IntoWork

> Fichier de contexte injecté automatiquement dans chaque session Claude Code.
> Propriétaire : AGILITYM | Plateforme : IntoWork (SaaS Recrutement B2B2C)
> Langue de travail : **Français exclusivement**

---

## 1. Vue d'ensemble du projet

**IntoWork Search** est une plateforme de recrutement B2B2C avec matching IA, servant candidats et employeurs en Afrique Centrale (Gabon, Cameroun, Congo).

### Statut phases

| Phase | Description | Statut |
|-------|-------------|--------|
| 1–2 | Auth, dashboards, offres, candidatures, notifications, ATS (scoring IA, CV builder, alertes, calendriers, LinkedIn, TargetYM, collaboration) | ✅ Complet |
| 3 | Dashboard admin et gestion plateforme | ✅ Complet (mars 2026) |
| 4 | **AI matching avancé, analytics, intégrations tierces** | 🔄 En cours |

---

## 2. Stack technique

### Backend (`/backend`)

- **FastAPI 0.104+** — full async/await **obligatoire** (AsyncSession, routes async — jamais de SQLAlchemy synchrone)
- **SQLAlchemy 2.0+** — async engine, modèles déclaratifs dans `backend/app/models/base.py`
- **PostgreSQL 15** — dev : port **5433** (pas 5432)
- **Alembic** — migrations dans `backend/alembic/versions/`
- **PyJWT** — HS256 via `NEXTAUTH_SECRET` (partagé avec frontend)
- **SlowAPI** — rate limiting | **Prometheus** — métriques | **Redis** — cache (optionnel)
- **Pydantic V2** — schémas stricts, jamais V1

### Frontend (`/frontend`)

- **Next.js 16** (App Router) + TypeScript strict + React Compiler (`reactCompiler: true` dans `next.config.ts`)
  - ⚠️ Éviter `useMemo`/`useCallback` manuels — React Compiler s'en charge
- **Tailwind CSS 4** — config **inline** dans `src/app/globals.css` via `@plugin "daisyui/theme"` — **pas de `tailwind.config.js`**
- **DaisyUI 5.5+** — classes composants (`btn`, `card`, `modal`) prioritaires sur Tailwind brut
- **NextAuth v5** — stratégie JWT, session 24h
- **TanStack React Query v5** — tout l'état serveur
- **Axios** via `createAuthenticatedClient(token)` depuis `lib/api.ts`
- **React Hot Toast** — notifications

---

## 3. Authentification

NextAuth v5 + CredentialsProvider (`frontend/src/auth.ts`) :

1. Inscription → `/signup` | Connexion → `/signin` (⚠️ **pas** `/auth/signin`)
2. Frontend → `POST /api/auth/signin` → backend retourne JWT access token
3. JWT stocké dans session NextAuth (`session.accessToken`)
4. Tous les appels API : `Authorization: Bearer <token>`
5. Backend vérifie JWT via `NEXTAUTH_SECRET` (HS256)

**Routes auth** : `/signin`, `/signup`, `/forgot-password`, `/reset-password`, `/onboarding`

**Guard dashboard** : `frontend/src/app/dashboard/layout.tsx` est un **client component** utilisant `useUser()` — PAS `auth()` server-side.

**Hooks auth** (`frontend/src/hooks/useNextAuth.ts`) :
- `useAuth()` → `getToken()`, `isSignedIn`, `userId`
- `useUser()` → `user`, `isLoaded`, `isSignedIn`

**Note migration** : Clerk → NextAuth v5 complet. `clerk_id` supprimé (migration `r9i0j1k2l3m4`). `@clerk/nextjs` retiré de package.json.

**`src/middleware.ts`** : wraps `auth()` sur Edge runtime — **PAS renommé** en `proxy.ts`. Ne pas y ajouter d'APIs Node.js.

---

## 4. Routes API backend

Toutes préfixées `/api` :

| Préfixe | Fichier | Description |
|---------|---------|-------------|
| `/api` | `ping.py`, `users.py` | Health check, gestion utilisateurs |
| `/api/auth` | `auth_routes.py` | signup, signin, forgot/reset password |
| `/api/candidates` | `candidates.py` | Profil, CV upload, expériences, formation, compétences |
| `/api/employers` | `employers.py` | Gestion profil employeur |
| `/api/jobs` | `jobs.py` | CRUD offres, recherche filtrée (role-aware) |
| `/api/applications` | `applications.py` | Candidatures, mises à jour statut |
| `/api/companies` | `companies.py` | Gestion entreprises |
| `/api/dashboard` | `dashboard.py` | Stats et activités récentes |
| `/api/notifications` | `notifications.py` | CRUD notifications, mark as read |
| `/api/admin` | `admin.py` | Admin uniquement (gestion users, stats plateforme) |
| `/api/cv-builder` | `cv_builder.py` | CV builder (ATS Phase 2) |
| `/api/ai-scoring` | `ai_scoring.py` | Scoring IA candidats (ATS Phase 2) |
| `/api` | `email_templates.py` | Templates email (ATS Phase 2) |
| `/api` | `job_alerts.py` | Alertes offres (ATS Phase 2) |
| `/api` | `collaboration.py` | Collaboration employeurs (ATS Phase 2) |
| `/api` | `integrations.py` | Intégrations externes (ATS Phase 2) |

Fichiers statiques : `backend/uploads/` servis via `/uploads` (FastAPI StaticFiles + CORS).

---

## 5. Services backend (`backend/app/services/`)

| Service | Description |
|---------|-------------|
| `email_service.py` | Emails Resend (reset password, notifications) |
| `cloudinary_service.py` | Upload images/médias |
| `ai_scoring.py` | Scoring IA candidats (Anthropic SDK direct) |
| `targetym_service.py` | Intégration ATS TargetYM (plateforme AGILITYM) |
| `google_calendar_service.py` | Planification entretiens Google |
| `outlook_calendar_service.py` | Planification entretiens Outlook |
| `linkedin_service.py` | Import profil LinkedIn |

---

## 6. Routes frontend (`frontend/src/app`)

```
/                         Landing page marketing (Plus Jakarta Sans, vert #6B9B5F)
/signin, /signup          Pages auth
/forgot-password          Demande reset password
/reset-password           Formulaire reset (param token dans query)
/onboarding               Sélection rôle (candidat/employeur)
/onboarding/employer      Onboarding employeur spécifique
/dashboard                Dashboard principal (role-aware)
  /candidates             Profil candidat
  /cv                     Gestion CV
  /jobs, /jobs/[id]       Recherche offres et détail
  /applications           Liste candidatures
  /job-posts              Gestion offres employeur
  /company                Paramètres entreprise employeur
  /profile                Paramètres profil utilisateur
  /settings               Compte / notifications / confidentialité
  /ai-scoring/[jobId]     Scoring IA pour une offre (ATS Phase 2)
  /email-templates        Gestionnaire templates email (ATS Phase 2)
  /job-alerts             Alertes offres (ATS Phase 2)
  /integrations           Intégrations externes (ATS Phase 2)
  /admin                  Panel admin
/cv-builder               CV builder public
/cv/[slug]                Viewer CV public
/offres                   Liste offres publique
/entreprises              Annuaire entreprises public
```

**Référence design** : `frontend/design-system.md` — tokens, couleurs, composants, animations brand intowork.co.
Palette brand : `frontend/src/styles/brand-colors.css` | Profil candidat : `frontend/src/styles/profile.css`

---

## 7. Patterns de code

### Pattern async backend (SQLAlchemy)

```python
# Query simple
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

### Dépendances auth backend (`backend/app/auth.py`)

```python
from app.auth import require_user, require_candidate, require_employer, require_admin

async def endpoint(user: Annotated[User, Depends(require_user)]): ...
async def endpoint(candidate: Annotated[Candidate, Depends(require_candidate)]): ...
```

### Pattern React Query (frontend)

```typescript
// Hooks custom — tous dans frontend/src/hooks/
const { data: jobs, isLoading } = useJobs(filters);
const createJob = useCreateJob(); // invalide le cache automatiquement

// Query keys
import { queryKeys } from '@/lib/queryKeys';
queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
```

### Appel API authentifié (frontend)

```typescript
const { getToken } = useAuth();
const token = await getToken();
const client = createAuthenticatedClient(token);
const response = await client.get('/candidates/profile');
```

### Gestion d'erreurs — standard AGILITYM

```python
# Exceptions custom par domaine
class RecruitmentError(Exception): ...
class ApplicationStatusError(RecruitmentError): ...
class CandidateNotFoundError(RecruitmentError): ...

# Logs structurés JSON
import structlog
logger = structlog.get_logger()
logger.error("application_status_error",
    candidate_id=candidate_id,
    job_id=job_id,
    error=str(e)
)

# HTTPException normalisée
raise HTTPException(
    status_code=422,
    detail={"code": "APPLICATION_STATUS_INVALID", "message": "Statut de candidature invalide"}
)
```

---

## 8. Workflow frontend — Claude Code natif

> Claude Code gère le frontend directement en s'appuyant sur `design-system.md`.
> Aucun outil externe n'est requis pour générer du code UI.

### Règle absolue : vérifier `design-system.md` en premier

**AVANT tout code frontend** → vérifier l'existence de `frontend/design-system.md`.

#### Si `design-system.md` N'EXISTE PAS

1. Lire `frontend/src/styles/brand-colors.css` et `frontend/src/app/globals.css`
2. Extraire les tokens existants (couleurs, typographie, espacements)
3. Créer `frontend/design-system.md` à partir des tokens réels du projet
4. Confirmer avec l'utilisateur avant de continuer

#### Si `design-system.md` EXISTE

1. Le lire intégralement
2. S'y conformer strictement pour tout nouveau composant/page

### Principes frontend

- **DaisyUI first** : classes composants DaisyUI avant tout Tailwind brut
- **Cohérence tokens** : CSS variables définies dans `globals.css` uniquement
- **React Compiler actif** : ne jamais ajouter `useMemo`/`useCallback` manuellement
- **Pas de `tailwind.config.js`** : tous les tokens dans `globals.css`
- **TypeScript strict** : aucun `any`, toujours typer props et retours de hooks
- **Responsive mobile-first** sur toutes les vues dashboard

### Workflow nouveau composant/page

```
1. Lire design-system.md
2. Identifier le pattern DaisyUI le plus proche
3. Créer le composant TypeScript avec types stricts
4. Ajouter le hook React Query si données serveur
5. Générer le test Vitest minimal
6. Commit avec message conventionnel
```

---

## 9. Contextes métier permanents

> Ces contextes s'appliquent à **chaque** développement, sans exception.

### 9.1 Conformité OHADA / SYSCOHADA

- Plans comptables SYSCOHADA dans tous les modèles financiers
- Facturation en **FCFA** (XAF/XOF) avec gestion multi-devises implicite
- Archivage légal conforme aux durées OHADA

### 9.2 Intégration Mobile Money — CinetPay

- **CinetPay** comme gateway principal
- Airtel Money et Moov Money comme alternatives
- Gestion des webhooks de confirmation de paiement
- Exceptions custom : `PaymentGatewayError`, `CinetPayWebhookError`

### 9.3 Multi-tenant UEMOA/CEMAC

- Isolation stricte des données par zone économique
- Colonne `zone` sur les modèles concernés : `"UEMOA"` | `"CEMAC"`
- Jamais de fuite de données cross-tenant dans les queries

---

## 10. Actions automatiques systématiques

À inclure dans **chaque** réponse dev quand pertinent :

| Action | Condition de déclenchement |
|--------|---------------------------|
| **Migration Alembic** | Dès qu'un modèle SQLAlchemy est modifié |
| **Tests pytest** | Toute nouvelle route ou service backend |
| **Tests Vitest** | Tout nouveau hook ou composant avec logique |
| **Vérification types** | Valider schémas Pydantic V2 + types TypeScript |
| **Commandes git** | Suggérer commit message conventionnel |

### Format commit (Conventional Commits)

```
feat(candidates): add CV multi-version support
fix(auth): correct token expiry on session refresh
chore(migrations): add zone column to job_application
refactor(ai-scoring): extract scoring logic to service layer
```

---

## 11. Commandes de développement

```bash
# Démarrer les deux services
make dev          # ou ./start-dev.sh (Linux/Mac)

# Backend (activer venv d'abord)
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8001

# Frontend
cd frontend && npm run dev    # port 3000

# Base de données
docker run --name postgres -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=intowork -p 5433:5432 -d postgres:15
alembic upgrade head
alembic revision --autogenerate -m "description"

# Tests
cd backend
python test_api.py              # connectivité API
python test_complete_backend.py # test complet

# Git — dépôts duaux GitHub (toujours via make)
make commit MSG="feat: ..."   # commit + push vers les deux dépôts
make push                     # push vers les deux dépôts
make status-all               # vérifier la synchronisation
```

---

## 12. Variables d'environnement

**`backend/.env`** :
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/intowork
NEXTAUTH_SECRET=<min 32 chars — identique au frontend>
JWT_SECRET=<clé de signature JWT>
RESEND_API_KEY=re_...
FROM_EMAIL=INTOWORK <noreply@intowork.com>
FRONTEND_URL=http://localhost:3000
ANTHROPIC_API_KEY=<requis pour ai_scoring.py>
CLOUDINARY_CLOUD_NAME=<upload images>
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

**`frontend/.env.local`** :
```env
NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET=<identique à NEXTAUTH_SECRET backend>
NEXT_PUBLIC_API_URL=http://localhost:8001/api
```

`DATABASE_URL` est auto-converti de `postgresql://` vers `postgresql+asyncpg://` pour le support async.

---

## 13. Schéma base de données

Modèles core (`backend/app/models/base.py`) :

| Modèle | Description |
|--------|-------------|
| **User** | email, password_hash, role (candidate/employer/admin), first_name, last_name |
| **Candidate** → User (1:1) | profil, CV fields, relations : experiences, educations, skills, cvs |
| **CandidateCV** → Candidate | CVs multiples avec flag `is_active` |
| **Experience**, **Education**, **Skill** → Candidate | cascade delete |
| **Company** | infos entreprise pour employeurs |
| **Employer** → User + Company (1:1) | |
| **Job** → Company | status : draft/active/closed/archived ; `job_type` en VARCHAR |
| **JobApplication** → Candidate + Job | status : applied/pending/viewed/shortlisted/interview/accepted/rejected ; champs `notes` et `cv_id` |
| **CVDocument** → Candidate | CV Builder (5 templates), `slug` pour partage public |
| **CVAnalytics** → CVDocument | tracking vues/téléchargements |
| **Notification** → User | |
| **PasswordResetToken** | usage unique, expiry 24h |
| **Account**, **Session** | support OAuth NextAuth |

⚠️ `job_type` et `location_type` sur Job sont **VARCHAR** (enums convertis en migration `q8h9i0j1k2l3`) — ne pas utiliser `SQLEnum` pour ces colonnes.

---

## 14. Déploiement

| Composant | Plateforme | Notes |
|-----------|------------|-------|
| **Frontend** | Vercel — projet `frontend` | Deploy manuel : `vercel --prod` depuis `frontend/`. Git auto-deploy **non configuré** |
| **Backend** | Railway → `intowork-dashboard-production-1ede.up.railway.app` | `alembic upgrade head` lancé automatiquement via `backend/start.sh` |
| **CORS** | `main.py` | `allowed_origins` + regex `https://intowork[a-z0-9-]*\.vercel\.app` |

⚠️ **Deux projets Vercel** : `frontend` (cible des deploys) et `into-work-dashboard` (sert `intowork.co`). Transfer de domaine requis via Vercel Dashboard.

---

## 15. MCP Servers disponibles

| MCP | Usage |
|-----|-------|
| **Railway MCP** | Déployer backend, voir logs, gérer env vars |
| **Context7 MCP** | Docs à jour FastAPI, Next.js, SQLAlchemy, React Query |
| **Vercel MCP** | Gérer projets et déploiements Vercel |

---

## 16. ECC — Commandes utiles (everything-claude-code)

| Commande | Usage |
|----------|-------|
| `/quality-gate .` | Audit qualité du code courant |
| `/harness-audit` | Vérifier hooks et skills configurés |
| `/tdd` | Mode TDD : tests avant le code |
| `/research-first [sujet]` | Chercher avant de coder |
| `/skill-creator` | Créer un nouveau skill interactivement |

---

## 17. Gotchas critiques

1. **Guard dashboard côté client** — `useUser()`, jamais `auth()` server-side
2. **venv obligatoire** avant tout `python` ou `uvicorn`
3. **`NEXTAUTH_SECRET` identique** dans `backend/.env` et `frontend/.env.local` (`AUTH_SECRET`)
4. **Job enums = VARCHAR** — ne pas utiliser `SQLEnum` pour les colonnes job après migration `q8h9i0j1k2l3`
5. **Préfixe `/api` obligatoire** — `NEXT_PUBLIC_API_URL` doit finir par `/api`
6. **React Query cache** — toujours `queryClient.invalidateQueries()` après mutation
7. **Migrations à relire** avant apply — vérifier compatibilité async dans Alembic
8. **Uploads** stockés dans `backend/uploads/cvs/{candidate_id}/` — servis via `/uploads` avec CORS public
9. **Railway** lance `alembic upgrade head` automatiquement au démarrage
10. **`middleware.ts` ≠ `proxy.ts`** — le rename Next.js 16 n'a PAS été appliqué ; `auth()` tourne sur Edge runtime
11. **AI scoring** nécessite `ANTHROPIC_API_KEY` — `ai_scoring.py` utilise le SDK Anthropic directement
12. **Tailwind inline** — tous les tokens dans `frontend/src/app/globals.css`, jamais dans `tailwind.config.js`
13. **`CandidateProfile` type mismatch** — le backend retourne données user+candidate fusionnées. Caster via `as unknown as UserProfile` dans les pages settings/profil
14. **Deploy Vercel manuel** — toujours `vercel --prod` depuis `frontend/` après push
15. **Pydantic V2 strict** — tous les schémas utilisent `model_config = ConfigDict(...)`, jamais de migration silencieuse vers V1
16. **CI/CD** — GitHub Actions dans `.github/workflows/ci.yml` : syntax check Python, pytest, tsc, ESLint, build Next.js
17. **pool_recycle=3600** — connexions DB recyclées après 1h pour éviter les stales Railway
18. **Enums Literal** — `SignUpRequest.role` et `UpdateApplicationStatusRequest.status` utilisent `Literal[...]` au lieu de `str`
19. **DB constraints** — migration `t2u3v4w5x6y7` : CHECK `salary_min <= salary_max`, index sur `applied_at` et `status`
20. **Logger frontend** — utiliser `import { logger } from '@/lib/logger'` au lieu de `console.log` (filtré par env)
