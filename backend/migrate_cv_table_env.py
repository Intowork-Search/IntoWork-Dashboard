#!/usr/bin/env python3

import os
import psycopg2
from dotenv import load_dotenv

def migrate_cv_table():
    # Charger les variables d'environnement
    load_dotenv()
    
    # Obtenir l'URL de la base de données depuis les variables d'environnement
    database_url = os.getenv('DATABASE_URL')
    
    if not database_url:
        print("❌ DATABASE_URL non trouvée dans les variables d'environnement")
        return
    
    print(f"🔗 Connexion à la base de données...")
    
    try:
        # Connexion à la base de données
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
        
        print("✅ Connexion à la base de données réussie")
        
        # Créer la nouvelle table candidate_cvs
        print("📝 Création de la table candidate_cvs...")
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
        print("📊 Création des index...")
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_candidate_cvs_candidate_id ON candidate_cvs(candidate_id);
            CREATE INDEX IF NOT EXISTS idx_candidate_cvs_is_active ON candidate_cvs(is_active);
        """)
        
        # Migrer les CV existants de la table candidates vers candidate_cvs
        print("🔄 Migration des CV existants...")
        cursor.execute("""
            INSERT INTO candidate_cvs (candidate_id, filename, file_path, is_active, created_at)
            SELECT 
                id as candidate_id,
                cv_filename as filename,
                cv_url as file_path,
                TRUE as is_active,
                COALESCE(cv_uploaded_at, NOW()) as created_at
            FROM candidates 
            WHERE cv_filename IS NOT NULL AND cv_url IS NOT NULL
            ON CONFLICT DO NOTHING;
        """)
        
        migrated_count = cursor.rowcount
        
        conn.commit()
        print(f"✅ Table candidate_cvs créée et {migrated_count} CV(s) migré(s) avec succès")
        
        # Vérifier les données migrées
        cursor.execute("SELECT COUNT(*) FROM candidate_cvs")
        total_count = cursor.fetchone()[0]
        print(f"📊 Total de {total_count} CV(s) dans la nouvelle table")
        
        # Afficher quelques exemples
        cursor.execute("""
            SELECT c.filename, c.created_at, cand.id as candidate_id
            FROM candidate_cvs c
            JOIN candidates cand ON c.candidate_id = cand.id
            LIMIT 3
        """)
        
        examples = cursor.fetchall()
        if examples:
            print("\n📋 Exemples de CV migrés:")
            for filename, created_at, candidate_id in examples:
                print(f"  - {filename} (Candidat {candidate_id}, {created_at})")
        
        # Afficher la structure de la nouvelle table
        cursor.execute("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'candidate_cvs' AND table_schema = 'public'
            ORDER BY ordinal_position;
        """)
        
        columns = cursor.fetchall()
        print(f"\n📋 Structure de la table 'candidate_cvs' ({len(columns)} colonnes):")
        for column_name, data_type, is_nullable in columns:
            nullable = "NULL" if is_nullable == "YES" else "NOT NULL"
            print(f"  - {column_name}: {data_type} ({nullable})")
        
        cursor.close()
        conn.close()
        
        print("\n🎉 Migration terminée avec succès !")
        print("💡 Vous pouvez maintenant tester le système multi-CV complet !")
        
    except Exception as e:
        print(f"❌ Erreur de migration: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    migrate_cv_table()
