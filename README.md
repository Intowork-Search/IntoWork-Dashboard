# INTOWORK Search - Dashboard Multi-rôles 🚀

Plateforme de recrutement B2B2C avec dashboard professionnel pour Admin, Employeurs et Candidats

## 🎯 Vue d'ensemble

INTOWORK Search est une plateforme complète de recrutement avec :

- **Dashboard Admin** : Statistiques, graphiques, gestion utilisateurs/entreprises/offres ✅
- **Dashboard Employeur** : Gestion offres d'emploi, candidatures, notifications ✅
- **Dashboard Candidat** : Profil complet, candidatures, recherche emploi ✅
- **Authentification NextAuth** : JWT natif, économies $300k-600k/an ✅
- **Design Cohérent** : Thème bleu/violet, responsive, professionnel ✅

## 🏗️ Architecture

```bash
INTOWORK/
├── backend/           # API FastAPI + PostgreSQL + JWT
├── frontend/          # Next.js 16 + TypeScript + NextAuth v5
└── README.md         # Ce fichier
```

## ✅ Phase 1 - Fondation (TERMINÉE)

### Backend (FastAPI)

- ✅ Structure FastAPI complète avec Docker
- ✅ Base de données PostgreSQL (9 modèles : User, Candidate, Company, Employer, Job, Application, Notification, Session, Account)
- ✅ Migrations Alembic configurées
- ✅ Authentification JWT native (bcrypt + HS256)
- ✅ Migration Clerk → NextAuth (économies $300k-600k/an)
- ✅ Endpoints d'authentification et synchronisation
- ✅ Gestion des rôles (candidate, employer, admin)
- ✅ Système de notifications temps réel

### Frontend (Next.js)

- ✅ Projet Next.js 16 + TypeScript + Tailwind CSS + Turbopack
- ✅ NextAuth v5 Beta configuré avec JWT
- ✅ Pages d'authentification (/sign-in, /sign-up)
- ✅ Onboarding simplifié (3 champs pour employeur)
- ✅ Middleware de protection des routes
- ✅ Service API avec authentification JWT
- ✅ Layout dashboard responsive avec sidebar

## 🚀 Démarrage rapide

> **🎯 Nouveau développeur ?** Lisez d'abord **[QUICKSTART.md](./QUICKSTART.md)** - Guide complet en 5 minutes !
> **💻 Première installation ?** Lisez **[INSTALLATION.md](./INSTALLATION.md)** - Installation détaillée par OS

### Option 1: Lancement automatique (Recommandé)

```bash
# Lancer backend + frontend simultanément
./start-dev.sh

# Ou avec Make
make dev

# Ou manuellement les deux en parallèle
make backend &
make frontend &
```

### Option 2: Lancement manuel

#### Backend

```bash
cd backend

# Installer les dépendances
pip install -r requirements.txt

# Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos clés JWT

# Démarrer PostgreSQL
docker run --name postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=intowork -p 5433:5432 -d postgres:15

# Appliquer les migrations
alembic upgrade head

# Démarrer l'API
uvicorn app.main:app --reload --port 8001
```

**API disponible sur : <http://localhost:8001>**

- Documentation : <http://localhost:8001/docs>
- Endpoints : `/api/ping`, `/api/users`, `/api/auth/*`

### 2. Frontend

```bash
cd frontend

# Installer les dépendances
npm install

# Configurer NextAuth
cp .env.local.example .env.local
# Ajouter vos clés NextAuth (NEXTAUTH_SECRET, NEXTAUTH_URL, NEXT_PUBLIC_API_URL)

# Démarrer le serveur de développement
npm run dev
```

**Frontend disponible sur : <http://localhost:3000>**

## 🔐 Configuration NextAuth

### Variables d'environnement

**Backend (.env)** :

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/intowork
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_ALGORITHM=HS256
```

**Frontend (.env.local)** :

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-min-32-characters
NEXT_PUBLIC_API_URL=http://localhost:8001
```

## 📋 Fonctionnalités actuelles

### ✅ Dashboard Admin (Nouveau!)

