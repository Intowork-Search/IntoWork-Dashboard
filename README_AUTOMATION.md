# 🤖 Automation de Synchronisation GitHub & GitLab

## ✨ Mise en place terminée !

Votre projet IntoWork Dashboard est maintenant configuré pour pousser automatiquement vers **GitHub** et **GitLab** simultanément.

---

## 🎯 Utilisation Quotidienne

### La commande la plus simple :

```bash
make commit MSG="Votre message de commit"
```

C'est tout ! Cette commande va :
1. ✅ Ajouter tous les fichiers modifiés
2. ✅ Créer un commit avec votre message
3. ✅ Pousser vers GitLab (origin)
4. ✅ Pousser vers GitHub (old-origin)
5. ✅ Afficher un résumé coloré

---

## 📚 Fichiers Créés

### Scripts Shell (dans `/scripts/`)
- `commit-and-push-all.sh` - Commit et push en une commande
- `push-all.sh` - Push vers les deux dépôts

### Workflows CI/CD
- `.github/workflows/sync-repositories.yml` - GitHub Actions
- `.gitlab-ci.yml` - GitLab CI

### Configuration
- `.pre-commit-config.yaml` - Hooks pre-commit
- `.husky/pre-push` - Hooks pre-push
- `Makefile` - Nouvelles commandes make

### Documentation
- `DUAL_REPO_AUTOMATION.md` - Guide complet (15+ pages)
- `QUICK_PUSH_GUIDE.md` - Guide rapide
- `README_AUTOMATION.md` - Ce fichier

---

## 🚀 Commandes Disponibles

### Via Make (Recommandé)
```bash
make commit MSG="feat: Nouvelle fonctionnalité"  # Commit et push
make push                                         # Push seulement
make sync                                         # Synchroniser
make status-all                                   # Vérifier le statut
```

### Via Scripts
```bash
./scripts/commit-and-push-all.sh "Votre message"  # Commit et push
./scripts/push-all.sh                             # Push seulement
```

### Via Git Aliases
```bash
git cap "Votre message"  # Commit and push
git push-all             # Push vers les deux
git sync                 # Alias pour push-all
git status-all           # Statut des deux remotes
```

---

## 🔐 Configuration CI/CD (Optionnelle)

Pour activer la synchronisation automatique via CI/CD :

### Sur GitHub
1. Allez dans Settings → Secrets → Actions
2. Créez `GITLAB_TOKEN` avec votre token GitLab

### Sur GitLab
1. Allez dans Settings → CI/CD → Variables
2. Créez `GITHUB_TOKEN` avec votre token GitHub

**Une fois configuré** : Tout push sur l'un des dépôts synchronise automatiquement l'autre !

---

## 📊 Workflow Typique

```bash
# 1. Faire des modifications
vim backend/app/api/auth_routes.py

# 2. Voir ce qui a changé
git status

# 3. Commit et push vers les deux dépôts
make commit MSG="feat: Amélioration de l'authentification"

# 4. Vérifier que tout est synchronisé
make status-all
```

---

## 💡 Exemples de Messages de Commit

Suivez la convention [Conventional Commits](https://www.conventionalcommits.org/) :

```bash
make commit MSG="feat: Add password reset functionality"
make commit MSG="fix: Resolve authentication bug"
make commit MSG="docs: Update API documentation"
make commit MSG="refactor: Improve database queries"
make commit MSG="test: Add unit tests for auth module"
make commit MSG="chore: Update dependencies"
make commit MSG="style: Format code with prettier"
make commit MSG="perf: Optimize image loading"
```

---

## 🎨 Sortie Colorée

Les scripts utilisent des couleurs pour une meilleure lisibilité :

- 🔵 **Bleu** : Informations
- 🟢 **Vert** : Succès
- 🟡 **Jaune** : Avertissements
- 🔴 **Rouge** : Erreurs

---

## 🔍 Vérifier la Configuration

```bash
# Voir les remotes configurés
git remote -v

# Résultat attendu :
# origin      https://gitlab.com/badalot/intowork-dashboard.git (fetch)
# origin      https://gitlab.com/badalot/intowork-dashboard.git (push)
# old-origin  https://github.com/Intowork-Search/IntoWork-Dashboard.git (fetch)
# old-origin  https://github.com/Intowork-Search/IntoWork-Dashboard.git (push)
```

---

## 🆘 Aide et Dépannage

### Voir toutes les commandes disponibles
```bash
make help
```

### Problème de permissions
```bash
chmod +x scripts/*.sh
```

### Voir le guide complet
```bash
cat DUAL_REPO_AUTOMATION.md
```

### Guide rapide
```bash
cat QUICK_PUSH_GUIDE.md
```

---

## 🎓 Ressources

- **Guide Complet** : `DUAL_REPO_AUTOMATION.md` (configuration détaillée, troubleshooting)
- **Guide Rapide** : `QUICK_PUSH_GUIDE.md` (commandes essentielles)
- **Makefile** : `make help` (liste des commandes)

---

## ✅ Checklist de Démarrage

- [x] Scripts shell créés et exécutables
- [x] Workflows GitHub Actions configurés
- [x] Pipeline GitLab CI configuré
- [x] Git aliases ajoutés
- [x] Makefile mis à jour
- [x] Pre-commit hooks configurés
- [x] Documentation complète rédigée
- [ ] Tokens CI/CD configurés (optionnel)
- [ ] Pre-commit installé localement (optionnel)

---

## 🚀 Prêt à Utiliser !

Vous pouvez maintenant utiliser :

```bash
make commit MSG="feat: Configuration de l'automation dual-repo"
```

Cette commande va créer ce commit et le pousser vers GitHub et GitLab !

---

**Créé le** : 2025-12-29
**Version** : 1.0.0
**Auteur** : IntoWork Team avec Claude Code
