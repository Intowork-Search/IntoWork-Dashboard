# 🎓 Guide d'Intégration du Système d'Onboarding

## Vue d'Ensemble

Le système d'onboarding INTOWORK offre un guide interactif style Microsoft Teams/Google Workspace pour accueillir les nouveaux utilisateurs (candidats et employeurs).

### ✨ Fonctionnalités

- ✅ Tooltips guidés étape par étape
- ✅ Highlight des éléments ciblés
- ✅ Animation fluide et design INTOWORK
- ✅ Sauvegarde de progression (localStorage)
- ✅ Bouton d'aide flottant pour relancer le guide
- ✅ Tours différents selon le rôle (candidat/employeur)
- ✅ Raccourci clavier `?` pour l'aide

---

## 📦 Composants Créés

### 1. `OnboardingTour.tsx`
Composant principal qui affiche les tooltips guidés.

### 2. `HelpButton.tsx`
Bouton flottant "?" en bas à droite pour relancer le guide.

### 3. `onboardingTours.ts`
Configuration des tours pour chaque page et rôle.

---

## 🚀 Intégration dans le Dashboard

### Étape 1 : Importer les composants

```tsx
// Dans /dashboard/page.tsx, ajoutez en haut :
import OnboardingTour from '@/components/OnboardingTour';
import HelpButton from '@/components/HelpButton';
import { candidateDashboardTour, employerDashboardTour } from '@/config/onboardingTours';
```

### Étape 2 : Ajouter les data attributes

Modifiez vos composants pour ajouter l'attribut `data-tour` :

```tsx
{/* Complétion du profil - AVANT */}
<button onClick={() => router.push('/dashboard/profile')}>
  Compléter mon profil
</button>

{/* Complétion du profil - APRÈS */}
<button 
  data-tour="profile-completion"  {/* ← Ajout de l'attribut */}
  onClick={() => router.push('/dashboard/profile')}
>
  Compléter mon profil
</button>
```

#### Attributs data-tour pour le Dashboard Candidat :

```tsx
// Profil
<div data-tour="profile-completion">
  {/* Section complétion du profil */}
</div>

// Upload CV
<button data-tour="upload-cv">
  Télécharger un CV
</button>

// Recherche d'emploi
<button data-tour="search-jobs" onClick={() => router.push('/dashboard/jobs')}>
  Rechercher des offres
</button>

// Mes candidatures
<button data-tour="my-applications" onClick={() => router.push('/dashboard/applications')}>
  Mes candidatures
</button>

// Notifications
<div data-tour="notifications">
  {/* Icône de notification */}
</div>
```

#### Attributs data-tour pour le Dashboard Employeur :

```tsx
// Configuration entreprise
<button data-tour="company-setup" onClick={() => router.push('/dashboard/company')}>
  Configurer mon entreprise
</button>

// Créer une offre
<button data-tour="create-job" onClick={() => router.push('/dashboard/job-posts')}>
  Créer une offre
</button>

// Voir les candidatures
<button data-tour="view-applications" onClick={() => router.push('/dashboard/candidates')}>
  Voir les candidatures
</button>

// Gérer les entretiens
<button data-tour="manage-interviews" onClick={() => router.push('/dashboard/candidates?status=interview')}>
  Gérer les entretiens
</button>

// Statistiques
<div data-tour="stats">
  {/* Section stats */}
</div>
```

### Étape 3 : Ajouter le tour et le bouton d'aide

Avant le `</DashboardLayout>` de fermeture, ajoutez :

```tsx
export default function Dashboard() {
  const { user } = useUser();
  const userRole = user?.role;

  return (
    <DashboardLayout title="Dashboard">
      {/* Tout votre contenu existant... */}

      {/* Tour d'onboarding */}
      <OnboardingTour
        tourId={userRole === 'candidate' ? 'candidate-dashboard' : 'employer-dashboard'}
        steps={userRole === 'candidate' ? candidateDashboardTour : employerDashboardTour}
        autoStart={true}
      />

      {/* Bouton d'aide */}
      <HelpButton />
    </DashboardLayout>
  );
}
```

