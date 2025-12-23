# 🚀 Guide de Démarrage Rapide - INTOWORK Dashboard

Guide ultra-complet pour faire fonctionner le projet après clonage.

---

## ⚡ Installation en 5 Minutes

### Prérequis (à installer une seule fois)

```bash
# Vérifier que vous avez:
python3 --version  # Besoin: Python 3.9+
node --version     # Besoin: Node.js 18+
docker --version   # Besoin: Docker (pour PostgreSQL)
```

**Si manquant, voir** : `INSTALLATION.md` pour installation détaillée

---

## 📥 Étape 1: Cloner le Projet

```bash
git clone https://github.com/Intowork-Search/IntoWork-Dashboard.git
cd IntoWork-Dashboard
git checkout feature/migrate-to-nextauth
```

---

## 🗄️ Étape 2: Lancer PostgreSQL

```bash
# Démarrer PostgreSQL avec Docker
docker run --name postgres-intowork \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=intowork \
  -p 5433:5432 \
  -d postgres:15

# Vérifier que c'est lancé
docker ps | grep postgres-intowork
```

**✅ Vous devriez voir:** `postgres-intowork ... Up ...`

---

## 🐍 Étape 3: Configurer le Backend (Python)

### 3.1 Créer l'environnement virtuel

```bash
cd backend

# Créer le venv
python3 -m venv venv

# Activer (Linux/Mac)
source venv/bin/activate

# Activer (Windows)
.\venv\Scripts\activate

# Votre terminal doit maintenant afficher: (venv)
```

### 3.2 Installer les dépendances

```bash
# Mettre à jour pip
pip install --upgrade pip

# Installer toutes les dépendances
pip install -r requirements.txt

# ⏱️ Cela prend ~2 minutes
```

### 3.3 Configurer les variables d'environnement

```bash
# Copier le fichier exemple
cp .env.example .env

# Éditer .env (nano, vim, ou VS Code)
nano .env
```

**Contenu minimal de `.env`:**
```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/intowork

# JWT Secret (CHANGER EN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_ALGORITHM=HS256

# NextAuth Secret (optionnel pour backend)
NEXTAUTH_SECRET=your-nextauth-secret-key-min-32-characters
```

💡 **Astuce:** Pour générer un secret sécurisé:
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 3.4 Appliquer les migrations

```bash
# Depuis backend/ avec (venv) activé

# Vérifier la connexion BD
alembic current

# Appliquer toutes les migrations
alembic upgrade head

# ✅ Vous devriez voir: Running upgrade ... -> 411cd9a350e0
```

### 3.5 Démarrer le backend

```bash
# Depuis backend/ avec (venv) activé
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

**✅ Backend prêt !**
- API: http://localhost:8001
- Docs: http://localhost:8001/docs
- Health: http://localhost:8001/ping

**Garder ce terminal ouvert** ⚠️

---

## ⚛️ Étape 4: Configurer le Frontend (Node.js)

### 4.1 Ouvrir un NOUVEAU terminal

```bash
# Depuis la racine du projet
cd frontend
```

### 4.2 Installer les dépendances

```bash
# Installer tous les packages npm
npm install

# ⏱️ Cela prend ~3 minutes
```

### 4.3 Configurer les variables d'environnement

```bash
# Copier le fichier exemple
cp .env.local.example .env.local

# Éditer .env.local
nano .env.local
```

**Contenu minimal de `.env.local`:**
```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-min-32-characters-same-as-backend

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8001
```

💡 **Important:** Le `NEXTAUTH_SECRET` doit être le MÊME que dans le backend `.env`

### 4.4 Démarrer le frontend

```bash
# Depuis frontend/
npm run dev

