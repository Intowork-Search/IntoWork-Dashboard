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

# Détection de l'environnement Railway
is_railway_internal = "railway.internal" in DATABASE_URL.lower()
is_railway_external = "proxy.rlwy.net" in DATABASE_URL.lower() or ".railway.app" in DATABASE_URL.lower()
is_railway = is_railway_internal or is_railway_external

# Log de debug pour Railway (masquer le mot de passe)

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
    # Railway PostgreSQL FORCE SSL - on ne peut pas le désactiver
    # Créer un SSLContext avec PROTOCOL_TLS (pas TLS_CLIENT qui peut être trop strict)
    try:
        # Essayer PROTOCOL_TLS (plus permissif que TLS_CLIENT)
        ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS)
    except AttributeError:
        # Fallback si PROTOCOL_TLS n'existe pas
        ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
    
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE
    # Désactiver toutes les vérifications SSL
    ssl_context.set_ciphers('DEFAULT@SECLEVEL=1')  # Autoriser les anciens ciphers
    
    if is_railway_internal:
        # Connexion interne: moins strict
        engine_kwargs["connect_args"] = {
            "ssl": False,  # Pas de SSL pour connexion interne
            "server_settings": {
                "application_name": "intowork-backend"
            },
            "timeout": 60,  # Plus long timeout
            "command_timeout": 120
        }
    else:
        # Connexion externe: SSL obligatoire
        engine_kwargs["connect_args"] = {
            "ssl": ssl_context,  # SSLContext avec PROTOCOL_TLS
            "server_settings": {
                "application_name": "intowork-backend"
            },
            "timeout": 60,  # Plus long timeout pour connexion externe
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

# Base pour les modèles
Base = declarative_base()

# Dépendance async pour obtenir la DB session
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
