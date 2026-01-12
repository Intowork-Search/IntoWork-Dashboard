#!/usr/bin/env python3
"""
Script de tests complets du Backend API
"""
import requests
import json
import time
from typing import Dict, Any

BASE_URL = "http://localhost:8001/api"

# Variables globales pour stocker les tokens et IDs
test_data = {
    "access_token": None,
    "user_id": None,
    "job_id": None
}

test_results = []

def log_test(name: str, success: bool, duration_ms: float, details: str = ""):
    """Enregistre le résultat d'un test"""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status} - {name} ({duration_ms:.0f}ms)")
    if details and not success:
        print(f"    Details: {details}")

    test_results.append({
        "name": name,
        "success": success,
        "duration_ms": duration_ms,
        "details": details
    })

def test_health_check():
    """Test 1: Health check endpoint"""
    start = time.time()
    try:
        response = requests.get(f"{BASE_URL}/ping")
        duration = (time.time() - start) * 1000
        success = response.status_code == 200
        details = response.json() if success else response.text
        log_test("Health Check (/api/ping)", success, duration, str(details) if not success else "")
        return success
    except Exception as e:
        duration = (time.time() - start) * 1000
        log_test("Health Check (/api/ping)", False, duration, str(e))
        return False

def test_swagger_docs():
    """Test 2: Swagger documentation accessible"""
    start = time.time()
    try:
        response = requests.get("http://localhost:8001/docs")
        duration = (time.time() - start) * 1000
        success = response.status_code == 200 and "swagger" in response.text.lower()
        log_test("Swagger Docs (/docs)", success, duration, "" if success else "Docs not accessible")
        return success
    except Exception as e:
        duration = (time.time() - start) * 1000
        log_test("Swagger Docs (/docs)", False, duration, str(e))
        return False

def test_signin():
    """Test 3: Signin endpoint"""
    start = time.time()
    try:
        payload = {
            "email": "software@hcexecutive.net",
            "password": "TestResetPass789!"
        }
        response = requests.post(f"{BASE_URL}/auth/signin", json=payload)
        duration = (time.time() - start) * 1000

        if response.status_code == 200:
            data = response.json()
            test_data["access_token"] = data.get("access_token")
            test_data["user_id"] = data.get("user", {}).get("id")
            success = test_data["access_token"] is not None
            log_test("Signin (/api/auth/signin)", success, duration)
            return success
        else:
            log_test("Signin (/api/auth/signin)", False, duration, response.text)
            return False
    except Exception as e:
        duration = (time.time() - start) * 1000
        log_test("Signin (/api/auth/signin)", False, duration, str(e))
        return False

def test_get_current_user():
    """Test 4: Get current user with token"""
    if not test_data["access_token"] or not test_data["user_id"]:
        log_test("Get Current User (/api/users/:id)", False, 0, "No access token or user_id available")
        return False

    start = time.time()
    try:
        headers = {"Authorization": f"Bearer {test_data['access_token']}"}
        response = requests.get(f"{BASE_URL}/users/{test_data['user_id']}", headers=headers)
        duration = (time.time() - start) * 1000

        success = response.status_code == 200
        details = "" if success else response.text
        log_test("Get Current User (/api/users/:id)", success, duration, details)
        return success
    except Exception as e:
        duration = (time.time() - start) * 1000
        log_test("Get Current User (/api/users/:id)", False, duration, str(e))
        return False

def test_list_jobs():
    """Test 5: List jobs"""
    start = time.time()
    try:
        response = requests.get(f"{BASE_URL}/jobs")
        duration = (time.time() - start) * 1000

        if response.status_code == 200:
            data = response.json()
            jobs = data.get('jobs', data) if isinstance(data, dict) else data
            has_jobs = isinstance(jobs, list) and len(jobs) > 0

            if has_jobs:
                test_data["job_id"] = jobs[0].get("id")

            success = has_jobs
            details = "" if success else "No jobs found"
            log_test("List Jobs (/api/jobs)", success, duration, details)
            return success
        else:
            log_test("List Jobs (/api/jobs)", False, duration, response.text)
            return False
    except Exception as e:
        duration = (time.time() - start) * 1000
        log_test("List Jobs (/api/jobs)", False, duration, str(e))
        return False

