# React Query Hooks - Phase 2.2 COMPLÈTE

## ✅ Custom Hooks React Query

**Date**: 2026-01-02
**Status**: Phase 2.2 complète - 6 fichiers de hooks créés
**Total**: 40+ hooks personnalisés

---

## Fichiers Créés

### 1. `src/hooks/useJobs.ts` - Hooks Jobs (Offres d'emploi)

**Queries (Lecture)**:
- ✅ `useJobs(filters, options)` - Liste des jobs avec filtres
- ✅ `useMyJobs(filters, options)` - Mes jobs (employeur)
- ✅ `useJob(jobId, options)` - Détail d'un job

**Mutations (Écriture)**:
- ✅ `useCreateJob()` - Créer un job (employeur)
- ✅ `useUpdateJob()` - Mettre à jour un job avec optimistic update
- ✅ `useDeleteJob()` - Supprimer un job avec optimistic update

**Fonctionnalités clés**:
- Optimistic updates pour update et delete
- Cache invalidation intelligente
- Support role-aware (public vs authenticated)
- Toast notifications automatiques
- Gestion d'erreur avec rollback

**Exemple d'usage**:
```typescript
import { useJobs, useCreateJob, useDeleteJob } from '@/hooks';

// Liste de jobs avec filtres
const { data, isLoading } = useJobs({
  page: 1,
  limit: 10,
  search: 'developer',
  location_type: 'remote'
});

const jobs = data?.jobs || [];
const total = data?.total || 0;

// Créer un job
const createJob = useCreateJob();
createJob.mutate({
  title: 'Senior Developer',
  description: 'We are looking for...',
  location_type: 'remote',
  job_type: 'full_time'
});

// Supprimer un job
const deleteJob = useDeleteJob();
deleteJob.mutate(jobId);
```

---

### 2. `src/hooks/useApplications.ts` - Hooks Applications (Candidatures)

**Queries (Lecture)**:
- ✅ `useMyApplications(page, limit, options)` - Mes candidatures (candidat)
- ✅ `useApplication(applicationId, options)` - Détail d'une candidature
- ✅ `useApplicationsCount(options)` - Nombre total de candidatures

**Mutations (Écriture)**:
- ✅ `useApplyToJob()` - Postuler à un job (candidat)
- ✅ `useWithdrawApplication()` - Retirer une candidature avec optimistic update
- ✅ `useUpdateApplicationStatus()` - Mettre à jour le statut (employeur)
- ✅ `useUpdateApplicationNotes()` - Mettre à jour les notes (employeur)

**Fonctionnalités clés**:
- Optimistic updates pour withdraw, status, notes
- Invalidation automatique des jobs (has_applied)
- Support dual-role (candidat + employeur)
- Gestion d'erreur avec rollback

**Exemple d'usage**:
```typescript
import { useMyApplications, useApplyToJob, useWithdrawApplication } from '@/hooks';

// Mes candidatures
const { data, isLoading } = useMyApplications(1, 10);
const applications = data?.applications || [];

// Postuler à un job
const applyToJob = useApplyToJob();
applyToJob.mutate({
  job_id: 123,
  cover_letter: 'I am very interested in this position...'
});

// Retirer une candidature
const withdrawApplication = useWithdrawApplication();
withdrawApplication.mutate(applicationId);
```

---

### 3. `src/hooks/useCandidates.ts` - Hooks Candidates (Profils candidats)

**Queries (Lecture)**:
- ✅ `useCandidateProfile(options)` - Profil complet du candidat
- ✅ `useCandidateCVs(options)` - Liste des CVs

**Mutations (Écriture)**:

**Profil**:
- ✅ `useUpdateCandidateProfile()` - Mettre à jour le profil avec optimistic update
- ✅ `useDeleteCV()` - Supprimer un CV avec optimistic update

**Expériences professionnelles**:
- ✅ `useAddExperience()` - Ajouter une expérience
- ✅ `useUpdateExperience()` - Mettre à jour une expérience
- ✅ `useDeleteExperience()` - Supprimer une expérience

