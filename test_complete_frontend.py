#!/usr/bin/env python3
"""
Script de tests complets du Frontend Next.js
"""
import requests
import time
from typing import Dict, Any

FRONTEND_URL = "http://localhost:3000"

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

def test_homepage():
    """Test 1: Page d'accueil accessible"""
    start = time.time()
    try:
        response = requests.get(FRONTEND_URL, timeout=10)
        duration = (time.time() - start) * 1000

        success = response.status_code == 200 and len(response.text) > 100
        details = "" if success else f"Status: {response.status_code}, Length: {len(response.text)}"
        log_test("Homepage accessible", success, duration, details)
        return success
    except Exception as e:
        duration = (time.time() - start) * 1000
        log_test("Homepage accessible", False, duration, str(e))
        return False

def test_signup_page():
    """Test 2: Page signup accessible"""
    start = time.time()
    try:
        response = requests.get(f"{FRONTEND_URL}/auth/signup", timeout=10)
        duration = (time.time() - start) * 1000

        success = response.status_code == 200 and "signup" in response.text.lower()
        details = "" if success else f"Status: {response.status_code}"
        log_test("Signup page accessible", success, duration, details)
        return success
    except Exception as e:
        duration = (time.time() - start) * 1000
        log_test("Signup page accessible", False, duration, str(e))
        return False

def test_signin_page():
    """Test 3: Page signin accessible"""
    start = time.time()
    try:
        response = requests.get(f"{FRONTEND_URL}/auth/signin", timeout=10)
        duration = (time.time() - start) * 1000

        success = response.status_code == 200 and "signin" in response.text.lower()
        details = "" if success else f"Status: {response.status_code}"
        log_test("Signin page accessible", success, duration, details)
        return success
    except Exception as e:
        duration = (time.time() - start) * 1000
        log_test("Signin page accessible", False, duration, str(e))
        return False

def test_dashboard_redirect():
    """Test 4: Dashboard redirige si non authentifié"""
    start = time.time()
    try:
        response = requests.get(f"{FRONTEND_URL}/dashboard", timeout=10, allow_redirects=False)
        duration = (time.time() - start) * 1000

        # Le dashboard devrait soit retourner 200 (avec redirect client-side)
        # soit un code 3xx pour redirect
        success = response.status_code in [200, 302, 307, 308]
        details = "" if success else f"Status: {response.status_code}"
        log_test("Dashboard accessible (or redirects)", success, duration, details)
        return success
    except Exception as e:
        duration = (time.time() - start) * 1000
        log_test("Dashboard accessible (or redirects)", False, duration, str(e))
        return False

def test_no_console_errors():
    """Test 5: Pas d'erreurs visibles dans le HTML (simulation)"""
    start = time.time()
    try:
        # On vérifie simplement que les pages se chargent sans erreur 500
        pages_to_check = [
            FRONTEND_URL,
            f"{FRONTEND_URL}/auth/signin",
            f"{FRONTEND_URL}/auth/signup"
        ]

        all_good = True
        for url in pages_to_check:
            response = requests.get(url, timeout=10)
            if response.status_code >= 500:
                all_good = False
                break

        duration = (time.time() - start) * 1000
        log_test("No server errors on key pages", all_good, duration)
        return all_good
    except Exception as e:
        duration = (time.time() - start) * 1000
        log_test("No server errors on key pages", False, duration, str(e))
        return False

def test_response_times():
    """Test 6: Temps de réponse < 3s pour les pages critiques"""
    print("\n📊 Performance Test - Page Load Times:")

    pages = [
        ("Homepage", FRONTEND_URL),
        ("Signin", f"{FRONTEND_URL}/auth/signin"),
        ("Signup", f"{FRONTEND_URL}/auth/signup"),
    ]

    all_fast = True
    for name, url in pages:
        start = time.time()
        try:
            response = requests.get(url, timeout=10)
            duration = (time.time() - start) * 1000

            is_fast = duration < 3000
            status = "✅" if is_fast else "⚠️"
            print(f"  {status} {name}: {duration:.0f}ms")

            if not is_fast:
                all_fast = False
        except Exception as e:
            print(f"  ❌ {name}: Error - {e}")
            all_fast = False

    log_test("Page load times < 3s", all_fast, 0)
    return all_fast

def print_summary():
    """Affiche un résumé des tests"""
    print(f"\n{'='*60}")
    print("RÉSUMÉ DES TESTS FRONTEND")
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
    print("TESTS COMPLETS FRONTEND")
    print(f"{'='*60}\n")
    print(f"Frontend URL: {FRONTEND_URL}\n")

    # Exécuter les tests
    test_homepage()
    test_signup_page()
    test_signin_page()
    test_dashboard_redirect()
    test_no_console_errors()
    test_response_times()

    # Afficher le résumé
    all_passed = print_summary()

    return 0 if all_passed else 1

if __name__ == "__main__":
    exit(main())
