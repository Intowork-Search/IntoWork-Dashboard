/**
 * Tests pour queryKeys (lib/queryKeys.ts)
 *
 * Verifie:
 * - La structure hierarchique des cles de cache
 * - Les cles statiques (all, lists)
 * - Les cles parametrees (list avec filtres, detail avec id)
 * - L'unicite des cles entre ressources
 * - Le helper getQueriesByPrefix
 */

import { describe, it, expect } from 'vitest';
import { queryKeys, getQueriesByPrefix } from '@/lib/queryKeys';
import type { JobFilters, ApplicationFilters } from '@/lib/queryKeys';

describe('queryKeys structure', () => {
  describe('jobs', () => {
    it('all retourne le prefixe de base', () => {
      expect(queryKeys.jobs.all).toEqual(['jobs']);
    });

    it('lists retourne le prefixe pour les listes', () => {
      expect(queryKeys.jobs.lists()).toEqual(['jobs', 'list']);
    });

    it('list sans filtres retourne la cle avec objet vide', () => {
      expect(queryKeys.jobs.list()).toEqual(['jobs', 'list', {}]);
    });

    it('list avec filtres inclut les filtres dans la cle', () => {
      const filters: JobFilters = { page: 2, limit: 20, search: 'dev' };
      const key = queryKeys.jobs.list(filters);

      expect(key).toEqual(['jobs', 'list', { page: 2, limit: 20, search: 'dev' }]);
    });

    it('detail retourne la cle avec l id', () => {
      expect(queryKeys.jobs.detail(42)).toEqual(['jobs', 'detail', 42]);
    });

    it('myJobs retourne une cle separee', () => {
      expect(queryKeys.jobs.myJobs()).toEqual(['my-jobs', {}]);
    });

    it('myJobs avec filtres inclut les filtres', () => {
      const filters: JobFilters = { status: 'active' };
      expect(queryKeys.jobs.myJobs(filters)).toEqual(['my-jobs', { status: 'active' }]);
    });

    it('list avec differents filtres produit des cles differentes', () => {
      const key1 = queryKeys.jobs.list({ page: 1 });
      const key2 = queryKeys.jobs.list({ page: 2 });

      expect(key1).not.toEqual(key2);
    });

    it('detail avec differents ids produit des cles differentes', () => {
      const key1 = queryKeys.jobs.detail(1);
      const key2 = queryKeys.jobs.detail(2);

      expect(key1).not.toEqual(key2);
    });
  });

  describe('applications', () => {
    it('all retourne le prefixe de base', () => {
      expect(queryKeys.applications.all).toEqual(['applications']);
    });

    it('lists retourne le prefixe pour les listes', () => {
      expect(queryKeys.applications.lists()).toEqual(['applications', 'list']);
    });

    it('list sans filtres retourne la cle avec objet vide', () => {
      expect(queryKeys.applications.list()).toEqual(['applications', 'list', {}]);
    });

    it('list avec filtres inclut les filtres', () => {
      const filters: ApplicationFilters = { page: 1, status: 'interview' };
      expect(queryKeys.applications.list(filters)).toEqual([
        'applications',
        'list',
        { page: 1, status: 'interview' },
      ]);
    });

    it('detail retourne la cle avec l id', () => {
      expect(queryKeys.applications.detail(100)).toEqual(['applications', 'detail', 100]);
    });

    it('myApplications retourne une cle separee', () => {
      expect(queryKeys.applications.myApplications()).toEqual(['my-applications', {}]);
    });

    it('myApplications avec filtres inclut les filtres', () => {
      const filters: ApplicationFilters = { page: 2, limit: 5 };
      expect(queryKeys.applications.myApplications(filters)).toEqual([
        'my-applications',
        { page: 2, limit: 5 },
      ]);
    });

    it('employerApplications retourne une cle separee', () => {
      expect(queryKeys.applications.employerApplications()).toEqual([
        'employer-applications',
        {},
      ]);
    });

    it('employerApplications avec filtres inclut les filtres', () => {
      const filters: ApplicationFilters = { status: 'applied', job_id: 5 };
      expect(queryKeys.applications.employerApplications(filters)).toEqual([
        'employer-applications',
        { status: 'applied', job_id: 5 },
      ]);
    });
  });

  describe('candidates', () => {
    it('all retourne le prefixe de base', () => {
      expect(queryKeys.candidates.all).toEqual(['candidates']);
    });

    it('profile retourne la cle pour le profil', () => {
      expect(queryKeys.candidates.profile()).toEqual(['candidates', 'profile']);
    });

    it('cvs retourne la cle pour les CVs', () => {
      expect(queryKeys.candidates.cvs()).toEqual(['candidates', 'cvs']);
    });

    it('experiences retourne la cle pour les experiences', () => {
      expect(queryKeys.candidates.experiences()).toEqual(['candidates', 'experiences']);
    });

    it('educations retourne la cle pour les formations', () => {
      expect(queryKeys.candidates.educations()).toEqual(['candidates', 'educations']);
    });

    it('skills retourne la cle pour les competences', () => {
      expect(queryKeys.candidates.skills()).toEqual(['candidates', 'skills']);
    });
  });

  describe('companies', () => {
    it('all retourne le prefixe de base', () => {
      expect(queryKeys.companies.all).toEqual(['companies']);
    });

    it('myCompany retourne la cle pour l entreprise', () => {
      expect(queryKeys.companies.myCompany()).toEqual(['companies', 'my-company']);
    });

    it('stats retourne la cle pour les statistiques', () => {
      expect(queryKeys.companies.stats()).toEqual(['companies', 'stats']);
    });
  });

  describe('dashboard', () => {
    it('all retourne le prefixe de base', () => {
      expect(queryKeys.dashboard.all).toEqual(['dashboard']);
    });

    it('stats retourne la cle pour les stats', () => {
      expect(queryKeys.dashboard.stats()).toEqual(['dashboard', 'stats']);
    });

    it('activities retourne la cle pour les activites', () => {
      expect(queryKeys.dashboard.activities()).toEqual(['dashboard', 'activities']);
    });
  });

  describe('notifications', () => {
    it('all retourne le prefixe de base', () => {
      expect(queryKeys.notifications.all).toEqual(['notifications']);
    });

    it('list avec valeurs par defaut', () => {
      expect(queryKeys.notifications.list()).toEqual([
        'notifications',
        'list',
        { page: 1, limit: 10 },
      ]);
    });

    it('list avec parametres personnalises', () => {
      expect(queryKeys.notifications.list(3, 25)).toEqual([
        'notifications',
        'list',
        { page: 3, limit: 25 },
      ]);
    });

    it('unreadCount retourne la cle pour le compteur', () => {
      expect(queryKeys.notifications.unreadCount()).toEqual([
        'notifications',
        'unread-count',
      ]);
    });
  });

  describe('admin', () => {
    it('all retourne le prefixe de base', () => {
      expect(queryKeys.admin.all).toEqual(['admin']);
    });

    it('stats retourne la cle pour les stats admin', () => {
      expect(queryKeys.admin.stats()).toEqual(['admin', 'stats']);
    });

    it('users sans filtres', () => {
      expect(queryKeys.admin.users()).toEqual(['admin', 'users', {}]);
    });

    it('users avec filtres', () => {
      expect(queryKeys.admin.users({ role: 'candidate', search: 'jean' })).toEqual([
        'admin',
        'users',
        { role: 'candidate', search: 'jean' },
      ]);
    });

    it('employers avec valeurs par defaut', () => {
      expect(queryKeys.admin.employers()).toEqual([
        'admin',
        'employers',
        { page: 1, limit: 20 },
      ]);
    });

    it('employers avec parametres personnalises', () => {
      expect(queryKeys.admin.employers(2, 50)).toEqual([
        'admin',
        'employers',
        { page: 2, limit: 50 },
      ]);
    });

    it('jobs avec valeurs par defaut', () => {
      expect(queryKeys.admin.jobs()).toEqual([
        'admin',
        'jobs',
        { page: 1, limit: 20 },
      ]);
    });
  });

  describe('auth', () => {
    it('currentUser retourne la cle pour l utilisateur courant', () => {
      expect(queryKeys.auth.currentUser()).toEqual(['auth', 'current-user']);
    });
  });
});