**Formations**:
- ✅ `useAddEducation()` - Ajouter une formation
- ✅ `useUpdateEducation()` - Mettre à jour une formation
- ✅ `useDeleteEducation()` - Supprimer une formation

**Compétences**:
- ✅ `useAddSkill()` - Ajouter une compétence
- ✅ `useUpdateSkill()` - Mettre à jour une compétence
- ✅ `useDeleteSkill()` - Supprimer une compétence

**Fonctionnalités clés**:
- Optimistic updates pour profil et CV
- Invalidation automatique du profil après modifications
- Support multi-CV
- Toast notifications automatiques

**Exemple d'usage**:
```typescript
import {
  useCandidateProfile,
  useUpdateCandidateProfile,
  useAddExperience
} from '@/hooks';

// Profil candidat
const { data: profile, isLoading } = useCandidateProfile();

// Mettre à jour le profil
const updateProfile = useUpdateCandidateProfile();
updateProfile.mutate({
  title: 'Full Stack Developer',
  summary: 'Experienced developer...',
  location: 'Paris, France'
});

// Ajouter une expérience
const addExperience = useAddExperience();
addExperience.mutate({
  title: 'Senior Developer',
  company: 'Google',
  start_date: '2020-01-01',
  is_current: true,
  description: 'Working on...'
});
```

---

### 4. `src/hooks/useDashboard.ts` - Hooks Dashboard (Statistiques)

**Queries (Lecture)**:
- ✅ `useDashboardStats(options)` - Statistiques du dashboard (role-based)
- ✅ `useDashboardActivities(options)` - Activités récentes
- ✅ `useCompanyStats(options)` - Statistiques de l'entreprise (employeur)

**Fonctionnalités clés**:
- Support polling avec `refetchInterval`
- Role-based data (candidat/employeur/admin)
- staleTime optimisé (2min pour stats, 1min pour activités)

**Exemple d'usage**:
```typescript
import { useDashboardStats, useCompanyStats } from '@/hooks';

// Stats du dashboard (varie selon le rôle)
const { data: dashboardData, isLoading } = useDashboardStats();
const stats = dashboardData?.stats || [];
const activities = dashboardData?.recentActivities || [];

// Stats entreprise (employeur)
const { data: companyStats } = useCompanyStats();
console.log(companyStats?.active_jobs); // Nombre de jobs actifs
```

---

### 5. `src/hooks/useNotifications.ts` - Hooks Notifications

**Queries (Lecture)**:
- ✅ `useNotifications(limit, offset, unreadOnly, options)` - Liste des notifications
- ✅ `useUnreadNotificationsCount(options)` - Nombre de notifications non lues

**Mutations (Écriture)**:
- ✅ `useMarkNotificationAsRead()` - Marquer une notification comme lue
- ✅ `useMarkAllNotificationsAsRead()` - Marquer toutes comme lues
- ✅ `useDeleteNotification()` - Supprimer une notification

**Fonctionnalités clés**:
- Optimistic updates pour mark as read et delete
- Polling automatique (1 minute) pour les notifications
- staleTime court (30 secondes) pour fraîcheur
- Décrémentation automatique du unread count

**Exemple d'usage**:
```typescript
import {
  useNotifications,
  useUnreadNotificationsCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead
} from '@/hooks';

// Notifications
const { data, isLoading } = useNotifications(20, 0, false, {
  refetchInterval: 60000 // Polling 1 minute
});

const notifications = data?.notifications || [];
const unreadCount = data?.unread_count || 0;

// Compteur non lues (badge)
const { data: count } = useUnreadNotificationsCount({
  refetchInterval: 60000
});

// Marquer comme lue
const markAsRead = useMarkNotificationAsRead();
markAsRead.mutate(notificationId);

// Tout marquer comme lu
const markAllAsRead = useMarkAllNotificationsAsRead();
markAllAsRead.mutate();
```

---

### 6. `src/hooks/useAdmin.ts` - Hooks Admin (Gestion plateforme)

