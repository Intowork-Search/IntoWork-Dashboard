# 🚨 ACTION URGENTE : Fixer Variable Vercel (HTTP → HTTPS)

## Date: 26 février 2026

---

## ⚠️ PROBLÈME

Les erreurs dans la console montrent que des requêtes API utilisent **HTTP** au lieu de **HTTPS** :

```
Blocage du chargement du contenu mixte actif (mixed active content)  
« http://intowork-dashboard-production-1ede.up.railway.app/api/notifications/... »
```

**Pourquoi c'est bloqué ?**
- Votre site = **HTTPS** (www.intowork.co)
- Requêtes API = **HTTP** (bloquées par le navigateur pour sécurité)

---

## ✅ SOLUTION (2 MINUTES)

### Étape 1 : Aller sur Vercel Dashboard

1. Ouvrir **https://vercel.com/dashboard**
2. Cliquer sur le projet **`intowork-dashboard`** (ou le nom de votre projet frontend)

### Étape 2 : Accéder aux Variables d'Environnement

1. Dans le menu du projet, cliquer sur **Settings** (⚙️)
2. Dans le menu latéral gauche, cliquer sur **Environment Variables**

### Étape 3 : Trouver et Modifier `NEXT_PUBLIC_API_URL`

**Rechercher la variable** :
- Nom : `NEXT_PUBLIC_API_URL`
- Valeur actuelle (❌ INCORRECTE) : `http://intowork-dashboard-production-1ede.up.railway.app/api`

**Modifier la variable** :

1. Cliquer sur les **3 points (•••)** à droite de la variable
2. Choisir **Edit**
3. **Remplacer** la valeur par :
   ```
   https://intowork-dashboard-production-1ede.up.railway.app/api
   ```
   ⚠️ **Attention au "s" dans `https://`**

4. **Environnements à modifier** :
   - ✅ **Production**
   - ✅ **Preview** (optionnel)
   - ❌ **Development** (laisser `http://localhost:8001/api`)

5. Cliquer sur **Save**

### Étape 4 : Redéployer (IMPORTANT)

**Option A : Redeploy automatique**
- Vercel détecte le changement et redéploie automatiquement
- Attendre ~2-3 minutes

**Option B : Forcer le redeploy**
1. Aller sur **Deployments**
2. Cliquer sur le dernier déploiement
3. Cliquer sur **•••** (3 points) → **Redeploy**
4. Confirmer

---

## 🧪 VÉRIFICATION (Après Redeploy)

### Test 1 : Console Browser (F12)

1. Ouvrir www.intowork.co
2. Appuyer sur **F12** → Onglet **Console**
3. Actualiser la page (Ctrl+R ou F5)
4. **Résultat attendu** :
   - ✅ **Aucune** erreur "Mixed Content"
   - ✅ **Toutes** les requêtes commencent par `https://`
   - ✅ Aucune requête `http://`

### Test 2 : Network Tab

1. F12 → Onglet **Network** (Réseau)
2. Actualiser la page
3. Filtrer par **XHR**
4. Chercher requêtes vers `intowork-dashboard-production`
5. **Résultat attendu** :
   - ✅ Toutes en **HTTPS** :
     ```
     https://intowork-dashboard-production-1ede.up.railway.app/api/notifications?...
     https://intowork-dashboard-production-1ede.up.railway.app/api/companies/...
     ```

### Test 3 : Notifications Panel

1. Cliquer sur l'icône **cloche** (🔔) en haut à droite
2. **Résultat attendu** :
   - ✅ Panel s'ouvre
   - ✅ Notifications se chargent
   - ✅ Aucune erreur console

---

## 🔍 Si Ça Ne Marche Toujours Pas

### Vérifier Cache Vercel

**Le problème** : Vercel peut cacher l'ancienne variable

**Solution** :
1. Vider cache navigateur (Ctrl+Shift+Delete)
2. Ouvrir mode incognito (Ctrl+Shift+N)
3. Tester à nouveau

### Vérifier Variable Correcte

**Depuis Vercel Dashboard** :

1. Settings → Environment Variables
2. Vérifier que `NEXT_PUBLIC_API_URL` montre :
   ```
   ✅ https://intowork-dashboard-production-1ede.up.railway.app/api
   
   PAS :
   ❌ http://intowork-dashboard-production-1ede.up.railway.app/api
   ```

3. Vérifier **Production** est coché

### Forcer Hard Refresh

1. Sur www.intowork.co
2. Appuyer **Ctrl+Shift+R** (Windows/Linux) ou **Cmd+Shift+R** (Mac)
3. Ça force le rechargement complet sans cache

---

## 📊 Checklist Complète

### Variable Vercel
- [ ] Connexion à Vercel Dashboard
- [ ] Projet `intowork-dashboard` ouvert
- [ ] Settings → Environment Variables
- [ ] Variable `NEXT_PUBLIC_API_URL` trouvée
- [ ] Changé de `http://` à `https://`
- [ ] Save cliqué
- [ ] Redeploy confirmé (auto ou manuel)
- [ ] Attendu 3 minutes

### Tests Post-Déploiement
- [ ] Site ouvert en incognito
- [ ] F12 Console ouverte
- [ ] Page actualisée (Ctrl+Shift+R)
- [ ] Aucune erreur "Mixed Content"
- [ ] Toutes requêtes en HTTPS
- [ ] Notifications chargent correctement
- [ ] Images company logo s'affichent

---

## 🎯 En Résumé

**Le problème** : Variable Vercel configurée avec `http://` au lieu de `https://`

**La solution** (2 minutes) :
1. Vercel Dashboard → Projet → Settings → Environment Variables
2. Éditer `NEXT_PUBLIC_API_URL`
3. Changer `http://` → `https://`
4. Save → Attendre 3 min
5. Tester en incognito

**Après ce fix :**
- ✅ Mixed Content errors = DISPARUS
- ✅ Notifications = FONCTIONNENT
- ✅ API Calls = HTTPS seulement

---

## ❓ Questions Fréquentes

**Q : Pourquoi c'est pas détecté automatiquement ?**

R : La variable d'environnement `NEXT_PUBLIC_API_URL` est évaluée côté serveur au moment du build. Le code `getApiUrl()` peut auto-corriger HTTP → HTTPS côté client, mais si la variable serveur est HTTP, certaines requêtes SSR (Server-Side Rendering) vont utiliser HTTP.

**Q : Pourquoi ça marchait avant ?**

R : En développement local, HTTP est autorisé (localhost = exception). En production HTTPS, les navigateurs bloquent strictement HTTP (Mixed Content).

**Q : Est-ce que je dois changer autre chose ?**

R : Non, juste cette variable. Le reste est géré automatiquement par `getApiUrl()` dans le code.

**Q : Combien de temps ça prend ?**

R : 
- Modifier variable : 30 secondes
- Vercel redeploy : 2-3 minutes
- **Total : ~3 minutes maximum**