describe('unicite des prefixes entre ressources', () => {
  it('chaque ressource a un prefixe unique', () => {
    const prefixes = [
      queryKeys.jobs.all[0],
      queryKeys.applications.all[0],
      queryKeys.candidates.all[0],
      queryKeys.companies.all[0],
      queryKeys.dashboard.all[0],
      queryKeys.notifications.all[0],
      queryKeys.admin.all[0],
    ];

    const uniquePrefixes = new Set(prefixes);
    expect(uniquePrefixes.size).toBe(prefixes.length);
  });

  it('les cles ne se chevauchent pas entre jobs et applications', () => {
    const jobKey = queryKeys.jobs.all;
    const appKey = queryKeys.applications.all;

    expect(jobKey[0]).not.toBe(appKey[0]);
  });
});

describe('getQueriesByPrefix', () => {
  it('retourne un objet avec queryKey pour jobs', () => {
    const result = getQueriesByPrefix(queryKeys.jobs.all);
    expect(result).toEqual({ queryKey: ['jobs'] });
  });

  it('retourne un objet avec queryKey pour applications', () => {
    const result = getQueriesByPrefix(queryKeys.applications.all);
    expect(result).toEqual({ queryKey: ['applications'] });
  });

  it('retourne un objet avec queryKey pour un prefixe arbitraire', () => {
    const result = getQueriesByPrefix(['custom', 'prefix']);
    expect(result).toEqual({ queryKey: ['custom', 'prefix'] });
  });
});

