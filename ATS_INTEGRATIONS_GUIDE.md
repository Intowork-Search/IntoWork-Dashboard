# 🔗 Guide des Intégrations Externes - ATS Phase 2

## Vue d'ensemble

Ce guide explique comment configurer et utiliser les intégrations externes pour le système ATS d'IntoWork.

**Intégrations disponibles** :
- 🔵 **LinkedIn** : Publication automatique des offres d'emploi
- 📅 **Google Calendar** : Planification d'entretiens avec Google Meet
- 📅 **Outlook/Teams** : Planification d'entretiens avec Microsoft Teams

---

## Architecture

### Base de données

**Table** : `integration_credentials`

```sql
CREATE TABLE integration_credentials (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    user_id INTEGER REFERENCES users(id),
    provider VARCHAR(50) NOT NULL,  -- linkedin, google_calendar, outlook_calendar
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_expires_at TIMESTAMP,
    provider_data JSONB,           -- Données spécifiques (organization_id, etc.)
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**Migration** : `b57ce0a7904b_add_integration_credentials.py`

### Services

#### 1. LinkedIn Service (`linkedin_service.py`)

**Fonctionnalités** :
- OAuth 2.0 avec scopes : `w_organization_social`, `r_organization_social`
- Publication d'offres via LinkedIn UGC API
- Formatage automatique avec emojis et hashtags
- Statistiques de posts (likes, comments, shares, impressions)

**Méthodes principales** :
```python
async def get_authorization_url(state: str) -> str
async def exchange_code_for_token(code: str) -> dict
async def publish_job_post(access_token: str, organization_id: str, job_data: dict) -> str
async def delete_job_post(access_token: str, post_id: str) -> bool
async def get_post_statistics(access_token: str, post_id: str) -> dict
```

#### 2. Google Calendar Service (`google_calendar_service.py`)

**Fonctionnalités** :
- OAuth 2.0 avec scopes : `calendar`, `calendar.events`
- Création d'événements avec Google Meet automatique
- Rafraîchissement automatique des tokens
- Gestion des fuseaux horaires
- Rappels automatiques (24h email + 30min popup)

**Méthodes principales** :
```python
async def get_authorization_url(state: str) -> str
async def exchange_code_for_token(code: str) -> dict
async def create_interview_event(access_token: str, interview_data: dict, refresh_token: str) -> str
async def update_interview_event(access_token: str, event_id: str, updates: dict) -> bool
async def delete_interview_event(access_token: str, event_id: str) -> bool
```

#### 3. Outlook Calendar Service (`outlook_calendar_service.py`)

**Fonctionnalités** :
- OAuth 2.0 avec scopes : `Calendars.ReadWrite`, `OnlineMeetings.ReadWrite`
- Création d'événements avec Microsoft Teams automatique
- API `findMeetingTimes` pour suggestions de créneaux
- Gestion multi-timezone
- Support tenant multi-organisation

**Méthodes principales** :
```python
async def get_authorization_url(state: str) -> str
async def exchange_code_for_token(code: str) -> dict
async def create_interview_event(access_token: str, interview_data: dict) -> str
async def get_available_time_slots(access_token: str, attendees: list, duration_minutes: int, start_date: str, end_date: str) -> list
async def update_interview_event(access_token: str, event_id: str, updates: dict) -> bool
```

---

## Configuration

### 1. Variables d'environnement

**Fichier** : `backend/.env`

```env
# LinkedIn Integration
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
LINKEDIN_REDIRECT_URI=http://localhost:8001/api/integrations/linkedin/callback

# Google Calendar Integration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8001/api/integrations/google-calendar/callback

# Microsoft Outlook/Teams Integration
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
MICROSOFT_REDIRECT_URI=http://localhost:8001/api/integrations/outlook/callback
MICROSOFT_TENANT_ID=common
```

### 2. Créer les applications OAuth

#### LinkedIn

1. Aller sur [LinkedIn Developers](https://www.linkedin.com/developers)
2. Créer une nouvelle application
3. Ajouter les **Redirect URLs** :
   - Dev : `http://localhost:8001/api/integrations/linkedin/callback`
   - Prod : `https://your-backend.railway.app/api/integrations/linkedin/callback`
4. Activer les **scopes** : `w_organization_social`, `r_organization_social`
5. Copier le **Client ID** et **Client Secret**

#### Google Calendar

