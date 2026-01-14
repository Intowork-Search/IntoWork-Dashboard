/**
 * INTOWORK Brand Components - Exemples d'Utilisation
 *
 * Ce fichier contient des exemples d'utilisation des composants de la charte graphique.
 * Utilisez-les comme référence pour vos propres implémentations.
 */

import React from 'react';
import {
  BrandButton,
  BrandCard,
  BrandCardHeader,
  BrandBadge,
  BrandInput,
  BrandLogo,
  BrandSection,
  BrandContainer,
  BrandStatCard,
} from './BrandComponents';
import {
  EnvelopeIcon,
  LockClosedIcon,
  ArrowRightIcon,
  UserGroupIcon,
  BriefcaseIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

/* ========================================
   EXEMPLE 1 : BOUTONS
   ======================================== */

export const ButtonExamples = () => {
  return (
    <div className="space-y-4 p-8 bg-slate-50">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Exemples de Boutons</h2>

      {/* Boutons principaux */}
      <div className="flex flex-wrap gap-4">
        <BrandButton variant="primary">
          Bouton Principal
        </BrandButton>

        <BrandButton variant="secondary">
          Bouton Secondaire
        </BrandButton>

        <BrandButton variant="tertiary">
          Bouton Tertiaire
        </BrandButton>

        <BrandButton variant="outline">
          Bouton Outline
        </BrandButton>
      </div>

      {/* Boutons avec icônes */}
      <div className="flex flex-wrap gap-4">
        <BrandButton
          variant="primary"
          icon={<ArrowRightIcon className="w-5 h-5" />}
          iconPosition="right"
        >
          Continuer
        </BrandButton>

        <BrandButton
          variant="secondary"
          icon={<BriefcaseIcon className="w-5 h-5" />}
          iconPosition="left"
        >
          Publier une Offre
        </BrandButton>
      </div>

      {/* Boutons avec états */}
      <div className="flex flex-wrap gap-4">
        <BrandButton variant="primary" loading>
          Chargement
        </BrandButton>

        <BrandButton variant="secondary" disabled>
          Désactivé
        </BrandButton>
      </div>

      {/* Tailles */}
      <div className="flex flex-wrap items-center gap-4">
        <BrandButton variant="primary" size="sm">
          Petit
        </BrandButton>

        <BrandButton variant="primary" size="md">
          Moyen
        </BrandButton>

        <BrandButton variant="primary" size="lg">
          Grand
        </BrandButton>
      </div>
    </div>
  );
};

/* ========================================
   EXEMPLE 2 : CARTES
   ======================================== */

export const CardExamples = () => {
  return (
    <div className="space-y-8 p-8 bg-slate-50">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Exemples de Cartes</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Carte simple */}
        <BrandCard className="p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            Carte Simple
          </h3>
          <p className="text-slate-600">
            Une carte de base avec contenu simple.
          </p>
        </BrandCard>

        {/* Carte avec header */}
        <BrandCard className="p-6">
          <BrandCardHeader
            title="Carte avec Header"
            description="Description de la carte"
            action={
              <BrandButton variant="outline" size="sm">
                Action
              </BrandButton>
            }
          />
          <p className="text-slate-600">
            Contenu de la carte avec header séparé.
          </p>
        </BrandCard>

        {/* Carte hoverable */}
        <BrandCard variant="elevated" hoverable className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[var(--color-brand-green)] rounded-lg flex items-center justify-center">
              <UserGroupIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900">
              Carte Interactive
            </h3>
          </div>
          <p className="text-slate-600 mb-4">
            Cette carte a un effet hover pour indiquer qu'elle est cliquable.
          </p>
          <BrandBadge variant="success">Actif</BrandBadge>
        </BrandCard>

        {/* Carte avec bordure */}
        <BrandCard variant="bordered" className="p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">
            Carte Bordered
          </h3>
          <div className="space-y-2">
            <BrandBadge variant="warning" dot>En attente</BrandBadge>
            <BrandBadge variant="error" dot>Urgent</BrandBadge>
            <BrandBadge variant="info" dot>Information</BrandBadge>
          </div>
        </BrandCard>
      </div>
    </div>
  );
};

/* ========================================
   EXEMPLE 3 : FORMULAIRES
   ======================================== */

