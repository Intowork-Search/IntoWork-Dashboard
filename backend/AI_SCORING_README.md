# 🤖 Système de Scoring IA des Candidatures

## Vue d'ensemble

Le système de scoring IA utilise **Anthropic Claude 3.5 Sonnet** pour analyser automatiquement la compatibilité entre les candidats et les offres d'emploi.

## Fonctionnalités

### 1. **Scoring Individuel**
Permet de scorer une candidature spécifique avec une analyse détaillée.

### 2. **Scoring en Masse**
Score automatiquement toutes les candidatures non analysées d'une offre.

### 3. **Tri Intelligent**
Les candidatures sont triées par score IA (0-100) pour identifier rapidement les meilleurs profils.

## API Endpoints

### POST `/api/ai-scoring/score-application`
Score une candidature individuelle.

**Request:**
```json
{
  "application_id": 123
}
```

**Response:**
```json
{
  "success": true,
  "application_id": 123,
  "ai_score": 85.5,
  "ai_score_details": {
    "score": 85.5,
    "strengths": [
      "Expérience de 5 ans en développement Python",
      "Maîtrise de FastAPI et SQLAlchemy",
      "Formation en informatique pertinente"
    ],
    "weaknesses": [
      "Manque d'expérience avec Kubernetes",
      "Pas de certification AWS mentionnée"
    ],
    "skills_match": {
      "matched": ["Python", "FastAPI", "PostgreSQL", "Git"],
      "missing": ["Kubernetes", "AWS"],
      "percentage": 75
    },
    "experience_match": "Le candidat possède 5 ans d'expérience pertinente...",
    "recommendation": "Shortlist - Excellent profil technique, à interviewer"
  },
  "message": "Candidature scorée avec succès"
}
```

### POST `/api/ai-scoring/score-job-applications`
Score toutes les candidatures d'une offre.

**Request:**
```json
{
  "job_id": 456
}
```

**Response:**
```json
{
  "success": true,
  "job_id": 456,
  "scored_count": 15,
  "failed_count": 0,
  "message": "15 candidatures scorées avec succès, 0 échecs"
}
```

### GET `/api/ai-scoring/scored-applications/{job_id}`
Récupère les candidatures scorées triées par score.

**Query Parameters:**
- `page`: Numéro de page (défaut: 1)
- `limit`: Nombre de résultats par page (défaut: 20)
- `sort_by_score`: Trier par score IA (défaut: true)

**Response:**
```json
{
  "applications": [
    {
      "id": 123,
      "candidate_name": "John Doe",
      "candidate_email": "john@example.com",
      "ai_score": 92.5,
      "ai_score_details": { ... },
      "status": "applied",
      "applied_at": "2026-01-30T10:00:00Z"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 20,
  "total_pages": 3
}
```

## Critères d'évaluation

L'IA évalue les candidats selon ces critères :

| Critère | Poids |
|---------|-------|
| Compétences techniques | 40% |
| Expérience pertinente | 30% |
| Formation/diplômes | 15% |
| Soft skills | 10% |
| Adéquation culturelle/sectorielle | 5% |

## Configuration

### Variables d'environnement

Ajouter dans `.env` :
```bash
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
```

### Obtenir une clé API Anthropic

1. Créer un compte sur https://console.anthropic.com/
2. Aller dans "API Keys"
3. Créer une nouvelle clé
4. Ajouter $5 de crédits (offerts gratuitement)

### Migration de la base de données

```bash
# Appliquer la migration
cd backend
alembic upgrade head
```

## Modèle de données

### Nouveaux champs dans `job_applications`

```sql
ALTER TABLE job_applications ADD COLUMN ai_score FLOAT;
ALTER TABLE job_applications ADD COLUMN ai_score_details JSONB;
ALTER TABLE job_applications ADD COLUMN ai_analyzed_at TIMESTAMP WITH TIME ZONE;
CREATE INDEX idx_job_applications_ai_score ON job_applications(job_id, ai_score);
```

## Coûts

Anthropic Claude 3.5 Sonnet pricing (Janvier 2026) :
- Input: $3 / million tokens
- Output: $15 / million tokens

**Estimation par candidature :**
- ~1000 tokens input (CV + description offre)
- ~500 tokens output (analyse JSON)
- **Coût : ~$0.01 par candidature**

Pour 1000 candidatures/mois : **~$10/mois**

## Sécurité

- ✅ Authentification requise (employeurs uniquement)
- ✅ Vérification des permissions (offres de l'employeur uniquement)
- ✅ Rate limiting via SlowAPI
- ✅ Validation des données avec Pydantic
- ✅ Pas de stockage de données sensibles

## Performance

- ⚡ Analyse d'une candidature : ~3-5 secondes
- ⚡ Scoring en masse asynchrone
- ⚡ Index DB sur `ai_score` pour tri rapide
- ⚡ Cache Redis pour réutilisation (TODO)

## Roadmap

- [ ] Extraction automatique du texte des CV PDF
- [ ] Cache des analyses pour éviter rescore inutile
- [ ] Personnalisation des critères de scoring par employeur
- [ ] Export des candidats scorés en CSV
- [ ] Notifications quand un candidat de haut score postule
- [ ] A/B testing : scoring IA vs sélection manuelle

## Support

Pour toute question : support@intowork.com
