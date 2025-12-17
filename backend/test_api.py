#!/usr/bin/env python3

"""
Script de test pour l'API INTOWORK Backend
Usage: python test_api.py
"""

import requests
import json
from datetime import datetime

BASE_URL = "https://localhost:8000"

def test_endpoint(method, endpoint, data=None):
    """Tester un endpoint de l'API"""
    url = f"{BASE_URL}{endpoint}"
    try:
        if method == "GET":
            response = requests.get(url)
        elif method == "POST":
            response = requests.post(url, json=data)
        
        print(f"✅ {method} {endpoint}")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
        return response.json()
    except requests.exceptions.ConnectionError:
        print(f"❌ {method} {endpoint} - Serveur non accessible")
        return None
    except Exception as e:
        print(f"❌ {method} {endpoint} - Erreur: {e}")
        return None

def main():
    print("🚀 Test de l'API INTOWORK Backend")
    print("=" * 50)
    
    # Test des endpoints de base
    test_endpoint("GET", "/")
    test_endpoint("GET", "/health")
    test_endpoint("GET", "/api/ping")
    test_endpoint("GET", "/api/status")
    
    # Test de la base de données
    print("\n📊 Test de la base de données")
    test_endpoint("GET", "/api/db-status")
    test_endpoint("GET", "/api/users")
    
    # Test de création d'utilisateur
    print("\n👤 Test de création d'utilisateur")
    user_data = {
        "clerk_id": f"clerk_test_{int(datetime.now().timestamp())}",
        "email": "test@example.com",
        "role": "candidate",
        "first_name": "Test",
        "last_name": "User"
    }
    
    created_user = test_endpoint("POST", "/api/users", user_data)
    
    if created_user:
        # Test de récupération de l'utilisateur créé
        user_id = created_user.get("id")
        test_endpoint("GET", f"/api/users/{user_id}")

if __name__ == "__main__":
    main()
