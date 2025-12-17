#!/usr/bin/env python3

import os
import psycopg2
from urllib.parse import urlparse

def add_cv_content_column():
    # URL de la base de données Railway depuis les variables d'environnement
    database_url = os.getenv('DATABASE_URL')
    
    if not database_url:
        # URL par défaut si pas de variable d'environnement
        database_url = "postgresql://postgres:LEGTciUhAbcfnHJIPyrlFYvTmLJGdiwq@junction.proxy.rlwy.net:26651/railway"
    
    print(f"🔗 Connexion à: {database_url.split('@')[1] if '@' in database_url else 'base de données'}")
    
    try:
        # Connexion à la base de données
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
        
        print("✅ Connexion à la base de données réussie")
        
        # Vérifier si la colonne existe déjà
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'candidates' 
            AND column_name = 'cv_content'
            AND table_schema = 'public';
        """)
        
        exists = cursor.fetchone()
        
        if exists:
            print("ℹ️  La colonne cv_content existe déjà")
        else:
            print("📝 Ajout de la colonne cv_content...")
            
            # Ajouter la colonne cv_content
            cursor.execute("""
                ALTER TABLE candidates 
                ADD COLUMN cv_content BYTEA;
            """)
            
            conn.commit()
            print("✅ Colonne cv_content ajoutée avec succès")
        
        # Vérifier la structure finale
        cursor.execute("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'candidates' 
            AND table_schema = 'public'
            AND column_name LIKE 'cv_%'
            ORDER BY column_name;
        """)
        
        cv_columns = cursor.fetchall()
        print("\n📋 Colonnes CV dans la table 'candidates':")
        for column_name, data_type, is_nullable in cv_columns:
            nullable = "NULL" if is_nullable == "YES" else "NOT NULL"
            print(f"  ✓ {column_name}: {data_type} ({nullable})")
        
        cursor.close()
        conn.close()
        
        print("\n🎉 Migration terminée avec succès !")
        return True
        
    except psycopg2.OperationalError as e:
        if "server closed the connection unexpectedly" in str(e):
            print("❌ Erreur de connexion: Le serveur a fermé la connexion")
            print("💡 Cela peut être dû à une limite de connexions simultanées")
            print("🔄 Essayez de nouveau dans quelques secondes...")
        else:
            print(f"❌ Erreur de connexion: {e}")
        return False
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

if __name__ == "__main__":
    success = add_cv_content_column()
    exit(0 if success else 1)
