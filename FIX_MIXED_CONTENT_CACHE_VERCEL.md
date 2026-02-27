# Fix Mixed Content - Problème de Cache Build Vercel

## 🔴 Problème
Les requêtes partent toujours en `http://` malgré la variable `NEXT_PUBLIC_API_URL` correcte sur Vercel.

**Cause**: Variables `NEXT_PUBLIC_*` sont **compilées dans le JavaScript** au moment du build. Si un ancien build a été fait quand la variable était `http://`, le code JavaScript contient toujours cette ancienne valeur même si vous changez la variable sur Vercel après.

## ✅ Solution en 3 Étapes

### 📍 Étape 1: Vérifier la variable Vercel (1 min)

1. Aller sur: https://vercel.com/dashboard
2. Sélectionner le projet **IntoWork**
3. **Settings** → **Environment Variables**
4. Chercher `NEXT_PUBLIC_API_URL`
5. Vérifier:
   - ✅ Valeur doit être: `https://intowork-dashboard-production-1ede.up.railway.app/api` (avec `https://`)
   - ✅ Appliquée à: **Production** ✓ **Preview** ✓ **Development** ✓

**Si la valeur est `http://`** (sans 's'):
- Cliquer **Edit**
- Remplacer par: `https://intowork-dashboard-production-1ede.up.railway.app/api`
- Sauvegarder

### 🗑️ Étape 2: Vider le Cache de Build Vercel (30 sec)

**IMPORTANT**: Même avec la variable correcte, Vercel réutilise l'ancien build caché.

1. Rester dans **Settings** → **General**
2. Descendre jusqu'à **Build & Development Settings**
3. Trouver **Clear Build Cache**
4. Cliquer **Clear**
5. Confirmer dans la popup

### 🔄 Étape 3: Forcer un Nouveau Déploiement (déjà fait!)

✅ **Commit empty créé et pushé**:
```
Commit: 1cf1450
Message: "fix: Force rebuild - clear NEXT_PUBLIC_API_URL cache from build"
```

**Vercel va automatiquement redéployer** (~2 minutes).

### 🕐 Étape 4: Attendre le Déploiement (2 min)

1. Aller dans **Deployments**
2. Voir le nouveau déploiement "Building..." → "Success"
3. Vérifier que le build utilise bien le cache vidé

### ✅ Étape 5: Vérifier la Correction (1 min)

1. **Vider le cache navigateur**:
   - Chrome/Firefox: `Ctrl + Shift + R` (hard refresh)
   - Ou F12 → Application/Stockage → Tout vider

2. Aller sur: https://www.intowork.co

3. Ouvrir **F12 Console**

4. Naviguer vers: `/dashboard/email-templates`

5. Vérifier **Network tab** (F12 → Network):
   - ✅ Toutes les requêtes: `https://intowork-dashboard-production-1ede.up.railway.app/api/...`
   - ❌ AUCUNE requête: `http://...` (sans 's')
   - ✅ Aucun message "Mixed Content"
   - ✅ Notifications se chargent

### 🎯 Résultat Attendu

**Avant** (cache ancien):
```
❌ XHR GET http://intowork-dashboard-production-1ede.up.railway.app/api/notifications
   Mixed Block
❌ Blocage du chargement du contenu mixte actif
```

**Après** (cache vidé + nouveau build):
```
✅ XHR GET https://intowork-dashboard-production-1ede.up.railway.app/api/notifications
   [HTTP/2 200 OK]
✅ Access-Control-Allow-Origin: https://www.intowork.co
✅ Notifications: 10 items loaded
✅ Email templates: 5 items loaded
```

## 🧠 Explication Technique

### Pourquoi le cache cause ce problème?

Next.js remplace les variables `NEXT_PUBLIC_*` **au build time** (pas au runtime):

```javascript
// Code source (getApiUrl.ts)
let apiUrl = process.env.NEXT_PUBLIC_API_URL;

// Code compilé (bundle JavaScript sur Vercel)
let apiUrl = "http://intowork-dashboard-production-1ede.up.railway.app/api";
```

**Donc**:
- Si vous changez la variable Vercel APRÈS le build → Le bundle contient toujours l'ancienne valeur
- Vider le cache + rebuild force Next.js à recompiler avec la nouvelle valeur

### Pourquoi Clear Build Cache?

Vercel optimise les builds en cachant:
- node_modules
- .next/cache
- Variables d'environnement utilisées au dernier build

Sans vider le cache, Vercel pourrait réutiliser l'ancien bundle même avec un nouveau commit.

## 📋 Checklist Finale

- [ ] Variable Vercel `NEXT_PUBLIC_API_URL` = `https://...` (vérifié)
- [ ] Variable appliquée à **Production** + **Preview** + **Development**
- [ ] Build Cache Vercel vidé (Clear Build Cache)
- [ ] Commit empty pushé (1cf1450) - ✅ Fait
- [ ] Déploiement Vercel terminé avec succès
- [ ] Cache navigateur vidé (Ctrl+Shift+R)
- [ ] Test Console F12 → Aucune erreur "Mixed Content"
- [ ] Test Network F12 → Toutes les requêtes en `https://`
- [ ] Notifications chargent correctement
- [ ] Email templates chargent correctement

## 🚨 Si Ça Ne Fonctionne Toujours Pas

### Option A: Vérifier que le nouveau build utilise HTTPS

1. Ajouter temporairement dans `getApiUrl.ts`:
   ```typescript
   export const getApiUrl = (): string => {
     let apiUrl = process.env.NEXT_PUBLIC_API_URL;
     console.log('🔍 API URL au build:', apiUrl);  // ← Ajouter cette ligne
     // ... reste du code
   }
   ```

2. Commit et push

3. Vérifier Console F12 production → Doit afficher: `🔍 API URL au build: https://...`

### Option B: Recréer le projet Vercel

Si vraiment rien ne fonctionne:
1. Supprimer le projet Vercel
2. Recréer un nouveau projet
3. Configurer `NEXT_PUBLIC_API_URL` avec `https://` DÈS LE DÉBUT
4. Déployer

### Option C: Utiliser .env.production dans le repo

Au lieu de variables Vercel, utiliser le fichier `.env.production` (déjà committé):

```bash
# frontend/.env.production (déjà correct)
NEXT_PUBLIC_API_URL=https://intowork-dashboard-production-1ede.up.railway.app/api
```

Vercel lira automatiquement ce fichier pendant le build.

---

**Créé**: 2026-02-26  
**Commit associé**: 1cf1450 (force rebuild)  
**Temps estimé**: 5 minutes total  
**Impact**: ✅ Fix définitif Mixed Content errors
