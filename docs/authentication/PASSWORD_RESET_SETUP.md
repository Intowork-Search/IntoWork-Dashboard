# Guide de Configuration : Réinitialisation de Mot de Passe

Ce document décrit la configuration et l'utilisation du système de réinitialisation de mot de passe de l'application INTOWORK Dashboard.

## Vue d'ensemble

Le système de réinitialisation de mot de passe permet aux utilisateurs de récupérer l'accès à leur compte en cas d'oubli de leur mot de passe. Il utilise :

- **Backend** : FastAPI avec génération de tokens sécurisés
- **Email** : Service Resend pour l'envoi d'emails HTML professionnels
- **Base de données** : PostgreSQL pour stocker les tokens de réinitialisation
- **Frontend** : Next.js 14 avec interfaces utilisateur cohérentes

## Architecture

### Flux complet

```
1. User demande réinitialisation (/auth/forgot-password)
   ↓
2. Backend génère token sécurisé (secrets.token_urlsafe)
   ↓
3. Token stocké en DB (expire après 24h)
   ↓
4. Email envoyé avec lien de réinitialisation
   ↓
5. User clique sur lien (/auth/reset-password?token=xxx)
   ↓
6. User saisit nouveau mot de passe
   ↓
7. Backend valide token et met à jour password
   ↓
8. Token marqué comme utilisé
   ↓
9. Redirect vers /auth/signin
```

### Sécurité implémentée

- **Token cryptographique** : `secrets.token_urlsafe(32)` (43 caractères)
- **Expiration stricte** : 24 heures après création
- **Usage unique** : Token marqué comme utilisé après réinitialisation
- **Invalidation des anciens tokens** : Seul le token le plus récent est valide
- **Ne révèle pas l'existence d'email** : Toujours retourne un succès
- **Validation du mot de passe** : Minimum 8 caractères requis
- **Hash bcrypt** : Mots de passe hashés avec bcrypt

## Configuration Backend

### 1. Installation des dépendances

```bash
cd backend
pip install -r requirements.txt
```

Le package `resend>=0.8.0` est inclus dans requirements.txt.

### 2. Variables d'environnement

Créez ou modifiez votre fichier `backend/.env` :

```env
# Email Configuration (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=INTOWORK <noreply@intowork.com>
FRONTEND_URL=http://localhost:3000  # ou https://votre-domaine.com en production
```

**Obtenir une clé API Resend :**

1. Créez un compte sur [resend.com](https://resend.com)
2. Vérifiez votre domaine (ou utilisez le domaine de test pour dev)
3. Générez une clé API dans Settings > API Keys
4. Copiez la clé (format : `re_xxxxxxxxx`)

**Configuration de l'email expéditeur :**

- **Développement** : Utilisez `onboarding@resend.dev` (pas de vérification requise)
- **Production** : Utilisez votre domaine vérifié (ex: `noreply@votre-domaine.com`)

### 3. Migration de la base de données

Appliquez la migration pour créer la table `password_reset_tokens` :

```bash
cd backend

# Si vous utilisez alembic directement
alembic upgrade head

# Ou via docker-compose
docker-compose exec backend alembic upgrade head
```

**Structure de la table créée :**

```sql
CREATE TABLE password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    token VARCHAR NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX ix_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE UNIQUE INDEX ix_password_reset_tokens_token ON password_reset_tokens(token);
```

### 4. Vérification de la configuration

Testez que le service email est correctement configuré :

```python
# Test simple dans la console Python
from app.services.email_service import email_service

if email_service.enabled:
    print("✓ Email service is enabled and configured")
else:
    print("✗ Email service is disabled - check RESEND_API_KEY")
```

## Configuration Frontend

Aucune configuration spécifique n'est requise pour le frontend. Les pages sont déjà créées :

- `/auth/forgot-password` - Formulaire de demande de réinitialisation
- `/auth/reset-password?token=xxx` - Formulaire de nouveau mot de passe

Assurez-vous que la variable `NEXT_PUBLIC_API_URL` pointe vers votre backend :

```env
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8001/api
```

## Utilisation

### 1. Demander une réinitialisation

**Interface utilisateur :**
- Aller sur `/auth/forgot-password`
- Saisir l'adresse email
- Cliquer sur "Envoyer le lien"
- Vérifier l'email reçu

**API directe :**

```bash
curl -X POST http://localhost:8001/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

**Réponse (toujours la même pour sécurité) :**

```json
{
  "message": "If this email exists in our system, you will receive password reset instructions shortly."
}
```

### 2. Réinitialiser le mot de passe

**Interface utilisateur :**
- Cliquer sur le lien dans l'email reçu
- Saisir le nouveau mot de passe (min 8 caractères)
- Confirmer le mot de passe
- Cliquer sur "Réinitialiser le mot de passe"
- Redirection automatique vers `/auth/signin`

**API directe :**

```bash
curl -X POST http://localhost:8001/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "new_password": "MonNouveauMotDePasse123!"
  }'
```

**Réponse succès :**

```json
{
  "message": "Password reset successfully. You can now sign in with your new password."
}
```

**Réponses d'erreur possibles :**

```json
// Token invalide ou expiré
{
  "detail": "Invalid or expired reset token"
}

// Token déjà utilisé
{
  "detail": "This reset token has already been used"
}

