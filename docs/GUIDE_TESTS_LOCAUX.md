# 🧪 Guide Complet des Tests Locaux - IntoWork Dashboard

**Date** : 5 janvier 2026
**Durée estimée** : 1h30
**Niveau** : Débutant à Intermédiaire

---

## 📋 Prérequis - Vérification Rapide (5min)

Avant de commencer, vérifiez que tout est prêt :

### 1. PostgreSQL Running
```bash
docker ps | grep postgres
```
**Attendu** : Une ligne avec `postgres:15` et status `Up`

**Si non running** :
```bash
docker start postgres
sleep 3
docker ps | grep postgres
```

### 2. Vérifier les Migrations
```bash
cd /home/jdtkd/IntoWork-Dashboard/backend
source venv/bin/activate
alembic current
```
**Attendu** :
```
g7b1c5d4e3f2 (head)
h8c2d6e5f4g3 (head)
```

### 3. Vérifier les Variables d'Environnement

**Backend** :
```bash
cat backend/.env | grep -E "DATABASE_URL|NEXTAUTH_SECRET|RESEND_API_KEY"
```
**Attendu** : 3 lignes non vides

**Frontend** :
```bash
cat frontend/.env.local | grep -E "NEXTAUTH_SECRET|NEXT_PUBLIC_API_URL"
```
**Attendu** : 2 lignes non vides

---

## 🚀 PHASE 1 : Démarrage Backend (10min)

### Étape 1.1 : Démarrer le Backend
```bash
cd /home/jdtkd/IntoWork-Dashboard/backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8001
```

**Attendu dans le terminal** :
```
INFO:     Uvicorn running on http://127.0.0.1:8001 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

✅ **Checkpoint 1.1** : Le backend démarre sans erreur

### Étape 1.2 : Tester l'API Health Check

**Dans un NOUVEAU terminal** :
```bash
curl http://localhost:8001/api/ping
```

**Attendu** :
```json
{"status":"ok","message":"INTOWORK API is running"}
```

✅ **Checkpoint 1.2** : API répond correctement

### Étape 1.3 : Vérifier la Documentation Swagger

**Dans votre navigateur**, ouvrir :
```
http://localhost:8001/docs
```

**Vérifications** :
- [ ] Page Swagger UI s'affiche
- [ ] Section "auth" avec 4 endpoints visibles
- [ ] Section "users" visible
- [ ] Section "jobs" visible
- [ ] Section "candidates" visible
- [ ] Section "applications" visible

✅ **Checkpoint 1.3** : Swagger documentation accessible

### Étape 1.4 : Tester un Endpoint de Signup

**Dans Swagger UI** :
1. Cliquer sur `POST /api/auth/signup`
2. Cliquer sur "Try it out"
3. Copier ce JSON :
```json
{
  "email": "test-local@example.com",
  "password": "TestPassword123!",
  "first_name": "Test",
  "last_name": "Local",
  "role": "candidate"
}
```
4. Cliquer sur "Execute"

**Attendu** :
- Code `200` ou `400` (si email existe déjà)
- Si `200` : JSON avec `access_token` et `user` object
- Si `400` : Message "Email already registered"

✅ **Checkpoint 1.4** : Endpoint signup fonctionne

---

## 🎨 PHASE 2 : Démarrage Frontend (15min)

### Étape 2.1 : Démarrer le Frontend

**Dans un NOUVEAU terminal** :
```bash
cd /home/jdtkd/IntoWork-Dashboard/frontend
npm run dev
```

**Attendu** :
```
▲ Next.js 16.0.10
- Local:        http://localhost:3000
- Environments: .env.local

