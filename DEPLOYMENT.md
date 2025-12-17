# 🚀 Guide de Déploiement IntoWork

## 📋 Prérequis

1. **Comptes nécessaires :**
   - [Railway](https://railway.app) - pour le backend
   - [Vercel](https://vercel.com) - pour le frontend  
   - [Clerk](https://clerk.dev) - clés de production

2. **Repository GitHub :**
   - `https://github.com/Intowork-Search/IntoWork-Dashboard`

---

## 1️⃣ Déploiement Backend (Railway)

### Étapes :
1. **Connexion à Railway :**
   ```bash
   # Installer Railway CLI (optionnel)
   npm install -g @railway/cli
   railway login
   ```

2. **Créer un nouveau projet :**
   - Aller sur [railway.app](https://railway.app)
   - "New Project" → "Deploy from GitHub repo"
   - Sélectionner : `Intowork-Search/IntoWork-Dashboard`
   - **Root Directory:** `/backend`

3. **Configuration automatique :**
   - Railway détecte automatiquement le `Dockerfile`
   - Le build se lance automatiquement

4. **Variables d'environnement :**
   ```env
   DATABASE_URL=postgresql://... (automatique avec Railway PostgreSQL)
   CLERK_SECRET_KEY=sk_live_...
   PORT=8000 (automatique)
   ENVIRONMENT=production
   ```

5. **Base de données :**
   - Ajouter PostgreSQL depuis Railway
   - DATABASE_URL sera automatiquement configurée

---

## 2️⃣ Déploiement Frontend (Vercel)

### Étapes :
1. **Connexion à Vercel :**
   - Aller sur [vercel.com](https://vercel.com)
   - "New Project" → "Import Git Repository"
   - Sélectionner : `Intowork-Search/IntoWork-Dashboard`

2. **Configuration :**
   - **Framework Preset:** Next.js
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build` (automatique)
   - **Output Directory:** `.next` (automatique)

3. **Variables d'environnement :**
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
   CLERK_SECRET_KEY=sk_live_...
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   NODE_ENV=production
   ```

---

## 3️⃣ Configuration Clerk

### Paramètres de production :
1. **URLs autorisées :**
   - Frontend: `https://your-app.vercel.app`
   - Backend: `https://your-backend.railway.app`

2. **Webhooks :**
   - Endpoint: `https://your-backend.railway.app/webhooks/clerk`

---

## 4️⃣ Test du déploiement

### Vérifications :
```bash
# Health check backend
curl https://your-backend.railway.app/api/ping

# Test frontend
curl https://your-app.vercel.app
```

---

## 🔧 Troubleshooting

### Erreurs communes :

1. **Build frontend échoue :**
   ```bash
   # Vérifier les dépendances
   cd frontend && npm install
   npm run build
   ```

2. **Database connection :**
   ```bash
   # Vérifier DATABASE_URL dans Railway
   echo $DATABASE_URL
   ```

3. **CORS errors :**
   ```python
   # Vérifier ALLOWED_ORIGINS dans backend
   ALLOWED_ORIGINS=https://your-app.vercel.app
   ```

---

## 📊 Monitoring

### URLs importantes :
- **Backend API:** `https://your-backend.railway.app/docs`
- **Frontend:** `https://your-app.vercel.app`
- **Health:** `https://your-backend.railway.app/api/ping`

### Logs :
- **Railway:** Dashboard → Logs
- **Vercel:** Dashboard → Functions → View Logs
