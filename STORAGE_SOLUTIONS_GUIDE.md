# 🔥 Solutions pour Stockage Persistant (Uploads)

## Date: 26 février 2026

Le volume Railway n'est pas visible dans Dashboard car :
- ❌ Pas disponible sur tous les plans (peut nécessiter plan payant)
- ❌ Pas disponible dans toutes les régions
- ⚠️ Fonctionnalité récente, interface peut varier

---

## ✅ 3 SOLUTIONS (Choisissez une)

### 🥇 Solution 1 : Cloudinary (RECOMMANDÉ - Production Ready)

**Avantages** :
- ✅ Gratuit jusqu'à 25GB stockage
- ✅ CDN mondial ultra-rapide
- ✅ Optimisation automatique des images
- ✅ Transformations (resize, crop, format)
- ✅ Pas de perte de fichiers au redeploy
- ✅ Solution professionnelle et évolutive

**Inconvénients** :
- ⚠️ Nécessite 30 min d'implémentation

**Setup (30 minutes)** :

```bash
# 1. Créer compte Cloudinary
https://cloudinary.com/users/register/free

# 2. Récupérer credentials
Cloud name: your-cloud-name
API Key: 123456789
API Secret: abc123xyz

# 3. Ajouter à Railway Variables
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=abc123xyz

# 4. Backend : Installer package
pip install cloudinary

# 5. Code modification (voir guide ci-dessous)
```

---

### 🥈 Solution 2 : Railway Volume via CLI (Moyen)

**Avantages** :
- ✅ Intégré à Railway
- ✅ 1GB gratuit
- ✅ Simple une fois configuré

**Inconvénients** :
- ❌ Nécessite Railway CLI
- ❌ Peut ne pas être disponible (plan/région)
- ⚠️ Login browserless nécessaire

**Setup (10 minutes)** :

```bash
# 1. Login Railway CLI
cd /home/anna/Documents/IntoWork/backend
railway login --browserless

# Ouvrir le lien affiché dans navigateur :
# https://railway.com/cli-login?d=...
# Code : plum-imaginative-magic (exemple)

# 2. Lier le projet
railway link
# Sélectionner : intowork-dashboard-production

# 3. Créer volume
railway volume add
# Name: uploads
# Mount Path: /app/uploads
# Size: 1 (GB)

# 4. Vérifier
railway volumes
# Output : uploads -> /app/uploads (1 GB)

# 5. Redéployer
railway up
# Ou : git push origin main (auto-deploy)
```

---

### 🥉 Solution 3 : Accepter Perte Temporaire (Quick Fix)

**Avantages** :
- ✅ Rien à faire
- ✅ Fonctionne immédiatement

**Inconvénients** :
- ❌ Images perdues à chaque redeploy Railway
- ❌ Pas de solution permanente

**Explication** :

Les images uploadées fonctionnent **jusqu'au prochain redeploy** Railway. Ensuite, elles sont supprimées (filesystem éphémère).

**Acceptable temporairement si** :
- Vous testez en développement
- Peu d'uploads pour l'instant
- Vous planifiez Cloudinary bientôt

**Pour minimiser pertes** :
- Ne pas redeploy fréquemment
- Sauvegarder images importantes manuellement

---

## 🏆 Recommandation

### Pour PRODUCTION (Maintenant) :
**→ Solution 1 : Cloudinary**

Raisons :
1. Solution professionnelle standard
2. CDN rapide (meilleure UX)
3. Gratuit pour votre usage
4. Évolutif (si succès, déjà prêt)
5. 30 min setup = gain temps long-terme

### Pour DEV/TEST (Temporaire) :
**→ Solution 3 : Accepter perte temporaire**

Raisons :
1. Aucun setup requis
2. Tester le reste de l'app
3. Implémenter Cloudinary plus tard

### Si Volume Railway visible :
**→ Solution 2 : Railway Volume CLI**

**À ÉVITER** : Continuer sans solution (perte données utilisateurs = mauvaise UX)

---

## 📚 Guide Cloudinary Détaillé

### Étape 1 : Créer Compte (5 min)

```bash
1. Aller sur https://cloudinary.com/users/register/free
2. S'inscrire avec email
3. Vérifier email
4. Aller sur Dashboard
```

### Étape 2 : Récupérer Credentials (1 min)

```bash
Dans Dashboard Cloudinary :
- Cloud name : votre-cloud-name
- API Key : 123456789012345
- API Secret : abcdefghijklmnopqrstuv

⚠️ Garder API Secret confidentiel !
```

### Étape 3 : Configuration Backend (10 min)

**A. Installer package** :

```bash
cd /home/anna/Documents/IntoWork/backend
source venv/bin/activate
pip install cloudinary
pip freeze > requirements.txt
```

