from logging.config import fileConfig
import os
import sys
from dotenv import load_dotenv
import asyncio

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

# Ajouter le répertoire racine au path pour importer nos modèles
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

# Charger les variables d'environnement
load_dotenv()

# Import our models and database
from app.database import Base
from app.models import User, Candidate, Company, Employer

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
target_metadata = Base.metadata

# Set the database URL from environment variable
config.set_main_option("sqlalchemy.url", os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5433/intowork"))

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode (async).

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    
    def do_run_migrations(connection: Connection) -> None:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()

    async def run_async_migrations() -> None:
        """Create async engine and run migrations."""
        import ssl
        from sqlalchemy.ext.asyncio import create_async_engine
        
        # Get the database URL and ensure it uses asyncpg
        database_url = config.get_main_option("sqlalchemy.url")
        if database_url and database_url.startswith("postgresql://"):
            database_url = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)
        
        print(f"🔧 Alembic: Démarrage des migrations")
        print(f"   DATABASE_URL détectée: {bool(database_url)}")
        
        # Détection Railway pour configuration SSL
        is_railway_internal = "railway.internal" in (database_url or "").lower()
        is_railway_external = "proxy.rlwy.net" in (database_url or "").lower() or ".railway.app" in (database_url or "").lower()
        is_railway = is_railway_internal or is_railway_external
        
        # Configuration connect_args pour Railway
        connect_args = {}
        if is_railway:
            print(f"🔧 Alembic: Connexion Railway détectée", flush=True)
            if is_railway_internal:
                # Connexion interne: pas de SSL
                connect_args = {
                    "ssl": False,
                    "timeout": 60,
                    "command_timeout": 120
                }
                print(f"   Type: INTERNE - SSL DÉSACTIVÉ", flush=True)
            else:
                # Connexion externe: SSL avec SSLContext permissif
                try:
                    ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS)
                except AttributeError:
                    ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
                ssl_context.check_hostname = False
                ssl_context.verify_mode = ssl.CERT_NONE
                ssl_context.set_ciphers('DEFAULT@SECLEVEL=1')
                
                connect_args = {
                    "ssl": ssl_context,
                    "timeout": 60,
                    "command_timeout": 120
                }
                print(f"   Type: EXTERNE - SSL avec SSLContext permissif", flush=True)
        else:
            print(f"🏠 Alembic: Connexion locale détectée", flush=True)
        
        # Créer l'engine directement avec connect_args
        connectable = create_async_engine(
            database_url,
            connect_args=connect_args,
            poolclass=pool.NullPool,
        )

        async with connectable.connect() as connection:
            await connection.run_sync(do_run_migrations)

        await connectable.dispose()

    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
