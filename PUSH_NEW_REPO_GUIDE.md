# 🔐 Guide - Pousser vers le Nouveau Repository GitHub

## ⚠️ Problème d'Authentification Détecté

**Erreur** : `Permission denied to badalot/IntoWork-Dashboard.git`

Cela signifie que vous devez configurer l'authentification GitHub.

---

## 🚀 Solutions Rapides

### **Solution 1 : Utiliser SSH (Recommandée)**

#### Étape 1 : Vérifier si vous avez une clé SSH

```bash
ls -la ~/.ssh/id_*.pub
```

**Si vous voyez un fichier** (ex: `id_rsa.pub`, `id_ed25519.pub`) :
- ✅ Vous avez déjà une clé SSH
- Passez à l'Étape 3

**Si vous ne voyez rien** :
- Passez à l'Étape 2

#### Étape 2 : Générer une clé SSH

```bash
# Générer une nouvelle clé SSH
ssh-keygen -t ed25519 -C "votre.email@example.com"

# Appuyez sur Entrée 3 fois (utiliser les valeurs par défaut)

# Démarrer ssh-agent
eval "$(ssh-agent -s)"

# Ajouter la clé à l'agent
ssh-add ~/.ssh/id_ed25519
```

#### Étape 3 : Copier la clé publique

```bash
# Afficher votre clé publique
cat ~/.ssh/id_ed25519.pub

# Ou la copier directement dans le presse-papier (Linux)
cat ~/.ssh/id_ed25519.pub | xclip -selection clipboard
```

#### Étape 4 : Ajouter la clé SSH à GitHub

1. Allez sur : https://github.com/settings/keys
2. Cliquez sur **"New SSH key"**
3. Titre : `IntoWork Development Machine`
4. Collez votre clé publique
5. Cliquez sur **"Add SSH key"**

#### Étape 5 : Changer l'URL du remote en SSH

```bash
# Supprimer le remote HTTPS actuel
git remote remove new-github

# Ajouter avec URL SSH
git remote add new-github git@github.com:badalot/IntoWork-Dashboard.git

# Vérifier
git remote -v
```

#### Étape 6 : Pousser vers le nouveau repo

```bash
git push -u new-github main

# Push toutes les branches
git push new-github --all

# Push les tags
git push new-github --tags
```

---

### **Solution 2 : Utiliser un Personal Access Token (PAT)**

#### Étape 1 : Créer un Personal Access Token

1. Allez sur : https://github.com/settings/tokens
2. Cliquez sur **"Generate new token"** → **"Generate new token (classic)"**
3. Note : `IntoWork Dashboard`
4. Sélectionnez les scopes :
   - ✅ `repo` (tous les sous-scopes)
   - ✅ `workflow` (optionnel pour GitHub Actions)
5. Cliquez sur **"Generate token"**
6. **COPIEZ LE TOKEN** (vous ne pourrez plus le voir après !)

**Exemple de token** :
```
ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### Étape 2 : Utiliser le token dans l'URL

```bash
# Supprimer le remote actuel
git remote remove new-github

# Ajouter avec le token dans l'URL
git remote add new-github https://ghp_votre_token_ici@github.com/badalot/IntoWork-Dashboard.git

# Vérifier
git remote -v
```

#### Étape 3 : Pousser

```bash
git push -u new-github main
```

**⚠️ Inconvénient** : Le token est visible dans `.git/config`

---

### **Solution 3 : Utiliser GitHub CLI (gh)**

#### Étape 1 : Installer GitHub CLI

```bash
# Ubuntu/Debian
sudo apt install gh

# macOS
brew install gh

# Ou télécharger depuis : https://cli.github.com/
```

#### Étape 2 : Authentification

```bash
# Se connecter à GitHub
gh auth login

