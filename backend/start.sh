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

# Migrations désactivées temporairement (tables déjà créées)
# echo "📊 Exécution des migrations de base de données..."
# python -m alembic upgrade head

echo "✅ Migrations ignorées (tables déjà existantes)"

# Créer le répertoire uploads s'il n'existe pas
mkdir -p uploads/cv

echo "🎯 Démarrage du serveur FastAPI sur le port ${PORT:-8000}"

# Démarrer l'application
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1
