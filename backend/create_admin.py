"""
Script pour créer ou promouvoir l'utilisateur admin
Email: software@hcexecutive.net
"""
import os
import secrets
import string
from app.database import SessionLocal
from app.models.base import User, UserRole
from app.auth import PasswordHasher


def generate_secure_password(length=16):
    """Génère un mot de passe sécurisé aléatoire"""
    alphabet = string.ascii_letters + string.digits + string.punctuation
    # Assurer qu'il y a au moins un de chaque type de caractère
    password = [
        secrets.choice(string.ascii_uppercase),
        secrets.choice(string.ascii_lowercase),
        secrets.choice(string.digits),
        secrets.choice(string.punctuation),
    ]
    # Compléter avec des caractères aléatoires
    password += [secrets.choice(alphabet) for _ in range(length - 4)]
    # Mélanger
    secrets.SystemRandom().shuffle(password)
    return ''.join(password)

def create_or_promote_admin():
    db = SessionLocal()
    
    try:
        admin_email = "software@hcexecutive.net"
        
        # Vérifier si l'utilisateur existe déjà
        existing_user = db.query(User).filter(User.email == admin_email).first()
        
        if existing_user:
            # Promouvoir l'utilisateur existant en admin
            print(f"✓ Utilisateur trouvé: {existing_user.email}")
            
            if existing_user.role == UserRole.ADMIN:
                print(f"✓ L'utilisateur est déjà admin")
            else:
                existing_user.role = UserRole.ADMIN
                existing_user.is_active = True
                db.commit()
                print(f"✓ Utilisateur promu en ADMIN avec succès!")
            
            print(f"\n📊 Informations Admin:")
            print(f"   ID: {existing_user.id}")
            print(f"   Email: {existing_user.email}")
            print(f"   Nom: {existing_user.first_name} {existing_user.last_name}")
            print(f"   Rôle: {existing_user.role.value}")
            print(f"   Actif: {existing_user.is_active}")
            
        else:
            # Créer un nouvel utilisateur admin
            print(f"✓ Création d'un nouvel utilisateur admin...")

            # Générer un mot de passe sécurisé ou utiliser celui fourni via variable d'environnement
            default_password = os.getenv("ADMIN_PASSWORD", generate_secure_password())
            password_hash = PasswordHasher.hash_password(default_password)
            
            new_admin = User(
                email=admin_email,
                password_hash=password_hash,
                first_name="Software",
                last_name="Admin",
                name="Software Admin",
                role=UserRole.ADMIN,
                is_active=True
            )
            
            db.add(new_admin)
            db.commit()
            db.refresh(new_admin)
            
            print(f"✓ Utilisateur admin créé avec succès!")
            print(f"\n📊 Informations Admin:")
            print(f"   ID: {new_admin.id}")
            print(f"   Email: {new_admin.email}")
            print(f"   Nom: {new_admin.first_name} {new_admin.last_name}")
            print(f"   Rôle: {new_admin.role.value}")
            print(f"   Mot de passe par défaut: {default_password}")
            print(f"\n⚠️  IMPORTANT: Changez le mot de passe après la première connexion!")
        
        print(f"\n✅ Opération terminée avec succès!")
        
    except Exception as e:
        print(f"❌ Erreur: {str(e)}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("=" * 60)
    print("🔐 CRÉATION/PROMOTION ADMIN - IntoWork Dashboard")
    print("=" * 60)
    print()
    
    create_or_promote_admin()
