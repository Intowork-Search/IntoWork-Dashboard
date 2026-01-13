#!/usr/bin/env python3
"""
Test direct d'envoi d'email via Resend API
"""
import os
import sys
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

# Import resend
try:
    import resend
    print("✅ Resend package imported successfully")
except ImportError:
    print("❌ Failed to import resend package")
    sys.exit(1)

# Configuration
RESEND_API_KEY = os.getenv("RESEND_API_KEY")
FROM_EMAIL = os.getenv("FROM_EMAIL", "INTOWORK <noreply@intowork.com>")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

print(f"\n📋 Configuration:")
print(f"   RESEND_API_KEY: {RESEND_API_KEY[:20]}..." if RESEND_API_KEY else "   RESEND_API_KEY: ❌ NOT SET")
print(f"   FROM_EMAIL: {FROM_EMAIL}")
print(f"   FRONTEND_URL: {FRONTEND_URL}")

if not RESEND_API_KEY:
    print("\n❌ RESEND_API_KEY is not configured!")
    sys.exit(1)

# Configurer la clé
resend.api_key = RESEND_API_KEY

# Test d'envoi
print(f"\n📧 Tentative d'envoi d'email de test...")

test_email = "test@example.com"
reset_link = f"{FRONTEND_URL}/auth/reset-password?token=test_token_12345"

html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <title>Test Email from Resend</title>
</head>
<body>
    <h1>Test d'email Resend</h1>
    <p>Cet email a été envoyé via l'API Resend.</p>
    <p><a href="{reset_link}">Lien de test</a></p>
</body>
</html>
"""

try:
    params = {
        "from": FROM_EMAIL,
        "to": [test_email],
        "subject": "🧪 Test Email - INTOWORK",
        "html": html_content,
    }
    
    print(f"\n📤 Envoi avec paramètres:")
    print(f"   From: {params['from']}")
    print(f"   To: {params['to']}")
    print(f"   Subject: {params['subject']}")
    
    response = resend.Emails.send(params)
    
    print(f"\n✅ Réponse de Resend:")
    print(f"   Status: Success")
    print(f"   Response: {response}")
    
    if isinstance(response, dict) and 'id' in response:
        print(f"\n✅ Email envoyé avec succès!")
        print(f"   Email ID: {response['id']}")
    else:
        print(f"\n⚠️ Réponse inattendue: {response}")
        
except Exception as e:
    print(f"\n❌ Erreur lors de l'envoi:")
    print(f"   Type: {type(e).__name__}")
    print(f"   Message: {str(e)}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n" + "="*50)
print("🎉 Test Resend API - Réussi!")
print("="*50)
