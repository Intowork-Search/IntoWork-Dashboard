# 🔧 Configuration DATABASE_URL Railway - Guide de Correction

**Date**: 27 février 2026  
**Problème**: ConnectionResetError lors des migrations Alembic sur Railway  
**Cause**: Mauvaise URL de base de données configurée sur le backend

---

## ❌ Problème Identifié

Vous avez **deux URLs différentes** configurées:

### Sur le Service PostgreSQL:
```
DATABASE_URL=postgresql://postgres:XPYHrlLNDNoBVgmDIQUhuJWQJTMQGJUi@interchange.proxy.rlwy.net:45424/railway
```
☝️ **URL EXTERNE (Proxy)** - Fonctionne depuis n'importe où

### Sur le Service Backend:
```
DATABASE_URL=postgresql://postgres:XPYHrlLNDNoBVgmDIQUhuJWQJTMQGJUi@postgres.railway.internal:5432/railway
```
☝️ **URL INTERNE** - Devrait fonctionner MAIS ne fonctionne pas actuellement

---

## ✅ Solution Recommandée

### Option 1: Utiliser l'URL Externe (Proxy) - RECOMMANDÉ

C'est la solution la plus simple et la plus fiable:

1. **Allez sur Railway.app**
2. **Service Backend** → Onglet **Variables**
3. **Modifiez** `DATABASE_URL` pour utiliser l'URL externe:

```bash
DATABASE_URL=postgresql://postgres:XPYHrlLNDNoBVgmDIQUhuJWQJTMQGJUi@interchange.proxy.rlwy.net:45424/railway
```

**Avantages**:
- ✅ Fonctionne immédiatement
- ✅ Pas de configuration réseau Railway spéciale requise
- ✅ SSL géré automatiquement par le code
- ✅ Même URL que celle du service PostgreSQL

**Inconvénient**:
- ⚠️ Passe par le proxy Railway (quelques ms de latence supplémentaires, mais négligeable)

### Option 2: Créer une Variable de Référence (Plus Propre)

Railway permet de référencer les variables d'autres services:

1. **Service Backend** → Variables
2. **Supprimez** la variable `DATABASE_URL` actuelle
3. **Ajoutez** une nouvelle variable en **référençant** le service PostgreSQL:
   - Cliquez sur **+ New Variable**
   - Sélectionnez **Reference** → **PostgreSQL Service** → **DATABASE_URL**
   - Railway créera automatiquement la référence vers l'URL externe

**Avantages**:
- ✅ Plus propre (une seule source de vérité)
- ✅ Mise à jour automatique si l'URL PostgreSQL change
- ✅ Railway gère tout automatiquement

### Option 3: Utiliser DATABASE_PRIVATE_URL (Avancé)

Si vous voulez vraiment utiliser l'URL interne:

1. Railway devrait générer automatiquement `DATABASE_PRIVATE_URL`
2. Vérifiez si cette variable existe sur votre service PostgreSQL
3. Si oui, ajoutez-la au backend en référence
4. Le code la privilégiera automatiquement sur `DATABASE_URL`

**Note**: Cette option peut nécessiter que les services soient dans le même réseau Railway.

---

## 🚀 Étapes de Configuration (Option 1 - Recommandée)

### 1. Récupérer l'URL PostgreSQL

```bash
# Sur Railway, service PostgreSQL, onglet Variables
# Copiez la valeur de DATABASE_URL
postgresql://postgres:XPYHrlLNDNoBVgmDIQUhuJWQJTMQGJUi@interchange.proxy.rlwy.net:45424/railway
```

### 2. Configurer le Backend

**Sur Railway.app**:
1. Ouvrez votre projet
2. Cliquez sur **Backend** service
3. Onglet **Variables**
4. Trouvez `DATABASE_URL`
5. Cliquez sur l'icône **⋮** (trois points) → **Edit**
6. Remplacez par l'URL externe (copiée ci-dessus)
7. Cliquez **Update**

Railway redéploiera automatiquement le backend.

### 3. Vérifier les Variables Backend

Assurez-vous que ces variables sont définies:

```bash
# CRITIQUE
DATABASE_URL=postgresql://postgres:XPYHrlLNDNoBVgmDIQUhuJWQJTMQGJUi@interchange.proxy.rlwy.net:45424/railway
NEXTAUTH_SECRET=votre-secret-min-32-caracteres

# OPTIONNEL
ENVIRONMENT=production
ALLOWED_ORIGINS=https://votre-domaine.com
FRONTEND_URL=https://votre-domaine.com
```

