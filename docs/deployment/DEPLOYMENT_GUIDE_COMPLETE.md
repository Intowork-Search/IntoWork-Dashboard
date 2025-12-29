# 🚀 Guide de Déploiement Complet - IntoWork Dashboard

**Version**: 1.0.0
**Date**: 2025-12-29
**Plateformes**: Vercel (Frontend) + Railway (Backend)

---

## 📋 Table des Matières

- [Vue d'Ensemble](#-vue-densemble)
- [Prérequis](#-prérequis)
- [Méthode 1: Déploiement Automatisé](#-méthode-1-déploiement-automatisé-recommandé)
- [Méthode 2: Déploiement Manuel](#-méthode-2-déploiement-manuel)
- [Configuration Post-Déploiement](#-configuration-post-déploiement)
- [Tests et Vérification](#-tests-et-vérification)
- [CI/CD](#-cicd-optionnel)
- [Monitoring](#-monitoring)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Vue d'Ensemble

L'architecture de déploiement d'IntoWork Dashboard est composée de :

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                         UTILISATEURS                        │
│                                                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │                              │
        │   Frontend - Vercel          │
        │   Next.js 14 App Router      │
        │   NextAuth v5                │
        │                              │
        └──────────────┬───────────────┘
                       │
                       │ HTTPS API Calls
                       │
                       ▼
        ┌──────────────────────────────┐
        │                              │
        │   Backend - Railway          │
        │   FastAPI + PostgreSQL       │
        │   JWT Authentication         │
        │   Alembic Migrations         │
        │                              │
        └──────────────────────────────┘
```

**Caractéristiques**:
- ✅ Déploiement séparé Frontend/Backend
- ✅ Auto-scaling sur Vercel
- ✅ PostgreSQL managé sur Railway
- ✅ SSL/TLS automatique
- ✅ CI/CD intégré
- ✅ Zero-downtime deployments

---

## ✅ Prérequis

### Comptes Nécessaires

1. **Vercel** (Frontend)
   - Créer un compte: https://vercel.com/signup
   - Gratuit pour projets personnels
   - Lier compte GitHub/GitLab

2. **Railway** (Backend + Database)
   - Créer un compte: https://railway.app/
   - $5 de crédit gratuit
   - Carte de crédit requise après crédit

3. **Resend** (Emails - Optionnel)
   - Créer un compte: https://resend.com/
   - Plan gratuit: 100 emails/jour
   - Pour password reset

### Outils Nécessaires

```bash
# Node.js 20+
node --version  # v20.x.x ou supérieur

# npm
npm --version

# Git
git --version

# Railway CLI
npm install -g railway

# Vercel CLI
npm install -g vercel
```

### Variables d'Environnement à Préparer

#### Pour le Backend (Railway)
```bash
NEXTAUTH_SECRET=<32+ caractères aléatoires>
JWT_SECRET=<32+ caractères aléatoires>
JWT_ALGORITHM=HS256
SECRET_KEY=<clé secrète>
RESEND_API_KEY=<votre clé Resend> # Optionnel
FROM_EMAIL=INTOWORK <noreply@intowork.com>
FRONTEND_URL=<sera rempli après déploiement Vercel>
```

#### Pour le Frontend (Vercel)
```bash
NEXTAUTH_URL=<sera rempli après déploiement Vercel>
NEXTAUTH_SECRET=<MÊME valeur que backend>
AUTH_SECRET=<MÊME valeur que NEXTAUTH_SECRET>
NEXT_PUBLIC_API_URL=<sera rempli après déploiement Railway>/api
NODE_ENV=production
```

**💡 Générer des secrets sécurisés**:
```bash
# Linux/macOS
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Python
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## 🚀 Méthode 1: Déploiement Automatisé (Recommandé)

### Étape 1: Script Master

Le script `deploy-all.sh` orchestre tout le déploiement automatiquement.

```bash
# Depuis la racine du projet
./scripts/deploy-all.sh
```

**Ce script va**:
1. ✅ Vérifier les prérequis (Node, npm, Git)
2. ✅ Déployer le backend sur Railway avec PostgreSQL
3. ✅ Configurer les variables d'environnement Railway
4. ✅ Déployer le frontend sur Vercel
5. ✅ Générer un fichier de configuration
6. ✅ Afficher les URLs et prochaines étapes

### Étape 2: Suivre les Instructions

Le script vous guidera de manière interactive :

```
🚀 IntoWork Dashboard - Déploiement Complet

Étape 1/4: Vérification des prérequis
✅ Node.js installé: v20.11.0
✅ npm installé: 10.2.4
✅ Git installé

Étape 2/4: Déploiement Backend (Railway)
Déployer le backend sur Railway? (y/n) [y]: y

🚂 Lancement du déploiement Railway...
[... déploiement Railway ...]

Étape 3/4: Déploiement Frontend (Vercel)
Déployer le frontend sur Vercel? (y/n) [y]: y

▲ Lancement du déploiement Vercel...
[... déploiement Vercel ...]

Étape 4/4: Configuration Post-Déploiement
[... configuration finale ...]

✨ Déploiement Terminé !
```

### Étape 3: Configuration Finale

Après le déploiement, configurez les URLs croisées :

```bash
# Sur Railway
railway variables --set FRONTEND_URL=https://votre-app.vercel.app

# Sur Vercel
cd frontend
vercel env add NEXTAUTH_URL          # https://votre-app.vercel.app
vercel env add NEXT_PUBLIC_API_URL   # https://backend.railway.app/api
```

---

## 🛠️ Méthode 2: Déploiement Manuel

### Option A: Backend (Railway)

#### 1. Créer le Projet Railway

```bash
# Installer Railway CLI
npm install -g railway

# Login
railway login

# Initialiser le projet
cd /path/to/IntoWork-Dashboard
railway init

# Ajouter PostgreSQL
railway add --database postgres
```

#### 2. Configurer les Variables

```bash
# JWT & Auth
railway variables --set NEXTAUTH_SECRET="<votre-secret-32-chars>"
railway variables --set JWT_SECRET="<votre-secret-32-chars>"
railway variables --set JWT_ALGORITHM="HS256"

# Security
railway variables --set SECRET_KEY="<votre-secret-key>"
railway variables --set RAILWAY_ENVIRONMENT="production"

# Email (optionnel)
railway variables --set RESEND_API_KEY="<votre-resend-key>"
railway variables --set FROM_EMAIL="INTOWORK <noreply@intowork.com>"

# Frontend (à mettre à jour après Vercel)
railway variables --set FRONTEND_URL="https://votre-app.vercel.app"
```

#### 3. Déployer

```bash
# Déployer avec le Dockerfile
railway up

# Vérifier le statut
railway status

# Obtenir l'URL publique
railway domain
```

#### 4. Exécuter les Migrations

```bash
# Se connecter au service
railway shell

# Exécuter les migrations
alembic upgrade head

# Créer un admin (optionnel)
python create_admin.py

# Quitter
exit
```

### Option B: Frontend (Vercel)

#### 1. Setup Vercel CLI

```bash
# Installer Vercel CLI
npm install -g vercel

# Login
vercel login

# Naviguer vers le frontend
cd frontend

# Installer les dépendances
npm install
```

#### 2. Configurer `vercel.json`

Le fichier `vercel.json` à la racine est déjà configuré. Vérifiez-le :

```json
{
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/.next",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

#### 3. Déployer

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

#### 4. Configurer les Variables

```bash
# NEXTAUTH_URL
vercel env add NEXTAUTH_URL production
# Valeur: https://votre-app.vercel.app

# NEXTAUTH_SECRET (doit correspondre à Railway)
vercel env add NEXTAUTH_SECRET production
# Valeur: <même-secret-que-railway>

# AUTH_SECRET (alias de NEXTAUTH_SECRET)
vercel env add AUTH_SECRET production
# Valeur: <même-secret-que-railway>

# NEXT_PUBLIC_API_URL
vercel env add NEXT_PUBLIC_API_URL production
# Valeur: https://backend.railway.app/api

# Redéployer pour appliquer
vercel --prod
```

---

## ⚙️ Configuration Post-Déploiement

### 1. Vérifier les URLs

```bash
# Backend Railway
curl https://votre-backend.railway.app/api/ping
# Réponse attendue: {"status":"ok"}

# Frontend Vercel
curl https://votre-app.vercel.app
# Réponse attendue: HTML de la page d'accueil
```

### 2. Synchroniser les Variables

| Variable | Backend (Railway) | Frontend (Vercel) | Doit Correspondre? |
|----------|-------------------|-------------------|-------------------|
| `NEXTAUTH_SECRET` | ✅ | ✅ | ✅ **OUI** |
| `AUTH_SECRET` | ❌ | ✅ | N/A |
| `JWT_SECRET` | ✅ | ❌ | N/A |
| `FRONTEND_URL` | ✅ | ❌ | N/A |
| `NEXT_PUBLIC_API_URL` | ❌ | ✅ | N/A |

**⚠️ CRITIQUE**: `NEXTAUTH_SECRET` DOIT être identique sur frontend et backend !

### 3. Configurer CORS

Le backend FastAPI est configuré pour accepter les requêtes de Vercel.

Vérifiez dans `backend/app/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://votre-app.vercel.app",  # Ajoutez votre URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Si nécessaire, redéployer après modification.

### 4. Configurer le Custom Domain (Optionnel)

#### Sur Vercel:
```bash
vercel domains add yourdomain.com
```

Puis configurer les DNS records chez votre registrar.

#### Sur Railway:
```bash
railway domain add yourdomain.com
```

---

## 🧪 Tests et Vérification

### Test 1: Health Checks

```bash
# Backend
curl https://votre-backend.railway.app/api/ping
# Attendu: {"status":"ok"}

curl https://votre-backend.railway.app/health
# Attendu: {"status":"healthy"}

# Frontend
curl -I https://votre-app.vercel.app
# Attendu: HTTP 200 OK
```

### Test 2: Authentification

1. Ouvrir: `https://votre-app.vercel.app/auth/signup`
2. Créer un compte
3. Vérifier que :
   - ✅ Requête POST vers backend fonctionne
   - ✅ User créé en base de données
   - ✅ Redirection vers signin
4. Se connecter et vérifier le dashboard

### Test 3: API Connectivity

```bash
# Test signup endpoint
curl -X POST https://votre-backend.railway.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456",
    "first_name": "Test",
    "last_name": "User"
  }'

# Réponse attendue: User créé avec token JWT
```

### Test 4: Database

```bash
# Se connecter à Railway
railway shell

# Vérifier les tables
python -c "from app.models.base import *; from app.database import engine; from sqlalchemy import inspect; print(inspect(engine).get_table_names())"

# Compter les utilisateurs
python -c "from app.models.base import User; from app.database import SessionLocal; db = SessionLocal(); print(f'Users: {db.query(User).count()}'); db.close()"
```

---

## 🔄 CI/CD (Optionnel)

### GitHub Actions

Le workflow `.github/workflows/sync-repositories.yml` existe déjà.

Ajouter un workflow de déploiement :

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    name: Deploy Backend to Railway
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Railway
        run: |
          npm install -g railway
          railway link ${{ secrets.RAILWAY_PROJECT_ID }}
          railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

  deploy-frontend:
    name: Deploy Frontend to Vercel
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Vercel
        run: |
          npm install -g vercel
          cd frontend
          vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

### GitLab CI

Ajouter au `.gitlab-ci.yml` existant :

```yaml
deploy-production:
  stage: deploy
  image: node:20
  only:
    - main
  script:
    # Deploy backend
    - npm install -g railway
    - railway up
    # Deploy frontend
    - npm install -g vercel
    - cd frontend && vercel --prod --token=$VERCEL_TOKEN
  environment:
    name: production
    url: https://votre-app.vercel.app
```

---

## 📊 Monitoring

### Railway Monitoring

Railway fournit des metrics automatiques :

```bash
# Voir les logs en temps réel
railway logs --follow

# Voir les metrics
railway status
```

### Vercel Analytics

Activer Vercel Analytics dans le dashboard:
1. Projet → Settings → Analytics
2. Enable Analytics
3. Installer dans le frontend:

```bash
cd frontend
npm install @vercel/analytics
```

Puis dans `frontend/src/app/layout.tsx`:

```tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Health Checks

Configurer des health checks externes avec :
- UptimeRobot (gratuit)
- Better Uptime
- Pingdom

Endpoints à monitorer:
- `https://backend.railway.app/api/ping`
- `https://backend.railway.app/health`
- `https://votre-app.vercel.app`

---

## ⚠️ Troubleshooting

### Problème: Backend n'est pas accessible

**Symptômes**: `curl` timeout ou 502

**Solutions**:
```bash
# Vérifier les logs
railway logs

# Vérifier le statut
railway status

# Vérifier les variables
railway variables

# Redéployer
railway up --detach
```

### Problème: Frontend ne se connecte pas au Backend

**Symptômes**: Erreurs CORS ou Network Error

**Vérifications**:
1. `NEXT_PUBLIC_API_URL` correcte?
   ```bash
   vercel env ls
   ```

2. CORS configuré sur backend?
   - Vérifier `backend/app/main.py`
   - Ajouter URL Vercel à `allow_origins`

3. Variables synchronisées?
   - `NEXTAUTH_SECRET` identique?

### Problème: Authentification ne fonctionne pas

**Symptômes**: "Invalid token" ou session expires

**Solutions**:
1. Vérifier `NEXTAUTH_SECRET` identique:
   ```bash
   # Railway
   railway variables | grep NEXTAUTH_SECRET

   # Vercel
   vercel env ls
   ```

2. Vérifier JWT algorithm:
   ```bash
   # Doit être HS256
   railway variables | grep JWT_ALGORITHM
   ```

3. Logs backend:
   ```bash
   railway logs | grep "JWT"
   ```

### Problème: Database migrations failed

**Symptômes**: Erreur au démarrage "relation does not exist"

**Solutions**:
```bash
# Se connecter au service
railway shell

# Vérifier Alembic
alembic current

# Exécuter les migrations
alembic upgrade head

# Vérifier les tables
psql $DATABASE_URL -c "\dt"
```

### Problème: Build failed sur Vercel

**Symptômes**: Build error dans Vercel dashboard

**Solutions**:
1. Vérifier `vercel.json` configuration
2. Vérifier `package.json` dans `frontend/`
3. Logs de build dans Vercel dashboard
4. Tester build local:
   ```bash
   cd frontend
   npm run build
   ```

---

## 📚 Ressources Supplémentaires

- **Documentation Vercel**: https://vercel.com/docs
- **Documentation Railway**: https://docs.railway.app/
- **NextAuth.js**: https://next-auth.js.org/
- **FastAPI**: https://fastapi.tiangolo.com/
- **Alembic**: https://alembic.sqlalchemy.org/

---

## 📝 Checklist de Déploiement

### Avant le Déploiement
- [ ] Comptes Vercel et Railway créés
- [ ] Railway CLI installé et authentifié
- [ ] Vercel CLI installé et authentifié
- [ ] Secrets générés (NEXTAUTH_SECRET, JWT_SECRET, etc.)
- [ ] Resend API key obtenue (si emails nécessaires)
- [ ] Code commité et pushé sur GitHub/GitLab

### Déploiement Backend (Railway)
- [ ] Projet Railway créé
- [ ] PostgreSQL ajouté
- [ ] Variables d'environnement configurées
- [ ] Backend déployé avec succès
- [ ] Migrations Alembic exécutées
- [ ] Health check `/api/ping` répond 200
- [ ] URL publique notée

### Déploiement Frontend (Vercel)
- [ ] Projet Vercel créé et lié
- [ ] Build local réussi (`npm run build`)
- [ ] Variables d'environnement configurées
- [ ] Frontend déployé avec succès
- [ ] URL publique notée
- [ ] Page d'accueil accessible

### Post-Déploiement
- [ ] CORS configuré pour Vercel URL
- [ ] `FRONTEND_URL` mis à jour sur Railway
- [ ] `NEXT_PUBLIC_API_URL` mis à jour sur Vercel
- [ ] `NEXTAUTH_SECRET` synchronisé
- [ ] Tests de signup/login réussis
- [ ] API connectivity vérifiée
- [ ] Password reset testé
- [ ] Monitoring configuré
- [ ] CI/CD configuré (optionnel)

---

**Bon déploiement ! 🚀**

Pour toute question, consultez la [documentation complète](../README.md) ou ouvrez une issue sur GitHub.

---

*Dernière mise à jour: 2025-12-29*
*Version: 1.0.0*
