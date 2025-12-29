# 🔐 Guide Configuration Clerk + Microsoft

## Étape 1 : Créer un compte Clerk

### 1.1 Inscription sur Clerk
1. Allez sur [https://clerk.com](https://clerk.com)
2. Cliquez sur "Sign up" 
3. Créez votre compte avec votre email
4. Vérifiez votre email

### 1.2 Créer une nouvelle application
1. Une fois connecté, cliquez sur **"Create application"**
2. Nom : `INTOWORK Search`
3. Choisissez les méthodes d'authentification :
   - ✅ **Email** (obligatoire)
   - ✅ **Microsoft** (à configurer)
   - ✅ **Google** (optionnel)
4. Cliquez sur **"Create application"**

## Étape 2 : Configuration Microsoft Azure AD

### 2.1 Créer une application Azure AD
1. Connectez-vous au [Portail Azure](https://portal.azure.com)
2. Allez dans **Azure Active Directory**
3. Dans le menu de gauche, cliquez sur **"App registrations"**
4. Cliquez sur **"New registration"**

### 2.2 Configurer l'application Azure
**Informations de base :**
- **Name**: `INTOWORK-Clerk-Auth`
- **Supported account types**: 
  - Choisir "Accounts in any organizational directory (Any Azure AD directory - Multitenant) and personal Microsoft accounts"
- **Redirect URI**: 
  - Platform: `Web`
  - URI: `https://clerk.accounts.dev/v1/oauth_callback`

### 2.3 Récupérer les identifiants Azure
Après création, notez :
- **Application (client) ID** : `12345678-1234-1234-1234-123456789abc`
- **Directory (tenant) ID** : `87654321-4321-4321-4321-210987654321`

### 2.4 Créer un client secret
1. Dans votre app Azure, allez à **"Certificates & secrets"**
2. Cliquez sur **"New client secret"**
3. Description : `Clerk Integration`
4. Expiration : `24 months`
5. Cliquez **"Add"**
6. **IMPORTANT** : Copiez immédiatement la **Value** du secret ! Elle ne sera plus visible.

## Étape 3 : Configurer Microsoft dans Clerk

### 3.1 Activer Microsoft dans Clerk
1. Dans votre dashboard Clerk, allez à **"User & Authentication"** > **"Social Connections"**
2. Trouvez **Microsoft** et cliquez sur **"Configure"**

### 3.2 Saisir les identifiants Microsoft
Dans la configuration Microsoft de Clerk :
- **Client ID** : Votre Application (client) ID d'Azure
- **Client Secret** : Le secret que vous venez de créer
- **Tenant ID** (optionnel) : Votre Directory (tenant) ID pour limiter aux utilisateurs de votre organisation

### 3.3 Configurer les scopes (permissions)
Scopes recommandés :
- `openid` (obligatoire)
- `profile` (obligatoire) 
- `email` (obligatoire)
- `User.Read` (optionnel - pour accéder au profil Microsoft)

## Étape 4 : Récupérer les clés Clerk

### 4.1 Clés pour le Frontend
Dans Clerk Dashboard > **"API Keys"** :
- **Publishable Key** (commence par `pk_test_` ou `pk_live_`)
  ```
  pk_test_Y2xlcmsuaW50b3dvcmsuc2VhcmNoJA
  ```

### 4.2 Clés pour le Backend  
- **Secret Key** (commence par `sk_test_` ou `sk_live_`)
  ```
  sk_test_abcd1234efgh5678ijkl9012mnop3456
  ```

### 4.3 Clé publique PEM (pour JWT)
1. Allez dans **"API Keys"** > **"Advanced"**
2. Copiez la **JWT Template** > **"Default"** > **"JWKS Endpoint"**
3. Ou récupérez directement la clé PEM depuis l'endpoint

## Étape 5 : Configuration des fichiers

### 5.1 Backend (.env)
```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/intowork

# Clerk Backend
CLERK_SECRET=sk_test_VOTRE_CLE_SECRETE_ICI
CLERK_PEM_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
-----END PUBLIC KEY-----"

# Environment
SECRET_KEY=your-super-secret-key-for-jwt
ENVIRONMENT=development
```

### 5.2 Frontend (.env.local)
```env
# Clerk Frontend  
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_VOTRE_CLE_PUBLIQUE_ICI
CLERK_SECRET_KEY=sk_test_VOTRE_CLE_SECRETE_ICI

# URLs Clerk
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# API Backend
NEXT_PUBLIC_API_URL=http://localhost:8001/api
```

## Étape 6 : Test de la configuration

### 6.1 Vérifier les variables
```bash
# Backend
cd backend
cat .env | grep CLERK

# Frontend  
cd frontend
cat .env.local | grep CLERK
```

### 6.2 Test d'authentification
1. Démarrez le backend : `uvicorn app.main:app --reload --port 8001`
2. Démarrez le frontend : `npm run dev`
3. Allez sur http://localhost:3000
4. Cliquez sur **"Inscription"**
5. Vous devriez voir le bouton **"Continue with Microsoft"**

## 🚨 Problèmes courants

### Erreur "Invalid redirect URI"
- Vérifiez que l'URI de redirection dans Azure correspond à celle de Clerk
- URI Clerk : `https://clerk.accounts.dev/v1/oauth_callback`

### Erreur "Invalid client"  
- Vérifiez que le Client ID et Secret sont corrects
- Vérifiez qu'ils sont bien copiés sans espaces

### Erreur "Unauthorized"
- Vérifiez que l'application Azure est configurée en "Multitenant"
- Vérifiez les scopes configurés

### Microsoft ne s'affiche pas
- Vérifiez que Microsoft est activé dans Clerk
- Vérifiez les clés dans .env.local

## 📝 Checklist finale

- [ ] Application Azure créée avec redirect URI correct
- [ ] Client ID, Secret et Tenant ID récupérés
- [ ] Microsoft activé dans Clerk Dashboard
- [ ] Identifiants Azure saisis dans Clerk
- [ ] Clés Clerk récupérées (publishable + secret)
- [ ] Fichiers .env et .env.local configurés
- [ ] Backend et frontend démarrés
- [ ] Test de connexion Microsoft réussi

## 🎯 Prochaines étapes

Une fois Microsoft configuré :
1. Tester l'inscription avec Microsoft
2. Vérifier la synchronisation avec le backend  
3. Tester le système de rôles (candidat/employeur)
4. Passer à la Phase 2 : Dashboard Candidat

---

💡 **Conseil** : Gardez précieusement vos clés Azure et Clerk - vous en aurez besoin pour la production !