- [x] **Onglet Statistiques** : 4 graphiques professionnels (Recharts)
  - Statistiques Actuelles (AreaChart) - Données réelles BD
  - Distribution Utilisateurs (PieChart) - Candidats/Employeurs/Actifs
  - Candidatures Totales (BarChart) - Volume réel
  - Statut des Offres (PieChart) - Active/Pourvue/Expirée/Brouillon
- [x] **Onglet Utilisateurs** : Liste complète, recherche, filtres, activation/désactivation
- [x] **Onglet Entreprises** : Vue grille avec pagination (10 par page)
- [x] **Onglet Offres d'emploi** : Liste détaillée avec statuts corrects et pagination
- [x] **Design professionnel** : Graphiques colorés, labels visibles, états vides
- [x] **Données réelles** : Toutes les données viennent de la BD Railway (pas de mock data)

### ✅ Authentification (NextAuth v5)

- [x] Inscription/Connexion avec JWT natif
- [x] Migration Clerk → NextAuth (économies $300k-600k/an)
- [x] Gestion de session avec JWT (HS256)
- [x] Gestion des rôles (candidate/employer/admin)
- [x] Protection routes avec middleware
- [x] Design cohérent bleu/violet sur toutes les pages auth
- [x] Mot de passe oublié avec thème cohérent

### ✅ Dashboard Employeur

- [x] **Gestion offres d'emploi** : Création, édition, suppression
- [x] **Filtrage intelligent** : Employeur voit uniquement SES offres
- [x] **Gestion candidatures** : Liste, filtres, statuts, notes, téléchargement CV
- [x] **React Query** : Cache 2 min, optimistic updates, performance optimale
- [x] **Gestion entreprise** : Profil complet, persistance BD validée
- [x] **Notifications** : Alertes candidatures en temps réel

### ✅ Dashboard Candidat

- [x] **Recherche d'emploi** : Voir toutes les offres disponibles
- [x] **Profil personnel** : Nom, téléphone, localisation, bio, liens sociaux
- [x] **Upload CV** : Drag & drop, affichage dans sidebar
- [x] **Système de candidatures** : Postuler aux offres, suivi statut
- [x] **Notifications** : Alertes changement statut
- [x] **Paramètres** : Préférences, confidentialité, compte

### ✅ Design & UI/UX

- [x] **Thème cohérent** : Bleu/violet gradient (`from-blue-600 via-blue-700 to-purple-600`)
- [x] **Sidebar améliorée** : Profil en bas, badges dynamiques, rôle (A/C/E)
- [x] **Responsive** : Mobile, tablet, desktop optimisés
- [x] **Graphiques** : Couleurs correctes, labels visibles (11px)
- [x] **États vides** : Messages clairs quand pas de données

### ✅ Système de Notifications

- [x] **Types** : new_application (employeur), status_change (candidat)
- [x] **Temps réel** : Auto-refresh 30 secondes
- [x] **Badge non lues** : Compte dynamique
- [x] **UI responsive** : Panel adaptatif desktop/mobile
- [x] **Icônes contextuelles** : 📝 Candidature, 📬 Statut, etc.

### ✅ Base de données

- [x] **9 modèles complets** : User, Candidate, Company, Employer, Job, Application, Notification, Session, Account
- [x] **Relations FK** : employer_id, company_id, user_id
- [x] **Migrations Alembic** : Révision 411cd9a350e0 (head)
- [x] **Persistance validée** : Tests companies update ✅

### ✅ API Backend

- [x] **Route filtrage** : GET /jobs/my-jobs (employer-specific)
- [x] **CRUD complet** : Jobs, Companies, Applications, Notifications
- [x] **Middleware JWT** : require_user(), require_admin()
- [x] **Gestion permissions** : Rôles et autorisations

### ✅ Interface utilisateur

- [x] **Layout dashboard** : Sidebar responsive, header avec notifications
- [x] **Mobile optimisé** : Overlay transparent, une icône notification
- [x] **Visibilité texte** : text-gray-900 sur tous les inputs
- [x] **Navigation contextuelle** : Titre dynamique selon rôle
- [x] **Accessibilité** : Labels ARIA, navigation clavier

