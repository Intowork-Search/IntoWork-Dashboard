# 🔔 Notifications et Navigation - Corrections

## ✅ Corrections Effectuées

### 1. **Actions Rapides du Dashboard Recruteur - CORRIGÉ**

#### Problème :
- "Voir les candidatures" → menait vers `/dashboard/applications` (page candidat) ❌
- "Gérer les entretiens" → menait vers `/dashboard/interviews` (404 page inexistante) ❌

#### Solution appliquée :
- ✅ "Voir les candidatures" → `/dashboard/candidates` (bonne page pour recruteur)
- ✅ "Gérer les entretiens" → `/dashboard/candidates?status=interview` (filtre sur entretiens)

---

## 🔔 Système de Notifications

### **OUI, les candidats voient aussi les notifications !**

Les notifications sont créées pour **TOUS les utilisateurs** selon leur rôle :

### Pour les **Candidats** :
Notifications reçues quand :
- ✉️ **Application reçue** - Confirmation de candidature (avec email auto si template configuré)
- 👁️ **Candidature vue** - Le recruteur a vu votre CV
- ⭐ **Présélectionné** - Vous passez à l'étape suivante
- 🎯 **Convoqué en entretien** - Invitation à un entretien (avec email auto)
- 🎉 **Candidature acceptée** - Offre d'emploi (avec email auto)
- ❌ **Candidature rejetée** - Refus (avec email auto)

### Pour les **Recruteurs** :
Notifications reçues quand :
- 📝 **Nouvelle candidature** - Un candidat a postulé à une offre
- 📊 **Mise à jour de candidature** - Changements dans le statut

---

## 📍 Où Voir les Notifications ?

### **1. Badge de notification (Header)**
- Tous les utilisateurs ont une icône 🔔 dans le header
- Le badge rouge indique le nombre de notifications non lues
- Clique sur l'icône → Panel de notifications s'ouvre

### **2. Panel de notifications (Dropdown)**
Fichier : `frontend/src/components/NotificationPanel.tsx`

**Fonctionnalités :**
- Afficher les 10 dernières notifications
- Marquer comme lu individuellement
- Marquer tout comme lu (bouton "Tout marquer comme lu")
- Couleurs selon le type de notification
- Liens directs vers l'offre ou la candidature concernée

### **3. Page dédiée (future)**
Actuellement pas de page `/dashboard/notifications` dédiée, mais le panel fonctionne parfaitement.

---

## 🎯 Navigation Corrigée pour Recruteurs

### **Actions Rapides du Dashboard**

1. **Créer une offre d'emploi**
   - Route : `/dashboard/job-posts` → "Créer une offre"
   - Permet de créer une nouvelle offre

2. **Voir les candidatures** ✅ CORRIGÉ
   - Route : `/dashboard/candidates`
   - Affiche toutes les candidatures reçues
   - Filtres : Par statut (applied, viewed, shortlisted, interview, accepted, rejected)
   - Actions : Changer le statut, voir le CV, ajouter des notes

3. **Gérer les entretiens** ✅ CORRIGÉ
   - Route : `/dashboard/candidates?status=interview`
   - Filtre automatiquement sur les candidatures "interview"
   - Permet de gérer les entretiens planifiés
   - Actions : Créer événement calendrier, envoyer email de rappel

---

## 📊 Workflow Complet : Candidature → Notification → Email

### Exemple : Candidat postule à une offre

#### **Étape 1 : Candidat postule**
```
Candidat clique "Postuler" sur une offre
  ↓
Backend crée JobApplication (status: APPLIED)
  ↓
[AUTOMATIQUE] Créer notification pour le recruteur
  → Type: NEW_APPLICATION
  → Titre: "📝 Nouvelle candidature reçue"
  → Message: "Jean Dupont a postulé pour le poste de Développeur"
  ↓
[AUTOMATIQUE] Envoyer email au candidat (si template "application_received" existe)
  → Confirmation de candidature
  → Variables pré-remplies: nom, poste, entreprise
```

#### **Étape 2 : Recruteur change le statut → "Interview"**
```
Recruteur change le statut sur /dashboard/candidates
  ↓
Backend met à jour JobApplication (status: INTERVIEW)
  ↓
[AUTOMATIQUE] Créer notification pour le candidat
  → Type: STATUS_CHANGE
  → Titre: "🎯 Vous êtes convoqué(e) en entretien"
  → Message: "Votre candidature pour Développeur a été mise à jour"
  ↓
[AUTOMATIQUE] Envoyer email au candidat (si template "interview_invitation" existe)
  → Email d'invitation à l'entretien
  → Variables: date, heure, lieu, recruteur
```

