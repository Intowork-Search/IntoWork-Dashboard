"""
Script de test pour vérifier la synchronisation et la persistance
"""
import requests
import json

BASE_URL = "http://localhost:8001"

def test_auth_flow():
    """Test du flux d'authentification"""
    print("\n=== TEST AUTHENTIFICATION ===")
    
    # Test signup candidat
    signup_data = {
        "email": f"test_candidate_{hash('test')}@test.com",
        "password": "Test1234!",
        "first_name": "Test",
        "last_name": "Candidate",
        "role": "candidate"
    }
    
    response = requests.post(f"{BASE_URL}/auth/signup", json=signup_data)
    print(f"✓ Signup candidat: {response.status_code}")
    
    if response.status_code == 201:
        # Test signin
        signin_data = {
            "email": signup_data["email"],
            "password": signup_data["password"]
        }
        response = requests.post(f"{BASE_URL}/auth/signin", json=signin_data)
        print(f"✓ Signin: {response.status_code}")
        
        if response.status_code == 200:
            token = response.json()["access_token"]
            return token
    
    return None

def test_employer_jobs(token):
    """Test des offres d'emploi de l'employeur"""
    print("\n=== TEST OFFRES EMPLOYEUR ===")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # GET /my-jobs
    response = requests.get(f"{BASE_URL}/api/jobs/my-jobs", headers=headers)
    print(f"✓ GET /my-jobs: {response.status_code}")
    
    if response.status_code == 200:
        jobs = response.json().get("jobs", [])
        print(f"  → {len(jobs)} offres trouvées")
        return True
    
    return False

def test_company_update(token):
    """Test de mise à jour entreprise"""
    print("\n=== TEST MISE À JOUR ENTREPRISE ===")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # GET company
    response = requests.get(f"{BASE_URL}/api/companies/my-company", headers=headers)
    print(f"✓ GET /my-company: {response.status_code}")
    
    if response.status_code == 200:
        company = response.json()
        
        # UPDATE company
        update_data = {
            "name": company.get("name", "Test Company"),
            "description": "Test description updated",
            "industry": "Technology"
        }
        
        response = requests.put(f"{BASE_URL}/api/companies/my-company", json=update_data, headers=headers)
        print(f"✓ PUT /my-company: {response.status_code}")
        
        if response.status_code == 200:
            # Vérifier la persistance
            response = requests.get(f"{BASE_URL}/api/companies/my-company", headers=headers)
            updated_company = response.json()
            
            if updated_company.get("description") == "Test description updated":
                print("  → ✓ Données persistées correctement")
                return True
            else:
                print("  → ✗ Données non persistées")
    
    return False

def test_notifications(token):
    """Test des notifications"""
    print("\n=== TEST NOTIFICATIONS ===")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # GET notifications
    response = requests.get(f"{BASE_URL}/api/notifications/", headers=headers)
    print(f"✓ GET /notifications: {response.status_code}")
    
    if response.status_code == 200:
        notifs = response.json()
        print(f"  → {notifs.get('total', 0)} notifications, {notifs.get('unread_count', 0)} non lues")
        return True
    
    return False

def main():
    print("=" * 60)
    print("TEST DE SYNCHRONISATION ET PERSISTANCE")
    print("=" * 60)
    
    # Test santé API
    try:
        response = requests.get(f"{BASE_URL}/ping")
        if response.status_code == 200:
            print("✓ API en ligne")
        else:
            print("✗ API non disponible")
            return
    except:
        print("✗ Impossible de se connecter à l'API")
        return
    
    # Note: Ces tests nécessitent des comptes existants avec les bonnes permissions
    print("\n⚠️  Pour tester complètement:")
    print("1. Créez un compte employeur via l'interface")
    print("2. Complétez l'onboarding (entreprise)")
    print("3. Créez une offre d'emploi")
    print("4. Créez un compte candidat")
    print("5. Postulez à l'offre")
    print("\nVérifiez que:")
    print("- L'employeur ne voit que SES offres dans /my-jobs")
    print("- Les modifications d'entreprise sont sauvegardées")
    print("- Les notifications s'affichent correctement")
    print("- Le badge du menu se met à jour")

if __name__ == "__main__":
    main()