1. Aller sur [Google Cloud Console](https://console.cloud.google.com)
2. Créer un projet ou sélectionner un existant
3. Activer **Google Calendar API**
4. Créer des **OAuth 2.0 credentials** (Type: Web application)
5. Ajouter les **Authorized redirect URIs** :
   - Dev : `http://localhost:8001/api/integrations/google-calendar/callback`
   - Prod : `https://your-backend.railway.app/api/integrations/google-calendar/callback`
6. Copier le **Client ID** et **Client Secret**

#### Microsoft Outlook/Teams

1. Aller sur [Azure Portal](https://portal.azure.com)
2. **App registrations** → **New registration**
3. Nom : "IntoWork ATS"
4. **Redirect URI** : Web → `http://localhost:8001/api/integrations/outlook/callback` (+ prod)
5. **API permissions** :
   - Microsoft Graph → Delegated permissions
   - Ajouter : `Calendars.ReadWrite`, `OnlineMeetings.ReadWrite`
6. **Certificates & secrets** → Créer un **Client secret**
7. Copier **Application (client) ID**, **Client secret**, et **Directory (tenant) ID**

---

## API Endpoints

### LinkedIn

#### 1. Obtenir l'URL d'autorisation
```http
GET /api/integrations/linkedin/auth-url
Authorization: Bearer {jwt_token}
```

**Réponse** :
```json
{
  "authorization_url": "https://www.linkedin.com/oauth/v2/authorization?...",
  "state": "random-state-token",
  "provider": "linkedin"
}
```

**Usage** :
1. Frontend fait cette requête
2. Frontend redirige l'utilisateur vers `authorization_url`
3. Utilisateur autorise l'accès sur LinkedIn
4. LinkedIn redirige vers `/callback` avec le code

#### 2. Callback OAuth (automatique)
```http
GET /api/integrations/linkedin/callback?code=xxx&state=xxx
Authorization: Bearer {jwt_token}
```

**Traitement** :
- Échange le code contre un access token
- Récupère l'organization ID
- Stocke les credentials en base de données
- Retourne succès

#### 3. Publier une offre d'emploi
```http
POST /api/integrations/linkedin/publish-job
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "job_id": 123,
  "custom_message": "Message personnalisé optionnel"
}
```

**Réponse** :
```json
{
  "message": "Job published to LinkedIn successfully",
  "post_id": "urn:li:share:7654321",
  "job_id": 123
}
```

---

### Google Calendar

#### 1. Obtenir l'URL d'autorisation
```http
GET /api/integrations/google-calendar/auth-url
Authorization: Bearer {jwt_token}
```

#### 2. Créer un événement d'entretien
```http
POST /api/integrations/google-calendar/create-event
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "application_id": 456,
  "title": "Entretien technique - Développeur Full Stack",
  "description": "Entretien avec le CTO pour discuter de vos compétences techniques.",
  "start_time": "2026-03-01T14:00:00",
  "end_time": "2026-03-01T15:00:00",
  "location": "Visioconférence",
  "attendees": ["candidate@email.com", "recruiter@company.com"],
  "create_meeting_link": true,
  "timezone": "Europe/Paris"
}
```

**Réponse** :
```json
{
  "message": "Google Calendar event created",
  "event_id": "abc123xyz789"
}
```

**Notes** :
- Si `create_meeting_link: true`, un lien Google Meet est généré automatiquement
- Rappels automatiques : 24h avant (email) + 30min avant (popup)
- Le lien Meet est inclus dans l'invitation

---

### Outlook/Teams

#### 1. Obtenir l'URL d'autorisation
```http
GET /api/integrations/outlook/auth-url
Authorization: Bearer {jwt_token}
```

#### 2. Créer un événement d'entretien
```http
POST /api/integrations/outlook/create-event
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "application_id": 456,
  "title": "Entretien RH - Chef de Projet",
  "description": "Premier entretien pour évaluer votre fit culturel.",
  "start_time": "2026-03-01T10:00:00",
  "end_time": "2026-03-01T11:00:00",
  "location": "Microsoft Teams",
  "attendees": ["candidate@email.com", "hr@company.com"],
  "create_meeting_link": true,
  "timezone": "Europe/Paris"
}
```

**Réponse** :
```json
{
  "message": "Outlook Calendar event created",
  "event_id": "AAMkAGI1..."
}
```

**Notes** :
- Si `create_meeting_link: true`, un lien Microsoft Teams est généré
- Support de `findMeetingTimes` pour trouver des créneaux disponibles
- Compatible multi-timezone

---

### Gestion des intégrations

#### 1. Statut de toutes les intégrations
```http
GET /api/integrations/status
Authorization: Bearer {jwt_token}
```

**Réponse** :
```json
{
  "linkedin": {
    "provider": "linkedin",
    "is_connected": true,
    "connected_at": "2026-02-26T13:00:00Z",
    "last_used_at": "2026-02-26T14:30:00Z"
  },
  "google_calendar": {
    "provider": "google_calendar",
    "is_connected": false,
    "connected_at": null,
    "last_used_at": null
  },
  "outlook_calendar": {
    "provider": "outlook_calendar",
    "is_connected": true,
    "connected_at": "2026-02-26T13:15:00Z",
    "last_used_at": "2026-02-26T15:00:00Z"
  }
}
```

#### 2. Déconnecter une intégration
```http
DELETE /api/integrations/{provider}/disconnect
Authorization: Bearer {jwt_token}
```

**Providers** : `linkedin`, `google_calendar`, `outlook_calendar`

---

## Frontend - Flow utilisateur

### Connecter une intégration (exemple LinkedIn)

```typescript
// 1. Obtenir l'URL d'autorisation
const response = await fetch('/api/integrations/linkedin/auth-url', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { authorization_url, state } = await response.json();

// 2. Stocker le state en localStorage (CSRF protection)
localStorage.setItem('oauth_state', state);

// 3. Rediriger vers LinkedIn
window.location.href = authorization_url;

// 4. LinkedIn redirige vers /callback automatiquement
// Backend échange le code et stocke les credentials

// 5. Retourner au dashboard des intégrations
```

### Publier une offre sur LinkedIn

```typescript
const publishToLinkedIn = async (jobId: number) => {
  try {
    const response = await fetch('/api/integrations/linkedin/publish-job', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ job_id: jobId })
    });
    
    const result = await response.json();
    
    if (result.post_id) {
      toast.success('Offre publiée sur LinkedIn avec succès !');
    }
  } catch (error) {
    toast.error('Erreur lors de la publication sur LinkedIn');
  }
};
```

### Créer un événement Google Calendar

```typescript
const scheduleInterview = async (applicationId: number, data: InterviewData) => {
  try {
    const response = await fetch('/api/integrations/google-calendar/create-event', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        application_id: applicationId,
        title: data.title,
        description: data.description,
        start_time: data.startTime.toISOString(),
        end_time: data.endTime.toISOString(),
        attendees: [candidateEmail, recruiterEmail],
        create_meeting_link: true,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      })
    });
    
    const result = await response.json();
    
    if (result.event_id) {
      toast.success('Entretien planifié ! Invitations envoyées.');
    }
  } catch (error) {
    toast.error('Erreur lors de la planification');
  }
};
```

---

## Sécurité

### OAuth State Token

**IMPORTANT** : Toujours vérifier le `state` token pour prévenir les attaques CSRF.

```typescript
// Avant la redirection
const state = crypto.randomUUID();
sessionStorage.setItem('oauth_state', state);

// Au retour de callback
const returnedState = new URLSearchParams(window.location.search).get('state');
const savedState = sessionStorage.getItem('oauth_state');

if (returnedState !== savedState) {
  throw new Error('State mismatch - potential CSRF attack');
}
```

### Token Refresh

Les tokens expirent généralement après :
- **LinkedIn** : 60 jours
- **Google** : 1 heure (avec refresh token)
- **Outlook** : 1 heure (avec refresh token)

Les services gèrent automatiquement le refresh pour Google et Outlook.

### Permissions

- Seuls les **employeurs** peuvent connecter/utiliser les intégrations
- Chaque intégration est liée à une **company_id**
- Les tokens sont stockés de manière sécurisée en base de données
- Possibilité de chiffrer les tokens (TODO : ajouter chiffrement)

---

## Déploiement Production

### Railway

1. Ajouter les variables d'environnement dans Railway dashboard
2. S'assurer que les **Redirect URIs** pointent vers le domaine de production
3. Vérifier que les scopes OAuth sont approuvés en production

**Exemple de redirect URIs production** :
```
https://intowork-backend-production.railway.app/api/integrations/linkedin/callback
https://intowork-backend-production.railway.app/api/integrations/google-calendar/callback
https://intowork-backend-production.railway.app/api/integrations/outlook/callback
```

### CORS

S'assurer que le frontend en production est autorisé :

```python
# backend/app/main.py
allowed_origins = [
    "https://intowork.co",
    "https://www.intowork.co"
]
```

---

## Tests

### Test manuel

1. **Connecter LinkedIn** :
   ```bash
   curl http://localhost:8001/api/integrations/linkedin/auth-url \
     -H "Authorization: Bearer YOUR_JWT"
   ```

2. **Vérifier le statut** :
   ```bash
   curl http://localhost:8001/api/integrations/status \
     -H "Authorization: Bearer YOUR_JWT"
   ```

3. **Publier un job (après connexion)** :
   ```bash
   curl -X POST http://localhost:8001/api/integrations/linkedin/publish-job \
     -H "Authorization: Bearer YOUR_JWT" \
     -H "Content-Type: application/json" \
     -d '{"job_id": 1}'
   ```

---

## Prochaines étapes

### À implémenter

1. **Frontend UI** :
   - Page de gestion des intégrations (`/dashboard/integrations`)
   - Composant de connexion OAuth
   - Bouton "Publier sur LinkedIn" sur chaque job
   - Calendrier de sélection pour planifier entretiens

2. **Fonctionnalités avancées** :
   - Planification automatique d'entretiens (suggérer créneaux)
   - Templates de messages LinkedIn personnalisés
   - Synchronisation bidirectionnelle calendriers
   - Analytics sur les publications LinkedIn

3. **Autres intégrations** :
   - Job boards africains (Jobberman, BrighterMonday)
   - Slack pour notifications d'équipe
   - Zoom pour alternatives aux Meet/Teams

---

## Support et Documentation

- **LinkedIn API** : https://docs.microsoft.com/en-us/linkedin/
- **Google Calendar API** : https://developers.google.com/calendar
- **Microsoft Graph API** : https://docs.microsoft.com/en-us/graph/
- **OAuth 2.0** : https://oauth.net/2/

---

**Créé le** : 26 février 2026  
**Version** : 1.0  
**Auteur** : IntoWork Dev Team
