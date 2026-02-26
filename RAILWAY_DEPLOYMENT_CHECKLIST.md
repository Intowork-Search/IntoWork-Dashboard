# ✅ Checklist Déploiement Railway - Intégrations OAuth

**Date** : 26 février 2026  
**Statut** : ✅ Code poussé sur GitHub (commit `40a69d7`)

---

## 📋 Étapes à Suivre Maintenant

### 1️⃣ Ajouter les Variables d'Environnement sur Railway

Tu dois copier les **vraies valeurs** depuis ton `backend/.env` local vers Railway :

#### Via l'Interface Web (Recommandé)

1. 🔗 Va sur **[Railway Dashboard](https://railway.app)**
2. Sélectionne le projet **IntoWork**
3. Clique sur le service **backend**
4. Onglet **"Variables"**
5. Clique sur **"RAW Editor"** (en haut à droite)
6. Copie-colle ce bloc avec **LES VRAIES VALEURS** depuis ton `backend/.env` local :

```env
# Copie les vraies valeurs depuis backend/.env
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_secret
LINKEDIN_REDIRECT_URI=https://intowork-dashboard-production-1ede.up.railway.app/api/integrations/linkedin/callback
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_secret
GOOGLE_REDIRECT_URI=https://intowork-dashboard-production-1ede.up.railway.app/api/integrations/google-calendar/callback
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_secret
MICROSOFT_REDIRECT_URI=https://intowork-dashboard-production-1ede.up.railway.app/api/integrations/outlook/callback
MICROSOFT_TENANT_ID=your_microsoft_tenant_id
```

> **⚠️ Important** : Les vraies valeurs sont dans ton fichier `backend/.env` local. Ne les committe JAMAIS sur Git !

7. Clique **"Update Variables"**
8. ⏳ Railway va re-déployer automatiquement

---

### 2️⃣ Surveiller le Déploiement

#### Via l'Interface Web

1. Dans Railway Dashboard → Service **backend**
2. Onglet **"Deployments"**
3. Clique sur le déploiement en cours (⏳ Building / 🚀 Deploying)
4. Onglet **"Build Logs"** puis **"Deploy Logs"**

**Ce que tu dois voir** :

✅ **Migrations s'appliquent** :
```
INFO  [alembic.runtime.migration] Running upgrade dcf183cb7a4f -> b57ce0a7904b, add_integration_credentials
```

✅ **Services activés** :
```
✅ LinkedIn service: enabled
✅ Google Calendar service: enabled
✅ Microsoft Outlook service: enabled
```

✅ **Serveur démarre** :
```
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8001
```

---

### 3️⃣ Tester les Intégrations en Production

Une fois le déploiement terminé :

```bash
# Tester le statut des intégrations
curl https://intowork-dashboard-production-1ede.up.railway.app/api/integrations/status \
  -H "Authorization: Bearer TON_JWT_TOKEN"
```

**Réponse attendue** (si tout est OK) :
```json
{
  "linkedin": {
    "provider": "linkedin",
    "is_connected": false
  },
  "google_calendar": {
    "provider": "google_calendar",
    "is_connected": false
  },
  "outlook_calendar": {
    "provider": "outlook_calendar",
    "is_connected": false
  }
}
```

Si tu vois les 3 providers → **✅ Succès !**

---

### 4️⃣ Mettre à Jour les Redirect URIs (Important !)

#### LinkedIn

1. Va sur [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Sélectionne l'app **IntoWork ATS**
3. Onglet **"Auth"**
4. Section **"Authorized redirect URLs"**
5. **Vérifie que cette URL est présente** :
   ```
   https://intowork-dashboard-production-1ede.up.railway.app/api/integrations/linkedin/callback
   ```
6. Si elle n'y est pas, clique **"Add redirect URL"** et l'ajoute
7. Clique **"Update"**

#### Google Calendar

1. Va sur [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Sélectionne le projet **IntoWork ATS**
3. Clique sur le client OAuth **"IntoWork Backend"**
4. Section **"Authorized redirect URIs"**
5. **Vérifie que cette URL est présente** :
   ```
   https://intowork-dashboard-production-1ede.up.railway.app/api/integrations/google-calendar/callback
   ```
6. Si elle n'y est pas, clique **"+ ADD URI"** et l'ajoute
7. Clique **"SAVE"**

#### Microsoft Outlook/Teams

1. Va sur [Azure Portal - App Registrations](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade)
2. Sélectionne l'app **IntoWork ATS**
3. Menu de gauche → **"Authentication"**
4. Section **"Web"** → **"Redirect URIs"**
5. **Vérifie que cette URL est présente** :
   ```
   https://intowork-dashboard-production-1ede.up.railway.app/api/integrations/outlook/callback
   ```
6. Si elle n'y est pas, clique **"Add URI"** et l'ajoute
7. Clique **"Save"** en haut

---

## 🎯 Checklist Complète

### Avant le déploiement
- [x] Code poussé sur GitHub (`40a69d7`)
- [ ] Variables ajoutées sur Railway (Raw Editor)
- [ ] Redirect URIs mis à jour dans LinkedIn/Google/Microsoft

### Pendant le déploiement
- [ ] Logs de build visibles (Railway Dashboard)
- [ ] Migrations s'appliquent sans erreur
- [ ] Services activés dans les logs
- [ ] Serveur démarre correctement

### Après le déploiement
- [ ] Test API `/api/integrations/status` réussi
- [ ] Les 3 providers apparaissent dans la réponse
- [ ] OAuth flow LinkedIn testé (optionnel)
- [ ] OAuth flow Google testé (optionnel)

---

## 🚨 Problèmes Courants

### "Service not enabled" dans les logs

**Cause** : Variables d'environnement pas définies  
**Solution** : Vérifie que les variables sont bien dans Railway → Variables → Raw Editor

### "Invalid redirect URI" lors de l'OAuth

**Cause** : Redirect URI pas ajoutée dans le portail développeur  
**Solution** : Suis l'étape 4️⃣ ci-dessus

### Migrations ne s'appliquent pas

**Cause** : `start.sh` n'est pas exécuté  
**Solution** : Vérifie que Railway utilise `CMD` défini dans `Dockerfile` :
```dockerfile
CMD ["./start.sh"]
```

---

## 📊 Temps Estimé

| Étape | Temps |
|-------|-------|
| Ajouter variables Railway | 5 min |
| Attendre déploiement | 3-5 min |
| Mettre à jour redirect URIs | 10 min |
| Tester intégrations | 5 min |
| **TOTAL** | **23-25 min** |

---

## ✅ Prochaines Étapes (Après Déploiement)

Une fois les intégrations activées en production :

1. **Frontend - Page Intégrations UI** (`/dashboard/integrations`)
   - Boutons Connect/Disconnect pour chaque provider
   - Indicateurs de statut (Connected ✅ / Not connected ⚠️)
   - Dernière utilisation

2. **Frontend - Bouton Publier LinkedIn**
   - Dans la page job posts
   - Modal avec message personnalisé
   - Appel à `POST /api/integrations/linkedin/publish-job`

3. **Frontend - Planification Entretiens**
   - Modal avec date/time picker
   - Sélection calendrier (Google/Outlook)
   - Création de lien vidéo (Meet/Teams)

---

**Créé le** : 26 février 2026  
**Commit** : `40a69d7`  
**Auteur** : IntoWork Dev Team