// Mot de passe trop court
{
  "detail": "Password must be at least 8 characters long"
}
```

## Template Email

L'email envoyé contient :

- **Header brandé** avec logo INTOWORK
- **Bouton CTA principal** "Réinitialiser mon mot de passe"
- **Lien en texte brut** (fallback si bouton ne fonctionne pas)
- **Notice d'expiration** (24 heures)
- **Avertissement de sécurité** (ignorer si non demandé)
- **Footer** avec liens utiles et mentions légales
- **Design responsive** adapté mobile et desktop

Le template est personnalisé avec :
- Nom de l'utilisateur (si disponible)
- Lien de réinitialisation unique
- URL du frontend configuré

## Maintenance et Monitoring

### Nettoyage des tokens expirés

Il est recommandé de nettoyer périodiquement les tokens expirés :

```sql
-- Supprimer les tokens expirés de plus de 7 jours
DELETE FROM password_reset_tokens
WHERE expires_at < NOW() - INTERVAL '7 days';
```

Vous pouvez créer une tâche CRON ou un job Celery pour automatiser cela.

### Logs

Les événements importants sont loggés :

```python
# Succès d'envoi d'email
logger.info(f"Password reset email sent successfully to {email}")

# Échec d'envoi d'email
logger.error(f"Failed to send password reset email to {email}")

# Réinitialisation réussie
logger.info(f"Password successfully reset for user {user.email}")
```

Consultez les logs avec :

```bash
# Docker
docker-compose logs -f backend

# Local
tail -f backend/logs/app.log
```

### Métriques à surveiller

- **Taux d'envoi d'emails** : Nombre de forgot-password par jour
- **Taux d'utilisation des tokens** : Ratio tokens utilisés / tokens créés
- **Temps moyen de réinitialisation** : created_at → used_at
- **Taux d'expiration** : Tokens expirés avant utilisation

## Troubleshooting

### Email non reçu

**Problème** : L'utilisateur ne reçoit pas l'email

**Solutions** :

1. Vérifier que RESEND_API_KEY est configuré
2. Vérifier les logs backend pour erreurs d'envoi
3. Vérifier le dossier spam/promotions
4. Vérifier que le domaine FROM_EMAIL est vérifié (en production)
5. Tester l'API Resend directement

```python
import resend
resend.api_key = "re_xxxxx"
response = resend.Emails.send({
    "from": "onboarding@resend.dev",
    "to": ["test@example.com"],
    "subject": "Test",
    "html": "<p>Test email</p>"
})
print(response)
```

### Token invalide ou expiré

**Problème** : Message "Invalid or expired reset token"

**Causes possibles** :

1. Token déjà utilisé (vérifier `used_at`)
2. Token expiré (vérifier `expires_at`)
3. Token n'existe pas en base
4. Mauvais format de token (URL encodage)

**Vérification en DB :**

```sql
SELECT
    id,
    user_id,
    token,
    expires_at,
    used_at,
    created_at,
    (expires_at > NOW()) as is_valid,
    (used_at IS NULL) as not_used
FROM password_reset_tokens
WHERE token = 'xxx'
ORDER BY created_at DESC;
```

### Email service disabled

**Problème** : Logs montrent "Email service disabled"

**Solutions** :

1. Installer resend : `pip install resend`
2. Configurer RESEND_API_KEY dans .env
3. Redémarrer le backend
4. Vérifier avec `email_service.enabled`

### Frontend ne charge pas la page

**Problème** : Erreur lors du chargement de /auth/reset-password

**Solutions** :

1. Vérifier que le token est présent dans l'URL
2. Vérifier les logs du navigateur (F12)
3. Vérifier que NEXT_PUBLIC_API_URL est configuré
4. Tester l'API backend directement

## Sécurité : Best Practices

### ✓ Implémenté

- Token cryptographiquement sécurisé (43 caractères)
- Expiration après 24 heures
- Usage unique du token
- Ne révèle pas si email existe
- Hash bcrypt des mots de passe
- Validation longueur minimale (8 chars)
- HTTPS recommandé en production

### Améliorations possibles (optionnel)

- **Rate limiting** : Limiter à 3 requêtes/heure par IP
- **Hash du token en DB** : Stocker hash(token) au lieu du token brut
- **Email de confirmation** : Notifier après changement réussi
- **2FA** : Demander code 2FA avant reset
- **Historique des mots de passe** : Empêcher réutilisation

## Tests

### Tests unitaires

Lancez les tests avec :

```bash
cd backend
pytest test_password_reset.py -v
```

Les tests couvrent :
- Demande de réinitialisation avec email valide
- Demande avec email invalide (ne doit pas échouer)
- Réinitialisation avec token valide
- Réinitialisation avec token expiré
- Réinitialisation avec token déjà utilisé
- Validation du mot de passe

### Tests manuels

**Scénario 1 : Flux complet**

1. Créer un utilisateur de test
2. Demander réinitialisation via UI
3. Vérifier email reçu
4. Cliquer sur lien dans email
5. Saisir nouveau mot de passe
6. Se connecter avec nouveau mot de passe

**Scénario 2 : Token expiré**

1. Demander réinitialisation
2. Modifier `expires_at` en DB (passer au passé)
3. Essayer d'utiliser le token
4. Vérifier message d'erreur

**Scénario 3 : Token déjà utilisé**

1. Demander réinitialisation
2. Réinitialiser le mot de passe une fois
3. Essayer de réutiliser le même token
4. Vérifier message d'erreur

## Support et Contact

Pour toute question ou problème :

- **Issues GitHub** : Créer une issue avec le tag `password-reset`
- **Email support** : support@intowork.com
- **Documentation** : /docs/password-reset

## Changelog

### Version 1.0.0 (2025-12-26)

- Implémentation initiale du système de réinitialisation
- Service email avec Resend
- Templates HTML professionnels
- Pages frontend cohérentes avec l'UI existante
- Migration Alembic pour table password_reset_tokens
- Documentation complète et tests
