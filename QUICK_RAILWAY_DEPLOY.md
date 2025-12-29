# Guide Rapide de Déploiement Railway - IntoWork Dashboard

Guide étape par étape pour déployer IntoWork Dashboard sur Railway avec toutes les corrections de sécurité appliquées.

**Status**: ✅ Production-Ready (Sécurité renforcée)
**Dernière mise à jour**: 2025-12-29

---

## 📋 Pré-requis

- [x] Compte Railway (https://railway.app)
- [x] Compte GitHub/GitLab
- [x] Code source avec toutes les corrections de sécurité
- [x] Secrets générés (via `./generate-secrets.sh`)

---

## 🚀 Déploiement en 5 Étapes

### Étape 1: Générer les Secrets

```bash
# Dans le dossier racine du projet
./generate-secrets.sh
```

**Copiez et sauvegardez** les valeurs générées :
- `NEXTAUTH_SECRET`
- `SECRET_KEY`
- `JWT_SECRET` (optionnel)

---

### Étape 2: Créer le Projet Railway

1. Allez sur https://railway.app/dashboard
2. Cliquez sur **"New Project"**
3. Sélectionnez **"Deploy from GitHub repo"** ou **"Deploy from GitLab"**
4. Autorisez Railway à accéder à vos repos
5. Sélectionnez **IntoWork-Dashboard**

---

### Étape 3: Ajouter PostgreSQL

1. Dans votre projet Railway, cliquez sur **"+ New"**
2. Sélectionnez **"Database" > "PostgreSQL"**
3. Railway créera automatiquement la base de données
4. La variable `DATABASE_URL` sera auto-injectée dans votre service

---

### Étape 4: Configurer les Variables d'Environnement

1. Cliquez sur votre **service backend** (pas la database)
2. Allez dans l'onglet **"Variables"**
3. Cliquez sur **"Raw Editor"**
4. Ajoutez les variables suivantes:

```env
# Secrets de sécurité (REQUIS - utilisez ceux générés)
NEXTAUTH_SECRET=<votre-secret-généré>
SECRET_KEY=<votre-secret-généré>

# Frontend URL (à mettre à jour après déploiement Vercel)
FRONTEND_URL=https://intowork-dashboard.vercel.app
CORS_ORIGIN=https://intowork-dashboard.vercel.app

# Email (Resend - optionnel)
RESEND_API_KEY=re_your_resend_api_key
FROM_EMAIL=INTOWORK <noreply@intowork.com>

# Environment
ENVIRONMENT=production
PORT=8000
PYTHONUNBUFFERED=1
PYTHONDONTWRITEBYTECODE=1
```

5. Cliquez sur **"Update Variables"**

---

### Étape 5: Déployer

Railway détectera automatiquement:
- `Dockerfile.railway` pour le build
- `railway.json` pour la configuration
- `backend/start.sh` comme commande de démarrage

Le déploiement se lance automatiquement !

**Attendez 2-5 minutes** pour que:
1. Docker build se termine
2. Les migrations Alembic s'exécutent
3. Le health check `/health` passe

---

## 🌐 Déploiement Frontend (Vercel)

### Étape 1: Connecter Vercel

1. Allez sur https://vercel.com/dashboard
2. Cliquez sur **"Add New..." > "Project"**
3. Importez votre repo GitHub/GitLab
4. Sélectionnez **IntoWork-Dashboard**

### Étape 2: Configurer

- **Framework Preset**: Next.js
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

### Étape 3: Variables d'Environnement

Ajoutez dans Vercel Dashboard > Settings > Environment Variables:

```env
# Secrets (même NEXTAUTH_SECRET que le backend!)
NEXTAUTH_SECRET=<même-valeur-que-railway>

# URLs
NEXTAUTH_URL=https://intowork-dashboard.vercel.app
NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app/api

# Clerk (Legacy - si encore utilisé)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Node Environment
NODE_ENV=production
```

### Étape 4: Déployer

Cliquez sur **"Deploy"** - Vercel déploiera automatiquement !

---

## ✅ Vérification Post-Déploiement

### Backend (Railway)

```bash
# Tester le health check
curl https://your-backend.up.railway.app/health

# Réponse attendue:
# {"status":"healthy","service":"intowork-backend"}

# Tester l'API
curl https://your-backend.up.railway.app/api/ping
```

### Frontend (Vercel)

1. Visitez https://intowork-dashboard.vercel.app
2. Testez la page de connexion `/sign-in`
3. Créez un compte test
4. Vérifiez le dashboard

### Database

```bash
# Dans Railway Dashboard > PostgreSQL > Query
SELECT COUNT(*) FROM users;
```

---

## 🔐 Sécurité - Changements Appliqués

✅ **Toutes les vulnérabilités critiques sont corrigées:**

1. ✅ CORS wildcard (`*`) retiré
2. ✅ Secrets hardcodés supprimés (NEXTAUTH_SECRET requis)
3. ✅ Mot de passe admin sécurisé (généré aléatoirement)
4. ✅ Validation PDF avec magic bytes
5. ✅ Sanitisation des noms de fichiers
6. ✅ Security headers middleware ajouté
7. ✅ Validation de taille de fichier renforcée

---

## 🛠️ Commandes Utiles

### Logs en temps réel (Railway)

```bash
# Dans Railway Dashboard
Cliquez sur votre service > Onglet "Deployments" > "View Logs"
```

### Redéployer

```bash
# Push vers main/master déclenche un redéploiement auto
git push origin main
```

### Rollback

Dans Railway Dashboard:
1. Allez dans **"Deployments"**
2. Sélectionnez un déploiement précédent
3. Cliquez sur **"Redeploy"**

---

## 🆘 Troubleshooting

### Erreur: "NEXTAUTH_SECRET environment variable is required"

**Cause**: Variable manquante
**Solution**: Ajoutez NEXTAUTH_SECRET dans Railway Variables

### Erreur: "Connection refused" ou "502 Bad Gateway"

**Cause**: Backend pas encore démarré
**Solution**: Attendez 2-3 minutes, vérifiez les logs

### Frontend ne peut pas se connecter au backend

**Cause**: CORS ou URL incorrecte
**Solution**: 
1. Vérifiez `NEXT_PUBLIC_API_URL` dans Vercel
2. Vérifiez `CORS_ORIGIN` dans Railway
3. Ajoutez le domaine Vercel dans `backend/app/main.py`

### Migrations échouent

**Cause**: DATABASE_URL invalide
**Solution**:
1. Vérifiez que PostgreSQL est bien ajouté
2. Redémarrez le service backend

---

## 📚 Documentation Complète

Pour plus de détails, consultez:
- [`RAILWAY_DEPLOYMENT_GUIDE.md`](./RAILWAY_DEPLOYMENT_GUIDE.md) - Guide complet (1240+ lignes)
- [`RAILWAY_DEPLOYMENT_CHECKLIST.md`](./RAILWAY_DEPLOYMENT_CHECKLIST.md) - Checklist détaillée
- [`railway.env.example`](./railway.env.example) - Référence des variables

---

## 🎉 Félicitations!

Votre application IntoWork Dashboard est maintenant déployée avec:
- ✅ Backend sécurisé sur Railway
- ✅ Frontend sur Vercel
- ✅ Base de données PostgreSQL
- ✅ CI/CD automatique
- ✅ Toutes les vulnérabilités de sécurité corrigées

**URL de Production**:
- Frontend: https://intowork-dashboard.vercel.app
- Backend API: https://your-backend.up.railway.app/api
- Documentation API: https://your-backend.up.railway.app/docs

---

**Note**: Pensez à mettre à jour `CORS_ORIGIN` et `FRONTEND_URL` avec vos vraies URLs de production après le premier déploiement.
