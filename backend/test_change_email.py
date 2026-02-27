"""
Test de changement d'email
"""
import requests
import json

# Configuration
BASE_URL = "https://intowork-dashboard-production-1ede.up.railway.app/api"

def test_change_email():
    """Tester le changement d'email"""
    print("\n🧪 Test de changement d'email\n")
    
    # 1. Se connecter pour obtenir un token
    print("1. Connexion...")
    signin_data = {
        "email": "employer@test.com",  # Remplacer par votre email de test
        "password": "Test1234!"  # Remplacer par votre mot de passe de test
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/signin", json=signin_data)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            token = response.json()["access_token"]
            print(f"   ✅ Token obtenu: {token[:20]}...")
            
            # 2. Essayer de changer l'email
            print("\n2. Changement d'email...")
            change_email_data = {
                "new_email": "nouveau-email@test.com",
                "password": "Test1234!"  # Le mot de passe actuel
            }
            
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            
            response = requests.post(
                f"{BASE_URL}/auth/change-email",
                json=change_email_data,
                headers=headers
            )
            
            print(f"   Status: {response.status_code}")
            print(f"   Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
            
            if response.status_code == 200:
                print("   ✅ Email changé avec succès!")
            else:
                print(f"   ❌ Erreur: {response.json()}")
                
        else:
            print(f"   ❌ Échec de connexion: {response.json()}")
            
    except Exception as e:
        print(f"   ❌ Erreur: {e}")

if __name__ == "__main__":
    test_change_email()
