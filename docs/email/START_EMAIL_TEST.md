# 🚀 TEST RAPIDE - Email Réinitialisation

## ⚡ En 30 Secondes

### Commandes :

```bash
# Terminal 1 - Backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8001

# Terminal 2 - Frontend
cd frontend
npm run dev

# Navigateur
http://localhost:3000/auth/forgot-password
```

### Email de test :
**Utilisez l'email de votre compte Resend** (limitation du domaine de test)

---

## ✅ Configuration Actuelle

```
✅ Resend API Key: Configurée
✅ Service Email: ACTIVÉ
✅ Domaine: onboarding@resend.dev (test)
✅ Frontend: http://localhost:3000
✅ Backend: http://localhost:8001
```

---

## 📧 Ce que vous allez recevoir

Un email premium INTOWORK avec :
- Design gradient violet moderne
- Bouton de réinitialisation stylisé
- Lien de secours
- Expiration 24h
- Notice de sécurité

---

## 🐛 Problème ?

**Email non reçu ?**
1. Vérifiez spam
2. Utilisez l'email de votre compte Resend
3. Consultez https://resend.com/emails

**Backend ne démarre pas ?**
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

---

## 📚 Documentation Complète

- `EMAIL_CONFIG_READY.md` - État complet
- `RESEND_SETUP.md` - Guide Resend
- `CLAUDE.md` - Architecture

---

✨ **Prêt à tester !** Démarrez backend + frontend et visitez `/auth/forgot-password`