**Queries (Lecture)**:
- ✅ `useAdminStats(options)` - Statistiques globales de la plateforme
- ✅ `useAdminUsers(filters, options)` - Liste des utilisateurs
- ✅ `useAdminEmployers(page, limit, options)` - Liste des employeurs
- ✅ `useAdminJobs(page, limit, status, options)` - Liste des jobs

**Mutations (Écriture)**:
- ✅ `useToggleUserActivation()` - Activer/Désactiver un utilisateur
- ✅ `useDeleteUser()` - Supprimer un utilisateur

**Fonctionnalités clés**:
- Optimistic updates pour activation et suppression
- Filtrage avancé des utilisateurs (role, active, search)
- Invalidation automatique des stats

**Exemple d'usage**:
```typescript
import {
  useAdminStats,
  useAdminUsers,
  useToggleUserActivation,
  useDeleteUser
} from '@/hooks';

// Stats globales
const { data: stats, isLoading } = useAdminStats();
console.log(stats?.total_users, stats?.total_jobs);

// Liste utilisateurs avec filtres
const { data: users } = useAdminUsers({
  limit: 20,
  role: 'candidate',
  is_active: true,
  search: 'john'
});

// Désactiver un utilisateur
const toggleActivation = useToggleUserActivation();
toggleActivation.mutate({ userId: 123, is_active: false });

// Supprimer un utilisateur
const deleteUser = useDeleteUser();
deleteUser.mutate(userId);
```

---

### 7. `src/hooks/index.ts` - Exports centralisés

Fichier d'export centralisé pour faciliter les imports:

```typescript
import {
  useJobs,
  useCreateJob,
  useMyApplications,
  useApplyToJob,
  useCandidateProfile,
  useUpdateCandidateProfile
} from '@/hooks';
```

Au lieu de:
```typescript
import { useJobs } from '@/hooks/useJobs';
import { useMyApplications } from '@/hooks/useApplications';
```

---

## Patterns Implémentés

### 1. Optimistic Updates

Pattern utilisé pour: update, delete, mark as read, toggle activation

```typescript
onMutate: async (data) => {
  // 1. Annuler les queries en cours
  await queryClient.cancelQueries({ queryKey });

  // 2. Sauvegarder l'ancien état
  const previousData = queryClient.getQueryData(queryKey);

  // 3. Mise à jour optimiste du cache
  queryClient.setQueryData(queryKey, newData);

  // 4. Retourner context pour rollback
  return { previousData, queryKey };
},
onError: (error, variables, context) => {
  // Rollback en cas d'erreur
  if (context?.previousData) {
    queryClient.setQueryData(context.queryKey, context.previousData);
  }
},
onSuccess: () => {
  // Invalider pour refetch depuis le serveur
  queryClient.invalidateQueries({ queryKey });
}
```

### 2. Cache Invalidation

Pattern pour invalidation intelligente:

```typescript
onSuccess: () => {
  // Invalider plusieurs ressources liées
  queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.applications.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
}
```

### 3. Conditional Queries

Pattern pour queries conditionnelles:

```typescript
const { data } = useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
  enabled: isSignedIn && (options.enabled !== false)
});
```

### 4. Polling

Pattern pour polling automatique:

```typescript
const { data } = useQuery({
  queryKey: ['notifications'],
  queryFn: fetchNotifications,
  refetchInterval: 60000, // 1 minute
  staleTime: 30000 // 30 secondes
});
```

---

## Validation

### TypeScript

```bash
cd frontend
npx tsc --noEmit
```

**Résultat**: ✅ Aucune erreur TypeScript

### Fichiers Créés

- ✅ `src/hooks/useJobs.ts` (279 lignes)
- ✅ `src/hooks/useApplications.ts` (340 lignes)
- ✅ `src/hooks/useCandidates.ts` (380 lignes)
- ✅ `src/hooks/useDashboard.ts` (85 lignes)
- ✅ `src/hooks/useNotifications.ts` (310 lignes)
- ✅ `src/hooks/useAdmin.ts` (295 lignes)
- ✅ `src/hooks/index.ts` (67 lignes)

