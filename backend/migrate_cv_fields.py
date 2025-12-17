#!/usr/bin/env python3
"""
Script pour appliquer manuellement les modifications de schéma de base de données
Utilise directement psycopg2 pour se connecter à Railway
"""

import psycopg2
import os
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

def apply_cv_fields_migration():
    """Appliquer la migration pour ajouter les champs CV à Railway"""
    
    # URL de connexion Railway
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("❌ DATABASE_URL non trouvée dans les variables d'environnement")
        return False
    
    try:
        # Connexion à la base de données Railway
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
        
        # Ajouter la colonne cv_filename si elle n'existe pas
        cursor.execute("""
            ALTER TABLE candidates 
            ADD COLUMN IF NOT EXISTS cv_filename VARCHAR;
        """)
        
        # Ajouter la colonne cv_uploaded_at si elle n'existe pas
        cursor.execute("""
            ALTER TABLE candidates 
            ADD COLUMN IF NOT EXISTS cv_uploaded_at TIMESTAMP WITH TIME ZONE;
        """)
        
        # Confirmer les changements
        conn.commit()
        
        # Fermer la connexion
        cursor.close()
        conn.close()
        
        print("✅ Migration appliquée avec succès : champs CV ajoutés à la table candidates")
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors de la migration : {e}")
        return False

if __name__ == "__main__":
    print("🔄 Application de la migration des champs CV vers Railway...")
    success = apply_cv_fields_migration()
    
    if success:
        print("🎉 Migration terminée avec succès !")
    else:
        print("💥 Échec de la migration")
