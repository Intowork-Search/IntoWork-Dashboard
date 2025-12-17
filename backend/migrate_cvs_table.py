#!/usr/bin/env python3

import os
import psycopg2
from urllib.parse import urlparse

def create_candidate_cvs_table():
    # URL de la base de données Railway
    database_url = "postgresql://postgres:LEGTciUhAbcfnHJIPyrlFYvTmLJGdiwq@junction.proxy.rlwy.net:26651/railway"
    
    try:
        # Connexion à la base de données
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
        
        print("Connexion à la base de données réussie")
        
        # Créer la nouvelle table candidate_cvs
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS candidate_cvs (
                id SERIAL PRIMARY KEY,
                candidate_id INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
                filename VARCHAR NOT NULL,
                file_path VARCHAR NOT NULL,
                file_size INTEGER,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        """)
        
        # Créer les index
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_candidate_cvs_candidate_id ON candidate_cvs(candidate_id);
            CREATE INDEX IF NOT EXISTS idx_candidate_cvs_is_active ON candidate_cvs(is_active);
        """)
        
        # Migrer les CV existants de la table candidates vers candidate_cvs
        cursor.execute("""
            INSERT INTO candidate_cvs (candidate_id, filename, file_path, is_active, created_at)
            SELECT 
                id as candidate_id,
                cv_filename as filename,
                cv_url as file_path,
                TRUE as is_active,
                cv_uploaded_at as created_at
            FROM candidates 
            WHERE cv_filename IS NOT NULL AND cv_url IS NOT NULL
            ON CONFLICT DO NOTHING;
        """)
        
        conn.commit()
        print("✅ Table candidate_cvs créée et données migrées avec succès")
        
        # Vérifier les données migrées
        cursor.execute("SELECT COUNT(*) FROM candidate_cvs")
        count = cursor.fetchone()[0]
        print(f"📊 {count} CV(s) migré(s) dans la nouvelle table")
        
        # Afficher la structure de la nouvelle table
        cursor.execute("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'candidate_cvs' AND table_schema = 'public'
            ORDER BY ordinal_position;
        """)
        
        columns = cursor.fetchall()
        print("\n📋 Structure de la table 'candidate_cvs':")
        for column_name, data_type in columns:
            print(f"  - {column_name}: {data_type}")
        
        cursor.close()
        conn.close()
        
        print("\n🎉 Migration terminée avec succès !")
        
    except Exception as e:
        print(f"❌ Erreur de migration: {e}")

if __name__ == "__main__":
    create_candidate_cvs_table()
