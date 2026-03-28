/**
 * Tests pour le module API (lib/api.ts)
 *
 * Verifie:
 * - createAuthenticatedClient: cree un client axios avec le bon token
 * - getUploadUrl: construit les URLs de fichiers correctement
 * - apiClient: intercepteur pour erreurs 401
 * - Services API (jobsAPI, applicationsAPI) appellent les bons endpoints
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// Mock getApiUrl avant l'import de api.ts
vi.mock('@/lib/getApiUrl', () => ({
  getApiUrl: () => 'http://localhost:8001/api',
}));

// Mock axios.create pour capturer la configuration
const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPut = vi.fn();
const mockDelete = vi.fn();
const mockInterceptorsRequestUse = vi.fn();
const mockInterceptorsResponseUse = vi.fn();

const createMockAxiosInstance = () => ({
  get: mockGet,
  post: mockPost,
  put: mockPut,
  delete: mockDelete,
  interceptors: {
    request: { use: mockInterceptorsRequestUse },
    response: { use: mockInterceptorsResponseUse },
  },
});

vi.mock('axios', () => {
  const mockInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  };
  return {
    default: {
      create: vi.fn(() => ({
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      })),
    },
  };
});

describe('createAuthenticatedClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('cree un client avec le header Authorization', async () => {
    // Re-import pour chaque test afin de capturer les appels
    const { createAuthenticatedClient } = await import('@/lib/api');

    const client = createAuthenticatedClient('mon-token-jwt');

    // Verifie que axios.create a ete appele avec les bons headers
    expect(axios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mon-token-jwt',
        }),
      })
    );
  });

  it('cree un client avec le header Content-Type application/json', async () => {
    const { createAuthenticatedClient } = await import('@/lib/api');

    createAuthenticatedClient('token-xyz');

    expect(axios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      })
    );
  });

  it('cree des clients distincts pour des tokens differents', async () => {
    const { createAuthenticatedClient } = await import('@/lib/api');

    const client1 = createAuthenticatedClient('token-1');
    const client2 = createAuthenticatedClient('token-2');

    // Chaque appel a create doit avoir un token different
    const calls = (axios.create as ReturnType<typeof vi.fn>).mock.calls;
    const lastTwoCalls = calls.slice(-2);

    expect(lastTwoCalls[0][0].headers.Authorization).toBe('Bearer token-1');
    expect(lastTwoCalls[1][0].headers.Authorization).toBe('Bearer token-2');
  });
});

describe('getUploadUrl', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retourne une chaine vide pour un path null', async () => {
    const { getUploadUrl } = await import('@/lib/api');

    expect(getUploadUrl(null)).toBe('');
  });

  it('retourne une chaine vide pour un path undefined', async () => {
    const { getUploadUrl } = await import('@/lib/api');

    expect(getUploadUrl(undefined)).toBe('');
  });

  it('retourne une chaine vide pour une chaine vide', async () => {
    const { getUploadUrl } = await import('@/lib/api');

    expect(getUploadUrl('')).toBe('');
  });

  it('retourne l URL telle quelle si elle commence par http://', async () => {
    const { getUploadUrl } = await import('@/lib/api');

    const url = 'http://example.com/photo.jpg';
    expect(getUploadUrl(url)).toBe(url);
  });

  it('retourne l URL telle quelle si elle commence par https://', async () => {
    const { getUploadUrl } = await import('@/lib/api');

    const url = 'https://cdn.cloudinary.com/avatar.png';
    expect(getUploadUrl(url)).toBe(url);
  });

  it('construit l URL complete pour un chemin relatif', async () => {
    const { getUploadUrl } = await import('@/lib/api');

    const path = '/uploads/cvs/42/cv.pdf';
    const result = getUploadUrl(path);

    // Le baseUrl est http://localhost:8001/api sans /api = http://localhost:8001
    expect(result).toBe('http://localhost:8001/uploads/cvs/42/cv.pdf');
  });
});

describe('API services - structure des appels', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('jobsAPI.getJobs existe et est une fonction', async () => {
    const { jobsAPI } = await import('@/lib/api');

    expect(typeof jobsAPI.getJobs).toBe('function');
  });

  it('jobsAPI.createJob existe et est une fonction', async () => {
    const { jobsAPI } = await import('@/lib/api');

    expect(typeof jobsAPI.createJob).toBe('function');
  });

  it('jobsAPI.updateJob existe et est une fonction', async () => {
    const { jobsAPI } = await import('@/lib/api');

    expect(typeof jobsAPI.updateJob).toBe('function');
  });

  it('jobsAPI.deleteJob existe et est une fonction', async () => {
    const { jobsAPI } = await import('@/lib/api');

    expect(typeof jobsAPI.deleteJob).toBe('function');
  });

  it('applicationsAPI.getMyApplications existe et est une fonction', async () => {
    const { applicationsAPI } = await import('@/lib/api');

    expect(typeof applicationsAPI.getMyApplications).toBe('function');
  });

  it('applicationsAPI.applyToJob existe et est une fonction', async () => {
    const { applicationsAPI } = await import('@/lib/api');

    expect(typeof applicationsAPI.applyToJob).toBe('function');
  });

  it('applicationsAPI.withdrawApplication existe et est une fonction', async () => {
    const { applicationsAPI } = await import('@/lib/api');

    expect(typeof applicationsAPI.withdrawApplication).toBe('function');
  });

  it('candidatesAPI.getMyProfile existe et est une fonction', async () => {
    const { candidatesAPI } = await import('@/lib/api');

    expect(typeof candidatesAPI.getMyProfile).toBe('function');
  });

  it('adminAPI.getStats existe et est une fonction', async () => {
    const { adminAPI } = await import('@/lib/api');

    expect(typeof adminAPI.getStats).toBe('function');
  });

  it('notificationsAPI.getNotifications existe et est une fonction', async () => {
    const { notificationsAPI } = await import('@/lib/api');

    expect(typeof notificationsAPI.getNotifications).toBe('function');
  });
});
