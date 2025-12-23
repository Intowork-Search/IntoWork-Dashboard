# 🚀 Guide d'Installation - INTOWORK Dashboard

Guide complet pour installer et lancer le projet sur un nouveau PC.

---

## 📋 Prérequis

### 1. Python (Backend)
Le projet nécessite **Python 3.9+**

#### **Sur Ubuntu/Debian/Linux:**
```bash
# Vérifier si Python est installé
python3 --version

# Si pas installé, installer Python
sudo apt update
sudo apt install python3 python3-pip python3-venv

# Vérifier l'installation de pip
pip3 --version
```

#### **Sur macOS:**
```bash
# Avec Homebrew (recommandé)
brew install python3

# Ou télécharger depuis python.org
# https://www.python.org/downloads/macos/

# Vérifier
python3 --version
pip3 --version
```

#### **Sur Windows:**
```powershell
# Télécharger Python depuis python.org
# https://www.python.org/downloads/windows/
# ⚠️ IMPORTANT: Cocher "Add Python to PATH" pendant l'installation

# Vérifier dans PowerShell ou CMD
python --version
pip --version
```

### 2. Node.js (Frontend)
Le projet nécessite **Node.js 18+**

#### **Sur Ubuntu/Debian/Linux:**
```bash
# Avec NodeSource (recommandé)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Ou avec nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20

# Vérifier
node --version
npm --version
```

#### **Sur macOS:**
```bash
# Avec Homebrew
brew install node

# Ou avec nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20

# Vérifier
node --version
npm --version
```

#### **Sur Windows:**
```powershell
# Télécharger depuis nodejs.org
# https://nodejs.org/en/download/

# Ou avec Chocolatey
choco install nodejs

# Vérifier
node --version
npm --version
```

### 3. Git
```bash
# Ubuntu/Debian
sudo apt install git

# macOS
brew install git

# Windows
# Télécharger depuis git-scm.com

# Vérifier
git --version
```

### 4. PostgreSQL (Base de données)

#### **Option A: Avec Docker (Recommandé)**
```bash
# Ubuntu/Debian
sudo apt install docker.io docker-compose

# macOS
brew install docker docker-compose

# Windows
# Télécharger Docker Desktop depuis docker.com

# Lancer PostgreSQL
docker run --name postgres-intowork \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=intowork \
  -p 5433:5432 \
  -d postgres:15
```

#### **Option B: Installation native**
```bash
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql@15

# Windows
# Télécharger depuis postgresql.org
```

---

## 🔧 Installation du Projet

### 1️⃣ Cloner le Repository

```bash
# Cloner le projet
git clone https://github.com/Intowork-Search/IntoWork-Dashboard.git
cd IntoWork-Dashboard

# Aller sur la bonne branche
git checkout feature/migrate-to-nextauth
```

---

## 🐍 2️⃣ Configuration Backend (Python + FastAPI)

### Créer un environnement virtuel

#### **Sur Linux/macOS:**
```bash
cd backend

# Créer l'environnement virtuel
python3 -m venv venv

# Activer l'environnement
source venv/bin/activate

# Votre terminal devrait maintenant afficher (venv)
```

#### **Sur Windows:**
```powershell
cd backend

# Créer l'environnement virtuel
python -m venv venv

# Activer l'environnement
.\venv\Scripts\activate

# Votre terminal devrait maintenant afficher (venv)
```

### Installer les dépendances Python

```bash
# (venv) doit être visible dans votre terminal

# Mettre à jour pip
pip install --upgrade pip

# Installer toutes les dépendances
pip install -r requirements.txt
```

**Dépendances installées:**
- FastAPI (API)
- SQLAlchemy (ORM)
- Alembic (Migrations)
- PostgreSQL driver
- JWT, bcrypt (Auth)
- Et plus...

### Configurer les variables d'environnement

```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer .env avec vos valeurs
nano .env  # ou vim, ou votre éditeur préféré
```

**Contenu de `.env`:**
```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/intowork

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_ALGORITHM=HS256

# NextAuth (si migration complète)
NEXTAUTH_SECRET=another-super-secret-key-32-chars-min
```

### Lancer PostgreSQL et créer la base de données

```bash
# Si avec Docker (depuis le répertoire backend)
docker run --name postgres-intowork \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=intowork \
  -p 5433:5432 \
  -d postgres:15

# Vérifier que PostgreSQL est lancé
docker ps

# Appliquer les migrations
alembic upgrade head
```

### Démarrer le backend

```bash
# Depuis backend/ avec (venv) activé
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

**✅ Backend prêt sur:** http://localhost:8001
- Documentation API: http://localhost:8001/docs
- Health check: http://localhost:8001/ping

---

## ⚛️ 3️⃣ Configuration Frontend (Next.js + React)

### Ouvrir un NOUVEAU terminal

```bash
# Depuis la racine du projet
cd frontend
```

### Installer les dépendances Node.js

```bash
# Installer toutes les dépendances
npm install

# Ou avec yarn
yarn install
```

**Dépendances installées:**
- Next.js 16 (Framework)
- React 18 (UI)
- NextAuth (Auth)
- Tailwind CSS (Styles)
- TypeScript (Types)
- Et plus...

### Configurer les variables d'environnement

```bash
# Copier le fichier d'exemple
cp .env.local.example .env.local

# Éditer .env.local
nano .env.local
```

**Contenu de `.env.local`:**
```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-min-32-chars

# API Backend
NEXT_PUBLIC_API_URL=http://localhost:8001

# Si vous utilisez des services externes
# NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
```

### Démarrer le frontend

```bash
# Depuis frontend/
npm run dev

