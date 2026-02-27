# ⚠️ GUIDE CRITIQUE - Fix Mixed Content Vercel

## 🔴 Problème Actuel

Les requêtes partent **TOUJOURS en HTTP** malgré tous les fix:
```
❌ http://intowork-dashboard-production-1ede.up.railway.app/api/email-templates/
❌ http://intowork-dashboard-production-1ede.up.railway.app/api/notifications/...
```

**Cause**: La variable `NEXT_PUBLIC_API_URL` sur Vercel contient `http://` au lieu de `https://`.

## ✅ Solution en 5 Minutes (OBLIGATOIRE)

### 📍 Étape 1: Vérifier la Variable Vercel (2 min)

**IMPORTANT**: On doit VOIR la variable actuelle sur Vercel, pas supposer qu'elle est correcte.

1. **Aller sur Vercel Dashboard**:
   ```
   https://vercel.com/dashboard
   ```

2. **Sélectionner le projet IntoWork**:
   - Cliquer sur le projet dans la liste

3. **Aller dans Settings**:
   - Barre latérale gauche → **Settings**

4. **Ouvrir Environment Variables**:
   - Menu du haut → **Environment Variables**

5. **Chercher NEXT_PUBLIC_API_URL**:
   - Scroller ou Ctrl+F pour trouver `NEXT_PUBLIC_API_URL`

6. **VÉRIFIER LA VALEUR**:

   **❌ SI vous voyez**:
   ```
   http://intowork-dashboard-production-1ede.up.railway.app/api
   ```
   (sans 's' dans http)

   **→ MODIFIER EN**:
   ```
   https://intowork-dashboard-production-1ede.up.railway.app/api
   ```
   (avec 's' dans https)

   **✅ SI vous voyez déjà**:
   ```
   https://intowork-dashboard-production-1ede.up.railway.app/api
   ```
   (avec 's') → Passer à l'Étape 2

7. **Modifier la variable** (si nécessaire):
   - Cliquer sur les **...** (trois points) à droite de la variable
   - Cliquer **Edit**
   - Remplacer `http://` par `https://`
   - **COCHER** toutes les cases:
     - ✅ Production
     - ✅ Preview  
     - ✅ Development
   - Cliquer **Save**

### 🗑️ Étape 2: Vider le Cache Build (1 min)

**CRITIQUE**: Même si la variable est correcte, le cache peut contenir l'ancien build avec `http://`.

1. **Rester dans Settings** (même page)

2. **Aller dans General**:
   - Menu du haut → **General**

3. **Scroller jusqu'à "Build & Development Settings"**

4. **Trouver "Clear Build Cache"**:
   - Section avec bouton rouge ou bouton "Clear"

5. **Cliquer "Clear"** et **Confirmer**

6. **Attendre le message de confirmation**:
   - "Build cache cleared successfully" ✅

### 🔄 Étape 3: Redéployer (automatique)

**Vercel redéploie automatiquement** car j'ai pushé le commit 840bc70.

1. **Aller dans Deployments**:
   - Barre latérale gauche → **Deployments**

2. **Vérifier le déploiement en cours**:
   - Devrait voir "Building..." pour le commit 840bc70
   - Message: "🔥 CRITICAL: Force rebuild Vercel - Fix Mixed Content définitif"

3. **Attendre "Success"** (vert):
   - ~2-3 minutes

4. **Vérifier l'heure**:
   - Le déploiement doit être APRÈS le cache cleared
   - Si déploiement AVANT → Re-trigger un nouveau déploiement:
     - Cliquer sur le déploiement → **...** → **Redeploy**

### ✅ Étape 4: Tester la Correction (1 min)

1. **Vider le cache navigateur**:
   ```
   Ctrl + Shift + R (Firefox/Chrome)
   ```

2. **Ouvrir Console F12**:
   ```
   F12 → Console tab
   ```

3. **Aller sur email-templates**:
   ```
   https://www.intowork.co/dashboard/email-templates
   ```

