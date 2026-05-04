#!/usr/bin/env python3
"""Câblage des traductions pour les pages admin."""
import re

BASE = "/home/anna/Documents/IntoWork-Dashboard/frontend/src/app/[locale]/dashboard"

# ─── admin/users/page.tsx ───────────────────────────────────────────────────

users_file = f"{BASE}/admin/users/page.tsx"
with open(users_file, encoding="utf-8") as f:
    src = f.read()

# 1. Ajouter l'import useTranslations après les autres imports
src = src.replace(
    "import toast from 'react-hot-toast';",
    "import toast from 'react-hot-toast';\nimport { useTranslations } from 'next-intl';"
)

# 2. Ajouter les hooks dans le composant (après le premier useRouter)
src = src.replace(
    "  const [userSearch, setUserSearch] = useState('');",
    "  const t = useTranslations('adminUsers');\n  const tc = useTranslations('common');\n  const [userSearch, setUserSearch] = useState('');"
)

# 3. Toast messages
src = src.replace(
    "toast.success(currentStatus ? 'Utilisateur désactivé avec succès' : 'Utilisateur activé avec succès');",
    "toast.success(currentStatus ? t('deactivatedSuccess') : t('activatedSuccess'));"
)
src = src.replace(
    "toast.error('Erreur lors de la modification du statut');",
    "toast.error(t('statusToggleError'));"
)
src = src.replace(
    "toast.success('Utilisateur supprimé avec succès');",
    "toast.success(t('deleteSuccess'));"
)
src = src.replace(
    "toast.error(getErrorMessage(error, 'Erreur lors de la suppression'));",
    "toast.error(getErrorMessage(error, t('deleteError')));"
)
src = src.replace(
    "toast.success(`Compte créé et email envoyé à ${createForm.email}`);",
    "toast.success(t('createSuccess'));"
)
src = src.replace(
    "toast.error(getErrorMessage(error, 'Erreur lors de la création'));",
    "toast.error(getErrorMessage(error, t('createError')));"
)

# 4. Loading state
src = src.replace(
    '<DashboardLayout title="Utilisateurs" subtitle="Chargement...">',
    '<DashboardLayout title={t(\'loadingTitle\')} subtitle={tc(\'loading\')}>'
)

# 5. Titre principal
src = src.replace(
    '    <DashboardLayout \n      title="Gestion des utilisateurs" \n      subtitle={`${users.length} utilisateur${users.length > 1 ? \'s\' : \'\'} au total`}',
    '    <DashboardLayout \n      title={t(\'title\')} \n      subtitle={`${users.length} utilisateur${users.length > 1 ? \'s\' : \'\'} au total`}'
)

# 6. Placeholder recherche
src = src.replace(
    'placeholder="Rechercher un utilisateur..."',
    '{...{ placeholder: t(\'searchPlaceholder\') }}'
)

# 7. Options filtre rôle
src = src.replace(
    '<option value="">Tous les rôles</option>',
    '<option value="">{t(\'filterAllRoles\')}</option>'
)
src = src.replace(
    '<option value="candidate">Candidats</option>\n              <option value="employer">Employeurs</option>\n              <option value="admin">Admins</option>',
    '<option value="candidate">{t(\'roleCandidates\')}</option>\n              <option value="employer">{t(\'roleEmployers\')}</option>\n              <option value="admin">{t(\'roleAdmins\')}</option>'
)

# 8. Bouton Actualiser
src = src.replace(
    '              Actualiser\n            </button>\n            <button\n              onClick={() => setShowCreateModal(true)}',
    '              {tc(\'refresh\')}\n            </button>\n            <button\n              onClick={() => setShowCreateModal(true)}'
)

# 9. Bouton Créer un utilisateur
src = src.replace(
    '              Créer un utilisateur\n            </button>\n          </div>\n        </div>\n\n        {/* Table',
    '              {t(\'createButton\')}\n            </button>\n          </div>\n        </div>\n\n        {/* Table'
)

