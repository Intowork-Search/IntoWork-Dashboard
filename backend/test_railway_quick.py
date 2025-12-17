#!/usr/bin/env python3

"""
Test rapide du déploiement Railway - endpoints critiques uniquement
"""

import requests
import json
from datetime import datetime

BASE_URL = "https://intowork-dashboard-production.up.railway.app"

def test_quick(endpoint, expected_status=200):
    """Test rapide d'un endpoint"""
    url = f"{BASE_URL}{endpoint}"
    
    try:
        response = requests.get(url, timeout=5)
        status = "✅" if response.status_code == expected_status else "❌"
        
        print(f"{status} {endpoint} - Status: {response.status_code}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                if endpoint == "/api/db-status":
                    print(f"   Users in DB: {data.get('users_count', 'Unknown')}")
                elif endpoint == "/api/users":
                    print(f"   Total users: {len(data) if isinstance(data, list) else 'Unknown'}")
            except:
                pass
                
    except Exception as e:
        print(f"❌ {endpoint} - Error: {e}")

def main():
    print("🚀 Test rapide Railway Deployment")
    print("=" * 40)
    
    # Tests critiques seulement
    test_quick("/api/ping")
    test_quick("/health")
    test_quick("/api/db-status")
    test_quick("/api/users")
    
    print("\n🎯 Déploiement Railway Status:")
    print("Backend: https://intowork-dashboard-production.up.railway.app")
    print("Docs: https://intowork-dashboard-production.up.railway.app/docs")

if __name__ == "__main__":
    main()