# Ou avec Turbopack (plus rapide):
npm run dev --turbo
```

**✅ Frontend prêt !**
- App: http://localhost:3000

**Garder ce terminal ouvert** ⚠️

---

## ✅ Étape 5: Vérifier que Tout Fonctionne

### Test 1: Backend API

Ouvrir un navigateur et aller sur:
```
http://localhost:8001/ping
```

**Attendu:** `{"message":"pong"}`

### Test 2: Backend Docs

```
http://localhost:8001/docs
```

**Attendu:** Interface Swagger avec tous les endpoints

### Test 3: Frontend App

```
http://localhost:3000
```

**Attendu:** Page d'accueil IntoWork avec boutons Sign In / Sign Up

### Test 4: Créer un compte

1. Cliquer sur "Sign Up"
2. Remplir: Email, Password, First Name, Last Name
3. Choisir rôle: Candidate ou Employer
4. ✅ Vous devriez être redirigé vers le dashboard

---

## 🎯 Récapitulatif des Terminaux Ouverts

Vous devriez avoir **2 terminaux actifs**:

### Terminal 1: Backend (Port 8001)
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

### Terminal 2: Frontend (Port 3000)
```bash
cd frontend
npm run dev
```

---

## 🔥 Script de Lancement Automatique

Pour ne pas refaire toutes ces étapes à chaque fois:

### Linux/macOS: `start-dev.sh`

```bash
#!/bin/bash

# Démarrer PostgreSQL (ou le créer s'il n'existe pas)
docker start postgres-intowork 2>/dev/null || docker run --name postgres-intowork \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=intowork \
  -p 5433:5432 \
  -d postgres:15

# Attendre que PostgreSQL soit prêt
echo "⏳ Attente PostgreSQL..."
sleep 5

# Lancer Backend en arrière-plan
echo "🐍 Démarrage Backend..."
cd backend
source venv/bin/activate
alembic upgrade head > /dev/null 2>&1
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001 &
BACKEND_PID=$!

# Lancer Frontend en arrière-plan
echo "⚛️  Démarrage Frontend..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Backend lancé: http://localhost:8001 (PID: $BACKEND_PID)"
echo "✅ Frontend lancé: http://localhost:3000 (PID: $FRONTEND_PID)"
echo "✅ API Docs: http://localhost:8001/docs"
echo ""
echo "Pour arrêter:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo "  docker stop postgres-intowork"

# Attendre
wait
```

**Utilisation:**
```bash
chmod +x start-dev.sh
./start-dev.sh
```

### Windows: `start-dev.bat`

```batch
@echo off
echo 🚀 Lancement IntoWork Dashboard...

REM Démarrer PostgreSQL
docker start postgres-intowork 2>nul || docker run --name postgres-intowork -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=intowork -p 5433:5432 -d postgres:15

REM Attendre
timeout /t 5 /nobreak >nul

REM Lancer Backend
echo 🐍 Backend...
start "Backend" cmd /k "cd backend && venv\Scripts\activate && alembic upgrade head && uvicorn app.main:app --reload --host 0.0.0.0 --port 8001"

REM Attendre un peu
timeout /t 3 /nobreak >nul

REM Lancer Frontend
echo ⚛️  Frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ Backend: http://localhost:8001
echo ✅ Frontend: http://localhost:3000
echo ✅ Docs: http://localhost:8001/docs
```

**Utilisation:**
```cmd
start-dev.bat
```

---

## 🐛 Problèmes Courants et Solutions

### Problème 1: "Port 8001 already in use"

**Solution:**
```bash
# Linux/Mac: Trouver et tuer le processus
lsof -ti:8001 | xargs kill -9

# Windows
netstat -ano | findstr :8001
taskkill /PID <PID> /F
```

### Problème 2: "Port 3000 already in use"

**Solution:**
```bash
# Linux/Mac
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Problème 3: "Connection refused to PostgreSQL"

**Solution:**
```bash
# Vérifier que PostgreSQL tourne
docker ps | grep postgres-intowork

# Si pas lancé
docker start postgres-intowork

# Si n'existe pas
docker run --name postgres-intowork \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=intowork \
  -p 5433:5432 \
  -d postgres:15
```

### Problème 4: "alembic: command not found"

**Solution:**
```bash
# Vérifier que venv est activé
source venv/bin/activate  # Linux/Mac
.\venv\Scripts\activate   # Windows

# Réinstaller
pip install alembic
```

### Problème 5: "Module not found" (Python)

**Solution:**
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt --force-reinstall
```

### Problème 6: "Module not found" (Node)

**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Problème 7: "NEXTAUTH_SECRET is not defined"

**Solution:**
```bash
# Générer un secret
python3 -c "import secrets; print(secrets.token_urlsafe(32))"

