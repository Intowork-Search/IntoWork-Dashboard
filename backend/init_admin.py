#!/usr/bin/env python3
"""
Script pour créer l'utilisateur admin initial
Email: software@hcexecutive.net
Version async compatible avec Railway
"""
import asyncio
import os
import sys
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models.base import User, UserRole
from app.auth import PasswordHasher


async def create_admin():
    """Créer l'utilisateur admin s'il n'existe pas"""
    async with AsyncSessionLocal() as db:
        try:
            admin_email = "software@hcexecutive.net"
            
            # Vérifier si l'utilisateur existe déjà
            result = await db.execute(
                select(User).filter(User.email == admin_email)
            )
            existing_user = result.scalar_one_or_none()
            
            if existing_user:
                # Promouvoir en admin si nécessaire
                if existing_user.role != UserRole.ADMIN:
                    existing_user.role = UserRole.ADMIN
                    existing_user.is_active = True
                    await db.commit()
                    print(f"✅ Utilisateur {admin_email} promu en ADMIN")
                else:
                    print(f"ℹ️  Admin {admin_email} déjà existant")
                return 0
            
            # Créer un nouvel utilisateur admin
            # Utiliser ADMIN_PASSWORD depuis l'environnement ou un mot de passe par défaut
            default_password = os.getenv("ADMIN_PASSWORD", "Admin@2026!")
            password_hash = PasswordHasher.hash_password(default_password)
            
            new_admin = User(
                email=admin_email,
                password_hash=password_hash,
                first_name="Software",
                last_name="Admin",
                name="Software Admin",
                role=UserRole.ADMIN,
                is_active=True,
                email_verified=None  # Peut se connecter sans vérification
            )
            
            db.add(new_admin)
            await db.commit()
            
            print(f"✅ Utilisateur admin créé avec succès!")
            print(f"   Email: {admin_email}")
            print(f"   Mot de passe: {default_password}")
            print(f"   ⚠️  Changez le mot de passe après la première connexion!")
            
            return 0
            
        except Exception as e:
            print(f"❌ Erreur lors de la création de l'admin: {e}")
            await db.rollback()
            return 1


if __name__ == "__main__":
    print("🔐 Initialisation utilisateur admin...")
    exit_code = asyncio.run(create_admin())
    sys.exit(exit_code)
