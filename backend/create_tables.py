#!/usr/bin/env python3

import sys
import os
from sqlalchemy import create_engine
from dotenv import load_dotenv

# Ajouter le répertoire parent au PYTHONPATH
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import Base
from app.models.base import *

load_dotenv()

def create_tables():
    """Créer toutes les tables manquantes"""
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5433/intowork")
    engine = create_engine(DATABASE_URL)
    
    try:
        # Créer toutes les tables définies dans Base
        Base.metadata.create_all(bind=engine)
        print("✅ Tables créées avec succès!")
        
        # Afficher les tables créées
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        print(f"📋 Tables disponibles: {', '.join(tables)}")
        
    except Exception as e:
        print(f"❌ Erreur lors de la création des tables: {e}")

if __name__ == "__main__":
    create_tables()
