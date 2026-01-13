# GUIDE D'IMPLÉMENTATION - CHARTE GRAPHIQUE INTOWORK

Ce guide vous aide à appliquer la nouvelle charte graphique basée sur les couleurs du logo INTOWORK.

---

## 🚀 DÉMARRAGE RAPIDE

### Étape 1 : Importer les Variables CSS

Dans `frontend/src/app/globals.css`, ajoutez l'import :

```css
@import '../styles/brand-colors.css';
```

### Étape 2 : Mettre à Jour le Thème DaisyUI

Les variables DaisyUI sont déjà définies dans `brand-colors.css`. Elles remplacent les couleurs actuelles :

**AVANT** (purple/coral) :
```css
--color-primary: oklch(64% 0.2 131.684);   /* Deep purple */
--color-secondary: oklch(45% 0.18 290);    /* Purple */
--color-accent: oklch(62% 0.194 149.214);  /* Mint green */
```

**APRÈS** (basé sur le logo) :
```css
--color-primary: oklch(63% 0.12 145);      /* Vert #6B9B5F */
--color-secondary: oklch(82% 0.18 95);     /* Or #F7C700 */
--color-accent: oklch(48% 0.20 290);       /* Violet #6B46C1 */
```

### Étape 3 : Tester sur une Page

Testez d'abord sur la landing page `/frontend/src/app/page.tsx` pour voir les changements.

---

## 📋 MIGRATION PAR COMPOSANT

### 1. Boutons

#### AVANT (purple/coral)
```tsx
<button className="bg-primary hover:bg-primary/90 text-white">
  Bouton Principal
</button>
```

#### APRÈS (vert du logo)
```tsx
<button className="bg-[var(--color-brand-green)] hover:bg-[var(--green-600)] text-white">
  Bouton Principal
</button>

// OU utiliser la classe helper
<button className="btn-brand-primary">
  Bouton Principal
</button>
```

#### Variantes
```tsx
{/* Bouton Secondaire - Or */}
<button className="btn-brand-secondary">
  Call to Action
</button>

{/* Bouton Tertiaire - Violet */}
<button className="btn-brand-tertiary">
  Premium Feature
</button>
```

### 2. Hero Section / Landing Page

#### AVANT
```tsx
<div className="bg-primary">
  {/* Hero content */}
</div>
```

#### APRÈS
```tsx
<div className="bg-[var(--color-brand-green)]">
  {/* Hero content avec accent or */}
  <button className="bg-[var(--color-brand-gold)] text-slate-900">
    Commencer Gratuitement
  </button>
</div>
```

### 3. Navigation / Sidebar

#### Mise à jour des couleurs actives

```tsx
{/* Lien actif - Vert */}
<Link
  className={cn(
    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
    isActive
      ? "bg-[var(--green-100)] text-[var(--green-700)]"
      : "text-slate-600 hover:bg-slate-100"
  )}
>
  <Icon />
  <span>Dashboard</span>
</Link>
```

### 4. Cartes / Cards

```tsx
<div className="card-brand p-6">
  <h3 className="text-xl font-semibold text-slate-900 mb-2">
    Titre de la Carte
  </h3>
  <p className="text-slate-600">
    Description avec bon contraste
  </p>

  {/* Badge succès avec vert */}
  <span className="badge-brand-success">
    Actif
  </span>
</div>
```

### 5. Formulaires / Inputs

```tsx
<div className="form-control">
  <label className="label">
    <span className="label-text font-semibold text-slate-900">
      Adresse e-mail
    </span>
  </label>

  <input
    type="email"
    className="input-brand w-full"
    placeholder="nom.prenom@entreprise.com"
  />
</div>
```

---

## 🎨 CONTEXTES D'UTILISATION

### Dashboard Candidat

**Palette Principale** : Vert + Or + Slate

```tsx
{/* Header avec vert */}
<header className="bg-[var(--color-brand-green)] text-white">
  <h1>Mon Profil</h1>
</header>

{/* CTA avec or */}
<button className="btn-brand-secondary">
  Postuler Maintenant
</button>

{/* Statistiques avec succès vert */}
<div className="bg-[var(--success-light)] text-[var(--success-dark)] rounded-lg p-4">
  <span className="text-2xl font-bold">12</span>
  <span>Candidatures envoyées</span>
</div>
```

### Dashboard Employeur

**Palette Principale** : Or + Vert + Violet (premium)

