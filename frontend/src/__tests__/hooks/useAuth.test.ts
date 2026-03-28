/**
 * Tests pour useAuth et useUser hooks (useNextAuth.ts)
 *
 * Verifie:
 * - getToken retourne le token de session
 * - isSignedIn reflette l'etat d'authentification
 * - isLoaded reflette le statut de chargement
 * - useUser expose les donnees utilisateur correctement
 */

import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuth, useUser } from '@/hooks/useNextAuth';

// Mock next-auth/react
const mockUseSession = vi.fn();
vi.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
}));

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retourne isSignedIn=false quand pas de session', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.isSignedIn).toBe(false);
    expect(result.current.isLoaded).toBe(true);
    expect(result.current.userId).toBeUndefined();
  });

  it('retourne isLoaded=false pendant le chargement', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.isLoaded).toBe(false);
    expect(result.current.isSignedIn).toBe(false);
  });

  it('retourne isSignedIn=true et userId quand authentifie', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { id: '42', email: 'test@intowork.co', name: 'Jean Dupont' },
        accessToken: 'jwt-token-abc',
      },
      status: 'authenticated',
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.isSignedIn).toBe(true);
    expect(result.current.isLoaded).toBe(true);
    expect(result.current.userId).toBe('42');
  });

  it('getToken retourne le accessToken de la session', async () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { id: '42', email: 'test@intowork.co' },
        accessToken: 'jwt-token-abc',
      },
      status: 'authenticated',
    });

    const { result } = renderHook(() => useAuth());
    const token = await result.current.getToken();

    expect(token).toBe('jwt-token-abc');
  });

  it('getToken retourne null quand pas de session', async () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    const { result } = renderHook(() => useAuth());
    const token = await result.current.getToken();

    expect(token).toBeNull();
  });

  it('getToken retourne null quand pas d accessToken dans la session', async () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { id: '42', email: 'test@intowork.co' },
        // pas de accessToken
      },
      status: 'authenticated',
    });

    const { result } = renderHook(() => useAuth());
    const token = await result.current.getToken();

    expect(token).toBeNull();
  });
});

describe('useUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retourne user=null quand pas de session', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    const { result } = renderHook(() => useUser());

    expect(result.current.user).toBeNull();
    expect(result.current.isSignedIn).toBe(false);
    expect(result.current.isLoaded).toBe(true);
  });

  it('retourne les donnees utilisateur formatees quand authentifie', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '42',
          email: 'jean.dupont@intowork.co',
          name: 'Jean Dupont',
          image: 'https://cdn.intowork.co/avatar.jpg',
          role: 'candidate',
        },
        accessToken: 'jwt-token-abc',
      },
      status: 'authenticated',
    });

    const { result } = renderHook(() => useUser());

    expect(result.current.user).toEqual({
      id: '42',
      email: 'jean.dupont@intowork.co',
      firstName: 'Jean',
      lastName: 'Dupont',
      fullName: 'Jean Dupont',
      imageUrl: 'https://cdn.intowork.co/avatar.jpg',
      role: 'candidate',
    });
    expect(result.current.isSignedIn).toBe(true);
    expect(result.current.isLoaded).toBe(true);
  });

  it('gere un nom sans prenom/nom correctement', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '7',
          email: 'solo@intowork.co',
          name: 'Solo',
          role: 'employer',
        },
      },
      status: 'authenticated',
    });

    const { result } = renderHook(() => useUser());

    expect(result.current.user?.firstName).toBe('Solo');
    expect(result.current.user?.lastName).toBe('');
    expect(result.current.user?.fullName).toBe('Solo');
  });

  it('gere un user sans name', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '10',
          email: 'no-name@intowork.co',
        },
      },
      status: 'authenticated',
    });

    const { result } = renderHook(() => useUser());

    expect(result.current.user?.firstName).toBe('');
    expect(result.current.user?.lastName).toBe('');
    expect(result.current.user?.fullName).toBeUndefined();
  });

  it('retourne isLoaded=false pendant le chargement', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
    });

    const { result } = renderHook(() => useUser());

    expect(result.current.isLoaded).toBe(false);
    expect(result.current.isSignedIn).toBe(false);
    expect(result.current.user).toBeNull();
  });
});
