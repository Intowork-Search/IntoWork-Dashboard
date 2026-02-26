# 🚂 Configuration Railway - Variables & Volumes

## Date: 26 février 2026

---

## ⚠️ IMPORTANT : railway.toml Simplifié

Le fichier `railway.toml` a été corrigé et simplifié. Les configurations suivantes doivent maintenant être faites **dans le Railway Dashboard** :

- ✅ Variables d'environnement (`PORT`, `PYTHONUNBUFFERED`, etc.)
- ✅ Volumes persistants (`/app/uploads`)
- ✅ Healthchecks (automatiques dans Railway)

---

## 📋 Configuration Requise dans Railway Dashboard

### 1️⃣ Variables d'Environnement

**Aller sur** : Railway Dashboard → Projet Backend → **Variables**

**Variables requises** :

```bash
# Port (Railway gère automatiquement, mais on peut override)
PORT=8001

# Python configuration
PYTHONUNBUFFERED=1
PYTHONDONTWRITEBYTECODE=1

# Database (déjà configuré si PostgreSQL plugin activé)
DATABASE_URL=postgresql://...  # Auto-généré par Railway

# NextAuth JWT (doit correspondre au frontend)
NEXTAUTH_SECRET=<votre-secret-32-chars>
JWT_SECRET=<votre-jwt-secret>
JWT_ALGORITHM=HS256

# Email (Resend)
RESEND_API_KEY=<votre-resend-api-key>
FROM_EMAIL=INTOWORK <noreply@intowork.com>

# Frontend URL (pour CORS)
FRONTEND_URL=https://www.intowork.co
ALLOWED_ORIGINS=https://www.intowork.co,https://intowork.co

# Railway specific
RAILWAY_ENVIRONMENT=production
```

---

### 2️⃣ Volume Persistant pour Uploads

**Aller sur** : Railway Dashboard → Projet Backend → **Settings** → **Volumes**

**Créer un nouveau volume** :

```
Name: uploads
Mount Path: /app/uploads
Size: 1GB (gratuit)
```

**Étapes détaillées** :

1. Dans votre projet Railway, aller sur le service **Backend**
2. Cliquer sur **Settings** (⚙️)
3. Descendre vers section **"Volumes"**
4. Cliquer **"+ New Volume"**
5. Remplir :
   - **Mount Path** : `/app/uploads`
   - **Name** : `uploads` (optionnel)
6. Cliquer **"Add"**
7. Le service redéploie automatiquement (~5 min)

**Vérification** :
- Après redeploy, les fichiers uploadés (CVs, logos) persisteront
- Tester : Upload un logo → Redeploy → Logo reste visible

---

### 3️⃣ Healthcheck (Automatique)

Railway détecte automatiquement le endpoint `/health` si disponible.

**Rien à configurer** - Notre backend expose déjà :
```python
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "intowork-backend"}
```

Railway ping automatiquement toutes les 30s.

---

## 🔍 Vérifier Configuration Actuelle

### Via Railway Dashboard

1. **Variables** → Vérifier toutes les variables listées ci-dessus
2. **Volumes** → Vérifier `/app/uploads` existe
3. **Deployments** → Latest deployment = "Success"

### Via API (Test)

```bash
# Test health endpoint
curl https://intowork-dashboard-production-1ede.up.railway.app/health

# Résultat attendu :
{"status":"healthy","service":"intowork-backend"}
```

---

## 📝 railway.toml Corrigé

Le nouveau `railway.toml` est minimal et valide :

```toml
# Railway configuration for IntoWork Backend
# Reference: https://docs.railway.app/guides/config-as-code

[build]
builder = "DOCKERFILE"
dockerfilePath = "Dockerfile"

[deploy]
startCommand = "sh start.sh"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

**Ce qui a été enlevé** (maintenant dans Dashboard) :
- ❌ `[env]` - Variables dans Dashboard
- ❌ `[[mounts]]` - Volumes dans Dashboard  
- ❌ `[deploy.healthchecks]` - Automatique dans Railway
- ❌ `numReplicas` - Railway gère automatiquement
- ❌ `sleepApplication` - Pas nécessaire

---

## 🚀 Déploiement

Après modification de `railway.toml` :

```bash
cd /home/anna/Documents/IntoWork

# Commit
git add railway.toml
git commit -m "🔧 Fix railway.toml - Remove invalid schema properties"

# Push (Railway redéploie auto)
git push origin main

# Attendre ~5 minutes
# Vérifier : Railway Dashboard → Deployments → Latest = Success
```

---

## ⚠️ Erreurs Corrigées

### Avant (❌ Invalide)
```toml
builder = "dockerfile"  # ❌ Invalide
restartPolicyType = "always"  # ❌ Invalide
[deploy.healthchecks]  # ❌ Non supporté
[env]  # ❌ Doit être dans Dashboard
[[mounts]]  # ❌ Doit être dans Dashboard
```

### Après (✅ Valide)
```toml
builder = "DOCKERFILE"  # ✅ Valide
restartPolicyType = "ON_FAILURE"  # ✅ Valide
# Healthchecks = automatique
# Env = Dashboard
# Mounts = Dashboard
```

---

## 🧪 Tests Après Configuration

### 1. Test Backend Health
```bash
curl https://intowork-dashboard-production-1ede.up.railway.app/health
# ✅ {"status":"healthy","service":"intowork-backend"}
```

### 2. Test Volume Persistant
```bash
# Upload un logo sur /dashboard/company
# Vérifier URL : https://.../uploads/company_logos/...
# Redeploy Railway
# Logo doit rester visible (pas supprimé)
```

### 3. Test Variables Env
```bash
# Vérifier logs Railway
# Doit montrer :
# "✓ Environment variables loaded"
# "✓ Connected to database"
# "✓ Uvicorn running on http://0.0.0.0:8001"
```

---

## 📚 Références

- Railway Docs : https://docs.railway.app/guides/config-as-code
- railway.toml Schema : https://docs.railway.app/deploy/railway-toml
- Environment Variables : https://docs.railway.app/guides/variables
- Volumes : https://docs.railway.app/guides/volumes

---

## ❓ FAQ

**Q: Pourquoi enlever [env] de railway.toml ?**

R: Railway a changé son schéma. Les variables d'environnement doivent maintenant être configurées dans le Dashboard pour plus de sécurité et flexibilité.

**Q: Les volumes créés dans Dashboard sont-ils persistants ?**

R: Oui ! Les volumes Railway persistent même après redeploy, contrairement au filesystem éphémère par défaut.

**Q: Le PORT doit-il être 8000 ou 8001 ?**

R: Railway assigne automatiquement un PORT (généralement 8000). Notre app écoute sur ce port. En local, on utilise 8001 pour éviter conflits.

**Q: Que faire si le deploy échoue après modification railway.toml ?**

R: Vérifier logs Railway Dashboard → Deployments → Latest → Build Logs. L'erreur sera visible là.

