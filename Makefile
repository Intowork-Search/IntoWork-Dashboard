# Makefile pour INTOWORK - Facilite le lancement et la gestion du projet

.PHONY: help dev backend frontend install clean setup stop

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

# Lancer les deux services simultanément
dev:
	@echo "🚀 Démarrage de INTOWORK en mode développement..."
	@./start-dev.sh

# Lancer uniquement le backend
backend:
	@echo "🐍 Démarrage du backend FastAPI..."
	@cd backend && PYTHONPATH=$(PWD)/backend $(PWD)/.venv/bin/python -m uvicorn app.main:app --reload --port 8001

# Lancer uniquement le frontend  
frontend:
	@echo "⚛️  Démarrage du frontend Next.js..."
	@cd frontend && npm run dev

# Installer toutes les dépendances
install: install-backend install-frontend

install-backend:
	@echo "🐍 Installation des dépendances Python..."
	@python -m venv .venv || true
	@.venv/bin/pip install -r backend/requirements.txt

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
