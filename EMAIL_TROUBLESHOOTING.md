# 🔍 Diagnostic - Email de Réinitialisation Non Reçu

## 🎯 Problème
Vous ne recevez pas l'email de réinitialisation de mot de passe.

## ✅ Checklist de Diagnostic

### 1️⃣ Vérifier que le Backend Est Démarré

```bash
# Tester si le backend répond
curl http://localhost:8001/api/ping
```

**Attendu** :
```json
{"ping":"pong","timestamp":"...","service":"intowork-backend"}
```

**Si erreur** : Démarrez le backend
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8001
```

### 2️⃣ Vérifier le Service Email

Dans les logs du backend (terminal où tourne uvicorn), vous devriez voir au démarrage :
```
INFO:     Email service enabled with Resend
```

**Si vous voyez** :
```
WARNING:  Email service disabled: RESEND_API_KEY not configured
```

→ Le service email n'est pas activé. Vérifiez `/backend/.env` :
```bash
cat backend/.env | grep RESEND_API_KEY
```

Devrait afficher :
```
RESEND_API_KEY=re_9PDmb3bu_91NLA4pshg8uYAGRGDveXWPj
```

### 3️⃣ Vérifier l'Email Utilisé

⚠️ **TRÈS IMPORTANT** : Avec le domaine de test `onboarding@resend.dev`, vous pouvez **UNIQUEMENT** envoyer des emails à l'adresse email de votre compte Resend !

**Questions à vous poser** :
- Quel email avez-vous utilisé pour créer votre compte sur resend.com ?
- Est-ce que vous testez avec CET email exactement ?

**Si vous testez avec un autre email → L'email ne sera JAMAIS envoyé !**

### 4️⃣ Test Direct de l'API

Utilisez le script de test :

```bash
./test_forgot_password.sh
```

Ou manuellement :
```bash
curl -X POST http://localhost:8001/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "votre.email@example.com"}'
```

**Réponse attendue** :
```json
{
  "message": "If this email exists in our system, you will receive password reset instructions shortly."
}
```

**Note** : Cette réponse est normale même si l'email n'existe pas (pour des raisons de sécurité).

### 5️⃣ Vérifier que l'Email Existe dans la Base de Données

L'email doit exister dans la base de données pour recevoir le lien.

**Option A - Créer un compte** :
1. Visitez : `http://localhost:3000/auth/signup`
2. Créez un compte avec l'email de votre compte Resend
3. Retestez la réinitialisation

**Option B - Vérifier dans la DB** (avancé) :
```bash
cd backend
source venv/bin/activate
python -c "
from app.database import SessionLocal
from app.models.base import User
db = SessionLocal()
email = 'votre.email@example.com'  # CHANGEZ ICI
user = db.query(User).filter(User.email == email).first()
if user:
    print(f'✅ Utilisateur trouvé: {user.email} (ID: {user.id})')
else:
    print(f'❌ Aucun utilisateur avec cet email')
db.close()
"
```

### 6️⃣ Vérifier les Logs Backend

Dans le terminal où tourne `uvicorn`, cherchez :

**Succès** :
```
INFO:     Password reset email sent successfully to email@example.com
```

**Erreur** :
```
ERROR:    Failed to send password reset email to email@example.com
ERROR:    Error in forgot_password: ...
```

### 7️⃣ Consulter le Dashboard Resend

Visitez : https://resend.com/emails

Vous devriez voir :
- La liste de tous les emails envoyés
- Le statut de chaque email (delivered, bounced, etc.)
- Les erreurs éventuelles

**Si aucun email n'apparaît** → L'email n'a pas été envoyé par Resend

**Si l'email apparaît mais statut "bounced"** → Problème avec l'adresse email de destination

### 8️⃣ Vérifier la Boîte Mail

- ✅ Vérifiez le dossier **spam/indésirables**
- ✅ Vérifiez l'onglet **Promotions** (Gmail)
- ✅ Attendez 2-3 minutes (parfois il y a un délai)
- ✅ Vérifiez que c'est bien l'email de votre compte Resend

## 🧪 Test Complet Pas-à-Pas

### Étape 1 : Vérifier votre Email Resend

Connectez-vous sur https://resend.com et notez l'email de votre compte.

**Exemple** : `john.doe@example.com`

### Étape 2 : Créer un Compte avec Cet Email

```bash
# Visitez dans le navigateur
http://localhost:3000/auth/signup

# Créez un compte avec:
Email: john.doe@example.com  # L'email de votre compte Resend
Mot de passe: test123456
Prénom: John
Nom: Doe
Rôle: Candidate
```

### Étape 3 : Tester la Réinitialisation

