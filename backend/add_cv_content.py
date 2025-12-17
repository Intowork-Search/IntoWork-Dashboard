#!/usr/bin/env python3

import os
import psycopg2
from urllib.parse import urlparse

def add_cv_content_column():
    # URL de la base de données Railway
    database_url = "postgresql://postgres:LEGTciUhAbcfnHJIPyrlFYvTmLJGdiwq@junction.proxy.rlwy.net:26651/railway"
    
    try:
        # Connexion à la base de données
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
        
        print("Connexion à la base de données réussie")
        
        # Ajouter la colonne cv_content si elle n'existe pas
        try:
            cursor.execute("""
                ALTER TABLE candidates 
                ADD COLUMN IF NOT EXISTS cv_content BYTEA;
            """)
            
            conn.commit()
            print("✅ Colonne cv_content ajoutée avec succès")
            
        except Exception as e:
            print(f"Erreur lors de l'ajout de la colonne: {e}")
            conn.rollback()
        
        # Vérifier la structure de la table
        cursor.execute("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'candidates' AND table_schema = 'public'
            ORDER BY ordinal_position;
        """)
        
        columns = cursor.fetchall()
        print("\n📋 Structure actuelle de la table 'candidates':")
        for column_name, data_type in columns:
            print(f"  - {column_name}: {data_type}")
        
        cursor.close()
        conn.close()
        
        print("\n🎉 Migration terminée avec succès !")
        
    except Exception as e:
        print(f"❌ Erreur de connexion: {e}")

if __name__ == "__main__":
    add_cv_content_column()
