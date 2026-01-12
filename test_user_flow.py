#!/usr/bin/env python3
"""
Script de test de flow complet utilisateur
Simule le parcours d'un utilisateur de A à Z
"""
import requests
import time
import random
import string

BASE_URL = "http://localhost:8001/api"
FRONTEND_URL = "http://localhost:3000"

test_data = {
    "email": None,
    "password": None,
    "access_token": None,
    "user_id": None,
    "job_id": None
}

test_results = []

def log_step(step_num: int, name: str, success: bool, duration_ms: float, details: str = ""):
    """Enregistre le résultat d'une étape"""
    status = "✅ SUCCESS" if success else "❌ FAILED"
    print(f"\n{'='*60}")
    print(f"STEP {step_num}: {name}")
    print(f"{'='*60}")
    print(f"Status: {status}")
    print(f"Duration: {duration_ms:.0f}ms")
    if details:
        print(f"Details: {details}")

    test_results.append({
        "step": step_num,
        "name": name,
        "success": success,
        "duration_ms": duration_ms,
        "details": details
    })

    return success

def step1_create_account():
    """Étape 1: Créer un nouveau compte utilisateur"""
    start = time.time()

    # Générer un email unique
    random_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    test_data["email"] = f"test_{random_str}@example.com"
    test_data["password"] = "TestPassword123!"

    try:
        payload = {
            "email": test_data["email"],
            "password": test_data["password"],
            "first_name": "Test",
            "last_name": "User",
            "role": "candidate"
        }

        response = requests.post(f"{BASE_URL}/auth/signup", json=payload)
        duration = (time.time() - start) * 1000

        if response.status_code in [200, 201]:
            data = response.json()
            test_data["user_id"] = data.get("user", {}).get("id")

            details = f"Created user: {test_data['email']}"
            return log_step(1, "Create Account (Signup)", True, duration, details)
        else:
            details = f"Failed with status {response.status_code}: {response.text[:200]}"
            return log_step(1, "Create Account (Signup)", False, duration, details)

    except Exception as e:
        duration = (time.time() - start) * 1000
        return log_step(1, "Create Account (Signup)", False, duration, str(e))

def step2_signin():
    """Étape 2: Se connecter avec le compte créé"""
    start = time.time()

    try:
        payload = {
            "email": test_data["email"],
            "password": test_data["password"]
        }

        response = requests.post(f"{BASE_URL}/auth/signin", json=payload)
        duration = (time.time() - start) * 1000

        if response.status_code == 200:
            data = response.json()
            test_data["access_token"] = data.get("access_token")

            if test_data["access_token"]:
                details = f"Received access token (length: {len(test_data['access_token'])})"
                return log_step(2, "Sign In", True, duration, details)
            else:
                details = "No access token in response"
                return log_step(2, "Sign In", False, duration, details)
        else:
            details = f"Failed with status {response.status_code}: {response.text[:200]}"
            return log_step(2, "Sign In", False, duration, details)

    except Exception as e:
        duration = (time.time() - start) * 1000
        return log_step(2, "Sign In", False, duration, str(e))

def step3_access_dashboard():
    """Étape 3: Accéder au dashboard"""
    start = time.time()

    if not test_data["access_token"]:
        return log_step(3, "Access Dashboard", False, 0, "No access token available")

    try:
        headers = {"Authorization": f"Bearer {test_data['access_token']}"}
        response = requests.get(f"{BASE_URL}/dashboard", headers=headers)
        duration = (time.time() - start) * 1000

        if response.status_code == 200:
            data = response.json()
            details = f"Dashboard data received with keys: {list(data.keys())}"
            return log_step(3, "Access Dashboard", True, duration, details)
        else:
            details = f"Failed with status {response.status_code}: {response.text[:200]}"
            return log_step(3, "Access Dashboard", False, duration, details)

    except Exception as e:
        duration = (time.time() - start) * 1000
        return log_step(3, "Access Dashboard", False, duration, str(e))