---

## 📍 Intégration sur d'Autres Pages

### Page Profil Candidat (`/dashboard/profile`)

```tsx
import OnboardingTour from '@/components/OnboardingTour';
import HelpButton from '@/components/HelpButton';
import { candidateProfileTour } from '@/config/onboardingTours';

export default function ProfilePage() {
  return (
    <DashboardLayout>
      {/* Informations de base */}
      <div data-tour="profile-basics">
        {/* Formulaire nom, email, téléphone */}
      </div>

      {/* Expériences */}
      <div data-tour="experiences">
        {/* Liste des expériences */}
      </div>

      {/* Formation */}
      <div data-tour="education">
        {/* Liste des formations */}
      </div>

      {/* Compétences */}
      <div data-tour="skills">
        {/* Liste des compétences */}
      </div>

      {/* Tour */}
      <OnboardingTour
        tourId="candidate-profile"
        steps={candidateProfileTour}
        autoStart={true}
      />

      <HelpButton />
    </DashboardLayout>
  );
}
```

### Page Candidatures Employeur (`/dashboard/candidates`)

```tsx
import OnboardingTour from '@/components/OnboardingTour';
import HelpButton from '@/components/HelpButton';
import { employerApplicationsTour } from '@/config/onboardingTours';

export default function CandidatesPage() {
  return (
    <DashboardLayout>
      {/* Filtres */}
      <div data-tour="filters">
        {/* Filtres de statut */}
      </div>

      {/* Liste des candidatures */}
      <div data-tour="candidate-card">
        {/* Carte candidat */}
      </div>

      {/* Changer le statut */}
      <select data-tour="change-status">
        {/* Options de statut */}
      </select>

      {/* Notes */}
      <textarea data-tour="notes"></textarea>

      {/* Télécharger CV */}
      <button data-tour="download-cv">Télécharger le CV</button>

      {/* Tour */}
      <OnboardingTour
        tourId="employer-applications"
steps={employerApplicationsTour}
        autoStart={true}
      />

      <HelpButton />
    </DashboardLayout>
  );
}
```

### Page Templates d'Email (`/dashboard/email-templates`)

```tsx
import OnboardingTour from '@/components/OnboardingTour';
import HelpButton from '@/components/HelpButton';
import { employerEmailTemplatesTour } from '@/config/onboardingTours';

export default function EmailTemplatesPage() {
  return (
    <DashboardLayout>
      {/* Créer un template */}
      <button data-tour="create-template">Créer un template</button>

      {/* Variables */}
      <div data-tour="template-variables">
        {/* Liste des variables */}
      </div>

      {/* Template par défaut */}
      <input type="checkbox" data-tour="default-template" />

      {/* Tour */}
      <OnboardingTour
        tourId="employer-email-templates"
        steps={employerEmailTemplatesTour}
        autoStart={true}
      />

      <HelpButton />
    </DashboardLayout>
  );
}
```

### Page Intégrations (`/dashboard/settings`)

```tsx
import OnboardingTour from '@/components/OnboardingTour';
import HelpButton from '@/components/HelpButton';
import { integrationsTour } from '@/config/onboardingTours';

export default function SettingsPage() {
  return (
    <DashboardLayout>
      {/* Onglet Intégrations */}
      <div>
        {/* LinkedIn */}
        <button data-tour="connect-linkedin">Connecter LinkedIn</button>

        {/* Google Calendar */}
        <button data-tour="connect-google">Connecter Google Calendar</button>

        {/* Outlook */}
        <button data-tour="connect-outlook">Connecter Outlook</button>
      </div>

      {/* Tour */}
      <OnboardingTour
        tourId="integrations"
        steps={integrationsTour}
        autoStart={true}
      />

      <HelpButton />
    </DashboardLayout>
  );
}
```

---

## 🎨 Personnalisation

### Créer un nouveau tour

Dans `onboardingTours.ts`, ajoutez :