describe('hierarchie des cles (invalidation en cascade)', () => {
  it('jobs.all est un prefixe de jobs.list', () => {
    const allKey = queryKeys.jobs.all;
    const listKey = queryKeys.jobs.list({ page: 1 });

    // Le premier element de list doit correspondre au prefixe all
    expect(listKey[0]).toBe(allKey[0]);
  });

  it('jobs.all est un prefixe de jobs.detail', () => {
    const allKey = queryKeys.jobs.all;
    const detailKey = queryKeys.jobs.detail(42);

    expect(detailKey[0]).toBe(allKey[0]);
  });

  it('applications.all est un prefixe de applications.list', () => {
    const allKey = queryKeys.applications.all;
    const listKey = queryKeys.applications.list();

    expect(listKey[0]).toBe(allKey[0]);
  });

  it('applications.all est un prefixe de applications.detail', () => {
    const allKey = queryKeys.applications.all;
    const detailKey = queryKeys.applications.detail(100);

    expect(detailKey[0]).toBe(allKey[0]);
  });
});

describe('type safety des filtres', () => {
  it('JobFilters accepte les champs attendus', () => {
    const filters: JobFilters = {
      page: 1,
      limit: 10,
      search: 'test',
      status: 'active',
      location: 'Libreville',
      job_type: 'full_time',
      location_type: 'remote',
      country: 'GA',
      currency: 'XAF',
    };

    const key = queryKeys.jobs.list(filters);
    expect(key[2]).toEqual(filters);
  });

  it('ApplicationFilters accepte les champs attendus', () => {
    const filters: ApplicationFilters = {
      page: 1,
      limit: 10,
      status: 'applied',
      job_id: 42,
    };

    const key = queryKeys.applications.list(filters);
    expect(key[2]).toEqual(filters);
  });
});
