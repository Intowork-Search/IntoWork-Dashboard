# 🚀 Configuration Cloudinary - Guide Rapide

## ⏱️ Temps estimé : 10 minutes

---

## Étape 1 : Créer Compte Cloudinary (3 min)

1. **Ouvrir** : https://cloudinary.com/users/register/free

2. **S'inscrire** avec :
   - Email
   - Mot de passe
   - Nom de la company (ex: "INTOWORK")

3. **Vérifier email** et se connecter

✅ **Gratuit** : 25GB stockage + 25GB bandwidth

---

## Étape 2 : Récupérer Credentials (1 min)

Après connexion, vous arrivez sur le Dashboard :

```
===============================================
Product Environment Credentials
===============================================

Cloud name:    your-cloud-name
API Key:       123456789012345
API Secret:    abcdefGHIJ1234567890xyz
===============================================
```

**⚠️ IMPORTANT** : Copier ces 3 valeurs !

---

## Étape 3 : Ajouter Variables Railway (2 min)

1. **Aller sur** : Railway Dashboard
   - https://railway.app/dashboard

2. **Sélectionner** : Projet Backend

3. **Cliquer** : **Variables** (menu latéral)

4. **Ajouter 3 variables** (bouton "+ New Variable") :

   ```bash
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=123456789012345
   CLOUDINARY_API_SECRET=abcdefGHIJ1234567890xyz
   ```

   **⚠️ Remplacer** les valeurs par VOS credentials Cloudinary !

5. **Save** → Railway redéploie automatiquement (~5 min)

---

## Étape 4 : Test Local (Optionnel - 5 min)

Avant de déployer, tester en local :

```bash
cd /home/anna/Documents/IntoWork/backend

# Ajouter variables dans .env
echo "CLOUDINARY_CLOUD_NAME=your-cloud-name" >> .env
echo "CLOUDINARY_API_KEY=123456789012345" >> .env
echo "CLOUDINARY_API_SECRET=abcdefGHIJ1234567890xyz" >> .env

# Démarrer backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8001

# Dans autre terminal : Frontend
cd ../frontend
npm run dev

# Test :
# 1. Aller sur http://localhost:3000/dashboard/company
# 2. Upload un logo
# 3. Vérifier URL commence par : https://res.cloudinary.com/...
# 4. Logo s'affiche ✅
```

---

## Étape 5 : Vérification Production (3 min)

Après redeploy Railway (auto, ~5 min) :

1. **Aller sur** : https://www.intowork.co/dashboard/company

2. **Upload logo** via interface

3. **Vérifier Console (F12)** :
   - Aucune erreur
   - Response contient `cloudinary_id` ET `logo_url`

4. **Vérifier image** :
   - S'affiche correctement
   - URL : `https://res.cloudinary.com/your-cloud-name/image/upload/...`

5. **Test persistance** :
   - Actualiser page → Logo reste ✅
   - (Optionnel) Trigger Railway redeploy → Logo RESTE ✅

---

## 🎯 Checklist Complète

### Cloudinary Setup
- [ ] Compte créé sur cloudinary.com
- [ ] Email vérifié
- [ ] Dashboard accessible
- [ ] Credentials copiés (cloud_name, api_key, api_secret)

### Railway Configuration
- [ ] Variables ajoutées dans Railway Dashboard
  - [ ] CLOUDINARY_CLOUD_NAME
  - [ ] CLOUDINARY_API_KEY
  - [ ] CLOUDINARY_API_SECRET
- [ ] Variables sauvegardées
- [ ] Redeploy automatique déclenché
- [ ] Status = "Success" (vert)

### Tests
- [ ] Upload logo fonctionne
- [ ] URL Cloudinary visible dans response
- [ ] Image s'affiche sur dashboard
- [ ] Pas d'erreurs console
- [ ] Image persiste après refresh

---

## ❓ Troubleshooting

### Erreur : "Cloudinary not configured"

**Cause** : Variables d'environnement manquantes ou incorrectes

**Solution** :
```bash
# Vérifier Railway Dashboard → Variables
# Les 3 variables DOIVENT être présentes
# Vérifier orthographe : CLOUDINARY_CLOUD_NAME (pas cloud-name)
```

### Erreur : "Failed to upload image to Cloudinary"

**Causes possibles** :
1. **API Secret incorrect** → Re-copier depuis Cloudinary Dashboard
2. **Cloud name incorrect** → Vérifier exact spelling
3. **Internet firewall** → Vérifier connexion Railway → Cloudinary

**Solution** :
```bash
# Railway Dashboard → Deployments → Latest → Logs
# Chercher l'erreur exacte cloudinary
# Vérifier credentials dans Cloudinary Dashboard → Settings → API Keys
```

### Image ne s'affiche pas

**Cause** : CORS ou URL invalide

**Solution** :
```bash
# F12 Console → Network → Chercher requête image
# Vérifier URL complète
# Doit être: https://res.cloudinary.com/...
# Si autre format → Problème backend config
```

### Upload fonctionne mais image disparaît après redeploy

**Cause** : Cloudinary non utilisé (stockage local encore actif)

**Solution** :
```bash
# Vérifier response upload contient "cloudinary_id"
# Si absent → Backend n'utilise pas Cloudinary
# Vérifier git pull récent (commit avec CloudinaryService)
```

---

## 📊 Avantages Cloudinary

Maintenant activés :

✅ **CDN Mondial** : Image servie depuis serveur le plus proche de l'utilisateur
✅ **Optimisation Auto** : Format WebP si supporté, qualité auto-ajustée
✅ **Transformation** : Logo automatiquement redimensionné 500x500px
✅ **Persistance** : Fichiers JAMAIS supprimés au redeploy
✅ **Performance** : Cache agressif (1 an) pour vitesse max

---

## 🔗 Liens Utiles

- **Cloudinary Dashboard** : https://cloudinary.com/console
- **Cloudinary Docs** : https://cloudinary.com/documentation
- **Railway Dashboard** : https://railway.app/dashboard
- **Support Cloudinary** : support@cloudinary.com

---

## 📈 Prochaines Étapes

Une fois Cloudinary configuré et testé :

1. **(Optionnel)** Migrer anciens logos :
   ```bash
   # Script manuel pour re-uploader logos existants vers Cloudinary
   # À créer si besoin
   ```

2. **(Futur)** Utiliser Cloudinary pour CVs :
   ```python
   # Déjà préparé dans CloudinaryService
   await CloudinaryService.upload_cv(file, candidate_id)
   ```

3. **(Futur)** Transformations avancées :
   ```python
   # Thumbnails, crops, filters, etc.
   url = CloudinaryService.get_optimized_url(
       public_id="...",
       width=200,
       height=200,
       format="webp"
   )
   ```

---

## ✅ Validation Finale

Après configuration complète, vérifier :

```bash
# 1. Railway Variables
Railway Dashboard → Backend → Variables
→ 3 variables Cloudinary présentes ✅

# 2. Railway Deployment
Railway Dashboard → Deployments → Latest
→ Status "Success" ✅
→ Logs sans erreur Cloudinary ✅

# 3. Production Test
https://www.intowork.co/dashboard/company
→ Upload logo fonctionne ✅
→ URL commence par https://res.cloudinary.com/ ✅
→ Image visible et persiste ✅

# 4. Performance
F12 Network → Image request
→ 200 OK ✅
→ Chargement < 1s ✅
→ Headers: Cache-Control present ✅
```

---

**🎉 Félicitations ! Cloudinary est configuré et opérationnel !**

Les images sont maintenant stockées de manière professionnelle avec CDN mondial. 🚀

