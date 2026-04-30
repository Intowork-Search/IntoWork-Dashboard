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

# Auto-stamp alembic si la table alembic_version n'existe pas encore
# (DB créée manuellement avant l'introduction d'Alembic)
echo "🔍 Vérification de l'état Alembic..."
python -c "
import os, sys
try:
    import sqlalchemy as sa
    url = os.environ.get('DATABASE_URL', '')
    # Forcer driver sync pour ce check
    sync_url = url.replace('postgresql+asyncpg://', 'postgresql://')
    if '+asyncpg' not in sync_url and '://' in sync_url:
        sync_url = sync_url.replace('postgresql://', 'postgresql://')
    engine = sa.create_engine(sync_url)
    with engine.connect() as conn:
        result = conn.execute(sa.text(\
            \"SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='alembic_version')\"
        ))
        exists = result.scalar()
        if not exists:
            print('Pas de table alembic_version — stamping à c8f9e3d1b2a4')
            conn.execute(sa.text('CREATE TABLE alembic_version (version_num VARCHAR(32) NOT NULL)'))
            conn.execute(sa.text(\"INSERT INTO alembic_version VALUES ('c8f9e3d1b2a4')\"))
            conn.commit()
        else:
            print('Table alembic_version OK')
    engine.dispose()
except Exception as e:
    print(f'Warning stamp check: {e}')
    sys.exit(0)
"

# Appliquer les migrations Alembic (colonnes manquantes, nouveaux champs)
echo "📦 Application des migrations Alembic..."
alembic upgrade head

if [ $? -ne 0 ]; then
    echo "❌ Alembic upgrade a échoué"
    exit 1
fi

echo "✅ Base de données initialisée"

# Créer le répertoire uploads s'il n'existe pas
mkdir -p uploads/cv

echo "🎯 Démarrage du serveur FastAPI sur le port ${PORT:-8000}"

# Démarrer l'application avec python -m uvicorn (comme en local)
# --proxy-headers : Respecter X-Forwarded-Proto pour HTTPS (Railway fait du TLS termination)
exec python -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1 --proxy-headers
