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

# Appliquer les migrations Alembic (colonnes manquantes, nouveaux champs)
echo "📦 Application des migrations Alembic..."
alembic upgrade head

if [ $? -ne 0 ]; then
    echo "⚠️  Alembic a échoué - tentative avec create_all_tables..."
fi

# Créer les tables de base de données (alternative temporaire à Alembic)
echo "📊 Initialisation de la base de données..."
python create_all_tables.py

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de l'initialisation de la base de données"
    exit 1
fi

echo "✅ Base de données initialisée"

# Initialiser l'utilisateur admin
echo "👤 Initialisation de l'utilisateur admin..."
python init_admin.py

if [ $? -ne 0 ]; then
    echo "⚠️  Avertissement: Impossible de créer l'utilisateur admin"
    # Ne pas bloquer le démarrage si la création de l'admin échoue
fi

# Créer le répertoire uploads s'il n'existe pas
mkdir -p uploads/cv

echo "🎯 Démarrage du serveur FastAPI sur le port ${PORT:-8000}"

# Démarrer l'application avec python -m uvicorn (comme en local)
# --proxy-headers : Respecter X-Forwarded-Proto pour HTTPS (Railway fait du TLS termination)
exec python -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1 --proxy-headers
