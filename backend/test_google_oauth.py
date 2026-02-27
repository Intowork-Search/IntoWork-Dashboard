"""
Test direct de Google OAuth token exchange
Pour voir exactement quelle erreur Google retourne
"""
import httpx
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")

# La VRAIE redirect URI de production (celle que le backend utilise maintenant)
GOOGLE_REDIRECT_URI = "https://intowork-dashboard-production-1ede.up.railway.app/api/integrations/google-calendar/callback"

GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"

async def test_token_exchange():
    """
    Test avec un faux code pour voir l'erreur exacte
    """
    print("=" * 70)
    print("🔍 TEST GOOGLE OAUTH TOKEN EXCHANGE")
    print("=" * 70)
    
    print(f"\n📋 Configuration actuelle:")
    print(f"  CLIENT_ID: {GOOGLE_CLIENT_ID[:30] if GOOGLE_CLIENT_ID else '❌ NON DÉFINI'}...")
    print(f"  CLIENT_SECRET: {'✅ DÉFINI' if GOOGLE_CLIENT_SECRET else '❌ NON DÉFINI'}")
    print(f"  REDIRECT_URI: {GOOGLE_REDIRECT_URI}")
    
    print(f"\n🔑 Tentative d'échange de token avec un code fictif...")
    print(f"  (Ceci échouera, mais nous verrons l'erreur EXACTE de Google)")
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                GOOGLE_TOKEN_URL,
                data={
                    "code": "fake_code_for_testing",
                    "client_id": GOOGLE_CLIENT_ID,
                    "client_secret": GOOGLE_CLIENT_SECRET,
                    "redirect_uri": GOOGLE_REDIRECT_URI,
                    "grant_type": "authorization_code"
                }
            )
            
            print(f"\n📊 Réponse de Google:")
            print(f"  Status Code: {response.status_code}")
            print(f"  Body: {response.text}")
            
            if response.status_code == 400:
                error = response.json()
                if error.get("error") == "invalid_grant":
                    print(f"\n✅ CONFIGURATION CORRECTE!")
                    print(f"  - Google a accepté le client_id, client_secret et redirect_uri")
                    print(f"  - L'erreur 'invalid_grant' est normale (code fictif)")
                    print(f"\n🎯 Le problème vient donc du code d'autorisation lui-même!")
                    print(f"  Causes possibles:")
                    print(f"    1. Code expiré (dure seulement quelques minutes)")
                    print(f"    2. Code déjà utilisé (single-use)")
                    print(f"    3. Problème dans le flux OAuth frontend→backend")
                elif error.get("error") == "redirect_uri_mismatch":
                    print(f"\n❌ ERREUR: REDIRECT_URI ne correspond pas!")
                    print(f"  Vous DEVEZ ajouter cette URI dans Google Cloud Console:")
                    print(f"  {GOOGLE_REDIRECT_URI}")
                else:
                    print(f"\n⚠️  Erreur inattendue: {error}")
                    
            elif response.status_code == 401:
                print(f"\n❌ ERREUR 401: Client credentials incorrects!")
                print(f"  Vérifiez que GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET sur Railway")
                print(f"  correspondent à ceux dans Google Cloud Console")
            
        except Exception as e:
            print(f"\n❌ Exception: {e}")
    
    print("\n" + "=" * 70)
    print("📝 PROCHAINES ÉTAPES:")
    print("=" * 70)
    print("1. Si vous voyez 'invalid_grant' → Configuration OK, problème de code OAuth")
    print("2. Si vous voyez 'redirect_uri_mismatch' → Ajoutez l'URI dans Google Console")
    print("3. Si vous voyez 401 → Vérifiez CLIENT_ID/SECRET sur Railway")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(test_token_exchange())
