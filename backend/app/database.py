from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
import os
from dotenv import load_dotenv

load_dotenv()

# URL de la base de données depuis les variables d'environnement
# IMPORTANT: Convertir postgresql:// vers postgresql+asyncpg:// pour async
# Sur Railway, privilégier DATABASE_PRIVATE_URL (connexion interne sans SSL)
# Si échec, fallback vers DATABASE_URL (connexion externe avec proxy)
raw_private_url = os.getenv("DATABASE_PRIVATE_URL")
raw_public_url = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5433/intowork")

# Utiliser l'URL interne si disponible, sinon l'URL publique
DATABASE_URL = raw_private_url or raw_public_url

# Détection de l'environnement Railway
is_railway_internal = "railway.internal" in DATABASE_URL.lower()
is_railway_external = "proxy.rlwy.net" in DATABASE_URL.lower() or ".railway.app" in DATABASE_URL.lower()
is_railway = is_railway_internal or is_railway_external

DATABASE_URL_ASYNC = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")

# Configuration pour Railway
engine_kwargs = {
    "echo": False,  # Set to True pour debug SQL
    "pool_size": 20,  # 20 connexions concurrentes
    "max_overflow": 10,  # 10 connexions supplémentaires si nécessaire
    "pool_pre_ping": True,  # Vérifie la connexion avant utilisation
    "pool_recycle": 3600,  # Recycler les connexions après 1h (évite les stales Railway)
    "pool_timeout": 30,  # Timeout si pas de connexion disponible
}

# Ajouter connect_args pour SSL sur Railway (asyncpg)
if is_railway:
    if is_railway_internal:
        # Connexion interne Railway: pas de SSL nécessaire
        engine_kwargs["connect_args"] = {
            "ssl": False,
            "server_settings": {
                "application_name": "intowork-backend"
            },
            "timeout": 60,
            "command_timeout": 120
        }
    else:
        # Connexion externe Railway: SSL requis sans vérification du certificat
        engine_kwargs["connect_args"] = {
            "ssl": "require",
            "server_settings": {
                "application_name": "intowork-backend"
            },
            "timeout": 60,
            "command_timeout": 120
        }

# Créer l'engine SQLAlchemy async avec pool optimisé
engine = create_async_engine(DATABASE_URL_ASYNC, **engine_kwargs)

# Session locale async
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)


# Base pour les modèles (SQLAlchemy 2.0+ pattern)
class Base(DeclarativeBase):
    pass


# Dépendance async pour obtenir la DB session
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
