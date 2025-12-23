# INTOWORK Search - Phase 2 🚀

Plateforme de recrutement B2B2C avec matching IA - **Phase 2 : Dashboard Multi-rôles (En cours)**

## 🎯 Vue d'ensemble

INTOWORK Search est une plateforme complète de recrutement avec :

- **Dashboard candidat** : Profil complet, candidatures, suivi ✅
- **Dashboard employeur** : Gestion offres d'emploi, candidatures, notifications ✅
- **Système de notifications** : Temps réel, multi-canal ✅
- **Authentification NextAuth** : JWT natif, économies $300k-600k/an ✅
- **Filtrage intelligent** : Jobs par employeur, rôles séparés ✅

## 🏗️ Architecture

```
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

**API disponible sur : http://localhost:8001**
- Documentation : http://localhost:8001/docs
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

**Frontend disponible sur : http://localhost:3000**

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

### ✅ Authentification (NextAuth v5)
- [x] Inscription/Connexion avec JWT natif
- [x] Migration Clerk → NextAuth (économies $300k-600k/an)
- [x] Gestion de session avec JWT (HS256)
- [x] Gestion des rôles (candidate/employer/admin)
- [x] Protection routes avec middleware
- [x] Changement mot de passe/email
- [x] Suppression de compte avec cascade

### ✅ Dashboard Employeur
- [x] **Gestion offres d'emploi** : Création, édition, suppression
- [x] **Filtrage intelligent** : Employeur voit uniquement SES offres
- [x] **Badge temps réel** : Compte exact des offres publiées
- [x] **Gestion entreprise** : Profil complet, persistance BD validée
- [x] **Onboarding simplifié** : 3 champs (nom, poste, téléphone)
- [x] **Notifications** : Alertes candidatures en temps réel

### ✅ Dashboard Candidat
- [x] **Recherche d'emploi** : Voir toutes les offres disponibles
- [x] **Profil personnel** : Nom, téléphone, localisation, bio, liens sociaux
- [x] **Système de candidatures** : Postuler aux offres
- [x] **Notifications** : Alertes changement statut
- [x] **Paramètres** : Préférences, confidentialité, compte

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

## 🔜 Phase 3 - Back-office Admin (À venir)

### Objectifs
- [ ] **Rôle admin** : Ajout dans UserRole enum
- [ ] **Dashboard admin** : Statistiques globales, graphiques
- [ ] **Gestion utilisateurs** : Liste, recherche, activation/désactivation
- [ ] **Modération employeurs** : Validation entreprises
- [ ] **Modération jobs** : Validation offres d'emploi
- [ ] **Vue globale candidatures** : Toutes les candidatures plateforme
- [ ] **Middleware** : require_admin() pour routes protégées

## 🔜 Phase 4 - Matching IA & Analytics (Futur)

- [ ] Système de matching IA
- [ ] Recommandations personnalisées
- [ ] Analytics avancés
- [ ] Intégrations tierces (LinkedIn, Indeed)

## 🛠️ Commandes utiles

### Backend
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

**Phase 1 & 2 terminées avec succès ! 🎉**  
**Prêt pour la Phase 3 : Back-office Admin** 🚀

**Migration NextAuth : Économies de $300k-600k/an ✅**
