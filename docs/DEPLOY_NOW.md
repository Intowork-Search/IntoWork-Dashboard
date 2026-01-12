# 🚀 Déployer IntoWork Dashboard MAINTENANT !

**Temps estimé**: 30-45 minutes
**Coût**: Gratuit (avec limites) ou ~$10-15/mois

---

## ⚡ Déploiement Ultra-Rapide (Option Recommandée)

### Une seule commande pour tout déployer :

```bash
./scripts/deploy-all.sh
```

Ce script va :
- ✅ Vérifier les prérequis
- ✅ Déployer le backend sur Railway (avec PostgreSQL)
- ✅ Déployer le frontend sur Vercel
- ✅ Configurer les variables d'environnement
- ✅ Vous donner les URLs de production

---

## 📋 Prérequis (5 minutes)

### 1. Créer les Comptes

**Vercel** (Frontend - Gratuit):
```
👉 https://vercel.com/signup
```

**Railway** (Backend + DB - $5 gratuit):
```
👉 https://railway.app/
```

**Resend** (Emails - Optionnel):
```
👉 https://resend.com/ (100 emails/jour gratuit)
```

### 2. Installer les CLIs

```bash
# Railway CLI
npm install -g railway

# Vercel CLI
npm install -g vercel
```

### 3. Générer les Secrets

```bash
# Générer NEXTAUTH_SECRET (32+ caractères)
openssl rand -base64 32

# Générer JWT_SECRET
openssl rand -base64 32

# Générer SECRET_KEY
openssl rand -base64 32
```

**💾 Sauvegardez ces valeurs quelque part !**

---

## 🎯 Déploiement en 3 Étapes

### Étape 1: Déployer le Backend (Railway)

```bash
# Méthode automatique
./scripts/deploy-railway.sh

# OU méthode manuelle
cd /path/to/IntoWork-Dashboard
railway login
railway init
railway add --database postgres
railway up
```

**Configurer les variables**:
```bash
railway variables --set NEXTAUTH_SECRET="<votre-secret>"
railway variables --set JWT_SECRET="<votre-secret>"
railway variables --set JWT_ALGORITHM="HS256"
railway variables --set SECRET_KEY="<votre-key>"
```

**Obtenir l'URL**:
```bash
railway domain
# Exemple: https://intowork-backend-production.up.railway.app
```

### Étape 2: Déployer le Frontend (Vercel)

```bash
# Méthode automatique
./scripts/deploy-vercel.sh

# OU méthode manuelle
cd frontend
vercel --prod
```

**Configurer les variables**:
```bash
vercel env add NEXTAUTH_URL
# Votre URL Vercel: https://intowork.vercel.app

vercel env add NEXTAUTH_SECRET
# MÊME valeur que Railway !

vercel env add AUTH_SECRET
# MÊME valeur que NEXTAUTH_SECRET

vercel env add NEXT_PUBLIC_API_URL
# URL Railway + /api: https://backend.railway.app/api
```

### Étape 3: Finaliser la Configuration

**Sur Railway**:
```bash
railway variables --set FRONTEND_URL="https://votre-app.vercel.app"
```

**Tester**:
```bash
# Backend
curl https://votre-backend.railway.app/api/ping

# Frontend
open https://votre-app.vercel.app
```

---

## ✅ Vérification Rapide

### Backend est OK si :
```bash
✅ curl https://backend.railway.app/api/ping
   → {"status":"ok"}

✅ railway logs
   → Aucune erreur
```

### Frontend est OK si :
```bash
✅ https://votre-app.vercel.app
   → Page charge correctement

✅ Signup fonctionne
   → Compte créé en DB

✅ Login fonctionne
   → Dashboard accessible
```

---

## 🐛 Problèmes Courants

### Erreur: "CORS"
```bash
# Ajouter votre URL Vercel au backend
# Dans backend/app/main.py, section CORS:
allow_origins=[
    "https://votre-app.vercel.app"  # ← Ajoutez ceci
]

# Redéployer
railway up
```

### Erreur: "Invalid token"
```bash
# Vérifier que NEXTAUTH_SECRET est IDENTIQUE

# Railway
railway variables | grep NEXTAUTH_SECRET

# Vercel
vercel env ls | grep NEXTAUTH_SECRET

# Doivent être exactement pareils !
```

### Erreur: "Database connection failed"
```bash
# Vérifier PostgreSQL sur Railway
railway status

# Vérifier DATABASE_URL
railway variables | grep DATABASE_URL

# Exécuter les migrations
railway shell
alembic upgrade head
exit
```

---

## 📊 Coûts Estimés

| Service | Plan Gratuit | Plan Payant |
|---------|--------------|-------------|
| **Vercel** | ✅ Illimité (hobby) | $20/mois (Pro) |
| **Railway** | $5 crédit | $5-20/mois selon usage |
| **Resend** | 100 emails/jour | $20/mois (10k emails) |
| **TOTAL** | **~$0-5/mois** | **$25-40/mois** |

---

## 🎓 Documentation Complète

Pour un guide détaillé avec toutes les options :

```bash
cat docs/deployment/DEPLOYMENT_GUIDE_COMPLETE.md
```

Ou consultez :
- [`docs/deployment/`](docs/deployment/) - Tous les guides
- [`scripts/`](scripts/) - Scripts de déploiement
- [`DEPLOYMENT_STATUS.md`](DEPLOYMENT_STATUS.md) - Statut actuel

---

## 🚨 Besoin d'Aide ?

### Méthode 1: Scripts Automatisés
```bash
./scripts/deploy-all.sh      # Tout-en-un
./scripts/deploy-railway.sh  # Backend seulement
./scripts/deploy-vercel.sh   # Frontend seulement
```

### Méthode 2: Documentation
```bash
# Guide complet (50+ pages)
docs/deployment/DEPLOYMENT_GUIDE_COMPLETE.md

# Guide Railway
docs/deployment/RAILWAY_DEPLOYMENT_GUIDE.md

# Troubleshooting
docs/deployment/DEPLOYMENT_FIXES.md
```

### Méthode 3: Support
- 📧 Email: team@intowork.com
- 💬 Discord/Slack: (à configurer)
- 🐛 Issues: GitHub/GitLab

---

## 🎯 Checklist Finale

### Avant de Déployer
- [ ] Comptes Vercel et Railway créés
- [ ] CLIs installés (`railway`, `vercel`)
- [ ] Secrets générés et sauvegardés
- [ ] Code pushé sur GitHub/GitLab

### Après le Déploiement
- [ ] Backend accessible (curl `/api/ping`)
- [ ] Frontend accessible (ouvrir dans navigateur)
- [ ] Signup fonctionne
- [ ] Login fonctionne
- [ ] Dashboard charge
- [ ] Variables synchronisées (NEXTAUTH_SECRET)

---

## 🚀 C'est Parti !

```bash
# Tout déployer maintenant
./scripts/deploy-all.sh

# Ou étape par étape
./scripts/deploy-railway.sh   # 1. Backend
./scripts/deploy-vercel.sh    # 2. Frontend
# 3. Configurer les variables (le script vous guide)
```

**Temps total**: 30-45 minutes

**Bon déploiement ! 🎉**

---

*Créé avec ❤️ par l'équipe IntoWork*
*Dernière mise à jour: 2025-12-29*
