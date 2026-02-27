# 🔧 Correction du Problème de Connexion Railway PostgreSQL

**Date**: 27 février 2026  
**Problème**: `ConnectionResetError: [Errno 104] Connection reset by peer` lors du déploiement Railway  
**Statut**: ✅ Correction appliquée au code + Guide de configuration créé

---

## ❌ Problème Identifié

L'erreur de connexion PostgreSQL sur Railway était causée par **deux problèmes majeurs**:

### 1. SSL Désactivé dans le Code (CRITIQUE)
```python
# ❌ Code INCORRECT (avant):
if "proxy.rlwy.net" in DATABASE_URL.lower():
    DATABASE_URL += "?ssl=disable"  # SSL DÉSACTIVÉ!
```

**Railway PostgreSQL REQUIERT SSL**, mais le code le désactivait explicitement!

### 2. Configuration Railway Manquante
Le fichier `.env` local n'est **pas déployé** sur Railway. La variable `DATABASE_URL` doit être configurée dans les variables d'environnement Railway.

---

## ✅ Solution Appliquée

### 1. Code Corrigé (✅ Fait)

**Fichier modifié**: `backend/app/database.py`

```python
# ✅ Code CORRECT (après):
import ssl

# Détection Railway
is_railway = "proxy.rlwy.net" in DATABASE_URL.lower() or "railway.internal" in DATABASE_URL.lower()

# Activer SSL dans l'URL
if is_railway:
    if "?" not in DATABASE_URL:
        DATABASE_URL += "?ssl=require"  # SSL ACTIVÉ
    elif "ssl" not in DATABASE_URL.lower():
        DATABASE_URL += "&ssl=require"

# Forcer SSL via connect_args (double sécurité)
if is_railway:
    engine_kwargs["connect_args"] = {
        "ssl": True,  # Force SSL pour asyncpg
        "server_settings": {
            "application_name": "intowork-backend"
        }
    }
```

**Changements**:
- ✅ SSL activé au lieu de désactivé
- ✅ Détection automatique de l'environnement Railway
- ✅ Double sécurité: paramètre URL + connect_args
- ✅ Configuration spécifique pour asyncpg

### 2. Documentation Créée

**Nouveaux fichiers**:
- ✅ `RAILWAY_DATABASE_CONFIG.md` - Guide de configuration complet
- ✅ `scripts/verify-railway-config.sh` - Script de vérification automatique

---

## 🚀 Prochaines Étapes (À FAIRE)

### Étape 1: Configurer DATABASE_URL dans Railway

**Option A: PostgreSQL Railway (Recommandé)**

Si vous utilisez le plugin PostgreSQL de Railway:

