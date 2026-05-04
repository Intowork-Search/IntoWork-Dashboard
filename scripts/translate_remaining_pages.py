#!/usr/bin/env python3
"""
Câblage i18n pour les pages restantes : cv, job-posts, candidates,
job-alerts, email-templates, integrations, jobs/[id], company.
Étape 1 : ajout des clés manquantes dans les 4 fichiers messages.
Étape 2 : remplacement des strings hardcodés dans chaque page.
"""
import json, copy, re

# ─── helpers ────────────────────────────────────────────────────────────────

MSG_DIR = "/home/anna/Documents/IntoWork-Dashboard/frontend/messages"
BASE    = "/home/anna/Documents/IntoWork-Dashboard/frontend/src/app/[locale]/dashboard"

LANGS = {
    "fr": {
        "cv": {
            "deleteSuccess": "CV supprimé avec succès",
            "deleteError": "Erreur lors de la suppression du CV",
            "deleteConfirmTitle": "Supprimer ce CV ?",
            "retry": "Réessayer",
            "noCV": "Aucun",
        },
        "jobPosts": {
            "loadError": "Erreur lors du chargement des offres",
            "viewSalary": "Rémunération",
            "viewPerMonth": "par mois",
            "viewFeatured": "En vedette",
            "viewStandard": "Standard",
            "viewDetails": "Voir les détails",
            "publishLinkedIn": "Publier sur LinkedIn",
            "deleteIrreversible": "Cette offre sera définitivement supprimée.",
        },
        "jobAlerts": {
            "statusActive": "Active",
            "statusInactive": "Inactive",
            "toggleActivate": "Activer",
            "toggleDeactivate": "Désactiver",
            "previewButton": "Prévisualiser",
        },
        "emailTemplates": {
            "saveError": "Erreur lors de la sauvegarde",
            "networkError": "Erreur réseau",
            "networkErrorDetail": "Erreur réseau - Vérifiez votre connexion",
            "duplicateError": "Erreur lors de la duplication",
            "inactive": "Inactif",
        },
        "integrations": {
            "connectedOn": "Connecté le :",
            "lastUsed": "Dernière utilisation :",
            "connecting": "Connexion en cours...",
            "connectButton": "Connecter",
        },
        "jobDetail": {
            "note": "Note :",
            "optional": "(optionnel)",
            "back": "Retour",
        },
    },
    "en": {
        "cv": {
            "deleteSuccess": "CV deleted successfully",
            "deleteError": "Error deleting CV",
            "deleteConfirmTitle": "Delete this CV?",
            "retry": "Retry",
            "noCV": "None",
        },
        "jobPosts": {
            "loadError": "Error loading job posts",
            "viewSalary": "Salary",
            "viewPerMonth": "per month",
            "viewFeatured": "Featured",
            "viewStandard": "Standard",
            "viewDetails": "View details",
            "publishLinkedIn": "Publish on LinkedIn",
            "deleteIrreversible": "This job post will be permanently deleted.",
        },
        "jobAlerts": {
            "statusActive": "Active",
            "statusInactive": "Inactive",
            "toggleActivate": "Activate",
            "toggleDeactivate": "Deactivate",
            "previewButton": "Preview",
        },
        "emailTemplates": {
            "saveError": "Error saving template",
            "networkError": "Network error",
            "networkErrorDetail": "Network error - Check your connection",
            "duplicateError": "Error duplicating template",
            "inactive": "Inactive",
        },
        "integrations": {
            "connectedOn": "Connected on:",
            "lastUsed": "Last used:",
            "connecting": "Connecting...",
            "connectButton": "Connect",
        },
        "jobDetail": {
            "note": "Note:",
            "optional": "(optional)",
            "back": "Back",
        },
    },
    "pt": {
        "cv": {
            "deleteSuccess": "CV excluído com sucesso",
            "deleteError": "Erro ao excluir CV",
            "deleteConfirmTitle": "Excluir este CV?",
            "retry": "Tentar novamente",
            "noCV": "Nenhum",
        },
        "jobPosts": {
            "loadError": "Erro ao carregar ofertas",
            "viewSalary": "Remuneração",
            "viewPerMonth": "por mês",
            "viewFeatured": "Destaque",
            "viewStandard": "Padrão",
            "viewDetails": "Ver detalhes",
            "publishLinkedIn": "Publicar no LinkedIn",
            "deleteIrreversible": "Esta oferta será excluída permanentemente.",
        },
        "jobAlerts": {
            "statusActive": "Ativa",
            "statusInactive": "Inativa",
            "toggleActivate": "Ativar",
            "toggleDeactivate": "Desativar",
            "previewButton": "Pré-visualizar",
        },
        "emailTemplates": {
            "saveError": "Erro ao salvar",
            "networkError": "Erro de rede",
            "networkErrorDetail": "Erro de rede - Verifique sua conexão",
            "duplicateError": "Erro ao duplicar",
            "inactive": "Inativo",
        },
        "integrations": {
            "connectedOn": "Conectado em:",
            "lastUsed": "Último uso:",
            "connecting": "Conectando...",
            "connectButton": "Conectar",
        },
        "jobDetail": {
            "note": "Nota:",
            "optional": "(opcional)",
            "back": "Voltar",
        },
    },
    "ar": {
        "cv": {
            "deleteSuccess": "تم حذف السيرة الذاتية بنجاح",
            "deleteError": "خطأ في حذف السيرة الذاتية",
            "deleteConfirmTitle": "حذف هذه السيرة الذاتية؟",
            "retry": "إعادة المحاولة",
            "noCV": "لا شيء",
        },
        "jobPosts": {
            "loadError": "خطأ في تحميل الوظائف",
            "viewSalary": "الراتب",
            "viewPerMonth": "في الشهر",
            "viewFeatured": "مميز",
            "viewStandard": "عادي",
            "viewDetails": "عرض التفاصيل",
            "publishLinkedIn": "النشر على LinkedIn",
            "deleteIrreversible": "سيتم حذف هذه الوظيفة نهائيًا.",
        },
        "jobAlerts": {
            "statusActive": "نشط",
            "statusInactive": "غير نشط",
            "toggleActivate": "تفعيل",
            "toggleDeactivate": "تعطيل",
            "previewButton": "معاينة",
        },
        "emailTemplates": {
            "saveError": "خطأ في الحفظ",
            "networkError": "خطأ في الشبكة",
            "networkErrorDetail": "خطأ في الشبكة - تحقق من اتصالك",
            "duplicateError": "خطأ في النسخ",
            "inactive": "غير نشط",
        },
        "integrations": {
            "connectedOn": "متصل في:",
            "lastUsed": "آخر استخدام:",
            "connecting": "جارٍ الاتصال...",
            "connectButton": "اتصال",
        },
        "jobDetail": {
            "note": "ملاحظة:",
            "optional": "(اختياري)",
            "back": "رجوع",
        },
    },
}


def deep_merge(base: dict, new: dict) -> dict:
    result = copy.deepcopy(base)
    for k, v in new.items():
        if k not in result:
            result[k] = v
    return result


# ─── Étape 1 : ajouter les clés manquantes ──────────────────────────────────
for lang, namespaces in LANGS.items():
    path = f"{MSG_DIR}/{lang}.json"
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    for ns, keys in namespaces.items():
        if ns not in data:
            data[ns] = {}
        data[ns] = deep_merge(data[ns], keys)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"✅ {lang}.json mis à jour")

# ─── Étape 2 : câblage des pages ─────────────────────────────────────────────

def patch(filepath: str, replacements: list[tuple[str, str]]) -> int:
    with open(filepath, encoding="utf-8") as f:
        src = f.read()
    count = 0
    for old, new in replacements:
        if old in src:
            src = src.replace(old, new, 1)
            count += 1
        else:
            print(f"  ⚠️  Non trouvé dans {filepath.split('/')[-2]}/{filepath.split('/')[-1]}: {repr(old[:60])}")
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(src)
    return count


