# 🧭 Navigation Rapide - Documentation IntoWork

## ⚡ Accès Ultra-Rapide

### 🎯 Je veux...

| Objectif | Fichier à consulter | Commande |
|----------|---------------------|----------|
| **Démarrer le projet** | [`guides/START_HERE.md`](guides/START_HERE.md) | `cat docs/guides/START_HERE.md` |
| **Déployer sur Railway** | [`deployment/RAILWAY_DEPLOYMENT_GUIDE.md`](deployment/RAILWAY_DEPLOYMENT_GUIDE.md) | `cat docs/deployment/RAILWAY_DEPLOYMENT_GUIDE.md` |
| **Push GitHub + GitLab** | [`git-automation/QUICK_PUSH_GUIDE.md`](git-automation/QUICK_PUSH_GUIDE.md) | `make commit MSG="message"` |
| **Configurer email** | [`email/RESEND_SETUP.md`](email/RESEND_SETUP.md) | `cat docs/email/RESEND_SETUP.md` |
| **Password reset** | [`authentication/PASSWORD_RESET_SUMMARY.md`](authentication/PASSWORD_RESET_SUMMARY.md) | `cat docs/authentication/PASSWORD_RESET_SUMMARY.md` |
| **Voir tous les docs** | [`README.md`](README.md) | `cat docs/README.md` |

---

## 📂 Navigation par Dossier

```bash
# Déploiement
cd docs/deployment/ && ls

# Authentification
cd docs/authentication/ && ls

# Email
cd docs/email/ && ls

# Git automation
cd docs/git-automation/ && ls

# Design
cd docs/design/ && ls

# Guides
cd docs/guides/ && ls

# API
cd docs/api/ && ls
```

---

## 🔍 Recherche Rapide

```bash
# Chercher un mot-clé dans tous les docs
grep -r "votre_mot_clé" docs/

# Exemples:
grep -r "Railway" docs/
grep -r "Resend" docs/
grep -r "password" docs/
grep -r "deploy" docs/
```

---

## ⭐ Top 5 des Docs les Plus Utiles

1. **[`docs/README.md`](README.md)** - Index complet de toute la doc
2. **[`git-automation/QUICK_PUSH_GUIDE.md`](git-automation/QUICK_PUSH_GUIDE.md)** - Push dual-repo en une commande
3. **[`deployment/RAILWAY_DEPLOYMENT_GUIDE.md`](deployment/RAILWAY_DEPLOYMENT_GUIDE.md)** - Déploiement complet
4. **[`guides/START_HERE.md`](guides/START_HERE.md)** - Point de départ
5. **[`authentication/PASSWORD_RESET_SUMMARY.md`](authentication/PASSWORD_RESET_SUMMARY.md)** - Reset password

---

## 🚀 Commandes Make les Plus Utilisées

```bash
# Développement
make dev                         # Lancer backend + frontend
make help                        # Voir toutes les commandes

# Git (push dual-repo)
make commit MSG="feat: message"  # Commit et push GitHub + GitLab
make push                        # Push vers les deux dépôts
make status-all                  # Vérifier statut de sync

# Maintenance
make clean                       # Nettoyer fichiers temporaires
make install                     # Installer dépendances
```

---

## 📚 Structure Complète

```
docs/
├── README.md                    # 🏠 INDEX PRINCIPAL
├── NAVIGATION_RAPIDE.md         # 🧭 Ce fichier
│
├── deployment/                  # 🚢 10 fichiers
├── authentication/              # 🔐 7 fichiers
├── email/                       # 📧 11 fichiers
├── git-automation/              # 🔄 3 fichiers
├── design/                      # 🎨 3 fichiers
├── guides/                      # 📚 7 fichiers
└── api/                         # 🔌 1 fichier
```

**Total** : 43 fichiers organisés

---

## 💡 Conseils

- ✅ Commencez toujours par [`docs/README.md`](README.md)
- ✅ Utilisez `make help` pour voir les commandes disponibles
- ✅ Les guides rapides ont "QUICK" dans leur nom
- ✅ Recherchez avec `grep -r "mot" docs/` pour trouver rapidement

---

**Mise à jour** : 2025-12-29