✓ Starting...
✓ Ready in 2.5s
```

✅ **Checkpoint 2.1** : Frontend démarre sans erreur

### Étape 2.2 : Vérifier la Page d'Accueil

**Dans votre navigateur**, ouvrir :
```
http://localhost:3000
```

**Vérifications** :
- [ ] Page d'accueil IntoWork s'affiche
- [ ] Aucune erreur dans la console (F12)
- [ ] Boutons "Se connecter" et "S'inscrire" visibles
- [ ] Design responsive (tester en redimensionnant)

✅ **Checkpoint 2.2** : Page d'accueil s'affiche correctement

### Étape 2.3 : Vérifier React Query DevTools

**Dans la console navigateur (F12)** :
1. Ouvrir l'onglet "Console"
2. Chercher des messages React Query

**Dans la page** :
- Chercher l'icône React Query DevTools (coin inférieur gauche)
- Si visible : cliquer dessus pour ouvrir le panneau

✅ **Checkpoint 2.3** : React Query est actif

---

## 🔐 PHASE 3 : Tests d'Authentification (20min)

### Test 3.1 : Inscription (Signup)

1. **Aller sur la page d'inscription** :
   ```
   http://localhost:3000/auth/signup
   ```

2. **Remplir le formulaire** :
   - Email : `testuser-$(date +%s)@example.com` (génère email unique)
   - Mot de passe : `SecureTestPass123!`
   - Prénom : `Test`
   - Nom : `User`
   - Rôle : Candidate

3. **Cliquer sur "S'inscrire"**

**Vérifications** :
- [ ] Indicateur de force du mot de passe s'affiche
- [ ] Mot de passe validé (force > 50%)
- [ ] Redirection vers `/onboarding` après inscription
- [ ] Toast de succès affiché

✅ **Checkpoint 3.1** : Inscription réussie

### Test 3.2 : Onboarding

**Sur la page `/onboarding`** :

1. **Vérifier que l'utilisateur est connecté**
   - Session visible dans React Query DevTools
   - Email affiché dans la navbar

2. **Sélectionner le rôle "Candidate"**
   - Cliquer sur la carte "Je cherche un emploi"
   - Cliquer sur "Continuer"

**Attendu** :
- Redirection vers `/dashboard/candidates`
- Dashboard candidat s'affiche

✅ **Checkpoint 3.2** : Onboarding complété

### Test 3.3 : Déconnexion

1. **Cliquer sur le menu utilisateur** (coin supérieur droit)
2. **Cliquer sur "Déconnexion"**

**Attendu** :
- Redirection vers `/auth/signin`
- Session supprimée
- Toast "Déconnecté avec succès"

✅ **Checkpoint 3.3** : Déconnexion fonctionnelle

### Test 3.4 : Connexion (Signin)

1. **Sur la page `/auth/signin`** :
   - Email : `software@hcexecutive.net`
   - Mot de passe : `NewSecurePass456!` (nouveau mot de passe du test reset)

2. **Cliquer sur "Se connecter"**

**Attendu** :
- Connexion réussie
- Redirection vers `/dashboard`
- Email affiché dans navbar

✅ **Checkpoint 3.4** : Connexion réussie

---

## 🔄 PHASE 4 : Test Password Reset (15min)

### Test 4.1 : Demande de Réinitialisation

1. **Se déconnecter** (si connecté)

2. **Aller sur** :
   ```
   http://localhost:3000/auth/forgot-password
   ```

3. **Entrer l'email** : `software@hcexecutive.net`

4. **Cliquer sur "Envoyer"**

**Attendu** :
- Message : "Si cet email existe, vous recevrez un lien de réinitialisation"
- Toast de confirmation

✅ **Checkpoint 4.1** : Demande envoyée

### Test 4.2 : Récupérer le Token

**Dans un terminal** :
```bash
cd /home/jdtkd/IntoWork-Dashboard/backend
source venv/bin/activate
python3 << 'EOF'
import asyncio
import sys
sys.path.insert(0, '/home/jdtkd/IntoWork-Dashboard/backend')

from dotenv import load_dotenv
load_dotenv()

from app.database import AsyncSessionLocal
from app.models.base import PasswordResetToken, User
from sqlalchemy import select