```tsx
{/* Bouton principal - Or pour action forte */}
<button className="btn-brand-secondary">
  Publier une Offre
</button>

{/* Fonctionnalité premium - Violet */}
<div className="border-2 border-[var(--color-brand-violet)] rounded-xl p-6">
  <span className="badge-brand-info">Premium</span>
  <h3>Matching IA Avancé</h3>
</div>

{/* Stats avec vert */}
<div className="bg-[var(--green-50)] border border-[var(--green-200)] rounded-lg p-4">
  <span>45 candidats qualifiés</span>
</div>
```

### Landing Page

**Sections avec alternance**

```tsx
{/* Hero - Vert avec CTA Or */}
<section className="bg-[var(--color-brand-green)] text-white">
  <h1>INTOWORK</h1>
  <p>The best now!</p>
  <button className="btn-brand-secondary">
    Commencer Gratuitement
  </button>
</section>

{/* Features - Blanc avec accents vert */}
<section className="bg-white">
  <div className="text-[var(--color-brand-green)]">
    {/* Icônes et titres en vert */}
  </div>
</section>

{/* CTA Final - Or avec contraste */}
<section className="bg-[var(--color-brand-gold)] text-slate-900">
  <h2>Prêt à transformer votre recrutement ?</h2>
  <button className="bg-[var(--color-brand-green)] text-white">
    Démarrer Maintenant
  </button>
</section>
```

---

## 🎯 MIGRATIONS PRIORITAIRES

### Phase 1 : Composants Critiques (1-2h)

1. **Landing page** (`/frontend/src/app/page.tsx`)
   - Hero section : `bg-primary` → `bg-[var(--color-brand-green)]`
   - CTA buttons : utiliser `btn-brand-secondary` (or)
   - Features icons : `text-primary` → `text-[var(--color-brand-green)]`

2. **Navigation** (`/frontend/src/components/Sidebar.tsx`)
   - Active links : utiliser `bg-[var(--green-100)]` et `text-[var(--green-700)]`
   - Hover states : `hover:bg-[var(--green-50)]`

3. **Boutons principaux** (recherche globale)
   - Remplacer `bg-primary` par `bg-[var(--color-brand-green)]`
   - Ajouter classes `btn-brand-*` où approprié

### Phase 2 : Pages d'Authentification (1h)

Fichiers :
- `/frontend/src/app/auth/signin/page.tsx`
- `/frontend/src/app/auth/signup/page.tsx`
- `/frontend/src/app/auth/forgot-password/page.tsx`
- `/frontend/src/app/auth/reset-password/page.tsx`

**Changements** :
```tsx
{/* Panel gauche - Vert au lieu de purple */}
<div className="bg-[var(--color-brand-green)]">
  {/* Contenu avec overlay */}
</div>

{/* Boutons - Or pour CTA principal */}
<button className="btn-brand-secondary">
  Se connecter
</button>

{/* Liens - Vert */}
<Link className="text-[var(--color-brand-green)] hover:text-[var(--green-600)]">
  Mot de passe oublié ?
</Link>
```

### Phase 3 : Dashboard Components (2-3h)

1. **Dashboard Layout** (`/frontend/src/components/DashboardLayout.tsx`)
2. **Stats Cards** - utiliser palette selon contexte
3. **Job Cards** - bordure verte pour actif
4. **Application Status Badges** - utiliser classes `badge-brand-*`

### Phase 4 : Détails et Polish (1-2h)

1. Toasts / Notifications : mettre à jour couleurs de succès/erreur
2. Modals : bordures et headers avec vert
3. Formulaires : utiliser `input-brand` partout
4. Animations : vérifier que les classes `animate-*` fonctionnent

---

## 🧪 TESTS DE VALIDATION

### Checklist Visuelle

- [ ] Logo INTOWORK s'affiche correctement sur tous les fonds
- [ ] Couleurs principales utilisent vert/or/violet au lieu de purple/coral
- [ ] Contrastes WCAG AA respectés (minimum 4.5:1)
- [ ] Hover states clairement visibles
- [ ] Focus states avec outline visible
- [ ] Responsive fonctionne sur mobile/tablet/desktop
- [ ] Animations fluides (300ms)
- [ ] Pas de clignotement ou flash de couleur au chargement

### Tests d'Accessibilité

```bash
# Utiliser axe DevTools ou Lighthouse
npm run build
npm start

# Tester avec lecteur d'écran
# Vérifier navigation au clavier (Tab, Enter, Espace)
# Tester contraste avec WebAIM Contrast Checker
```

### Tests de Performance

```bash
# Vérifier que les nouvelles classes CSS n'augmentent pas le bundle
npm run build

# Comparer tailles avant/après
ls -lh .next/static/css/
```