# ─────────────────────────────────────────────────────────────────────────────
# cv/page.tsx
# ─────────────────────────────────────────────────────────────────────────────
cv_file = f"{BASE}/cv/page.tsx"
cv_replacements = [
    # Import
    ("import toast from 'react-hot-toast';",
     "import toast from 'react-hot-toast';\nimport { useTranslations } from 'next-intl';"),
    # Hooks (après const fileInputRef)
    ("  const fileInputRef = React.useRef<HTMLInputElement>(null);",
     "  const t = useTranslations('cv');\n  const tc = useTranslations('common');\n  const fileInputRef = React.useRef<HTMLInputElement>(null);"),
    # Error messages
    ("setError('Token d\\'authentification manquant');",
     "setError(t('authTokenMissing'));"),
    ("return 'Date inconnue';",
     "return tc('unknownDate');"),
    ("if (!bytes) return 'Taille inconnue';",
     "if (!bytes) return tc('unknownSize');"),
    ("toast.error('Erreur lors de l\\'ouverture du CV');",
     "toast.error(t('openError'));"),
    # downloadError appears twice
    ("toast.error('Erreur lors du téléchargement du CV');\n    } catch (error) {\n      logger.error(\"Erreur lors du telechargement:\", error);\n      toast.error('Erreur lors du téléchargement du CV');\n    }\n  };",
     "toast.error(t('downloadError'));\n    } catch (error) {\n      logger.error(\"Erreur lors du telechargement:\", error);\n      toast.error(t('downloadError'));\n    }\n  };"),
    ("toast.error('Veuillez sélectionner un fichier PDF.');",
     "toast.error(t('pdfRequired'));"),
    ("toast.error('Le fichier ne peut pas dépasser 5MB.');",
     "toast.error(t('fileTooLarge'));"),
    ("toast.error('Erreur d\\'authentification');",
     "toast.error(t('authError'));"),
    ("toast.success('CV téléchargé avec succès !');",
     "toast.success(t('uploadSuccess'));"),
    ("toast.success('CV supprimé avec succès');",
     "toast.success(t('deleteSuccess'));"),
    ("toast.error('Erreur lors de la suppression du CV');",
     "toast.error(t('deleteError'));"),
    # Confirm dialog
    ("      title: 'Supprimer ce CV ?',",
     "      title: t('deleteConfirmTitle'),"),
    ("      detail: 'Cette action est irréversible.',",
     "      detail: tc('irreversible'),"),
    ("      confirmLabel: 'Supprimer',",
     "      confirmLabel: tc('delete'),"),
    # Loading / error states
    ('<DashboardLayout title="Mes CV" subtitle="Gérez vos CV téléchargés">',
     '<DashboardLayout title={t(\'title\')} subtitle={t(\'subtitle\')}>'),
    # Retry button
    ("            Réessayer\n          </button>",
     "            {t('retry')}\n          </button>"),
    # Hero badge
    ('                  <span className="text-white/90 text-sm font-medium">Gestion des CV</span>',
     '                  <span className="text-white/90 text-sm font-medium">{t(\'managementBadge\')}</span>'),
    # Hero subtitle text
    ("                  {isDragging ? 'Déposez votre fichier ici !' : 'Glissez-déposez ou cliquez pour ajouter un CV'}",
     "                  {isDragging ? t('dropHere') : t('dragDropHint')}"),
    # Upload zone
    ("                  {isUploadingCV ? 'Téléchargement...' : isDragging ? 'Déposez ici' : 'Ajouter un CV'}",
     "                  {isUploadingCV ? t('uploading') : isDragging ? t('dropShort') : t('addCvButton')}"),
    ("                <span className=\"text-white/60 text-sm\">PDF uniquement, max 5MB</span>",
     "                <span className=\"text-white/60 text-sm\">{t('uploadConstraints')}</span>"),
    # Stats
    ('                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">CV téléchargés</p>',
     '<p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{t(\'statUploaded\')}</p>'),
    ('                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Vues par recruteurs</p>',
     '<p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{t(\'statViews\')}</p>'),
    ('                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Dernier ajout</p>',
     '<p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{t(\'statLastUpload\')}</p>'),
    # "Aucun" for no CV date
    ("cvs.length > 0 ? formatDate(cvs[0].created_at) : 'Aucun'",
     "cvs.length > 0 ? formatDate(cvs[0].created_at) : tc('none')"),
    # Section header
    ('                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Mes CV</h3>',
     '<h3 className="text-xl font-bold text-gray-900 dark:text-white">{t(\'sectionTitle\')}</h3>'),
    ('                  <p className="text-sm text-gray-500 dark:text-gray-400">Gérez vos documents et suivez leur utilisation</p>',
     '<p className="text-sm text-gray-500 dark:text-gray-400">{t(\'sectionSubtitle\')}</p>'),
    # Add button in section header
    ("                <span>{isUploadingCV ? 'Upload...' : 'Ajouter un CV'}</span>",
     "                <span>{isUploadingCV ? t('uploading') : t('addCvButton')}</span>"),
    # Empty state
    ('              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Aucun CV téléchargé</h4>',
     '<h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t(\'emptyTitle\')}</h4>'),
    ("                Téléchargez votre premier CV pour commencer à postuler aux offres d'emploi et attirer l'attention des recruteurs.",
     "{t('emptyDescription')}"),
    ("                <span>{isUploadingCV ? 'Téléchargement...' : 'Télécharger mon CV'}</span>",
     "                <span>{isUploadingCV ? t('uploading') : t('uploadMyCV')}</span>"),
    # Active badge
    ("                            Actif\n                          </span>",
     "                            {tc('active')}\n                          </span>"),
    # Tips section
    ('              <h3 className="font-bold text-gray-900 dark:text-white mb-3">Conseils pour optimiser votre CV</h3>',
     '<h3 className="font-bold text-gray-900 dark:text-white mb-3">{t(\'tipsTitle\')}</h3>'),
    ("                  { text: 'Utilisez un format PDF pour une meilleure compatibilité', color: '#6B9B5F' },",
     "                  { text: t('tip1'), color: '#6B9B5F' },"),
    ("                  { text: 'Gardez votre CV à jour avec vos dernières expériences', color: '#F7C700' },",
     "                  { text: t('tip2'), color: '#F7C700' },"),
    ("                  { text: 'Adaptez votre CV en fonction du poste visé', color: '#6B46C1' },",
     "                  { text: t('tip3'), color: '#6B46C1' },"),
    ("                  { text: 'Vérifiez régulièrement les statistiques de consultation', color: '#3B82F6' },",
     "                  { text: t('tip4'), color: '#3B82F6' },"),
    # Error state message
    ("setError('Erreur lors du chargement des données');",
     "setError(t('loadError'));"),
]
n = patch(cv_file, cv_replacements)
print(f"✅ cv/page.tsx : {n} remplacement(s)")


