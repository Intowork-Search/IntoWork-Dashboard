# 🚀 Guide Rapide - Push GitHub & GitLab

## ⚡ Commandes Rapides

### Option 1: Makefile (Le plus simple)

```bash
# Commit et push en une commande
make commit MSG="feat: Votre message"

# Ou si déjà commité
make push
```

### Option 2: Script Shell

```bash
# Commit et push
./scripts/commit-and-push-all.sh "feat: Votre message"

# Ou si déjà commité
./scripts/push-all.sh
```

### Option 3: Alias Git

```bash
# Commit et push
git cap "feat: Votre message"

# Ou si déjà commité
git push-all
```

### Option 4: Manuel

```bash
git push origin main
git push old-origin main
```

---

## 📋 Commandes Make Disponibles

| Commande | Description |
|----------|-------------|
| `make push` | Push vers GitHub et GitLab |
| `make commit MSG="message"` | Commit et push vers les deux |
| `make sync` | Synchroniser les deux dépôts |
| `make status-all` | Voir le statut des deux dépôts |

---

## 🎯 Exemples d'Utilisation

### Scénario 1: Vous avez fait des modifications

```bash
# Voir ce qui a changé
git status

# Commiter et pousser vers les deux dépôts
make commit MSG="feat: Add password reset feature"
```

### Scénario 2: Vous avez déjà commité

```bash
# Juste pousser vers les deux dépôts
make push
```

### Scénario 3: Vérifier le statut de synchronisation

```bash
# Voir si vous êtes synchronisé avec les deux remotes
make status-all
```

---

## 🔧 Configuration des Remotes

```
origin      → GitLab  (gitlab.com/badalot/intowork-dashboard.git)
old-origin  → GitHub  (github.com/Intowork-Search/IntoWork-Dashboard.git)
```

---

## 🤖 CI/CD Automatique

Une fois configuré avec les tokens, le CI/CD automatique synchronisera les dépôts :

- **Push sur GitHub** → GitHub Actions pousse vers GitLab
- **Push sur GitLab** → GitLab CI pousse vers GitHub

Voir `DUAL_REPO_AUTOMATION.md` pour la configuration complète.

---

## 📚 Documentation Complète

Pour plus de détails, consultez `DUAL_REPO_AUTOMATION.md`
