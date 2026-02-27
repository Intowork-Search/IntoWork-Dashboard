/**
 * Tours d'onboarding pour candidats et employeurs
 * 
 * Définit les étapes guidées pour chaque type d'utilisateur
 */

import { OnboardingStep } from '@/components/OnboardingTour';

// ========================================
// TOUR CANDIDAT - Dashboard Principal
// ========================================

export const candidateDashboardTour: OnboardingStep[] = [
  {
    target: '[data-tour="profile-completion"]',
    title: '👤 Complétez votre profil',
    content: 'Commencez par compléter votre profil à 100% pour maximiser vos chances. Les recruteurs voient votre taux de complétion !',
    position: 'bottom'
  },
  {
    target: '[data-tour="upload-cv"]',
    title: '📄 Téléchargez votre CV',
    content: 'Ajoutez votre CV en PDF pour postuler rapidement. Vous pouvez gérer plusieurs CV selon les postes.',
    position: 'bottom'
  },
  {
    target: '[data-tour="search-jobs"]',
    title: '🔍 Recherchez des offres',
    content: 'Explorez les offres d\'emploi disponibles. Utilisez les filtres pour trouver le poste idéal.',
    position: 'bottom'
  },
  {
    target: '[data-tour="my-applications"]',
    title: '📋 Suivez vos candidatures',
    content: 'Consultez l\'état de toutes vos candidatures en un seul endroit. Vous recevrez des notifications à chaque mise à jour.',
    position: 'left'
  },
  {
    target: '[data-tour="notifications"]',
    title: '🔔 Restez informé',
    content: 'Vous recevrez des notifications quand un recruteur consulte votre profil, vous présélectionne ou vous convoque en entretien.',
    position: 'bottom'
  }
];

// ========================================
// TOUR CANDIDAT - Page Profil
// ========================================

export const candidateProfileTour: OnboardingStep[] = [
  {
    target: '[data-tour="profile-basics"]',
    title: '✏️ Informations de base',
    content: 'Renseignez votre titre professionnel, résumé et coordonnées. C\'est la première chose que voient les recruteurs !',
    position: 'right'
  },
  {
    target: '[data-tour="experiences"]',
    title: '💼 Expériences professionnelles',
    content: 'Ajoutez vos expériences passées. Plus votre profil est détaillé, meilleures sont vos chances.',
    position: 'right'
  },
  {
    target: '[data-tour="education"]',
    title: '🎓 Formation',
    content: 'Ajoutez vos diplômes et certifications. N\'oubliez pas les formations continues !',
    position: 'right'
  },
  {
    target: '[data-tour="skills"]',
    title: '⚡ Compétences',
    content: 'Listez vos compétences clés. Cela aide les recruteurs à vous trouver plus facilement.',
    position: 'right'
  }
];

// ========================================
// TOUR CANDIDAT - Recherche d'Emploi
// ========================================

export const candidateJobSearchTour: OnboardingStep[] = [
  {
    target: '[data-tour="job-filters"]',
    title: '🎯 Filtrez les offres',
    content: 'Utilisez les filtres pour affiner votre recherche : type de contrat, localisation, salaire, etc.',
    position: 'right'
  },
  {
    target: '[data-tour="job-card"]',
    title: '📌 Détails de l\'offre',
    content: 'Cliquez sur une offre pour voir tous les détails, les compétences requises et postuler.',
    position: 'left'
  },
  {
    target: '[data-tour="apply-button"]',
    title: '🚀 Postulez en un clic',
    content: 'Votre CV et profil sont envoyés automatiquement. Vous recevrez une confirmation par email.',
    position: 'top'
  }
];

// ========================================
// TOUR EMPLOYEUR - Dashboard Principal
// ========================================

export const employerDashboardTour: OnboardingStep[] = [
  {
    target: '[data-tour="company-setup"]',
    title: '🏢 Configurez votre entreprise',
    content: 'Commencez par créer le profil de votre entreprise. Cela sera visible sur toutes vos offres.',
    position: 'bottom'
  },
  {
    target: '[data-tour="create-job"]',
    title: '➕ Publiez une offre',
    content: 'Créez votre première offre d\'emploi. Le processus est simple et rapide !',
    position: 'bottom'
  },
  {
    target: '[data-tour="view-applications"]',
    title: '👥 Gérez les candidatures',
    content: 'Consultez toutes les candidatures reçues et gérez leur statut (vue, présélection, entretien, etc.).',
    position: 'left'
  },
  {
    target: '[data-tour="manage-interviews"]',
    title: '📅 Planifiez les entretiens',
    content: 'Organisez vos entretiens et synchronisez-les avec Google Calendar ou Outlook.',
    position: 'left'
  },
  {
    target: '[data-tour="stats"]',
    title: '📊 Suivez vos statistiques',
    content: 'Consultez le nombre de vues, candidatures et le taux de conversion de vos offres.',
    position: 'top'
  }
];

