# Configuration de la Synchronisation GitLab

Ce guide explique comment configurer le token GitLab pour permettre la synchronisation automatique entre GitHub et GitLab.

## Problème Actuel

Le workflow `sync-repositories.yml` échoue avec l'erreur :
```
HTTP Basic: Access denied
fatal: Authentication failed for 'https://gitlab.com/badalot/intowork-dashboard.git/'
```

Cela signifie que le secret `GITLAB_TOKEN` n'est **pas configuré** dans les GitHub Secrets.

## Solution : Configurer le Token GitLab

### Étape 1 : Créer un Personal Access Token sur GitLab

1. Connectez-vous sur **GitLab.com**
2. Allez dans **Settings** → **Access Tokens** : https://gitlab.com/-/user_settings/personal_access_tokens
3. Cliquez sur **Add new token**

**Configuration du token** :
- **Token name** : `GitHub Actions Sync`
- **Expiration date** : 1 an (ou jamais)
- **Select scopes** (cochez ces permissions) :
  - ✅ `write_repository` - Pour pousser le code
  - ✅ `api` - Pour la gestion des tags

4. Cliquez sur **Create personal access token**
5. **IMPORTANT** : Copiez le token immédiatement (il ne sera plus visible)

### Étape 2 : Ajouter le Token aux GitHub Secrets

1. Allez sur le dépôt GitHub : https://github.com/Intowork-Search/IntoWork-Dashboard
2. Cliquez sur **Settings** (onglet en haut)
3. Dans la barre latérale gauche, cliquez sur **Secrets and variables** → **Actions**
4. Cliquez sur **New repository secret**

**Configuration du secret** :
- **Name** : `GITLAB_TOKEN`
- **Value** : Collez le token GitLab créé à l'étape 1
- Cliquez sur **Add secret**

### Étape 3 : Vérifier la Configuration

Une fois le secret ajouté :

1. Le prochain `git push` vers GitHub déclenchera automatiquement le workflow
2. Le workflow synchronisera :
   - ✅ La branche `main` vers GitLab
   - ✅ Tous les tags vers GitLab
   - ✅ Les branches `develop`, `feature/*`, `hotfix/*`

## Format du Token GitLab

Le workflow utilise le format OAuth2 recommandé par GitLab :
```bash
https://oauth2:${GITLAB_TOKEN}@gitlab.com/badalot/intowork-dashboard.git
```

## Permissions Requises

Le token doit avoir les scopes suivants :
- `write_repository` : Pour pousser les commits et tags
- `api` : Pour la gestion complète du repository

## Désactiver la Synchronisation

Si vous ne souhaitez pas synchroniser avec GitLab :

### Option 1 : Ne pas configurer le token
Le workflow détectera l'absence du token et affichera un avertissement sans échouer.

### Option 2 : Désactiver le workflow
Supprimez ou renommez le fichier :
```bash
rm .github/workflows/sync-repositories.yml
# ou
mv .github/workflows/sync-repositories.yml .github/workflows/sync-repositories.yml.disabled
```

## Dépannage

### Erreur : "Authentication failed"
**Cause** : Token invalide, expiré ou mal configuré
**Solution** :
1. Vérifiez que le secret `GITLAB_TOKEN` existe dans GitHub
2. Créez un nouveau token GitLab avec les bonnes permissions
3. Mettez à jour le secret dans GitHub

### Erreur : "Permission denied"
**Cause** : Le token n'a pas les permissions nécessaires
**Solution** : Recréez le token avec les scopes `write_repository` et `api`

### Le workflow ne se déclenche pas
**Cause** : Le workflow n'est déclenché que sur `push` vers certaines branches
**Solution** : Vérifiez que vous poussez vers `main`, `develop`, ou une branche `feature/*` ou `hotfix/*`

## Tester la Synchronisation

Pour tester manuellement :
```bash
# Créez un commit de test
git commit --allow-empty -m "test: Verify GitLab sync"
git push origin main

# Vérifiez les Actions GitHub
# https://github.com/Intowork-Search/IntoWork-Dashboard/actions
```

## Synchronisation Manuelle (Alternative)

Si vous préférez synchroniser manuellement sans GitHub Actions :

```bash
# Utiliser les scripts existants
make push           # Push vers GitHub et GitLab
make sync          # Synchroniser les deux repos
./scripts/push-all.sh
```

Ces scripts utilisent les remotes Git locaux au lieu du workflow GitHub Actions.

## Notes Importantes

1. **Sécurité** : Ne partagez jamais votre token GitLab publiquement
2. **Expiration** : Pensez à renouveler le token avant son expiration
3. **GitHub Secrets** : Les secrets GitHub sont chiffrés et sécurisés
4. **Workflow** : Le workflow ne s'exécute que sur les branches configurées

## Support

Pour plus d'informations sur GitLab Personal Access Tokens :
- https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html
- https://docs.gitlab.com/ee/user/project/settings/project_access_tokens.html

Pour GitHub Actions Secrets :
- https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions
