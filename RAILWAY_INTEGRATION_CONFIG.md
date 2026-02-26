# 🚀 Configuration Railway - Variables d'Environnement

**Date** : 26 février 2026  
**Projet** : IntoWork Dashboard  
**URL Railway** : https://intowork-dashboard-production-1ede.up.railway.app

---

## 📋 Variables d'Environnement à Ajouter sur Railway

### 🔐 INTÉGRATIONS OAUTH (ATS Phase 2)

Copie-colle ces variables dans Railway Dashboard → Service Backend → Variables :

```env
# ============================================
# LINKEDIN INTEGRATION
# ============================================
LINKEDIN_CLIENT_ID=your_linkedin_client_id_here
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret_here
LINKEDIN_REDIRECT_URI=https://intowork-dashboard-production-1ede.up.railway.app/api/integrations/linkedin/callback

# ============================================
# GOOGLE CALENDAR INTEGRATION
# ============================================
GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=https://intowork-dashboard-production-1ede.up.railway.app/api/integrations/google-calendar/callback

# ============================================
# MICROSOFT OUTLOOK/TEAMS INTEGRATION
# ============================================
MICROSOFT_CLIENT_ID=your_microsoft_client_id_here
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret_here
MICROSOFT_REDIRECT_URI=https://intowork-dashboard-production-1ede.up.railway.app/api/integrations/outlook/callback
MICROSOFT_TENANT_ID=your_microsoft_tenant_id_here
```

> **📝 Note** : Les vraies valeurs sont dans ton fichier `backend/.env` local. Ne les committe JAMAIS sur Git !
> Pour Railway, utilise le Raw Editor pour copier-coller les vraies valeurs depuis ton `.env` local.

---

## ⚠️ IMPORTANT - Mettre à Jour les Redirect URIs en Production

### LinkedIn

