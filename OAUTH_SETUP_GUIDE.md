# 🔑 Guide Complet - Obtenir les Clés OAuth pour les Intégrations

## Date : 26 février 2026

Ce guide explique **étape par étape** comment obtenir les credentials OAuth pour LinkedIn, Google Calendar et Microsoft Outlook/Teams.

---

## 📋 Table des Matières

1. [LinkedIn OAuth Setup](#1-linkedin-oauth-setup)
2. [Google Calendar OAuth Setup](#2-google-calendar-oauth-setup)
3. [Microsoft Outlook/Teams OAuth Setup](#3-microsoft-outlookteams-oauth-setup)
4. [Configuration Railway](#4-configuration-railway)
5. [Vérification et Tests](#5-vérification-et-tests)

---

## 1. 🔵 LinkedIn OAuth Setup

### Étape 1 : Accéder au Portail Développeur

1. Aller sur [LinkedIn Developers](https://www.linkedin.com/developers)
2. Se connecter avec votre compte LinkedIn
3. Cliquer sur **"My Apps"** dans le menu

### Étape 2 : Créer une Application

1. Cliquer sur **"Create app"**
2. Remplir le formulaire :
   - **App name** : `IntoWork ATS` (ou votre nom)
   - **LinkedIn Page** : Sélectionner votre page entreprise
     - ⚠️ Si vous n'avez pas de page : créez-en une sur [LinkedIn Pages](https://www.linkedin.com/company/setup/new/)
   - **App logo** : Upload votre logo (minimum 300x300px)
   - **Legal agreement** : Cocher la case
3. Cliquer sur **"Create app"**

### Étape 3 : Configurer l'Application

#### 3.1 Récupérer les Credentials

1. Aller dans l'onglet **"Auth"**
2. Copier :
   - **Client ID** : `78xxxxxxxxxxxxx`
   - **Client Secret** : Cliquer sur "Show" puis copier

```env
LINKEDIN_CLIENT_ID=78xxxxxxxxxxxxx
LINKEDIN_CLIENT_SECRET=abc123def456ghi789jkl
```

#### 3.2 Ajouter les Redirect URLs

**Développement** :
```
http://localhost:8001/api/integrations/linkedin/callback
```

**Production** :
```
https://votre-backend.railway.app/api/integrations/linkedin/callback
```

**Étapes** :
1. Dans l'onglet **"Auth"**
2. Section **"OAuth 2.0 settings"**
3. Sous **"Authorized redirect URLs for your app"** :
   - Cliquer sur le crayon (edit)
   - Ajouter les deux URLs (une par ligne)
   - Cliquer sur **"Update"**

#### 3.3 Demander les Permissions (Scopes)

1. Aller dans l'onglet **"Products"**
2. Trouver **"Share on LinkedIn"**
3. Cliquer sur **"Request access"** ou **"Select"**
4. Remplir le formulaire de demande :
   - **Use case** : "Job posting automation for recruitment platform"
   - **Description** : "We need to post job openings on behalf of companies using our ATS platform"
5. Soumettre la demande

⚠️ **Délai d'approbation** : 1-3 jours ouvrables. Vous recevrez un email.

**Scopes nécessaires** (seront disponibles après approbation) :
- `w_organization_social` : Publier au nom de l'organisation
- `r_organization_social` : Lire les statistiques des posts

#### 3.4 Configuration Finale

Une fois approuvé, vérifier dans l'onglet **"Auth"** → **"OAuth 2.0 scopes"** :
- ✅ `w_organization_social`
- ✅ `r_organization_social`

### Étape 4 : Variables d'Environnement

```env
LINKEDIN_CLIENT_ID=78xxxxxxxxxxxxx
LINKEDIN_CLIENT_SECRET=abc123def456ghi789jkl
LINKEDIN_REDIRECT_URI=https://votre-backend.railway.app/api/integrations/linkedin/callback
```

---

## 2. 📅 Google Calendar OAuth Setup

### Étape 1 : Accéder à Google Cloud Console

1. Aller sur [Google Cloud Console](https://console.cloud.google.com)
2. Se connecter avec votre compte Google
3. Accepter les termes et conditions si c'est la première fois

### Étape 2 : Créer un Projet (ou utiliser un existant)

1. Cliquer sur le sélecteur de projet en haut (à côté de "Google Cloud")
2. Cliquer sur **"NEW PROJECT"**
3. Remplir :
   - **Project name** : `IntoWork ATS`
   - **Organization** : Laisser vide ou sélectionner si vous en avez une
   - **Location** : Laisser par défaut
4. Cliquer sur **"CREATE"**
5. Attendre ~30 secondes que le projet soit créé
6. Sélectionner le nouveau projet dans le sélecteur

### Étape 3 : Activer l'API Google Calendar

1. Dans le menu ☰ (hamburger) → **"APIs & Services"** → **"Library"**
2. Rechercher `Google Calendar API`
3. Cliquer sur **"Google Calendar API"**
4. Cliquer sur **"ENABLE"**

### Étape 4 : Configurer l'Écran de Consentement OAuth

1. Menu ☰ → **"APIs & Services"** → **"OAuth consent screen"**
2. Choisir **"External"** (utilisateurs hors organisation)
3. Cliquer sur **"CREATE"**

**Page 1 : App information**
- **App name** : `IntoWork ATS`
- **User support email** : Votre email
- **App logo** : (Optionnel) Upload votre logo
- **Application home page** : `https://intowork.co`
- **Application privacy policy link** : `https://intowork.co/privacy` (à créer)
- **Application terms of service link** : `https://intowork.co/terms` (à créer)
- **Authorized domains** : 
  - `intowork.co`
  - `railway.app` (pour le backend)
- **Developer contact information** : Votre email

Cliquer sur **"SAVE AND CONTINUE"**

**Page 2 : Scopes**
1. Cliquer sur **"ADD OR REMOVE SCOPES"**
2. Chercher et cocher :
   - `https://www.googleapis.com/auth/calendar` (Manage your calendars)
   - `https://www.googleapis.com/auth/calendar.events` (View and edit events)
3. Cliquer sur **"UPDATE"**
4. Cliquer sur **"SAVE AND CONTINUE"**

**Page 3 : Test users** (si votre app est en mode "Testing")
1. Cliquer sur **"ADD USERS"**
2. Ajouter vos emails de test (max 100)
3. Cliquer sur **"ADD"**
4. Cliquer sur **"SAVE AND CONTINUE"**

**Page 4 : Summary**
- Vérifier tout
- Cliquer sur **"BACK TO DASHBOARD"**

### Étape 5 : Créer les Credentials OAuth

1. Menu ☰ → **"APIs & Services"** → **"Credentials"**
2. Cliquer sur **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. Remplir :
   - **Application type** : `Web application`
   - **Name** : `IntoWork Backend`
   - **Authorized JavaScript origins** : (laisser vide)
   - **Authorized redirect URIs** :
     - Cliquer sur **"+ ADD URI"**
     - Ajouter : `http://localhost:8001/api/integrations/google-calendar/callback`
     - Cliquer sur **"+ ADD URI"**
     - Ajouter : `https://votre-backend.railway.app/api/integrations/google-calendar/callback`
4. Cliquer sur **"CREATE"**

### Étape 6 : Récupérer les Credentials

Une popup s'affiche avec :
- **Client ID** : `123456789012-abc123def456ghi789jkl.apps.googleusercontent.com`
- **Client secret** : `GOCSPX-abc123def456ghi789`

Copier ces valeurs immédiatement.

```env
GOOGLE_CLIENT_ID=123456789012-abc123def456ghi789jkl.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123def456ghi789
GOOGLE_REDIRECT_URI=https://votre-backend.railway.app/api/integrations/google-calendar/callback
```

### Étape 7 : Publier l'Application (Optionnel mais recommandé)

1. Retourner dans **"OAuth consent screen"**
2. Si le statut est "Testing" :
   - Cliquer sur **"PUBLISH APP"**
   - Confirmer
3. **Limite de 100 utilisateurs levée**

⚠️ **Note** : En mode "Testing", seulement les utilisateurs listés peuvent se connecter. En mode "In production", tout le monde peut se connecter (recommandé pour un ATS).

---

## 3. 🔷 Microsoft Outlook/Teams OAuth Setup

### Étape 1 : Accéder au Portail Azure

1. Aller sur [Azure Portal](https://portal.azure.com)
2. Se connecter avec votre compte Microsoft (Outlook, Office 365, etc.)
3. Si vous n'avez pas de compte Azure, créez-en un (gratuit)

### Étape 2 : Registrer une Application

1. Dans la barre de recherche en haut, taper `App registrations`
2. Cliquer sur **"App registrations"**
3. Cliquer sur **"+ New registration"**

**Formulaire de registration** :
- **Name** : `IntoWork ATS`
- **Supported account types** : Sélectionner
  - ✅ **"Accounts in any organizational directory (Any Azure AD directory - Multitenant) and personal Microsoft accounts (e.g. Skype, Xbox)"**
  - ℹ️ Cela permet aux utilisateurs avec des comptes personnels ET professionnels de se connecter
- **Redirect URI** :
  - Platform : `Web`
  - URL : `http://localhost:8001/api/integrations/outlook/callback`
- Cliquer sur **"Register"**

### Étape 3 : Récupérer l'Application (client) ID

1. Après la création, vous êtes redirigé vers la page de l'app
2. Dans **"Essentials"** en haut, copier :
   - **Application (client) ID** : `abc12345-6789-def0-1234-56789abcdef0`
   - **Directory (tenant) ID** : `common` (ou votre tenant ID si organisation)

```env
MICROSOFT_CLIENT_ID=abc12345-6789-def0-1234-56789abcdef0
MICROSOFT_TENANT_ID=common
```

### Étape 4 : Créer un Client Secret

1. Dans le menu de gauche, cliquer sur **"Certificates & secrets"**
2. Onglet **"Client secrets"**
3. Cliquer sur **"+ New client secret"**
4. Remplir :
   - **Description** : `IntoWork Backend`
   - **Expires** : `24 months` (recommandé)
5. Cliquer sur **"Add"**
6. **IMPORTANT** : Copier la **Value** IMMÉDIATEMENT (elle ne sera plus visible après)

```env
MICROSOFT_CLIENT_SECRET=abc~123_def456GHI789jkl-MNO012pqr
```

⚠️ **Si vous perdez le secret** : Impossible de le récupérer, vous devrez en créer un nouveau.

### Étape 5 : Configurer les Redirect URIs

1. Menu de gauche → **"Authentication"**
2. Section **"Platform configurations"** → **"Web"**
3. **Redirect URIs** :
   - Cliquer sur **"Add URI"**
   - Ajouter : `https://votre-backend.railway.app/api/integrations/outlook/callback`
4. Section **"Implicit grant and hybrid flows"** : (laisser décoché)
5. Cliquer sur **"Save"** en haut

### Étape 6 : Configurer les Permissions API

1. Menu de gauche → **"API permissions"**
2. Cliquer sur **"+ Add a permission"**
3. Sélectionner **"Microsoft Graph"**
4. Sélectionner **"Delegated permissions"**
5. Chercher et cocher :
   - **Calendars.ReadWrite** : Read and write user calendars
   - **OnlineMeetings.ReadWrite** : Read and create user's online meetings
   - **User.Read** : Sign in and read user profile (déjà coché par défaut)
6. Cliquer sur **"Add permissions"**

**Permissions finales** :
- ✅ Calendars.ReadWrite (Delegated)
- ✅ OnlineMeetings.ReadWrite (Delegated)
- ✅ User.Read (Delegated)

### Étape 7 : Grant Admin Consent (Optionnel mais recommandé)

Si vous avez des droits d'admin sur le tenant :
1. Cliquer sur **"Grant admin consent for [Votre organisation]"**
2. Confirmer

Sinon, les utilisateurs devront approuver individuellement au premier login.

### Étape 8 : Variables d'Environnement

```env
MICROSOFT_CLIENT_ID=abc12345-6789-def0-1234-56789abcdef0
MICROSOFT_CLIENT_SECRET=abc~123_def456GHI789jkl-MNO012pqr
MICROSOFT_REDIRECT_URI=https://votre-backend.railway.app/api/integrations/outlook/callback
MICROSOFT_TENANT_ID=common
```

---

## 4. 🚀 Configuration Railway

### Étape 1 : Ouvrir Railway Dashboard

1. Aller sur [Railway](https://railway.app)
2. Se connecter
3. Sélectionner votre projet **IntoWork**
4. Cliquer sur le service **backend**

### Étape 2 : Ajouter les Variables d'Environnement

1. Onglet **"Variables"**
2. Cliquer sur **"+ New Variable"**
3. Ajouter une par une :

```env
# LinkedIn
LINKEDIN_CLIENT_ID=78xxxxxxxxxxxxx
LINKEDIN_CLIENT_SECRET=abc123def456ghi789jkl
LINKEDIN_REDIRECT_URI=https://votre-backend.railway.app/api/integrations/linkedin/callback

# Google Calendar
GOOGLE_CLIENT_ID=123456789012-abc123def456ghi789jkl.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123def456ghi789
GOOGLE_REDIRECT_URI=https://votre-backend.railway.app/api/integrations/google-calendar/callback

# Microsoft Outlook/Teams
MICROSOFT_CLIENT_ID=abc12345-6789-def0-1234-56789abcdef0
MICROSOFT_CLIENT_SECRET=abc~123_def456GHI789jkl-MNO012pqr
MICROSOFT_REDIRECT_URI=https://votre-backend.railway.app/api/integrations/outlook/callback
MICROSOFT_TENANT_ID=common
```

4. Cliquer sur **"Deploy"** ou attendre le redéploiement automatique

### Étape 3 : Vérifier le Déploiement

1. Attendre que le déploiement se termine (~2-3 min)
2. Vérifier les logs :
   - ✅ Les migrations doivent s'appliquer : `Running upgrade dcf183cb7a4f -> b57ce0a7904b`
   - ✅ Le serveur doit démarrer sans erreur
   - ✅ Vous devriez voir : `✅ LinkedIn service: enabled` (si credentials configurés)

---

## 5. ✅ Vérification et Tests

### Test 1 : Services Activés

Faire une requête à votre backend :

```bash
curl https://votre-backend.railway.app/api/integrations/status \
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

### Test 2 : Obtenir une URL d'Autorisation LinkedIn

```bash
curl https://votre-backend.railway.app/api/integrations/linkedin/auth-url \
  -H "Authorization: Bearer VOTRE_JWT_TOKEN"
```

**Réponse attendue** :
```json
{
  "authorization_url": "https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=78xxx...",
  "state": "abc123...",
  "provider": "linkedin"
}
```

Si vous obtenez cette réponse, **LinkedIn est correctement configuré !** ✅

### Test 3 : Flow OAuth Complet (Manuel)

1. Copier l'`authorization_url` de la réponse précédente
2. Ouvrir dans le navigateur
3. Se connecter à LinkedIn
4. Autoriser l'accès
5. Vous serez redirigé vers votre callback URI
6. Vérifier que les credentials sont stockés en base de données

---

## 📝 Récapitulatif des Credentials

### Pour le Développement Local

Fichier : `backend/.env`

```env
# LinkedIn
LINKEDIN_CLIENT_ID=78xxxxxxxxxxxxx
LINKEDIN_CLIENT_SECRET=abc123def456ghi789jkl
LINKEDIN_REDIRECT_URI=http://localhost:8001/api/integrations/linkedin/callback

# Google Calendar
GOOGLE_CLIENT_ID=123456789012-abc123def456ghi789jkl.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123def456ghi789
GOOGLE_REDIRECT_URI=http://localhost:8001/api/integrations/google-calendar/callback

# Microsoft Outlook/Teams
MICROSOFT_CLIENT_ID=abc12345-6789-def0-1234-56789abcdef0
MICROSOFT_CLIENT_SECRET=abc~123_def456GHI789jkl-MNO012pqr
MICROSOFT_REDIRECT_URI=http://localhost:8001/api/integrations/outlook/callback
MICROSOFT_TENANT_ID=common
```

### Pour la Production (Railway)

**Important** : Remplacer `http://localhost:8001` par votre URL Railway dans :
1. Les redirect URIs dans les apps OAuth (LinkedIn, Google, Microsoft)
2. Les variables d'environnement Railway

---

## 🔒 Sécurité - Checklist

- [ ] **Ne jamais commiter les secrets dans Git**
- [ ] **Utiliser des secrets différents pour dev et prod**
- [ ] **Stocker les secrets dans Railway Variables (cryptées)**
- [ ] **Activer 2FA sur tous les comptes (LinkedIn, Google, Microsoft)**
- [ ] **Restreindre les scopes aux permissions minimales nécessaires**
- [ ] **Monitorer l'utilisation des APIs** (Google Cloud Console, Azure Portal)
- [ ] **Mettre en place des alertes de quotas** (éviter les dépassements)
- [ ] **Renouveler les secrets tous les 6-12 mois**

---

## 🆘 Problèmes Courants

### LinkedIn : "Invalid redirect URI"
**Solution** : Vérifier que l'URL dans l'app LinkedIn matche exactement celle dans `LINKEDIN_REDIRECT_URI` (trailing slash, http vs https, etc.)

### Google : "Access blocked: This app's request is invalid"
**Solution** : Vérifier que :
1. L'API Google Calendar est activée
2. L'écran de consentement OAuth est configuré
3. Les redirect URIs sont corrects

### Google : "Impossible d'utiliser l'email de l'entreprise pour le support"
**Problème** : L'email de l'entreprise (ex: `software@hcexecutive.net`) ne fonctionne pas dans le formulaire OAuth consent screen.

**Solutions** :

**Option 1 - Utiliser un email Gmail personnel** (Recommandé) :
1. Utiliser votre email Gmail personnel (ex: `votremail@gmail.com`)
2. Cet email sera visible uniquement dans la console Google Cloud, pas pour les utilisateurs
3. C'est parfaitement valide pour les applications en production

**Option 2 - Créer un email Gmail dédié** :
1. Créer un nouveau compte Gmail : `intowork.ats@gmail.com`
2. Utiliser cet email pour toutes les configurations OAuth
3. Stocker les credentials dans votre gestionnaire de mots de passe

**Option 3 - Google Workspace** (si disponible) :
1. Si votre entreprise utilise Google Workspace (G Suite)
2. Utiliser n'importe quel email @votredomaine.com
3. Le domaine doit être vérifié dans Google Workspace

**Ce qui apparaît aux utilisateurs** :
- ✅ App name: "IntoWork ATS"
- ✅ Logo de votre entreprise
- ✅ Links vers votre site web
- ❌ L'email de support n'est PAS visible aux utilisateurs finaux lors de l'OAuth

**Recommandation** : Utiliser votre email Gmail personnel pour la rapidité. Vous pourrez toujours le changer plus tard dans Google Cloud Console.

### Microsoft : "AADSTS50011: The reply URL specified in the request does not match"
**Solution** : Vérifier dans Azure Portal → Authentication → Redirect URIs que l'URL est exactement celle utilisée.

### Services "disabled" dans les logs
**Solution** : Vérifier que toutes les variables d'environnement sont définies dans Railway (pas de typo dans les noms).

---

## 📞 Support

- **LinkedIn API** : https://www.linkedin.com/help/linkedin/ask/api
- **Google Calendar API** : https://developers.google.com/calendar/support
- **Microsoft Graph API** : https://docs.microsoft.com/en-us/graph/support

---

**Créé le** : 26 février 2026  
**Auteur** : IntoWork Dev Team  
**Version** : 1.0  
**Dernière mise à jour** : 26 février 2026