# 10. En-têtes tableau
src = src.replace(
    '<th className="px-6 py-5 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Utilisateur</th>',
    '<th className="px-6 py-5 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t(\'colUser\')}</th>'
)
src = src.replace(
    '<th className="px-6 py-5 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Email</th>',
    '<th className="px-6 py-5 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">{tc(\'email\')}</th>'
)
src = src.replace(
    '<th className="px-6 py-5 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Rôle</th>',
    '<th className="px-6 py-5 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">{tc(\'role\')}</th>'
)
src = src.replace(
    '<th className="px-6 py-5 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Statut</th>',
    '<th className="px-6 py-5 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t(\'colStatus\')}</th>'
)
src = src.replace(
    '<th className="px-6 py-5 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Inscription</th>',
    '<th className="px-6 py-5 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t(\'colRegistration\')}</th>'
)
src = src.replace(
    '<th className="px-6 py-5 text-right text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Actions</th>',
    '<th className="px-6 py-5 text-right text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">{tc(\'actions\')}</th>'
)

# 11. Badge rôle
src = src.replace(
    "        {user.role === 'admin' ? 'Admin' : user.role === 'candidate' ? 'Candidat' : 'Employeur'}",
    "        {user.role === 'admin' ? t('roleAdmin') : user.role === 'candidate' ? t('roleCandidate') : t('roleEmployer')}"
)

# 12. Status Actif/Inactif dans le tableau
src = src.replace(
    "          <><CheckCircleIcon className=\"w-4 h-4\" /> Actif</>",
    "          <><CheckCircleIcon className=\"w-4 h-4\" /> {tc('active')}</>"
)
src = src.replace(
    "          <><XCircleIcon className=\"w-4 h-4\" /> Inactif</>",
    "          <><XCircleIcon className=\"w-4 h-4\" /> {tc('inactive')}</>"
)

# 13. Boutons Désactiver/Activer et Supprimer
src = src.replace(
    "            {user.is_active ? 'Désactiver' : 'Activer'}",
    "            {user.is_active ? t('deactivate') : t('activate')}"
)
src = src.replace(
    "          className=\"px-4 py-2 text-xs font-bold bg-red-100 text-red-700 hover:bg-red-200 rounded-xl transition-all duration-200\"\n                        >\n                          Supprimer",
    "          className=\"px-4 py-2 text-xs font-bold bg-red-100 text-red-700 hover:bg-red-200 rounded-xl transition-all duration-200\"\n                        >\n                          {tc('delete')}"
)

# 14. Message vide
src = src.replace(
    "              <p className=\"text-gray-500 dark:text-gray-400\">Aucun utilisateur trouvé</p>",
    "              <p className=\"text-gray-500 dark:text-gray-400\">{t('empty')}</p>"
)

# 15. Modal création - titre
src = src.replace(
    '              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Créer un utilisateur</h2>',
    '<h2 className="text-xl font-bold text-gray-900 dark:text-white">{t(\'modalCreateTitle\')}</h2>'
)

# 16. Labels formulaire
src = src.replace(
    '                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prénom</label>',
    '<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{tc(\'firstName\')}</label>'
)
src = src.replace(
    '                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom</label>',
    '<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{tc(\'lastName\')}</label>'
)
src = src.replace(
    '              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>',
    '<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{tc(\'email\')}</label>'
)
src = src.replace(
    '              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rôle</label>',
    '<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{tc(\'role\')}</label>'
)
src = src.replace(
    '              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom de l&apos;entreprise</label>',
    '<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t(\'companyName\')}</label>'
)

# 17. Options rôle dans le formulaire
src = src.replace(
    '                  <option value="candidate">Candidat</option>\n                  <option value="employer">Employeur</option>',
    '                  <option value="candidate">{t(\'roleCandidate\')}</option>\n                  <option value="employer">{t(\'roleEmployer\')}</option>'
)

# 18. Note mot de passe temporaire
src = src.replace(
    "                Un mot de passe temporaire sera généré automatiquement et envoyé par email à l&apos;utilisateur.",
    "{t('tempPasswordNote')}"
)

# 19. Boutons Annuler/Créer du modal
src = src.replace(
    '                  Annuler\n                </button>\n                <button\n                  type="submit"\n                  disabled={creating}',
    '                  {tc(\'cancel\')}\n                </button>\n                <button\n                  type="submit"\n                  disabled={creating}'
)
src = src.replace(
    '                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Création...</>',
    '<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> {t(\'creating\')}</>'
)
src = src.replace(
    '                    <><PlusIcon className="w-4 h-4" /> Créer et envoyer</>',
    '<><PlusIcon className="w-4 h-4" /> {t(\'createAndSend\')}</>'
)

