# 🔧 Fix Mixed Content & Image Loading Issues

## Date: 26 février 2026

## Problèmes Identifiés

### 1. ❌ Mixed Content Error (HTTP sur HTTPS)

**Erreur:**
```
Blocage du chargement du contenu mixte actif (mixed active content) 
« http://intowork-dashboard-production-1ede.up.railway.app/api/notifications/?... »
```

**Cause:**
- Le frontend fait des requêtes en HTTP au lieu de HTTPS
- Variable d'environnement `NEXT_PUBLIC_API_URL` configurée avec `http://` dans Vercel

**Solution:**

1. **Aller sur Vercel Dashboard:**
   - Projet: `intowork-dashboard`
   - Settings → Environment Variables

2. **Vérifier `NEXT_PUBLIC_API_URL`:**
   ```bash
   # ❌ MAUVAIS (cause Mixed Content)
   NEXT_PUBLIC_API_URL=http://intowork-dashboard-production-1ede.up.railway.app/api
   
   # ✅ BON (force HTTPS)
   NEXT_PUBLIC_API_URL=https://intowork-dashboard-production-1ede.up.railway.app/api
   ```

3. **Corriger la variable:**
   - Changer `http://` → `https://`
   - Save
   - Redeploy le frontend (automatique après save)

4. **Vérifier après redeploy:**
   - Ouvrir Console Browser (F12)
   - Naviguer vers n'importe quelle page
   - Vérifier: **Aucune** erreur "Mixed Content"
   - Toutes les requêtes doivent être en `https://`

---

### 2. ❌ Image Blocked (OpaqueResponseBlocking)

**Erreur:**
```
A resource is blocked by OpaqueResponseBlocking, please check browser console for details.
company_8_ecdb03b7445c4de28bee4745cab59bf6.jpeg

GET https://intowork-dashboard-production-1ede.up.railway.app/uploads/company_logos/...
NS_BINDING_ABORTED
```

**Cause:**
- Headers CORS manquants sur les fichiers statiques (uploads)
- Le navigateur bloque les images cross-origin sans les bons headers

**Solution Appliquée:**

✅ **Backend modifié** (`backend/app/main.py`):
- Créé `CORSStaticFiles` custom class
- Override `get_response()` pour ajouter headers CORS
- Headers ajoutés:
  ```python
  "Access-Control-Allow-Origin": "*"
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS"
  "Access-Control-Allow-Headers": "*"
  "Cross-Origin-Resource-Policy": "cross-origin"
  "Cache-Control": "public, max-age=31536000"
  ```

**Commit & Deploy:**
```bash
git add backend/app/main.py
git commit -m "🔧 Fix image CORS - Add headers to StaticFiles for uploads"
git push origin main
# Railway redeploie automatiquement
```

**Vérifier après redeploy Railway:**
1. Aller sur Dashboard Company (`/dashboard/company`)
2. Ouvrir Console Browser (F12) → Network
3. Actualiser page
4. Chercher la requête de l'image (`.jpeg` ou `.png`)
5. Vérifier Response Headers:
   ```
   ✅ access-control-allow-origin: *
   ✅ cross-origin-resource-policy: cross-origin
   ```
6. L'image doit s'afficher correctement

---

### 3. ⚠️ CORS 500 Error (Encore présent)

**Erreur:**
```
XHR GET https://intowork-dashboard-production-1ede.up.railway.app/api/integrations/status
CORS Missing Allow Origin
Code d'état: 500
```

**Cause:**
- Railway n'a pas encore redéployé avec les fixes de `company_id` NULL checks
- Commits 891308f et 82a095e déjà pushés mais pas déployés

**Solution:**
- **Attendre le redeploy Railway** (déclenché par push précédent)
- Railway déploie automatiquement après chaque `git push origin main`
- Durée: ~5 minutes

**Vérifier déploiement Railway:**
1. Aller sur Railway Dashboard
2. Projet → Backend Service
3. Deployments → Latest
4. Status: "Success" (vert)
5. Logs: `INFO:     Uvicorn running on http://0.0.0.0:8001`

**Tester après déploiement:**
- Aller sur `/dashboard/integrations`
- Console (F12) → Aucune erreur CORS
- 3 cartes d'intégration affichées (LinkedIn, Google, Outlook)

---

## Plan d'Action Complet

### Étape 1: Fix Mixed Content (Vercel Env Var) 🔥 **URGENT**

```bash
# 1. Aller sur Vercel Dashboard
# 2. Settings → Environment Variables
# 3. Trouver NEXT_PUBLIC_API_URL
# 4. Changer http:// → https://
# 5. Save (redeploy automatique ~3 minutes)
```

### Étape 2: Fix Image CORS (Backend) ✅ **FAIT**

```bash
# Déjà modifié dans main.py
# Push vers GitHub et Railway

cd /home/anna/Documents/IntoWork
git add backend/app/main.py
git commit -m "🔧 Fix image CORS - Custom CORSStaticFiles class"
git push origin main

# Attendre Railway redeploy (~5 min)
```

