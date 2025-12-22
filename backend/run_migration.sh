#!/bin/bash

# Script pour exécuter la migration de la base de données
# Ajoute le champ "notes" à la table job_applications

echo "🔄 Exécution de la migration..."

cd /home/anna/Documents/IntoWork/backend

# Vérifier si alembic est installé
if ! pip3 show alembic > /dev/null 2>&1; then
    echo "❌ Alembic n'est pas installé"
    echo "Installation d'alembic..."
    pip3 install alembic
fi

# Exécuter la migration
python3 -c "
from alembic import command
from alembic.config import Config

# Configuration
alembic_cfg = Config('alembic.ini')

# Exécuter la migration
print('📝 Application de la migration...')
command.upgrade(alembic_cfg, 'head')
print('✅ Migration terminée avec succès!')
"

echo "✨ La base de données a été mise à jour!"
