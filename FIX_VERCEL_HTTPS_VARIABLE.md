# Fix HTTPS dans NEXT_PUBLIC_API_URL (Vercel)

## 🔴 Problème
Les requêtes API partent en `http://` au lieu de `https://`, causant des erreurs "Mixed Content".

**Cause**: La variable `NEXT_PUBLIC_API_URL` sur Vercel contient probablement `http://` au lieu de `https://`.

**Impact**: 
- ❌ Notifications bloquées (Mixed Content)
- ❌ Email templates bloquées (Mixed Content)
- ❌ CORS errors

## ✅ Solution Définitive

### Étape 1: Vérifier la variable actuelle sur Vercel

1. Aller sur: https://vercel.com/dashboard
2. Sélectionner le projet **IntoWork** (ou nom du projet frontend)
3. Aller dans **Settings** → **Environment Variables**
4. Chercher `NEXT_PUBLIC_API_URL`
5. Vérifier la valeur actuelle

### Étape 2: Corriger la valeur

**❌ Valeur INCORRECTE** (avec `http://`):
```
http://intowork-dashboard-production-1ede.up.railway.app/api
```

**✅ Valeur CORRECTE** (avec `https://`):
```
https://intowork-dashboard-production-1ede.up.railway.app/api
```

### Étape 3: Mettre à jour la variable

1. Cliquer sur les `...` (trois points) à droite de `NEXT_PUBLIC_API_URL`
2. Cliquer **Edit**
3. Remplacer par: `https://intowork-dashboard-production-1ede.up.railway.app/api`
4. Sélectionner tous les environnements: **Production**, **Preview**, **Development**
5. Cliquer **Save**

### Étape 4: Re-déployer

**Option A - Redéploiement manuel**:
1. Aller dans **Deployments**
2. Cliquer sur le dernier déploiement
3. Cliquer **...** → **Redeploy**

**Option B - Nouveau commit (force rebuild)**:
```bash
cd /home/anna/Documents/IntoWork/frontend
git commit --allow-empty -m "fix: Force rebuild avec NEXT_PUBLIC_API_URL HTTPS"
git push
```

**⏱️ Temps de déploiement**: ~2 minutes

### Étape 5: Vérifier la correction

1. Attendre fin du déploiement Vercel
2. Aller sur: https://www.intowork.co
3. Ouvrir F12 Console
4. Naviguer vers: `/dashboard/email-templates`
5. Vérifier Network tab (F12 → Network):
   - ✅ Toutes les requêtes doivent être en `https://`
   - ✅ Aucun message "Mixed Content"
   - ✅ Notifications se chargent (pas bloquées)

## 🔧 Pourquoi le code auto-correction ne suffit pas?

Le code dans `getApiUrl.ts` corrige `http://` → `https://` seulement **côté client**:

```typescript
// ✅ Fonctionne côté client (window existe)
if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
  if (apiUrl.startsWith('http://')) {
    apiUrl = apiUrl.replace('http://', 'https://');
  }
}
```

**Problème**: Next.js App Router fait du Server-Side Rendering (SSR). Côté serveur:
- ❌ `window` n'existe pas
- ❌ La correction ne s'applique pas
- ❌ Les requêtes partent en `http://`

**Solution**: Variable d'environnement avec `https://` directement → Pas besoin de correction.

## 📋 Checklist Finale

- [ ] Variable Vercel `NEXT_PUBLIC_API_URL` = `https://...` (pas `http://`)
- [ ] Variable appliquée à **tous les environnements** (Production, Preview, Development)
- [ ] Redéploiement Vercel déclenché (manuel ou via git push)
- [ ] Déploiement terminé avec succès (status ✅)
- [ ] Test Console F12 → Aucune erreur "Mixed Content"
- [ ] Test notifications → Chargent correctement
- [ ] Test email-templates → Aucune erreur CORS

## 🎯 Résultat Attendu

**Avant**:
```
❌ XHR GET http://intowork-dashboard-production-1ede.up.railway.app/api/notifications
   Mixed Block
❌ Blocage du chargement du contenu mixte actif (mixed active content)
```

**Après**:
```
✅ XHR GET https://intowork-dashboard-production-1ede.up.railway.app/api/notifications
   [HTTP/2 200 OK]
✅ Access-Control-Allow-Origin: https://www.intowork.co
✅ Notifications loaded successfully
```

## 🚨 Si ça ne fonctionne toujours pas

1. **Vider le cache Vercel**:
   - Settings → General → "Clear Build Cache"
   - Redéployer

2. **Vérifier la variable en production**:
   - Ajouter `console.log('API URL:', process.env.NEXT_PUBLIC_API_URL)` temporairement
   - Déployer
   - Vérifier Console F12 côté production

3. **Vérifier Railway**:
   - S'assurer que Railway backend accepte HTTPS (pas seulement HTTP)
   - Vérifier ALLOWED_ORIGINS dans Railway env vars

---

**Créé**: 2026-02-26  
**Contexte**: Fix Mixed Content errors après migration getApiUrl()  
**Commit associé**: 280b66f (job-alerts), 1f69eb2 (email-templates design)
