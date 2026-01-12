#!/usr/bin/env python3
"""
Script pour créer des données de test (companies et jobs)
"""
import asyncio
from datetime import datetime
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models.base import User, Company, Employer, Job, JobStatus, JobType, JobLocation, UserRole

async def create_test_data():
    print(f"\n{'='*60}")
    print(f"CRÉATION DE DONNÉES DE TEST")
    print(f"{'='*60}\n")

    async with AsyncSessionLocal() as session:
        # Trouver ou créer un utilisateur employer
        print("1️⃣ Recherche d'un utilisateur employer...")
        employer_user_result = await session.execute(
            select(User).where(User.role == UserRole.EMPLOYER).limit(1)
        )
        employer_user = employer_user_result.scalar_one_or_none()

        if not employer_user:
            # Chercher l'admin pour le convertir en employer
            admin_result = await session.execute(
                select(User).where(User.email == "software@hcexecutive.net")
            )
            employer_user = admin_result.scalar_one_or_none()

            if employer_user:
                print(f"   ℹ️  Utilisation de l'utilisateur admin existant")
            else:
                print(f"   ❌ Aucun utilisateur trouvé!")
                return False

        print(f"   ✅ Utilisateur: {employer_user.email} (ID: {employer_user.id})")

        # Créer des companies
        print("\n2️⃣ Création de companies de test...")

        companies_data = [
            {
                "name": "TechCorp Solutions",
                "industry": "Technology",
                "size": "51-200",
                "city": "Paris",
                "country": "France",
                "website_url": "https://techcorp.example.com",
                "description": "Leading technology solutions provider specializing in AI and cloud services."
            },
            {
                "name": "Green Energy Systems",
                "industry": "Energy",
                "size": "201-500",
                "city": "Lyon",
                "country": "France",
                "website_url": "https://greenenergy.example.com",
                "description": "Renewable energy company focused on sustainable solutions."
            },
            {
                "name": "HealthTech Innovations",
                "industry": "Healthcare",
                "size": "11-50",
                "city": "Marseille",
                "country": "France",
                "website_url": "https://healthtech.example.com",
                "description": "Innovative healthcare technology startup improving patient care."
            }
        ]

        created_companies = []
        for company_data in companies_data:
            company = Company(**company_data)
            session.add(company)
            created_companies.append(company)
            print(f"   ✅ Company créée: {company.name}")

        await session.flush()  # Pour obtenir les IDs

        # Créer un employer record si nécessaire
        print("\n3️⃣ Vérification du profil employer...")
        employer_result = await session.execute(
            select(Employer).where(Employer.user_id == employer_user.id)
        )
        employer = employer_result.scalar_one_or_none()

        if not employer:
            # Créer un employer avec la première company
            employer = Employer(
                user_id=employer_user.id,
                company_id=created_companies[0].id,
                position="HR Manager",
                department="Human Resources"
            )
            session.add(employer)
            await session.flush()
            print(f"   ✅ Profil employer créé")
        else:
            print(f"   ℹ️  Profil employer existant")

        # Créer des jobs
        print("\n4️⃣ Création de jobs de test...")

        jobs_data = [
            # TechCorp Solutions jobs
            {
                "employer_id": employer.id,
                "company_id": created_companies[0].id,
                "title": "Senior Python Developer",
                "description": "We are looking for an experienced Python developer to join our backend team. You will work on scalable cloud applications using FastAPI, PostgreSQL, and AWS.",
                "requirements": "5+ years of Python experience\nExperience with FastAPI or Django\nPostgreSQL expertise\nAWS cloud services\nDocker and Kubernetes",
                "location": "Paris, France",
                "location_type": JobLocation.HYBRID,
                "job_type": JobType.FULL_TIME,
                "salary_min": 55000,
                "salary_max": 75000,
                "status": JobStatus.PUBLISHED
            },
            {
                "employer_id": employer.id,
                "company_id": created_companies[0].id,
                "title": "Frontend Developer (React)",
                "description": "Join our frontend team to build modern, responsive web applications using React, TypeScript, and Next.js.",
                "requirements": "3+ years of React experience\nTypeScript proficiency\nNext.js knowledge\nTailwind CSS\nResponsive design expertise",
                "location": "Paris, France",
                "location_type": JobLocation.REMOTE,
                "job_type": JobType.FULL_TIME,
                "salary_min": 45000,
                "salary_max": 60000,
                "status": JobStatus.PUBLISHED
            },
            {
                "employer_id": employer.id,
                "company_id": created_companies[0].id,
                "title": "DevOps Engineer",
                "description": "We need a DevOps engineer to manage our cloud infrastructure and CI/CD pipelines.",
                "requirements": "AWS or Azure experience\nDocker and Kubernetes\nTerraform or CloudFormation\nCI/CD tools (GitHub Actions, GitLab CI)\nMonitoring tools (Prometheus, Grafana)",
                "location": "Remote",
                "location_type": JobLocation.REMOTE,
                "job_type": JobType.FULL_TIME,
                "salary_min": 50000,
                "salary_max": 70000,
                "status": JobStatus.PUBLISHED
            },
            # Green Energy Systems jobs
            {
                "employer_id": employer.id,
                "company_id": created_companies[1].id,
                "title": "Data Scientist",
                "description": "Join our data science team to work on predictive models for energy consumption and optimization.",
                "requirements": "Master's in Data Science or related field\nPython (pandas, scikit-learn, TensorFlow)\nSQL expertise\nExperience with time-series analysis\nData visualization skills",
                "location": "Lyon, France",
                "location_type": JobLocation.HYBRID,
                "job_type": JobType.FULL_TIME,
                "salary_min": 48000,
                "salary_max": 65000,
                "status": JobStatus.PUBLISHED
            },
            {
                "employer_id": employer.id,
                "company_id": created_companies[1].id,
                "title": "Project Manager - Renewable Energy",
                "description": "Lead renewable energy projects from inception to completion, managing teams and stakeholders.",
                "requirements": "5+ years project management experience\nRenewable energy sector knowledge\nPMP or PRINCE2 certification preferred\nBudget management\nStakeholder communication",
                "location": "Lyon, France",
                "location_type": JobLocation.ON_SITE,
                "job_type": JobType.FULL_TIME,
                "salary_min": 52000,
                "salary_max": 68000,
                "status": JobStatus.PUBLISHED
            },
            # HealthTech Innovations jobs
            {
                "employer_id": employer.id,
                "company_id": created_companies[2].id,
                "title": "Full Stack Developer (Healthcare)",
                "description": "Build healthcare applications that make a difference in patient care. Work with modern tech stack.",
                "requirements": "3+ years full stack development\nReact and Node.js\nHealthcare domain knowledge (HIPAA, HL7) is a plus\nPostgreSQL or MongoDB\nSecurity-first mindset",
                "location": "Marseille, France",
                "location_type": JobLocation.HYBRID,
                "job_type": JobType.FULL_TIME,
                "salary_min": 42000,
                "salary_max": 58000,
                "status": JobStatus.PUBLISHED
            },
            {
                "employer_id": employer.id,
                "company_id": created_companies[2].id,
                "title": "Product Designer (UX/UI)",
                "description": "Design intuitive healthcare applications with focus on accessibility and user experience.",
                "requirements": "4+ years UX/UI design\nFigma or Sketch expertise\nHealthcare app design experience\nAccessibility standards (WCAG)\nUser research and testing",
                "location": "Remote",
                "location_type": JobLocation.REMOTE,
                "job_type": JobType.FULL_TIME,
                "salary_min": 40000,
                "salary_max": 55000,
                "status": JobStatus.PUBLISHED
            },
            {
                "employer_id": employer.id,
                "company_id": created_companies[2].id,
                "title": "Junior Software Engineer (Internship)",
                "description": "Great opportunity for recent graduates to learn and grow in a healthcare tech startup.",
                "requirements": "Computer Science degree or bootcamp graduate\nBasic knowledge of JavaScript or Python\nEagerness to learn\nGood communication skills\nTeam player",
                "location": "Marseille, France",
                "location_type": JobLocation.ON_SITE,
                "job_type": JobType.INTERNSHIP,
                "salary_min": 18000,
                "salary_max": 24000,
                "status": JobStatus.PUBLISHED
            }
        ]

        created_jobs = []
        for job_data in jobs_data:
            job = Job(**job_data)
            session.add(job)
            created_jobs.append(job)
            print(f"   ✅ Job créé: {job.title} chez {[c for c in created_companies if c.id == job.company_id][0].name}")

        # Commit toutes les modifications
        await session.commit()

        print(f"\n{'='*60}")
        print(f"✅ CRÉATION TERMINÉE")
        print(f"{'='*60}")
        print(f"\n📊 Résumé:")
        print(f"  - Companies créées: {len(created_companies)}")
        print(f"  - Jobs créés: {len(created_jobs)}")
        print(f"\n💡 Vous pouvez maintenant tester l'endpoint GET /api/jobs\n")

        return True

if __name__ == "__main__":
    result = asyncio.run(create_test_data())
    exit(0 if result else 1)