---

## 🔧 TAILWIND CONFIG (Optionnel)

Si vous voulez utiliser des classes Tailwind personnalisées :

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'brand': {
          green: '#6B9B5F',
          gold: '#F7C700',
          violet: '#6B46C1',
        },
        'green': {
          50: '#F4F7F3',
          100: '#E6EFE4',
          200: '#C8DBC3',
          300: '#A3C599',
          400: '#84AD77',
          500: '#6B9B5F',
          600: '#5A8150',
          700: '#496842',
          800: '#3A5335',
          900: '#2B3E28',
        },
        'gold': {
          50: '#FFFDF0',
          100: '#FEF9DB',
          200: '#FDF1B3',
          300: '#FCE680',
          400: '#FAD944',
          500: '#F7C700',
          600: '#D4A800',
          700: '#B08900',
          800: '#8C6C00',
          900: '#685000',
        },
      },
    },
  },
}
```

Puis utiliser :
```tsx
<button className="bg-brand-green hover:bg-green-600">
  Bouton
</button>
```

---

## 🐛 PROBLÈMES COURANTS

### Problème 1 : Les couleurs ne changent pas

**Cause** : Cache CSS ou import manquant

**Solution** :
```bash
# Vider le cache Next.js
rm -rf .next
npm run dev
```

### Problème 2 : Contraste insuffisant

**Cause** : Utilisation de couleurs claires sur fond clair

**Solution** : Utiliser les variantes foncées
```tsx
{/* ❌ Mauvais - contraste insuffisant */}
<p className="text-[var(--green-400)]">Texte</p>

{/* ✅ Bon - contraste suffisant */}
<p className="text-[var(--green-700)]">Texte</p>
```

### Problème 3 : DaisyUI override ne fonctionne pas

**Cause** : Ordre des imports CSS

**Solution** : S'assurer que `brand-colors.css` est importé APRÈS DaisyUI dans `globals.css`

```css
/* globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Importer après les layers Tailwind */
@import '../styles/brand-colors.css';
```

### Problème 4 : Les animations ne fonctionnent pas

**Cause** : Classes d'animation non appliquées

**Solution** : Vérifier que les classes sont dans le markup
```tsx
<div className="animate-fade-in animation-delay-200">
  Contenu animé
</div>
```

---

## 📊 SUIVI DE MIGRATION

### Fichiers Migrés

- [ ] `/frontend/src/app/page.tsx` (Landing page)
- [ ] `/frontend/src/app/auth/signin/page.tsx`
- [ ] `/frontend/src/app/auth/signup/page.tsx`
- [ ] `/frontend/src/app/auth/forgot-password/page.tsx`
- [ ] `/frontend/src/app/auth/reset-password/page.tsx`
- [ ] `/frontend/src/components/Sidebar.tsx`
- [ ] `/frontend/src/components/DashboardLayout.tsx`
- [ ] `/frontend/src/app/dashboard/page.tsx`
- [ ] `/frontend/src/app/dashboard/candidates/*`
- [ ] `/frontend/src/app/dashboard/job-posts/*`
- [ ] `/frontend/src/app/dashboard/company/*`
- [ ] `/frontend/src/app/dashboard/jobs/*`
- [ ] `/frontend/src/app/dashboard/settings/*`

### Composants à Créer

- [ ] `<BrandButton variant="primary|secondary|tertiary" />`
- [ ] `<BrandCard />`
- [ ] `<BrandBadge status="success|warning|error|info" />`
- [ ] `<BrandInput />`
- [ ] `<BrandLogo size="sm|md|lg|xl" variant="full|icon" />`

---

## 🎨 RESSOURCES SUPPLÉMENTAIRES

### Outils

- **Color Picker** : Use DevTools pour extraire couleurs exactes du logo
- **Contrast Checker** : https://webaim.org/resources/contrastchecker/
- **Sanzo Wada Reference** : https://sanzo-wada.dada.pink/

### Documentation

- Charte complète : `/docs/design/CHARTE_GRAPHIQUE.md`
- Variables CSS : `/frontend/src/styles/brand-colors.css`
- Design system Figma : (à créer)

### Support

Pour questions ou clarifications, référencer :
1. La charte graphique officielle
2. Les logos dans `/home/jdtkd/Téléchargements/PNG VERT.png`
3. Les exemples dans ce guide

---

**Version** : 1.0.0
**Date** : 2026-01-13
**Dernière mise à jour** : Guide initial basé sur nouveau logo