4. **Vérifier les requêtes**:

   **✅ ATTENDU** (correct):
   ```
   XHR GET https://intowork-dashboard-production-1ede.up.railway.app/api/email-templates
   [HTTP/2 200 OK]
   ✅ Templates loaded: X templates
   ```

   **❌ SI ENCORE**:
   ```
   XHR GET http://... (sans 's')
   Mixed Content blocked
   ```
   → Passer à l'Étape 5 (Debug avancé)

### 🚨 Étape 5: Debug Avancé (si ça ne marche TOUJOURS pas)

Si après TOUTES les étapes ci-dessus, le problème persiste:

#### Option A: Vérifier la variable en runtime

1. **Ouvrir Console F12** sur www.intowork.co

2. **Taper cette commande**:
   ```javascript
   console.log('API URL:', process.env.NEXT_PUBLIC_API_URL)
   ```

3. **Regarder la valeur**:
   - Si `http://` → La variable Vercel n'est PAS chargée correctement
   - Si `https://` → Le problème est ailleurs

#### Option B: Hardcode temporaire

Si vraiment rien ne fonctionne, on peut hardcoder temporairement:

1. **Modifier `getApiUrl.ts`** (dans le code):
   ```typescript
   export const getApiUrl = (): string => {
     // TEMPORARY HARDCODE FIX
     if (process.env.NODE_ENV === 'production') {
       return 'https://intowork-dashboard-production-1ede.up.railway.app/api';
     }
     
     // Development: use .env.local
     return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api';
   };
   ```

2. **Commit et push**

3. **Attendre déploiement Vercel**

## 📋 Checklist Finale

- [ ] Variable Vercel `NEXT_PUBLIC_API_URL` = `https://...`
- [ ] Variable appliquée à **Production** ✓ **Preview** ✓ **Development** ✓
- [ ] Cache Build Vercel vidé (Clear Build Cache)
- [ ] Déploiement 840bc70 terminé avec succès
- [ ] Déploiement fait APRÈS le cache cleared
- [ ] Cache navigateur vidé (Ctrl+Shift+R)
- [ ] Console F12 → Aucune erreur "Mixed Content"
- [ ] Network F12 → Toutes les requêtes en `https://`
- [ ] Templates se chargent (✅ Templates loaded: X templates)

## 🎯 Pourquoi C'est Critique?

Les variables `NEXT_PUBLIC_*` sont **compilées dans le JavaScript** au build time:

```javascript
// Code source
let apiUrl = process.env.NEXT_PUBLIC_API_URL;

// Code compilé (bundle.js)
let apiUrl = "http://intowork-dashboard-production-1ede.up.railway.app/api"; // ← hardcodé!
```

**Donc**:
1. Si Vercel a `http://` → Le bundle contient `http://`
2. Changer la variable APRÈS le build → Ne change PAS le bundle
3. Il faut VIDER LE CACHE + REBUILD pour que Next.js recompile avec `https://`

## 📸 Captures Attendues

### Variable Vercel (Settings → Environment Variables)
```
NEXT_PUBLIC_API_URL
Production: https://intowork-dashboard-production-1ede.up.railway.app/api ✓
Preview:    https://intowork-dashboard-production-1ede.up.railway.app/api ✓
Development: https://intowork-dashboard-production-1ede.up.railway.app/api ✓
```

### Console F12 (après fix)
```
🔍 Fetching templates from: https://intowork-dashboard-production-1ede.up.railway.app/api/email-templates
📡 Response status: 200 OK
✅ Templates loaded: 5 templates
```

### Network F12 (après fix)
```
✅ XHR GET https://intowork-dashboard-production-1ede.up.railway.app/api/email-templates [HTTP/2 200]
✅ XHR GET https://intowork-dashboard-production-1ede.up.railway.app/api/notifications [HTTP/2 200]
```

---

**Commits associés**:
- 4f28d82: Fix getApiUrl pour SSR
- 840bc70: Force rebuild Vercel

**Temps total**: 5 minutes
**Priorité**: 🔴 CRITIQUE - Bloque toutes les fonctionnalités
