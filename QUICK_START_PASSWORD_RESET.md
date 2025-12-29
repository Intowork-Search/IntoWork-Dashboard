# Quick Start : Réinitialisation de Mot de Passe

## 🚀 Configuration en 5 minutes

### 1. Installer les dépendances

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configurer Resend (Service d'emails)

**Option A : Développement (sans configuration)**
```env
# backend/.env - Laissez vide pour mode dev
# Les emails seront loggés mais pas envoyés
```

**Option B : Production (emails réels)**
```env
# backend/.env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=onboarding@resend.dev  # Pour tests
FRONTEND_URL=http://localhost:3000
```

Obtenir une clé API Resend :
1. Créer un compte sur [resend.com](https://resend.com)
2. Aller dans Settings > API Keys
3. Créer une nouvelle clé
4. Copier dans `RESEND_API_KEY`

### 3. Appliquer la migration

```bash
cd backend
alembic upgrade head
```

### 4. Démarrer l'application

```bash
# Terminal 1 : Backend
cd backend
uvicorn app.main:app --reload --port 8001

# Terminal 2 : Frontend
cd frontend
npm run dev
```

### 5. Tester

1. Ouvrir `http://localhost:3000/auth/forgot-password`
2. Saisir un email d'un compte existant
3. Vérifier l'email reçu (ou les logs si mode dev)
4. Cliquer sur le lien de réinitialisation
5. Saisir un nouveau mot de passe
6. Se connecter !

## 📁 Fichiers créés

### Backend
- `app/models/base.py` - Modèle PasswordResetToken
- `app/api/auth_routes.py` - Routes forgot-password et reset-password
- `app/services/email_service.py` - Service d'envoi d'emails
- `alembic/versions/g7b1c5d4e3f2_*.py` - Migration DB
- `requirements.txt` - Ajout de resend
- `.env.example` - Variables d'environnement

### Frontend
- `src/app/auth/reset-password/page.tsx` - Page de réinitialisation

### Tests & Docs
- `test_password_reset.py` - Tests complets
- `PASSWORD_RESET_SETUP.md` - Guide détaillé
- `PASSWORD_RESET_IMPLEMENTATION.md` - Documentation technique

## 🔧 Commandes utiles

```bash
# Lancer les tests
cd backend
pytest test_password_reset.py -v

# Vérifier l'état de la migration
cd backend
alembic current

# Tester l'API directement
curl -X POST http://localhost:8001/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

## ❓ Problèmes fréquents

**Email non reçu ?**
- Vérifier que `RESEND_API_KEY` est configuré
- Vérifier les logs backend : `docker-compose logs backend`
- Vérifier le dossier spam

**Token invalide ?**
- Le token expire après 24h
- Le token ne peut être utilisé qu'une fois
- Demander un nouveau token

**Page ne charge pas ?**
- Vérifier que `NEXT_PUBLIC_API_URL` est configuré dans frontend/.env.local
- Vérifier que le backend est démarré sur le port 8001

## 📚 Documentation complète

- **Guide détaillé** : `PASSWORD_RESET_SETUP.md`
- **Documentation technique** : `PASSWORD_RESET_IMPLEMENTATION.md`

## ✅ Checklist avant production

- [ ] Configurer `RESEND_API_KEY` avec une clé réelle
- [ ] Vérifier votre domaine sur Resend
- [ ] Configurer `FROM_EMAIL` avec votre domaine
- [ ] Configurer `FRONTEND_URL` avec votre URL de production
- [ ] Tester le flux complet
- [ ] Configurer un job de nettoyage des tokens expirés
- [ ] Activer HTTPS (recommandé)

---

**Besoin d'aide ?** Consultez `PASSWORD_RESET_SETUP.md` pour plus de détails.
