#!/usr/bin/env python3
"""Test rapide d'envoi d'email sans interaction"""
import os
import sys
import uuid
from dotenv import load_dotenv

load_dotenv()

print("🧪 Test rapide du service email...")
print()

# Vérifier la config
resend_key = os.getenv("RESEND_API_KEY")
if not resend_key or not resend_key.startswith("re_"):
    print("❌ Clé API Resend invalide")
    sys.exit(1)

print(f"✅ Clé API: {resend_key[:15]}...")
print(f"✅ FROM_EMAIL: {os.getenv('FROM_EMAIL')}")
print()

# Importer le service
try:
    from app.services.email_service import email_service

    if not email_service.enabled:
        print("❌ Service email désactivé")
        sys.exit(1)

    print("✅ Service email activé")
    print()

except Exception as e:
    print(f"❌ Erreur import: {e}")
    sys.exit(1)

# Demander l'email
print("⚠️  IMPORTANT: Avec le domaine de test 'onboarding@resend.dev',")
print("   vous ne pouvez envoyer qu'à l'email de votre compte Resend !")
print()

# Utiliser un argument ou demander
if len(sys.argv) > 1:
    test_email = sys.argv[1]
else:
    test_email = input("Email de test: ").strip()

if not test_email or "@" not in test_email:
    print("❌ Email invalide")
    sys.exit(1)

print()
print(f"📤 Envoi à: {test_email}")
print()

# Envoyer
try:
    token = str(uuid.uuid4())
    success = email_service.send_password_reset_email(
        email=test_email,
        token=token,
        user_name="Test User"
    )

    if success:
        print("=" * 60)
        print("✅ EMAIL ENVOYÉ AVEC SUCCÈS !")
        print("=" * 60)
        print()
        print(f"📬 Vérifiez: {test_email}")
        print("   (Regardez aussi dans spam)")
        print()
        print(f"🔗 Lien test: http://localhost:3000/auth/reset-password?token={token}")
        print()
        print("📊 Logs Resend: https://resend.com/emails")
        print()
    else:
        print("❌ Échec de l'envoi")
        print("   Consultez les logs ci-dessus")
        sys.exit(1)

except Exception as e:
    print(f"❌ Erreur: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("🎉 Test terminé !")
