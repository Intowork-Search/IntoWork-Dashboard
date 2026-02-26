# 🔥 FORCER LE REBUILD VERCEL - Vider le Cache Build

## Date: 26 février 2026

---

## 🎯 Problème

Même après avoir changé la variable `NEXT_PUBLIC_API_URL` de HTTP → HTTPS sur Vercel, les requêtes en console montrent toujours HTTP :

```
Blocage du chargement du contenu mixte actif  
« http://intowork-dashboard-production-1ede.up.railway.app/api/notifications/... »
```

**Pourquoi ?**
- Vercel **cache** le build précédent avec l'ancienne URL HTTP
- Les bundles JavaScript compilés contiennent encore l'ancienne valeur
- Changer juste la variable env ne suffit pas, il faut **rebuild complet**

---

## ✅ SOLUTION : Force Rebuild (2 MÉTHODES)

### Méthode 1 : Redeploy depuis Dashboard (2 minutes) ⭐ **RECOMMANDÉ**

1. **Aller sur Vercel Dashboard**
   - https://vercel.com/dashboard
   - Sélectionner projet `intowork-dashboard`

2. **Aller sur Deployments**
   - Menu latéral → **Deployments**

3. **Trouver le dernier déploiement**
   - Cliquer sur le premier deployment dans la liste
   - Status: "Ready" avec icône verte ✓

4. **Forcer le Redeploy**
   - En haut à droite, cliquer sur **•••** (3 points)
   - Sélectionner **"Redeploy"**
   - ⚠️ **IMPORTANT:** Cocher **"Use existing Build Cache"** = **NON** (décochée)
   - Cliquer sur **"Redeploy"**

5. **Attendre le Build (~3 minutes)**
   - Status passe de "Building" → "Ready"
   - Vérifier que les logs montrent bien la nouvelle variable:
     ```
     ✓ Environment variables
     NEXT_PUBLIC_API_URL: https://intowork-dashboard-production...
     ```

---

### Méthode 2 : Push Vide (Force Rebuild) - Alternative

Si vous avez accès au code local :

```bash
cd /home/anna/Documents/IntoWork/frontend

# Créer commit vide pour forcer rebuild
git commit --allow-empty -m "🔄 Force Vercel rebuild - Clear build cache"

# Push vers GitHub
git push origin main

# Vercel détecte le push et rebuild automatiquement
# Attendre ~3 minutes
```

---

## 🧪 VÉRIFICATION (Après Rebuild)

### Test 1 : Hard Refresh du Navigateur

**IMPORTANT:** Vider le cache navigateur aussi !

```bash
# Méthode 1: Hard Refresh
# Sur www.intowork.co
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)

# Méthode 2: Mode Incognito (Meilleur)
Ctrl + Shift + N (Chrome/Edge)
Cmd + Shift + N (Safari)
```

### Test 2 : Console Browser (F12)

1. Ouvrir **www.intowork.co** en mode incognito
2. Appuyer sur **F12** → Onglet **Console**
3. Actualiser page (Ctrl+Shift+R)

**✅ Résultat attendu:**
```
Aucune erreur "Mixed Content"
Aucune erreur "Blocage du chargement"
```

### Test 3 : Network Tab (Détaillé)

1. F12 → Onglet **Network** (Réseau)
2. Actualiser page
3. Filtrer par **XHR**
4. Chercher requêtes `/api/notifications`, `/api/email-templates`

**✅ Résultat attendu:**
```
✅ https://intowork-dashboard-production-1ede.up.railway.app/api/notifications?...
✅ https://intowork-dashboard-production-1ede.up.railway.app/api/email-templates

❌ PAS DE : http://... (sans 's')
```

### Test 4 : Bundles JavaScript

1. F12 → Network → Filtrer **JS**
2. Ouvrir un bundle (ex: `chunks/...js`)
3. Ctrl+F → Chercher `http://intowork-dashboard`
4. **Résultat attendu:** Aucune occurrence (ou seulement commentaires)

---

## 🔍 Vérifier Build Logs Vercel

1. **Dashboard → Deployments → Latest Deployment**

2. **Cliquer sur le deployment**

3. **Onglet "Building"**
   - Chercher section "Environment Variables"
   - Vérifier:
     ```
     ✓ NEXT_PUBLIC_API_URL = https://intowork-dashboard-production-1ede.up.railway.app/api
     ```

