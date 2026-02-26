# 🚨 FIX PRODUCTION - Mixed Content & CORS

## 🔍 Problèmes Identifiés

### 1. **Mixed Content** (HTTP/HTTPS)
```
Blocage du chargement du contenu mixte actif (mixed active content) 
« http://intowork-dashboard-production-1ede.up.railway.app/api/notifications/... »
```

**Cause** : Frontend HTTPS appelle backend en HTTP au lieu de HTTPS

---

### 2. **CORS Missing Allow Origin**
```
l'en-tête CORS « Access-Control-Allow-Origin » est manquant. Code d'état : 500
```

**Cause** : Erreurs 500 ne retournaient pas les headers CORS

---

### 3. **Erreur 500 sur `/api/integrations/status`**
```
Error loading integrations: AxiosError { message: "Network Error", code: "ERR_NETWORK" }
```

**Cause** : Sérialisation incorrecte des objets Pydantic

---

## ✅ Solutions Appliquées

### Backend (Commit à venir)

1. **Fix `/api/integrations/status` serialization** ✅
   - Ajouté `.model_dump()` sur tous les `IntegrationStatusResponse`
   - Fichier : `backend/app/api/integrations.py`
   - Résout : Erreur 500 lors de la récupération du statut des intégrations

2. **Fix CORS sur erreurs 500** ✅
   - Ajouté headers CORS manuellement dans global exception handler
   - Fichier : `backend/app/main.py`
   - Résout : CORS Missing Allow Origin sur les erreurs serveur

3. **Déplacé `allowed_origins` avant exception handler** ✅
   - Nécessaire pour que l'exception handler puisse utiliser la liste
   - Fichier : `backend/app/main.py`

---

### Frontend (Vercel Configuration) - **ACTION REQUISE** ⚠️

**Problème** : Variable d'environnement Vercel mal configurée ou manquante

**Vérification** :
```bash
# Le frontend a la bonne config localement :
# frontend/.env.production
NEXT_PUBLIC_API_URL=https://intowork-dashboard-production-1ede.up.railway.app/api
```

**MAIS** Vercel doit avoir la variable configurée dans son Dashboard !

#### 📋 Procédure Vercel (2 minutes)

1. **Aller sur** : https://vercel.com/dashboard

2. **Sélectionner** le projet frontend (IntoWork ou similaire)

3. **Settings** → **Environment Variables** (menu latéral gauche)

4. **Vérifier/Ajouter** :

   **Variable Name** : `NEXT_PUBLIC_API_URL`
   
   **Value** : `https://intowork-dashboard-production-1ede.up.railway.app/api`
   
   **Environments** : ✅ Production ✅ Preview ✅ Development

5. **Save**

6. **Redéployer** :
   - Deployments → Latest → ⋯ (trois points) → **Redeploy**
   - Ou push un commit sur main pour trigger auto-deploy

---

## 🧪 Tests de Validation

Après redéploiement backend + frontend :

### 1. Test Mixed Content (F12 Console)

```bash
1. Aller sur : https://www.intowork.co/dashboard
2. F12 → Console
3. ❌ Avant : "Blocage du chargement du contenu mixte actif « http://..."
4. ✅ Après : Aucune erreur Mixed Content
```

### 2. Test CORS (F12 Network)

```bash
1. F12 → Network
2. Chercher requête : /api/integrations/status
3. ❌ Avant : "CORS Missing Allow Origin" + Status 500
4. ✅ Après : Status 200 + Headers "Access-Control-Allow-Origin: https://www.intowork.co"
```

### 3. Test Intégrations (UI)

```bash
1. Dashboard employer → Intégrations (si accessible)
2. ❌ Avant : "Error loading integrations"
3. ✅ Après : Status LinkedIn/Google/Outlook visible (même si non connecté)
```

### 4. Test URL API (Console)

```javascript
// Dans console navigateur sur www.intowork.co
console.log(process.env.NEXT_PUBLIC_API_URL)

// ❌ Avant : undefined OU http://intowork-dashboard...
// ✅ Après : https://intowork-dashboard-production-1ede.up.railway.app/api
```

