# CHECKLIST ACTIONS IMMEDIATES
**Date**: 2026-01-05 | **Priorité**: P0 - CRITIQUE

---

## PHASE 1 - SECURISATION DATABASE (30min)

### Task 1.1 - Backup Database
```bash
cd /home/jdtkd/IntoWork-Dashboard/backend
pg_dump -h localhost -p 5433 -U postgres -d intowork > backup_$(date +%Y%m%d_%H%M%S).sql
```
- [ ] Backup créé
- [ ] Vérifier taille fichier backup
- [ ] Localisation: `/home/jdtkd/IntoWork-Dashboard/backend/backup_*.sql`

### Task 1.2 - Vérifier Migration Actuelle
```bash
python3 -m alembic current
```
- [ ] Commande exécutée
- [ ] Migration actuelle affichée: `g7b1c5d4e3f2` (password_reset_tokens)

### Task 1.3 - Appliquer Migration Critique
```bash
python3 -m alembic upgrade head
```
- [ ] Migration h8c2d6e5f4g3 appliquée
- [ ] Aucune erreur dans output
- [ ] 16 indexes créés
- [ ] 3 unique constraints créés

### Task 1.4 - Vérifier Application
```bash
python3 -m alembic current
```
- [ ] Migration affichée: `h8c2d6e5f4g3`
- [ ] Vérification réussie

### Task 1.5 - Commit Migration
```bash
cd /home/jdtkd/IntoWork-Dashboard
git add backend/alembic/versions/h8c2d6e5f4g3_critical_indexes_and_constraints.py
git commit -m "feat(backend): Apply critical database indexes and constraints

Migration: h8c2d6e5f4g3
- Add unique constraints (prevent duplicates)
- Add performance indexes (16 indexes)
- Optimize job search queries
- Optimize application tracking queries

CRITICAL: Applied to database on $(date +%Y-%m-%d)
"
```
- [ ] Migration committée
- [ ] Commit message clair

---

## PHASE 2 - COMPOSANTS FRONTEND CRITIQUES (15min)

### Task 2.1 - Vérifier Fichiers Existent
```bash
ls -la /home/jdtkd/IntoWork-Dashboard/frontend/src/components/PasswordStrengthIndicator.tsx
ls -la /home/jdtkd/IntoWork-Dashboard/frontend/src/components/QueryProvider.tsx
ls -la /home/jdtkd/IntoWork-Dashboard/frontend/src/lib/passwordValidation.ts
ls -la /home/jdtkd/IntoWork-Dashboard/frontend/src/lib/queryKeys.ts
```
- [ ] PasswordStrengthIndicator.tsx existe
- [ ] QueryProvider.tsx existe
- [ ] passwordValidation.ts existe
- [ ] queryKeys.ts existe

### Task 2.2 - Vérifier queryKeys.ts Pas Déjà Committé
```bash
git log --all --full-history -- frontend/src/lib/queryKeys.ts
```
- [ ] Commande exécutée
- [ ] Fichier NON dans historique (ou déjà committé?)

### Task 2.3 - Stage Fichiers
```bash
git add frontend/src/components/PasswordStrengthIndicator.tsx
git add frontend/src/components/QueryProvider.tsx
git add frontend/src/lib/passwordValidation.ts
git add frontend/src/lib/queryKeys.ts
```
- [ ] PasswordStrengthIndicator.tsx staged
- [ ] QueryProvider.tsx staged
- [ ] passwordValidation.ts staged
- [ ] queryKeys.ts staged

### Task 2.4 - Commit Composants
```bash
git commit -m "feat(frontend): Add password validation and React Query provider

Components:
- PasswordStrengthIndicator.tsx: Visual password strength feedback
- QueryProvider.tsx: React Query provider with DevTools

Libraries:
- passwordValidation.ts: Password validation logic
- queryKeys.ts: Centralized query keys for cache

Used by: Auth pages, settings, all dashboard pages
"
```
- [ ] Commit créé
- [ ] Message clair et descriptif

