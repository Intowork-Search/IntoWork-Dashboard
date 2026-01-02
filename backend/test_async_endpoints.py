#!/usr/bin/env python3
"""
Script de test pour valider la migration async du backend IntoWork
Tests les endpoints critiques après migration SQLAlchemy async
"""

import asyncio
import sys
from sqlalchemy import text, select, func
from sqlalchemy.ext.asyncio import AsyncSession

# Import des modules async
from app.database import AsyncSessionLocal, engine
from app.models.base import User, Job, JobApplication, Candidate, Company

async def test_database_connection():
    """Test 1: Connexion à la base de données async"""
    print("\n=== Test 1: Connexion Base de Données ===")
    try:
        async with AsyncSessionLocal() as session:
            result = await session.execute(text("SELECT 1"))
            test_value = result.scalar()
            assert test_value == 1
            print("✅ Connexion PostgreSQL async OK")
            return True
    except Exception as e:
        print(f"❌ Erreur connexion: {e}")
        return False

async def test_count_queries():
    """Test 2: Count queries sur toutes les tables principales"""
    print("\n=== Test 2: Count Queries (Async) ===")
    try:
        async with AsyncSessionLocal() as session:
            # Count Users
            result = await session.execute(select(func.count()).select_from(User))
            user_count = result.scalar()
            print(f"✅ Users: {user_count}")

            # Count Jobs
            result = await session.execute(select(func.count()).select_from(Job))
            job_count = result.scalar()
            print(f"✅ Jobs: {job_count}")

            # Count Applications
            result = await session.execute(select(func.count()).select_from(JobApplication))
            app_count = result.scalar()
            print(f"✅ Applications: {app_count}")

            # Count Candidates
            result = await session.execute(select(func.count()).select_from(Candidate))
            candidate_count = result.scalar()
            print(f"✅ Candidates: {candidate_count}")

            # Count Companies
            result = await session.execute(select(func.count()).select_from(Company))
            company_count = result.scalar()
            print(f"✅ Companies: {company_count}")

            print(f"\nTotal: {user_count + job_count + app_count + candidate_count + company_count} records")
            return True
    except Exception as e:
        print(f"❌ Erreur count queries: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_select_queries():
    """Test 3: Select queries avec filtres"""
    print("\n=== Test 3: Select Queries ===")
    try:
        async with AsyncSessionLocal() as session:
            # Select Users avec limit
            result = await session.execute(
                select(User).limit(5)
            )
            users = result.scalars().all()
            print(f"✅ Select Users (limit 5): {len(users)} users")

            # Select Jobs avec filtre
            result = await session.execute(
                select(Job).limit(5)
            )
            jobs = result.scalars().all()
            print(f"✅ Select Jobs (limit 5): {len(jobs)} jobs")

            return True
    except Exception as e:
        print(f"❌ Erreur select queries: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_eager_loading():
    """Test 4: Eager loading avec selectinload"""
    print("\n=== Test 4: Eager Loading (N+1 Prevention) ===")
    try:
        from sqlalchemy.orm import selectinload

        async with AsyncSessionLocal() as session:
            # Test eager loading JobApplication avec job
            result = await session.execute(
                select(JobApplication)
                .options(selectinload(JobApplication.job))
                .limit(3)
            )
            applications = result.scalars().all()
            print(f"✅ JobApplication avec eager loading: {len(applications)}")

            # Vérifier que les jobs sont chargés
            for app in applications:
                if app.job:
                    print(f"   - Application #{app.id} → Job: {app.job.title[:30]}...")
                    break

            return True
    except Exception as e:
        print(f"❌ Erreur eager loading: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_concurrent_queries():
    """Test 5: Queries concurrentes (avantage async)"""
    print("\n=== Test 5: Queries Concurrentes ===")
    try:
        async with AsyncSessionLocal() as session:
            # Lancer 3 queries en parallèle
            tasks = [
                session.execute(select(func.count()).select_from(User)),
                session.execute(select(func.count()).select_from(Job)),
                session.execute(select(func.count()).select_from(JobApplication))
            ]

            results = await asyncio.gather(*tasks)

            counts = [r.scalar() for r in results]
            print(f"✅ Concurrent queries OK: Users={counts[0]}, Jobs={counts[1]}, Apps={counts[2]}")
            return True
    except Exception as e:
        print(f"❌ Erreur concurrent queries: {e}")
        import traceback
        traceback.print_exc()
        return False

async def run_all_tests():
    """Exécuter tous les tests"""
    print("="*60)
    print("🧪 TESTS DE VALIDATION BACKEND ASYNC")
    print("="*60)

    tests = [
        ("Connexion DB", test_database_connection),
        ("Count Queries", test_count_queries),
        ("Select Queries", test_select_queries),
        ("Eager Loading", test_eager_loading),
        ("Concurrent Queries", test_concurrent_queries),
    ]

    results = []
    for name, test_func in tests:
        result = await test_func()
        results.append((name, result))

    # Résumé
    print("\n" + "="*60)
    print("📊 RÉSUMÉ DES TESTS")
    print("="*60)

    passed = sum(1 for _, r in results if r)
    total = len(results)

    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {name}")

    print(f"\nRésultat: {passed}/{total} tests réussis")

    if passed == total:
        print("\n🎉 TOUS LES TESTS PASSENT!")
        print("✅ Backend async SQLAlchemy fonctionnel")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test(s) échoué(s)")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(run_all_tests())
    sys.exit(exit_code)
