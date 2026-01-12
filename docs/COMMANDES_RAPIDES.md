# COMMANDES RAPIDES - INTOWORK DASHBOARD
**Reference Rapide** | **2026-01-05**

---

## DATABASE MIGRATION (URGENT)

### Backup Database
```bash
cd /home/jdtkd/IntoWork-Dashboard/backend
pg_dump -h localhost -p 5433 -U postgres -d intowork > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Appliquer Migration Critique
```bash
python3 -m alembic upgrade head
python3 -m alembic current  # Vérifier: h8c2d6e5f4g3
```

### Rollback (si problème)
```bash
python3 -m alembic downgrade -1
```

---

## GIT WORKFLOW

### Commit Composants Frontend
```bash
cd /home/jdtkd/IntoWork-Dashboard

git add frontend/src/components/PasswordStrengthIndicator.tsx
git add frontend/src/components/QueryProvider.tsx
git add frontend/src/lib/passwordValidation.ts
git add frontend/src/lib/queryKeys.ts

git commit -m "feat(frontend): Add password validation and React Query provider"
```

### Commit Auth Pages
```bash
git add frontend/src/app/auth/signin/page.tsx
git add frontend/src/app/auth/signup/page.tsx
git add frontend/src/app/auth/forgot-password/page.tsx
git add frontend/src/app/auth/reset-password/page.tsx

git commit -m "refactor(frontend): Migrate auth pages to React Query"
```

### Commit Dashboard Pages
```bash
git add frontend/src/app/dashboard/admin/page.tsx
git add frontend/src/app/dashboard/candidates/page.tsx
git add frontend/src/app/dashboard/company/page.tsx
git add frontend/src/app/dashboard/job-posts/page.tsx
git add frontend/src/app/dashboard/jobs/page.tsx
git add frontend/src/app/dashboard/page.tsx

git commit -m "refactor(frontend): Migrate dashboard pages to React Query"
```

### Commit Components & Layouts
```bash
git add frontend/src/components/DashboardLayout.tsx
git add frontend/src/components/NotificationPanel.tsx
git add frontend/src/components/settings/ChangePasswordModal.tsx
git add frontend/src/hooks/useNotifications.ts
git add frontend/src/lib/queryClient.ts
git add frontend/src/app/onboarding/page.tsx
git add frontend/src/app/onboarding/employer/page.tsx
git add frontend/src/app/layout.tsx
git add frontend/src/app/page.tsx

git commit -m "refactor(frontend): Update components and layouts for React Query"
```

### Push Tous Commits
```bash
git push origin main
```

---

## DEMARRAGE SERVEURS

### Backend
```bash
cd /home/jdtkd/IntoWork-Dashboard/backend
uvicorn app.main:app --reload --port 8001
```

### Frontend
```bash
cd /home/jdtkd/IntoWork-Dashboard/frontend
npm install  # Si nouvelles dépendances
npm run dev
```

### Les Deux (terminaux séparés)
```bash
# Terminal 1
cd /home/jdtkd/IntoWork-Dashboard/backend && uvicorn app.main:app --reload --port 8001