# ─────────────────────────────────────────────────────────────────────────────
# job-posts/page.tsx
# ─────────────────────────────────────────────────────────────────────────────
jp_file = f"{BASE}/job-posts/page.tsx"
jp_replacements = [
    # Remplacer useTranslations('nav') par jobPosts
    ("  const t = useTranslations('nav');",
     "  const t = useTranslations('jobPosts');\n  const tc = useTranslations('common');"),
    # Remplacer les 2 occurrences title={t('jobPosts')} par title={t('title')}
    ("title={t('jobPosts')} subtitle=\"Gérez vos offres\">\n        <div className=\"flex items-center justify-center min-h-96\">",
     "title={t('title')} subtitle={t('loading')}>\n        <div className=\"flex items-center justify-center min-h-96\">"),
    ("    <DashboardLayout title={t('jobPosts')} subtitle=\"Gérez vos offres\">",
     "    <DashboardLayout title={t('title')} subtitle={t('subtitle')}>"),
    # Toasts
    ("toast.error('Session expirée. Veuillez vous reconnecter.');",
     "toast.error(tc('sessionExpired'));"),
    ("toast.error('Erreur lors du chargement des offres');",
     "toast.error(t('loadError'));"),
    ("toast.success('Offre supprimée avec succès !');",
     "toast.success(t('deleteSuccess'));"),
    ("toast.error('Erreur lors de la suppression');",
     "toast.error(t('deleteError'));"),
    ("toast.error('Authentification requise');",
     "toast.error(tc('authRequired'));"),
    ("toast.success('Offre créée avec succès !');",
     "toast.success(t('createSuccess'));"),
    ("toast.success('Offre mise à jour avec succès !');",
     "toast.success(t('updateSuccess'));"),
    ("toast.error(getErrorMessage(err, 'Erreur lors de la sauvegarde'));",
     "toast.error(getErrorMessage(err, t('saveError')));"),
    # Confirm dialog
    ("      title: 'Supprimer cette offre ?',",
     "      title: t('deleteConfirmTitle'),"),
    ("      message: 'Cette offre sera définitivement supprimée.',",
     "      message: t('deleteConfirmMsg'),"),
    ("      detail: 'Cette action est irréversible.',",
     "      detail: tc('irreversible'),"),
    ("      confirmLabel: 'Supprimer',",
     "      confirmLabel: tc('delete'),"),
    # Hero badge
    ("              <span className=\"text-white/90 text-sm font-medium\">Espace Recruteur</span>",
     "              <span className=\"text-white/90 text-sm font-medium\">{t('badge')}</span>"),
    # New offer button
    ("                <span>Nouvelle offre</span>",
     "                <span>{t('newJobButton')}</span>"),
    # Stats labels
    ("                  <p className=\"text-sm text-white/70 font-medium\">Offres actives</p>",
     "                  <p className=\"text-sm text-white/70 font-medium\">{t('statActive')}</p>"),
    ("                  <p className=\"text-sm text-white/70 font-medium\">Total offres</p>",
     "                  <p className=\"text-sm text-white/70 font-medium\">{t('statTotal')}</p>"),
    ("                  <p className=\"text-sm text-white/70 font-medium\">Candidatures</p>",
     "                  <p className=\"text-sm text-white/70 font-medium\">{t('statApplications')}</p>"),
    ("                  <p className=\"text-sm text-white/70 font-medium\">Vues totales</p>",
     "                  <p className=\"text-sm text-white/70 font-medium\">{t('statViews')}</p>"),
    # Empty state
    ("              <h3 className=\"text-2xl font-bold text-gray-900 dark:text-white mb-3\">Aucune offre publiée</h3>",
     "<h3 className=\"text-2xl font-bold text-gray-900 dark:text-white mb-3\">{t('emptyTitle')}</h3>"),
    ("              <p className=\"text-gray-500 dark:text-gray-400 mb-8 max-w-lg mx-auto\">\n                Commencez à recruter en créant votre première offre d'emploi.\n              </p>",
     "              <p className=\"text-gray-500 dark:text-gray-400 mb-8 max-w-lg mx-auto\">{t('emptyDescription')}</p>"),
    ("                <span>Créer votre première offre</span>",
     "                <span>{t('createFirstButton')}</span>"),
    # Job card title tooltips
    ("title=\"Voir les détails\"",
     "title={t('viewDetails')}"),
    ("title=\"Publier sur LinkedIn\"",
     "title={t('publishLinkedIn')}"),
    ("title=\"Modifier\"",
     "title={tc('edit')}"),
    ("title=\"Supprimer\"",
     "title={tc('delete')}"),
    # Modal titles
    ("              {editingJob ? \"Modifier l'offre\" : 'Nouvelle offre'}\n            </h2>",
     "              {editingJob ? t('modalEditTitle') : t('modalCreateTitle')}\n            </h2>"),
    # Form labels
    ("              <label className=\"block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1\">Titre du poste *</label>",
     "<label className=\"block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1\">{t('formTitle')}</label>"),
    ("              <label className=\"block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1\">Description *</label>",
     "<label className=\"block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1\">{t('formDescription')}</label>"),
    ("              <label className=\"block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1\">Type de contrat *</label>",
     "<label className=\"block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1\">{t('formJobType')}</label>"),
    ("              <label className=\"block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1\">Mode de travail *</label>",
     "<label className=\"block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1\">{t('formLocationType')}</label>"),
    ("              <label className=\"block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1\">Localisation</label>",
     "<label className=\"block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1\">{t('formLocation')}</label>"),
    ("              <label className=\"block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1\">Salaire minimum</label>",
     "<label className=\"block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1\">{t('formSalaryMin')}</label>"),
    ("              <label className=\"block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1\">Salaire maximum</label>",
     "<label className=\"block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1\">{t('formSalaryMax')}</label>"),
    ("              <label className=\"block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1\">Devise</label>",
     "<label className=\"block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1\">{t('formCurrency')}</label>"),
    # Form select placeholders
    ("                <option value=\"\">Sélectionner...</option>\n                  <option value=\"full_time\">CDI</option>",
     "                <option value=\"\">{tc('selectPlaceholder')}</option>\n                  <option value=\"full_time\">{tc('fullTime')}</option>"),
    ("                  <option value=\"part_time\">Temps partiel</option>",
     "                  <option value=\"part_time\">{tc('partTime')}</option>"),
    ("                  <option value=\"contract\">CDD</option>",
     "                  <option value=\"contract\">{tc('contract')}</option>"),
    ("                  <option value=\"temporary\">Intérim</option>",
     "                  <option value=\"temporary\">{tc('temporary')}</option>"),
    ("                  <option value=\"internship\">Stage</option>",
     "                  <option value=\"internship\">{tc('internship')}</option>"),
    # Location type select
    ("                <option value=\"\">Sélectionner...</option>\n                  <option value=\"onsite\">Présentiel</option>",
     "                <option value=\"\">{tc('selectPlaceholder')}</option>\n                  <option value=\"onsite\">{tc('onSite')}</option>"),
    ("                  <option value=\"remote\">Télétravail</option>",
     "                  <option value=\"remote\">{tc('remote')}</option>"),
    ("                  <option value=\"hybrid\">Hybride</option>",
     "                  <option value=\"hybrid\">{tc('hybrid')}</option>"),
    # Modal buttons
    ("                Annuler\n                </button>\n                <button\n                  type=\"submit\"",
     "                {tc('cancel')}\n                </button>\n                <button\n                  type=\"submit\""),
    ("                  Enregistrement...\n                  </> : <>",
     "                  {tc('saving')}\n                  </> : <>"),
    ("                  Enregistrer\n                </>",
     "                  {tc('save')}\n                </>"),
    # View modal
    ("              <h3 className=\"text-xl font-bold text-gray-900 dark:text-white mb-1\">Rémunération</h3>",
     "<h3 className=\"text-xl font-bold text-gray-900 dark:text-white mb-1\">{t('viewSalary')}</h3>"),
    ("                <span className=\"text-gray-500 dark:text-gray-400 text-sm\">par mois</span>",
     "                <span className=\"text-gray-500 dark:text-gray-400 text-sm\">{t('viewPerMonth')}</span>"),
    ("                  <span className=\"font-medium text-gray-700 dark:text-gray-300\">En vedette</span>",
     "                  <span className=\"font-medium text-gray-700 dark:text-gray-300\">{t('viewFeatured')}</span>"),
    ("                  <span className=\"font-medium text-gray-700 dark:text-gray-300\">Standard</span>",
     "                  <span className=\"font-medium text-gray-700 dark:text-gray-300\">{t('viewStandard')}</span>"),
    ("                <span>Publiée le </span>",
     "                <span>{tc('publishedOn')} </span>"),
    # View modal buttons
    ("                Fermer\n                </button>\n                <button\n                  onClick={() => {\n                    setViewingJob(null);\n                    setEditingJob(",
     "                {tc('close')}\n                </button>\n                <button\n                  onClick={() => {\n                    setViewingJob(null);\n                    setEditingJob("),
    ("                  <span>Modifier</span>\n                </button>\n              </div>\n            </div>\n          </div>\n        </div>\n      )}\n    </DashboardLayout>",
     "                  <span>{tc('edit')}</span>\n                </button>\n              </div>\n            </div>\n          </div>\n        </div>\n      )}\n    </DashboardLayout>"),
]
n = patch(jp_file, jp_replacements)
print(f"✅ job-posts/page.tsx : {n} remplacement(s)")


