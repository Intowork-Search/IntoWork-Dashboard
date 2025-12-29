# 🔄 Dual Repository Automation Guide

This document explains how to automatically push your code to both **GitHub** and **GitLab** repositories.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Methods Available](#methods-available)
- [Automatic CI/CD Sync](#automatic-cicd-sync)
- [Git Aliases](#git-aliases)
- [Shell Scripts](#shell-scripts)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Method 1: Using Shell Script (Recommended for Daily Use)

```bash
# Commit and push to both repositories in one command
./scripts/commit-and-push-all.sh "feat: Your commit message"

# Or if changes are already committed
./scripts/push-all.sh
```

### Method 2: Using Git Aliases

```bash
# Commit and push to both repositories
git cap "feat: Your commit message"

# Push existing commits to both repositories
git push-all

# Check sync status
git status-all
```

### Method 3: Manual Push

```bash
git push origin main        # Push to GitLab
git push old-origin main    # Push to GitHub
```

---

## 🎯 Methods Available

### 1️⃣ Automatic CI/CD Sync

**How it works:**
- When you push to GitHub, GitHub Actions automatically syncs to GitLab
- When you push to GitLab, GitLab CI automatically syncs to GitHub

**Files:**
- `.github/workflows/sync-repositories.yml` - GitHub Actions workflow
- `.gitlab-ci.yml` - GitLab CI pipeline

**Setup Required:**
1. Add `GITLAB_TOKEN` secret in GitHub repository settings
2. Add `GITHUB_TOKEN` secret in GitLab CI/CD variables

**Advantages:**
✅ Fully automatic - no manual action needed
✅ Works on any push to main/develop/feature branches
✅ Syncs tags automatically
✅ Error notifications

---

### 2️⃣ Shell Scripts

#### Script 1: `commit-and-push-all.sh`

**One-liner to commit and push to both repos:**

```bash
./scripts/commit-and-push-all.sh "Your commit message here"
```

**Features:**
- Stages all changes
- Creates commit with your message
- Pushes to GitLab (origin)
- Pushes to GitHub (old-origin)
- Shows colorful output with status
- Handles errors gracefully

**Example:**
```bash
./scripts/commit-and-push-all.sh "feat: Add password reset functionality"
```

#### Script 2: `push-all.sh`

**For when you've already committed:**

```bash
./scripts/push-all.sh
```

**Features:**
- Checks for uncommitted changes
- Offers to commit if needed
- Pushes current branch to both remotes
- Pushes tags to both remotes
- Shows sync status

---

### 3️⃣ Git Aliases

**Pre-configured aliases in `~/.gitconfig`:**

#### `git push-all`
Pushes current branch to both GitHub and GitLab:
```bash
git push-all
```

#### `git cap` (Commit And Push)
Commits all changes and pushes to both repositories:
```bash
git cap "Your commit message"
```

#### `git sync`
Alias for `git push-all`:
```bash
git sync
```

#### `git status-all`
Shows sync status with both remotes:
```bash
git status-all
```
Output example:
```
📊 Local status:
## main...origin/main

📍 GitLab (origin):
  Behind: 0 | Ahead: 2
📍 GitHub (old-origin):
  Behind: 0 | Ahead: 2
```

---

## ⚙️ Configuration

### Current Remote Setup

```bash
origin      → GitLab  (gitlab.com/badalot/intowork-dashboard.git)
old-origin  → GitHub  (github.com/Intowork-Search/IntoWork-Dashboard.git)
```

### Verify Configuration

```bash
git remote -v
```

### Change Remote URLs (if needed)

```bash
# Update GitLab URL
git remote set-url origin https://gitlab.com/badalot/intowork-dashboard.git

# Update GitHub URL
git remote set-url old-origin https://github.com/Intowork-Search/IntoWork-Dashboard.git
```

---

## 🔐 CI/CD Secrets Setup

### For GitHub Actions → GitLab Sync

1. Go to GitHub repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `GITLAB_TOKEN`
4. Value: Your GitLab Personal Access Token
   - Go to GitLab → Preferences → Access Tokens
   - Scopes needed: `write_repository`, `api`

### For GitLab CI → GitHub Sync

1. Go to GitLab repository → Settings → CI/CD → Variables
2. Click "Add variable"
3. Key: `GITHUB_TOKEN`
4. Value: Your GitHub Personal Access Token
   - Go to GitHub → Settings → Developer settings → Personal access tokens
   - Scopes needed: `repo` (full control of private repositories)
5. Protect variable: ✅
6. Mask variable: ✅

---

## 🛠️ Pre-commit Hooks

Optional automatic code quality checks before each commit:

### Install pre-commit

```bash
# Install pre-commit tool
pip install pre-commit

# Install hooks
pre-commit install
```

### What it does:
- ✅ Removes trailing whitespace
- ✅ Fixes end of file
- ✅ Checks YAML/JSON syntax
- ✅ Prevents large files (>1MB)
- ✅ Detects private keys
- ✅ Formats Python code (black, isort)
- ✅ Formats JavaScript/TypeScript (prettier)

### Run manually:
```bash
pre-commit run --all-files
```

---

## 📊 Workflow Examples

### Daily Development Workflow

**Option A: Using script**
```bash
# Make changes to code
# ... edit files ...

# Commit and push to both repositories
./scripts/commit-and-push-all.sh "feat: Add new feature"
```

**Option B: Using git alias**
```bash
# Make changes to code
# ... edit files ...

# Commit and push to both repositories
git cap "feat: Add new feature"
```

### Multiple Commits Workflow

```bash
# Make changes and commit multiple times
git add .
git commit -m "feat: Add feature X"
git commit -m "docs: Update README"
git commit -m "fix: Fix bug Y"

# Push all commits to both repositories
git push-all
# or
./scripts/push-all.sh
```

### Feature Branch Workflow

```bash
# Create feature branch
git checkout -b feature/awesome-feature

# Make changes and commit
git add .
git commit -m "feat: Implement awesome feature"

# Push to both repositories
git push-all

# When ready, merge to main
git checkout main
git merge feature/awesome-feature
git push-all
```

---

## 🔍 Troubleshooting

### Issue: "Authentication failed"

**Solution:**
```bash
# For GitLab (if using SSH)
git remote set-url origin git@gitlab.com:badalot/intowork-dashboard.git

# For GitHub (if using SSH)
git remote set-url old-origin git@github.com:Intowork-Search/IntoWork-Dashboard.git
```

### Issue: "Remote already exists"

**Solution:**
```bash
# Remove and re-add remote
git remote remove origin
git remote add origin https://gitlab.com/badalot/intowork-dashboard.git
```

### Issue: "Push rejected"

**Solution:**
```bash
# Fetch latest changes first
git fetch origin
git fetch old-origin

# Merge or rebase
git pull origin main --rebase

# Then push
git push-all
```

### Issue: "Script permission denied"

**Solution:**
```bash
chmod +x scripts/commit-and-push-all.sh
chmod +x scripts/push-all.sh
```

### Issue: "Git aliases not working"

**Solution:**
```bash
# Verify aliases are installed
git config --global --get-regexp alias

# Manually add if missing
git config --global alias.push-all '!f() { git push origin $(git branch --show-current) && git push old-origin $(git branch --show-current); }; f'
```

---

## 🎨 Customization

### Change Commit Message Format

Edit `scripts/commit-and-push-all.sh`:

```bash
# Line 41-43
git commit -m "$COMMIT_MSG

🤖 Your custom footer here
Co-Authored-By: Your Name <your@email.com>"
```

### Add More Remotes

```bash
# Add another remote
git remote add another-remote https://example.com/repo.git

# Update push-all script to include it
# Edit scripts/push-all.sh and add:
git push another-remote "$CURRENT_BRANCH"
```

### Change Branch Filters in CI/CD

Edit `.github/workflows/sync-repositories.yml`:

```yaml
on:
  push:
    branches:
      - main
      - develop
      - staging  # Add your branch
```

---

## 📚 Additional Resources

- [Git Remote Documentation](https://git-scm.com/docs/git-remote)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitLab CI/CD Documentation](https://docs.gitlab.com/ee/ci/)
- [Pre-commit Hooks](https://pre-commit.com/)

---

## 💡 Tips & Best Practices

1. **Always pull before push**: Avoid conflicts by pulling latest changes first
2. **Use meaningful commit messages**: Follow [Conventional Commits](https://www.conventionalcommits.org/)
3. **Check sync status**: Use `git status-all` to verify both remotes are in sync
4. **Use feature branches**: Don't commit directly to main
5. **Test locally**: Always test your code before pushing
6. **Keep remotes in sync**: If one push fails, fix it immediately

---

## 🆘 Need Help?

If you encounter issues:

1. Check this documentation first
2. Run `git status-all` to see sync status
3. Check GitHub Actions logs: https://github.com/Intowork-Search/IntoWork-Dashboard/actions
4. Check GitLab CI logs: https://gitlab.com/badalot/intowork-dashboard/-/pipelines
5. Ask the team in Slack/Discord

---

**Happy Coding! 🚀**

*Last updated: 2025-12-29*
