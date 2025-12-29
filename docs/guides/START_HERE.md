# 🎯 Vous venez de cloner le projet ? Lisez ceci !

## ⚡ En 5 minutes

### 1️⃣ Installer les prérequis
```bash
# Vérifiez que vous avez:
python3 --version  # Besoin: 3.9+
node --version     # Besoin: 18+
docker --version   # Pour PostgreSQL
```

**Manque quelque chose ?** → Lisez **[INSTALLATION.md](./INSTALLATION.md)**

---

### 2️⃣ Lancer PostgreSQL
```bash
docker run --name postgres-intowork \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=intowork \
  -p 5433:5432 \
  -d postgres:15
```

---

### 3️⃣ Backend (Terminal 1)
```bash
cd backend

# Créer venv
python3 -m venv venv
source venv/bin/activate    # Linux/Mac
# .\venv\Scripts\activate   # Windows

# Installer
pip install -r requirements.txt

# Configurer
cp .env.example .env
# Éditer .env: JWT_SECRET, NEXTAUTH_SECRET

# Migrations
alembic upgrade head

# Lancer
uvicorn app.main:app --reload --port 8001
```

**✅ Backend:** http://localhost:8001/ping

---

### 4️⃣ Frontend (Terminal 2 - NOUVEAU)
```bash
cd frontend

# Installer
npm install

# Configurer
cp .env.local.example .env.local
# Éditer .env.local: NEXTAUTH_SECRET (même que backend)

# Lancer
npm run dev
```

**✅ Frontend:** http://localhost:3000

---

## 🎉 C'est tout !

**Ouvrez:** http://localhost:3000

**Testez:**
1. Sign Up → Créer un compte
2. Choisir Employer ou Candidate
3. Explorer le dashboard

---

## 📚 Documentation Complète

- **Guide détaillé**: [QUICKSTART.md](./QUICKSTART.md) - Tout est expliqué
- **Installation OS**: [INSTALLATION.md](./INSTALLATION.md) - Ubuntu/macOS/Windows
- **Infos projet**: [README.md](./README.md) - Architecture & features
- **Problèmes?**: Voir section "Problèmes Courants" dans QUICKSTART.md

---

## 🐛 Problème Rapide?

### "Port déjà utilisé"
```bash
# Tuer le processus
lsof -ti:8001 | xargs kill -9  # Backend
lsof -ti:3000 | xargs kill -9  # Frontend
```

### "PostgreSQL pas lancé"
```bash
docker start postgres-intowork
```

### "Module not found"
```bash
# Backend
cd backend && source venv/bin/activate && pip install -r requirements.txt

# Frontend
cd frontend && npm install
```

---

## ⚡ Script Auto (Linux/Mac)

```bash
chmod +x start-dev.sh
./start-dev.sh
```

---

**Besoin d'aide ? Lisez [QUICKSTART.md](./QUICKSTART.md) 📖**