---

## PHASE 3 - PAGES FRONTEND (2h)

### Task 3.1 - Review Changements Auth Pages
```bash
git diff frontend/src/app/auth/signin/page.tsx
git diff frontend/src/app/auth/signup/page.tsx
git diff frontend/src/app/auth/forgot-password/page.tsx
git diff frontend/src/app/auth/reset-password/page.tsx
```
- [ ] signin.tsx reviewé
- [ ] signup.tsx reviewé
- [ ] forgot-password.tsx reviewé
- [ ] reset-password.tsx reviewé
- [ ] Changements compris

### Task 3.2 - Commit Auth Pages
```bash
git add frontend/src/app/auth/signin/page.tsx
git add frontend/src/app/auth/signup/page.tsx
git add frontend/src/app/auth/forgot-password/page.tsx
git add frontend/src/app/auth/reset-password/page.tsx

git commit -m "refactor(frontend): Migrate auth pages to React Query

Pages updated:
- /auth/signin: React Query authentication
- /auth/signup: Password validation + strength indicator
- /auth/forgot-password: React Query password reset request
- /auth/reset-password: React Query password reset

Features: Real-time validation, toast notifications, error handling
"
```
- [ ] Auth pages committées
- [ ] Commit message descriptif

### Task 3.3 - Review Changements Dashboard Pages
```bash
git diff frontend/src/app/dashboard/admin/page.tsx
git diff frontend/src/app/dashboard/candidates/page.tsx
git diff frontend/src/app/dashboard/company/page.tsx
git diff frontend/src/app/dashboard/job-posts/page.tsx
git diff frontend/src/app/dashboard/jobs/page.tsx
git diff frontend/src/app/dashboard/page.tsx
```
- [ ] admin/page.tsx reviewé
- [ ] candidates/page.tsx reviewé
- [ ] company/page.tsx reviewé
- [ ] job-posts/page.tsx reviewé
- [ ] jobs/page.tsx reviewé
- [ ] page.tsx reviewé

### Task 3.4 - Commit Dashboard Pages
```bash
git add frontend/src/app/dashboard/admin/page.tsx
git add frontend/src/app/dashboard/candidates/page.tsx
git add frontend/src/app/dashboard/company/page.tsx
git add frontend/src/app/dashboard/job-posts/page.tsx
git add frontend/src/app/dashboard/jobs/page.tsx
git add frontend/src/app/dashboard/page.tsx

git commit -m "refactor(frontend): Migrate dashboard pages to React Query

Pages migrated:
- /dashboard/admin: useAdminStats, useAdminUsers, etc.
- /dashboard/candidates: useCandidateProfile, useUpdateProfile
- /dashboard/company: Company management hooks
- /dashboard/job-posts: useMyJobs, useCreateJob, etc.
- /dashboard/jobs: useJobs, useApplyToJob
- /dashboard (home): useDashboardStats

Benefits: Automatic caching, optimistic updates, toast notifications
"
```
- [ ] Dashboard pages committées
- [ ] Commit message descriptif

### Task 3.5 - Review Changements Components & Layouts
```bash
git diff frontend/src/components/DashboardLayout.tsx
git diff frontend/src/components/NotificationPanel.tsx
git diff frontend/src/components/settings/ChangePasswordModal.tsx
git diff frontend/src/hooks/useNotifications.ts
git diff frontend/src/lib/queryClient.ts
git diff frontend/src/app/layout.tsx
git diff frontend/src/app/page.tsx
git diff frontend/src/app/onboarding/page.tsx
git diff frontend/src/app/onboarding/employer/page.tsx
```
- [ ] Tous fichiers reviewés
- [ ] Changements compris

### Task 3.6 - Commit Components & Layouts
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

git commit -m "refactor(frontend): Update components and layouts for React Query