```bash
# Option A : Via l'interface
http://localhost:3000/auth/forgot-password

# Option B : Via l'API
curl -X POST http://localhost:8001/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "john.doe@example.com"}'
```

### Étape 4 : Vérifier les Logs

Dans le terminal backend, vous devriez voir :
```
INFO:     POST /api/auth/forgot-password
INFO:     Password reset email sent successfully to john.doe@example.com
```

### Étape 5 : Vérifier Resend

Visitez : https://resend.com/emails

Vous devriez voir un nouvel email avec :
- **To** : `john.doe@example.com`
- **Subject** : "Réinitialisation de votre mot de passe INTOWORK"
- **Status** : Delivered ✅

### Étape 6 : Vérifier votre Boîte Mail

Vérifiez `john.doe@example.com` (et le spam).

## 🐛 Problèmes Courants

### Problème 1 : "Email service disabled"

**Symptôme** : Dans les logs backend :
```
WARNING: Email service disabled: RESEND_API_KEY not configured
```

**Solution** :
1. Vérifiez `/backend/.env` contient :
```env
RESEND_API_KEY=re_9PDmb3bu_91NLA4pshg8uYAGRGDveXWPj
```

2. Redémarrez le backend

### Problème 2 : Email Non Envoyé (Domaine Test)

**Symptôme** : Aucun email sur https://resend.com/emails

**Cause** : Vous n'utilisez pas l'email de votre compte Resend

**Solution** : Utilisez **UNIQUEMENT** l'email de votre compte Resend

### Problème 3 : Email Envoyé Mais Non Reçu

**Symptôme** : Email visible sur Resend avec statut "Delivered" mais pas reçu

**Solutions** :
1. Vérifiez spam/indésirables
2. Vérifiez l'onglet Promotions (Gmail)
3. Attendez 5-10 minutes
4. Vérifiez que l'email de destination est correct

### Problème 4 : "Invalid or expired token"

**Symptôme** : Lors du reset avec le lien

**Causes possibles** :
- Token déjà utilisé
- Token expiré (>24h)
- Token invalide

**Solution** : Redemandez un nouveau lien de réinitialisation

### Problème 5 : Utilisateur Inexistant

**Symptôme** : Pas d'erreur, mais pas d'email

**Cause** : L'email n'existe pas dans la base de données

**Solution** :
1. Créez un compte avec cet email
2. Ou vérifiez l'orthographe de l'email

## 🔧 Script de Diagnostic Automatique

Créez un script pour tester tout :

```bash
#!/bin/bash

echo "🔍 Diagnostic Email de Réinitialisation"
echo "======================================"
echo ""

# 1. Backend
echo "1️⃣ Backend..."
if curl -s http://localhost:8001/api/ping > /dev/null 2>&1; then
    echo "   ✅ Backend actif"
else
    echo "   ❌ Backend non actif - Démarrez-le !"
    exit 1
fi

# 2. Service Email
echo "2️⃣ Service Email..."
cd backend
source venv/bin/activate
python -c "
from dotenv import load_dotenv
load_dotenv()
from app.services.email_service import email_service
if email_service.enabled:
    print('   ✅ Service email activé')
else:
    print('   ❌ Service email désactivé')
    print('   → Vérifiez RESEND_API_KEY dans .env')
"

# 3. Email de test
echo "3️⃣ Test d'envoi..."
read -p "   Email de test (email de votre compte Resend): " TEST_EMAIL

curl -s -X POST http://localhost:8001/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_EMAIL\"}" > /dev/null

echo "   ✅ Requête envoyée"
echo ""
echo "🔍 Prochaines vérifications:"
echo "   1. Logs backend (terminal uvicorn)"
echo "   2. https://resend.com/emails"
echo "   3. Boîte mail + spam de: $TEST_EMAIL"
```

Sauvegardez dans `diagnose_email.sh` et exécutez :
```bash
chmod +x diagnose_email.sh
./diagnose_email.sh
```

## 📞 Besoin d'Aide Supplémentaire ?

Si aucune des solutions ci-dessus ne fonctionne :

1. **Vérifiez les logs backend** : Copiez les erreurs exactes
2. **Vérifiez Resend dashboard** : Copiez le statut de l'email
3. **Partagez** :
   - L'email utilisé (caviardé si besoin)
   - Les logs backend
   - Le statut Resend
   - Les messages d'erreur

## ✨ Configuration Idéale

Pour un test réussi :

```
✅ Backend démarré sur :8001
✅ Service email activé (logs)
✅ RESEND_API_KEY configurée
✅ Email = email de votre compte Resend
✅ Utilisateur existe dans la DB
✅ Domaine FROM_EMAIL = onboarding@resend.dev
```

---

🎯 **Suivez ces étapes dans l'ordre et vous trouverez le problème !**