# L'ajouter dans backend/.env et frontend/.env.local
# NEXTAUTH_SECRET=<secret_généré>
```

### Problème 8: "Database migration conflict"

**Solution:**
```bash
cd backend
source venv/bin/activate

# Voir l'état actuel
alembic current

# Forcer à la dernière version
alembic upgrade head

# Si toujours bloqué, réinitialiser (⚠️ perte de données)
alembic downgrade base
alembic upgrade head
```

---

## 📚 Fichiers de Configuration Importants

### Backend: `.env`
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/intowork
JWT_SECRET=<générer-secret-32-chars>
JWT_ALGORITHM=HS256
NEXTAUTH_SECRET=<même-secret-que-frontend>
```

### Frontend: `.env.local`
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<même-secret-que-backend>
NEXT_PUBLIC_API_URL=http://localhost:8001
```

---

## 🎓 Structure du Projet

```
IntoWork-Dashboard/
├── backend/                 # API Python FastAPI
│   ├── app/
│   │   ├── main.py         # Point d'entrée
│   │   ├── api/            # Routes
│   │   └── models/         # Modèles BD
│   ├── alembic/            # Migrations
│   ├── requirements.txt    # Dépendances Python
│   └── .env               # Config (à créer)
│
├── frontend/               # App Next.js React
│   ├── src/
│   │   ├── app/           # Pages
│   │   ├── components/    # Composants
│   │   └── lib/           # Utilitaires
│   ├── package.json       # Dépendances Node
│   └── .env.local        # Config (à créer)
│
├── INSTALLATION.md        # Guide complet installation
├── QUICKSTART.md         # Ce fichier
├── README.md             # Documentation projet
└── start-dev.sh          # Script lancement (Linux/Mac)
```

---

## 🎯 Checklist de Vérification

Avant de commencer à développer, vérifiez:

- [ ] PostgreSQL lancé (`docker ps | grep postgres`)
- [ ] Backend venv activé (`(venv)` visible dans terminal)
- [ ] Backend dependencies installées (`pip list | grep fastapi`)
- [ ] Backend `.env` configuré avec secrets
- [ ] Migrations appliquées (`alembic current`)
- [ ] Backend répond sur http://localhost:8001/ping
- [ ] Frontend dependencies installées (`ls node_modules`)
- [ ] Frontend `.env.local` configuré
- [ ] Frontend accessible sur http://localhost:3000
- [ ] Vous pouvez créer un compte (Sign Up)
- [ ] Vous pouvez vous connecter (Sign In)

---

## 🚀 Prochaines Étapes

Une fois tout fonctionnel:

1. **Explorer l'API**: http://localhost:8001/docs
2. **Créer un compte Employer**: Sign Up → Choisir "Employer"
3. **Compléter l'onboarding**: Nom entreprise, poste, téléphone
4. **Créer une offre d'emploi**: Dashboard → Offres d'emploi → Créer
5. **Créer un compte Candidat**: Sign Up → Choisir "Candidate"
6. **Postuler à l'offre**: Recherche d'emplois → Postuler
7. **Vérifier les notifications**: Icône 🔔 dans le header

---

## 📞 Besoin d'Aide?

- **Documentation complète**: Voir `INSTALLATION.md`
- **Problèmes de setup**: Voir section "Problèmes Courants" ci-dessus
- **Détails techniques**: Voir `README.md`
- **Vérifications pré-push**: Voir `PRE_PUSH_VERIFICATION.md`

---

## ✅ En Résumé (TL;DR)

```bash
# 1. Cloner
git clone https://github.com/Intowork-Search/IntoWork-Dashboard.git
cd IntoWork-Dashboard

# 2. PostgreSQL
docker run --name postgres-intowork -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=intowork -p 5433:5432 -d postgres:15

# 3. Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Éditer .env avec vos secrets
alembic upgrade head
uvicorn app.main:app --reload --port 8001

# 4. Frontend (nouveau terminal)
cd frontend
npm install
cp .env.local.example .env.local
# Éditer .env.local avec vos secrets
npm run dev

# 5. Ouvrir http://localhost:3000
```

**C'est tout ! 🎉**

---

*Dernière mise à jour: 23 décembre 2025*
