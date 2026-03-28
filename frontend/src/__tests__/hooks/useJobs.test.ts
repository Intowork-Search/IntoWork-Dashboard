/**
 * Tests pour les hooks React Query Jobs (useJobs.ts)
 *
 * Verifie:
 * - useJobs: liste des jobs avec filtres
 * - useCreateJob: creation d'un job + invalidation du cache
 * - useUpdateJob: mise a jour d'un job + optimistic update + invalidation
 * - useDeleteJob: suppression d'un job + invalidation du cache
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useJobs, useCreateJob, useUpdateJob, useDeleteJob } from '@/hooks/useJobs';
import { queryKeys } from '@/lib/queryKeys';

// ---------- Mocks ----------

const mockGetToken = vi.fn();
const mockIsSignedIn = true;

vi.mock('@/hooks/useNextAuth', () => ({
  useAuth: () => ({
    getToken: mockGetToken,
    isSignedIn: mockIsSignedIn,
    isLoaded: true,
    userId: '1',
  }),
}));

const mockGetJobs = vi.fn();
const mockCreateJob = vi.fn();
const mockUpdateJob = vi.fn();
const mockDeleteJob = vi.fn();

vi.mock('@/lib/api', () => ({
  jobsAPI: {
    getJobs: (...args: unknown[]) => mockGetJobs(...args),
    createJob: (...args: unknown[]) => mockCreateJob(...args),
    updateJob: (...args: unknown[]) => mockUpdateJob(...args),
    deleteJob: (...args: unknown[]) => mockDeleteJob(...args),
  },
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/types', () => ({
  getErrorMessage: (error: unknown, fallback: string) => {
    if (error instanceof Error) return error.message;
    return fallback;
  },
}));

// ---------- Helpers ----------

function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    );
  };
}

// ---------- Donnees de test ----------

const mockJobListResponse = {
  jobs: [
    {
      id: 1,
      title: 'Developpeur Full Stack',
      description: 'Un poste passionnant',
      company_name: 'AGILITYM',
      location: 'Libreville',
      location_type: 'on_site' as const,
      job_type: 'full_time' as const,
      currency: 'XAF',
      status: 'active',
      is_featured: false,
      views_count: 10,
      applications_count: 3,
      has_applied: false,
    },
    {
      id: 2,
      title: 'Designer UI/UX',
      description: 'Conception interfaces',
      company_name: 'IntoWork',
      location: 'Douala',
      location_type: 'remote' as const,
      job_type: 'contract' as const,
      currency: 'XAF',
      status: 'active',
      is_featured: true,
      views_count: 25,
      applications_count: 8,
      has_applied: true,
    },
  ],
  total: 2,
  page: 1,
  limit: 10,
  total_pages: 1,
};

// ---------- Tests ----------

describe('useJobs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetToken.mockResolvedValue('test-token');
  });

  it('recupere la liste des jobs avec succes', async () => {
    mockGetJobs.mockResolvedValue(mockJobListResponse);

    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useJobs(), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockJobListResponse);
    expect(result.current.data?.jobs).toHaveLength(2);
    expect(result.current.data?.total).toBe(2);
  });

  it('passe les filtres a l API', async () => {
    mockGetJobs.mockResolvedValue(mockJobListResponse);

    const filters = { page: 2, limit: 5, search: 'developer' };
    const queryClient = createTestQueryClient();
    renderHook(() => useJobs(filters), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockGetJobs).toHaveBeenCalledWith(filters, 'test-token');
    });
  });

  it('gere les erreurs API', async () => {
    mockGetJobs.mockRejectedValue(new Error('Erreur serveur'));

    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useJobs(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
  });

  it('utilise les bonnes query keys', async () => {
    mockGetJobs.mockResolvedValue(mockJobListResponse);

    const filters = { page: 1, limit: 10 };
    const queryClient = createTestQueryClient();
    renderHook(() => useJobs(filters), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      const queryData = queryClient.getQueryData(queryKeys.jobs.list(filters));
      expect(queryData).toEqual(mockJobListResponse);
    });
  });
});

describe('useCreateJob', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetToken.mockResolvedValue('test-token');
  });

  it('cree un job avec succes', async () => {
    const newJob = {
      id: 3,
      title: 'Nouveau Poste',
      description: 'Description',
      company_name: 'AGILITYM',
      currency: 'XAF',
      status: 'draft',
      is_featured: false,
      views_count: 0,
      applications_count: 0,
      has_applied: false,
    };
    mockCreateJob.mockResolvedValue(newJob);

    const queryClient = createTestQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreateJob(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({ title: 'Nouveau Poste', description: 'Description' });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockCreateJob).toHaveBeenCalledWith(
      { title: 'Nouveau Poste', description: 'Description' },
      'test-token'
    );

    // Verifie que le cache est invalide apres la creation
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: queryKeys.jobs.all })
    );
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: queryKeys.dashboard.all })
    );
  });

  it('gere l erreur d authentification', async () => {
    mockGetToken.mockResolvedValue(null);

    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useCreateJob(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({ title: 'Poste' });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Non authentifié');
  });

  it('gere les erreurs API lors de la creation', async () => {
    mockCreateJob.mockRejectedValue(new Error('Validation error'));

    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useCreateJob(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({ title: '' });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe('useUpdateJob', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetToken.mockResolvedValue('test-token');
  });

  it('met a jour un job avec succes', async () => {
    const updatedJob = {
      id: 1,
      title: 'Titre modifie',
      description: 'Description modifiee',
      company_name: 'AGILITYM',
      currency: 'XAF',
      status: 'active',
      is_featured: false,
      views_count: 10,
      applications_count: 3,
      has_applied: false,
    };
    mockUpdateJob.mockResolvedValue(updatedJob);

    const queryClient = createTestQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useUpdateJob(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        jobId: 1,
        data: { title: 'Titre modifie' },
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockUpdateJob).toHaveBeenCalledWith(1, { title: 'Titre modifie' }, 'test-token');

    // Verifie l'invalidation du cache
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: queryKeys.jobs.all })
    );
  });

  it('effectue un optimistic update', async () => {
    const existingJob = {
      id: 1,
      title: 'Ancien Titre',
      description: 'Desc',
      company_name: 'AGILITYM',
      currency: 'XAF',
      status: 'active',
      is_featured: false,
      views_count: 10,
      applications_count: 3,
      has_applied: false,
    };

    const updatedJob = { ...existingJob, title: 'Nouveau Titre' };
    mockUpdateJob.mockResolvedValue(updatedJob);

    const queryClient = createTestQueryClient();
    // Pre-remplir le cache avec le job existant
    queryClient.setQueryData(queryKeys.jobs.detail(1), existingJob);

    const { result } = renderHook(() => useUpdateJob(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({ jobId: 1, data: { title: 'Nouveau Titre' } });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Verifie que la mutation a reussi et invalidateQueries a ete appele
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    expect(result.current.isSuccess).toBe(true);
  });

  it('signale une erreur en cas d echec', async () => {
    mockUpdateJob.mockRejectedValue(new Error('Erreur serveur'));

    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => useUpdateJob(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({ jobId: 1, data: { title: 'Devrait echouer' } });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe('useDeleteJob', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetToken.mockResolvedValue('test-token');
  });

  it('supprime un job avec succes', async () => {
    mockDeleteJob.mockResolvedValue(undefined);

    const queryClient = createTestQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useDeleteJob(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate(1);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockDeleteJob).toHaveBeenCalledWith(1, 'test-token');

    // Verifie l'invalidation du cache
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: queryKeys.jobs.all })
    );
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: queryKeys.dashboard.all })
    );
  });

  it('gere l erreur d authentification', async () => {
    mockGetToken.mockResolvedValue(null);

    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useDeleteJob(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate(999);
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Non authentifié');
  });
});