Components:
- DashboardLayout: React Query context integration
- NotificationPanel: useNotifications hooks
- ChangePasswordModal: Password validation

Hooks: useNotifications updated

Pages:
- layout.tsx: Add QueryProvider
- Onboarding: React Query integration
"
```
- [ ] Components committés
- [ ] Commit message descriptif

---

## PHASE 4 - BACKEND & INFRASTRUCTURE (1h)

### Task 4.1 - Review Backend Changes
```bash
git diff backend/app/main.py
git diff backend/app/api/auth_routes.py
```
- [ ] main.py reviewé
- [ ] auth_routes.py reviewé
- [ ] Changements documentés

### Task 4.2 - Commit Backend (si changements significatifs)
```bash
git add backend/app/main.py
git add backend/app/api/auth_routes.py

git commit -m "chore(backend): Update main.py and auth_routes.py

Changes:
- main.py: [DESCRIBE AFTER REVIEW]
- auth_routes.py: [DESCRIBE AFTER REVIEW]
"
```
- [ ] Backend committés (si applicable)
- [ ] Ou changements ignorés si mineurs

### Task 4.3 - Review Package Dependencies
```bash
git diff frontend/package.json
git diff frontend/package-lock.json
```
- [ ] package.json reviewé
- [ ] package-lock.json reviewé
- [ ] React Query v5 présent

### Task 4.4 - Commit Dependencies
```bash
git add frontend/package.json
git add frontend/package-lock.json

git commit -m "chore(frontend): Update dependencies for React Query v5

Added:
- @tanstack/react-query: ^5.x
- @tanstack/react-query-devtools: ^5.x
"
```
- [ ] Dependencies committées

### Task 4.5 - Review Infrastructure
```bash
git diff Dockerfile
git status Dockerfile.railway
cat Dockerfile.frontend
git diff railway.toml
```
- [ ] Dockerfile reviewé
- [ ] Dockerfile.railway suppression confirmée
- [ ] Dockerfile.frontend évalué
- [ ] railway.toml reviewé

### Task 4.6 - Commit Infrastructure (selon décisions)
```bash
# Exemple si modifications valides
git add Dockerfile
git rm Dockerfile.railway
git add railway.toml

git commit -m "chore(infra): Update Docker and Railway configuration