export const FormExamples = () => {
  return (
    <div className="max-w-md mx-auto p-8 bg-slate-50">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Exemples de Formulaires</h2>

      <BrandCard className="p-6">
        <BrandCardHeader
          title="Connexion"
          description="Accédez à votre compte"
        />

        <div className="space-y-4">
          <BrandInput
            label="Adresse e-mail"
            type="email"
            placeholder="nom.prenom@entreprise.com"
            icon={<EnvelopeIcon className="w-5 h-5" />}
            iconPosition="left"
          />

          <BrandInput
            label="Mot de passe"
            type="password"
            placeholder="••••••••••••"
            icon={<LockClosedIcon className="w-5 h-5" />}
            iconPosition="left"
          />

          <BrandInput
            label="Confirmation"
            type="password"
            placeholder="••••••••••••"
            error="Les mots de passe ne correspondent pas"
            icon={<LockClosedIcon className="w-5 h-5" />}
            iconPosition="left"
          />

          <BrandInput
            label="Email avec aide"
            type="email"
            placeholder="email@example.com"
            helperText="Nous ne partagerons jamais votre email"
            icon={<EnvelopeIcon className="w-5 h-5" />}
          />

          <BrandButton
            variant="primary"
            className="w-full"
            icon={<ArrowRightIcon className="w-5 h-5" />}
          >
            Se connecter
          </BrandButton>
        </div>
      </BrandCard>
    </div>
  );
};

/* ========================================
   EXEMPLE 4 : STATISTIQUES
   ======================================== */

export const StatsExamples = () => {
  return (
    <div className="p-8 bg-slate-50">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Exemples de Statistiques</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BrandStatCard
          label="Candidatures Actives"
          value="127"
          icon={<UserGroupIcon className="w-6 h-6" />}
          trend={{ value: 12.5, label: 'ce mois' }}
          variant="green"
        />

        <BrandStatCard
          label="Offres Publiées"
          value="24"
          icon={<BriefcaseIcon className="w-6 h-6" />}
          trend={{ value: -5.2, label: 'vs mois dernier' }}
          variant="gold"
        />

        <BrandStatCard
          label="Taux de Matching"
          value="89%"
          icon={<ChartBarIcon className="w-6 h-6" />}
          trend={{ value: 8.3, label: "d'amélioration" }}
          variant="violet"
        />
      </div>
    </div>
  );
};

/* ========================================
   EXEMPLE 5 : HERO SECTION
   ======================================== */

export const HeroExample = () => {
  return (
    <BrandSection background="gradient" spacing="xl">
      <BrandContainer>
        <div className="text-center">
          <BrandLogo
            variant="full"
            size="lg"
            color="white"
            className="justify-center mb-8"
          />

          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
            Transformez Votre Recrutement
          </h1>

          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto animate-fade-in animation-delay-100">
            La plateforme B2B2C qui connecte les meilleurs talents avec les meilleures opportunités.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in animation-delay-200">
            <BrandButton
              variant="secondary"
              size="lg"
              icon={<ArrowRightIcon className="w-5 h-5" />}
            >
              Commencer Gratuitement
            </BrandButton>

            <BrandButton
              variant="outline"
              size="lg"
              className="bg-white/10 border-white text-white hover:bg-white/20"
            >
              Voir la Démo
            </BrandButton>
          </div>
        </div>
      </BrandContainer>
    </BrandSection>
  );
};

/* ========================================
   EXEMPLE 6 : DASHBOARD CANDIDAT
   ======================================== */

