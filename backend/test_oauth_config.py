"""
Test OAuth Configuration
Vérifier que les variables d'environnement sont correctement configurées
"""
import os
from dotenv import load_dotenv

# Charger les variables locales
load_dotenv()

print("=" * 60)
print("🔍 VÉRIFICATION CONFIGURATION OAUTH")
print("=" * 60)

# Google
print("\n📧 GOOGLE CALENDAR:")
print(f"  CLIENT_ID: {os.getenv('GOOGLE_CLIENT_ID', '❌ NON DÉFINI')[:30]}...")
print(f"  CLIENT_SECRET: {'✅ DÉFINI' if os.getenv('GOOGLE_CLIENT_SECRET') else '❌ NON DÉFINI'}")
redirect_google = os.getenv('GOOGLE_REDIRECT_URI')
if redirect_google:
    print(f"  REDIRECT_URI (custom): {redirect_google}")
    if "localhost" in redirect_google:
        print("  ⚠️  WARNING: REDIRECT_URI pointe vers localhost!")
        print("  ❌ Devrait être: https://intowork-dashboard-production-1ede.up.railway.app/...")
else:
    print(f"  REDIRECT_URI (default): https://intowork-dashboard-production-1ede.up.railway.app/api/integrations/google-calendar/callback")
    print("  ✅ Utilisera la valeur par défaut (correct pour production)")

# Microsoft
print("\n📅 MICROSOFT OUTLOOK:")
print(f"  CLIENT_ID: {os.getenv('MICROSOFT_CLIENT_ID', '❌ NON DÉFINI')[:30]}...")
print(f"  CLIENT_SECRET: {'✅ DÉFINI' if os.getenv('MICROSOFT_CLIENT_SECRET') else '❌ NON DÉFINI'}")
print(f"  TENANT_ID: {os.getenv('MICROSOFT_TENANT_ID', '❌ NON DÉFINI')[:30]}...")
redirect_ms = os.getenv('MICROSOFT_REDIRECT_URI')
if redirect_ms:
    print(f"  REDIRECT_URI (custom): {redirect_ms}")
    if "localhost" in redirect_ms:
        print("  ⚠️  WARNING: REDIRECT_URI pointe vers localhost!")
        print("  ❌ Devrait être: https://intowork-dashboard-production-1ede.up.railway.app/...")
else:
    print(f"  REDIRECT_URI (default): https://intowork-dashboard-production-1ede.up.railway.app/api/integrations/outlook/callback")
    print("  ✅ Utilisera la valeur par défaut (correct pour production)")

# LinkedIn
print("\n🔗 LINKEDIN:")
print(f"  CLIENT_ID: {os.getenv('LINKEDIN_CLIENT_ID', '❌ NON DÉFINI')[:30]}...")
print(f"  CLIENT_SECRET: {'✅ DÉFINI' if os.getenv('LINKEDIN_CLIENT_SECRET') else '❌ NON DÉFINI'}")

print("\n" + "=" * 60)
print("📋 ACTIONS RECOMMANDÉES:")
print("=" * 60)

issues = []
if not os.getenv('GOOGLE_CLIENT_ID'):
    issues.append("❌ GOOGLE_CLIENT_ID manquant sur Railway")
if not os.getenv('GOOGLE_CLIENT_SECRET'):
    issues.append("❌ GOOGLE_CLIENT_SECRET manquant sur Railway")
if not os.getenv('MICROSOFT_CLIENT_ID'):
    issues.append("❌ MICROSOFT_CLIENT_ID manquant sur Railway")
if not os.getenv('MICROSOFT_CLIENT_SECRET'):
    issues.append("❌ MICROSOFT_CLIENT_SECRET manquant sur Railway")

redirect_issues = []
if redirect_google and "localhost" in redirect_google:
    redirect_issues.append("⚠️  SUPPRIMER GOOGLE_REDIRECT_URI de Railway (laisser vide)")
if redirect_ms and "localhost" in redirect_ms:
    redirect_issues.append("⚠️  SUPPRIMER MICROSOFT_REDIRECT_URI de Railway (laisser vide)")

if issues:
    print("\n🚫 Variables manquantes:")
    for issue in issues:
        print(f"  {issue}")
else:
    print("\n✅ Toutes les variables requises sont définies")

if redirect_issues:
    print("\n⚠️  Redirect URIs incorrects:")
    for issue in redirect_issues:
        print(f"  {issue}")
else:
    print("\n✅ Redirect URIs corrects (ou utiliseront les valeurs par défaut)")

print("\n📝 Vérifications Google Cloud Console:")
print("  1. Allez sur: https://console.cloud.google.com/apis/credentials")
print("  2. Trouvez votre OAuth Client ID")
print("  3. Vérifiez 'Authorized redirect URIs' contient:")
print("     https://intowork-dashboard-production-1ede.up.railway.app/api/integrations/google-calendar/callback")

print("\n📝 Vérifications Azure AD:")
print("  1. Allez sur: https://portal.azure.com")
print("  2. Azure AD → App registrations → Votre app")
print("  3. Authentication → Redirect URIs doit contenir:")
print("     https://intowork-dashboard-production-1ede.up.railway.app/api/integrations/outlook/callback")
print("  4. API permissions → Grant admin consent (bouton bleu)")

print("\n" + "=" * 60)