### Étape 3: Attendre CORS 500 Fix ⏳ **EN COURS**

```bash
# Railway redéploie automatiquement avec les fixes NULL checks
# Pas d'action nécessaire, juste attendre
# Vérifier: Railway Dashboard → Deployments
```

### Étape 4: Tests de Vérification 🧪

**Après tous les redeploys:**

1. **Test Mixed Content:**
   ```bash
   # Ouvrir Console (F12)
   # Naviguer dashboard
   # Vérifier: Aucune requête HTTP (toutes HTTPS)
   ```

2. **Test Image Loading:**
   ```bash
   # Aller sur /dashboard/company
   # Vérifier: Logo s'affiche correctement
   # Console: Aucune erreur OpaqueResponseBlocking
   ```

3. **Test Integrations:**
   ```bash
   # Aller sur /dashboard/integrations
   # Vérifier: 3 cartes affichées sans erreur 500
   # Console: Aucune erreur CORS
   ```

4. **Test Notifications:**
   ```bash
   # Ouvrir NotificationPanel (cloche en haut)
   # Vérifier: Liste charge sans erreur
   # Console: Requête /api/notifications en HTTPS
   ```

---

## Résumé des Commits

| Commit | Fichier | Description |
|--------|---------|-------------|
| `891308f` | `backend/app/api/integrations.py` | ✅ Add company_id NULL checks (7 endpoints) |
| `82a095e` | `backend/app/api/integrations.py` | ✅ Add proper error messages for missing company |
| `4502124` | `railway.toml` | ✅ Add Railway Volume for /app/uploads persistence |
| `312509d` | Empty commit | ✅ Force Railway redeploy |
| `8394b5e` | `frontend/email-templates/page.tsx` | ✅ Refactor with JWT auth + getApiUrl() |
| **À PUSH** | `backend/app/main.py` | 🔧 Fix image CORS with CORSStaticFiles |

---

## Problèmes Résolus vs En Cours

### ✅ Résolu (Code déployé, attendre redeploy)

1. ✅ **CORS 500 sur /integrations** - Fixes pushés, attendre Railway
2. ✅ **Image persistence** - Railway Volume configuré
3. ✅ **Email templates Mixed Content** - getApiUrl() appliqué
4. ✅ **Email templates auth** - JWT Bearer implémenté
5. 🔧 **Image CORS headers** - Code modifié, à pusher

### ⏳ En Attente (Action utilisateur requise)

1. ⚠️ **Mixed Content notifications** - **VERCEL ENV VAR** (http → https)
2. ⏳ **Railway redeploy** - Automatique, ~5 minutes
3. ⏳ **Vercel redeploy** - Après changement env var, ~3 minutes

---

## Notes Importantes

### Mixed Content (HTTP/HTTPS)

**Pourquoi c'est bloqué?**
- Site en HTTPS (www.intowork.co)
- Requêtes API en HTTP (http://intowork-dashboard...)
- Navigateurs modernes **bloquent** HTTP sur sites HTTPS (sécurité)

**Comment `getApiUrl()` aide?**
```typescript
// Auto-correction en production
if (window.location.protocol === 'https:' && apiUrl.startsWith('http://')) {
  apiUrl = apiUrl.replace('http://', 'https://');
}
```

**Mais ça ne suffit pas si:**
- Variable Vercel configurée en HTTP
- `process.env.NEXT_PUBLIC_API_URL` est évalué côté serveur où `window` n'existe pas
- **Solution**: Configurer HTTPS directement dans Vercel

### OpaqueResponseBlocking

**C'est quoi?**
- Mécanisme de sécurité du navigateur
- Bloque les ressources cross-origin sans CORS
- Appliqué aux images, fonts, scripts

**Solution:**
- Servir les uploads avec headers CORS:
  - `Access-Control-Allow-Origin: *`
  - `Cross-Origin-Resource-Policy: cross-origin`

**Pourquoi override `StaticFiles`?**
- Middleware appliqué **après** `StaticFiles` → trop tard
- Override `get_response()` → headers ajoutés **pendant** la réponse
- Plus propre et plus efficace

---

## Prochaines Étapes

1. **MAINTENANT:** Fix Mixed Content (Vercel env var http → https)
2. **Puis:** Push backend image CORS fix
3. **Attendre:** Railway + Vercel redeploys (~8 minutes total)
4. **Tester:** Tous les points de vérification ci-dessus
5. **Documenter:** Mettre à jour PRODUCTION_ISSUES_FIX.md

---

## Questions Fréquentes

**Q: Pourquoi l'image ne s'affiche toujours pas après upload?**
- Railway n'a pas encore redéployé avec Volume config
- Attendre ~5 minutes, puis réessayer upload

**Q: Pourquoi /notifications ne charge pas?**
- Mixed Content: API URL en HTTP dans Vercel
- Fix: Changer env var à HTTPS, redeploy Vercel

**Q: Combien de temps pour que tout fonctionne?**
- Fix Vercel env: ~3 min (redeploy frontend)
- Fix Railway backend: ~5 min (redeploy backend)
- **Total: ~10 minutes maximum**