async def get_token():
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(User).filter(User.email == "software@hcexecutive.net")
        )
        user = result.scalar_one_or_none()

        if user:
            result = await session.execute(
                select(PasswordResetToken)
                .filter(PasswordResetToken.user_id == user.id)
                .filter(PasswordResetToken.used_at.is_(None))
                .order_by(PasswordResetToken.created_at.desc())
            )
            token = result.scalar_one_or_none()

            if token:
                print(f"Token: {token.token}")
                print(f"\nURL complète:")
                print(f"http://localhost:3000/auth/reset-password?token={token.token}")
            else:
                print("❌ Aucun token trouvé")

asyncio.run(get_token())
EOF
```

**Copier le token affiché**

✅ **Checkpoint 4.2** : Token récupéré

### Test 4.3 : Réinitialiser le Mot de Passe

1. **Ouvrir l'URL** (copier depuis le terminal) :
   ```
   http://localhost:3000/auth/reset-password?token=VOTRE_TOKEN
   ```

2. **Entrer un nouveau mot de passe** :
   - Nouveau mot de passe : `TestResetPass789!`
   - Confirmer : `TestResetPass789!`

3. **Cliquer sur "Réinitialiser"**

**Attendu** :
- Message de succès
- Redirection vers `/auth/signin`

✅ **Checkpoint 4.3** : Mot de passe réinitialisé

### Test 4.4 : Se Connecter avec Nouveau Mot de Passe

1. **Sur `/auth/signin`** :
   - Email : `software@hcexecutive.net`
   - Mot de passe : `TestResetPass789!`

2. **Cliquer sur "Se connecter"**

**Attendu** :
- Connexion réussie
- Dashboard affiché

✅ **Checkpoint 4.4** : Nouveau mot de passe fonctionne

---

## 📊 PHASE 5 : Tests Dashboard (20min)

### Test 5.1 : Dashboard Admin

**Prérequis** : Connecté avec `software@hcexecutive.net` (role: admin)

1. **Aller sur** :
   ```
   http://localhost:3000/dashboard/admin
   ```

**Vérifications** :
- [ ] Statistiques affichées (total users, candidates, employers, jobs)
- [ ] Liste des utilisateurs récents
- [ ] Pas d'erreur dans la console
- [ ] React Query cache les données (vérifier DevTools)

✅ **Checkpoint 5.1** : Dashboard admin fonctionne

### Test 5.2 : Recherche de Jobs

1. **Aller sur** :
   ```
   http://localhost:3000/dashboard/jobs
   ```

2. **Tester les filtres** :
   - Type de contrat : Full-time
   - Localisation : Remote
   - Cliquer sur "Filtrer"

**Vérifications** :
- [ ] Liste de jobs s'affiche
- [ ] Filtres appliqués (URL change)
- [ ] React Query met en cache les résultats
- [ ] Pagination fonctionne (si > 10 jobs)

✅ **Checkpoint 5.2** : Recherche de jobs fonctionne

### Test 5.3 : Dashboard Candidat

**Créer un compte candidat** :

1. **Se déconnecter**
2. **S'inscrire** avec :
   - Email : `candidate-test@example.com`
   - Mot de passe : `CandidatePass123!`
   - Rôle : Candidate

3. **Compléter l'onboarding** → Sélectionner "Candidate"

4. **Aller sur** :
   ```
   http://localhost:3000/dashboard/candidates
   ```

**Vérifications** :
- [ ] Profil candidat affiché
- [ ] Section "Mes Candidatures"
- [ ] Section "Mes Compétences"
- [ ] Bouton "Modifier le profil"

✅ **Checkpoint 5.3** : Dashboard candidat accessible

### Test 5.4 : Upload CV

1. **Sur le dashboard candidat**, cliquer sur "Télécharger mon CV"

2. **Sélectionner un fichier PDF** (ou créer un fichier test)

3. **Upload**

**Attendu** :
- Upload réussi
- Nom du fichier affiché
- Date d'upload affichée
- Bouton "Télécharger" visible

✅ **Checkpoint 5.4** : Upload CV fonctionne

---

## 📝 PHASE 6 : Tests Notifications (10min)

### Test 6.1 : Créer une Notification

**Via Swagger UI** :

1. **Ouvrir** `http://localhost:8001/docs`

