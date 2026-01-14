# INTOWORK Search - Plateforme de Recrutement B2B2C

[![Frontend](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)](https://intowork.co)
[![Backend](https://img.shields.io/badge/Backend-Railway-purple?logo=railway)](https://intowork-dashboard-production-1ede.up.railway.app)
[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql)](https://www.postgresql.org/)

Plateforme complète de recrutement avec matching IA, dashboards multi-rôles et CV Builder intégré.

## URLs de Production

| Service | URL |
|---------|-----|
| **Frontend** | https://intowork.co |
| **Backend API** | https://intowork-dashboard-production-1ede.up.railway.app/api |
| **Documentation API** | https://intowork-dashboard-production-1ede.up.railway.app/docs |

---

## Vue d'Ensemble

INTOWORK Search est une plateforme B2B2C de recrutement offrant :

- **Dashboard Admin** : Statistiques, gestion utilisateurs/entreprises/offres
- **Dashboard Employeur** : Gestion offres d'emploi, candidatures, ATS intégré
- **Dashboard Candidat** : Profil, CV Builder, recherche emploi, candidatures
- **CV Builder** : Création de CV professionnels avec templates et export PDF
- **Authentification NextAuth** : JWT natif sécurisé

---

## Architecture du Projet

```
IntoWork-Dashboard/
├── backend/                    # API FastAPI + PostgreSQL
│   ├── app/
│   │   ├── api/               # 17 routes API
│   │   ├── models/            # 17 modèles SQLAlchemy
│   │   ├── services/          # Services métier
│   │   └── main.py            # Point d'entrée
│   ├── alembic/               # 14 migrations
│   └── requirements.txt       # 26 dépendances Python
│
├── frontend/                   # Next.js 16 + TypeScript
│   ├── src/
│   │   ├── app/               # 16 pages (App Router)
│   │   ├── components/        # Composants React
│   │   ├── hooks/             # 11 hooks React Query
│   │   └── lib/               # Utilitaires et API client
│   └── package.json           # 24 dépendances
│
├── docs/                       # Documentation (1.5 MB)
├── scripts/                    # Scripts d'automatisation
└── CLAUDE.md                   # Instructions pour Claude Code
```

---

## Stack Technique

### Backend

| Technologie | Version | Usage |
|-------------|---------|-------|
| FastAPI | 0.109.2 | Framework API REST async |
| SQLAlchemy | 2.0.23 | ORM avec support async |
| PostgreSQL | 15 | Base de données |
| Alembic | 1.12.1 | Migrations DB |
| Pydantic | 2.12+ | Validation données |
| bcrypt | 4.1+ | Hachage mots de passe |
| PyJWT | 2.8+ | Tokens JWT |
| WeasyPrint | 60.1+ | Génération PDF (CV Builder) |
| Redis | 5.0.1 | Cache (optionnel) |
| Prometheus | 0.20 | Monitoring (optionnel) |

### Frontend

| Technologie | Version | Usage |
|-------------|---------|-------|
| Next.js | 16.0.10 | Framework React (App Router) |
| React | 19.2.1 | UI Library |
| TypeScript | 5.0+ | Typage statique |
| Tailwind CSS | 4.0 | Styles utilitaires |
| DaisyUI | 5.5.14 | Composants UI |
| TanStack Query | 5.90+ | State management serveur |
| NextAuth | 5.0-beta | Authentification |
| Recharts | 3.6 | Graphiques |
| Axios | 1.13+ | Client HTTP |

---

## Modèles de Données (17 tables)

```
User                  # Comptes utilisateurs
├── Candidate         # Profils candidats
│   ├── Experience    # Expériences professionnelles
│   ├── Education     # Formations
│   ├── Skill         # Compétences
│   └── CandidateCV   # CVs uploadés
├── Employer          # Profils employeurs
│   └── Company       # Entreprises
├── CVDocument        # CV Builder documents
│   └── CVAnalytics   # Analytics des CVs publics
├── Job               # Offres d'emploi
├── JobApplication    # Candidatures
├── Notification      # Notifications
├── Session           # Sessions NextAuth
├── Account           # Comptes OAuth
├── VerificationToken # Tokens de vérification
└── PasswordResetToken # Tokens reset password
```

---

## Fonctionnalités

### Authentification & Sécurité
- Inscription/Connexion avec JWT natif (HS256)
- Gestion des rôles : Candidate, Employer, Admin
- Reset password par email (Resend)
- Protection des routes avec middleware
- Rate limiting avec SlowAPI

### Dashboard Candidat
- Profil personnel complet
- Upload et gestion de CVs multiples
- **CV Builder** : Création de CV avec 5 templates
- Recherche d'emploi avec filtres
- Système de candidatures avec suivi
- Notifications en temps réel

### Dashboard Employeur
- Profil entreprise complet
- Gestion des offres d'emploi (CRUD)
- ATS intégré : gestion des candidatures
- Filtres et recherche candidats
- Notes et statuts sur candidatures
- Téléchargement des CVs

### Dashboard Admin
- Statistiques globales (4 graphiques Recharts)
- Gestion utilisateurs (activation/désactivation)
- Gestion entreprises
- Gestion offres d'emploi
- Vue complète de la plateforme

### CV Builder (Nouveau!)
- 5 templates professionnels : Élégance, Impact, Épuré, Créatif, Executive
- Éditeur par étapes : Profil, Parcours, Formation, Talents, Langues
- Sauvegarde automatique (localStorage + backend)
- Export PDF haute qualité
- Partage public avec URL unique
- Analytics de vues et téléchargements

---

## Démarrage Rapide

### Prérequis

- Node.js 20+
- Python 3.11+
- Docker (pour PostgreSQL)
- Git

### Installation

```bash
# Cloner le repository
git clone https://github.com/Intowork-Search/IntoWork-Dashboard.git
cd IntoWork-Dashboard

# Lancer les deux services
./start-dev.sh
# OU
make dev
```

### Configuration Backend

```bash
cd backend

# Environnement virtuel
python3 -m venv venv
source venv/bin/activate

# Dépendances
pip install -r requirements.txt

# Variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# Base de données
docker run --name postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=intowork -p 5433:5432 -d postgres:15

# Migrations
alembic upgrade head

# Démarrer
uvicorn app.main:app --reload --port 8001
```

### Configuration Frontend

```bash
cd frontend

# Dépendances
npm install

# Variables d'environnement
cp .env.local.example .env.local
# Éditer avec vos valeurs

# Démarrer
npm run dev
```

---

## Variables d'Environnement

### Backend (.env)

```env
# Base de données
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/intowork

# JWT (doit correspondre au frontend)
NEXTAUTH_SECRET=your-secret-min-32-characters
JWT_SECRET=your-jwt-secret
JWT_ALGORITHM=HS256

# Email (Resend)
RESEND_API_KEY=re_your_api_key
FROM_EMAIL=INTOWORK <noreply@intowork.co>
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)

```env
# NextAuth (doit correspondre au backend)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-min-32-characters
AUTH_SECRET=your-secret-min-32-characters

# API Backend
NEXT_PUBLIC_API_URL=http://localhost:8001/api
```

---

## Routes API

### Authentification
- `POST /api/auth/signup` - Inscription
- `POST /api/auth/signin` - Connexion
- `POST /api/auth/forgot-password` - Demande reset
- `POST /api/auth/reset-password` - Reset password

### Candidats
- `GET /api/candidates/profile` - Profil candidat
- `PUT /api/candidates/profile` - Mise à jour profil
- `POST /api/candidates/cv/upload` - Upload CV
- `GET /api/candidates/experiences` - Expériences
- `GET /api/candidates/educations` - Formations
- `GET /api/candidates/skills` - Compétences

### CV Builder
- `GET /api/cv-builder/load` - Charger CV
- `POST /api/cv-builder/save` - Sauvegarder CV
- `POST /api/cv-builder/generate-pdf` - Générer PDF
- `PATCH /api/cv-builder/toggle-public` - Partage public
- `GET /api/cv-builder/analytics` - Statistiques
- `GET /api/cv-builder/public/{slug}` - CV public

### Offres d'emploi
- `GET /api/jobs` - Liste des offres
- `GET /api/jobs/my-jobs` - Offres de l'employeur
- `POST /api/jobs` - Créer offre
- `PUT /api/jobs/{id}` - Modifier offre
- `DELETE /api/jobs/{id}` - Supprimer offre

### Candidatures
- `GET /api/applications` - Liste candidatures
- `POST /api/applications` - Postuler
- `PATCH /api/applications/{id}/status` - Changer statut

### Admin
- `GET /api/admin/stats` - Statistiques globales
- `GET /api/admin/users` - Liste utilisateurs
- `PATCH /api/admin/users/{id}` - Modifier utilisateur

---

## Hooks React Query

| Hook | Description |
|------|-------------|
| `useJobs` | Gestion des offres d'emploi |
| `useApplications` | Gestion des candidatures |
| `useCandidates` | Profil et données candidat |
| `useDashboard` | Statistiques dashboard |
| `useNotifications` | Système de notifications |
| `useAdmin` | Fonctionnalités admin |
| `useCVBuilder` | CV Builder complet |
| `useAuth` | Authentification NextAuth |

---

## Déploiement

### Backend (Railway)

```bash
# Via Railway MCP
mcp__railway-mcp-server__deploy --workspacePath=./backend

# Ou via CLI
cd backend && railway up
```

### Frontend (Vercel)

Le frontend est connecté à GitHub et se déploie automatiquement sur push.

```bash
# Déploiement manuel
vercel --prod
```

---

## Scripts Utiles

```bash
# Développement
make dev              # Lancer backend + frontend
make backend          # Backend seul
make frontend         # Frontend seul

# Base de données
alembic upgrade head  # Appliquer migrations
alembic revision --autogenerate -m "description"  # Nouvelle migration

# Git
make push             # Push vers GitHub
make commit MSG="msg" # Commit et push

# Tests
python test_api.py    # Tests API backend
npm run build         # Build frontend
```

---

## Structure des Pages

```
/                     # Landing page
/signin               # Connexion
/signup               # Inscription
/forgot-password      # Reset password
/onboarding           # Sélection du rôle

/dashboard            # Dashboard principal
/dashboard/profile    # Profil utilisateur
/dashboard/jobs       # Recherche emploi (candidat)
/dashboard/job-posts  # Gestion offres (employeur)
/dashboard/applications # Candidatures
/dashboard/company    # Profil entreprise (employeur)
/dashboard/cv         # Gestion CVs
/dashboard/settings   # Paramètres
/dashboard/admin      # Administration (admin)

/cv-builder           # Créateur de CV
/cv/{slug}            # CV public

/entreprises          # Liste entreprises (public)
/offres               # Liste offres (public)
```

---

## Audit du Projet (Janvier 2026)

### Statistiques

| Métrique | Valeur |
|----------|--------|
| Fichiers Python | ~3,300 |
| Fichiers TypeScript | ~9,900 |
| Taille Backend | 224 MB |
| Taille Frontend | 1.1 GB |
| Dépendances Backend | 26 |
| Dépendances Frontend | 24 (+ 3 dev) |
| Modèles DB | 17 |
| Migrations | 14 |
| Routes API | 17 fichiers |
| Pages Frontend | 16 |
| Hooks React Query | 11 |
| Vulnérabilités npm | 0 |

### État des Fonctionnalités

| Fonctionnalité | Statut |
|----------------|--------|
| Authentification NextAuth | Production |
| Dashboard Candidat | Production |
| Dashboard Employeur | Production |
| Dashboard Admin | Production |
| CV Builder | Production |
| Notifications | Production |
| Export PDF | Production |
| Rate Limiting | Production |
| Monitoring Prometheus | Optionnel |
| Cache Redis | Optionnel |

### Dépendances Legacy

Les packages `@clerk/nextjs` et `@clerk/themes` sont encore présents dans package.json mais **ne sont plus utilisés**. Ils peuvent être supprimés en toute sécurité lors d'un nettoyage futur.

---

## Roadmap

### Phase 1 - Fondation
- [x] Structure FastAPI + Next.js
- [x] Base de données PostgreSQL
- [x] Authentification JWT

### Phase 2 - Dashboards Multi-rôles
- [x] Dashboard Candidat
- [x] Dashboard Employeur
- [x] Système de candidatures
- [x] Notifications temps réel

### Phase 3 - Administration
- [x] Dashboard Admin
- [x] Statistiques avec Recharts
- [x] Gestion utilisateurs/entreprises

### Phase 4 - CV Builder
- [x] Éditeur de CV par étapes
- [x] 5 templates professionnels
- [x] Export PDF
- [x] Partage public
- [x] Analytics

### Phase 5 - Matching IA (À venir)
- [ ] Système de matching IA
- [ ] Recommandations personnalisées
- [ ] Analytics avancés
- [ ] Intégrations tierces

---

## Support

- **Documentation** : Voir le dossier `docs/`
- **Issues** : [GitHub Issues](https://github.com/Intowork-Search/IntoWork-Dashboard/issues)
- **CLAUDE.md** : Instructions pour Claude Code

---

## Licence

Propriétaire - INTOWORK Search

---

**Dernière mise à jour** : 14 Janvier 2026
