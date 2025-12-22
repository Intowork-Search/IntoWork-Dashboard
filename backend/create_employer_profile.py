"""
Script pour créer un profil employeur et une entreprise pour un utilisateur
"""
from app.database import SessionLocal
from app.models.base import User, Employer, Company, UserRole

db = SessionLocal()

print("=== Création d'un profil employeur ===\n")

# L'email de l'utilisateur à convertir en employeur
user_email = "annandiayr161@gmail.com"

# Trouver l'utilisateur
user = db.query(User).filter(User.email == user_email).first()
if not user:
    print(f"❌ Utilisateur {user_email} non trouvé")
    db.close()
    exit(1)

print(f"✅ Utilisateur trouvé: {user.email}")

# Vérifier s'il a déjà un profil employeur
existing_employer = db.query(Employer).filter(Employer.user_id == user.id).first()
if existing_employer:
    print(f"⚠️  L'utilisateur a déjà un profil employeur")
    db.close()
    exit(0)

# Mettre à jour le rôle de l'utilisateur
user.role = UserRole.EMPLOYER
print(f"✅ Rôle mis à jour: {user.role}")

# Créer une nouvelle entreprise
company = Company(
    name="Mon Entreprise",
    description="Description de mon entreprise",
    industry="Technologie",
    size="1-10",
    website_url="https://www.monentreprise.com",
    city="Dakar",
    country="Sénégal"
)
db.add(company)
db.flush()  # Pour obtenir l'ID de l'entreprise
print(f"✅ Entreprise créée: {company.name} (ID: {company.id})")

# Créer le profil employeur
employer = Employer(
    user_id=user.id,
    company_id=company.id,
    position="CEO",
    is_admin=True
)
db.add(employer)
print(f"✅ Profil employeur créé (Admin: {employer.is_admin})")

db.commit()
print("\n🎉 Profil employeur créé avec succès!")
print(f"   User: {user.email}")
print(f"   Company: {company.name}")
print(f"   Role: {user.role}")

db.close()