# ─────────────────────────────────────────────────────────────────────────────
# candidates/page.tsx
# ─────────────────────────────────────────────────────────────────────────────
cand_file = f"{BASE}/candidates/page.tsx"
cand_replacements = [
    # Import
    ("import ConfirmDialog from '@/components/ui/ConfirmDialog';",
     "import ConfirmDialog from '@/components/ui/ConfirmDialog';\nimport { useTranslations } from 'next-intl';"),
    # Hooks
    ("  const { getToken } = useAuth();",
     "  const t = useTranslations('candidates');\n  const tc = useTranslations('common');\n  const tas = useTranslations('applicationStatus');\n  const { getToken } = useAuth();"),
    # Loading state
    ("    <DashboardLayout title=\"Candidats\" subtitle=\"Gérer les candidatures\">",
     "<DashboardLayout title={t('title')} subtitle={t('subtitle')}>"),
    # Main layout
    ("  return (\n    <DashboardLayout title=\"Candidats\" subtitle=\"Gérer les candidatures\">",
     "  return (\n    <DashboardLayout title={t('title')} subtitle={t('subtitle')}>"),
    # Status badges
    ("      case 'applied':\n        return <span className=\"px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800\">En attente</span>;",
     "      case 'applied':\n        return <span className=\"px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800\">{tas('pending')}</span>;"),
    ("      case 'pending':\n        return <span className=\"px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700\">En attente</span>;",
     "      case 'pending':\n        return <span className=\"px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700\">{tas('pending')}</span>;"),
    ("      case 'viewed':\n        return <span className=\"px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800\">Vue</span>;",
     "      case 'viewed':\n        return <span className=\"px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800\">{tas('viewed')}</span>;"),
    ("      case 'shortlisted':\n        return <span className=\"px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800\">Présélectionné</span>;",
     "      case 'shortlisted':\n        return <span className=\"px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800\">{tas('shortlisted')}</span>;"),
    ("      case 'interview':\n        return <span className=\"px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800\">Entretien</span>;",
     "      case 'interview':\n        return <span className=\"px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800\">{tas('interview')}</span>;"),
    ("      case 'accepted':\n        return <span className=\"px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800\">Accepté</span>;",
     "      case 'accepted':\n        return <span className=\"px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800\">{tas('accepted')}</span>;"),
    ("      case 'rejected':\n        return <span className=\"px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800\">Rejeté</span>;",
     "      case 'rejected':\n        return <span className=\"px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800\">{tas('rejected')}</span>;"),
    # Stats
    ('                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total candidatures</p>',
     '                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{t(\'statTotal\')}</p>'),
    ('                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">En attente</p>',
     '                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{t(\'statPending\')}</p>'),
    ('                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Entretiens</p>',
     '                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{t(\'statInterviews\')}</p>'),
    ('                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Acceptés</p>',
     '                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{t(\'statAccepted\')}</p>'),
    # Search placeholder
    ('placeholder="Rechercher un candidat..."',
     '{...{ placeholder: t(\'searchPlaceholder\') }}'),
    # Filter options
    ('<option value="">Tous les statuts</option>',
     '<option value="">{t(\'filterAllStatuses\')}</option>'),
    ('<option value="viewed">Vue</option>',
     '<option value="viewed">{tas(\'viewed\')}</option>'),
    ('<option value="shortlisted">Présélectionné</option>',
     '<option value="shortlisted">{tas(\'shortlisted\')}</option>'),
    ('<option value="interview">Entretien</option>',
     '<option value="interview">{tas(\'interview\')}</option>'),
    ('<option value="accepted">Accepté</option>',
     '<option value="accepted">{tas(\'accepted\')}</option>'),
    ('<option value="pending">En attente</option>',
     '<option value="pending">{tas(\'pending\')}</option>'),
    ('<option value="rejected">Rejeté</option>',
     '<option value="rejected">{tas(\'rejected\')}</option>'),
    # Empty state
    ("              <p className=\"text-gray-500 text-lg font-medium\">Aucune candidature</p>",
     "              <p className=\"text-gray-500 text-lg font-medium\">{t('emptyTitle')}</p>"),
    ("              <p className=\"text-gray-400 text-sm\">Aucun résultat pour ces filtres</p>",
     "              <p className=\"text-gray-400 text-sm\">{t('emptyFiltered')}</p>"),
    ("              <p className=\"text-gray-400 text-sm\">Les candidatures apparaîtront ici</p>",
     "              <p className=\"text-gray-400 text-sm\">{t('emptyDefault')}</p>"),
    # Table headers
    ('<th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Candidat</th>',
     '<th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t(\'colCandidate\')}</th>'),
    ('<th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Offre</th>',
     '<th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t(\'colJob\')}</th>'),
    ('<th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Statut</th>',
     '<th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t(\'colStatus\')}</th>'),
    ('<th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>',
     '<th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t(\'colDate\')}</th>'),
    ('<th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>',
     '<th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{tc(\'actions\')}</th>'),
    # Action button "Voir"
    ('                        Voir\n                      </button>',
     '                        {tc(\'view\')}\n                      </button>'),
    # Pagination
    ('                  Précédent\n                </button>',
     '                  {tc(\'previous\')}\n                </button>'),
    ('                  Suivant\n                </button>',
     '                  {tc(\'next\')}\n                </button>'),
    ('                <span className="text-gray-600 text-sm font-medium">\n                  Page {page} sur {totalPages}\n                </span>',
     '                <span className="text-gray-600 text-sm font-medium">\n                  {tc(\'page\', { current: page, total: totalPages })}\n                </span>'),
    # Modal title
    ('            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Détails de la candidature</h2>',
     '<h2 className="text-xl font-bold text-gray-900 dark:text-white">{t(\'modalTitle\')}</h2>'),
    # Section headers
    ('              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">👤 Candidat</h3>',
     '<h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">{t(\'sectionCandidate\')}</h3>'),
    ('              <span className="text-gray-500 dark:text-gray-400 text-sm">Nom:</span>',
     '<span className="text-gray-500 dark:text-gray-400 text-sm">{t(\'labelName\')}</span>'),
    ('              <span className="text-gray-500 dark:text-gray-400 text-sm">Email:</span>',
     '<span className="text-gray-500 dark:text-gray-400 text-sm">{t(\'labelEmail\')}</span>'),
    ('              <span className="text-gray-500 dark:text-gray-400 text-sm">Téléphone:</span>',
     '<span className="text-gray-500 dark:text-gray-400 text-sm">{t(\'labelPhone\')}</span>'),
    ('              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">💼 Offre</h3>',
     '<h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">{t(\'sectionJob\')}</h3>'),
    ('              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">📊 Statut</h3>',
     '<h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">{t(\'sectionStatus\')}</h3>'),
    # Status options in modal
    ('<option value="pending">En attente</option>\n                  <option value="viewed">Vue</option>\n                  <option value="shortlisted">Présélectionné</option>\n                  <option value="interview">Entretien</option>\n                  <option value="accepted">Accepté</option>\n                  <option value="rejected">Rejeté</option>',
     '<option value="pending">{tas(\'pending\')}</option>\n                  <option value="viewed">{tas(\'viewed\')}</option>\n                  <option value="shortlisted">{tas(\'shortlisted\')}</option>\n                  <option value="interview">{tas(\'interview\')}</option>\n                  <option value="accepted">{tas(\'accepted\')}</option>\n                  <option value="rejected">{tas(\'rejected\')}</option>'),
    ('              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">📅 Date de candidature</h3>',
     '<h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">{t(\'sectionDate\')}</h3>'),
    ('              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">✉️ Lettre de motivation</h3>',
     '<h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">{t(\'sectionCoverLetter\')}</h3>'),
    ('              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">📄 CV</h3>',
     '<h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">{t(\'sectionCV\')}</h3>'),
    ('              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">📝 Notes internes</h3>',
     '<h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">{t(\'sectionNotes\')}</h3>'),
    ('placeholder="Ajouter des notes sur ce candidat..."',
     '{...{ placeholder: t(\'notesPlaceholder\') }}'),
    # Saving notes
    ('                  Sauvegarde en cours...\n                  </span> : <span',
     '                  {tc(\'saving\')}\n                  </span> : <span'),
    ('                    Les notes se sauvegardent automatiquement\n                  </span>',
     '                    {t(\'notesAutoSave\')}\n                  </span>'),
    # Quick actions section
    ('              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">⚡ Actions rapides</h3>',
     '<h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">{t(\'sectionQuickActions\')}</h3>'),
    ('                Planifier un entretien\n              </button>',
     '                {t(\'scheduleInterview\')}\n              </button>'),
    ('                Marquer en entretien\n              </button>',
     '                {t(\'markInterview\')}\n              </button>'),
    ('                Accepter\n              </button>',
     '                {t(\'accept\')}\n              </button>'),
    ('                Présélectionner\n              </button>',
     '                {t(\'shortlist\')}\n              </button>'),
    # Reject confirm
    ("        title: 'Rejeter cette candidature ?',",
     "        title: t('rejectConfirmTitle'),"),
    # Download CV button
    ('                Télécharger le CV\n            </button>',
     '                {t(\'downloadCV\')}\n            </button>'),
    # Reject button
    ('                Rejeter\n              </button>\n              <button\n                onClick={() => setViewingApplication(null)}',
     '                {t(\'reject\')}\n              </button>\n              <button\n                onClick={() => setViewingApplication(null)}'),
    # Close button
    ('                Fermer\n              </button>\n            </div>\n          </div>\n        </div>\n      )}\n    </DashboardLayout>',
     '                {tc(\'close\')}\n              </button>\n            </div>\n          </div>\n        </div>\n      )}\n    </DashboardLayout>'),
]
n = patch(cand_file, cand_replacements)
print(f"✅ candidates/page.tsx : {n} remplacement(s)")