# Ou avec turbopack (plus rapide)
npm run dev --turbo
```

**✅ Frontend prêt sur:** http://localhost:3000

---

## 🎯 4️⃣ Vérifier que tout fonctionne

### Test Backend
```bash
# Dans un nouveau terminal
curl http://localhost:8001/ping

# Réponse attendue:
# {"message":"pong"}
```

### Test Frontend
Ouvrir votre navigateur sur: http://localhost:3000

Vous devriez voir la page d'accueil.

### Test Database
```bash
# Se connecter à PostgreSQL
docker exec -it postgres-intowork psql -U postgres -d intowork

# Lister les tables
\dt

# Sortir
\q
```

---

## 📝 Commandes Utiles

### Backend (Terminal 1)

```bash
# Activer l'environnement virtuel
cd backend
source venv/bin/activate  # Linux/Mac
.\venv\Scripts\activate   # Windows

# Démarrer le serveur
uvicorn app.main:app --reload --port 8001

# Créer une nouvelle migration
alembic revision --autogenerate -m "description"

# Appliquer les migrations
alembic upgrade head

# Désactiver l'environnement virtuel
deactivate
```

### Frontend (Terminal 2)

```bash
cd frontend

# Démarrer en dev
npm run dev

# Build production
npm run build

# Démarrer production
npm run start

# Linter
npm run lint
```

### PostgreSQL

```bash
# Démarrer PostgreSQL
docker start postgres-intowork

# Arrêter PostgreSQL
docker stop postgres-intowork

# Voir les logs
docker logs postgres-intowork

# Se connecter à la DB
docker exec -it postgres-intowork psql -U postgres -d intowork
```

---

## 🔥 Script de Lancement Rapide

### Linux/macOS

Créer un fichier `start-dev.sh`:
```bash
#!/bin/bash

# Démarrer PostgreSQL
docker start postgres-intowork || docker run --name postgres-intowork \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=intowork \
  -p 5433:5432 \
  -d postgres:15

# Attendre que PostgreSQL soit prêt
sleep 3

# Terminal 1: Backend
cd backend
source venv/bin/activate
alembic upgrade head
uvicorn app.main:app --reload --port 8001 &

# Terminal 2: Frontend
cd ../frontend
npm run dev &

echo "✅ Backend: http://localhost:8001"
echo "✅ Frontend: http://localhost:3000"
echo "✅ API Docs: http://localhost:8001/docs"

wait
```

```bash
# Rendre exécutable
chmod +x start-dev.sh

# Lancer
./start-dev.sh
```

### Windows

Créer un fichier `start-dev.bat`:
```batch
@echo off

REM Démarrer PostgreSQL
docker start postgres-intowork

REM Attendre
timeout /t 3

REM Backend
start cmd /k "cd backend && venv\Scripts\activate && alembic upgrade head && uvicorn app.main:app --reload --port 8001"

REM Frontend
start cmd /k "cd frontend && npm run dev"

echo Backend: http://localhost:8001
echo Frontend: http://localhost:3000
```

---

## 🐛 Résolution de Problèmes

### Problème: `pip: command not found`

**Solution:**
```bash
# Ubuntu/Debian
sudo apt install python3-pip

# macOS
python3 -m ensurepip --upgrade

# Windows
# Réinstaller Python en cochant "Add to PATH"
```

### Problème: `npm: command not found`

**Solution:**
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# macOS
brew install node

# Windows
# Télécharger depuis nodejs.org
```

### Problème: Port déjà utilisé

**Backend (8001):**
```bash
# Trouver le processus
lsof -i :8001  # Linux/Mac
netstat -ano | findstr :8001  # Windows

# Tuer le processus
kill -9 <PID>  # Linux/Mac
taskkill /PID <PID> /F  # Windows
```

**Frontend (3000):**
```bash
# Même chose pour le port 3000
lsof -i :3000
kill -9 <PID>
```

### Problème: PostgreSQL ne démarre pas

```bash
# Supprimer l'ancien conteneur
docker rm -f postgres-intowork

# Recréer
docker run --name postgres-intowork \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=intowork \
  -p 5433:5432 \
  -d postgres:15
```

### Problème: Erreur de migration Alembic

```bash
# Réinitialiser complètement
cd backend
rm -rf alembic/versions/*.py  # ⚠️ Attention: supprime l'historique
alembic revision --autogenerate -m "initial"
alembic upgrade head
```

### Problème: Module Python manquant

```bash
# Réinstaller toutes les dépendances
cd backend
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

---

## 📚 Ressources

### Documentation
- **FastAPI:** https://fastapi.tiangolo.com/
- **Next.js:** https://nextjs.org/docs
- **NextAuth:** https://next-auth.js.org/
- **PostgreSQL:** https://www.postgresql.org/docs/
- **Alembic:** https://alembic.sqlalchemy.org/

### Support
- Issues GitHub: https://github.com/Intowork-Search/IntoWork-Dashboard/issues
- Documentation projet: Voir README.md

---

## ✅ Checklist Finale

Avant de commencer à développer, vérifiez que:

- [ ] Python 3.9+ installé (`python3 --version`)
- [ ] pip installé (`pip3 --version`)
- [ ] Node.js 18+ installé (`node --version`)
- [ ] npm installé (`npm --version`)
- [ ] Git installé (`git --version`)
- [ ] PostgreSQL lancé (Docker ou natif)
- [ ] Backend démarre sans erreur (http://localhost:8001/ping)
- [ ] Frontend démarre sans erreur (http://localhost:3000)
- [ ] Migrations appliquées (`alembic current`)
- [ ] Variables d'environnement configurées (.env et .env.local)

**Si tout est ✅, vous êtes prêt à développer ! 🎉**

---

*Dernière mise à jour: 23 décembre 2025*
