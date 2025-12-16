#!/bin/bash

# Script pour lancer le backend FastAPI et le frontend Next.js simultanément
# Usage: ./start-dev.sh

set -e

echo "🚀 Démarrage de INTOWORK - Environnement de développement"
echo "=================================================="

# Fonction pour nettoyer les processus en arrière-plan
cleanup() {
    echo ""
    echo "🛑 Arrêt des services..."
    # Tuer tous les processus enfants
    jobs -p | xargs -r kill
    exit 0
}

# Intercepter Ctrl+C pour nettoyer proprement
trap cleanup SIGINT SIGTERM

# Vérifier que nous sommes dans le bon répertoire
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Erreur: Ce script doit être exécuté depuis le répertoire racine du projet IntoWork"
    echo "   Répertoires requis: backend/ et frontend/"
    exit 1
fi

# Vérifier que l'environnement virtuel Python existe
if [ ! -d ".venv" ]; then
    echo "❌ Erreur: Environnement virtuel Python non trouvé (.venv)"
    echo "   Créez l'environnement virtuel d'abord avec: python -m venv .venv"
    exit 1
fi

# Vérifier que node_modules existe dans le frontend
if [ ! -d "frontend/node_modules" ]; then
    echo "❌ Erreur: Dépendances Node.js non installées"
    echo "   Installez les dépendances avec: cd frontend && npm install"
    exit 1
fi

echo "✅ Vérifications préliminaires réussies"
echo ""

# Démarrer le backend FastAPI en arrière-plan
echo "🐍 Démarrage du backend FastAPI (port 8001)..."
cd backend
PYTHONPATH=/home/anna/Documents/IntoWork/backend /home/anna/Documents/IntoWork/.venv/bin/python -m uvicorn app.main:app --reload --port 8001 &
BACKEND_PID=$!
cd ..

# Attendre que le backend soit prêt
echo "⏳ Attente du démarrage du backend..."
sleep 3

# Démarrer le frontend Next.js en arrière-plan
echo "⚛️  Démarrage du frontend Next.js (port 3000)..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "🎉 Services démarrés avec succès !"
echo "=================================================="
echo "🐍 Backend FastAPI: http://localhost:8001"
echo "   - API Docs: http://localhost:8001/docs"
echo "   - Health Check: http://localhost:8001/api/ping"
echo ""
echo "⚛️  Frontend Next.js: http://localhost:3000"
echo "   - Application: http://localhost:3000"
echo "   - Sign In: http://localhost:3000/sign-in"
echo ""
echo "📊 Monitoring:"
echo "   - Backend PID: $BACKEND_PID"
echo "   - Frontend PID: $FRONTEND_PID"
echo ""
echo "💡 Pour arrêter les services: Ctrl+C"
echo "=================================================="

# Attendre indéfiniment (les processus tournent en arrière-plan)
wait