# ─────────────────────────────────────────────────────────────────────────────
# job-alerts/page.tsx
# ─────────────────────────────────────────────────────────────────────────────
ja_file = f"{BASE}/job-alerts/page.tsx"

# Lire le fichier pour trouver ce qui existe
with open(ja_file, encoding="utf-8") as f:
    ja_src = f.read()

# Trouver l'import useTranslations existant et le hook t existant
already_imported_ja = "from 'next-intl'" in ja_src
already_hooked_ja = "useTranslations('jobAlerts')" in ja_src

ja_replacements = []

if not already_imported_ja:
    ja_replacements.append(
        ("import toast from 'react-hot-toast';",
         "import toast from 'react-hot-toast';\nimport { useTranslations } from 'next-intl';")
    )

if not already_hooked_ja:
    ja_replacements.append(
        ("  const [alerts, setAlerts] = useState<JobAlert[]>([]);",
         "  const t = useTranslations('jobAlerts');\n  const tc = useTranslations('common');\n  const [alerts, setAlerts] = useState<JobAlert[]>([]);")
    )
else:
    # Add tc if not there
    if "useTranslations('common')" not in ja_src:
        ja_replacements.append(
            ("  const t = useTranslations('jobAlerts');",
             "  const t = useTranslations('jobAlerts');\n  const tc = useTranslations('common');")
        )

ja_replacements += [
    # Toasts
    ("toast.error('Erreur lors du chargement des alertes')", "toast.error(t('loadError'))"),
    ("toast.success(editingAlert ? 'Alerte mise à jour' : 'Alerte créée')", "toast.success(editingAlert ? t('updateSuccess') : t('createSuccess'))"),
    ("toast.error('Erreur lors de la sauvegarde')", "toast.error(t('saveError'))"),
    ("toast.success('Alerte mise à jour')\n          }", "toast.success(t('updateSuccess'))\n          }"),
    ("toast.error('Erreur lors de la mise à jour')", "toast.error(t('saveError'))"),
    ("toast.success('Alerte supprimée')", "toast.success(t('deleteSuccess'))"),
    ("toast.error('Erreur lors de la suppression')", "toast.error(t('deleteError'))"),
    # Confirm delete
    ("      title: 'Supprimer cette alerte ?',", "      title: t('deleteConfirmTitle'),"),
    ("      message: 'Cette alerte sera définitivement supprimée et vous ne recevrez plus ces notifications.',",
     "      message: t('deleteConfirmMsg'),"),
    ("      confirmLabel: 'Supprimer',", "      confirmLabel: tc('delete'),"),
    # Loading
    ("      subtitle=\"Chargement des alertes...\">", "      subtitle={t('loading')}>"),
    # Header description
    ("        <p className=\"text-gray-500 dark:text-gray-400\">\n          Recevez des notifications quand de nouveaux jobs correspondent à vos critères\n        </p>",
     "        <p className=\"text-gray-500 dark:text-gray-400\">\n          {t('headerDescription')}\n        </p>"),
    # New alert button
    ("          <span>Nouvelle alerte</span>", "          <span>{t('newAlertButton')}</span>"),
    # Stats
    ('            <p className="text-2xl font-bold text-gray-900 dark:text-white">{alerts.filter(a => a.is_active).length}</p>\n            <p className="text-sm text-gray-500 dark:text-gray-400">Alertes actives</p>',
     '            <p className="text-2xl font-bold text-gray-900 dark:text-white">{alerts.filter(a => a.is_active).length}</p>\n            <p className="text-sm text-gray-500 dark:text-gray-400">{t(\'statActive\')}</p>'),
    ('            <p className="text-2xl font-bold text-gray-900 dark:text-white">{alerts.filter(a => !a.is_active).length}</p>\n            <p className="text-sm text-gray-500 dark:text-gray-400">Alertes inactives</p>',
     '            <p className="text-2xl font-bold text-gray-900 dark:text-white">{alerts.filter(a => !a.is_active).length}</p>\n            <p className="text-sm text-gray-500 dark:text-gray-400">{t(\'statInactive\')}</p>'),
    ('            <p className="text-sm text-gray-500 dark:text-gray-400">Jobs envoyés</p>',
     '            <p className="text-sm text-gray-500 dark:text-gray-400">{t(\'statSent\')}</p>'),
    # Empty state
    ('          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Aucune alerte configurée</h3>',
     '<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t(\'emptyTitle\')}</h3>'),
    ("            Créez votre première alerte pour recevoir automatiquement les offres qui correspondent à votre profil.",
     "{t('emptyDescription')}"),
    ('            <span>Créer ma première alerte</span>', '            <span>{t(\'createFirstButton\')}</span>'),
    # Alert card status badges
    ('              <span className="px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-800">Active</span>',
     '<span className="px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-800">{t(\'statusActive\')}</span>'),
    ('              <span className="px-3 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-600">Inactive</span>',
     '<span className="px-3 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-600">{t(\'statusInactive\')}</span>'),
    # Last alert label
    ("              <span className=\"text-xs text-gray-500\">Dernière alerte :</span>",
     "              <span className=\"text-xs text-gray-500\">{t('lastSentLabel')}</span>"),
    # Toggle button title
    ("            title={alert.is_active ? 'Désactiver' : 'Activer'}",
     "            title={alert.is_active ? t('toggleDeactivate') : t('toggleActivate')}"),
    # Action buttons titles
    ('            title="Prévisualiser"', 'title={t(\'previewButton\')}'),
    ('            title="Modifier"', 'title={tc(\'edit\')}'),
    ('            title="Supprimer"', 'title={tc(\'delete\')}'),
    # Modal titles
    ("          {editingAlert ? \"Modifier l'alerte\" : 'Nouvelle alerte emploi'}",
     "          {editingAlert ? t('modalEditTitle') : t('modalCreateTitle')}"),
    # Form labels
    ("            <label className=\"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1\">Nom de l'alerte</label>",
     "<label className=\"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1\">{t('formName')}</label>"),
    ('            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mots-clés <span className="text-gray-400 text-xs">(séparés par des virgules)</span></label>',
     '<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t(\'formKeywords\')} <span className="text-gray-400 text-xs">{t(\'formKeywordsHint\')}</span></label>'),
    ("            <label className=\"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1\">Localisation</label>",
     "<label className=\"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1\">{t('formLocation')}</label>"),
    ("            <label className=\"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1\">Types de contrat</label>",
     "<label className=\"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1\">{t('formJobTypes')}</label>"),
    ("            <label className=\"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1\">Salaire min (FCFA)</label>",
     "<label className=\"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1\">{t('formSalaryMin')}</label>"),
    ("            <label className=\"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1\">Salaire max (FCFA)</label>",
     "<label className=\"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1\">{t('formSalaryMax')}</label>"),
    ("            <label className=\"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1\">Fréquence d'envoi</label>",
     "<label className=\"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1\">{t('formFrequency')}</label>"),
    # Modal buttons
    ("            Annuler\n            </button>", "            {tc('cancel')}\n            </button>"),
    ("              {editingAlert ? 'Mettre à jour' : \"Créer l'alerte\"}", "              {editingAlert ? tc('update') : t('createButton')}"),
    # Preview modal
    ("          <h3 className=\"text-lg font-bold text-gray-900 dark:text-white\">Offres correspondantes</h3>",
     "<h3 className=\"text-lg font-bold text-gray-900 dark:text-white\">{t('previewTitle')}</h3>"),
    ("            <p className=\"text-gray-500 dark:text-gray-400\">Aucune offre correspondante</p>",
     "            <p className=\"text-gray-500 dark:text-gray-400\">{t('previewEmpty')}</p>"),
    ("            <p className=\"text-sm text-gray-400\">Essayez d'élargir vos critères</p>",
     "            <p className=\"text-sm text-gray-400\">{t('previewEmptyHint')}</p>"),
    ("          <button\n            onClick={() => setPreviewJobs(null)}\n            className",
     "          <button\n            onClick={() => setPreviewJobs(null)}\n            className"),
    ("            Fermer\n          </button>\n        </div>\n      </div>\n    </div>\n  );\n}",
     "            {tc('close')}\n          </button>\n        </div>\n      </div>\n    </div>\n  );\n}"),
]
n = patch(ja_file, ja_replacements)
print(f"✅ job-alerts/page.tsx : {n} remplacement(s)")


