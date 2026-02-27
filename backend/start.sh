#!/bin/bash

# Railway Startup Script
echo "🚀 Démarrage IntoWork Backend sur Railway..."

# Vérifier les variables d'environnement requises
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL non définie"
    exit 1
fi

if [ -z "$NEXTAUTH_SECRET" ]; then
    echo "❌ NEXTAUTH_SECRET non définie"
    exit 1
fi

# MIGRATIONS TEMPORAIREMENT DÉSACTIVÉES pour investigation
echo "⚠️  Migrations DÉSACTIVÉES temporairement"
echo "   PostgreSQL doit démarrer en premier"

# Exécuter les migrations - COMMENTÉ TEMPORAIREMENT
# echo "📊 Exécution des migrations de base de données..."
# alembic upgrade head
# 
# if [ $? -ne 0 ]; then
#     echo "❌ Erreur lors des migrations"
#     exit 1
# fi
# 
# echo "✅ Migrations terminées"

# Créer le répertoire uploads s'il n'existe pas
mkdir -p uploads/cv

echo "🎯 Démarrage du serveur FastAPI sur le port ${PORT:-8000}"

# Démarrer l'application avec python -m uvicorn (comme en local)
exec python -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1
