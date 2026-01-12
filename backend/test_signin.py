#!/usr/bin/env python3
"""
Test du endpoint signin
"""
import requests
import json

def test_signin():
    url = "http://localhost:8001/api/auth/signin"
    payload = {
        "email": "software@hcexecutive.net",
        "password": "TestResetPass789!"
    }

    print(f"\n{'='*60}")
    print(f"TEST SIGNIN ENDPOINT")
    print(f"{'='*60}\n")
    print(f"URL: {url}")
    print(f"Payload: {json.dumps(payload, indent=2)}")

    try:
        response = requests.post(url, json=payload)
        print(f"\n📡 Response Status: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            print(f"✅ Signin réussi!")
            print(f"\nResponse data:")
            print(f"  - access_token: {data.get('access_token', 'N/A')[:50]}...")
            print(f"  - token_type: {data.get('token_type', 'N/A')}")
            print(f"  - user.id: {data.get('user', {}).get('id', 'N/A')}")
            print(f"  - user.email: {data.get('user', {}).get('email', 'N/A')}")
            print(f"  - user.role: {data.get('user', {}).get('role', 'N/A')}")
            return True
        else:
            print(f"❌ Signin échoué!")
            print(f"Response: {response.text}")
            return False

    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

if __name__ == "__main__":
    result = test_signin()
    exit(0 if result else 1)
