#!/usr/bin/env python3
"""
Test du endpoint list jobs
"""
import requests
import json

def test_list_jobs():
    url = "http://localhost:8001/api/jobs"

    print(f"\n{'='*60}")
    print(f"TEST LIST JOBS ENDPOINT")
    print(f"{'='*60}\n")
    print(f"URL: {url}")

    try:
        response = requests.get(url)
        print(f"\n📡 Response Status: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            print(f"✅ List jobs réussi!")

            # Vérifier si c'est un dict avec une clé 'jobs' ou une liste directe
            jobs = data.get('jobs', data) if isinstance(data, dict) else data

            print(f"\nNombre de jobs: {len(jobs) if isinstance(jobs, list) else 'N/A (pas une liste)'}")
            print(f"Type de réponse: {type(data)}")

            if isinstance(jobs, list) and len(jobs) > 0:
                print(f"\n📋 Premiers jobs:")
                for job in jobs[:3]:
                    print(f"\n  - {job.get('title', 'N/A')}")
                    print(f"    Company ID: {job.get('company_id', 'N/A')}")
                    print(f"    Location: {job.get('location', 'N/A')}")
                    print(f"    Type: {job.get('job_type', 'N/A')}")
                    print(f"    Status: {job.get('status', 'N/A')}")
                    print(f"    Salary: {job.get('salary_min', 0)}-{job.get('salary_max', 0)} {job.get('currency', 'EUR')}")
            elif isinstance(data, dict):
                print(f"\nStructure de la réponse (dict):")
                print(f"  Clés: {list(data.keys())}")
            return True
        else:
            print(f"❌ List jobs échoué!")
            print(f"Response: {response.text}")
            return False

    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

if __name__ == "__main__":
    result = test_list_jobs()
    exit(0 if result else 1)
