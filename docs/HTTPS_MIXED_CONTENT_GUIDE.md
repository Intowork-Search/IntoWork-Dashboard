# Guide de Configuration HTTPS et Prévention du Mixed Content

## 🔒 Qu'est-ce que le Mixed Content ?

Le **Mixed Content** se produit lorsqu'une page HTTPS charge des ressources (API, images, scripts) via HTTP. Les navigateurs modernes **bloquent automatiquement** ces requêtes pour des raisons de sécurité.

### Exemple d'Erreur Mixed Content

```
Mixed Content: The page at 'https://intowork.co' was loaded over HTTPS,
but requested an insecure resource 'http://api.example.com/data'.
This request has been blocked; the content must be served over HTTPS.
```

## ✅ Configuration Correcte pour INTOWORK

### 1. Backend (Railway) - `backend/app/main.py`

```python
# CORS Configuration - Support dev (HTTP) et production (HTTPS)
allowed_origins = [
    "http://localhost:3000",  # Développement local
    "https://intowork.co",  # Production
    "https://www.intowork.co",  # Production avec www
    "https://intowork-dashboard.vercel.app",  # Vercel
]
```

**✅ Correct** : Le backend accepte HTTP pour localhost et HTTPS pour production.

### 2. Frontend (Vercel) - Variables d'Environnement

#### Développement Local (`frontend/.env.local`)

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-dev-secret-min-32-characters
AUTH_SECRET=your-dev-secret-min-32-characters

# Backend API (HTTP OK en développement)
NEXT_PUBLIC_API_URL=http://localhost:8001/api

NODE_ENV=development
```

#### Production (`frontend/.env.production` ou Vercel Dashboard)

```env
# NextAuth
NEXTAUTH_URL=https://intowork.co
NEXTAUTH_SECRET=your-production-secret-min-32-characters-same-as-backend
AUTH_SECRET=your-production-secret-min-32-characters-same-as-backend

# Backend API (DOIT être HTTPS en production)
NEXT_PUBLIC_API_URL=https://intowork-dashboard-production-1ede.up.railway.app/api

NODE_ENV=production
```

### 3. Protection Automatique Mixed Content

Le code frontend (`frontend/src/lib/getApiUrl.ts`) inclut une **validation automatique** :

```typescript
// Validation: En production (HTTPS), force HTTPS pour l'API
if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
  if (!apiUrl.startsWith('https://')) {
    throw new Error(
      'Security Error: Cannot use HTTP API URL on HTTPS site'
    );
  }
}
```

**Avantages** :
- ✅ Erreur explicite si mauvaise configuration
- ✅ Empêche le déploiement avec HTTP en production
- ✅ Développement local toujours fonctionnel

## 🚀 Configuration Vercel

### Variables d'Environnement dans Vercel Dashboard

1. Aller sur https://vercel.com/your-project/settings/environment-variables
2. Ajouter les variables suivantes pour **Production** :

| Variable | Valeur | Environment |
|----------|--------|-------------|
| `NEXTAUTH_URL` | `https://intowork.co` | Production |
| `NEXTAUTH_SECRET` | `your-prod-secret` | Production |
| `AUTH_SECRET` | `your-prod-secret` (même que NEXTAUTH_SECRET) | Production |
| `NEXT_PUBLIC_API_URL` | `https://[votre-backend].railway.app/api` | Production |
| `NODE_ENV` | `production` | Production |

3. **Redéployer** pour que les variables prennent effet

### Variables pour Preview Deployments

Pour les déploiements de prévisualisation Vercel :

| Variable | Valeur | Environment |
|----------|--------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://[votre-backend].railway.app/api` | Preview |

⚠️ **Important** : Utiliser la même API backend pour Preview que Production, OU créer un environnement staging sur Railway.

## 🔧 Configuration Railway (Backend)

### Variables d'Environnement Railway

Dans le dashboard Railway, configurer :

| Variable | Valeur |
|----------|--------|
| `ALLOWED_ORIGINS` | `https://intowork.co,https://www.intowork.co,https://intowork-dashboard.vercel.app` |
| `FRONTEND_URL` | `https://intowork.co` |
| `DATABASE_URL` | (Auto-généré par Railway PostgreSQL) |
| `NEXTAUTH_SECRET` | (Même secret que frontend) |
| `JWT_SECRET` | (Secret pour tokens JWT) |

## 🧪 Tests de Configuration

### 1. Test Local (HTTP)

```bash
# Terminal 1 - Backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8001

# Terminal 2 - Frontend
cd frontend
npm run dev

# Browser: http://localhost:3000
# ✅ Doit fonctionner sans erreur Mixed Content
```

### 2. Test Production (HTTPS)

1. Déployer sur Vercel : `vercel --prod`
2. Ouvrir https://intowork.co
3. Ouvrir DevTools Console (F12)
4. Vérifier **aucune erreur Mixed Content**
5. Tester une requête API (login, fetch jobs, etc.)

### Console Output Attendu

✅ **Success** :
```
✓ API URL: https://intowork-dashboard-production-1ede.up.railway.app/api
✓ All requests using HTTPS
✓ No Mixed Content warnings
```

❌ **Erreur** :
```
❌ Mixed Content: The page at 'https://intowork.co' was loaded over HTTPS,
   but requested an insecure resource 'http://...'
```

## 🛠️ Troubleshooting

### Problème : "NEXT_PUBLIC_API_URL is not defined"

**Cause** : Variable d'environnement manquante

**Solution** :
```bash
# Vérifier le fichier .env.local existe
ls -la frontend/.env.local

# Créer depuis l'exemple
cp frontend/.env.local.example frontend/.env.local

# Éditer avec la bonne URL
echo "NEXT_PUBLIC_API_URL=http://localhost:8001/api" >> frontend/.env.local
```

### Problème : Mixed Content Error en Production

**Cause** : API URL utilise HTTP au lieu de HTTPS

**Solution** :
1. Vérifier Vercel dashboard → Environment Variables
2. `NEXT_PUBLIC_API_URL` doit commencer par `https://`
3. Redéployer : `vercel --prod`

### Problème : CORS Error en Production

**Cause** : Backend n'autorise pas le domaine frontend

**Solution** :
1. Vérifier Railway dashboard → Variables
2. Ajouter domaine à `ALLOWED_ORIGINS` : `https://intowork.co`
3. Ou ajouter directement dans `backend/app/main.py`

## 📋 Checklist Déploiement

Avant de déployer en production :

- [ ] Backend Railway configuré avec HTTPS
- [ ] `ALLOWED_ORIGINS` inclut `https://intowork.co`
- [ ] Vercel variables configurées avec HTTPS URLs
- [ ] `NEXT_PUBLIC_API_URL` utilise HTTPS
- [ ] `NEXTAUTH_SECRET` identique backend/frontend
- [ ] Test local fonctionne (HTTP)
- [ ] Test production fonctionne (HTTPS)
- [ ] Aucune erreur Mixed Content dans console
- [ ] Login/signup/API calls fonctionnent

## 🔗 Références

- [MDN - Mixed Content](https://developer.mozilla.org/en-US/docs/Web/Security/Mixed_content)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Railway Environment Variables](https://docs.railway.app/develop/variables)

---

**Dernière mise à jour** : 2026-01-12
**Version** : 1.0
**Auteur** : Claude Sonnet 4.5
