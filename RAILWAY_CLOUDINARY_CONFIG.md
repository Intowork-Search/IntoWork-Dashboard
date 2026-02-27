# 🚂 Configuration Railway - Variables Cloudinary

## 📋 Variables à ajouter

Voici les 3 variables d'environnement à configurer dans Railway Dashboard :

```bash
CLOUDINARY_CLOUD_NAME=drewx7cwa
CLOUDINARY_API_KEY=145128839235456
CLOUDINARY_API_SECRET=bS-4SK738X9z8J3TApGdTzu1poE
```

---

## 🎯 Procédure (2 minutes)

### Étape 1 : Accès Railway Dashboard

1. Aller sur : **https://railway.app/dashboard**
2. Se connecter (GitHub ou email)
3. Sélectionner le projet : **IntoWork Backend**

---

### Étape 2 : Ajouter les Variables

1. **Cliquer** sur le service **backend** (carte du backend)

2. **Onglet "Variables"** dans le menu latéral gauche

3. **Cliquer** sur le bouton **"+ New Variable"** (en haut à droite)

4. **Ajouter la première variable** :
   - Variable Name: `CLOUDINARY_CLOUD_NAME`
   - Variable Value: `drewx7cwa`
   - Cliquer **"Add"**

5. **Répéter pour les 2 autres variables** :
   
   Variable 2 :
   - Variable Name: `CLOUDINARY_API_KEY`
   - Variable Value: `145128839235456`
   - Cliquer **"Add"**
   
   Variable 3 :
   - Variable Name: `CLOUDINARY_API_SECRET`
   - Variable Value: `bS-4SK738X9z8J3TApGdTzu1poE`
   - Cliquer **"Add"**

6. **⚠️ IMPORTANT** : Vérifier que les 3 variables apparaissent bien dans la liste

---

### Étape 3 : Redéploiement Automatique

Railway va automatiquement redéployer le backend (~5 minutes) dès que les variables sont ajoutées.

**Vérification** :
- Onglet **"Deployments"** (menu latéral)
- Le dernier déploiement devrait afficher : **"Building..."** → **"Deploying..."** → **"Success"**
- Attendre que le statut passe à **"Success"** (vert) avant de tester

---

## ✅ Validation

Une fois le redéploiement terminé, vérifier :

### 1. Logs Railway (Optionnel)

```
Railway Dashboard → Latest Deployment → Logs
Chercher : "Cloudinary configured successfully"
```

### 2. Test Upload Production

1. Aller sur : **https://www.intowork.co/dashboard/company**
2. Se connecter avec compte employeur
3. **Upload un nouveau logo** (PNG/JPG, < 5MB)
4. Vérifier :
   - ✅ Upload réussit sans erreur
   - ✅ Logo s'affiche immédiatement
   - ✅ Ouvrir F12 Console → Network → Chercher URL image
   - ✅ URL doit commencer par : `https://res.cloudinary.com/drewx7cwa/...`

### 3. Test Persistance

1. **Rafraîchir la page** (F5) → Logo reste visible ✅
2. **(Optionnel)** Trigger redeploy Railway → Logo RESTE visible ✅

---

## 🔍 Troubleshooting

### Erreur : "Cloudinary not configured"

**Cause** : Variables manquantes ou mal orthographiées

**Solution** :
1. Railway Dashboard → Variables
2. Vérifier exactement les noms :
   - `CLOUDINARY_CLOUD_NAME` (pas cloud-name ou CLOUD_NAME)
   - `CLOUDINARY_API_KEY` (pas api-key ou API-KEY)
   - `CLOUDINARY_API_SECRET` (pas api-secret ou SECRET)
3. Si erreur de nom : Supprimer + recréer avec bon nom

---

### Erreur : "Invalid API credentials"

**Cause** : Valeur incorrecte copiée

**Solution** :
1. Aller sur : https://cloudinary.com/console
2. Re-copier les credentials exacts
3. Railway Dashboard → Variables → Modifier chaque variable
4. Coller nouvelles valeurs (attention espaces)

---

### Déploiement bloqué à "Building..."

**Cause** : Erreur dans le code ou migration

**Solution** :
```bash
Railway Dashboard → Deployments → Latest → View Logs
Chercher erreur exacte dans les logs
```

---

### Image ne s'affiche pas après upload

**Cause possible 1** : CORS

**Solution** :
```bash
# Vérifier backend/app/main.py contient :
allow_origins=["https://www.intowork.co", ...]
```

**Cause possible 2** : Mixed Content (HTTP/HTTPS)

**Solution** :
```bash
# Vérifier URL image dans F12 Network
# Doit être: https://res.cloudinary.com/...
# Si http:// → Problème config Cloudinary (secure=True manquant)
```

---

## 📊 Métriques Cloudinary

Après upload réussi, vérifier dashboard Cloudinary :

**https://cloudinary.com/console/media_library**

- Dossier : `company_logos/company_ID/...`
- Résolution : 500x500px
- Format : WebP (si navigateur le supporte) ou original
- Taille : Optimisée automatiquement

---

## 🎉 Étapes Suivantes

Une fois la configuration Railway validée :

1. ✅ Images persistentes après redeploy
2. ✅ CDN mondial pour performances
3. ✅ Optimisation automatique (WebP, compression)

**Futures optimisations** :
- Migrer les CVs vers Cloudinary (déjà préparé dans `CloudinaryService.upload_cv()`)
- Ajouter transformations avancées (thumbnails, crops)
- Implémenter backup automatique

---

## 📌 Résumé Configuration

```env
# Railway Dashboard → Backend Service → Variables

CLOUDINARY_CLOUD_NAME=drewx7cwa
CLOUDINARY_API_KEY=145128839235456
CLOUDINARY_API_SECRET=bS-4SK738X9z8J3TApGdTzu1poE
```

**Temps total** : ~2 min configuration + ~5 min redeploy = **~7 minutes**

---

**🚀 Une fois les variables ajoutées, Railway s'occupe du reste automatiquement !**
