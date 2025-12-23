#!/usr/bin/env python3
import requests
import sys

if len(sys.argv) < 2:
    print("Usage: python3 test_auth_jobs.py <JWT_TOKEN>")
    print("\nPour obtenir ton token:")
    print("1. Ouvre le navigateur et connecte-toi")
    print("2. Ouvre DevTools (F12)")
    print("3. Va dans Application > Cookies")
    print("4. Copie la valeur de 'authjs.session-token'")
    sys.exit(1)

token = sys.argv[1]

print('=== Test avec authentification ===\n')

# Test liste jobs
print('1. Test GET /api/jobs/')
headers = {"Authorization": f"Bearer {token}"}
response = requests.get('http://localhost:8001/api/jobs/', headers=headers)

if response.status_code == 200:
    data = response.json()
    print(f'✅ {data["total"]} jobs trouvés')
    for job in data['jobs'][:3]:
        applied_icon = '✓' if job['has_applied'] else '✗'
        print(f'  {applied_icon} Job #{job["id"]}: {job["title"]} - has_applied={job["has_applied"]}')
else:
    print(f'❌ Erreur {response.status_code}: {response.text}')

print('\n2. Test GET /api/jobs/{id} pour le premier job')
if response.status_code == 200 and data['jobs']:
    job_id = data['jobs'][0]['id']
    detail_response = requests.get(f'http://localhost:8001/api/jobs/{job_id}', headers=headers)
    if detail_response.status_code == 200:
        job_detail = detail_response.json()
        print(f'✅ Détails job #{job_id}')
        print(f'   Titre: {job_detail["title"]}')
        print(f'   has_applied: {job_detail["has_applied"]}')
    else:
        print(f'❌ Erreur {detail_response.status_code}')

print('\n3. Test GET /api/applications/my-applications')
apps_response = requests.get('http://localhost:8001/api/applications/my-applications', headers=headers)
if apps_response.status_code == 200:
    apps = apps_response.json()
    print(f'✅ {len(apps)} candidatures trouvées')
    if apps:
        print('   Jobs postulés:')
        for app in apps:
            print(f'   - Job #{app["job"]["id"]}: {app["job"]["title"]}')
else:
    print(f'❌ Erreur {apps_response.status_code}: {apps_response.text}')