4. **Onglet "Functions"** (optionnel)
   - Vérifier que les routes sont bien générées

---

## ⚠️ Si Ça Ne Marche TOUJOURS Pas

### Option A : Vider Cache Vercel (Dashboard)

1. Settings → General
2. Descendre vers **"Build & Development Settings"**
3. Chercher **"Invalidate Cache"** ou similaire
4. Cliquer pour vider le cache
5. Redeploy ensuite

### Option B : Supprimer et Re-créer Environment Variable

1. Settings → Environment Variables
2. Trouver `NEXT_PUBLIC_API_URL`
3. **Supprimer** complètement (icône poubelle)
4. **Re-créer** avec la bonne valeur:
   ```
   Name: NEXT_PUBLIC_API_URL
   Value: https://intowork-dashboard-production-1ede.up.railway.app/api
   Environments: ✅ Production
   ```
5. Save → Redeploy

### Option C : Vérifier Browser Cache

Même avec rebuild Vercel correct, votre navigateur peut cacher les anciens JS bundles :

```bash
# Chrome/Edge
Ctrl + Shift + Delete
→ Cocher "Cached images and files"
→ Time range: "All time"
→ Clear data

# Firefox
Ctrl + Shift + Delete
→ Cocher "Cache"
→ Everything
→ Clear

# Safari
Cmd + Option + E (Clear Cache)
```

---

## 📊 Checklist Complète

### Vercel Dashboard
- [ ] Variable `NEXT_PUBLIC_API_URL` = `https://...` (avec 's')
- [ ] Environment = Production (coché)
- [ ] Variable sauvegardée (Save cliqué)

### Force Rebuild
- [ ] Deployments → Latest → ••• → Redeploy
- [ ] "Use existing Build Cache" = DÉCOCHÉ ⚠️
- [ ] Redeploy cliqué
- [ ] Attendu 3-5 minutes
- [ ] Status = "Ready" (vert)

### Build Logs Verification
- [ ] Build logs montrent HTTPS dans env vars
- [ ] No errors in build process
- [ ] Functions generated correctly

### Browser Testing
- [ ] Cache navigateur vidé (Ctrl+Shift+Delete)
- [ ] Test en mode incognito
- [ ] Hard refresh (Ctrl+Shift+R)
- [ ] F12 Console: Aucune erreur "Mixed Content"
- [ ] F12 Network: Toutes requêtes en HTTPS

### Functional Testing
- [ ] Notifications panel charge correctement
- [ ] Email templates page fonctionne
- [ ] Images company logo s'affichent
- [ ] Aucune erreur CORS dans console

---

## 🎯 Résumé Court (TL;DR)

**Le problème:** Vercel cache le build avec l'ancienne URL HTTP

**La solution rapide (2 min):**

1. Vercel Dashboard → Deployments
2. Latest → ••• → Redeploy
3. **DÉCOCHER** "Use existing Build Cache"
4. Cliquer Redeploy
5. Attendre 3 min
6. Tester en incognito avec Ctrl+Shift+R

**Vérification:**
```bash
# Ouvrir www.intowork.co en incognito
# F12 → Console
# Actualiser (Ctrl+Shift+R)
# ✅ Aucune erreur "Mixed Content"
```

---

## ❓ Questions Fréquentes

**Q: Pourquoi changer la variable ne suffit pas ?**

R: Next.js compile les variables d'environnement dans les bundles JavaScript au moment du build. Changer la variable après le build ne met pas à jour le code déjà compilé. Il faut rebuild.

**Q: Combien de temps pour le rebuild ?**

R: ~3-5 minutes pour un build Next.js complet sans cache.

**Q: Est-ce que ça va casser quelque chose ?**

R: Non, c'est juste un rebuild avec le même code et nouvelles variables. Site reste fonctionnel.

**Q: Dois-je redeploy à chaque fois que je change une variable ?**

R: Oui, pour les variables **NEXT_PUBLIC_*** (client-side). Les autres variables (server-only) sont appliquées immédiatement.

**Q: Pourquoi "Use existing Build Cache" doit être décoché ?**

R: Le cache contient les bundles compilés avec l'ancienne URL. Décocher force la recompilation complète.

