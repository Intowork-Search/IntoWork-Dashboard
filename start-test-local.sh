#!/bin/bash

# Script de Démarrage Rapide pour Tests Locaux
# Lance Backend + Frontend en mode développement

echo "🚀 DÉMARRAGE TESTS LOCAUX - INTOWORK DASHBOARD"
echo "==============================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Fonction pour afficher les étapes
step() {
    echo -e "${BLUE}▶ $1${NC}"
}

# Fonction pour les succès
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Fonction pour les erreurs
error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Fonction pour les warnings
warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ] && [ ! -f "backend/requirements.txt" ]; then
    error "Erreur: Veuillez lancer ce script depuis le répertoire racine du projet"
fi

cd /home/jdtkd/IntoWork-Dashboard

# ÉTAPE 1: Vérifier PostgreSQL
step "Étape 1/5: Vérification PostgreSQL..."
if docker ps | grep -q postgres; then
    success "PostgreSQL est déjà en cours d'exécution"
else
    warning "PostgreSQL n'est pas démarré, démarrage en cours..."
    docker start postgres || error "Impossible de démarrer PostgreSQL"
    sleep 3
    success "PostgreSQL démarré"
fi
echo ""

# ÉTAPE 2: Vérifier les migrations
step "Étape 2/5: Vérification des migrations..."
cd backend
source venv/bin/activate
CURRENT_MIGRATION=$(alembic current 2>/dev/null | grep -E "g7b1c5d4e3f2|h8c2d6e5f4g3" || echo "none")
if [ "$CURRENT_MIGRATION" != "none" ]; then
    success "Migrations à jour: $CURRENT_MIGRATION"
else
    warning "Migrations non appliquées, application en cours..."
    alembic upgrade head || error "Échec de l'application des migrations"
    success "Migrations appliquées"
fi
cd ..
echo ""

# ÉTAPE 3: Vérifier les variables d'environnement
step "Étape 3/5: Vérification des variables d'environnement..."

# Backend .env
if [ ! -f "backend/.env" ]; then
    error "Fichier backend/.env manquant"
fi

# Frontend .env.local
if [ ! -f "frontend/.env.local" ]; then
    warning "Fichier frontend/.env.local manquant, création..."
    cat > frontend/.env.local << 'EOF'
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-min-32-characters-same-as-backend
AUTH_SECRET=your-nextauth-secret-min-32-characters-same-as-backend

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8001/api

# Environment
NODE_ENV=development
EOF
    warning "Fichier .env.local créé, veuillez configurer NEXTAUTH_SECRET"
fi

success "Variables d'environnement OK"
echo ""

# ÉTAPE 4: Créer les fichiers de log
step "Étape 4/5: Préparation des logs..."
mkdir -p logs
touch logs/backend.log logs/frontend.log
success "Fichiers de log créés"
echo ""

# ÉTAPE 5: Démarrer les services
step "Étape 5/5: Démarrage des services..."
echo ""

echo -e "${BLUE}📦 Démarrage du Backend (port 8001)...${NC}"
cd backend
source venv/bin/activate
nohup uvicorn app.main:app --reload --port 8001 > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../logs/backend.pid
cd ..

# Attendre que le backend démarre
sleep 3

# Vérifier que le backend a démarré
if curl -s http://localhost:8001/api/ping > /dev/null 2>&1; then
    success "Backend démarré (PID: $BACKEND_PID)"
else
    error "Échec du démarrage du backend, vérifiez logs/backend.log"
fi
echo ""

echo -e "${BLUE}🎨 Démarrage du Frontend (port 3000)...${NC}"
cd frontend
nohup npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../logs/frontend.pid
cd ..

# Attendre que le frontend démarre
sleep 5

# Vérifier que le frontend a démarré
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    success "Frontend démarré (PID: $FRONTEND_PID)"
else
    warning "Frontend en cours de démarrage, cela peut prendre jusqu'à 30 secondes..."
fi
echo ""

# RÉSUMÉ
echo "================================================"
echo -e "${GREEN}✅ TOUS LES SERVICES SONT DÉMARRÉS${NC}"
echo "================================================"
echo ""
echo "📍 URLs d'accès:"
echo "   • Backend API:  http://localhost:8001/api"
echo "   • Swagger Docs: http://localhost:8001/docs"
echo "   • Frontend:     http://localhost:3000"
echo ""
echo "📊 Process IDs:"
echo "   • Backend:  $BACKEND_PID"
echo "   • Frontend: $FRONTEND_PID"
echo ""
echo "📝 Logs en temps réel:"
echo "   • Backend:  tail -f logs/backend.log"
echo "   • Frontend: tail -f logs/frontend.log"
echo ""
echo "🛑 Pour arrêter les services:"
echo "   • ./stop-test-local.sh"
echo "   OU"
echo "   • kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "🧪 Pour lancer les tests automatisés:"
echo "   • ./test-local-auto.sh"
echo ""
echo "📖 Pour le guide complet des tests manuels:"
echo "   • Ouvrir GUIDE_TESTS_LOCAUX.md"
echo ""
echo -e "${YELLOW}⏳ Attendez 5-10 secondes que le frontend finisse de démarrer${NC}"
echo -e "${YELLOW}   puis ouvrez http://localhost:3000 dans votre navigateur${NC}"
echo ""