# Terminal 2
cd /home/jdtkd/IntoWork-Dashboard/frontend && npm run dev
```

---

## TESTS RAPIDES

### Backend API
```bash
curl http://localhost:8001/api/ping
curl http://localhost:8001/api/jobs?limit=5
curl http://localhost:8001/docs  # Swagger UI
```

### Frontend
Ouvrir: http://localhost:3000
- Vérifier console (F12)
- Vérifier React Query DevTools
- Tester login

---

## VERIFICATION STATUS

### Git Status
```bash
git status
git log --oneline -5
```

### Database Migration
```bash
cd /home/jdtkd/IntoWork-Dashboard/backend
python3 -m alembic current
python3 -m alembic history
```

### Backend Endpoints (liste)
```bash
cd /home/jdtkd/IntoWork-Dashboard/backend
ls -la app/api/*.py
```

### Frontend Hooks
```bash
cd /home/jdtkd/IntoWork-Dashboard/frontend
ls -la src/hooks/*.ts
```

---

## REVIEW CHANGEMENTS

### Voir Fichiers Modifiés
```bash
git status
git diff --name-only
```

### Voir Changements Spécifiques
```bash
git diff backend/app/main.py
git diff frontend/src/app/auth/signin/page.tsx
```

### Voir Changements Staged
```bash
git diff --cached
```

---

## ROLLBACK/ANNULATION

### Unstage Fichier
```bash
git reset HEAD <fichier>
```

### Annuler Dernier Commit (garder changements)
```bash
git reset --soft HEAD~1
```

### Annuler Changements Non Staged
```bash
git checkout -- <fichier>
```

---

## ORGANISATION DOCUMENTATION (JOUR 2)

### Créer Structure
```bash
cd /home/jdtkd/IntoWork-Dashboard
mkdir -p docs/backend docs/frontend docs/database docs/deployment docs/architecture
```

### Déplacer Documentation Backend
```bash
git mv backend/ASYNC_MIGRATION_PATTERNS.md docs/backend/
git mv backend/ASYNC_PATTERN_REFERENCE.md docs/backend/
git mv backend/ADMIN_ASYNC_MIGRATION_REPORT.md docs/backend/
git commit -m "docs(backend): Move async docs to docs/backend/"
```

### Déplacer Documentation Frontend
```bash
git mv frontend/REACT_QUERY_HOOKS.md docs/frontend/
git mv frontend/REACT_QUERY_SETUP.md docs/frontend/
git commit -m "docs(frontend): Move React Query docs to docs/frontend/"
```

---

## COMMANDES UTILES

### Trouver Fichiers
```bash
find . -name "*.tsx" -type f  # Tous fichiers TSX
find . -name "*.py" -type f   # Tous fichiers Python
```

### Chercher dans Fichiers
```bash
grep -r "useJobs" frontend/src/  # Trouver useJobs
grep -r "AsyncSession" backend/  # Trouver AsyncSession
```

### Taille Fichiers
```bash
du -sh backend/  # Taille backend
du -sh frontend/ # Taille frontend
```

---

## BUILD PRODUCTION

### Backend (Railway)
```bash
cd /home/jdtkd/IntoWork-Dashboard/backend
docker build -t intowork-backend .
```

### Frontend (Vercel)
```bash
cd /home/jdtkd/IntoWork-Dashboard/frontend
npm run build
npm start  # Test production build
```

---

## VARIABLES ENVIRONNEMENT

### Backend (.env)
```bash
cat /home/jdtkd/IntoWork-Dashboard/backend/.env
```

Variables critiques:
- DATABASE_URL
- NEXTAUTH_SECRET
- JWT_SECRET
- RESEND_API_KEY
- FRONTEND_URL

### Frontend (.env.local)
```bash
cat /home/jdtkd/IntoWork-Dashboard/frontend/.env.local
```

Variables critiques:
- NEXTAUTH_URL
- NEXTAUTH_SECRET
- NEXT_PUBLIC_API_URL

---

## LOGS ET DEBUGGING

### Backend Logs
```bash
# Logs dans terminal uvicorn
# Chercher erreurs:
grep -i "error" <log-file>
grep -i "exception" <log-file>
```

### Frontend Logs
```bash
# Console navigateur (F12)
# React Query DevTools
# Network tab pour requêtes API
```

### Database Logs
```bash
# PostgreSQL logs (si configuré)
tail -f /var/log/postgresql/postgresql-15-main.log
```

---

## TAG VERSION

### Créer Tag
```bash
git tag -a v3.0.0 -m "Version 3.0.0 - Complete async migration + React Query"
git push origin v3.0.0
```

### Lister Tags
```bash
git tag -l
git show v3.0.0
```

---

## CLEANUP

### Supprimer Fichiers Non Trackés
```bash
git clean -n  # Dry run (voir ce qui sera supprimé)
git clean -f  # Supprimer (ATTENTION)
```

### Supprimer Branches Locales
```bash
git branch -d <branch-name>
git branch -D <branch-name>  # Force
```

---

## POSTGRES DIRECT

### Se Connecter
```bash
psql -h localhost -p 5433 -U postgres -d intowork
```

### Commandes SQL Utiles
```sql
-- Lister tables
\dt

-- Voir structure table
\d users
\d jobs

-- Compter enregistrements
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM jobs;

-- Vérifier indexes
SELECT * FROM pg_indexes WHERE tablename = 'jobs';

-- Vérifier constraints
SELECT * FROM pg_constraint WHERE conrelid = 'job_applications'::regclass;
```

---

## RACCOURCIS ALIAS (à ajouter dans ~/.bashrc)

```bash
# Backend
alias be-start='cd /home/jdtkd/IntoWork-Dashboard/backend && uvicorn app.main:app --reload --port 8001'
alias be-test='cd /home/jdtkd/IntoWork-Dashboard/backend && python3 test_complete.py'
alias be-migrate='cd /home/jdtkd/IntoWork-Dashboard/backend && python3 -m alembic upgrade head'

# Frontend
alias fe-start='cd /home/jdtkd/IntoWork-Dashboard/frontend && npm run dev'
alias fe-build='cd /home/jdtkd/IntoWork-Dashboard/frontend && npm run build'

# Git
alias gst='git status'
alias glog='git log --oneline -10'
alias gpush='git push origin main'

# Project
alias iw='cd /home/jdtkd/IntoWork-Dashboard'
```

---

## LIENS RAPIDES

**Local URLs**:
- Backend API: http://localhost:8001/api
- Swagger Docs: http://localhost:8001/docs
- Frontend: http://localhost:3000
- React Query DevTools: (dans frontend pendant dev)

**Documentation**:
- Guide Projet: /CLAUDE.md
- Analyse Complète: /ANALYSE_COMPLETE_2026-01-05.md
- Résumé Exécutif: /RESUME_EXECUTIF_2026-01-05.md
- Checklist Actions: /CHECKLIST_ACTIONS_IMMEDIATES.md
- Commandes Rapides: /COMMANDES_RAPIDES.md (ce fichier)

---

## SEQUENCE COMPLETE (COPY-PASTE)

### Séquence 1 - Migration Database
```bash
cd /home/jdtkd/IntoWork-Dashboard/backend
pg_dump -h localhost -p 5433 -U postgres -d intowork > backup_$(date +%Y%m%d_%H%M%S).sql
python3 -m alembic upgrade head
python3 -m alembic current
```

### Séquence 2 - Commit Tous Fichiers Frontend
```bash
cd /home/jdtkd/IntoWork-Dashboard

# Composants
git add frontend/src/components/PasswordStrengthIndicator.tsx
git add frontend/src/components/QueryProvider.tsx
git add frontend/src/lib/passwordValidation.ts
git add frontend/src/lib/queryKeys.ts
git commit -m "feat(frontend): Add password validation and React Query provider"

# Auth pages
git add frontend/src/app/auth/signin/page.tsx
git add frontend/src/app/auth/signup/page.tsx
git add frontend/src/app/auth/forgot-password/page.tsx
git add frontend/src/app/auth/reset-password/page.tsx
git commit -m "refactor(frontend): Migrate auth pages to React Query"

# Dashboard pages
git add frontend/src/app/dashboard/admin/page.tsx
git add frontend/src/app/dashboard/candidates/page.tsx
git add frontend/src/app/dashboard/company/page.tsx
git add frontend/src/app/dashboard/job-posts/page.tsx
git add frontend/src/app/dashboard/jobs/page.tsx
git add frontend/src/app/dashboard/page.tsx
git commit -m "refactor(frontend): Migrate dashboard pages to React Query"

# Components & layouts
git add frontend/src/components/DashboardLayout.tsx
git add frontend/src/components/NotificationPanel.tsx
git add frontend/src/components/settings/ChangePasswordModal.tsx
git add frontend/src/hooks/useNotifications.ts
git add frontend/src/lib/queryClient.ts
git add frontend/src/app/onboarding/page.tsx
git add frontend/src/app/onboarding/employer/page.tsx
git add frontend/src/app/layout.tsx
git add frontend/src/app/page.tsx
git commit -m "refactor(frontend): Update components and layouts for React Query"

# Push
git push origin main
```

### Séquence 3 - Tester Local
```bash
# Terminal 1 - Backend
cd /home/jdtkd/IntoWork-Dashboard/backend
uvicorn app.main:app --reload --port 8001

# Terminal 2 - Frontend
cd /home/jdtkd/IntoWork-Dashboard/frontend
npm install
npm run dev

# Terminal 3 - Tests
curl http://localhost:8001/api/ping
# Ouvrir http://localhost:3000 dans navigateur
```

---

**Créé**: 2026-01-05
**Usage**: Référence rapide pour commandes courantes
**Mise à jour**: Au besoin selon évolution projet
