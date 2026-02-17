# 🚂 Railway Deployment Guide - IntoWork Backend

## ⚠️ Problème Actuel : Backend 502

Le backend Railway retourne une **erreur 502** car le service n'est pas démarré ou a crashé après le paiement de la base de données.

---

## 📋 Étapes de Résolution

### 1️⃣ **Accéder au Dashboard Railway**
- URL : https://railway.app/
- Se connecter avec ton compte

### 2️⃣ **Trouver ton Projet**
- Cherche : **"IntoWork Dashboard"** ou **"intowork-dashboard-production-1ede"**
- Clique dessus

### 3️⃣ **Vérifier les Logs**
```
Dashboard → Service Backend → Logs
```
Cherche des erreurs comme :
- ❌ `Connection refused` (DB non payée/non accessible)
- ❌ `Module not found` (dépendances manquantes)
- ❌ `Environment variable not set` (variable manquante)

### 4️⃣ **Vérifier les Variables d'Environnement**
```
Dashboard → Service Backend → Variables
```

**Variables REQUISES :**
```bash
# Database (fournie automatiquement par Railway)
DATABASE_URL=postgresql://...

# JWT Authentication
JWT_SECRET=votre-secret-jwt-super-long-et-complexe
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=43200

# Anthropic AI (pour le scoring)
ANTHROPIC_API_KEY=sk-ant-api03-... (NOUVELLE CLÉ - révoquer l'ancienne)

# CORS (optionnel - déjà configuré dans le code)
ALLOWED_ORIGINS=https://www.intowork.co,https://intowork.co

# Redis (si utilisé)
REDIS_URL=redis://... (ou laisser vide)
```

### 5️⃣ **Forcer un Redéploiement**
```
Dashboard → Service Backend → Deployments → Latest Deployment
→ Clic sur les 3 points (...) → "Redeploy"
```

OU depuis le terminal local :
```bash
git commit --allow-empty -m "chore: Trigger Railway redeploy"
git push origin main
```

### 6️⃣ **Attendre le Déploiement**
- Le déploiement prend environ **3-5 minutes**
- Surveille les logs en temps réel
- Attends le message : `✅ All services initialized successfully`

### 7️⃣ **Tester le Backend**
```bash
# Test health check
curl https://intowork-dashboard-production-1ede.up.railway.app/health

# Expected: {"status":"healthy","service":"intowork-backend"}
```

```bash
# Test API jobs
curl https://intowork-dashboard-production-1ede.up.railway.app/api/jobs/?limit=10

# Expected: {"jobs":[...],"total":X,...}
```

---

## 🔍 Checklist de Débogage

### ✅ Base de Données
- [ ] Railway DB payée et active
- [ ] `DATABASE_URL` configurée automatiquement
- [ ] Connexion DB OK (visible dans les logs)

### ✅ Variables d'Environnement
- [ ] `JWT_SECRET` configuré
- [ ] `ANTHROPIC_API_KEY` configuré (NOUVELLE CLÉ)
- [ ] `ALLOWED_ORIGINS` configuré (si nécessaire)

### ✅ Code Backend
- [ ] Dernier commit pushed : `cc5e11c`
- [ ] Fichier `requirements.txt` à jour (anthropic>=0.18.0)
- [ ] Migrations appliquées automatiquement

### ✅ CORS
- [ ] Origins configurées dans `main.py` :
  - `http://localhost:3000`
  - `https://www.intowork.co`
  - `https://intowork.co`
  - `https://intowork-dashboard.vercel.app`

### ✅ Health Check
- [ ] Endpoint `/health` accessible
- [ ] Retourne `{"status":"healthy"}`

---

## 🚨 Erreurs Courantes

### Erreur : "Connection to PostgreSQL refused"
**Solution :** La base de données n'est pas accessible
- Vérifie que le paiement Railway est passé
- Vérifie que la DB est active dans le dashboard
- Attends 5-10 minutes après le paiement

### Erreur : "ANTHROPIC_API_KEY not set"
**Solution :** Variable d'environnement manquante
- Va dans Railway → Variables
- Ajoute `ANTHROPIC_API_KEY=sk-ant-...`
- **IMPORTANT** : Utilise une NOUVELLE clé (révoquer l'ancienne)

### Erreur : "CORS policy blocked"
**Solution :** Frontend Vercel non autorisé
- Vérifie que `https://www.intowork.co` est dans `allowed_origins`
- Redéploie le backend après modification

### Erreur : "Module 'anthropic' not found"
**Solution :** Dépendances pas installées
- Vérifie que `anthropic>=0.18.0` est dans `requirements.txt`
- Force un rebuild : Redeploy depuis Railway

---

## 📊 Monitoring

### Logs en Temps Réel
```
Railway Dashboard → Service → Logs
```

### Métriques Prometheus
```
https://intowork-dashboard-production-1ede.up.railway.app/metrics
```

### Database Pool
Les logs montrent les connexions DB :
```
📊 Database pool metrics: size=10 checked_out=0 overflow=0
```

---

## ✅ Succès Attendu

Une fois redéployé avec succès, tu verras :

**Dans les Logs Railway :**
```
🚀 Starting up INTOWORK Backend API...
✅ All services initialized successfully
📊 Database pool metrics: size=10 checked_out=0 overflow=0
INFO:     Application startup complete.
```

**Dans le Frontend (www.intowork.co) :**
```
🚀 Début chargement des données...
✅ Response from API: {jobs: [...], total: X}
🏢 Companies set: [{name: "...", count: X}, ...]
```

**Résultat Visible :**
- ✅ Page d'accueil affiche 2 entreprises
- ✅ Page `/entreprises` charge toutes les entreprises
- ✅ Page `/offres` charge toutes les offres
- ✅ Pas d'erreur CORS

---

## 📞 Support

Si le problème persiste après ces étapes :

1. **Partage les logs Railway** (copie-colle les 50 dernières lignes)
2. **Vérifie l'URL exacte** : `https://intowork-dashboard-production-1ede.up.railway.app`
3. **Teste avec curl** : `curl -v https://intowork-dashboard-production-1ede.up.railway.app/health`
4. **Vérifie le statut Railway** : https://railway.app/status

---

**Dernière mise à jour :** 10 février 2026
**Version Backend :** commit `cc5e11c`
**Status :** 🔴 Backend DOWN (502) - Redéploiement nécessaire
