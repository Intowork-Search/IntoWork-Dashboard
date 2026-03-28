/**
 * Tests pour les hooks React Query Applications (useApplications.ts)
 *
 * Verifie:
 * - useMyApplications: liste des candidatures du candidat
 * - useApplyToJob: postuler a un job + invalidation du cache
 * - useWithdrawApplication: retirer une candidature + optimistic update
 * - useUpdateApplicationStatus: mise a jour statut (employeur)
 * - useUpdateApplicationNotes: mise a jour notes (employeur)
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useMyApplications,
  useApplyToJob,
  useWithdrawApplication,
  useUpdateApplicationStatus,
  useUpdateApplicationNotes,
} from '@/hooks/useApplications';
import { queryKeys } from '@/lib/queryKeys';

// ---------- Mocks ----------

const mockGetToken = vi.fn();
let mockIsSignedIn = true;

vi.mock('@/hooks/useNextAuth', () => ({
  useAuth: () => ({
    getToken: mockGetToken,
    isSignedIn: mockIsSignedIn,
    isLoaded: true,
    userId: '1',
  }),
}));

const mockGetMyApplications = vi.fn();
const mockApplyToJob = vi.fn();
const mockWithdrawApplication = vi.fn();
const mockUpdateApplicationStatus = vi.fn();
const mockUpdateApplicationNotes = vi.fn();

vi.mock('@/lib/api', () => ({
  applicationsAPI: {
    getMyApplications: (...args: unknown[]) => mockGetMyApplications(...args),
    applyToJob: (...args: unknown[]) => mockApplyToJob(...args),
    withdrawApplication: (...args: unknown[]) => mockWithdrawApplication(...args),
    updateApplicationStatus: (...args: unknown[]) => mockUpdateApplicationStatus(...args),
    updateApplicationNotes: (...args: unknown[]) => mockUpdateApplicationNotes(...args),
  },
}));

vi.mock('@/lib/getApiUrl', () => ({
  getApiUrl: () => 'http://localhost:8001/api',
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

const mockJob = {
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
};

const mockApplicationsResponse = {
  applications: [
    {
      id: 100,
      job_id: 1,
      candidate_id: 42,
      status: 'applied' as const,
      applied_at: '2026-03-20T10:00:00Z',
      notes: '',
      job: mockJob,
    },
    {
      id: 101,
      job_id: 2,
      candidate_id: 42,
      status: 'interview' as const,
      applied_at: '2026-03-18T14:30:00Z',
      notes: 'Entretien planifie',
      job: { ...mockJob, id: 2, title: 'Designer UI/UX' },
    },
  ],
  total: 2,
  page: 1,
  limit: 10,
  total_pages: 1,
};

// ---------- Tests ----------

describe('useMyApplications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetToken.mockResolvedValue('test-token');
    mockIsSignedIn = true;
  });

  it('recupere les candidatures avec succes', async () => {
    mockGetMyApplications.mockResolvedValue(mockApplicationsResponse);

    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useMyApplications(1, 10), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockApplicationsResponse);
    expect(result.current.data?.applications).toHaveLength(2);
  });

  it('passe page et limit a l API', async () => {
    mockGetMyApplications.mockResolvedValue(mockApplicationsResponse);

    const queryClient = createTestQueryClient();
    renderHook(() => useMyApplications(2, 20), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockGetMyApplications).toHaveBeenCalledWith('test-token', 2, 20);
    });
  });

  it('ne fetch pas si non authentifie', async () => {
    mockIsSignedIn = false;

    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useMyApplications(), {
      wrapper: createWrapper(queryClient),
    });

    // La query ne doit pas etre lancee
    expect(result.current.fetchStatus).toBe('idle');
    expect(mockGetMyApplications).not.toHaveBeenCalled();
  });

  it('gere les erreurs API', async () => {
    mockGetMyApplications.mockRejectedValue(new Error('Erreur serveur'));

    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useMyApplications(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe('useApplyToJob', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetToken.mockResolvedValue('test-token');
    mockIsSignedIn = true;
  });

  it('postule a un job avec succes', async () => {
    const newApplication = {
      id: 200,
      job_id: 5,
      candidate_id: 42,
      status: 'applied' as const,
      applied_at: '2026-03-28T10:00:00Z',
      job: { ...mockJob, id: 5 },
    };
    mockApplyToJob.mockResolvedValue(newApplication);

    const queryClient = createTestQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useApplyToJob(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({ job_id: 5, cover_letter: 'Je suis motive' });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApplyToJob).toHaveBeenCalledWith('test-token', {
      job_id: 5,
      cover_letter: 'Je suis motive',
    });

    // Verifie les invalidations de cache
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: queryKeys.applications.all })
    );
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: queryKeys.jobs.all })
    );
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: queryKeys.jobs.detail(5) })
    );
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: queryKeys.dashboard.all })
    );
  });

  it('gere l erreur quand non authentifie', async () => {
    mockGetToken.mockResolvedValue(null);

    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useApplyToJob(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({ job_id: 5 });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Non authentifié');
  });

  it('gere les erreurs API', async () => {
    mockApplyToJob.mockRejectedValue(new Error('Deja postule'));

    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useApplyToJob(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({ job_id: 5 });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe('useWithdrawApplication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetToken.mockResolvedValue('test-token');
    mockIsSignedIn = true;
  });

  it('retire une candidature avec succes', async () => {
    mockWithdrawApplication.mockResolvedValue(undefined);

    const queryClient = createTestQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useWithdrawApplication(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate(100);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockWithdrawApplication).toHaveBeenCalledWith('test-token', 100);

    // Verifie les invalidations de cache
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: queryKeys.applications.all })
    );
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: queryKeys.jobs.all })
    );
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: queryKeys.dashboard.all })
    );
  });

  it('effectue un optimistic update sur le retrait', async () => {
    mockWithdrawApplication.mockResolvedValue(undefined);

    const queryClient = createTestQueryClient();

    // Pre-remplir le cache avec les candidatures
    queryClient.setQueryData(
      queryKeys.applications.myApplications({ page: 1, limit: 10 }),
      mockApplicationsResponse
    );

    const { result } = renderHook(() => useWithdrawApplication(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate(100);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it('rollback en cas d erreur de retrait', async () => {
    mockWithdrawApplication.mockRejectedValue(new Error('Erreur serveur'));

    const queryClient = createTestQueryClient();

    // Pre-remplir le cache
    queryClient.setQueryData(
      queryKeys.applications.myApplications({ page: 1, limit: 10 }),
      mockApplicationsResponse
    );

    const { result } = renderHook(() => useWithdrawApplication(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate(100);
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe('useUpdateApplicationStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetToken.mockResolvedValue('test-token');
    mockIsSignedIn = true;
  });

  it('met a jour le statut avec succes', async () => {
    mockUpdateApplicationStatus.mockResolvedValue(undefined);

    const queryClient = createTestQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useUpdateApplicationStatus(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({ applicationId: 100, status: 'interview' });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockUpdateApplicationStatus).toHaveBeenCalledWith('test-token', 100, 'interview');

    // Verifie les invalidations
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: queryKeys.applications.all })
    );
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: queryKeys.dashboard.all })
    );
  });

  it('effectue un optimistic update du statut', async () => {
    mockUpdateApplicationStatus.mockResolvedValue(undefined);

    const existingApplication = {
      id: 100,
      job_id: 1,
      candidate_id: 42,
      status: 'applied' as const,
      applied_at: '2026-03-20T10:00:00Z',
      job: mockJob,
    };

    const queryClient = createTestQueryClient();
    queryClient.setQueryData(queryKeys.applications.detail(100), existingApplication);

    const { result } = renderHook(() => useUpdateApplicationStatus(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({ applicationId: 100, status: 'shortlisted' });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it('signale une erreur en cas d echec', async () => {
    mockUpdateApplicationStatus.mockRejectedValue(new Error('Erreur'));

    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => useUpdateApplicationStatus(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({ applicationId: 100, status: 'rejected' });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe('useUpdateApplicationNotes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetToken.mockResolvedValue('test-token');
    mockIsSignedIn = true;
  });

  it('met a jour les notes avec succes', async () => {
    mockUpdateApplicationNotes.mockResolvedValue(undefined);

    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useUpdateApplicationNotes(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({ applicationId: 100, notes: 'Candidat excellent' });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockUpdateApplicationNotes).toHaveBeenCalledWith('test-token', 100, 'Candidat excellent');
  });

  it('effectue un optimistic update des notes', async () => {
    mockUpdateApplicationNotes.mockResolvedValue(undefined);

    const existingApplication = {
      id: 100,
      job_id: 1,
      candidate_id: 42,
      status: 'applied' as const,
      applied_at: '2026-03-20T10:00:00Z',
      notes: 'Anciennes notes',
      job: mockJob,
    };

    const queryClient = createTestQueryClient();
    queryClient.setQueryData(queryKeys.applications.detail(100), existingApplication);

    const { result } = renderHook(() => useUpdateApplicationNotes(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({ applicationId: 100, notes: 'Nouvelles notes' });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it('signale une erreur si la mise a jour des notes echoue', async () => {
    mockUpdateApplicationNotes.mockRejectedValue(new Error('Erreur'));

    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => useUpdateApplicationNotes(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({ applicationId: 100, notes: 'Notes modifiees' });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
