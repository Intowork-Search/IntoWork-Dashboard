# INTOWORK Search - Phase 1 ✅

Plateforme de recrutement B2B2C avec matching IA - **Phase 1 : Fondation (Terminée)**

## 🎯 Vue d'ensemble

INTOWORK Search est une plateforme complète de recrutement avec :
- **Dashboard candidat** : Profil, CV, candidatures, alertes
- **Dashboard entreprise** : ATS complet avec pipeline Kanban
- **Système de matching IA** pour optimiser les candidatures
- **Authentification Clerk** avec support Microsoft/Azure AD

## 🏗️ Architecture

```
INTOWORK/
├── backend/           # API FastAPI + PostgreSQL
├── frontend/          # Next.js 14 + TypeScript + Clerk
└── README.md         # Ce fichier
```

## ✅ Phase 1 - Fondation (TERMINÉE)

### Backend (FastAPI)
- ✅ Structure FastAPI complète avec Docker
- ✅ Base de données PostgreSQL (4 modèles : User, Candidate, Company, Employer)  
- ✅ Migrations Alembic configurées
- ✅ Authentification Clerk intégrée
- ✅ Endpoints d'authentification et synchronisation
- ✅ Gestion des rôles (candidate, employer, admin)

### Frontend (Next.js)
- ✅ Projet Next.js 14 + TypeScript + Tailwind CSS
- ✅ Clerk Provider configuré avec thème personnalisé
- ✅ Pages d'authentification (/sign-in, /sign-up)
- ✅ Page d'onboarding pour choisir le rôle
- ✅ Support Microsoft/Azure AD via Clerk
- ✅ Middleware de protection des routes
- ✅ Service API pour communication backend

## 🚀 Démarrage rapide

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
# Éditer .env avec vos clés Clerk

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

# Configurer Clerk
cp .env.local.example .env.local
# Ajouter vos clés Clerk (NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, etc.)

# Démarrer le serveur de développement
npm run dev
```

**Frontend disponible sur : http://localhost:3000**

## 🔐 Configuration Clerk

### 1. Créer un projet Clerk
1. Aller sur [clerk.com](https://clerk.com)
2. Créer un nouveau projet
3. Récupérer les clés API

### 2. Activer Microsoft/Azure AD
Dans le dashboard Clerk :
1. Aller dans **Social Connections**
2. Activer **Microsoft** 
3. Configurer avec votre Azure App ID
4. Ajouter les scopes nécessaires

### 3. Variables d'environnement

**Backend (.env)** :
```env
CLERK_SECRET=sk_test_xxxxx
CLERK_PEM_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----xxxxx
```

**Frontend (.env.local)** :
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```

## 📋 Fonctionnalités actuelles

### ✅ Authentification
- [x] Inscription/Connexion avec Clerk
- [x] Support Microsoft/Office 365/Azure AD
- [x] Synchronisation automatique avec le backend
- [x] Gestion des rôles (candidate/employer/admin)

### ✅ Base de données
- [x] Modèle User avec Clerk ID
- [x] Modèle Candidate (profil, CV, préférences)
- [x] Modèle Company (informations entreprise)
- [x] Modèle Employer (recruteur + permissions)

### ✅ API Backend
- [x] Endpoints d'authentification
- [x] CRUD utilisateurs
- [x] Middleware de sécurité Clerk
- [x] Gestion des permissions par rôle

### ✅ Interface utilisateur
- [x] Page d'accueil marketing
- [x] Authentification Clerk intégrée
- [x] Onboarding post-inscription
- [x] Middleware de protection des routes

## 🔜 Phase 2 - Dashboard Candidat (Prochaine)

- [ ] Profil candidat complet (expériences, formations, compétences)
- [ ] CV Builder avec templates
- [ ] Système de candidatures
- [ ] Dashboard de suivi
- [ ] Upload de fichiers (S3)

## 🔜 Phase 3 - Dashboard Entreprise + ATS (Après Phase 2)

- [ ] Création d'offres d'emploi multi-étapes
- [ ] Pipeline ATS Kanban
- [ ] Gestion des candidatures
- [ ] Planification d'entretiens
- [ ] Système d'offres d'embauche

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
- Clerk Backend API (Auth)
- Docker (Containerisation)

**Frontend :**
- Next.js 14 (React Framework)
- TypeScript (Types)
- Tailwind CSS (Styles)
- Clerk Next.js (Auth)
- Axios (HTTP Client)

**Authentification :**
- Clerk (Auth-as-a-Service)
- Support Microsoft/Azure AD
- JWT tokens
- Gestion des rôles

## 👥 Équipe et rôles

**Rôles utilisateurs :**
- **Candidate** : Cherche un emploi, crée un profil, postule
- **Employer** : Recrute, gère les offres, utilise l'ATS
- **Admin** : Administration générale de la plateforme

**Intégration Microsoft :**
- Connexion Azure Active Directory
- Support Office 365
- Intégration Outlook/Teams (futur)

## 📞 Support

Pour les questions sur cette phase :
- Backend : Vérifier les logs FastAPI et PostgreSQL
- Frontend : Vérifier la console navigateur et les clés Clerk
- Auth : Vérifier la configuration Clerk et les tokens

---

**Phase 1 terminée avec succès ! 🎉**  
Prêt pour la Phase 2 : Dashboard Candidat
