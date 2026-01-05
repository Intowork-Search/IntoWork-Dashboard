#!/bin/bash

# Script d'Arrêt des Services de Test Local

echo "🛑 ARRÊT DES SERVICES - INTOWORK DASHBOARD"
echo "=========================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

cd /home/jdtkd/IntoWork-Dashboard

# Fonction pour arrêter un service
stop_service() {
    local service_name=$1
    local pid_file=$2

    if [ -f "$pid_file" ]; then
        PID=$(cat "$pid_file")
        if ps -p $PID > /dev/null 2>&1; then
            echo -n "Arrêt de $service_name (PID: $PID)... "
            kill $PID 2>/dev/null
            sleep 2

            # Vérifier si le processus est toujours en cours
            if ps -p $PID > /dev/null 2>&1; then
                echo -e "${YELLOW}Force kill${NC}"
                kill -9 $PID 2>/dev/null
            else
                echo -e "${GREEN}✅ OK${NC}"
            fi

            rm -f "$pid_file"
        else
            echo -e "$service_name: ${YELLOW}Déjà arrêté${NC}"
            rm -f "$pid_file"
        fi
    else
        echo -e "$service_name: ${YELLOW}Aucun PID trouvé${NC}"
    fi
}

# Arrêter le Backend
stop_service "Backend" "logs/backend.pid"

# Arrêter le Frontend
stop_service "Frontend" "logs/frontend.pid"

# Arrêter tous les processus uvicorn et npm qui pourraient rester
echo ""
echo "Nettoyage des processus résiduels..."

# Tuer tous les processus uvicorn sur le port 8001
UVICORN_PIDS=$(lsof -ti:8001 2>/dev/null)
if [ ! -z "$UVICORN_PIDS" ]; then
    echo "Arrêt des processus sur le port 8001..."
    kill $UVICORN_PIDS 2>/dev/null
fi

# Tuer tous les processus next sur le port 3000
NEXT_PIDS=$(lsof -ti:3000 2>/dev/null)
if [ ! -z "$NEXT_PIDS" ]; then
    echo "Arrêt des processus sur le port 3000..."
    kill $NEXT_PIDS 2>/dev/null
fi

echo ""
echo -e "${GREEN}✅ Tous les services sont arrêtés${NC}"
echo ""
echo "📝 Les logs sont conservés dans:"
echo "   • logs/backend.log"
echo "   • logs/frontend.log"
echo ""
echo "🚀 Pour redémarrer:"
echo "   • ./start-test-local.sh"
echo ""
