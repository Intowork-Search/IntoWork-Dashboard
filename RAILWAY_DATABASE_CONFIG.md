# Configuration de la Base de Données Railway

## Problème Résolu

L'erreur `ConnectionResetError: [Errno 104] Connection reset by peer` était causée par:
1. ❌ SSL désactivé (`ssl=disable`) au lieu d'activé
2. ❌ DATABASE_URL peut-être non configurée dans Railway

## Solution Appliquée

### 1. Correction du Code (✅ Fait)

Le fichier `backend/app/database.py` a été corrigé pour:
- ✅ Activer SSL avec `ssl=require` dans l'URL
- ✅ Forcer SSL via `connect_args` pour asyncpg
- ✅ Détecter automatiquement l'environnement Railway

### 2. Configuration Railway (À FAIRE)

**IMPORTANT**: Vous devez configurer DATABASE_URL dans Railway!

#### Option 1: PostgreSQL Provisionné par Railway (Recommandé)

Si vous utilisez le plugin PostgreSQL de Railway:

```bash
# Railway génère automatiquement ces variables:
# - DATABASE_URL (externe, pour connexions depuis l'extérieur)
# - DATABASE_PRIVATE_URL (interne, pour connexions depuis Railway)

# Dans votre service backend, assurez-vous que DATABASE_URL est référencée
```

**Étapes**:
1. Allez dans votre projet Railway
2. Cliquez sur votre service PostgreSQL
3. Onglet "Variables"
4. Copiez la valeur de `DATABASE_URL`
5. Allez dans votre service Backend
6. Onglet "Variables"
7. Vérifiez que `DATABASE_URL` existe et pointe vers PostgreSQL

**Format de l'URL Railway PostgreSQL**:
```
postgresql://postgres:<password>@<region>.railway.app:5432/railway
```

#### Option 2: Base de Données Externe

Si vous utilisez une base externe:

```bash
# Format de l'URL avec SSL requis:
DATABASE_URL=postgresql://user:password@host:port/database
```

**Étapes**:
1. Allez dans votre projet Railway
2. Service Backend > Variables
3. Ajoutez `DATABASE_URL` avec votre URL externe
4. Railway redémarrera automatiquement

### 3. Variables d'Environnement Requises

Assurez-vous que ces variables sont définies dans Railway:

```bash
# Base de données (CRITIQUE)
DATABASE_URL=postgresql://...

# Authentification (CRITIQUE)
NEXTAUTH_SECRET=votre-secret-super-securise-min-32-caracteres

# Optionnel mais recommandé
ENVIRONMENT=production
ALLOWED_ORIGINS=https://votre-domaine.com
FRONTEND_URL=https://votre-domaine.com

# Email (si password reset activé)
RESEND_API_KEY=re_...
FROM_EMAIL=INTOWORK <noreply@intowork.com>
```

### 4. Vérification de la Configuration

Après configuration, vérifiez dans les logs Railway:

```bash
# Logs de démarrage attendus:
✅ Mounting volume on: /var/lib/containers/...
✅ Démarrage IntoWork Backend sur Railway...
✅ Exécution des migrations de base de données...
✅ Migrations terminées
✅ Démarrage du serveur FastAPI sur le port 8000
```

### 5. Commandes de Déploiement

```bash
# Depuis votre machine locale:
cd /home/anna/Documents/IntoWork

# Redéployer après les changements de code:
railway up

# Ou forcer un redéploiement:
railway redeploy

# Voir les logs en temps réel:
railway logs -f
```

### 6. Diagnostic en Cas d'Erreur

Si l'erreur persiste après configuration:

```bash
# 1. Vérifier que DATABASE_URL est bien définie:
railway variables

# 2. Tester la connexion depuis Railway:
railway run bash
python -c "import os; print(os.getenv('DATABASE_URL'))"

# 3. Vérifier les logs:
railway logs --tail 100
```

## Structure de la DATABASE_URL

### Pour Railway PostgreSQL (Interne)
```
postgresql://postgres:<password>@postgres.railway.internal:5432/railway
```

### Pour Railway PostgreSQL (Externe)
```
postgresql://postgres:<password>@<region>.railway.app:5432/railway
```

### Pour Proxy Railway
```
postgresql://postgres:<password>@interchange.proxy.rlwy.net:<port>/railway
```

**IMPORTANT**: Tous ces formats sont maintenant automatiquement configurés pour SSL grâce aux corrections dans `database.py`!

## Prochaines Étapes

1. ✅ Code corrigé (SSL activé)
2. ⏳ Configurer DATABASE_URL dans Railway (vous devez le faire)
3. ⏳ Redéployer le backend
4. ⏳ Vérifier les logs de démarrage
5. ⏳ Tester l'API

## Notes Importantes

- Le fichier `.env` local N'EST PAS déployé sur Railway
- Railway utilise ses propres variables d'environnement
- SSL est maintenant FORCÉ pour toutes les connexions Railway
- Les migrations s'exécutent automatiquement au démarrage