**B. Ajouter variables Railway** :

```bash
Railway Dashboard → Variables → Add :

CLOUDINARY_CLOUD_NAME=votre-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuv
```

**C. Créer service Cloudinary** :

Créer `backend/app/services/cloudinary_service.py` :

```python
import cloudinary
import cloudinary.uploader
import os
from typing import Optional

# Configuration
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)

class CloudinaryService:
    @staticmethod
    async def upload_image(file, folder: str = "uploads") -> dict:
        """Upload image to Cloudinary"""
        try:
            result = cloudinary.uploader.upload(
                file.file,
                folder=folder,
                resource_type="auto"
            )
            return {
                "url": result['secure_url'],
                "public_id": result['public_id']
            }
        except Exception as e:
            raise Exception(f"Cloudinary upload failed: {str(e)}")
    
    @staticmethod
    async def delete_image(public_id: str) -> bool:
        """Delete image from Cloudinary"""
        try:
            cloudinary.uploader.destroy(public_id)
            return True
        except:
            return False
```

**D. Modifier route upload** :

Dans `backend/app/api/companies.py`, remplacer :

```python
# AVANT (stockage local)
file_path = f"uploads/company_logos/company_{company.id}_{unique_filename}"
with open(file_path, "wb") as f:
    f.write(await logo.read())

# APRÈS (Cloudinary)
from app.services.cloudinary_service import CloudinaryService

result = await CloudinaryService.upload_image(
    logo,
    folder=f"company_logos/company_{company.id}"
)
company.logo_url = result['url']
company.cloudinary_id = result['public_id']  # Nouveau champ
```

### Étape 4 : Migration DB (5 min)

Ajouter champ `cloudinary_id` à Company :

```bash
cd backend
alembic revision --autogenerate -m "Add cloudinary_id to Company"
alembic upgrade head
```

### Étape 5 : Test (5 min)

```bash
1. Railway redeploy (auto après push)
2. Upload logo sur /dashboard/company
3. Vérifier URL commence par : https://res.cloudinary.com/...
4. Vérifier image visible
5. Redeploy Railway → image reste visible ✅
```

---

## ⚙️ Railway Volume CLI - Troubleshooting

### Problème : "Volume command not found"

```bash
# Mettre à jour Railway CLI
npm install -g @railway/cli@latest

# Ou via Homebrew (Mac/Linux)
brew upgrade railway
```

### Problème : "Volumes not available"

Vérifier plan Railway :
```bash
railway dashboard
# Settings → Plan
# Volume nécessite : Hobby plan ($5/month) ou Trial avec volumes actifs
```

### Problème : "No project linked"

```bash
cd backend
railway link
# Sélectionner projet dans liste
```

---

## 🧪 Test de Vérification

### Cloudinary :

```bash
# Upload image
curl -X POST https://your-api.railway.app/api/companies/my-company/logo \
  -H "Authorization: Bearer <token>" \
  -F "logo=@test.jpg"

# Vérifier réponse contient :
{
  "logo_url": "https://res.cloudinary.com/your-cloud/image/upload/v.../company_logos/..."
}

# Redeploy Railway
railway up

# Image toujours accessible ? ✅
```

### Railway Volume :

```bash
# Vérifier volume monté
railway run bash
ls -la /app/uploads  # Doit exister

# Upload image
# Redeploy
# ls -la /app/uploads  # Fichiers toujours présents ✅
```

---

## 💰 Comparaison Coûts

| Solution | Gratuit | Payant |
|----------|---------|--------|
| **Cloudinary** | 25GB stockage<br>25GB bandwidth | $99/month (200GB) |
| **Railway Volume** | 1GB (peut nécessiter Hobby plan $5) | $0.25/GB/month |
| **Perte temporaire** | ✅ 100% gratuit | N/A |

**Meilleur rapport qualité/prix** : Cloudinary gratuit jusqu'à 25GB

---

## 📞 Support

### Cloudinary
- Docs : https://cloudinary.com/documentation
- Support : support@cloudinary.com

### Railway
- Docs : https://docs.railway.app/guides/volumes
- Discord : https://discord.gg/railway

---

## ✅ Checklist Décision

Choisissez Cloudinary si :
- [ ] Vous lancez en production bientôt
- [ ] Vous voulez CDN rapide
- [ ] Vous planifiez croissance
- [ ] Vous voulez optimisation auto images

Choisissez Railway Volume si :
- [ ] Volume disponible dans votre plan
- [ ] Vous voulez solution intégrée
- [ ] Peu d'uploads (<1GB)
- [ ] CLI setup acceptable

Choisissez Accepter Perte si :
- [ ] Tests/développement uniquement
- [ ] Peu d'uploads
- [ ] Setup permanent prévu plus tard
- [ ] Pas de données critiques