## 🔜 Phase 3 - Back-office Admin (✅ TERMINÉE!)

### Fonctionnalités Livrées

- [x] **Rôle admin** : Gestion complète dans UserRole enum
- [x] **Dashboard admin** : 4 graphiques professionnels avec Recharts
  - Statistiques Actuelles (AreaChart)
  - Distribution Utilisateurs (PieChart)
  - Candidatures Totales (BarChart)
  - Statut des Offres (PieChart)
- [x] **Gestion utilisateurs** : Liste, recherche, filtres par rôle, activation/désactivation
- [x] **Gestion entreprises** : Vue grille avec pagination, statut actif/inactif
- [x] **Gestion offres d'emploi** : Liste détaillée, statuts corrects, pagination
- [x] **Middleware admin** : require_admin() pour routes protégées

## 🔜 Phase 4 - Matching IA & Analytics (Futur)

- [ ] Système de matching IA
- [ ] Recommandations personnalisées
- [ ] Analytics avancés
- [ ] Intégrations tierces (LinkedIn, Indeed)

## 🛠️ Commandes utiles

### Backend (Commands)

```bash
# Tests API
python test_api.py

# Nouvelle migration
alembic revision --autogenerate -m "Description"

# Appliquer migrations
alembic upgrade head

# Démarrer avec Docker
docker-compose up --build
```

### Frontend

```bash
# Build production
npm run build

# Linting
npm run lint

# Tests (quand ajoutés)
npm test
```

## 📊 Technologies utilisées

**Backend :**

- FastAPI 0.104+ (API REST)
- SQLAlchemy 2.0+ (ORM)
- PostgreSQL 15 (Base de données)
- Alembic (Migrations)
- **JWT natif (HS256)** : Authentification maison
- **bcrypt** : Hachage mots de passe
- **PyJWT** : Génération/validation tokens
- Python Multipart (Upload fichiers)
- Pydantic Email Validator
- Docker (Containerisation)

**Frontend :**

- **Next.js 16** (React Framework) + **Turbopack**
- TypeScript (Types)
- Tailwind CSS (Styles)
- **NextAuth v5 Beta** (Auth + JWT)
- **React Query** (TanStack) : Cache, optimistic updates
- **Recharts** : Graphiques professionnels admin dashboard
- React Hot Toast (Notifications)
- Heroicons (Icônes)
- Axios (HTTP Client)

**Authentification :**

- **NextAuth v5** (Auth provider)
- **JWT natif** : HS256 algorithm
- **Sessions** : Stockage PostgreSQL
- **Économies** : $300,000 - $600,000/an vs Clerk

**Base de données :**

- PostgreSQL 15
- 9 tables : users, candidates, companies, employers, jobs, applications, notifications, sessions, accounts
- Migrations Alembic (révision: 411cd9a350e0)
- Contraintes FK validées

## 👥 Équipe et rôles

**Rôles utilisateurs :**

- **Candidate** : Cherche un emploi, crée un profil, postule aux offres
- **Employer** : Recrute, gère les offres, utilise l'ATS, reçoit candidatures
- **Admin** : Administration générale de la plateforme (à venir Phase 3)

**Architecture de filtrage :**

- Employeur voit UNIQUEMENT ses propres offres d'emploi
- Candidat voit TOUTES les offres publiques disponibles
- Système de notifications rôle-spécifique

## 📞 Support

Pour les questions sur cette phase :

- Backend : Vérifier les logs FastAPI et PostgreSQL
- Frontend : Vérifier la console navigateur et les tokens JWT
- Auth : Vérifier la configuration NextAuth (.env.local)
- BD : `docker logs postgres-intowork` ou `alembic current`

**Documentation complète :**

- Installation : Voir `INSTALLATION.md`
- Pré-push : Voir `PRE_PUSH_VERIFICATION.md`
- Changelog : Voir `CHANGELOG.md`

---

**✅ Phase 1, 2 & 3 terminées avec succès !** 🎉

**Dashboard Admin opérationnel avec statistiques réelles** �

**Migration NextAuth : Économies de $300k-600k/an** 💰

**Prêt pour la Phase 4 : Matching IA & Analytics** 🚀