1. Aller sur [LinkedIn Developers](https://www.linkedin.com/developers)
2. Sélectionner l'app "IntoWork ATS"
3. Onglet **"Auth"**
4. Section **"OAuth 2.0 settings"** → **"Authorized redirect URLs"**
5. **S'assurer que cette URL est présente** :
   ```
   https://intowork-dashboard-production-1ede.up.railway.app/api/integrations/linkedin/callback
   ```
6. Si elle n'est pas là, l'ajouter
7. Cliquer **"Update"**

### Google Calendar

1. Aller sur [Google Cloud Console](https://console.cloud.google.com)
2. Sélectionner le projet "IntoWork ATS"
3. Menu ☰ → **"APIs & Services"** → **"Credentials"**
4. Cliquer sur le client OAuth "IntoWork Backend"
5. Section **"Authorized redirect URIs"**
6. **S'assurer que cette URL est présente** :
   ```
   https://intowork-dashboard-production-1ede.up.railway.app/api/integrations/google-calendar/callback
   ```
7. Si elle n'est pas là, cliquer **"+ ADD URI"** et l'ajouter
8. Cliquer **"SAVE"**

### Microsoft Outlook/Teams

1. Aller sur [Azure Portal](https://portal.azure.com)
2. Rechercher "App registrations"
3. Sélectionner l'app "IntoWork ATS"
4. Menu de gauche → **"Authentication"**
5. Section **"Web"** → **"Redirect URIs"**
6. **S'assurer que cette URL est présente** :
   ```
   https://intowork-dashboard-production-1ede.up.railway.app/api/integrations/outlook/callback
   ```
7. Si elle n'est pas là, cliquer **"Add URI"** et l'ajouter
8. Cliquer **"Save"** en haut

---

## 📝 Étapes de Déploiement sur Railway

### 1. Ajouter les Variables d'Environnement

1. Aller sur [Railway Dashboard](https://railway.app)
2. Sélectionner le projet **IntoWork**
3. Cliquer sur le service **backend**
4. Onglet **"Variables"**
5. Pour chaque variable ci-dessus :
   - Cliquer **"+ New Variable"**
   - Name : `LINKEDIN_CLIENT_ID` (par exemple)
   - Value : `77xy7btyctvcxo` (copier la valeur exacte)
   - Cliquer **"Add"**
6. Répéter pour toutes les 11 variables

**OU** (Plus rapide) :

1. Cliquer sur **"RAW Editor"** (en haut à droite)
2. Copier-coller TOUT le bloc de variables ci-dessus
3. Cliquer **"Update Variables"**

### 2. Vérifier les Migrations

Les migrations seront appliquées automatiquement grâce à `backend/start.sh` :
- ✅ Migration `dcf183cb7a4f` (email templates, job alerts, etc.)
- ✅ Migration `b57ce0a7904b` (integration credentials)

### 3. Redéployer

Railway redéploie automatiquement après l'ajout de variables.

Sinon, cliquer sur **"Deploy"** manuellement.

### 4. Vérifier les Logs

1. Onglet **"Deployments"**
2. Cliquer sur le dernier déploiement
3. Vérifier que :
   - ✅ Migrations s'appliquent : `Running upgrade dcf183cb7a4f -> b57ce0a7904b`
   - ✅ Services activés : `✅ LinkedIn service: enabled`
   - ✅ Serveur démarre : `Application startup complete`

### 5. Tester les Intégrations

**Via API** :

```bash
curl https://intowork-dashboard-production-1ede.up.railway.app/api/integrations/status \
  -H "Authorization: Bearer VOTRE_JWT_TOKEN"
```

**Réponse attendue** :
```json
{
  "linkedin": {
    "provider": "linkedin",
    "is_connected": false,
    "connected_at": null,
    "last_used_at": null
  },
  "google_calendar": {
    "provider": "google_calendar",
    "is_connected": false,
    "connected_at": null,
    "last_used_at": null
  },
  "outlook_calendar": {
    "provider": "outlook_calendar",
    "is_connected": false,
    "connected_at": null,
    "last_used_at": null
  }
}
```

Si tous les providers sont présents → ✅ **Succès !**

---

## ✅ Checklist de Déploiement

### Avant le déploiement :
- [x] Variables locales testées et fonctionnelles
- [x] Tous les services activés en local
- [x] Migrations créées et testées

### Pendant le déploiement :
- [ ] Ajouter les 11 variables d'environnement sur Railway
- [ ] Vérifier les redirect URIs dans LinkedIn, Google, Microsoft
- [ ] Attendre le redéploiement automatique

### Après le déploiement :
- [ ] Vérifier les logs (migrations + services activés)
- [ ] Tester `/api/integrations/status`
- [ ] Tester OAuth flow pour LinkedIn (au moins)
- [ ] Vérifier que les credentials sont stockés en DB

---

## 🔒 Sécurité

### Variables Sensibles

Ces variables contiennent des **secrets** :
- ✅ Stockées de manière cryptée sur Railway
- ✅ Jamais commitées sur Git (`.env` est dans `.gitignore`)
- ✅ Accessibles uniquement via dashboard Railway ou API Railway

### Rotation des Secrets

**Recommandé** : Renouveler les secrets tous les 6-12 mois

Pour renouveler :
1. **LinkedIn** : Générer nouveau Client Secret dans LinkedIn Developers
2. **Google** : Créer nouveau Client Secret dans Google Cloud Console
3. **Microsoft** : Créer nouveau Client Secret dans Azure Portal
4. Mettre à jour sur Railway
5. Ancien secret reste valide pendant 24h (grace period)

---

## 📊 Statut Actuel

| Provider | Local | Production | Redirect URI Production |
|----------|-------|------------|-------------------------|
| **LinkedIn** | ✅ ACTIVÉ | ⏳ À déployer | ⏳ À vérifier |
| **Google Calendar** | ✅ ACTIVÉ | ⏳ À déployer | ⏳ À ajouter |
| **Outlook/Teams** | ✅ ACTIVÉ | ⏳ À déployer | ⏳ À ajouter |

---

## 🎯 Prochaines Étapes

1. **Ajouter variables sur Railway** (10 min)
2. **Mettre à jour redirect URIs** (5 min)
3. **Déployer et vérifier** (5 min)
4. **Commencer Phase 3 Frontend** :
   - Page `/dashboard/integrations`
   - Bouton "Publier sur LinkedIn"
   - Modal planification entretiens

---

**Créé le** : 26 février 2026  
**Auteur** : IntoWork Dev Team  
**Backend URL** : https://intowork-dashboard-production-1ede.up.railway.app
