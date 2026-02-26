# 🚀 Quick Start - Configuration Google Calendar

## Problème : Email de l'entreprise non accepté

L'email `software@hcexecutive.net` n'est pas accepté dans le formulaire OAuth consent screen de Google Cloud.

## ✅ Solution Rapide (Recommandée)

### Utiliser un email Gmail personnel

C'est la solution la plus simple et rapide :

1. **Utiliser votre email Gmail personnel** (ex: `anna@gmail.com`)
2. Cet email est **uniquement pour la configuration** dans Google Cloud Console
3. Les utilisateurs finaux **ne verront PAS cet email**

### Ce que voient les utilisateurs lors de l'OAuth :

```
┌─────────────────────────────────────────┐
│  IntoWork ATS souhaite :                │
│                                         │
│  ✓ Voir et modifier vos calendriers     │
│  ✓ Créer des événements                 │
│                                         │
│  Site web : https://intowork.co         │
│  Politique : https://intowork.co/privacy│
│                                         │
│  [Autoriser]  [Refuser]                 │
└─────────────────────────────────────────┘
```

**L'email de support (anna@gmail.com) n'apparaît NULLE PART pour les utilisateurs !**

---

## 📋 Étapes Rapides

### 1. Google Cloud Console

1. Aller sur [console.cloud.google.com](https://console.cloud.google.com)
2. Créer un nouveau projet : **"IntoWork ATS"**
3. Activer l'API : **Google Calendar API**

### 2. OAuth Consent Screen

**App information** :
- App name : `IntoWork ATS`
- User support email : **Votre email Gmail personnel** (ex: `anna@gmail.com`)
- App logo : (Optionnel)
- Application home page : `https://intowork.co`
- Application privacy policy : `https://intowork.co/privacy` (créer une page simple)
- Application terms of service : `https://intowork.co/terms` (créer une page simple)
- Authorized domains :
  - `intowork.co`
  - `railway.app`
- Developer contact : **Même email Gmail** (ex: `anna@gmail.com`)

**Scopes** :
- `https://www.googleapis.com/auth/calendar`
- `https://www.googleapis.com/auth/calendar.events`

**Test users** (Mode Testing uniquement) :
- Ajouter votre email de test
- Limite : 100 utilisateurs

### 3. Credentials OAuth

1. Créer **OAuth client ID**
2. Type : **Web application**
3. Name : `IntoWork Backend`
4. Authorized redirect URIs :
   ```
   http://localhost:8001/api/integrations/google-calendar/callback
   https://intowork-dashboard-production-1ede.up.railway.app/api/integrations/google-calendar/callback
   ```

### 4. Copier les Credentials

Popup affichée après création :

```
Client ID: 
123456789012-abc123def456ghi789jkl.apps.googleusercontent.com

Client secret:
GOCSPX-abc123def456ghi789
```

**⚠️ IMPORTANT : Copier immédiatement !**

### 5. Ajouter dans `.env`

```env
GOOGLE_CLIENT_ID=123456789012-abc123def456ghi789jkl.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123def456ghi789
GOOGLE_REDIRECT_URI=http://localhost:8001/api/integrations/google-calendar/callback
```

### 6. Publier l'Application (Recommandé)

En mode "Testing" : Max 100 utilisateurs
En mode "Production" : Illimité ✅

Pour publier :
1. OAuth consent screen → **PUBLISH APP**
2. Répondre aux questions de Google (simple)
3. Attendre validation (~1-2 jours)

**Vous pouvez commencer en mode Testing immédiatement !**

---

## 🔒 Sécurité

### L'email Gmail personnel est-il sécurisé ?

**OUI !** Voici pourquoi :

1. **Non visible aux utilisateurs** : Seul vous voyez cet email dans Google Cloud Console
2. **Accès séparé** : L'accès OAuth est distinct de votre compte Gmail
3. **Révocable** : Vous pouvez changer l'email plus tard dans Google Cloud Console
4. **Standard** : Beaucoup d'entreprises utilisent des emails personnels pour les configs dev

### Bonnes pratiques :

- ✅ Activer 2FA sur le compte Gmail
- ✅ Utiliser un mot de passe fort
- ✅ Ne jamais partager le Client Secret
- ✅ Monitorer l'utilisation de l'API (quotas)

---

## 🧪 Tester l'Intégration

### 1. Vérifier le service

```bash
cd backend
source venv/bin/activate
python -c "
from app.services.google_calendar_service import google_calendar_service
print(f'Google Calendar service: {\"enabled\" if google_calendar_service.enabled else \"disabled\"}')
"
```

**Résultat attendu** :
```
✅ Google Calendar service: enabled
```

### 2. Obtenir l'URL d'autorisation

```bash
# Démarrer le backend
cd backend
uvicorn app.main:app --reload --port 8001

# Dans un autre terminal
curl http://localhost:8001/api/integrations/google-calendar/auth-url \
  -H "Authorization: Bearer VOTRE_JWT_TOKEN"
```

**Résultat** :
```json
{
  "authorization_url": "https://accounts.google.com/o/oauth2/v2/auth?...",
  "state": "random-token",
  "provider": "google_calendar"
}
```

### 3. Flow complet

1. Copier l'URL d'autorisation
2. Ouvrir dans le navigateur
3. Se connecter à Google
4. Autoriser l'accès
5. Redirection vers `http://localhost:8001/api/integrations/google-calendar/callback`
6. ✅ Credentials stockés en base de données !

---

## 🎯 Checklist

- [ ] Créer projet Google Cloud
- [ ] Activer Google Calendar API
- [ ] Configurer OAuth consent screen (avec email Gmail personnel)
- [ ] Créer OAuth credentials
- [ ] Copier Client ID + Client Secret
- [ ] Ajouter dans `backend/.env`
- [ ] Tester le service (doit être "enabled")
- [ ] Tester l'URL d'autorisation
- [ ] (Optionnel) Publier l'app pour lever la limite de 100 utilisateurs

---

## 📞 Besoin d'aide ?

### Erreur fréquente : "Email not allowed"

**Si vous voyez** : "The email 'software@hcexecutive.net' is not allowed."

**Solutions** :
1. ✅ Utiliser un email Gmail personnel (`anna@gmail.com`)
2. ✅ Créer un nouveau Gmail dédié (`intowork.ats@gmail.com`)
3. Si l'entreprise a Google Workspace : Utiliser un email `@hcexecutive.net` vérifié dans Workspace

### Documentation

- [Google Calendar API](https://developers.google.com/calendar)
- [OAuth 2.0 Setup](https://developers.google.com/identity/protocols/oauth2)
- [Consent Screen Guidelines](https://support.google.com/cloud/answer/10311615)

---

**Durée totale** : ~15 minutes  
**Difficulté** : ⭐ Facile (avec email Gmail personnel)  
**Statut** : Prêt à utiliser immédiatement en mode Testing !