# Suivre les instructions :
# - Choisir : GitHub.com
# - Protocole : HTTPS ou SSH
# - Authentifier via navigateur
```

#### Étape 3 : Pousser

```bash
git push -u new-github main
```

---

## 🔧 Commandes de Vérification

### Vérifier vos remotes

```bash
git remote -v
```

**Résultat attendu** :
```
new-github  git@github.com:badalot/IntoWork-Dashboard.git (fetch)
new-github  git@github.com:badalot/IntoWork-Dashboard.git (push)
old-origin  https://github.com/Intowork-Search/IntoWork-Dashboard.git (fetch)
old-origin  https://github.com/Intowork-Search/IntoWork-Dashboard.git (push)
origin      https://gitlab.com/badalot/intowork-dashboard.git (fetch)
origin      https://gitlab.com/badalot/intowork-dashboard.git (push)
```

### Tester la connexion SSH

```bash
ssh -T git@github.com
```

**Résultat attendu** :
```
Hi badalot! You've successfully authenticated, but GitHub does not provide shell access.
```

### Vérifier le statut Git

```bash
git status
git log --oneline -5
```

---

## 📋 Récapitulatif des Méthodes

| Méthode | Sécurité | Facilité | Recommandation |
|---------|----------|----------|----------------|
| **SSH** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ✅ **Recommandée** |
| **PAT** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⚠️ OK pour test |
| **GitHub CLI** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ **Très recommandée** |

---

## 🚀 Une Fois Configuré

### Push vers le nouveau repo

```bash
# Push la branche actuelle
git push new-github main

# Push toutes les branches
git push new-github --all

# Push les tags
git push new-github --tags
```

### Push vers TOUS les repos (GitLab + 2 GitHub)

```bash
# Utiliser le script existant (à mettre à jour)
./scripts/push-all.sh

# Ou manuellement
git push origin main           # GitLab
git push old-origin main       # Ancien GitHub
git push new-github main       # Nouveau GitHub
```

---

## 🛠️ Mise à Jour des Scripts Automatiques

Pour inclure le nouveau repo dans vos scripts de push automatique :

### Mettre à jour `scripts/push-all.sh`

Ajouter après la section GitHub :

```bash
# Push to New GitHub
echo ""
echo -e "${BLUE}📤 Pushing to New GitHub (new-github)...${NC}"
if git push new-github "$CURRENT_BRANCH"; then
    echo -e "${GREEN}✅ Successfully pushed to New GitHub${NC}"
else
    echo -e "${RED}❌ Failed to push to New GitHub${NC}"
    exit 1
fi
```

### Mettre à jour `scripts/commit-and-push-all.sh`

Ajouter la même section que ci-dessus.

---

## ⚠️ Points Importants

### Sécurité

- ✅ **SSH** : Clés privées restent sur votre machine
- ⚠️ **PAT** : Ne jamais commit le token dans Git
- ✅ **GitHub CLI** : Authentification sécurisée via OAuth

### Bonnes Pratiques

1. **Utilisez SSH** pour un usage quotidien
2. **Sauvegardez votre clé SSH** (backup de `~/.ssh/`)
3. **Renouvelez les PAT** régulièrement (tous les 3-6 mois)
4. **Configurez 2FA** sur votre compte GitHub

---

## 📞 Besoin d'Aide ?

### Erreur : "Permission denied"

→ Vérifiez que vous êtes bien propriétaire ou collaborateur du repo

### Erreur : "Host key verification failed"

```bash
ssh-keyscan github.com >> ~/.ssh/known_hosts
```

### Erreur : "Could not read from remote repository"

→ Vérifiez votre clé SSH :
```bash
ssh -T git@github.com
```

---

## ✅ Checklist

- [ ] Choisir une méthode d'authentification (SSH recommandée)
- [ ] Configurer l'authentification GitHub
- [ ] Tester la connexion (`ssh -T git@github.com`)
- [ ] Mettre à jour l'URL du remote si nécessaire
- [ ] Push vers le nouveau repo
- [ ] Vérifier que le code est bien sur GitHub
- [ ] Mettre à jour les scripts de push automatique (optionnel)

---

**Une fois configuré, vous pourrez pousser facilement vers vos 3 repositories ! 🚀**

---

*Créé le : 2025-12-29*
*Pour : IntoWork Dashboard*
