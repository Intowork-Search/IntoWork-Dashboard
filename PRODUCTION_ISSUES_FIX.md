# 🔧 Correctifs Problèmes Production

**Date** : 26 février 2026

---

## 🐛 Problème 1: CORS 500 sur `/api/integrations/status`

### Symptômes
```
XHR GET /api/integrations/status
CORS Missing Allow Origin (Status: 500)

OPTIONS /api/integrations/status → 200 ✅
GET /api/integrations/status → 500 ❌
```

### Cause
- L'endpoint crashe avec une erreur 500 AVANT que FastAPI puisse ajouter les headers CORS
- Raison: `employer.company_id` est `NULL` → requête SQL échoue

### Solution
✅ **Fix déjà appliqué dans les commits:**
- `891308f` - Fix status endpoint
- `82a095e` - Fix all integration endpoints

**Le code vérifie maintenant `company_id` avant de requêter la base de données.**

### ⚠️ Problème: Railway n'a pas redéployé

Railway devrait redéployer automatiquement après un `git push`, mais parfois il faut **forcer un redéploiement manuel**.

#### Comment forcer un redéploiement Railway:

**Option 1: Via Dashboard Web**
1. Aller sur https://railway.app/dashboard
2. Sélectionner le projet **IntoWork Backend**
3. Onglet **Deployments**
4. Cliquer **Deploy** → **Redeploy**

**Option 2: Via CLI** (si installée)
```bash
railway up
```

**Option 3: Push vide pour déclencher le hook GitHub**
```bash
cd /home/anna/Documents/IntoWork
git commit --allow-empty -m "Force Railway redeploy"
git push origin main
```

### Vérification après redéploiement

```bash
# 1. Tester l'endpoint directement (avec un token d'auth)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://intowork-dashboard-production-1ede.up.railway.app/api/integrations/status

# 2. Devrait retourner:
{
  "linkedin": {"provider": "linkedin", "is_connected": false, ...},
  "google_calendar": {...},
  "outlook_calendar": {...}
}
```

---

## 🖼️ Problème 2: Images de Profil Ne Persistent Pas

### Symptômes
- L'utilisateur upload un logo d'entreprise
- Le logo s'affiche temporairement
- Après actualisation de la page ou redéploiement → le logo disparaît

### Cause Racine: **Filesystem Éphémère de Railway**

Railway utilise un **filesystem éphémère** (comme Heroku):
- Les fichiers uploadés sont stockés dans `backend/uploads/company_logos/`
- À chaque redéploiement ou redémarrage, ce dossier est **effacé**
- L'URL du logo reste en base de données, mais le fichier n'existe plus

```
┌─────────────────┐
│ User upload logo│
│  ↓              │
│ Saved to        │
│ /uploads/...    │ ← Dossier local (éphémère!)
│  ↓              │
│ Railway restart │
│  ↓              │
│ /uploads/ EFFACÉ│ ← Fichier perdu!
└─────────────────┘
```

### Solutions

#### **Option 1: Railway Volumes (Recommandé pour Court Terme)**

Railway Volumes = stockage persistant attaché au service.

**Configuration:**

1. **Via Railway Dashboard:**
   - Projet Backend → **Settings** → **Volumes**
   - Cliquer **+ New Volume**
   - Mount Path: `/app/uploads`
   - Size: 1GB (gratuit jusqu'à 5GB)
   - Sauvegarder

2. **Via railway.toml** (déjà présent):
```toml
[[mounts]]
name = "uploads"
mountPath = "/app/uploads"
```

3. **Redéployer** le service pour que le volume soit attaché

**Avantages:**
- ✅ Rapide à mettre en place
- ✅ Pas de changement de code nécessaire
- ✅ Gratuit (jusqu'à 5GB)

**Inconvénients:**
- ⚠️ Volume lié à une région Railway spécifique
- ⚠️ Backups manuels nécessaires
- ⚠️ Limite de 5GB

---

#### **Option 2: Cloudinary (Recommandé pour Long Terme)**

Service cloud spécialisé pour les images avec CDN global.

**Avantages:**
- ✅ CDN global (chargement rapide partout)
- ✅ Optimisation automatique des images
- ✅ Transformations d'images (resize, crop, etc.)
- ✅ Plan gratuit: 25 crédits/mois, 25GB stockage

**Installation:**

```bash
cd /home/anna/Documents/IntoWork/backend
pip install cloudinary
pip freeze > requirements.txt
```

**Configuration `.env`:**
```env
# Cloudinary (https://cloudinary.com/console)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Code à modifier** (`backend/app/services/cloudinary_service.py`):
```python
import cloudinary
import cloudinary.uploader
from app.config import settings

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET
)

async def upload_company_logo(file_content: bytes, company_id: int) -> str:
    """Upload logo to Cloudinary"""
    result = cloudinary.uploader.upload(
        file_content,
        folder=f"intowork/companies/{company_id}",
        resource_type="image"
    )
    return result['secure_url']
```

**Modifier** `backend/app/api/companies.py`:
```python
from app.services.cloudinary_service import upload_company_logo

# Dans upload_company_logo():
# Au lieu de sauvegarder localement:
logo_url = await upload_company_logo(logo_content, company.id)
company.logo_url = logo_url
```

---

#### **Option 3: AWS S3 (Pour Scale Enterprise)**

Plus complexe mais plus puissant.

**Avantages:**
- ✅ Stockage illimité (payant)
- ✅ Haute disponibilité
- ✅ Contrôle total

**Installation:**
```bash
pip install boto3
```

---

### 🚀 Action Immédiate Recommandée

**Pour résoudre rapidement:**

1. **Activer Railway Volume** (5 minutes):
   - Dashboard Railway → Backend → Settings → + New Volume
   - Mount path: `/app/uploads`
   - Size: 1GB
   - Redéployer

2. **Vérifier le volume**:
   - Les fichiers devraient persister après redéploiement
   - Tester en uploadant un logo, redéployer, vérifier que le logo est toujours là

**Pour production long terme:**
- Migrer vers **Cloudinary** pour bénéficier du CDN et de l'optimisation d'images

---

## 📊 Récapitulatif des Actions

### Immédiat (Aujourd'hui)

- [ ] **Forcer redéploiement Railway** pour corriger CORS 500
- [ ] **Activer Railway Volume** `/app/uploads` pour persister les images
- [ ] **Tester** que les logos persistent après actualisation

### Court Terme (Cette Semaine)

- [ ] Vérifier que tous les endpoints d'intégrations fonctionnent
- [ ] Créer un compte Cloudinary (gratuit)
- [ ] Préparer la migration vers Cloudinary

### Long Terme (Futur)

- [ ] Migrer les uploads vers Cloudinary
- [ ] Ajouter compression automatique d'images
- [ ] Mettre en place des backups automatiques

---

## 📝 Logs de Vérification

### Test CORS après redéploiement:
```bash
# Dans le navigateur, console:
fetch('https://intowork-dashboard-production-1ede.up.railway.app/api/integrations/status', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
})
.then(r => r.json())
.then(console.log)
```

### Test upload logo après volume:
1. Aller sur `/dashboard/company`
2. Uploader un logo
3. Actualiser la page → Logo devrait rester ✅
4. Aller sur Railway → Redéployer le backend
5. Actualiser la page → Logo devrait TOUJOURS rester ✅

---

**Créé le** : 26 février 2026  
**Auteur**: IntoWork Dev Team
