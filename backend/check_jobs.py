#!/usr/bin/env python3
"""
Script pour vérifier les jobs en base de données
"""
import asyncio
from sqlalchemy import select, func
from app.database import AsyncSessionLocal
from app.models.base import Job, Company

async def check_jobs():
    print(f"\n{'='*60}")
    print(f"DIAGNOSTIC: Vérification des jobs en base de données")
    print(f"{'='*60}\n")

    async with AsyncSessionLocal() as session:
        # Compter les jobs
        count_result = await session.execute(select(func.count()).select_from(Job))
        job_count = count_result.scalar()

        print(f"📊 Nombre total de jobs: {job_count}")

        if job_count == 0:
            print(f"\n❌ PROBLÈME: Aucun job en base de données!")
            print(f"\n💡 Solution: Créer des jobs de test\n")

            # Vérifier s'il y a des companies
            company_count_result = await session.execute(select(func.count()).select_from(Company))
            company_count = company_count_result.scalar()

            print(f"📊 Nombre de companies: {company_count}")

            if company_count > 0:
                companies_result = await session.execute(select(Company).limit(5))
                companies = companies_result.scalars().all()
                print(f"\n📋 Companies existantes:")
                for company in companies:
                    print(f"  - {company.name} (ID: {company.id})")

            return False

        # Lister quelques jobs
        jobs_result = await session.execute(
            select(Job).limit(10)
        )
        jobs = jobs_result.scalars().all()

        print(f"\n📋 Jobs existants ({len(jobs)} premiers):\n")
        for job in jobs:
            print(f"  {job.id}. {job.title}")
            print(f"     - Company ID: {job.company_id}")
            print(f"     - Status: {job.status}")
            print(f"     - Location: {job.location}")
            print(f"     - Type: {job.job_type}")
            print(f"     - Created: {job.created_at}")
            print()

        return True

if __name__ == "__main__":
    result = asyncio.run(check_jobs())
    exit(0 if result else 1)