def step4_browse_jobs():
    """Étape 4: Parcourir les offres d'emploi"""
    start = time.time()

    try:
        response = requests.get(f"{BASE_URL}/jobs")
        duration = (time.time() - start) * 1000

        if response.status_code == 200:
            data = response.json()
            jobs = data.get('jobs', data) if isinstance(data, dict) else data

            if isinstance(jobs, list) and len(jobs) > 0:
                test_data["job_id"] = jobs[0].get("id")
                details = f"Found {len(jobs)} jobs. Selected job ID: {test_data['job_id']}"
                return log_step(4, "Browse Jobs", True, duration, details)
            else:
                details = "No jobs found"
                return log_step(4, "Browse Jobs", False, duration, details)
        else:
            details = f"Failed with status {response.status_code}: {response.text[:200]}"
            return log_step(4, "Browse Jobs", False, duration, details)

    except Exception as e:
        duration = (time.time() - start) * 1000
        return log_step(4, "Browse Jobs", False, duration, str(e))

def step5_view_job_details():
    """Étape 5: Voir les détails d'une offre"""
    start = time.time()

    if not test_data["job_id"]:
        return log_step(5, "View Job Details", False, 0, "No job_id available")

    try:
        response = requests.get(f"{BASE_URL}/jobs/{test_data['job_id']}")
        duration = (time.time() - start) * 1000

        if response.status_code == 200:
            data = response.json()
            job_title = data.get("title", "N/A")
            details = f"Job details retrieved: {job_title}"
            return log_step(5, "View Job Details", True, duration, details)
        else:
            details = f"Failed with status {response.status_code}: {response.text[:200]}"
            return log_step(5, "View Job Details", False, duration, details)

    except Exception as e:
        duration = (time.time() - start) * 1000
        return log_step(5, "View Job Details", False, duration, str(e))

def print_summary():
    """Affiche un résumé du flow"""
    print(f"\n{'='*60}")
    print("RÉSUMÉ DU FLOW UTILISATEUR")
    print(f"{'='*60}\n")

    total = len(test_results)
    passed = sum(1 for r in test_results if r["success"])
    failed = total - passed

    print(f"Total Steps: {total}")
    print(f"✅ Completed: {passed} ({passed/total*100:.1f}%)")
    print(f"❌ Failed: {failed} ({failed/total*100:.1f}%)")

    if failed > 0:
        print(f"\n❌ Failed steps:")
        for result in test_results:
            if not result["success"]:
                print(f"  Step {result['step']}: {result['name']}")
                if result["details"]:
                    print(f"    {result['details'][:100]}...")

    total_duration = sum(r["duration_ms"] for r in test_results)
    print(f"\n⏱️  Total flow duration: {total_duration:.0f}ms ({total_duration/1000:.2f}s)")

    print(f"\n📧 Test account created:")
    print(f"  Email: {test_data['email']}")
    print(f"  Password: {test_data['password']}")

    return passed == total

def main():
    print(f"\n{'='*60}")
    print("TEST DE FLOW COMPLET UTILISATEUR")
    print(f"{'='*60}\n")
    print(f"This test simulates a complete user journey:\n")
    print(f"1. Create a new account (signup)")
    print(f"2. Sign in with credentials")
    print(f"3. Access dashboard")
    print(f"4. Browse job listings")
    print(f"5. View job details\n")

    # Exécuter le flow
    if not step1_create_account():
        print("\n⚠️  Flow stopped - Account creation failed")
        return 1

    if not step2_signin():
        print("\n⚠️  Flow stopped - Sign in failed")
        return 1

    step3_access_dashboard()
    step4_browse_jobs()
    step5_view_job_details()

    # Afficher le résumé
    all_passed = print_summary()

    return 0 if all_passed else 1

if __name__ == "__main__":
    exit(main())