### 4. Surveiller le Déploiement

```bash
# Dans votre terminal local:
railway logs -f

# Ou sur Railway.app:
# Backend service → Onglet "Deployments" → Dernier déploiement → Logs
```

### 5. Logs Attendus (✅ Succès)

```
🔍 DEBUG Railway:
   DATABASE_PRIVATE_URL définie: False
   DATABASE_URL définie: True
🔌 Connexion Railway détectée - Type: EXTERNE (proxy/public)
   URL masquée: postgresql://postgres:****@interchange.proxy.rlwy.net:45424/railway
📊 Exécution des migrations de base de données...
INFO  [alembic.runtime.migration] Context impl PostgresqlImpl.
INFO  [alembic.runtime.migration] Will assume transactional DDL.
✅ Migrations terminées
🎯 Démarrage du serveur FastAPI sur le port 8000
INFO:     Uvicorn running on http://0.0.0.0:8000
```

---

## 🔍 Diagnostic

### Vérifier la Configuration Actuelle

Sur Railway.app:

1. **Service PostgreSQL** → Variables → Copiez `DATABASE_URL`
2. **Service Backend** → Variables → Comparez `DATABASE_URL`
3. **Les deux doivent être identiques** (ou via référence)

### Tester Localement

```bash
# Sur votre machine:
cd /home/anna/Documents/IntoWork

# Utiliser l'URL externe Railway:
export DATABASE_URL="postgresql://postgres:XPYHrlLNDNoBVgmDIQUhuJWQJTMQGJUi@interchange.proxy.rlwy.net:45424/railway"

# Tester la connexion:
cd backend
source ../.venv/bin/activate
python -c "
import asyncio
import asyncpg

async def test():
    conn = await asyncpg.connect('$DATABASE_URL')
    print('✅ Connexion réussie!')
    await conn.close()

asyncio.run(test())
"
```

---

## 🛠️ Pourquoi l'URL Interne Ne Fonctionne Pas?

L'URL interne `postgres.railway.internal:5432` peut ne pas fonctionner pour plusieurs raisons:

1. **Réseau Docker**: Les services doivent être dans le même réseau privé Railway
2. **DNS Interne**: Le hostname `postgres.railway.internal` peut ne pas être résolvable
3. **Timing**: Le service PostgreSQL n'est peut-être pas prêt quand le backend démarre
4. **Configuration SSL**: Même en interne, Railway peut requérir SSL différemment

**Solution**: Utilisez l'URL externe (proxy) qui fonctionne toujours!

---

## 📋 Checklist Finale

Avant de redéployer:

- [ ] `DATABASE_URL` du **backend** = URL externe (proxy) de PostgreSQL
- [ ] `NEXTAUTH_SECRET` définie (min 32 caractères)
- [ ] Variables optionnelles configurées (ENVIRONMENT, ALLOWED_ORIGINS)
- [ ] Code backend à jour (poussé sur GitHub)
- [ ] Prêt à surveiller les logs de déploiement

---

## 💡 Notes Importantes

1. **SSL Automatique**: Le code détecte automatiquement le type de connexion Railway et configure SSL
2. **Pas de ?ssl= dans l'URL**: N'ajoutez PAS de paramètre SSL manuellement, le code le gère
3. **Timeout**: Des timeouts de connexion (30s) et commande (60s) sont configurés
4. **Logging**: Le code affiche maintenant des logs de debug pour diagnostiquer
5. **URL Identique**: Backend et PostgreSQL doivent utiliser la **même URL** ou une référence

---

## ✅ Résultat Attendu

Après configuration correcte:

```
🔌 Connexion Railway détectée - Type: EXTERNE (proxy/public)
✅ Migrations terminées
🎯 Démarrage du serveur FastAPI
INFO: Application startup complete
```

**Status**: 🟢 Backend opérationnel!

---

## 🆘 Besoin d'Aide?

Si l'erreur persiste après avoir suivi ce guide:

1. Vérifiez que PostgreSQL est bien démarré sur Railway
2. Vérifiez que le mot de passe dans l'URL est correct
3. Testez la connexion depuis votre machine locale (voir section Diagnostic)
4. Consultez les logs Railway pour plus de détails

**Fichiers de Référence**:
- `backend/app/database.py` - Configuration de connexion (avec logs debug)
- `FIX_RAILWAY_SSL_CONNECTION.md` - Corrections SSL appliquées
- `RAILWAY_DATABASE_CONFIG.md` - Configuration générale Railway