export const DashboardCandidateExample = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <BrandContainer>
          <div className="flex items-center justify-between py-4">
            <BrandLogo variant="full" size="md" />
            <div className="flex items-center gap-4">
              <BrandBadge variant="success" dot>
                12 nouvelles opportunités
              </BrandBadge>
              <BrandButton variant="secondary" size="sm">
                Rechercher
              </BrandButton>
            </div>
          </div>
        </BrandContainer>
      </header>

      {/* Content */}
      <BrandContainer className="py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <BrandStatCard
            label="Candidatures Envoyées"
            value="15"
            icon={<BriefcaseIcon className="w-6 h-6" />}
            trend={{ value: 25, label: 'ce mois' }}
            variant="green"
          />

          <BrandStatCard
            label="Entretiens Planifiés"
            value="3"
            icon={<ChartBarIcon className="w-6 h-6" />}
            variant="gold"
          />

          <BrandStatCard
            label="Taux de Réponse"
            value="67%"
            icon={<UserGroupIcon className="w-6 h-6" />}
            trend={{ value: 12, label: 'vs dernier mois' }}
            variant="violet"
          />
        </div>

        {/* Job Cards */}
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Offres Recommandées
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BrandCard hoverable className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-1">
                  Développeur Full Stack
                </h3>
                <p className="text-slate-600">TechCorp - Paris, France</p>
              </div>
              <BrandBadge variant="success">Nouveau</BrandBadge>
            </div>

            <p className="text-slate-600 mb-4">
              Rejoignez notre équipe pour développer des solutions innovantes...
            </p>

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <BrandBadge variant="info">React</BrandBadge>
                <BrandBadge variant="info">Node.js</BrandBadge>
              </div>
              <BrandButton variant="primary" size="sm">
                Postuler
              </BrandButton>
            </div>
          </BrandCard>

          <BrandCard hoverable className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-1">
                  Product Manager
                </h3>
                <p className="text-slate-600">StartupXYZ - Remote</p>
              </div>
              <BrandBadge variant="warning">Urgent</BrandBadge>
            </div>

            <p className="text-slate-600 mb-4">
              Pilotez le développement de nos nouveaux produits...
            </p>

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <BrandBadge variant="info">Product</BrandBadge>
                <BrandBadge variant="info">Strategy</BrandBadge>
              </div>
              <BrandButton variant="secondary" size="sm">
                Voir Plus
              </BrandButton>
            </div>
          </BrandCard>
        </div>
      </BrandContainer>
    </div>
  );
};

/* ========================================
   EXEMPLE 7 : PAGE D'AUTHENTIFICATION
   ======================================== */

export const AuthPageExample = () => {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[var(--color-brand-green)] text-white p-12 flex-col justify-between">
        <BrandLogo variant="full" size="lg" color="white" />

        <div className="space-y-8">
          <h2 className="text-4xl font-bold">
            La plateforme de recrutement intelligente
          </h2>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                <UserGroupIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Matching IA</h3>
                <p className="text-white/80">
                  Trouvez les meilleurs talents instantanément
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                <BriefcaseIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Gestion Simplifiée</h3>
                <p className="text-white/80">
                  Gérez toutes vos candidatures en un seul endroit
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-sm text-white/80">
          © 2026 INTOWORK. Tous droits réservés.
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <BrandLogo variant="full" size="md" />
          </div>

          <div className="mb-8">
            <h2 className="text-4xl font-bold text-slate-900 mb-3">
              Connexion
            </h2>
            <p className="text-slate-600 text-lg">
              Accédez à votre espace professionnel
            </p>
          </div>

          <BrandCard className="p-8">
            <form className="space-y-6">
              <BrandInput
                label="Adresse e-mail"
                type="email"
                placeholder="nom.prenom@entreprise.com"
                icon={<EnvelopeIcon className="w-5 h-5" />}
              />

              <BrandInput
                label="Mot de passe"
                type="password"
                placeholder="••••••••••••"
                icon={<LockClosedIcon className="w-5 h-5" />}
              />

              <BrandButton
                variant="secondary"
                className="w-full"
                icon={<ArrowRightIcon className="w-5 h-5" />}
              >
                Se connecter
              </BrandButton>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-200 text-center">
              <p className="text-sm text-slate-600">
                Première visite ?{' '}
                <a
                  href="/signup"
                  className="font-semibold text-[var(--color-brand-green)] hover:text-[var(--green-600)]"
                >
                  Créer un compte
                </a>
              </p>
            </div>
          </BrandCard>
        </div>
      </div>
    </div>
  );
};

/* ========================================
   EXPORT ALL EXAMPLES
   ======================================== */

export const AllExamples = () => {
  return (
    <div className="space-y-16">
      <ButtonExamples />
      <CardExamples />
      <FormExamples />
      <StatsExamples />
      <HeroExample />
      <DashboardCandidateExample />
      <AuthPageExample />
    </div>
  );
};