// ========================================
// TOUR EMPLOYEUR - Gestion des Candidatures
// ========================================

export const employerApplicationsTour: OnboardingStep[] = [
  {
    target: '[data-tour="filters"]',
    title: '🔍 Filtrez par statut',
    content: 'Organisez vos candidatures par statut : nouvelles, vues, présélectionnées, entretiens, etc.',
    position: 'top'
  },
  {
    target: '[data-tour="candidate-card"]',
    title: '📋 Profil du candidat',
    content: 'Consultez le CV, l\'expérience et les compétences de chaque candidat.',
    position: 'left'
  },
  {
    target: '[data-tour="change-status"]',
    title: '✅ Changez le statut',
    content: 'Cliquez sur le statut pour le modifier. Le candidat recevra une notification automatique.',
    position: 'top'
  },
  {
    target: '[data-tour="notes"]',
    title: '📝 Ajoutez des notes',
    content: 'Prenez des notes privées sur chaque candidature pour votre équipe.',
    position: 'top'
  },
  {
    target: '[data-tour="download-cv"]',
    title: '⬇️ Téléchargez le CV',
    content: 'Téléchargez le CV au format PDF pour le consulter en détail.',
    position: 'top'
  }
];

// ========================================
// TOUR EMPLOYEUR - Création d'Offre
// ========================================

export const employerCreateJobTour: OnboardingStep[] = [
  {
    target: '[data-tour="job-basics"]',
    title: '📝 Informations de base',
    content: 'Donnez un titre clair et une description détaillée du poste. Plus c\'est précis, mieux c\'est !',
    position: 'right'
  },
  {
    target: '[data-tour="job-requirements"]',
    title: '🎯 Compétences requises',
    content: 'Listez les compétences nécessaires. Cela aide l\'algorithme de matching à trouver les meilleurs candidats.',
    position: 'right'
  },
  {
    target: '[data-tour="job-salary"]',
    title: '💰 Salaire et avantages',
    content: 'Les offres avec salaire indiqué reçoivent 3x plus de candidatures !',
    position: 'right'
  },
  {
    target: '[data-tour="publish-button"]',
    title: '🚀 Publiez l\'offre',
    content: 'Une fois publiée, votre offre sera visible par des milliers de candidats.',
    position: 'top'
  }
];

// ========================================
// TOUR EMPLOYEUR - Templates d'Email
// ========================================

export const employerEmailTemplatesTour: OnboardingStep[] = [
  {
    target: '[data-tour="create-template"]',
    title: '✉️ Créez vos templates',
    content: 'Automatisez vos emails aux candidats : confirmation, invitation entretien, refus, etc.',
    position: 'bottom'
  },
  {
    target: '[data-tour="template-variables"]',
    title: '🔤 Variables dynamiques',
    content: 'Utilisez {candidate_name}, {job_title}, etc. pour personnaliser automatiquement vos emails.',
    position: 'right'
  },
  {
    target: '[data-tour="default-template"]',
    title: '⭐ Template par défaut',
    content: 'Marquez un template comme "par défaut" pour qu\'il s\'envoie automatiquement lors des changements de statut.',
    position: 'top'
  }
];

// ========================================
// TOUR - Intégrations OAuth
// ========================================

export const integrationsTour: OnboardingStep[] = [
  {
    target: '[data-tour="connect-linkedin"]',
    title: '🔗 LinkedIn',
    content: 'Connectez votre LinkedIn pour importer votre profil ou publier des offres automatiquement.',
    position: 'right'
  },
  {
    target: '[data-tour="connect-google"]',
    title: '📅 Google Calendar',
    content: 'Synchronisez avec Google Calendar pour créer automatiquement des événements d\'entretien.',
    position: 'right'
  },
  {
    target: '[data-tour="connect-outlook"]',
    title: '📆 Outlook',
    content: 'Connectez Outlook pour gérer vos entretiens directement dans votre calendrier Microsoft.',
    position: 'right'
  }
];
