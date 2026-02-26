# 🔧 Fix CORS et Erreur 500 - Intégrations

**Date** : 26 février 2026  
**Problème** : Erreurs CORS et 500 sur `/api/integrations/status`

---

## 🐛 Problèmes Identifiés

### 1. Erreur 500 sur `/api/integrations/status`
**Cause** : L'endpoint ne gérait pas le cas où `employer.company_id` est `NULL`

**Solution Appliquée** :
- ✅ Ajout d'une vérification dans `backend/app/api/integrations.py`
- ✅ Retour d'un statut par défaut si l'employeur n'a pas d'entreprise

### 2. CORS "Access-Control-Allow-Origin" manquant
**Cause** : Configuration CORS correcte dans le code, mais potentielle erreur 500 empêchait les headers CORS d'être envoyés

**Solution** :
- ✅ CORS déjà configuré pour `https://www.intowork.co` dans `backend/app/main.py`
- ✅ Fix de l'erreur 500 devrait résoudre les CORS

### 3. Mixed Content (HTTP vs HTTPS)
**Cause** : Variable `NEXT_PUBLIC_API_URL` peut-être incorrecte dans Vercel

**Solution** :
- ⏳ Vérifier la variable dans Vercel dashboard

---

## 📋 Étapes de Déploiement

### 1️⃣ Déployer le Backend sur Railway

Le fix a été appliqué dans `backend/app/api/integrations.py`. Il faut déployer:

```bash
cd /home/anna/Documents/IntoWork
git add backend/app/api/integrations.py
git commit -m "🐛 Fix integrations status endpoint - handle NULL company_id"
git push origin main
```

Railway va automatiquement redéployer le backend (3-5 minutes).

### 2️⃣ Vérifier les Variables d'Environnement Vercel

1. Aller sur [Vercel Dashboard](https://vercel.com)
2. Sélectionner le projet **IntoWork** (frontend)
3. Onglet **Settings** → **Environment Variables**
4. Vérifier que cette variable existe et est correcte :

```env
NEXT_PUBLIC_API_URL=https://intowork-dashboard-production-1ede.up.railway.app/api
```

**⚠️ Important** : 
- DOIT commencer par `https://` (pas `http://`)
- DOIT se terminer par `/api`

Si la variable n'existe pas ou est incorrecte :
- Cliquer **Add New Variable**
- Variable name : `NEXT_PUBLIC_API_URL`
- Value : `https://intowork-dashboard-production-1ede.up.railway.app/api`
- Environments : **Production** ✅
- Cliquer **Save**

### 3️⃣ Redéployer le Frontend (si variable changée)

Si vous avez modifié la variable d'environnement :

1. Aller sur **Deployments**
2. Cliquer sur les **...** du dernier déploiement
3. Cliquer **Redeploy**

Ou depuis le terminal :

```bash
cd /home/anna/Documents/IntoWork/frontend
vercel --prod
```

---

## ✅ Vérification Post-Déploiement

### Test Backend

```bash
# Tester l'endpoint directement (sans auth)
curl https://intowork-dashboard-production-1ede.up.railway.app/api/ping

# Devrait retourner:
# {"ping":"pong","timestamp":"...","service":"intowork-backend"}
```

### Test Frontend

1. Aller sur https://www.intowork.co
2. Se connecter en tant qu'employeur
3. Aller sur **Intégrations** dans la sidebar
4. Vérifier qu'il n'y a plus d'erreurs dans la console (F12)

**Résultat attendu** :
- ✅ Pas d'erreur CORS
- ✅ Pas d'erreur 500
- ✅ Les 3 intégrations s'affichent avec statut "Non connecté"

---

## 🔍 Logs de Debug

### Si l'erreur persiste, vérifier :

**Backend Railway Logs** :
1. Railway Dashboard → Service Backend
2. Onglet **Deployments** → Dernier déploiement
3. Onglet **View Logs**
4. Chercher "IntegrationCredential" ou "500"

**Frontend Vercel Logs** :
1. Vercel Dashboard → Projet IntoWork
2. Onglet **Deployments** → Dernier déploiement
3. Onglet **Runtime Logs**
4. Chercher "API" ou "CORS"

**Browser Console** :
1. F12 dans le navigateur
2. Onglet **Console**
3. Onglet **Network** → Filter par "status"
4. Vérifier les requêtes en rouge

---

## 🛠️ Fix Supplémentaire (si nécessaire)

### Si l'employeur n'a pas de company_id

L'utilisateur doit d'abord créer une entreprise :

1. Aller sur **Mon Entreprise** dans la sidebar
2. Remplir le formulaire de création d'entreprise
3. Sauvegarder
4. Retourner sur **Intégrations**

**Note** : Le fix appliqué gère ce cas et affiche un statut par défaut au lieu de crasher.

---

## 📊 Changements Appliqués

### Fichier Modifié

**`backend/app/api/integrations.py`** :
- Ligne 532 : Ajout vérification `if not employer.company_id:`
- Lignes 533-556 : Retour statut par défaut si pas d'entreprise
- Empêche l'erreur 500

### Commit

```
🐛 Fix integrations status endpoint - handle NULL company_id

- Add check for employer.company_id before querying IntegrationCredential
- Return default integration status if employer has no company
- Prevents 500 error when accessing /api/integrations/status
- Improves error handling for edge cases
```

---

**Créé le** : 26 février 2026  
**Auteur** : IntoWork Dev Team
