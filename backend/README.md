# INTOWORK Search - Backend (Phase 1)

Scaffold minimal pour démarrer la Phase 1 : FastAPI + PostgreSQL en Docker.

## Structure

- `app/` : code FastAPI minimal
- `Dockerfile` et `docker-compose.yml` pour démarrer localement
- `.env.example` variables d'environnement

## Usage rapide

1. Copier `.env.example` en `.env` et ajuster les valeurs :
```bash
cp .env.example .env
```

2. Démarrer les services :

```bash
docker-compose up --build
```

L'API sera disponible sur http://localhost:8000 et la documentation sur http://localhost:8000/docs

## Endpoints disponibles

- `GET /` - Status de l'API
- `GET /ping` - Test de connectivité
- `GET /docs` - Documentation Swagger
