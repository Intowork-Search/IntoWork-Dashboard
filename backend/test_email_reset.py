#!/usr/bin/env python3
"""
Script de test pour le service d'envoi d'email de réinitialisation de mot de passe
"""
import os
import sys
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

print("=" * 60)
print("🧪 TEST DU SERVICE EMAIL INTOWORK")
print("=" * 60)
print()

# Vérifier la configuration
print("📋 Vérification de la configuration...")
print()

resend_api_key = os.getenv("RESEND_API_KEY")
from_email = os.getenv("FROM_EMAIL", "INTOWORK <onboarding@resend.dev>")
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")

config_ok = True

if not resend_api_key or resend_api_key == "re_your_resend_api_key_here":
    print("❌ RESEND_API_KEY non configurée")
    print("   → Suivez les instructions dans RESEND_SETUP.md")
    config_ok = False
elif not resend_api_key.startswith("re_"):
    print("❌ RESEND_API_KEY invalide (doit commencer par 're_')")
    config_ok = False
else:
    print(f"✅ RESEND_API_KEY: {resend_api_key[:10]}...")

print(f"✅ FROM_EMAIL: {from_email}")
print(f"✅ FRONTEND_URL: {frontend_url}")
print()

if not config_ok:
    print("⚠️  Configuration incomplète. Complétez le fichier .env avant de continuer.")
    sys.exit(1)

# Tester l'import du module resend
print("📦 Vérification du package Resend...")
try:
    import resend
    print(f"✅ Resend version installée: {resend.__version__ if hasattr(resend, '__version__') else 'inconnue'}")
except ImportError:
    print("❌ Le package 'resend' n'est pas installé")
    print("   → Exécutez: pip install resend>=0.8.0")
    sys.exit(1)
print()

# Tester le service email
print("🔧 Test du service EmailService...")
try:
    from app.services.email_service import email_service

    if email_service.enabled:
        print("✅ Service email activé")
    else:
        print("❌ Service email désactivé")
        print("   → Vérifiez la configuration RESEND_API_KEY")
        sys.exit(1)
except Exception as e:
    print(f"❌ Erreur lors de l'import: {e}")
    sys.exit(1)
print()

# Demander l'email de test
print("📧 Test d'envoi d'email de réinitialisation...")
print()
print("⚠️  IMPORTANT avec le domaine de test Resend:")
print("   Vous ne pouvez envoyer qu'à l'email de votre compte Resend")
print()

test_email = input("Entrez votre email de test: ").strip()

if not test_email or "@" not in test_email:
    print("❌ Email invalide")
    sys.exit(1)

print()
print(f"📤 Envoi de l'email de test à: {test_email}")
print()

# Envoyer l'email de test
try:
    import uuid
    test_token = str(uuid.uuid4())

    success = email_service.send_password_reset_email(
        email=test_email,
        token=test_token,
        user_name="Utilisateur Test"
    )

    if success:
        print("=" * 60)
        print("✅ EMAIL ENVOYÉ AVEC SUCCÈS !")
        print("=" * 60)
        print()
        print("📬 Vérifiez votre boîte mail:")
        print(f"   → Email: {test_email}")
        print("   → Dossier spam si vous ne voyez rien")
        print()
        print("🔗 Lien de test (ne fonctionnera pas car token de test):")
        print(f"   {frontend_url}/auth/reset-password?token={test_token}")
        print()
        print("📊 Consultez les logs Resend:")
        print("   https://resend.com/emails")
        print()
        print("=" * 60)
    else:
        print("=" * 60)
        print("❌ ÉCHEC DE L'ENVOI")
        print("=" * 60)
        print()
        print("🔍 Vérifications:")
        print("   1. Clé API Resend valide?")
        print("   2. Domaine FROM_EMAIL vérifié?")
        print("   3. Consultez les logs ci-dessus")
        print("   4. Vérifiez https://resend.com/emails")
        print()
        sys.exit(1)

except Exception as e:
    print("=" * 60)
    print("❌ ERREUR LORS DE L'ENVOI")
    print("=" * 60)
    print()
    print(f"Erreur: {str(e)}")
    print()
    print("🔍 Solutions possibles:")
    print("   1. Vérifiez votre clé API Resend")
    print("   2. Assurez-vous que le domaine est vérifié")
    print("   3. Consultez RESEND_SETUP.md")
    print()
    sys.exit(1)

print("🎉 Test terminé avec succès !")
print()
