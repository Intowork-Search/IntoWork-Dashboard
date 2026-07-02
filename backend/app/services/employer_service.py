"""Service utilitaire pour la gestion des profils employeur.

Fournit un mécanisme d'auto-réparation : si un utilisateur possède le rôle
``employer`` mais qu'aucune ligne ``Employer`` (ou ``Company``) ne lui est
associée, ces enregistrements sont créés à la volée. Cela évite les erreurs
404 « Employeur non trouvé » pour les comptes créés avant l'introduction de la
création automatique du profil, ou dont le commit initial a partiellement
échoué.
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.base import Company, Employer, User


async def get_or_create_employer(
    db: AsyncSession,
    user: User,
    *,
    with_company: bool = False,
) -> Employer:
    """Récupère le profil employeur d'un utilisateur, en le créant si absent.

    Args:
        db: Session asynchrone SQLAlchemy.
        user: L'utilisateur (rôle employeur) concerné.
        with_company: Si ``True``, garantit également qu'une entreprise est
            associée à l'employeur (création d'une entreprise par défaut si
            nécessaire).

    Returns:
        L'instance ``Employer`` associée à l'utilisateur, avec sa relation
        ``company`` chargée.
    """
    result = await db.execute(
        select(Employer)
        .options(selectinload(Employer.company))
        .filter(Employer.user_id == user.id)
    )
    employer = result.scalar_one_or_none()

    created = False
    if employer is None:
        employer = Employer(user_id=user.id)
        db.add(employer)
        created = True

    if with_company and employer.company_id is None:
        default_name = (
            user.name
            or f"{user.first_name or ''} {user.last_name or ''}".strip()
            or (user.email.split("@")[0] if user.email else "Mon entreprise")
        )
        company = Company(name=default_name)
        db.add(company)
        await db.flush()  # obtenir l'ID de l'entreprise
        employer.company_id = company.id
        created = True

    if created:
        await db.commit()
        await db.refresh(employer)
        # Recharger la relation company après le refresh
        result = await db.execute(
            select(Employer)
            .options(selectinload(Employer.company))
            .filter(Employer.id == employer.id)
        )
        employer = result.scalar_one()

    return employer
