#!/bin/bash

# Script de vérification de la configuration Railway
# Ce script aide à diagnostiquer les problèmes de DATABASE_URL

echo "🔍 Vérification de la configuration Railway..."
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction de vérification
check_var() {
    local var_name=$1
    local required=$2
    
    if [ -z "${!var_name}" ]; then
        if [ "$required" = "true" ]; then
            echo -e "${RED}❌ $var_name: NON DÉFINIE (REQUIS)${NC}"
            return 1
        else
            echo -e "${YELLOW}⚠️  $var_name: Non définie (optionnel)${NC}"
            return 0
        fi
    else
        echo -e "${GREEN}✅ $var_name: Définie${NC}"
        # Afficher seulement les 20 premiers caractères pour sécurité
        local value="${!var_name}"
        local preview="${value:0:20}..."
        echo -e "   ${BLUE}→${NC} $preview"
        return 0
    fi
}

# Vérification des variables critiques
echo "📊 Variables d'environnement critiques:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_var "DATABASE_URL" "true"
check_var "NEXTAUTH_SECRET" "true"

echo ""
echo "📊 Variables d'environnement optionnelles:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_var "ENVIRONMENT" "false"
check_var "ALLOWED_ORIGINS" "false"
check_var "FRONTEND_URL" "false"
check_var "RESEND_API_KEY" "false"
check_var "FROM_EMAIL" "false"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Analyse de DATABASE_URL
if [ ! -z "$DATABASE_URL" ]; then
    echo ""
    echo "🔍 Analyse de DATABASE_URL:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Vérifier Railway
    if [[ "$DATABASE_URL" == *"railway"* ]]; then
        echo -e "${GREEN}✅ URL Railway détectée${NC}"
    else
        echo -e "${YELLOW}⚠️  URL non-Railway (base externe?)${NC}"
    fi
    
    # Vérifier SSL
    if [[ "$DATABASE_URL" == *"ssl"* ]] || [[ "$DATABASE_URL" == *"sslmode"* ]]; then
        echo -e "${GREEN}✅ Paramètre SSL détecté dans l'URL${NC}"
    else
        echo -e "${YELLOW}ℹ️  Pas de paramètre SSL dans l'URL (sera ajouté automatiquement par le code)${NC}"
    fi
    
    # Vérifier le protocole
    if [[ "$DATABASE_URL" == postgresql://* ]]; then
        echo -e "${GREEN}✅ Protocole PostgreSQL correct${NC}"
    elif [[ "$DATABASE_URL" == postgres://* ]]; then
        echo -e "${YELLOW}⚠️  Protocole 'postgres://' détecté (devrait être 'postgresql://')${NC}"
    else
        echo -e "${RED}❌ Protocole invalide${NC}"
    fi
    
    # Extraire et afficher les composants (sans le mot de passe)
    if [[ "$DATABASE_URL" =~ postgresql://([^:]+):([^@]+)@([^:]+):([^/]+)/(.+) ]]; then
        local user="${BASH_REMATCH[1]}"
        local host="${BASH_REMATCH[3]}"
        local port="${BASH_REMATCH[4]}"
        local db="${BASH_REMATCH[5]}"
        
        echo -e "${BLUE}   User:${NC} $user"
        echo -e "${BLUE}   Host:${NC} $host"
        echo -e "${BLUE}   Port:${NC} $port"
        echo -e "${BLUE}   DB:${NC} $db"
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test de connexion (seulement si python et psycopg2 disponibles)
if command -v python3 &> /dev/null && [ ! -z "$DATABASE_URL" ]; then
    echo ""
    echo "🧪 Test de connexion à la base de données..."
    
    python3 << 'EOF'
import os
import sys

try:
    # Essayer avec asyncpg (utilisé par l'app)
    try:
        import asyncpg
        import asyncio
        
        async def test_connection():
            try:
                # Extraire l'URL sans le préfixe postgresql://
                db_url = os.getenv('DATABASE_URL')
                if db_url.startswith('postgresql://'):
                    db_url = db_url.replace('postgresql://', '')
                
                # Ajouter SSL si Railway
                if 'railway' in db_url.lower() and 'ssl' not in db_url.lower():
                    if '?' in db_url:
                        db_url += '&ssl=require'
                    else:
                        db_url += '?ssl=require'
                
                # Parser l'URL manuellement pour asyncpg
                import re
                match = re.match(r'([^:]+):([^@]+)@([^:]+):(\d+)/([^?]+)(\?.*)?', db_url)
                if match:
                    user, password, host, port, database, params = match.groups()
                    
                    conn = await asyncpg.connect(
                        user=user,
                        password=password,
                        host=host,
                        port=int(port),
                        database=database.split('?')[0],
                        ssl='require' if 'railway' in host.lower() else None
                    )
                    
                    version = await conn.fetchval('SELECT version()')
                    await conn.close()
                    
                    print(f"\033[0;32m✅ Connexion réussie!\033[0m")
                    print(f"\033[0;34m   PostgreSQL version: {version.split(',')[0]}\033[0m")
                    return True
                else:
                    print("\033[0;31m❌ Impossible de parser l'URL\033[0m")
                    return False
                    
            except Exception as e:
                print(f"\033[0;31m❌ Erreur de connexion: {str(e)}\033[0m")
                return False
        
        result = asyncio.run(test_connection())
        sys.exit(0 if result else 1)
        
    except ImportError:
        print("\033[1;33m⚠️  asyncpg non installé, impossible de tester la connexion\033[0m")
        print("\033[0;34m   Pour installer: pip install asyncpg\033[0m")
        sys.exit(0)
        
except Exception as e:
    print(f"\033[0;31m❌ Erreur lors du test: {str(e)}\033[0m")
    sys.exit(1)
EOF
    
    test_result=$?
else
    echo -e "${YELLOW}⚠️  Python3 non disponible ou DATABASE_URL non définie, test de connexion ignoré${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Résumé
if [ -z "$DATABASE_URL" ] || [ -z "$NEXTAUTH_SECRET" ]; then
    echo -e "${RED}❌ CONFIGURATION INCOMPLÈTE${NC}"
    echo ""
    echo "Actions requises:"
    [ -z "$DATABASE_URL" ] && echo "  1. Définir DATABASE_URL dans Railway"
    [ -z "$NEXTAUTH_SECRET" ] && echo "  2. Définir NEXTAUTH_SECRET dans Railway"
    echo ""
    echo "Consultez RAILWAY_DATABASE_CONFIG.md pour plus de détails"
    exit 1
else
    if [ $test_result -eq 0 ]; then
        echo -e "${GREEN}✅ CONFIGURATION CORRECTE${NC}"
        echo ""
        echo "Vous pouvez déployer sur Railway!"
    else
        echo -e "${YELLOW}⚠️  CONFIGURATION COMPLÈTE MAIS CONNEXION ÉCHOUÉE${NC}"
        echo ""
        echo "Les variables sont définies mais la connexion DB a échoué."
        echo "Vérifiez:"
        echo "  1. Que le serveur PostgreSQL est accessible"
        echo "  2. Que les identifiants sont corrects"
        echo "  3. Que SSL est bien configuré (vérifié automatiquement dans le code)"
    fi
    exit 0
fi
