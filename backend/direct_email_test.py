#!/usr/bin/env python3
"""
Test DIRECT de l'envoi d'email avec Resend
Bypasse complètement l'API pour tester uniquement Resend
"""
import os
import sys
from dotenv import load_dotenv

# Charger .env
load_dotenv()

print("=" * 60)
print("🧪 TEST DIRECT RESEND (sans API)")
print("=" * 60)
print()

# Vérifier configuration
resend_key = os.getenv("RESEND_API_KEY")
from_email = os.getenv("FROM_EMAIL", "INTOWORK <onboarding@resend.dev>")

if not resend_key or not resend_key.startswith("re_"):
    print("❌ RESEND_API_KEY non configurée ou invalide")
    print(f"   Valeur actuelle: {resend_key}")
    sys.exit(1)

print(f"✅ RESEND_API_KEY: {resend_key[:15]}...")
print(f"✅ FROM_EMAIL: {from_email}")
print()

# Tester import resend
try:
    import resend
    print("✅ Package resend importé")
    resend.api_key = resend_key
except ImportError:
    print("❌ Package resend non installé")
    print("   → pip install resend>=0.8.0")
    sys.exit(1)

print()
print("⚠️  RAPPEL IMPORTANT:")
print("   Avec 'onboarding@resend.dev', vous pouvez UNIQUEMENT envoyer")
print("   à l'email de votre compte Resend !")
print()

# Demander l'email
test_email = input("Entrez l'email de votre compte Resend: ").strip()

if not test_email or "@" not in test_email:
    print("❌ Email invalide")
    sys.exit(1)

print()
print(f"📤 Envoi d'un email de test à: {test_email}")
print()

# Préparer l'email
params = {
    "from": from_email,
    "to": [test_email],
    "subject": "🧪 Test INTOWORK - Réinitialisation Mot de Passe",
    "html": """
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white; text-decoration: none; border-radius: 5px; font-weight: bold; }
        .footer { text-align: center; margin-top: 20px; color: #999; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✨ INTOWORK</h1>
            <p>Test Direct Resend</p>
        </div>
        <div class="content">
            <h2>🎉 Ça fonctionne !</h2>
            <p>Si vous recevez cet email, cela signifie que :</p>
            <ul>
                <li>✅ Votre clé API Resend est valide</li>
                <li>✅ L'envoi d'email fonctionne</li>
                <li>✅ Votre configuration est correcte</li>
            </ul>
            <p>Vous pouvez maintenant tester la réinitialisation de mot de passe via l'application.</p>
            <br>
            <a href="http://localhost:3000/auth/forgot-password" class="button">
                Tester la Réinitialisation
            </a>
        </div>
        <div class="footer">
            <p>INTOWORK - Plateforme de Recrutement</p>
            <p>Ceci est un email de test automatique</p>
        </div>
    </div>
</body>
</html>
    """
}

# Envoyer
try:
    print("⏳ Envoi en cours...")
    response = resend.Emails.send(params)

    print()
    print("=" * 60)
    print("✅ EMAIL ENVOYÉ AVEC SUCCÈS !")
    print("=" * 60)
    print()
    print(f"📧 ID de l'email: {response.get('id', 'N/A')}")
    print(f"📬 Destinataire: {test_email}")
    print()
    print("🔍 Prochaines vérifications:")
    print(f"   1. Vérifiez votre boîte mail: {test_email}")
    print("   2. Regardez aussi dans spam/indésirables")
    print("   3. Consultez https://resend.com/emails")
    print(f"      → Cherchez l'email ID: {response.get('id', 'N/A')}")
    print()
    print("✨ Si vous recevez cet email, votre configuration est PARFAITE !")
    print("   Vous pouvez maintenant utiliser la réinitialisation via l'app.")
    print()

except Exception as e:
    print()
    print("=" * 60)
    print("❌ ERREUR LORS DE L'ENVOI")
    print("=" * 60)
    print()
    print(f"Erreur: {str(e)}")
    print()
    print("🔍 Causes possibles:")
    print("   1. Clé API Resend invalide")
    print("   2. Email de destination incorrect (utilisez l'email de votre compte Resend)")
    print("   3. Problème de connexion internet")
    print("   4. Domaine FROM_EMAIL non vérifié (si vous n'utilisez pas le domaine de test)")
    print()
    print("💡 Solutions:")
    print("   1. Vérifiez votre clé API sur https://resend.com/api-keys")
    print("   2. Assurez-vous d'utiliser l'email de votre compte Resend")
    print("   3. Vérifiez https://resend.com/domains pour le statut du domaine")
    print()
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("=" * 60)