2. **Se connecter dans Swagger** :
   - Cliquer sur "Authorize" (cadenas en haut)
   - Entrer un token JWT (récupérer depuis la console frontend après connexion)

3. **Appeler** `POST /api/notifications/test` (si endpoint existe)
   **OU créer manuellement en DB** :

```bash
cd /home/jdtkd/IntoWork-Dashboard/backend
source venv/bin/activate
python3 << 'EOF'
import asyncio
import sys
sys.path.insert(0, '/home/jdtkd/IntoWork-Dashboard/backend')

from dotenv import load_dotenv
load_dotenv()

from app.database import AsyncSessionLocal
from app.models.base import Notification, User
from sqlalchemy import select
from datetime import datetime

async def create_notification():
    async with AsyncSessionLocal() as session:
        # Trouver l'utilisateur admin
        result = await session.execute(
            select(User).filter(User.email == "software@hcexecutive.net")
        )
        user = result.scalar_one_or_none()

        if user:
            # Créer notification
            notif = Notification(
                user_id=user.id,
                type="info",
                title="Test Notification",
                message="Ceci est une notification de test",
                is_read=False,
                created_at=datetime.utcnow()
            )
            session.add(notif)
            await session.commit()
            print(f"✅ Notification créée pour user {user.email}")
        else:
            print("❌ Utilisateur non trouvé")

asyncio.run(create_notification())
EOF
```

✅ **Checkpoint 6.1** : Notification créée

### Test 6.2 : Vérifier l'Affichage

1. **Rafraîchir la page du dashboard**

2. **Vérifier le panneau de notifications** :
   - Badge avec nombre de notifications non lues
   - Cliquer sur l'icône de notification
   - Notification de test affichée

✅ **Checkpoint 6.2** : Notifications s'affichent

---

## 🔍 PHASE 7 : Tests Performance (10min)

### Test 7.1 : Vérifier les Indexes

```bash
cd /home/jdtkd/IntoWork-Dashboard/backend
source venv/bin/activate
python3 << 'EOF'
import asyncio
import sys
sys.path.insert(0, '/home/jdtkd/IntoWork-Dashboard/backend')

from dotenv import load_dotenv
load_dotenv()

from app.database import AsyncSessionLocal
from sqlalchemy import text

async def check_performance():
    async with AsyncSessionLocal() as session:
        # Test 1: Query avec index
        result = await session.execute(text("""
            EXPLAIN ANALYZE
            SELECT * FROM jobs
            WHERE status = 'PUBLISHED'
            AND location_type = 'REMOTE'
        """))

        plan = result.fetchall()
        print("✅ Query Plan pour Jobs:")
        for row in plan:
            print(f"   {row[0]}")

        # Vérifier si index est utilisé
        plan_text = '\n'.join([row[0] for row in plan])
        if 'Index Scan' in plan_text or 'Bitmap Index Scan' in plan_text:
            print("\n✅ INDEX UTILISÉ - Performance optimale")
        else:
            print("\n⚠️  INDEX NON UTILISÉ - Vérifier la migration")

asyncio.run(check_performance())
EOF
```

✅ **Checkpoint 7.1** : Indexes utilisés

### Test 7.2 : Temps de Réponse API

```bash
# Test temps de réponse signup
time curl -s -X POST "http://localhost:8001/api/auth/signin" \
  -H "Content-Type: application/json" \
  --data-raw '{"email":"software@hcexecutive.net","password":"TestResetPass789!"}' \
  > /dev/null

# Test temps de réponse jobs
time curl -s "http://localhost:8001/api/jobs?status=PUBLISHED" > /dev/null
```

**Attendu** :
- Signin : < 500ms
- Jobs : < 200ms

✅ **Checkpoint 7.2** : Temps de réponse acceptable

---

## ✅ CHECKLIST FINALE

### Backend ✓
- [ ] PostgreSQL running
- [ ] Migrations appliquées (g7b1c5d4e3f2 + h8c2d6e5f4g3)
- [ ] Backend démarre sans erreur
- [ ] API /ping répond
- [ ] Swagger docs accessible
- [ ] Signup endpoint fonctionne
- [ ] Signin endpoint fonctionne
- [ ] Password reset fonctionne