---

## 🚀 Déploiement

### Backend

```bash
cd /home/anna/Documents/IntoWork

# Commit backend fixes
git add backend/app/api/integrations.py backend/app/main.py
git commit -m "🐛 Fix production CORS and integrations serialization

Fixes:
- Add .model_dump() to IntegrationStatusResponse objects (fix 500 error)
- Add CORS headers to global exception handler (fix CORS on errors)
- Move allowed_origins definition before exception handler

Resolves:
- Mixed Content blocking (HTTPS frontend → HTTP API)
- CORS Missing Allow Origin on 500 errors
- TypeError on /api/integrations/status serialization

Production impact:
- Integrations page will load correctly
- Error responses now include proper CORS headers
- Reduced browser console errors"

# Push to Railway
git push origin main
```

**Railway auto-déploiera** (~5 min)

---

### Frontend (Vercel)

1. **Configurer variable** (voir procédure ci-dessus)
2. **Redéployer** :
   ```bash
   # Optionnel : Force rebuild via commit
   cd frontend
   # Créer commit vide pour trigger redeploy
   git commit --allow-empty -m "chore: trigger Vercel redeploy with updated env vars"
   git push origin main
   ```

**Vercel auto-déploiera** (~2 min)

---

## 📊 Checklist Complète

### Backend ✅
- [x] Fix serialization `/api/integrations/status`
- [x] Add CORS headers to error responses
- [x] Move `allowed_origins` before exception handler
- [ ] Commit & push to GitHub
- [ ] Attendre Railway redeploy (~5 min)
- [ ] Vérifier logs Railway (aucune erreur startup)

### Frontend ⚠️ **ACTION REQUISE**
- [ ] Vérifier Vercel Dashboard → Environment Variables
- [ ] Ajouter/Vérifier `NEXT_PUBLIC_API_URL` = `https://intowork-dashboard-production-1ede.up.railway.app/api`
- [ ] Sélectionner environments : Production + Preview + Development
- [ ] Save
- [ ] Redéployer (Deployments → Redeploy OU push commit)
- [ ] Attendre Vercel deploy (~2 min)

### Tests Production ⏳
- [ ] F12 Console : Aucune erreur Mixed Content
- [ ] F12 Network : Toutes requêtes en HTTPS  
- [ ] /api/integrations/status : Status 200 OK
- [ ] Dashboard charge sans erreurs CORS
- [ ] Notifications s'affichent correctement

---

## 🔗 Liens Utiles

- **Railway Dashboard** : https://railway.app/dashboard
- **Vercel Dashboard** : https://vercel.com/dashboard
- **Frontend Production** : https://www.intowork.co
- **Backend API** : https://intowork-dashboard-production-1ede.up.railway.app/api/ping

---

## ❓ Troubleshooting

### Erreur persiste après redeploy

**Vider cache navigateur** :
```bash
1. F12 → Application (Chrome) ou Storage (Firefox)
2. Clear storage → Clear site data
3. Refresh page (Ctrl+Shift+R)
```

### Vercel ne prend pas la variable

**Hard redeploy** :
```bash
1. Vercel Dashboard → Deployments → Latest
2. ⋯ (trois points) → Redeploy
3. ☑️ Use existing Build Cache : DÉCOCHER
4. Redeploy → Attendre ~5 min
```

### Backend 500 persiste

**Vérifier logs Railway** :
```bash
Railway Dashboard → Latest Deployment → View Logs
# Chercher l'erreur exacte
# Si sérialisation encore présente → Vérifier migration appliquée
```

---

**🎯 PROCHAINE ÉTAPE IMMÉDIATE** :

1. **Commit backend fixes** (commande ci-dessus)
2. **Configurer Vercel variable** `NEXT_PUBLIC_API_URL`  
3. **Attendre 10 minutes** (2x redeploys)
4. **Tester production** checklist
5. **✅ Production fonctionnelle !**
