#!/usr/bin/env python3
"""
Script pour créer toutes les tables directement depuis les modèles SQLAlchemy
Utilisé comme alternative temporaire aux migrations Alembic cassées
"""
import asyncio
import sys
from sqlalchemy import inspect
from app.database import async_engine, Base
from app.models.base import *  # Import tous les modèles

async def create_all_tables():
    """Créer toutes les tables définies dans les modèles"""
    try:
        print("🔍 Vérification de la connexion à la base de données...")
        
        # Test de connexion
        async with async_engine.begin() as conn:
            print("✅ Connexion à la base de données réussie")
            
            # Créer toutes les tables
            print("📊 Création de toutes les tables...")
            await conn.run_sync(Base.metadata.create_all)
            
            # Lister les tables créées
            def get_tables(sync_conn):
                inspector = inspect(sync_conn)
                return inspector.get_table_names()
            
            tables = await conn.run_sync(get_tables)
            print(f"\n✅ Tables créées avec succès ({len(tables)} tables):")
            for table in sorted(tables):
                print(f"   - {table}")
        
        print("\n🎉 Initialisation de la base de données terminée!")
        return 0
        
    except Exception as e:
        print(f"\n❌ Erreur lors de la création des tables: {e}")
        import traceback
        traceback.print_exc()
        return 1
    finally:
        await async_engine.dispose()

if __name__ == "__main__":
    exit_code = asyncio.run(create_all_tables())
    sys.exit(exit_code)