### Frontend ✓
- [ ] Frontend démarre sans erreur
- [ ] Page d'accueil s'affiche
- [ ] React Query DevTools visible
- [ ] Aucune erreur console
- [ ] Navigation fonctionne
- [ ] Auth flow complet fonctionne

### Features ✓
- [ ] Inscription utilisateur
- [ ] Connexion utilisateur
- [ ] Déconnexion
- [ ] Password reset complet
- [ ] Dashboard admin
- [ ] Dashboard candidat
- [ ] Recherche jobs
- [ ] Upload CV
- [ ] Notifications

### Performance ✓
- [ ] Indexes utilisés
- [ ] Temps de réponse < 500ms
- [ ] React Query cache fonctionne
- [ ] Pas de requêtes N+1

---

## 🐛 Troubleshooting Rapide

### Problème 1 : Backend ne démarre pas

**Erreur** : `ModuleNotFoundError`
```bash
cd backend
pip install -r requirements.txt
```

**Erreur** : `Database connection failed`
```bash
docker start postgres
sleep 3
```

### Problème 2 : Frontend erreurs

**Erreur** : `Module not found`
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Erreur** : `NEXT_PUBLIC_API_URL not defined`
```bash
# Vérifier .env.local
cat frontend/.env.local | grep NEXT_PUBLIC_API_URL
```

### Problème 3 : Auth ne fonctionne pas

**Erreur** : `Invalid token`
```bash
# Vérifier que NEXTAUTH_SECRET est identique backend/frontend
grep NEXTAUTH_SECRET backend/.env
grep NEXTAUTH_SECRET frontend/.env.local
```

### Problème 4 : Migrations pas appliquées

```bash
cd backend
source venv/bin/activate
alembic current  # Vérifier état actuel
alembic upgrade head  # Appliquer toutes migrations
```

---

## 📊 Rapport de Tests

Après avoir complété tous les tests, remplir ce rapport :

```
=== RAPPORT DE TESTS LOCAUX ===
Date: _________________
Durée: _______________

BACKEND:
- PostgreSQL: [ ] OK  [ ] KO
- Migrations: [ ] OK  [ ] KO
- API Health: [ ] OK  [ ] KO
- Swagger: [ ] OK  [ ] KO

FRONTEND:
- Démarrage: [ ] OK  [ ] KO
- Page accueil: [ ] OK  [ ] KO
- React Query: [ ] OK  [ ] KO
- Console: [ ] OK  [ ] KO

AUTHENTIFICATION:
- Signup: [ ] OK  [ ] KO
- Signin: [ ] OK  [ ] KO
- Logout: [ ] OK  [ ] KO
- Password Reset: [ ] OK  [ ] KO

DASHBOARDS:
- Admin: [ ] OK  [ ] KO
- Candidat: [ ] OK  [ ] KO
- Jobs Search: [ ] OK  [ ] KO
- Notifications: [ ] OK  [ ] KO

PERFORMANCE:
- Indexes: [ ] OK  [ ] KO
- Temps réponse: [ ] OK  [ ] KO

TOTAL: ___/20 OK

NOTES:
_________________________________
_________________________________
_________________________________
```

---

## 🚀 Prochaine Étape

Une fois tous les tests validés ✅ :

1. **Créer un tag de version**
   ```bash
   git tag -a v3.0.0 -m "Release v3.0.0: Production ready with React Query, password reset, and performance indexes"
   git push origin v3.0.0
   git push old-origin v3.0.0
   ```

2. **Préparer le déploiement production**
   - Voir `DEPLOYMENT_SUMMARY.md`
   - Vérifier variables d'environnement Railway
   - Configurer domaine Resend

3. **Documentation finale**
   - Organiser fichiers `docs/`
   - Mettre à jour `CHANGELOG.md`
   - Créer release notes

---

**Bonne chance avec vos tests ! 🎉**

Si vous rencontrez des problèmes, consultez la section Troubleshooting ou vérifiez les logs dans les terminaux backend/frontend.