Changes:
- Dockerfile: [DESCRIBE]
- Dockerfile.railway: Removed (consolidated into Dockerfile)
- railway.toml: [DESCRIBE]
"
```
- [ ] Infrastructure committée (si applicable)

---

## PHASE 5 - VERIFICATION ET PUSH (30min)

### Task 5.1 - Vérifier Status Git
```bash
git status
```
- [ ] Aucun fichier critique non staged
- [ ] Modifications cohérentes

### Task 5.2 - Review Derniers Commits
```bash
git log --oneline -10
```
- [ ] Commits bien formés
- [ ] Messages clairs
- [ ] Séquence logique

### Task 5.3 - Push Tous Commits
```bash
git push origin main
```
- [ ] Push réussi
- [ ] Aucune erreur

### Task 5.4 - Vérifier Push Remote
```bash
git log origin/main --oneline -10
```
- [ ] Commits présents sur remote
- [ ] Synchronisation confirmée

---

## PHASE 6 - TESTS LOCAL (1h)

### Task 6.1 - Démarrer Backend
```bash
cd /home/jdtkd/IntoWork-Dashboard/backend
uvicorn app.main:app --reload --port 8001
```
- [ ] Backend démarré
- [ ] Aucune erreur au démarrage
- [ ] Logs propres

### Task 6.2 - Tester Endpoints Backend
```bash
# Dans un autre terminal
curl http://localhost:8001/api/ping
curl http://localhost:8001/api/jobs?limit=5
```
- [ ] /ping retourne 200
- [ ] /jobs retourne données
- [ ] Pas d'erreurs logs

### Task 6.3 - Vérifier Migration Database
```bash
cd /home/jdtkd/IntoWork-Dashboard/backend
python3 -m alembic current
```
- [ ] Migration affichée: h8c2d6e5f4g3
- [ ] Indexes présents dans DB

### Task 6.4 - Démarrer Frontend
```bash
cd /home/jdtkd/IntoWork-Dashboard/frontend
npm install  # Si nouvelles dépendances
npm run dev
```
- [ ] Frontend démarré
- [ ] Compilation réussie
- [ ] Aucune erreur

### Task 6.5 - Tester Frontend dans Navigateur
Ouvrir http://localhost:3000

- [ ] Page landing charge
- [ ] Login page accessible
- [ ] Pas d'erreurs console
- [ ] React Query DevTools visible

### Task 6.6 - Test Login/Auth
- [ ] Login fonctionne
- [ ] Session créée
- [ ] Redirection dashboard
- [ ] Pas d'erreurs

### Task 6.7 - Test Dashboard
- [ ] Dashboard charge
- [ ] Stats affichées
- [ ] Navigation fonctionne
- [ ] Pas d'erreurs console

### Task 6.8 - Test React Query Features
- [ ] Toast notifications apparaissent
- [ ] Optimistic updates fonctionnent
- [ ] Cache fonctionne (re-navigation sans reload)
- [ ] DevTools montrent queries

---

## PHASE 7 - VALIDATION FINALE (15min)

### Task 7.1 - Checklist Complétude
- [ ] Migration database appliquée (h8c2d6e5f4g3)
- [ ] Tous fichiers critiques committés
- [ ] Backend démarre sans erreur
- [ ] Frontend démarre sans erreur
- [ ] Tests manuels passent
- [ ] Push réussi

### Task 7.2 - Documentation Status
- [ ] ANALYSE_COMPLETE_2026-01-05.md créé
- [ ] RESUME_EXECUTIF_2026-01-05.md créé
- [ ] CHECKLIST_ACTIONS_IMMEDIATES.md créé (ce fichier)

### Task 7.3 - Prochaines Etapes Identifiées
- [ ] Documentation à organiser (docs/ structure)
- [ ] CHANGELOG à mettre à jour
- [ ] Tag v3.0.0 à créer
- [ ] Déploiement production à préparer

---

## RESUME PROGRESSION

### Statut Global
- [ ] PHASE 1 - Sécurisation Database - COMPLETE
- [ ] PHASE 2 - Composants Frontend - COMPLETE
- [ ] PHASE 3 - Pages Frontend - COMPLETE
- [ ] PHASE 4 - Backend & Infrastructure - COMPLETE
- [ ] PHASE 5 - Vérification et Push - COMPLETE
- [ ] PHASE 6 - Tests Local - COMPLETE
- [ ] PHASE 7 - Validation Finale - COMPLETE

### Temps Estimé
- PHASE 1: 30min
- PHASE 2: 15min
- PHASE 3: 2h
- PHASE 4: 1h
- PHASE 5: 30min
- PHASE 6: 1h
- PHASE 7: 15min
**TOTAL**: ~5h30min

### Actions Post-Completion
1. Organiser documentation (JOUR 2)
2. Tests complets (JOUR 3)
3. Créer tag v3.0.0
4. Déploiement production

---

## NOTES

**Warnings**:
- Toujours backup database avant migrations
- Vérifier changements avant commit
- Tester localement avant push
- Ne pas committer secrets (.env)

**Commandes Utiles**:
```bash
# Annuler dernier commit (si erreur)
git reset --soft HEAD~1

# Voir changements staged
git diff --cached

# Unstage fichier
git reset HEAD <file>
```

**Support**:
- Documentation: /ANALYSE_COMPLETE_2026-01-05.md
- Plan détaillé: /PLAN_ACTION_IMMEDIAT.md
- Guide projet: /CLAUDE.md

---

**Checklist créée**: 2026-01-05
**Priorité**: P0 - CRITIQUE
**Status**: PRET POUR EXECUTION
