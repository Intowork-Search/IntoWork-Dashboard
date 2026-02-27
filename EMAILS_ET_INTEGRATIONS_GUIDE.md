# 🎉 RÉCAPITULATIF : Emails Automatiques et Intégrations OAuth

## ✅ Modifications Effectuées

### 1. **Envoi Automatique d'Emails dans les Candidatures**

Fichier modifié : `backend/app/api/applications.py`

#### Quand un candidat postule :
- ✉️ Email de **confirmation de candidature reçue** envoyé automatiquement
- Utilise le template `application_received` (si configuré par l'entreprise)
- Variables pré-remplies : nom candidat, titre du poste, entreprise, date

#### Quand le recruteur change le statut :
- ✉️ **Invitation à un entretien** → Template `interview_invitation`
- ✉️ **Offre d'emploi** → Template `offer`
- ✉️ **Refus** → Template `rejection`
- Variables incluses : nom, poste, entreprise, recruteur, date

### 2. **Guides d'Utilisation Créés**

#### `GUIDE_EMAIL_TEMPLATES_USAGE.py`
- 5 exemples complets d'utilisation des templates
- Bonnes pratiques
- Code prêt à l'emploi

#### `GUIDE_OAUTH_INTEGRATIONS.py`
- Guide complet pour LinkedIn, Google Calendar, Outlook
- Exemples de création d'événements calendrier
- Vérification d'intégrations actives
- Gestion des tokens expirés

---

## 📧 Comment Utiliser les Templates d'Email

### **Étape 1 : Créer des Templates depuis le Dashboard**

1. Allez sur : `https://www.intowork.co/dashboard/email-templates`
2. Cliquez sur "Créer un template"
3. Choisissez le type :
   - `welcome_candidate` - Bienvenue
   - `application_received` - Confirmation candidature ✅ **Envoyé auto**
   - `interview_invitation` - Invitation entretien ✅ **Envoyé auto**
   - `offer` - Offre d'emploi ✅ **Envoyé auto**
   - `rejection` - Refus ✅ **Envoyé auto**
   - `follow_up` - Suivi

4. Utilisez les variables :
   ```
   {candidate_name}
   {candidate_first_name}
   {job_title}
   {company_name}
   {interview_date}
   {interview_time}
   {interview_location}
   {recruiter_name}
   ```

5. Marquez comme "par défaut" pour l'envoi automatique

### **Étape 2 : Les Emails s'Envoient Automatiquement**

Dès qu'un template par défaut existe :

- ✅ Candidat postule → Email de confirmation automatique
- ✅ Recruteur change le statut → Email selon le nouveau statut
- ✅ Compteur d'utilisation mis à jour (`usage_count`, `last_used_at`)

### **Étape 3 : Envoyer Manuellement depuis le Code**

```python
from app.services.email_service import email_service

await email_service.send_from_template(
    template_id=5,
    to_email="candidat@example.com",
    variables={
        "candidate_name": "Marie Martin",
        "job_title": "Chef de Projet",
        "company_name": "TechCorp",
        "interview_date": "20 mars 2026",
        "interview_time": "14:00",
    },
    db=db
)
```

---

## 🔗 Comment Utiliser les Intégrations OAuth

### **LinkedIn**

**Connecter :**
```
Frontend → GET /api/integrations/linkedin/auth-url
→ Redirection vers LinkedIn OAuth
→ Callback → /api/integrations/linkedin/callback
→ Token stocké dans oauth_integrations
```

**Utiliser :**
```python
# Publier une offre sur LinkedIn
POST /api/integrations/linkedin/publish-job
{
  "job_id": 123,
  "message": "Nous recrutons !"
}
```

### **Google Calendar**

**Connecter :**
```
Frontend → GET /api/integrations/google-calendar/auth-url
→ Consentement Google
→ Callback → Token stocké
```

**Créer un événement :**
```python
POST /api/integrations/google-calendar/create-event
{
  "summary": "Entretien - Développeur Python",
  "description": "Entretien avec Marie Martin",
  "start_time": "2026-03-20T14:00:00",
  "end_time": "2026-03-20T15:00:00",
  "location": "Bureau Paris",
  "attendees": ["candidat@example.com"]
}
```

### **Microsoft Outlook**

**Connecter :**
```
Frontend → GET /api/integrations/outlook/auth-url
→ Consentement Microsoft
→ Callback → Token stocké
```

**Créer un événement :**
```python
POST /api/integrations/outlook/create-event
{
  "subject": "Entretien - Chef de Projet",
  "body": "Entretien technique",
  "start_time": "2026-03-20T14:00:00",
  "end_time": "2026-03-20T15:00:00",
  "location": "Teams",
  "attendees": ["candidat@example.com"]
}
```

---

## 🎯 Workflow Complet : Planifier un Entretien

### 1. **Recruteur change le statut → "Interview"**

```python
PUT /api/employer/applications/{application_id}/status
{
  "status": "interview"
}
```

**Ce qui se passe automatiquement :**
- ✅ Notification créée pour le candidat
- ✅ Email d'invitation envoyé (si template `interview_invitation` existe)
- ✅ Variables pré-remplies (nom, poste, entreprise)

### 2. **Créer l'événement calendrier**

Si le candidat a connecté Google Calendar ou Outlook :

```python
from app.services.google_calendar_service import google_calendar_service

# Vérifier si connecté
has_calendar = await is_google_calendar_connected(candidate.user_id, db)

if has_calendar:
    event = await google_calendar_service.create_event(
        user_id=candidate.user_id,
        event_data={
            "summary": f"Entretien - {job.title}",
            "start_time": "2026-03-20T14:00:00",
            "end_time": "2026-03-20T15:00:00",
            "attendees": [candidate.email, recruiter.email]
        },
        db=db
    )
```

### 3. **Envoyer l'email avec le lien calendrier**

Le template `interview_invitation` peut inclure :
```
Vous êtes invité(e) à un entretien !

Date : {interview_date}
Heure : {interview_time}
Lieu : {interview_location}

📅 L'événement a été ajouté à votre calendrier Google/Outlook.

Cordialement,
{recruiter_name}
```

---

## 📊 Endpoints API Disponibles

### **Email Templates**
```
GET    /api/email-templates              # Lister tous les templates
POST   /api/email-templates              # Créer un template
GET    /api/email-templates/{id}         # Récupérer un template
PUT    /api/email-templates/{id}         # Modifier un template
DELETE /api/email-templates/{id}         # Supprimer un template
GET    /api/email-templates/variables    # Variables disponibles
```

### **OAuth Integrations**
```
GET    /api/integrations/status                        # Statut des intégrations
DELETE /api/integrations/{provider}/disconnect         # Déconnecter

LinkedIn:
  GET  /api/integrations/linkedin/auth-url             # URL de connexion
  GET  /api/integrations/linkedin/callback             # Callback
  POST /api/integrations/linkedin/publish-job          # Publier une offre

Google Calendar:
  GET  /api/integrations/google-calendar/auth-url      # URL de connexion
  GET  /api/integrations/google-calendar/callback      # Callback
  POST /api/integrations/google-calendar/create-event  # Créer événement

Outlook:
  GET  /api/integrations/outlook/auth-url              # URL de connexion
  GET  /api/integrations/outlook/callback              # Callback
  POST /api/integrations/outlook/create-event          # Créer événement
```

---

## 🚀 Prochaines Étapes Recommandées

1. **Créer vos templates d'email** depuis le dashboard
   - Au minimum : `application_received`, `interview_invitation`, `rejection`
   - Marquer comme "par défaut" pour l'envoi automatique

2. **Tester le workflow complet :**
   - Créer un compte candidat de test
   - Postuler à une offre → Vérifier l'email de confirmation
   - Changer le statut en "interview" → Vérifier l'email d'invitation

3. **Connecter vos intégrations OAuth :**
   - Allez sur `/dashboard/settings`
   - Connectez Google Calendar et/ou Outlook
   - Testez la création d'événements

4. **Personnaliser les templates :**
   - Ajouter votre branding
   - Adapter le ton et le style
   - Inclure des informations spécifiques à votre entreprise

5. **Monitorer l'utilisation :**
   - Vérifier `usage_count` pour voir quels templates sont populaires
   - Ajuster les templates selon les retours des candidats

---

## 💡 Conseils

- **Templates** : Créez au moins un template par défaut pour chaque type
- **Variables** : Toujours tester avec des données réelles avant de marquer comme défaut
- **OAuth** : Expliquer aux candidats pourquoi connecter leur calendrier (gain de temps)
- **Logs** : Surveiller les logs Railway pour voir si les emails sont bien envoyés
- **Backup** : Garder une copie des templates importants (export/import futur)

---

## 🔧 Debugging

### **Les emails ne s'envoient pas ?**

1. Vérifiez que Resend API key est configurée dans Railway :
   ```
   RESEND_API_KEY=re_...
   ```

2. Vérifiez qu'un template par défaut existe :
   ```sql
   SELECT * FROM email_templates 
   WHERE type = 'application_received' 
   AND is_default = true 
   AND is_active = true;
   ```

3. Consultez les logs Railway :
   ```
   ✅ Application confirmation email sent to...
   ❌ Failed to send application confirmation email...
   ```

### **Les intégrations OAuth ne fonctionnent pas ?**

1. Vérifiez les variables Railway :
   ```
   GOOGLE_CLIENT_ID
   GOOGLE_CLIENT_SECRET
   MICROSOFT_CLIENT_ID
   MICROSOFT_CLIENT_SECRET
   MICROSOFT_TENANT_ID
   LINKEDIN_CLIENT_ID
   LINKEDIN_CLIENT_SECRET
   ```

2. Vérifiez les redirect URIs dans les consoles :
   - Google : `https://intowork-dashboard-production-1ede.up.railway.app/api/integrations/google-calendar/callback`
   - Microsoft : `https://intowork-dashboard-production-1ede.up.railway.app/api/integrations/outlook/callback`
   - LinkedIn : `https://intowork-dashboard-production-1ede.up.railway.app/api/integrations/linkedin/callback`

3. Utilisez le debug endpoint :
   ```
   GET /api/integrations/debug/config
   ```

---

**Tout est prêt ! Les emails et intégrations fonctionnent automatiquement dès que vous créez les templates et connectez les comptes.** 🎉
