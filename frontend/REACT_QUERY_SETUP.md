# React Query Setup - Phase 2.1 COMPLÈTE

## ✅ Configuration React Query

**Date**: 2026-01-02
**Version**: @tanstack/react-query v5.59.0
**Status**: Configuration complète et fonctionnelle

---

## Installation

```bash
npm install @tanstack/react-query@^5.59.0
npm install @tanstack/react-query-devtools@^5.59.0
```

**Packages installés**:
- `@tanstack/react-query` - Bibliothèque principale
- `@tanstack/react-query-devtools` - Outils de développement

---

## Fichiers Créés

### 1. `src/lib/queryClient.ts` - Configuration du QueryClient

Configuration centralisée avec options optimisées:

```typescript
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,        // 5min - Données "fresh"
      gcTime: 1000 * 60 * 30,          // 30min - Garbage collection
      retry: 2,                         // 2 retry automatiques
      refetchOnWindowFocus: true,       // Refetch au retour sur l'onglet
      refetchOnReconnect: true,         // Refetch à la reconnexion
    },
    mutations: {
      retry: 1,                         // 1 retry pour mutations
    },
  },
});
```

**Helpers fournis**:
- `invalidateMultipleQueries()` - Invalider plusieurs queries
- `prefetchQuery()` - Précharger des données

### 2. `src/lib/queryKeys.ts` - Clés de Cache Centralisées

Organisation des clés par ressource:

```typescript
export const queryKeys = {
  jobs: {
    all: ['jobs'],
    list: (filters) => ['jobs', 'list', filters],
    detail: (id) => ['jobs', 'detail', id],
    myJobs: (filters) => ['my-jobs', filters],
  },
  applications: {...},
  candidates: {...},
  companies: {...},
  employers: {...},
  dashboard: {...},
  notifications: {...},
  admin: {...},
  auth: {...},
};
```

