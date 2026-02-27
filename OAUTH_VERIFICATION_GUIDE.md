# 🔐 Guide de Vérification OAuth - Google & Outlook

## ✅ Variables Configurées sur Railway

Les variables suivantes **SONT** configurées sur Railway :
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `MICROSOFT_CLIENT_ID`
- `MICROSOFT_CLIENT_SECRET`
- `MICROSOFT_TENANT_ID`

---

## 🎯 ÉTAPES DE VÉRIFICATION OBLIGATOIRES

### A. Google Cloud Console

1. **Allez sur** : https://console.cloud.google.com/apis/credentials
2. **Trouvez** votre Client OAuth ID (commence par votre project number)
3. **Cliquez dessus** pour éditer
4. **Vérifiez "Authorized redirect URIs"** - Vous DEVEZ avoir **EXACTEMENT** :
   ```
   https://intowork-dashboard-production-1ede.up.railway.app/api/integrations/google-calendar/callback
   ```
5. **Si manquant** : Ajoutez-le et cliquez sur **Save**
6. **Vérifiez aussi** : Google Calendar API est activée dans "APIs & Services" → "Library"

---

### B. Azure Active Directory (Microsoft)

1. **Allez sur** : https://portal.azure.com
2. **Azure Active Directory** → **App registrations**
3. **Trouvez** votre application OAuth
4. **Cliquez** sur **Authentication** (dans le menu gauche)
5. **Vérifiez "Redirect URIs"** - Vous DEVEZ avoir **EXACTEMENT** :
   ```
   https://intowork-dashboard-production-1ede.up.railway.app/api/integrations/outlook/callback
   ```
6. **Si manquant** : Ajoutez-le (type: Web) et cliquez sur **Save**
7. **Vérifiez "API permissions"** :
   - Microsoft Graph → Delegated permissions
   - ✅ `Calendars.ReadWrite`
   - ✅ `User.Read`
   - ✅ `offline_access`
8. **Important** : Cliquez sur **"Grant admin consent for [Tenant]"** (bouton bleu en haut)

---

## 🐛 Problèmes Corrigés dans le Code

### ✅ Fix 1 : MICROSOFT_TENANT_ID (Commit 545801e)
- **Problème** : Le code lisait `MICROSOFT_TENANT` mais Railway avait `MICROSOFT_TENANT_ID`
- **Résultat** : Backend utilisait "common" au lieu du tenant spécifique → **401 Unauthorized**
- **Fix** : Code modifié pour supporter les deux noms de variable
- **Impact** : Microsoft OAuth utilisera maintenant correctement votre tenant ID

### ✅ Fix 2 : Email Templates snake_case
- **Problème** : Type par défaut en UPPERCASE (`'WELCOME_CANDIDATE'`)
- **Résultat** : Pydantic validation échouait avec **422 Unprocessable Entity**
- **Fix** : Changé en snake_case (`'welcome_candidate'`) pour correspondre aux enum values
- **Impact** : Création de templates fonctionne maintenant ✅

---

## 🚀 Ce qui Fonctionne Déjà

- ✅ **LinkedIn OAuth** : Complètement fonctionnel
- ✅ **Email Templates** : Création/modification fonctionnelle
- ✅ **Backend déployé** : Fix MICROSOFT_TENANT_ID actif sur Railway

---

## 📋 Checklist de Vérification

- [ ] Redirect URI Google ajouté dans Google Cloud Console
- [ ] Redirect URI Microsoft ajouté dans Azure AD Authentication
- [ ] API permissions Microsoft accordées (Calendars.ReadWrite, User.Read, offline_access)
- [ ] Admin consent accordé dans Azure AD
- [ ] Google Calendar API activée dans Google Cloud Console
- [ ] Test de connexion Google Calendar depuis `/dashboard/integrations`
- [ ] Test de connexion Outlook depuis `/dashboard/integrations`

---

## 🔍 Debug

Si ça ne marche toujours pas, vérifiez les logs Railway :

```bash
cd /home/anna/Documents/IntoWork/backend
railway logs
```

Cherchez les lignes d'erreur :
- `🔑 Exchanging Google OAuth code for token`
- `🔑 Exchanging Outlook OAuth code for token`
- `❌ Google token exchange failed: XXX`
- `❌ Outlook token exchange failed: XXX`
- `🔍 Check: 1) GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set correctly`
- `🔍 Check: 2) Redirect URI matches Google Cloud Console`

Les messages d'erreur détaillés vous diront exactement :
1. Si le Client ID/Secret est incorrect
2. Si le Redirect URI ne correspond pas
3. Si le code d'autorisation est expiré

---

## ⚡ Cause Probable du Timeout Frontend

L'erreur `"Request aborted"` (ECONNABORTED) vient probablement de :

1. **Redirect URI non autorisé** → Google/Microsoft rejette silencieusement
2. **Permissions manquantes** → L'authorization_url génère une erreur
3. **Tenant ID incorrect** → Microsoft rejette avec 401 (FIXÉ dans commit 545801e)

**Solution** : Vérifiez absolument les Redirect URIs dans les deux consoles. C'est la cause #1 des échecs OAuth.