# ─────────────────────────────────────────────────────────────────────────────
# email-templates/page.tsx
# ─────────────────────────────────────────────────────────────────────────────
et_file = f"{BASE}/email-templates/page.tsx"
et_replacements = [
    ("import toast from 'react-hot-toast';",
     "import toast from 'react-hot-toast';\nimport { useTranslations } from 'next-intl';"),
    ("  const [templates, setTemplates] = useState<EmailTemplate[]>([]);",
     "  const t = useTranslations('emailTemplates');\n  const tc = useTranslations('common');\n  const [templates, setTemplates] = useState<EmailTemplate[]>([]);"),
    # Template types mapping
    ("  const TEMPLATE_TYPES: Record<string, string> = {\n    welcome_candidate: 'Bienvenue candidat',",
     "  const TEMPLATE_TYPES: Record<string, string> = {\n    welcome_candidate: t('typesWelcomeCandidate'),"),
    ("    application_received: 'Candidature reçue',", "    application_received: t('typesApplicationReceived'),"),
    ("    application_rejected: 'Candidature refusée',", "    application_rejected: t('typesApplicationRejected'),"),
    ("    interview_invitation: 'Invitation entretien',", "    interview_invitation: t('typesInterviewInvitation'),"),
    ("    interview_confirmation: 'Confirmation entretien',", "    interview_confirmation: t('typesInterviewConfirmation'),"),
    ("    interview_reminder: 'Rappel entretien',", "    interview_reminder: t('typesInterviewReminder'),"),
    ("    offer_letter: \"Lettre d'offre\",", "    offer_letter: t('typesOfferLetter'),"),
    ("    onboarding: 'Onboarding',", "    onboarding: t('typesOnboarding'),"),
    ("    custom: 'Personnalisé',", "    custom: t('typesCustom'),"),
    # Toasts
    ("toast.error('Erreur réseau - Vérifiez votre connexion')", "toast.error(t('networkErrorDetail'))"),
    ("toast.error('Erreur lors du chargement des templates')", "toast.error(t('loadError') || 'Erreur')"),
    ("toast.success(editingTemplate ? 'Template mis à jour' : 'Template créé')",
     "toast.success(editingTemplate ? t('updateSuccess') : t('createSuccess'))"),
    ("toast.error('Erreur lors de la sauvegarde')", "toast.error(t('saveError'))"),
    ("toast.error('Erreur réseau')", "toast.error(t('networkError'))"),
    ("toast.success('Template supprimé')", "toast.success(t('deleteSuccess'))"),
    ("toast.error('Erreur lors de la suppression')", "toast.error(t('deleteError') || 'Erreur')"),
    ("toast.success('Template dupliqué')", "toast.success(t('duplicateSuccess'))"),
    ("toast.error('Erreur lors de la duplication')", "toast.error(t('duplicateError'))"),
    # Confirm delete
    ("      title: 'Supprimer ce template ?',", "      title: t('deleteConfirmTitle'),"),
    ("      message: \"Ce template d'email sera définitivement supprimé.\",",
     "      message: t('deleteConfirmMsg'),"),
    ("      confirmLabel: 'Supprimer',", "      confirmLabel: tc('delete'),"),
    # Loading state
    ("<DashboardLayout title=\"Templates d'Emails\" subtitle=\"Chargement...\">",
     "<DashboardLayout title={t('loadingTitle')} subtitle={tc('loading')}>"),
    # Main layout
    ("    <DashboardLayout title=\"Templates d'Emails\" subtitle=\"Gérez vos templates de communication automatique\">",
     "    <DashboardLayout title={t('title')} subtitle={t('subtitle')}>"),
    # Hero badge
    ("              <span className=\"text-white/90 text-sm font-medium\">Communication Automatisée</span>",
     "              <span className=\"text-white/90 text-sm font-medium\">{t('badge')}</span>"),
    # Hero title & subtitle
    ("              <h2 className=\"text-3xl lg:text-4xl font-bold text-white mb-2\">Templates d'Emails</h2>",
     "<h2 className=\"text-3xl lg:text-4xl font-bold text-white mb-2\">{t('heroTitle')}</h2>"),
    ("              <p className=\"text-white/80\">Créez des templates réutilisables pour vos communications RH</p>",
     "              <p className=\"text-white/80\">{t('heroSubtitle')}</p>"),
    # New template button
    ("              <span>Nouveau template</span>", "              <span>{t('newButton')}</span>"),
    # Stats
    ('              <p className="text-sm text-white/70">Total Templates</p>',
     '              <p className="text-sm text-white/70">{t(\'statTotal\')}</p>'),
    ('              <p className="text-sm text-white/70">Actifs</p>',
     '              <p className="text-sm text-white/70">{t(\'statActive\')}</p>'),
    ('              <p className="text-sm text-white/70">Utilisations</p>',
     '              <p className="text-sm text-white/70">{t(\'statUsages\')}</p>'),
    # Empty state
    ('            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Aucun template</h3>',
     '<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t(\'emptyTitle\')}</h3>'),
    ("              Créez votre premier template d'email pour automatiser vos communications",
     "{t('emptyDescription')}"),
    ('              <span>Créer un template</span>', '              <span>{t(\'createButton\')}</span>'),
    # Card badges
    ('              <span className="px-2 py-1 text-xs font-bold bg-[#F7C700]/20 text-[#F7C700] rounded-full">Par défaut</span>',
     '<span className="px-2 py-1 text-xs font-bold bg-[#F7C700]/20 text-[#F7C700] rounded-full">{t(\'badgeDefault\')}</span>'),
    ('              <span className="px-2 py-1 text-xs font-bold bg-red-100 text-red-600 rounded-full">Inactif</span>',
     '<span className="px-2 py-1 text-xs font-bold bg-red-100 text-red-600 rounded-full">{t(\'inactive\')}</span>'),
    # Card subject label
    ('              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Sujet:</span>',
     '<span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{t(\'subjectLabel\')}</span>'),
    # Modal titles
    ("            {editingTemplate ? 'Modifier le template' : 'Nouveau template'}\n          </h2>",
     "            {editingTemplate ? t('modalEditTitle') : t('modalCreateTitle')}\n          </h2>"),
    # Form labels
    ("            <label className=\"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1\">Nom du template *</label>",
     "<label className=\"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1\">{t('formName')}</label>"),
    ("              <p className=\"text-xs text-gray-500 mt-1\">Donnez un nom descriptif pour identifier facilement ce template</p>",
     "              <p className=\"text-xs text-gray-500 mt-1\">{t('formNameHint')}</p>"),
    ("            <label className=\"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1\">Type de template *</label>",
     "<label className=\"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1\">{t('formType')}</label>"),
    ("              <p className=\"text-xs text-gray-500 mt-1\">Choisissez le type d'email correspondant à votre besoin</p>",
     "              <p className=\"text-xs text-gray-500 mt-1\">{t('formTypeHint')}</p>"),
    ("            <label className=\"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1\">Sujet de l'email *</label>",
     "<label className=\"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1\">{t('formSubject')}</label>"),
    ("              <p className=\"text-xs text-gray-500 mt-1\">Le sujet qui apparaîtra dans la boîte mail du destinataire</p>",
     "              <p className=\"text-xs text-gray-500 mt-1\">{t('formSubjectHint')}</p>"),
    ("            <label className=\"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1\">Corps du message *</label>",
     "<label className=\"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1\">{t('formBody')}</label>"),
    ("              Variables disponibles (cliquez pour insérer)",
     "              {t('variablesTitle')}"),
    ("                💡 Ces variables seront automatiquement remplacées par les vraies valeurs lors de l'envoi",
     "                {t('variablesHint')}"),
    # Default checkbox
    ("            Définir comme template par défaut",
     "            {t('formDefaultLabel')}"),
    ("              <p className=\"text-xs text-gray-500 mt-1\">Ce template sera automatiquement sélectionné lors de l'envoi d'un email de ce type</p>",
     "              <p className=\"text-xs text-gray-500 mt-1\">{t('formDefaultHint')}</p>"),
    # Modal buttons
    ("            Annuler\n            </button>", "            {tc('cancel')}\n            </button>"),
    ("              {editingTemplate ? '✓ Mettre à jour le template' : '+ Créer le template'}",
     "              {editingTemplate ? `✓ ${t('updateButton')}` : `+ ${t('createConfirmButton')}`}"),
]
n = patch(et_file, et_replacements)
print(f"✅ email-templates/page.tsx : {n} remplacement(s)")