def test_get_job_by_id():
    """Test 6: Get job by ID"""
    if not test_data["job_id"]:
        log_test("Get Job by ID (/api/jobs/:id)", False, 0, "No job_id available")
        return False

    start = time.time()
    try:
        response = requests.get(f"{BASE_URL}/jobs/{test_data['job_id']}")
        duration = (time.time() - start) * 1000

        success = response.status_code == 200
        details = "" if success else response.text
        log_test("Get Job by ID (/api/jobs/:id)", success, duration, details)
        return success
    except Exception as e:
        duration = (time.time() - start) * 1000
        log_test("Get Job by ID (/api/jobs/:id)", False, duration, str(e))
        return False

def test_my_company():
    """Test 7: Get my company (authenticated employer)"""
    if not test_data["access_token"]:
        log_test("Get My Company (/api/companies/my-company)", False, 0, "No access token available")
        return False

    start = time.time()
    try:
        headers = {"Authorization": f"Bearer {test_data['access_token']}"}
        response = requests.get(f"{BASE_URL}/companies/my-company", headers=headers)
        duration = (time.time() - start) * 1000

        success = response.status_code == 200
        details = "" if success else response.text
        log_test("Get My Company (/api/companies/my-company)", success, duration, details)
        return success
    except Exception as e:
        duration = (time.time() - start) * 1000
        log_test("Get My Company (/api/companies/my-company)", False, duration, str(e))
        return False

def test_dashboard():
    """Test 8: Dashboard data (authenticated)"""
    if not test_data["access_token"]:
        log_test("Dashboard Data (/api/dashboard)", False, 0, "No access token available")
        return False

    start = time.time()
    try:
        headers = {"Authorization": f"Bearer {test_data['access_token']}"}
        response = requests.get(f"{BASE_URL}/dashboard", headers=headers)
        duration = (time.time() - start) * 1000

        success = response.status_code == 200
        details = "" if success else response.text
        log_test("Dashboard Data (/api/dashboard)", success, duration, details)
        return success
    except Exception as e:
        duration = (time.time() - start) * 1000
        log_test("Dashboard Data (/api/dashboard)", False, duration, str(e))
        return False

def test_response_times():
    """Test 9: Response times < 500ms for critical endpoints"""
    print("\n📊 Performance Test - Response Times:")

    endpoints_to_test = [
        ("GET", f"{BASE_URL}/ping", None),
        ("GET", f"{BASE_URL}/jobs", None),
    ]

    all_fast = True
    for method, url, headers in endpoints_to_test:
        start = time.time()
        try:
            if method == "GET":
                response = requests.get(url, headers=headers)
            duration = (time.time() - start) * 1000

            is_fast = duration < 500
            status = "✅" if is_fast else "⚠️"
            print(f"  {status} {url.split('/api')[-1]}: {duration:.0f}ms")

            if not is_fast:
                all_fast = False
        except Exception as e:
            print(f"  ❌ {url.split('/api')[-1]}: Error - {e}")
            all_fast = False

    log_test("Response Times < 500ms", all_fast, 0)
    return all_fast

def print_summary():
    """Affiche un résumé des tests"""
    print(f"\n{'='*60}")
    print("RÉSUMÉ DES TESTS BACKEND")
    print(f"{'='*60}\n")

    total = len(test_results)
    passed = sum(1 for r in test_results if r["success"])
    failed = total - passed

    print(f"Total: {total} tests")
    print(f"✅ Passés: {passed} ({passed/total*100:.1f}%)")
    print(f"❌ Échoués: {failed} ({failed/total*100:.1f}%)")

    if failed > 0:
        print(f"\n❌ Tests échoués:")
        for result in test_results:
            if not result["success"]:
                print(f"  - {result['name']}")
                if result["details"]:
                    print(f"    {result['details'][:100]}...")

    avg_duration = sum(r["duration_ms"] for r in test_results if r["duration_ms"] > 0) / max(len([r for r in test_results if r["duration_ms"] > 0]), 1)
    print(f"\n⏱️  Temps moyen de réponse: {avg_duration:.0f}ms")

    return passed == total

def main():
    print(f"\n{'='*60}")
    print("TESTS COMPLETS BACKEND API")
    print(f"{'='*60}\n")
    print(f"Base URL: {BASE_URL}\n")

    # Exécuter les tests
    test_health_check()
    test_swagger_docs()
    test_signin()
    test_get_current_user()
    test_list_jobs()
    test_get_job_by_id()
    test_my_company()
    test_dashboard()
    test_response_times()

    # Afficher le résumé
    all_passed = print_summary()

    return 0 if all_passed else 1

if __name__ == "__main__":
    exit(main())
