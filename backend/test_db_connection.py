import asyncio
from app.database import engine

async def test_connection():
    try:
        async with engine.connect() as conn:
            print("✅ Connexion Railway OK")
            result = await conn.execute("SELECT version();")
            version = await result.fetchone()
            print(f"✅ PostgreSQL version: {version[0]}")
    except Exception as e:
        print(f"❌ Erreur de connexion: {e}")

if __name__ == "__main__":
    asyncio.run(test_connection())
