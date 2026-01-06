# GitHub Configuration et Workflows

Ce dossier contient la configuration GitHub pour le projet IntoWork Dashboard.

## 📁 Structure

```
.github/
├── workflows/              # GitHub Actions workflows
│   └── sync-repositories.yml
├── GITLAB_SYNC_SETUP.md   # Guide de configuration GitLab sync
└── README.md              # Ce fichier
```

## 🔄 Workflows GitHub Actions

### sync-repositories.yml

**Description** : Synchronise automatiquement le code entre GitHub et GitLab

**Déclencheurs** :
- Push vers `main`
- Push vers `develop`
- Push vers branches `feature/*`
- Push vers branches `hotfix/*`

**Actions** :
1. Clone le dépôt complet (historique entier)
2. Configure le remote GitLab avec OAuth2
3. Pousse la branche courante vers GitLab
4. Synchronise tous les tags vers GitLab

**Configuration Requise** :
- Secret GitHub : `GITLAB_TOKEN` (voir [GITLAB_SYNC_SETUP.md](./GITLAB_SYNC_SETUP.md))

**Statut Actuel** :
⚠️ Le workflow est **configuré mais le token n'est pas défini**

Le workflow détectera automatiquement l'absence du token et affichera un avertissement sans échouer :
```
⚠️ GITLAB_TOKEN secret is not configured
To enable GitLab sync, add a Personal Access Token to GitHub Secrets
```

## 🔧 Configuration

### Secrets Requis

| Secret | Description | Documentation |
|--------|-------------|---------------|
| `GITLAB_TOKEN` | Personal Access Token GitLab | [GITLAB_SYNC_SETUP.md](./GITLAB_SYNC_SETUP.md) |

### Comment Configurer

1. **Lire le guide complet** : [GITLAB_SYNC_SETUP.md](./GITLAB_SYNC_SETUP.md)
2. **Créer un token GitLab** avec les scopes :
   - `write_repository`
   - `api`
3. **Ajouter le secret dans GitHub** :
   - Settings → Secrets and variables → Actions
   - New repository secret
   - Name: `GITLAB_TOKEN`
   - Value: votre token GitLab

## 🚀 Utilisation

### Synchronisation Automatique

Une fois le token configuré, la synchronisation est **automatique** :

```bash
# 1. Faites vos modifications
git add .
git commit -m "feat: nouvelle fonctionnalité"

# 2. Poussez vers GitHub
git push origin main

# 3. GitHub Actions synchronise automatiquement vers GitLab ✨
```

### Synchronisation Manuelle (Alternative)

Si vous préférez contrôler la synchronisation manuellement :

```bash
# Utiliser les scripts du projet
make push          # Push vers les deux repos
make sync          # Synchroniser les repos

# Ou directement
./scripts/push-all.sh
./scripts/sync-repos.sh
```

## 📊 Monitoring

### Voir les Exécutions du Workflow

Accédez à l'onglet **Actions** sur GitHub :
https://github.com/Intowork-Search/IntoWork-Dashboard/actions

Vous y verrez :
- ✅ Exécutions réussies (code synchronisé)
- ⚠️ Exécutions avec avertissements (token non configuré, mais pas d'erreur)
- ❌ Exécutions échouées (problème d'authentification si token invalide)

### Logs Détaillés

Cliquez sur une exécution pour voir :
- Checkout code
- Push to GitLab
- Sync tags
- Notifications

## 🔒 Sécurité

### Bonnes Pratiques

1. **Ne jamais exposer le token** : Les tokens sont secrets, ne les commitez jamais
2. **Utiliser GitHub Secrets** : Les secrets sont chiffrés et sécurisés
3. **Permissions minimales** : Le token n'a que les permissions nécessaires
4. **Rotation des tokens** : Renouvelez le token périodiquement

### Permissions du Token GitLab

Le token a accès **uniquement** à :
- ✅ `write_repository` : Écriture sur le dépôt GitLab
- ✅ `api` : Gestion des tags et métadonnées
- ❌ Pas d'accès à d'autres projets
- ❌ Pas d'accès administrateur

## 🛠️ Maintenance

### Renouveler le Token Expiré

1. Créez un nouveau token GitLab (voir [GITLAB_SYNC_SETUP.md](./GITLAB_SYNC_SETUP.md))
2. Mettez à jour le secret `GITLAB_TOKEN` dans GitHub
3. Le prochain push testera automatiquement le nouveau token

### Désactiver la Synchronisation

**Option 1** : Ne pas configurer le token
- Le workflow s'exécutera mais affichera un avertissement
- Aucune erreur ne sera générée

**Option 2** : Désactiver le workflow
```bash
mv .github/workflows/sync-repositories.yml .github/workflows/sync-repositories.yml.disabled
git commit -m "chore: disable GitLab sync workflow"
git push
```

## 📚 Documentation

- [Configuration GitLab Sync](./GITLAB_SYNC_SETUP.md) - Guide détaillé de configuration
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [GitLab API Docs](https://docs.gitlab.com/ee/api/)

## 🆘 Support

### Problèmes Courants

| Problème | Solution |
|----------|----------|
| "Authentication failed" | Configurez `GITLAB_TOKEN` (voir [guide](./GITLAB_SYNC_SETUP.md)) |
| "Permission denied" | Vérifiez les scopes du token GitLab |
| Workflow ne se déclenche pas | Vérifiez la branche (main, develop, feature/*, hotfix/*) |

### Contacts

Pour toute question :
1. Consultez [GITLAB_SYNC_SETUP.md](./GITLAB_SYNC_SETUP.md)
2. Vérifiez les [GitHub Actions logs](https://github.com/Intowork-Search/IntoWork-Dashboard/actions)
3. Créez une issue sur GitHub

## 📝 Notes

- Le workflow utilise `--force-with-lease` pour éviter d'écraser des commits distants
- L'historique Git complet est synchronisé (`fetch-depth: 0`)
- La synchronisation est bidirectionnelle (mais déclenchée uniquement depuis GitHub)
