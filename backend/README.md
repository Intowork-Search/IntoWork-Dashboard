# IntoWork Backend - Railway Deployment

## 🐘 Backend Python/FastAPI

Ce dossier contient le backend FastAPI de l'application IntoWork.

### Configuration automatique :
- **Language**: Python 3.11
- **Framework**: FastAPI 
- **Database**: PostgreSQL (à ajouter via Railway)
- **Build**: Dockerfile

### Variables d'environnement requises :
```env
DATABASE_URL=postgresql://... (automatique avec PostgreSQL Railway)
CLERK_SECRET_KEY=sk_live_...
PORT=8000 (automatique)
ENVIRONMENT=production
```

### Déploiement :
1. Railway détecte automatiquement le Dockerfile
2. Le script `start.sh` exécute les migrations
3. L'application démarre sur le port $PORT

## Structure

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