# ─────────────────────────────────────────────────────────────────────────────
# integrations/page.tsx
# ─────────────────────────────────────────────────────────────────────────────
int_file = f"{BASE}/integrations/page.tsx"
int_replacements = [
    ("import toast from 'react-hot-toast';",
     "import toast from 'react-hot-toast';\nimport { useTranslations } from 'next-intl';"),
    ("  const [integrations, setIntegrations] = useState<IntegrationsState>({",
     "  const t = useTranslations('integrations');\n  const tc = useTranslations('common');\n  const [integrations, setIntegrations] = useState<IntegrationsState>({"),
    # Toasts
    ("toast.error('Erreur lors du chargement des intégrations')", "toast.error(t('loadError'))"),
    ("toast.error(`Erreur lors de la connexion à ${provider}`)", "toast.error(`${t('connectProviderError')} ${provider}`)"),
    ("toast.error(`Erreur lors de la déconnexion de ${provider}`)", "toast.error(`${t('connectProviderError')} ${provider}`)"),
    # Confirm disconnect
    ("      title: `Déconnecter ${providerLabel} ?`,", "      title: `${t('disconnectTitle').replace('?', '')} ${providerLabel} ?`,"),
    ("      message: `Vous allez supprimer l'intégration avec ${providerLabel}. Vous pourrez la reconnecter à tout moment.`,",
     "      message: t('disconnectMsg'),"),
    ("      confirmLabel: 'Déconnecter',", "      confirmLabel: t('disconnectButton'),"),
    # Loading state
    ("<DashboardLayout title=\"Intégrations\" subtitle=\"Chargement...\">",
     "<DashboardLayout title={t('loadingTitle')} subtitle={tc('loading')}>"),
    # Main layout
    ("    <DashboardLayout title=\"Intégrations\" subtitle=\"Automatisez vos workflows RH\">",
     "    <DashboardLayout title={t('title')} subtitle={t('subtitle')}>"),
    # Hero badge
    ("              <span className=\"text-white/90 text-sm font-medium\">Intégrations Tierces</span>",
     "              <span className=\"text-white/90 text-sm font-medium\">{t('badge')}</span>"),
    # Hero title
    ("              <h2 className=\"text-3xl lg:text-4xl font-bold text-white mb-2\">Connectez Vos Outils</h2>",
     "<h2 className=\"text-3xl lg:text-4xl font-bold text-white mb-2\">{t('heroTitle')}</h2>"),
    ("              <p className=\"text-white/80\">Automatisez la publication d'offres et la planification d'entretiens</p>",
     "              <p className=\"text-white/80\">{t('heroSubtitle')}</p>"),
    # Refresh button
    ("              <span>Actualiser</span>", "              <span>{tc('refresh')}</span>"),
    # Integration stat labels
    ("                <span className=\"text-xs text-white/70\">LinkedIn</span>", "                <span className=\"text-xs text-white/70\">{t('statLinkedIn')}</span>"),
    ("                <span className=\"text-xs text-white/70\">Google Calendar</span>", "                <span className=\"text-xs text-white/70\">{t('statGoogleCalendar')}</span>"),
    ("                <span className=\"text-xs text-white/70\">Microsoft Teams</span>", "                <span className=\"text-xs text-white/70\">{t('statMicrosoftTeams')}</span>"),
    # Info box
    ('            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Gagnez du temps avec les intégrations</h3>',
     '<h3 className="font-bold text-gray-900 dark:text-white mb-2">{t(\'infoTitle\')}</h3>'),
    ("              Publiez automatiquement vos offres d'emploi sur LinkedIn, planifiez des entretiens avec Google Calendar ou Microsoft Teams. Toutes vos actions synchronisées en un clic.",
     "{t('infoDescription')}"),
    # Targetym card
    ('            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Targetym RH</h3>',
     '<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t(\'targetymTitle\')}</h3>'),
    ("              Connectez votre plateforme RH Targetym pour automatiser l'intégration des candidats embauchés",
     "{t('targetymDescription')}"),
    ('              <span className="text-xs font-bold bg-[#6B9B5F] text-white px-2 py-1 rounded-full">✨ Natif</span>',
     '<span className="text-xs font-bold bg-[#6B9B5F] text-white px-2 py-1 rounded-full">✨ {t(\'nativeBadge\')}</span>'),
    ("              <span>Candidat embauché → Employé créé automatiquement</span>", "              <span>{t('targetymFeature1')}</span>"),
    ("              <span>Offres internes Targetym → publiées sur IntoWork</span>", "              <span>{t('targetymFeature2')}</span>"),
    ("              <span>Flux RH et recrutement unifiés</span>", "              <span>{t('targetymFeature3')}</span>"),
    ("            <span>Configurer</span>", "            <span>{t('configureButton')}</span>"),
    # Features lists
    ("              <span>Publication automatique d'offres</span>", "              <span>{t('linkedinFeature1') || \"Publication automatique d'offres\"}</span>"),
    ("              <span>Partage sur votre page entreprise</span>", "              <span>{t('linkedinHelp').split('.')[0]}</span>"),
    # Help section
    ("          <h3 className=\"text-lg font-bold text-gray-900 dark:text-white mb-3\">Besoin d'aide ?</h3>",
     "<h3 className=\"text-lg font-bold text-gray-900 dark:text-white mb-3\">{t('helpTitle')}</h3>"),
    ("              Les intégrations utilisent OAuth 2.0 pour sécuriser la connexion à vos comptes. Vous pouvez révoquer l'accès à tout moment depuis cette page.",
     "{t('helpDescription')}"),
    # IntegrationCard component strings
    ('      <span className="text-xs font-bold bg-green-100 text-green-800 px-2 py-1 rounded-full">Connecté</span>',
     '<span className="text-xs font-bold bg-green-100 text-green-800 px-2 py-1 rounded-full">{t(\'connected\')}</span>'),
    ('        <span className="text-xs text-gray-500">Connecté le :</span>',
     '        <span className="text-xs text-gray-500">{t(\'connectedOn\')}</span>'),
    ('        <span className="text-xs text-gray-500">Dernière utilisation :</span>',
     '        <span className="text-xs text-gray-500">{t(\'lastUsed\')}</span>'),
    ("          Déconnecter\n          </button>",
     "          {t('disconnectButton')}\n          </button>"),
    ("          Connexion en cours...\n          </button>",
     "          {t('connecting')}\n          </button>"),
    ("          Connecter\n          </button>",
     "          {t('connectButton')}\n          </button>"),
]
n = patch(int_file, int_replacements)
print(f"✅ integrations/page.tsx : {n} remplacement(s)")


# ─────────────────────────────────────────────────────────────────────────────
# jobs/[id]/page.tsx
# ─────────────────────────────────────────────────────────────────────────────
jd_file = f"{BASE}/jobs/[id]/page.tsx"

with open(jd_file, encoding="utf-8") as f:
    jd_src = f.read()

already_imported_jd = "from 'next-intl'" in jd_src

jd_replacements = []

if not already_imported_jd:
    jd_replacements.append(
        ("import toast from 'react-hot-toast';",
         "import toast from 'react-hot-toast';\nimport { useTranslations } from 'next-intl';")
    )

# Check if there's already a jobDetail hook
if "useTranslations('jobs')" in jd_src:
    jd_replacements.append(
        ("  const t = useTranslations('jobs');",
         "  const t = useTranslations('jobDetail');\n  const tc = useTranslations('common');")
    )
elif "useTranslations('jobDetail')" not in jd_src:
    # Find a good spot to add hooks
    jd_replacements.append(
        ("  const [applying, setApplying] = useState(false);",
         "  const t = useTranslations('jobDetail');\n  const tc = useTranslations('common');\n  const [applying, setApplying] = useState(false);")
    )

