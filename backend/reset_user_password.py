#!/usr/bin/env python3
"""
Script pour réinitialiser le mot de passe d'un utilisateur
"""
import asyncio
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models.base import User
from app.auth import PasswordHasher

async def reset_password(email: str, new_password: str):
    print(f"\n{'='*60}")
    print(f"RESET PASSWORD: {email}")
    print(f"{'='*60}\n")

    async with AsyncSessionLocal() as session:
        # Chercher l'utilisateur
        result = await session.execute(
            select(User).where(User.email == email)
        )
        user = result.scalar_one_or_none()

        if not user:
            print(f"❌ Utilisateur {email} non trouvé!")
            return False

        print(f"✅ Utilisateur trouvé:")
        print(f"  - ID: {user.id}")
        print(f"  - Email: {user.email}")
        print(f"  - Name: {user.name}")
        print(f"  - Role: {user.role}")

        # Hash le nouveau mot de passe
        print(f"\n🔐 Hachage du nouveau mot de passe...")
        new_hash = PasswordHasher.hash_password(new_password)
        print(f"  - Nouveau hash: {new_hash[:50]}...")

        # Mettre à jour le mot de passe
        user.password_hash = new_hash
        await session.commit()

        print(f"\n✅ Mot de passe mis à jour avec succès!")

        # Vérifier que ça fonctionne
        print(f"\n🧪 Vérification du nouveau mot de passe...")
        is_valid = PasswordHasher.verify_password(new_password, user.password_hash)

        if is_valid:
            print(f"  ✅ Vérification réussie - Le nouveau mot de passe fonctionne!")
        else:
            print(f"  ❌ ERREUR: Le mot de passe ne fonctionne pas après la mise à jour!")

        return is_valid

if __name__ == "__main__":
    email = "software@hcexecutive.net"
    new_password = "TestResetPass789!"

    result = asyncio.run(reset_password(email, new_password))
    exit(0 if result else 1)
