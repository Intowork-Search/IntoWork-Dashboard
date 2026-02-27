from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import os
import ssl
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

print(f"🔍 DEBUG Railway:")
print(f"   DATABASE_PRIVATE_URL définie: {bool(raw_private_url)}")
print(f"   DATABASE_URL définie: {bool(raw_public_url)}")

# Détection de l'environnement Railway
is_railway_internal = "railway.internal" in DATABASE_URL.lower()
is_railway_external = "proxy.rlwy.net" in DATABASE_URL.lower() or ".railway.app" in DATABASE_URL.lower()
is_railway = is_railway_internal or is_railway_external

# Log de debug pour Railway (masquer le mot de passe)
if is_railway:
    import re
    masked_url = re.sub(r':([^:@]+)@', ':****@', DATABASE_URL)
    connection_type = "INTERNE (*.railway.internal)" if is_railway_internal else "EXTERNE (proxy/public)"
    print(f"🔌 Connexion Railway détectée - Type: {connection_type}")
    print(f"   URL masquée: {masked_url}")
else:
    print(f"🏠 Connexion locale détectée")

# NE PAS ajouter ssl dans l'URL pour Railway
# On gère SSL via connect_args avec un SSLContext personnalisé (voir plus bas)

DATABASE_URL_ASYNC = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")

# Configuration pour Railway
engine_kwargs = {
    "echo": False,  # Set to True pour debug SQL
    "pool_size": 20,  # 20 connexions concurrentes
    "max_overflow": 10,  # 10 connexions supplémentaires si nécessaire
    "pool_pre_ping": True,  # Vérifie la connexion avant utilisation
}

# Ajouter connect_args pour SSL sur Railway (asyncpg)
if is_railway:
    # HYPOTHÈSE: Le proxy Railway (interchange.proxy.rlwy.net) gère déjà SSL
    # La connexion backend vers le proxy ne devrait peut-être PAS utiliser SSL
    # car le proxy fait la terminaison SSL
    
    # TEST: Essayer SANS SSL d'abord
    engine_kwargs["connect_args"] = {
        "ssl": False,  # Désactiver SSL - le proxy Railway le gère peut-être
        "server_settings": {
            "application_name": "intowork-backend"
        },
        "timeout": 30,  # Timeout de connexion
        "command_timeout": 60  # Timeout des commandes
    }
    print(f"🔒 Configuration SSL: DÉSACTIVÉ (test - le proxy Railway gère peut-être SSL)")

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

# Base pour les modèles
Base = declarative_base()

# Dépendance async pour obtenir la DB session
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
