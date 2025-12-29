# 🚀 Fix Rapide - Email Non Reçu

## ⚡ Test en 30 Secondes

```bash
cd backend
source venv/bin/activate
python direct_email_test.py
```

Ce script va :
1. ✅ Vérifier votre configuration
2. ✅ Envoyer un email de test DIRECTEMENT via Resend
3. ✅ Vous dire exactement où est le problème

## 🎯 Cause #1 (90% des cas) : Email Incorrect

**Le problème** : Vous n'utilisez pas l'email de votre compte Resend

**La solution** :
1. Connectez-vous sur https://resend.com
2. Notez l'email de votre compte (en haut à droite)
3. Utilisez CET email exactement pour tester

**Pourquoi ?** Avec le domaine de test `onboarding@resend.dev`, Resend n'envoie **QUE** vers l'email de votre compte.

## 🎯 Cause #2 : Utilisateur Inexistant

**Le problème** : L'email n'existe pas dans la base de données

**La solution** :
1. Créez un compte : http://localhost:3000/auth/signup
2. Utilisez l'email de votre compte Resend
3. Retestez la réinitialisation

## 🎯 Cause #3 : Backend Non Démarré

**Test rapide** :
```bash
curl http://localhost:8001/api/ping
```

**Si erreur** :
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8001
```

## 📊 Checklist Ultime

```
□ Backend démarré (curl http://localhost:8001/api/ping marche)
□ Email = email de mon compte Resend
□ Compte créé avec cet email sur /auth/signup
□ Vérifié spam/indésirables
□ Consulté https://resend.com/emails
```

## 🔧 Scripts de Test Disponibles

### 1. Test DIRECT Resend (Recommandé)
```bash
cd backend
source venv/bin/activate
python direct_email_test.py
```
→ Test le plus simple, bypasse l'API

### 2. Test via API
```bash
./test_forgot_password.sh
```
→ Teste toute la chaîne (API + email)

### 3. Test Complet
```bash
cd backend
source venv/bin/activate
python test_email_reset.py
```
→ Test interactif complet

## ⚠️ Rappel Important

**Avec `onboarding@resend.dev` (domaine de test)** :
- ✅ Vous pouvez envoyer à : votre.email@resend-account.com
- ❌ Vous NE pouvez PAS envoyer à : autre.email@gmail.com

**Pour envoyer à n'importe quel email** :
1. Configurez votre propre domaine sur Resend
2. Changez `FROM_EMAIL` dans `backend/.env`
3. Voir `RESEND_SETUP.md` pour les détails

## 🎯 Résolution Étape par Étape

### Étape 1 : Test Direct
```bash
cd backend
source venv/bin/activate
python direct_email_test.py
# Entrez l'email de votre compte Resend
```

**Si ça marche** → Le problème est dans l'API ou la DB
**Si ça ne marche pas** → Le problème est Resend ou la config

### Étape 2 : Si Test Direct Marche

Vérifiez que l'utilisateur existe :
```bash
cd backend
source venv/bin/activate
python -c "
from app.database import SessionLocal
from app.models.base import User
db = SessionLocal()
email = 'VOTRE_EMAIL_ICI'  # Changez ici
user = db.query(User).filter(User.email == email).first()
print('✅ Utilisateur existe' if user else '❌ Utilisateur inexistant - Créez un compte !')
db.close()
"
```

**Si utilisateur inexistant** :
1. Allez sur http://localhost:3000/auth/signup
2. Créez un compte avec l'email de votre compte Resend
3. Retestez

### Étape 3 : Si Test Direct Échoue

Vérifiez la clé API :
```bash
cat backend/.env | grep RESEND_API_KEY
```

Devrait afficher :
```
RESEND_API_KEY=re_9PDmb3bu_91NLA4pshg8uYAGRGDveXWPj
```

**Si pas de clé ou clé invalide** :
1. Visitez https://resend.com/api-keys
2. Créez une nouvelle clé
3. Mettez à jour `backend/.env`
4. Redémarrez le backend

## 📞 Toujours Bloqué ?

1. **Exécutez le test direct** :
```bash
cd backend
source venv/bin/activate
python direct_email_test.py
```

2. **Copiez l'erreur exacte**

3. **Vérifiez** :
   - https://resend.com/emails (logs d'envoi)
   - Logs backend (terminal uvicorn)
   - Spam de votre boîte mail

4. **Documentation complète** : Voir `EMAIL_TROUBLESHOOTING.md`

---

✨ **Dans 99% des cas, c'est l'email qui n'est pas celui du compte Resend !**