jd_replacements += [
    # Location type helper
    ("    case 'remote': return 'Télétravail';", "    case 'remote': return tc('remote');"),
    ("    case 'hybrid': return 'Hybride';", "    case 'hybrid': return tc('hybrid');"),
    ("    default: return 'Présentiel';", "    default: return tc('onSite');"),
    # Job type helper
    ("    case 'full_time': return 'Temps plein';", "    case 'full_time': return tc('fullTime');"),
    ("    case 'part_time': return 'Temps partiel';", "    case 'part_time': return tc('partTime');"),
    ("    case 'contract': return 'Contrat';", "    case 'contract': return tc('contract');"),
    ("    case 'temporary': return 'Temporaire';", "    case 'temporary': return tc('temporary');"),
    ("    default: return 'Stage';", "    default: return tc('internship');"),
    # formatDate
    ("    return 'Date inconnue';", "    return tc('unknownDate');"),
    ("    if (diffDays === 0) return \"Aujourd'hui\";", "    if (diffDays === 0) return tc('today');"),
    ("    if (diffDays === 1) return 'Hier';", "    if (diffDays === 1) return tc('yesterday');"),
    ("    if (diffDays < 7) return `Il y a ${diffDays} jours`;",
     "    if (diffDays < 7) return tc('daysAgo', { count: diffDays });"),
    ("    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;",
     "    if (diffDays < 30) return tc('weeksAgo', { count: Math.floor(diffDays / 7) });"),
    ("    return `Il y a ${Math.floor(diffDays / 30)} mois`;",
     "    return tc('monthsAgo', { count: Math.floor(diffDays / 30) });"),
    # Toasts
    ("toast.error('Vous devez être connecté pour postuler')", "toast.error(t('authRequired'))"),
    ("toast.error('❌ Vous avez déjà postulé à cette offre')", "toast.error(t('alreadyApplied'))"),
    ("toast.error(\"❌ Erreur lors de l'envoi de la candidature\")", "toast.error(t('applyError'))"),
    # "Not found" state
    ('<p className="text-gray-500 text-center mb-4">Offre non trouvée</p>',
     '<p className="text-gray-500 text-center mb-4">{t(\'notFound\')}</p>'),
    ("          ← Retour aux offres\n          </Link>",
     "          {t('backToJobs')}\n          </Link>"),
    # Retour button
    ('          Retour\n          </button>',
     '          {tc(\'back\')}\n          </button>'),
    # Already applied button
    ('        Déjà postulé\n        </button>',
     '        {t(\'alreadyAppliedButton\')}\n        </button>'),
    # Sections
    ('<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Description du poste</h2>',
     '<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t(\'sectionDescription\')}</h2>'),
    ('<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Responsabilités</h2>',
     '<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t(\'sectionResponsibilities\')}</h2>'),
    ('<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Exigences</h2>',
     '<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t(\'sectionRequirements\')}</h2>'),
    ('<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Avantages</h2>',
     '<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t(\'sectionBenefits\')}</h2>'),
    # Apply button
    ('        Postuler à cette offre\n        </button>',
     '        {t(\'applyButton\')}\n        </button>'),
    # Modal
    ('<h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Postuler à cette offre</h2>',
     '<h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t(\'modalTitle\')}</h2>'),
    ('<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lettre de motivation</label>',
     '<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t(\'coverLetterLabel\')}</label>'),
    ('            <span className="text-gray-400 text-xs">(optionnel)</span>',
     '            <span className="text-gray-400 text-xs">{t(\'optional\')}</span>'),
    ('        <span className="font-bold text-gray-700 dark:text-gray-300">Note :</span>',
     '        <span className="font-bold text-gray-700 dark:text-gray-300">{t(\'note\')}</span>'),
    ("          Votre CV sera automatiquement joint à votre candidature.",
     "          {t('cvAttachedNote')}"),
    # Modal buttons
    ("          Annuler\n          </button>", "          {tc('cancel')}\n          </button>"),
    ("            {applying ? 'Envoi en cours...' : 'Envoyer ma candidature'}",
     "            {applying ? t('submitting') : t('submitApplication')}"),
]
n = patch(jd_file, jd_replacements)
print(f"✅ jobs/[id]/page.tsx : {n} remplacement(s)")


# ─────────────────────────────────────────────────────────────────────────────
# company/page.tsx
# ─────────────────────────────────────────────────────────────────────────────
co_file = f"{BASE}/company/page.tsx"

with open(co_file, encoding="utf-8") as f:
    co_src = f.read()

already_imported_co = "from 'next-intl'" in co_src

co_replacements = []

if not already_imported_co:
    co_replacements.append(
        ("import toast from 'react-hot-toast';",
         "import toast from 'react-hot-toast';\nimport { useTranslations } from 'next-intl';")
    )

# Check if t hook exists
if "useTranslations('company')" not in co_src:
    co_replacements.append(
        ("  const { user } = useUser();",
         "  const t = useTranslations('company');\n  const tc = useTranslations('common');\n  const { user } = useUser();")
    )
else:
    # Add tc if missing
    if "useTranslations('common')" not in co_src:
        co_replacements.append(
            ("  const t = useTranslations('company');",
             "  const t = useTranslations('company');\n  const tc = useTranslations('common');")
        )

co_replacements += [
    # Toasts
    ("toast(\"Créez votre profil d'entreprise pour commencer\", { icon: '🏢' })",
     "toast(t('createProfilePrompt'), { icon: '🏢' })"),
    ("getErrorMessage(error, 'Erreur lors du chargement des données')",
     "getErrorMessage(error, t('loadError') || 'Erreur')"),
    ("toast.success('Informations mises à jour avec succès !')", "toast.success(t('updateSuccess'))"),
    ("getErrorMessage(error, 'Erreur lors de la sauvegarde')", "getErrorMessage(error, t('saveError'))"),
    # Loading subtitle
    ("      subtitle=\"Chargement...\">", "      subtitle={tc('loading')}>"),
    ("        <p>Chargement des informations...</p>", "        <p>{t('loading')}</p>"),
    # Hero badge
    ("            <span className=\"text-white/90 text-sm font-medium\">Profil Entreprise</span>",
     "            <span className=\"text-white/90 text-sm font-medium\">{t('badge')}</span>"),
    # Company name and industry defaults
    ("            <h2 className=\"text-2xl font-bold text-white\">{company?.name || 'Nouvelle Entreprise'}</h2>",
     "<h2 className=\"text-2xl font-bold text-white\">{company?.name || t('defaultName')}</h2>"),
    ("            <p className=\"text-white/80\">{company?.industry || 'Industrie non définie'}</p>",
     "            <p className=\"text-white/80\">{company?.industry || t('defaultIndustry')}</p>"),
    # Stats labels
    ("              <p className=\"text-sm text-white/70\">Offres actives</p>", "              <p className=\"text-sm text-white/70\">{t('statActiveJobs')}</p>"),
    ("              <p className=\"text-sm text-white/70\">Total offres</p>", "              <p className=\"text-sm text-white/70\">{t('statTotalJobs')}</p>"),
    ("              <p className=\"text-sm text-white/70\">Recruteurs</p>", "              <p className=\"text-sm text-white/70\">{t('statRecruiters')}</p>"),
    ("              <p className=\"text-sm text-white/70\">Candidatures</p>", "              <p className=\"text-sm text-white/70\">{t('statApplications')}</p>"),
    # Section header
    ('            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Informations générales</h3>',
     '<h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t(\'sectionGeneral\')}</h3>'),
    # Size options
    ('<option value="">Sélectionner...</option>',
     '<option value="">{tc(\'selectPlaceholder\')}</option>'),
    ('<option value="1-10">1-10 employés</option>', '<option value="1-10">{t(\'size1\')}</option>'),
    ('<option value="11-50">11-50 employés</option>', '<option value="11-50">{t(\'size2\')}</option>'),
    ('<option value="51-200">51-200 employés</option>', '<option value="51-200">{t(\'size3\')}</option>'),
    ('<option value="201-500">201-500 employés</option>', '<option value="201-500">{t(\'size4\')}</option>'),
    ('<option value="500+">500+ employés</option>', '<option value="500+">{t(\'size5\')}</option>'),
    # Logo hints
    ("              <p className=\"text-xs text-gray-400\">Pour modifier le logo, allez dans Paramètres → Entreprise</p>",
     "              <p className=\"text-xs text-gray-400\">{t('changeLogoHint')}</p>"),
    ("              <p className=\"text-sm font-medium text-gray-500\">Aucun logo</p>",
     "              <p className=\"text-sm font-medium text-gray-500\">{t('noLogo')}</p>"),
    ("              <p className=\"text-xs text-gray-400\">Ajoutez votre logo dans Paramètres → Entreprise</p>",
     "              <p className=\"text-xs text-gray-400\">{t('addLogoHint')}</p>"),
    # Location section
    ('            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Localisation</h3>',
     '<h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t(\'sectionLocation\')}</h3>'),
    # City/Country labels
    ('              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ville</label>',
     '<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t(\'city\')}</label>'),
    ('              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pays</label>',
     '<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t(\'country\')}</label>'),
    # LinkedIn label (if hardcoded)
    ('              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">LinkedIn</label>',
     '<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t(\'linkedinLabel\')}</label>'),
]
n = patch(co_file, co_replacements)
print(f"✅ company/page.tsx : {n} remplacement(s)")
