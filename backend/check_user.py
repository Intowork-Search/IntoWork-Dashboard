#!/usr/bin/env python3
"""
Script pour vérifier l'utilisateur et son mot de passe en base de données
"""
import asyncio
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models.base import User
from app.auth import PasswordHasher

async def check_user():
    email = "software@hcexecutive.net"
    test_password = "TestResetPass789!"

    print(f"\n{'='*60}")
    print(f"DIAGNOSTIC: Vérification de l'utilisateur {email}")
    print(f"{'='*60}\n")

    async with AsyncSessionLocal() as session:
        # Chercher l'utilisateur
        result = await session.execute(
            select(User).where(User.email == email)
        )
        user = result.scalar_one_or_none()

        if not user:
            print(f"❌ PROBLÈME: Utilisateur {email} n'existe PAS en base de données\n")

            # Lister tous les utilisateurs
            all_users = await session.execute(select(User))
            users = all_users.scalars().all()

            print(f"📋 Utilisateurs existants en base ({len(users)}):")
            for u in users:
                print(f"  - {u.email} (ID: {u.id}, Role: {u.role})")

            return False

        print(f"✅ Utilisateur trouvé:")
        print(f"  - ID: {user.id}")
        print(f"  - Email: {user.email}")
        print(f"  - Name: {user.name}")
        print(f"  - Role: {user.role}")
        print(f"  - Email Verified: {user.email_verified}")
        print(f"  - Password Hash: {user.password_hash[:50]}..." if user.password_hash else "  - Password Hash: None")

        if not user.password_hash:
            print(f"\n❌ PROBLÈME: L'utilisateur n'a PAS de mot de passe défini!")
            return False

        # Vérifier le mot de passe
        print(f"\n🔐 Test de vérification du mot de passe...")
        print(f"  - Mot de passe testé: {test_password}")

        is_valid = PasswordHasher.verify_password(test_password, user.password_hash)

        if is_valid:
            print(f"  ✅ Mot de passe VALIDE")
        else:
            print(f"  ❌ Mot de passe INVALIDE")

            # Tester quelques mots de passe courants
            print(f"\n🔍 Test avec d'autres mots de passe courants:")
            test_passwords = [
                "password123",
                "Password123!",
                "TestPass123!",
                "Admin123!",
                "test123"
            ]

            for pwd in test_passwords:
                if PasswordHasher.verify_password(pwd, user.password_hash):
                    print(f"  ✅ Mot de passe trouvé: {pwd}")
                    break
            else:
                print(f"  ❌ Aucun mot de passe courant ne fonctionne")

        return is_valid

if __name__ == "__main__":
    result = asyncio.run(check_user())
    exit(0 if result else 1)
