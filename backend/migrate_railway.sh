#!/bin/bash
# Script pour exécuter les migrations Alembic sur Railway

echo "🚀 Exécution des migrations Alembic sur Railway..."

# Installer railway CLI si nécessaire
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI n'est pas installé"
    echo "📦 Installation: npm i -g @railway/cli"
    echo "🔗 Puis: railway login"
    exit 1
fi

# Se connecter au projet Railway et exécuter les migrations
railway run alembic upgrade head

echo "✅ Migrations terminées!"