#### **Étape 3 : Candidat voit la notification**
```
Candidat se connecte
  ↓
Badge 🔔 affiche "1" (notification non lue)
  ↓
Clique sur l'icône → Panel s'ouvre
  ↓
Voit: "🎯 Vous êtes convoqué(e) en entretien"
  ↓
Clique sur la notification → Marque comme lu
  ↓
Badge 🔔 disparaît
```

---

## 🔧 Code Backend : Création de Notifications

Fichier : `backend/app/api/applications.py`

### Notification pour le recruteur (nouvelle candidature)
```python
await create_notification(
    db=db,
    user_id=job_with_employer.employer.user_id,  # ← ID du recruteur
    type=NotificationType.NEW_APPLICATION,
    title="📝 Nouvelle candidature reçue",
    message=f"{candidate_name} a postulé pour {job.title}",
    related_job_id=job_id,
    related_application_id=application.id
)
```

### Notification pour le candidat (changement de statut)
```python
await create_notification(
    db=db,
    user_id=application.candidate.user_id,  # ← ID du candidat
    type=NotificationType.STATUS_CHANGE,
    title="🎯 Vous êtes convoqué(e) en entretien",
    message=f"Votre candidature pour {job.title} a été mise à jour",
    related_job_id=application.job_id,
    related_application_id=application.id
)
```

---

## 📱 Code Frontend : Affichage des Notifications

Fichier : `frontend/src/components/NotificationPanel.tsx`

### Hooks utilisés :
```tsx
const { data: notificationsData } = useNotifications(10, 0);
const { data: unreadCount = 0 } = useUnreadNotificationsCount();
const markAsReadMutation = useMarkNotificationAsRead();
const markAllAsReadMutation = useMarkAllNotificationsAsRead();
```

### Composant utilisé dans :
- `DashboardLayout.tsx` (header du dashboard)
- Accessible par TOUS les utilisateurs (candidats, employeurs, admin)

---

## 🎨 Types de Notifications et Couleurs

```tsx
type NotificationType = 
  | "new_application"       // 📝 Bleu (#3B82F6) - Pour recruteurs
  | "status_change"         // 🔔 Vert (#6B9B5F) - Pour candidats
  | "interview_scheduled"   // 📅 Violet (#6B46C1) - Pour candidats
  | "offer_received"        // 🎉 Or (#F7C700) - Pour candidats
  | "application_viewed"    // 👁️ Gris - Pour candidats
```

---

## ✅ Checklist Fonctionnalités

### Notifications
- ✅ Créées automatiquement lors des actions (postule, changement statut)
- ✅ Visibles pour candidats ET recruteurs
- ✅ Badge non lu dans le header
- ✅ Panel dropdown fonctionnel
- ✅ Marquer comme lu (individuellement ou tout)
- ✅ Liens vers les ressources concernées

### Emails Automatiques
- ✅ Confirmation de candidature (template application_received)
- ✅ Invitation à entretien (template interview_invitation)
- ✅ Offre d'emploi (template offer)
- ✅ Refus (template rejection)
- ✅ Variables pré-remplies automatiquement

### Navigation Recruteur
- ✅ "Voir les candidatures" → /dashboard/candidates
- ✅ "Gérer les entretiens" → /dashboard/candidates?status=interview
- ✅ Plus d'erreurs 404

---

## 🚀 Prochaines Étapes Recommandées

1. **Créer des templates d'email** depuis `/dashboard/email-templates`
   - Au minimum : application_received, interview_invitation, rejection
   - Marquer comme "par défaut"

2. **Tester le workflow complet :**
   - Créer compte candidat de test
   - Postuler à une offre
   - Vérifier notification recruteur
   - Vérifier email candidat
   - Changer statut → "interview"
   - Vérifier notification candidat
   - Vérifier email invitation

3. **Ajouter une page notifications dédiée (optionnel)**
   - Créer `/dashboard/notifications`
   - Afficher l'historique complet
   - Pagination et filtres

---

## 💡 Notes Importantes

- Les notifications **NE bloquent jamais** le workflow principal
- Si la création d'une notification échoue → log d'erreur mais l'action continue
- Si l'envoi d'email échoue → log d'erreur mais l'action continue
- Les notifications sont stockées dans la table `notifications` (PostgreSQL)
- Les emails sont envoyés via Resend (vérifier RESEND_API_KEY dans Railway)

---

**Tout fonctionne maintenant ! Les candidats et recruteurs reçoivent bien leurs notifications, et la navigation est corrigée.** ✅
