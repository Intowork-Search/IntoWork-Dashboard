from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import os
from dotenv import load_dotenv

load_dotenv()

# URL de la base de données depuis les variables d'environnement
# IMPORTANT: Convertir postgresql:// vers postgresql+asyncpg:// pour async
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5433/intowork")
DATABASE_URL_ASYNC = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")

# Créer l'engine SQLAlchemy async avec pool optimisé
engine = create_async_engine(
    DATABASE_URL_ASYNC,
    echo=False,  # Set to True pour debug SQL
    pool_size=20,  # 20 connexions concurrentes
    max_overflow=10,  # 10 connexions supplémentaires si nécessaire
    pool_pre_ping=True  # Vérifie la connexion avant utilisation
)

# Session locale async
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

# Base pour les modèles
Base = declarative_base()

# Dépendance async pour obtenir la DB session
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
