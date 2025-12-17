#!/usr/bin/env python3

import sys
import os
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Ajouter le répertoire parent au PYTHONPATH
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.models.base import Job, Company, Employer, User, JobType, JobLocation, JobStatus

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5433/intowork")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def add_sample_jobs():
    """Ajouter des offres d'emploi d'exemple"""
    db = SessionLocal()
    
    try:
        # Vérifier s'il y a des entreprises
        companies = db.query(Company).all()
        employers = db.query(Employer).all()
        
        if not companies or not employers:
            print("Aucune entreprise ou employeur trouvé. Création d'exemples...")
            
            # Créer des entreprises d'exemple
            sample_companies = [
                Company(
                    name="TechCorp Solutions",
                    description="Entreprise de technologie innovante spécialisée dans le développement web et mobile.",
                    industry="Technologie",
                    size="51-200",
                    website_url="https://techcorp.com",
                    city="Paris",
                    country="France",
                    logo_url="https://via.placeholder.com/100x100/007bff/ffffff?text=TC"
                ),
                Company(
                    name="Digital Innovators",
                    description="Agence digitale créative offrant des solutions de marketing digital et développement.",
                    industry="Marketing Digital",
                    size="11-50",
                    website_url="https://digitalinnovators.com",
                    city="Lyon",
                    country="France",
                    logo_url="https://via.placeholder.com/100x100/28a745/ffffff?text=DI"
                ),
                Company(
                    name="StartupX",
                    description="Startup en pleine croissance dans le domaine de la fintech.",
                    industry="Finance",
                    size="1-10",
                    website_url="https://startupx.com",
                    city="Marseille",
                    country="France",
                    logo_url="https://via.placeholder.com/100x100/dc3545/ffffff?text=SX"
                ),
                Company(
                    name="Green Solutions",
                    description="Entreprise spécialisée dans les technologies vertes et durables.",
                    industry="Environnement",
                    size="201-500",
                    website_url="https://greensolutions.com",
                    city="Bordeaux",
                    country="France",
                    logo_url="https://via.placeholder.com/100x100/20c997/ffffff?text=GS"
                )
            ]
            
            for company in sample_companies:
                db.add(company)
            db.commit()
            
            print(f"✅ {len(sample_companies)} entreprises créées")
            companies = sample_companies
        
        # Créer des offres d'emploi d'exemple
        sample_jobs = [
            {
                "title": "Développeur Full Stack React/Node.js",
                "description": """Nous recherchons un développeur Full Stack passionné pour rejoindre notre équipe dynamique.
                
Vous travaillerez sur des projets innovants utilisant les dernières technologies web. L'environnement est stimulant et offre de nombreuses opportunités d'apprentissage.

Notre stack technique inclut React, Node.js, TypeScript, PostgreSQL, et AWS. Vous participerez à toutes les phases du développement, de la conception à la mise en production.""",
                "requirements": """• 3+ années d'expérience en développement web
• Maîtrise de React et Node.js
• Connaissance de TypeScript
• Expérience avec les bases de données relationnelles
• Familiarité avec Git et les méthodologies Agile
• Bon niveau d'anglais technique""",
                "responsibilities": """• Développer et maintenir des applications web modernes
• Collaborer avec l'équipe design et produit
• Participer aux code reviews
• Optimiser les performances des applications
• Mentorer les développeurs juniors""",
                "benefits": """• Salaire compétitif + primes sur objectifs
• Télétravail flexible (2-3 jours/semaine)
• Formation continue et certifications
• Mutuelle premium
• RTT et congés payés
• Tickets restaurant
• Équipement moderne fourni""",
                "job_type": JobType.FULL_TIME,
                "location_type": JobLocation.HYBRID,
                "location": "Paris",
                "salary_min": 45000,
                "salary_max": 65000,
                "company": companies[0]
            },
            {
                "title": "Designer UX/UI Senior",
                "description": """Rejoignez notre équipe créative en tant que Designer UX/UI Senior !
                
Vous serez responsable de la conception d'expériences utilisateur exceptionnelles pour nos clients. Nous travaillons avec des marques prestigieuses sur des projets variés et stimulants.

Vous aurez l'opportunité de mener des projets de A à Z, de la recherche utilisateur à la livraison finale.""",
                "requirements": """• 5+ années d'expérience en design UX/UI
• Portfolio démontrant votre expertise
• Maîtrise de Figma, Adobe Creative Suite
• Connaissance des principes d'accessibilité
• Expérience en recherche utilisateur
• Capacité à travailler en équipe pluridisciplinaire""",
                "responsibilities": """• Concevoir des interfaces utilisateur intuitives
• Réaliser des recherches utilisateur et tests
• Créer des prototypes interactifs
• Collaborer étroitement avec les développeurs
• Maintenir et faire évoluer le design system""",
                "benefits": """• Salaire attractif selon expérience
• 4 jours de télétravail par semaine
• Budget formation 2000€/an
• Matériel Apple fourni
• Espaces de travail design
• Séminaires équipe réguliers""",
                "job_type": JobType.FULL_TIME,
                "location_type": JobLocation.HYBRID,
                "location": "Lyon",
                "salary_min": 50000,
                "salary_max": 70000,
                "company": companies[1]
            },
            {
                "title": "Product Manager",
                "description": """StartupX recherche un Product Manager pour piloter le développement de nos produits fintech innovants.
                
Vous rejoindrez une équipe agile et passionnée dans un environnement startup dynamique. Vous aurez un impact direct sur la stratégie produit et la croissance de l'entreprise.

Poste idéal pour quelqu'un qui souhaite évoluer dans un environnement entrepreneurial stimulant.""",
                "requirements": """• 3-5 années d'expérience en product management
• Expérience dans la fintech ou services financiers
• Maîtrise des méthodologies Agile/Scrum
• Compétences analytiques et data-driven
• Leadership et communication excellents
• Formation supérieure en ingénierie ou business""",
                "responsibilities": """• Définir la roadmap produit
• Gérer le backlog et prioriser les fonctionnalités
• Collaborer avec les équipes tech et business
• Analyser les métriques et KPIs
• Interface avec les clients et stakeholders""",
                "benefits": """• Package startup attractif + equity
• Télétravail total possible
• Budget R&D personnel
• Tickets restaurant + mutuelle
• Environnement startup dynamique
• Opportunités de croissance rapides""",
                "job_type": JobType.FULL_TIME,
                "location_type": JobLocation.REMOTE,
                "location": "Marseille",
                "salary_min": 55000,
                "salary_max": 75000,
                "company": companies[2]
            },
            {
                "title": "Ingénieur DevOps Cloud",
                "description": """Green Solutions recherche un Ingénieur DevOps pour accompagner notre croissance et optimiser notre infrastructure cloud.
                
Vous serez responsable de l'automatisation, du monitoring et de la sécurité de nos plateformes. Mission d'impact pour contribuer aux technologies vertes !

Rejoignez une entreprise à mission qui place la durabilité au cœur de ses préoccupations.""",
                "requirements": """• 4+ années d'expérience en DevOps/SRE
• Expertise AWS, Azure ou GCP
• Maîtrise Docker, Kubernetes
• Compétences en scripting (Python, Bash)
• Expérience CI/CD et Infrastructure as Code
• Certifications cloud appréciées""",
                "responsibilities": """• Gérer et optimiser l'infrastructure cloud
• Automatiser les déploiements et monitoring
• Assurer la sécurité et compliance
• Supporter les équipes de développement
• Améliorer les performances et coûts""",
                "benefits": """• Salaire compétitif + intéressement
• Télétravail 3 jours/semaine
• Formation et certifications prises en charge
• Impact environnemental positif
• Équipe passionnée et experte
• Évolution rapide possible""",
                "job_type": JobType.FULL_TIME,
                "location_type": JobLocation.HYBRID,
                "location": "Bordeaux",
                "salary_min": 55000,
                "salary_max": 80000,
                "company": companies[3]
            },
            {
                "title": "Développeur Frontend React",
                "description": """Poste de développeur Frontend dans une équipe agile travaillant sur des applications web modernes.
                
Vous aurez l'opportunité de travailler sur des projets variés et d'apprendre de nouvelles technologies. Environnement collaboratif et bienveillant.

Idéal pour un développeur souhaitant monter en compétences sur des technologies modernes.""",
                "requirements": """• 2+ années d'expérience React
• Maîtrise JavaScript ES6+, HTML5, CSS3
• Connaissance de Redux ou Context API
• Expérience des tests unitaires
• Familiarité avec les outils build modernes
• Sens du détail et de l'UX""",
                "responsibilities": """• Développer des interfaces utilisateur modernes
• Optimiser les performances frontend
• Collaborer avec les designers
• Maintenir la qualité du code
• Participer aux décisions techniques""",
                "benefits": """• Salaire selon profil
• Flexible sur le télétravail
• Matériel de qualité fourni
• Ambiance jeune et dynamique
• Projets techniques intéressants
• Formation continue""",
                "job_type": JobType.FULL_TIME,
                "location_type": JobLocation.ON_SITE,
                "location": "Paris",
                "salary_min": 38000,
                "salary_max": 52000,
                "company": companies[0]
            },
            {
                "title": "Data Scientist",
                "description": """Nous recherchons un Data Scientist pour analyser nos données et développer des modèles prédictifs.
                
Vous travaillerez sur des projets d'intelligence artificielle et de machine learning avec des données variées. Impact direct sur les décisions business.

Poste parfait pour quelqu'un passionné par les données et l'IA.""",
                "requirements": """• Master en Data Science, Statistiques ou équivalent
• 3+ années d'expérience en analyse de données
• Maîtrise Python, SQL, pandas, scikit-learn
• Expérience en ML/AI et visualisation
• Connaissance des outils cloud (AWS, GCP)
• Capacité à communiquer les insights""",
                "responsibilities": """• Analyser et modéliser les données
• Développer des algorithmes de ML
• Créer des dashboards et rapports
• Collaborer avec les équipes métier
• Optimiser les modèles en production""",
                "benefits": """• Excellent package salarial
• Télétravail jusqu'à 100%
• Conférences et formations IA
• Environnement technique de pointe
• Projets innovants
• Équipe d'experts""",
                "job_type": JobType.FULL_TIME,
                "location_type": JobLocation.REMOTE,
                "location": "Lyon",
                "salary_min": 50000,
                "salary_max": 75000,
                "company": companies[1]
            }
        ]
        
        # Créer un employeur fictif si nécessaire
        if not employers:
            # Obtenir le premier utilisateur admin ou créer un utilisateur fictif
            admin_user = db.query(User).first()
            if admin_user and companies:
                employer = Employer(
                    user_id=admin_user.id,
                    company_id=companies[0].id,
                    position="HR Manager",
                    department="Ressources Humaines",
                    can_create_jobs=True,
                    can_manage_candidates=True
                )
                db.add(employer)
                db.commit()
                employers = [employer]
        
        if employers and companies:
            jobs_created = 0
            for job_data in sample_jobs:
                company = job_data.pop('company')
                
                job = Job(
                    employer_id=employers[0].id,
                    company_id=company.id,
                    status=JobStatus.PUBLISHED,
                    is_featured=(jobs_created < 2),  # Les 2 premières sont featured
                    views_count=jobs_created * 10,  # Nombre de vues factice
                    applications_count=jobs_created * 2,  # Nombre de candidatures factice
                    posted_at=datetime.utcnow() - timedelta(days=jobs_created),
                    currency="EUR",
                    **job_data
                )
                
                db.add(job)
                jobs_created += 1
            
            db.commit()
            print(f"✅ {jobs_created} offres d'emploi créées avec succès!")
        else:
            print("❌ Impossible de créer les offres d'emploi - employeurs ou entreprises manquants")
    
    except Exception as e:
        print(f"❌ Erreur lors de la création des offres d'emploi: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_sample_jobs()
