"""
Script de migration vers Railway PostgreSQL
Crée toutes les tables nécessaires pour INTOWORK
"""

from sqlalchemy import create_engine
from app.models.base import Base
from app.database import get_db
import os
from dotenv import load_dotenv

load_dotenv()

def migrate_to_railway():
    """Migre la base de données vers Railway"""
    
    # URL de la base de données
    database_url = os.getenv("DATABASE_URL")
    
    if not database_url:
        print("❌ DATABASE_URL not found in environment variables")
        return
    
    print("🚀 Connecting to Railway PostgreSQL...")
    print(f"URL: {database_url[:50]}...")
    
    try:
        # Créer l'engine
        engine = create_engine(database_url)
        
        # Tester la connexion
        with engine.connect():
            print("✅ Connection successful!")
        
        # Créer toutes les tables
        print("📋 Creating tables...")
        Base.metadata.create_all(bind=engine)
        print("✅ All tables created successfully!")
        
        # Afficher les tables créées
        print("\n📊 Tables created:")
        for table_name in Base.metadata.tables.keys():
            print(f"  - {table_name}")
            
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = migrate_to_railway()
    if success:
        print("\n🎉 Migration completed successfully!")
        print("You can now use Railway PostgreSQL with your FastAPI app!")
    else:
        print("\n💥 Migration failed. Please check your DATABASE_URL and try again.")