1. Allez sur [railway.app](https://railway.app)
2. Ouvrez votre projet
3. Sélectionnez le service **PostgreSQL**
4. Onglet **Variables**
5. Copiez `DATABASE_URL`
6. Allez dans le service **Backend**
7. Onglet **Variables**
8. Vérifiez que `DATABASE_URL` existe et référence PostgreSQL

**Option B: Base de données externe**

1. Service Backend > Variables
2. Cliquez **+ Add Variable**
3. Nom: `DATABASE_URL`
4. Valeur: `postgresql://user:password@host:port/database`

### Étape 2: Vérifier NEXTAUTH_SECRET

```bash
# Dans Railway, service Backend > Variables
NEXTAUTH_SECRET=<minimum-32-caracteres-super-securise>
```

**IMPORTANT**: Doit être identique à la variable frontend!

### Étape 3: Variables Optionnelles (Recommandées)

```bash
ENVIRONMENT=production
ALLOWED_ORIGINS=https://votre-domaine.com
FRONTEND_URL=https://votre-domaine.com

# Si email activé:
RESEND_API_KEY=re_...
FROM_EMAIL=INTOWORK <noreply@intowork.com>
```

### Étape 4: Redéployer

Après configuration des variables:

```bash
# Railway redéploie automatiquement quand vous changez les variables
# Ou forcez un redéploiement:
railway redeploy

# Surveillez les logs:
railway logs -f
```

### Étape 5: Vérifier les Logs de Démarrage

Logs attendus (✅ succès):
```
✅ Mounting volume on: /var/lib/containers/...
🚀 Démarrage IntoWork Backend sur Railway...
📊 Exécution des migrations de base de données...
INFO  [alembic.runtime.migration] Context impl PostgresqlImpl.
INFO  [alembic.runtime.migration] Will assume transactional DDL.
✅ Migrations terminées
🎯 Démarrage du serveur FastAPI sur le port 8000
INFO:     Uvicorn running on http://0.0.0.0:8000
```

Logs d'erreur (❌ problème):
```
❌ DATABASE_URL non définie
# ou
❌ NEXTAUTH_SECRET non définie
# ou
ConnectionResetError: [Errno 104] Connection reset by peer
```

---

## 🧪 Vérification Locale

Avant de déployer, testez localement avec le script de vérification:

```bash
cd /home/anna/Documents/IntoWork

# Charger les variables d'environnement Railway:
export DATABASE_URL="postgresql://postgres:PASSWORD@interchange.proxy.rlwy.net:PORT/railway"
export NEXTAUTH_SECRET="votre-secret-min-32-caracteres"

# Exécuter la vérification:
./scripts/verify-railway-config.sh
```

Le script vérifie:
- ✅ Présence des variables requises
- ✅ Format de DATABASE_URL
- ✅ Détection Railway
- ✅ Paramètres SSL
- ✅ Connexion à la base (si asyncpg installé)

---

## 📋 Checklist de Déploiement

### Code (✅ Fait)
- [x] SSL activé dans database.py
- [x] connect_args configuré pour asyncpg
- [x] Détection automatique Railway

### Configuration Railway (⏳ À Faire)
- [ ] DATABASE_URL définie et correcte
- [ ] NEXTAUTH_SECRET définie (min 32 caractères)
- [ ] ENVIRONMENT=production
- [ ] ALLOWED_ORIGINS avec domaine production
- [ ] FRONTEND_URL avec domaine production

### Déploiement (⏳ À Faire)
- [ ] Variables vérifiées avec `verify-railway-config.sh`
- [ ] Redéploiement lancé
- [ ] Logs vérifiés (migrations OK)
- [ ] API testée (health check)
- [ ] Frontend connecté au backend

---

## 🔍 Diagnostic en Cas d'Erreur

### Erreur: "DATABASE_URL non définie"
```bash
# Vérifier dans Railway:
railway variables

# Ajouter la variable manquante:
# Service Backend > Variables > + Add Variable
```

### Erreur: "Connection reset by peer" (après les corrections)
```bash
# Vérifier que DATABASE_URL contient bien Railway:
railway run -- printenv DATABASE_URL

# Doit contenir: "railway.internal" ou "proxy.rlwy.net" ou ".railway.app"
```

### Erreur: "No such module: asyncpg"
```bash
# Vérifier requirements.txt:
cat backend/requirements.txt | grep asyncpg

# Doit contenir: asyncpg>=0.28.0
```

### Migrations échouent
```bash
# Vérifier la connexion DB:
railway run -- python -c "import asyncio; import asyncpg; print('OK')"

# Relancer manuellement les migrations:
railway run -- alembic upgrade head
```

---

## 📚 Documentation

- `RAILWAY_DATABASE_CONFIG.md` - Configuration détaillée PostgreSQL Railway
- `scripts/verify-railway-config.sh` - Script de vérification automatique
- `backend/app/database.py` - Code de connexion corrigé
- `RAILWAY_DEPLOYMENT_CHECKLIST.md` - Checklist complète de déploiement

---

## 💡 Notes Importantes

1. **SSL Obligatoire**: Railway PostgreSQL REQUIERT SSL, c'est maintenant forcé dans le code
2. **Variables Séparées**: `.env` local ≠ variables Railway (configurer séparément)
3. **Migrations Auto**: Les migrations s'exécutent automatiquement au démarrage via `start.sh`
4. **Format URL**: asyncpg requiert `ssl=require` ou `ssl=true` (pas `sslmode=require`)
5. **Double Sécurité**: SSL activé à la fois dans l'URL et via connect_args

---

## ✅ Résultat Attendu

Après application des corrections:

```
📊 Exécution des migrations de base de données...
INFO  [alembic.runtime.migration] Running upgrade -> a1b2c3d4e5f6
INFO  [alembic.runtime.migration] Running upgrade a1b2c3d4e5f6 -> b2c3d4e5f6g7
✅ Migrations terminées
🎯 Démarrage du serveur FastAPI sur le port 8000
INFO:     Started server process [1]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

**Status**: 🟢 Backend opérationnel sur Railway!

---

**Besoin d'aide?** Consultez:
- `RAILWAY_DATABASE_CONFIG.md` pour plus de détails
- Exécutez `./scripts/verify-railway-config.sh` pour diagnostiquer
