# Makefile pour INTOWORK - Facilite le lancement et la gestion du projet

.PHONY: help dev backend frontend install clean setup stop push push-all sync commit status-all

# Afficher l'aide par défaut
help:
	@echo "🚀 INTOWORK - Commandes disponibles:"
	@echo "=================================="
	@echo "  make dev      - Lancer backend + frontend en développement"
	@echo "  make backend  - Lancer uniquement le backend FastAPI"
	@echo "  make frontend - Lancer uniquement le frontend Next.js"
	@echo "  make install  - Installer toutes les dépendances"
	@echo "  make setup    - Configuration initiale du projet"
	@echo "  make stop     - Arrêter tous les services"
	@echo "  make clean    - Nettoyer les fichiers temporaires"
	@echo ""
	@echo "🔄 Git - Synchronisation GitHub & GitLab:"
	@echo "  make push     - Push vers GitHub et GitLab"
	@echo "  make commit MSG=\"message\" - Commit et push vers les deux"
	@echo "  make sync     - Synchroniser les deux dépôts"
	@echo "  make status-all - Voir le statut des deux dépôts"
	@echo ""

# Lancer les deux services simultanément
dev:
	@echo "🚀 Démarrage de INTOWORK en mode développement..."
	@./start-dev.sh

# Lancer uniquement le backend
backend:
	@echo "🐍 Démarrage du backend FastAPI..."
	@cd backend && source venv/bin/activate && uvicorn app.main:app --reload --port 8001

# Lancer uniquement le frontend  
frontend:
	@echo "⚛️  Démarrage du frontend Next.js..."
	@cd frontend && npm run dev

# Installer toutes les dépendances
install: install-backend install-frontend

install-backend:
	@echo "🐍 Installation des dépendances Python..."
	@cd backend && python3 -m venv venv || true
	@cd backend && source venv/bin/activate && pip install -r requirements.txt

install-frontend:
	@echo "📦 Installation des dépendances Node.js..."
	@cd frontend && npm install

# Configuration initiale du projet
setup: install
	@echo "🔧 Configuration initiale..."
	@echo "✅ Dépendances installées"
	@echo "💡 Copiez les fichiers .env.example vers .env et configurez vos clés"
	@echo "💡 Lancez 'make dev' pour démarrer le projet"

# Arrêter tous les services
stop:
	@echo "🛑 Arrêt des services INTOWORK..."
	@pkill -f "uvicorn.*8001" || true
	@pkill -f "next-server.*3000" || true
	@echo "✅ Services arrêtés"

# Nettoyer les fichiers temporaires
clean:
	@echo "🧹 Nettoyage des fichiers temporaires..."
	@find . -name "*.pyc" -delete || true
	@find . -name "__pycache__" -type d -exec rm -rf {} + || true
	@cd frontend && rm -rf .next || true
	@echo "✅ Nettoyage terminé"

# ============================================
# Commandes Git - Synchronisation Dual Repo
# ============================================

# Push vers GitHub et GitLab
push:
	@./scripts/push-all.sh

push-all: push

# Commit et push vers les deux dépôts
commit:
	@if [ -z "$(MSG)" ]; then \
		echo "❌ Erreur: Message de commit requis"; \
		echo "Usage: make commit MSG=\"Votre message\""; \
		exit 1; \
	fi
	@./scripts/commit-and-push-all.sh "$(MSG)"

# Synchroniser les deux dépôts
sync: push

# Voir le statut des deux dépôts
status-all:
	@echo "📊 Statut local:"
	@git status -sb
	@echo ""
	@echo "📍 GitLab (origin):"
	@git fetch origin -q 2>/dev/null || true
	@git rev-list --left-right --count origin/$$(git branch --show-current)...HEAD 2>/dev/null | awk '{print "  En retard: "$$1" | En avance: "$$2}' || echo "  ⚠️  Impossible de comparer"
	@echo ""
	@echo "📍 GitHub (old-origin):"
	@git fetch old-origin -q 2>/dev/null || true
	@git rev-list --left-right --count old-origin/$$(git branch --show-current)...HEAD 2>/dev/null | awk '{print "  En retard: "$$1" | En avance: "$$2}' || echo "  ⚠️  Impossible de comparer"