**Total**: 7 fichiers, ~1,756 lignes de code

---

## Fonctionnalités React Query Utilisées

### Queries

- ✅ `useQuery` - Queries GET avec cache automatique
- ✅ `queryKey` - Clés de cache hiérarchiques
- ✅ `staleTime` - Durée de fraîcheur des données
- ✅ `enabled` - Queries conditionnelles
- ✅ `refetchInterval` - Polling automatique

### Mutations

- ✅ `useMutation` - Mutations POST/PUT/DELETE
- ✅ `onMutate` - Optimistic updates
- ✅ `onSuccess` - Actions après succès
- ✅ `onError` - Rollback en cas d'erreur
- ✅ `onSettled` - Actions finales

### QueryClient

- ✅ `queryClient.invalidateQueries()` - Invalider le cache
- ✅ `queryClient.setQueryData()` - Modifier le cache
- ✅ `queryClient.getQueryData()` - Lire le cache
- ✅ `queryClient.removeQueries()` - Supprimer du cache
- ✅ `queryClient.cancelQueries()` - Annuler les queries en cours

---

## Avantages Apportés

### Pour le Développeur

- ✅ **Moins de code** - Plus de useState/useEffect pour loading/error/data
- ✅ **Type-safe** - TypeScript complet avec inférence
- ✅ **Réutilisable** - Hooks partagés dans toute l'app
- ✅ **Testable** - Hooks isolés et faciles à tester
- ✅ **Maintenable** - Logique métier centralisée

### Pour l'Application

- ⚡ **Performance** - Cache intelligent, moins de requêtes réseau
- 🔄 **Synchronisation** - Données toujours à jour avec polling
- 🎯 **Optimistic UI** - UX instantanée avec rollback automatique
- 📊 **Devtools** - Debug facile avec React Query Devtools
- 🛡️ **Fiabilité** - Retry automatique, gestion d'erreur robuste

### Pour l'Utilisateur

- 🚀 **Rapidité** - Cache = chargements instantanés
- ✨ **Fluidité** - Optimistic updates = interface réactive
- 🔄 **Fraîcheur** - Polling = données toujours à jour
- 💪 **Robustesse** - Retry + rollback = moins d'erreurs visibles

---

## Prochaines Étapes

### Phase 2.3: Migrer Pages Dashboard

**Pages à migrer** (ordre de priorité):

1. **dashboard/jobs/page.tsx** (Priorité 1)
   - Utiliser `useJobs()` ou `useMyJobs()` selon le rôle
   - Remplacer useState/useEffect par hooks
   - Supprimer loading/error/data locaux

2. **dashboard/candidates/applications/page.tsx** (Priorité 2)
   - Utiliser `useMyApplications()`
   - Simplifier la gestion d'état

3. **dashboard/company/page.tsx** (Priorité 3)
   - Utiliser `useMyJobs()` et `useCompanyStats()`

4. **dashboard/admin/page.tsx** (Priorité 4)
   - Utiliser `useAdminStats()`, `useAdminUsers()`, etc.

5. **dashboard/page.tsx** (Main dashboard)
   - Utiliser `useDashboardStats()`

### Phase 2.4: Tests et Validation

- Tester le caching (rechargement instantané)
- Vérifier refetch automatique (window focus, reconnect)
- Valider optimistic updates
- Tester rollback sur erreur
- Monitoring avec React Query Devtools

---

## Résumé Phase 2.2

**Status**: ✅ PHASE 2.2 COMPLÈTE

**Hooks créés**: 40+
**Fichiers créés**: 7
**Lignes de code**: ~1,756
**Erreurs TypeScript**: 0
**Tests**: Compilation OK

**Prêt pour**: Phase 2.3 (Migration des pages)

---

**Date de complétion**: 2026-01-02
**Durée estimée Phase 2.3**: 2-3 jours