```typescript
export const monNouveauTour: OnboardingStep[] = [
  {
    target: '[data-tour="element-1"]',
    title: 'Titre de l\'étape',
    content: 'Description de ce qu\'il faut faire',
    position: 'bottom' // 'top' | 'bottom' | 'left' | 'right'
  },
  {
    target: '[data-tour="element-2"]',
    title: 'Deuxième étape',
    content: 'Suite du guide...',
    position: 'right',
    action: () => {
      // Action optionnelle à exécuter (ex: scroll, ouvrir un modal)
      console.log('Action personnalisée');
    }
  }
];
```

### Modifier les couleurs

Dans `OnboardingTour.tsx`, personnalisez les couleurs :

```tsx
// Couleur du highlight
box-shadow: 0 0 0 4px rgba(107, 155, 95, 0.5);  // Vert INTOWORK

// Couleur de l'en-tête
from-[#6B9B5F] to-[#6B9B5F]/80  // Vert

// Bouton Suivant
from-[#6B9B5F] to-[#6B9B5F]/90  // Vert
```

### Désactiver l'autostart

```tsx
<OnboardingTour
  tourId="mon-tour"
  steps={mesTours}
  autoStart={false}  {/* Ne démarre pas automatiquement */}
/>
```

---

## 🔧 API et Fonctions

### Relancer le tour manuellement

```tsx
// Dans n'importe quel composant
const handleRestartTour = () => {
  if (typeof window !== 'undefined' && (window as any).restartOnboarding) {
    (window as any).restartOnboarding();
  }
};

<button onClick={handleRestartTour}>
  Relancer le guide
</button>
```

### Réinitialiser un tour spécifique

```tsx
// Supprimer du localStorage
if (typeof window !== 'undefined') {
  localStorage.removeItem('onboarding-candidate-dashboard');
  window.location.reload(); // Recharger pour relancer le tour
}
```

### Vérifier si un tour a été complété

```tsx
const hasCompletedTour = () => {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem('onboarding-candidate-dashboard') === 'completed';
};

if (!hasCompletedTour()) {
  // Afficher un message ou un bouton
  console.log('Le tour n\'a pas encore été complété');
}
```

---

## 📱 Responsive

Le système d'onboarding est responsive :
- Les tooltips s'adaptent automatiquement à la taille de l'écran
- Sur mobile, le tooltip occupe la largeur disponible
- Le bouton d'aide se positionne toujours en bas à droite

---

## ⌨️ Raccourcis Clavier

- **`?`** : Ouvrir le menu d'aide (fonctionnalité à implémenter)
- **Échap** : Fermer le guide (fonctionnalité à implémenter)

---

## 🎯 Bonnes Pratiques

1. **Un tour par page** : Ne surchargez pas l'utilisateur, max 5-7 étapes
2. **Texte clair et concis** : Allez droit au but
3. **Actions importantes** : Guidez vers les actions clés en premier
4. **Testez le parcours** : Assurez-vous que tous les éléments ciblés existent
5. **data-tour unique** : Évitez les doublons d'attributs data-tour sur une même page

---

## 🐛 Troubleshooting

### Le tour ne démarre pas

- Vérifiez que `autoStart={true}`
- Vérifiez que le localStorage ne contient pas déjà `onboarding-{tourId}=completed`
- Supprimez manuellement : `localStorage.removeItem('onboarding-candidate-dashboard')`

### Le tooltip ne pointe pas vers le bon élément

- Vérifiez que l'attribut `data-tour` correspond exactement au `target` dans le tour
- Vérifiez que l'élément est visible (pas `display: none`)
- Assurez-vous que l'élément existe au moment du lancement du tour

### Le bouton d'aide ne fonctionne pas

- Vérifiez que `<HelpButton />` est bien inclus dans la page
- Vérifiez la z-index (doit être 50+)

---

## 📚 Exemples Complets

Consultez les exemples CI-dessus pour des intégrations complètes sur :
- Dashboard principal (candidat/employeur)
- Page profil
- Page candidatures
- Page templates d'email
- Page intégrations OAuth

---

**Tout est prêt ! Suivez ce guide pour intégrer le système d'onboarding sur toutes vos pages.** 🎉