**Ressources configurées**:
- ✅ Jobs (offres d'emploi)
- ✅ Applications (candidatures)
- ✅ Candidates (profils candidats)
- ✅ Companies (entreprises)
- ✅ Employers (employeurs)
- ✅ Dashboard (statistiques)
- ✅ Notifications
- ✅ Admin (gestion)
- ✅ Auth (utilisateur)

### 3. `src/components/QueryProvider.tsx` - Provider Client Component

Wrapper React Query avec devtools:

```typescript
'use client';

export default function QueryProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
          position="bottom"
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
}
```

**Fonctionnalités**:
- QueryClientProvider configuré
- React Query Devtools en développement seulement
- Position bottom-right pour les devtools

### 4. `src/app/layout.tsx` - Intégration au Layout Principal

Layout mis à jour avec QueryProvider:

```typescript
export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <QueryProvider>
          <SessionProvider>
            {children}
            <ToastProvider />
          </SessionProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
```

**Ordre des providers**:
1. QueryProvider (externe) - Cache global
2. SessionProvider - Auth NextAuth
3. ToastProvider - Notifications

---

## Configuration Par Ressource

### Jobs (Offres d'emploi)

```typescript
queryKeys.jobs.all                    // ['jobs']
queryKeys.jobs.list({ page: 1 })     // ['jobs', 'list', { page: 1 }]
queryKeys.jobs.detail(123)            // ['jobs', 'detail', 123]
queryKeys.jobs.myJobs({ status: 'active' }) // ['my-jobs', { status: 'active' }]
```

### Applications (Candidatures)

```typescript
queryKeys.applications.all                           // ['applications']
queryKeys.applications.myApplications({ page: 1 })   // ['my-applications', ...]
queryKeys.applications.employerApplications(...)     // ['employer-applications', ...]
```

### Dashboard

```typescript
queryKeys.dashboard.stats()        // ['dashboard', 'stats']
queryKeys.dashboard.activities()   // ['dashboard', 'activities']
```

### Notifications

```typescript
queryKeys.notifications.list(1, 10)    // ['notifications', 'list', { page: 1, limit: 10 }]
queryKeys.notifications.unreadCount()  // ['notifications', 'unread-count']
```

---

## Fonctionnalités React Query

### Caching Automatique

- **staleTime: 5min** - Données considérées fraîches pendant 5 minutes
- **gcTime: 30min** - Cache conservé 30 minutes avant suppression
- Pas de requête réseau si données fraîches dans le cache

### Refetch Automatique

- **Window Focus** - Rafraîchit quand l'utilisateur revient sur l'onglet
- **Reconnexion** - Rafraîchit après reconnexion réseau
- **Mount** - Rafraîchit au montage du composant si données stale

### Retry Automatique

- **Queries**: 2 retry automatiques en cas d'échec réseau
- **Mutations**: 1 retry automatique
- Délais exponentiels entre retry

### Optimistic Updates

Pattern pour mutations avec mise à jour optimiste:

```typescript
const mutation = useMutation({
  mutationFn: updateData,
  onMutate: async (newData) => {
    // Annuler les queries en cours
    await queryClient.cancelQueries({ queryKey: ['data'] });

    // Sauvegarder l'ancien état
    const previous = queryClient.getQueryData(['data']);

    // Mise à jour optimiste
    queryClient.setQueryData(['data'], newData);

    return { previous };
  },
  onError: (err, newData, context) => {
    // Rollback en cas d'erreur
    queryClient.setQueryData(['data'], context.previous);
  },
  onSettled: () => {
    // Invalider pour refetch
    queryClient.invalidateQueries({ queryKey: ['data'] });
  },
});
```

---

## React Query Devtools

### Accès

En développement, cliquer sur l'icône (fleur/logo React Query) en bas à droite de l'écran.

### Fonctionnalités

- 📊 Voir toutes les queries actives
- 🔍 Inspecter le cache et l'état
- ⏱️ Voir les timings (staleTime, gcTime)
- 🔄 Forcer refetch manuellement
- 🗑️ Vider le cache
- 📈 Visualiser les mutations

### Utilisation

```typescript
// Ouvrir devtools
// Cliquer sur icône bottom-right

// Ou forcer ouverture au démarrage:
<ReactQueryDevtools initialIsOpen={true} />
```

---

## Patterns d'Utilisation

### Query Simple

```typescript
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';

const { data, isLoading, error } = useQuery({
  queryKey: queryKeys.jobs.list({ page: 1 }),
  queryFn: () => fetchJobs({ page: 1 }),
});
```

### Mutation avec Invalidation

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';

const queryClient = useQueryClient();

const mutation = useMutation({
  mutationFn: createJob,
  onSuccess: () => {
    // Invalider toutes les queries jobs
    queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
    toast.success('Job créé!');
  },
});
```

### Invalidation Multiple

```typescript
import { invalidateMultipleQueries } from '@/lib/queryClient';

await invalidateMultipleQueries([
  queryKeys.jobs.all,
  queryKeys.dashboard.stats(),
]);
```

---

## Avantages React Query

### Pour le Développeur

- ✅ **Moins de code** - Plus de useState pour loading/error/data
- ✅ **Cache automatique** - Pas besoin de gérer manuellement
- ✅ **Devtools puissants** - Debug facile
- ✅ **TypeScript** - Typage complet

### Pour l'Application

- ⚡ **Performance** - Cache intelligent, moins de requêtes
- 🔄 **Synchronisation** - Données à jour automatiquement
- 📱 **UX améliorée** - Background refetch, retry automatique
- 🐛 **Moins de bugs** - Gestion d'état simplifiée

### Pour l'Utilisateur

- 🚀 **Rapidité** - Cache = chargement instantané
- 🔄 **Fraîcheur** - Données toujours à jour
- 💪 **Fiabilité** - Retry automatique en cas d'échec
- ✨ **Fluidité** - Optimistic updates

---

## Prochaines Étapes

### Phase 2.2: Custom Hooks

Créer des hooks React Query pour chaque ressource:

- `useJobs()` - Liste jobs avec filtres
- `useMyJobs()` - Mes jobs (employeur)
- `useJob(id)` - Détail d'un job
- `useApplyToJob()` - Mutation postuler
- `useApplications()` - Mes candidatures
- `useDashboardStats()` - Stats dashboard
- `useNotifications()` - Liste notifications

### Phase 2.3: Migration Pages

Migrer les pages dashboard pour utiliser les hooks:

- `dashboard/jobs/page.tsx` - Utiliser useJobs()
- `dashboard/candidates/applications/page.tsx` - Utiliser useApplications()
- `dashboard/company/page.tsx` - Utiliser useMyJobs()
- `dashboard/admin/page.tsx` - Utiliser admin hooks

### Phase 2.4: Tests et Validation

- Tester le caching
- Vérifier refetch automatique
- Valider optimistic updates
- Monitoring avec devtools

---

## Validation

- ✅ Packages installés correctement
- ✅ QueryClient configuré
- ✅ Query keys centralisées
- ✅ Provider intégré au layout
- ✅ TypeScript validé (aucune erreur)
- ✅ Devtools configurés (dev only)

---

**Status**: ✅ PHASE 2.1 COMPLÈTE - React Query configuré et prêt à l'emploi

**Prêt pour**: Phase 2.2 (Custom Hooks)