# 20. Modal suppression
src = src.replace(
    '                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Supprimer cet utilisateur ?</h2>',
    '<h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t(\'deleteModalTitle\')}</h2>'
)
src = src.replace(
    '                  Vous êtes sur le point de supprimer définitivement le compte de\n                </p>',
    '                  {t(\'deleteModalText\')}\n                </p>'
)
src = src.replace(
    '                  Cette action est irréversible et supprimera toutes les données associées.\n                </p>',
    '                  {t(\'deleteIrreversible\')}\n                </p>'
)
src = src.replace(
    '                  Annuler\n                </button>\n                <button\n                  onClick={confirmDeleteUser}',
    '                  {tc(\'cancel\')}\n                </button>\n                <button\n                  onClick={confirmDeleteUser}'
)
src = src.replace(
    '                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Suppression...</>',
    '<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> {t(\'deleting\')}</>'
)
src = src.replace(
    '                    <><TrashIcon className="w-4 h-4" /> Supprimer</>',
    '<><TrashIcon className="w-4 h-4" /> {tc(\'delete\')}</>'
)

with open(users_file, "w", encoding="utf-8") as f:
    f.write(src)
print("✅ admin/users/page.tsx traduit")

# ─── admin/employers/page.tsx ────────────────────────────────────────────────

employers_file = f"{BASE}/admin/employers/page.tsx"
with open(employers_file, encoding="utf-8") as f:
    src = f.read()

# Import
src = src.replace(
    "import { logger } from '@/lib/logger';",
    "import { logger } from '@/lib/logger';\nimport { useTranslations } from 'next-intl';"
)

# Hooks dans le composant
src = src.replace(
    "  const [loading, setLoading] = useState(true);",
    "  const t = useTranslations('adminEmployers');\n  const tc = useTranslations('common');\n  const [loading, setLoading] = useState(true);"
)

# Loading state
src = src.replace(
    '<DashboardLayout title="Entreprises" subtitle="Chargement...">',
    '<DashboardLayout title={t(\'loadingTitle\')} subtitle={tc(\'loading\')}>'
)

# Titre
src = src.replace(
    '    <DashboardLayout \n      title="Gestion des entreprises" \n      subtitle={`${employers.length} entreprise${employers.length > 1 ? \'s\' : \'\'} inscrite${employers.length > 1 ? \'s\' : \'\'}`}',
    '    <DashboardLayout \n      title={t(\'title\')} \n      subtitle={`${employers.length} entreprise${employers.length > 1 ? \'s\' : \'\'} inscrite${employers.length > 1 ? \'s\' : \'\'}`}'
)

# Placeholder recherche
src = src.replace(
    'placeholder="Rechercher une entreprise..."',
    '{...{ placeholder: t(\'searchPlaceholder\') }}'
)

# Bouton Actualiser
src = src.replace(
    '              Actualiser\n            </button>\n          </div>\n        </div>\n\n        {/* Grille',
    '              {tc(\'refresh\')}\n            </button>\n          </div>\n        </div>\n\n        {/* Grille'
)

# Status Actif/Inactif
src = src.replace(
    '                    Actif\n                  </span>',
    '                    {tc(\'active\')}\n                  </span>'
)
src = src.replace(
    '                    Inactif\n                  </span>',
    '                    {tc(\'inactive\')}\n                  </span>'
)

# "Inscrit le"
src = src.replace(
    '                  Inscrit le {new Date(employer.created_at).toLocaleDateString(\'fr-FR\')}',
    '                  {tc(\'registeredOn\')} {new Date(employer.created_at).toLocaleDateString(\'fr-FR\')}'
)

# Message vide
src = src.replace(
    '            <p className="text-gray-500 dark:text-gray-400 text-lg">Aucune entreprise trouvée</p>',
    '<p className="text-gray-500 dark:text-gray-400 text-lg">{t(\'empty\')}</p>'
)

with open(employers_file, "w", encoding="utf-8") as f:
    f.write(src)
print("✅ admin/employers/page.tsx traduit")

# ─── admin/jobs/page.tsx ─────────────────────────────────────────────────────

jobs_file = f"{BASE}/admin/jobs/page.tsx"
with open(jobs_file, encoding="utf-8") as f:
    src = f.read()

# Import
src = src.replace(
    "import { logger } from '@/lib/logger';",
    "import { logger } from '@/lib/logger';\nimport { useTranslations } from 'next-intl';"
)

# Hooks dans le composant
src = src.replace(
    "  const [loading, setLoading] = useState(true);\n  const [jobs, setJobs] = useState<AdminJob[]>([]);",
    "  const t = useTranslations('adminJobs');\n  const tc = useTranslations('common');\n  const [loading, setLoading] = useState(true);\n  const [jobs, setJobs] = useState<AdminJob[]>([]);"
)

# getStatusBadge - remplacer les strings hardcodés
src = src.replace(
    '            Active\n          </span>',
    '            {t(\'statusActive\')}\n          </span>'
)
src = src.replace(
    '            Fermee\n          </span>',
    '            {t(\'statusClosed\')}\n          </span>'
)
src = src.replace(
    '            Archivee\n          </span>',
    '            {t(\'statusArchived\')}\n          </span>'
)
src = src.replace(
    '            Brouillon\n          </span>',
    '            {t(\'statusDraft\')}\n          </span>'
)
src = src.replace(
    '            Expirée\n          </span>',
    '            {t(\'statusExpired\')}\n          </span>'
)
src = src.replace(
    '            Fermée\n          </span>',
    '            {t(\'statusClosed\')}\n          </span>'
)

# Loading state
src = src.replace(
    "    <DashboardLayout title=\"Offres d'emploi\" subtitle=\"Chargement...\">",
    "<DashboardLayout title={t('loadingTitle')} subtitle={tc('loading')}>"
)

# Titre principal
src = src.replace(
    "    <DashboardLayout \n      title=\"Gestion des offres d'emploi\" \n      subtitle={`${jobs.length} offre${jobs.length > 1 ? 's' : ''} publiée${jobs.length > 1 ? 's' : ''}`}",
    "    <DashboardLayout \n      title={t('title')} \n      subtitle={`${jobs.length} offre${jobs.length > 1 ? 's' : ''} publiée${jobs.length > 1 ? 's' : ''}`}"
)

# Placeholder recherche
src = src.replace(
    'placeholder="Rechercher une offre..."',
    '{...{ placeholder: t(\'searchPlaceholder\') }}'
)

# Bouton Actualiser
src = src.replace(
    '              Actualiser\n            </button>\n          </div>\n        </div>\n\n        {/* Liste',
    '              {tc(\'refresh\')}\n            </button>\n          </div>\n        </div>\n\n        {/* Liste'
)

# "candidature(s)"
src = src.replace(
    "            {job.applications_count} candidature{job.applications_count > 1 ? 's' : ''}",
    "            {job.applications_count} {t('applicationsCount')}"
)

# "Publié le"
src = src.replace(
    "                        Publié le {new Date(job.created_at).toLocaleDateString('fr-FR')}",
    "                        {tc('publishedOn')} {new Date(job.created_at).toLocaleDateString('fr-FR')}"
)

# Message vide
src = src.replace(
    '            <p className="text-gray-500 dark:text-gray-400 text-lg">Aucune offre trouvée</p>',
    '<p className="text-gray-500 dark:text-gray-400 text-lg">{t(\'empty\')}</p>'
)

# Pagination
src = src.replace(
    '                Précédent\n              </button>',
    '                {tc(\'previous\')}\n              </button>'
)
src = src.replace(
    '              Page {currentPage} sur {totalPages}',
    '              {tc(\'page\', { current: currentPage, total: totalPages })}'
)
src = src.replace(
    '                Suivant\n              </button>\n            </div>',
    '                {tc(\'next\')}\n              </button>\n            </div>'
)

with open(jobs_file, "w", encoding="utf-8") as f:
    f.write(src)
print("✅ admin/jobs/page.tsx traduit")
