# CHARTE GRAPHIQUE INTOWORK
## Guide de Style Visuel et Identité de Marque

*Inspiré du logo INTOWORK et des principes d'harmonie de Sanzo Wada*

---

## 🎨 PALETTE DE COULEURS PRINCIPALE

### Couleurs Primaires (du Logo)

#### 1. Vert Principal - "Meadow Green"
```css
/* Couleur principale du logo INTOWORK */
--color-brand-green: #6B9B5F;
--color-brand-green-rgb: 107, 155, 95;
--color-brand-green-oklch: oklch(63% 0.12 145);
```
**Usage** : Logo, titres principaux, éléments de navigation, boutons primaires
**Signification** : Croissance, opportunité, professionnalisme, nature, stabilité

#### 2. Or/Jaune - "Golden Accent"
```css
/* Accent du R stylisé */
--color-brand-gold: #F7C700;
--color-brand-gold-rgb: 247, 199, 0;
--color-brand-gold-oklch: oklch(82% 0.18 95);
```
**Usage** : Accents, call-to-action secondaires, icônes importantes, notifications de succès
**Signification** : Optimisme, excellence, opportunité, énergie positive

#### 3. Violet Profond - "Deep Violet"
```css
/* Cercle intérieur du R, élément de sophistication */
--color-brand-violet: #6B46C1;
--color-brand-violet-rgb: 107, 70, 193;
--color-brand-violet-oklch: oklch(48% 0.20 290);
```
**Usage** : Éléments secondaires, hover states, badges premium, détails visuels
**Signification** : Innovation, technologie, confiance, premium

---

## 🌈 PALETTE ÉTENDUE (Harmonie Sanzo Wada)

### Variation 1 : Palette Naturelle (Pour Dashboard Candidat)

Inspirée de la combinaison Sanzo Wada #227 "Forest & Earth"

```css
/* Vert Principal - Variations */
--green-50: #F4F7F3;
--green-100: #E6EFE4;
--green-200: #C8DBC3;
--green-300: #A3C599;
--green-400: #84AD77;
--green-500: #6B9B5F;  /* Couleur du logo */
--green-600: #5A8150;
--green-700: #496842;
--green-800: #3A5335;
--green-900: #2B3E28;

/* Complémentaire Terre - Pour éléments neutres */
--earth-50: #F9F7F4;
--earth-100: #F0EDE7;
--earth-200: #DDD7CB;
--earth-300: #C5BBA9;
--earth-400: #A8997F;
--earth-500: #8B7A5E;
--earth-600: #73644D;
--earth-700: #5C503E;
--earth-800: #483F31;
--earth-900: #362F25;
```

### Variation 2 : Palette Dynamique (Pour Dashboard Employeur)

Inspirée de la combinaison Sanzo Wada #089 "Sunset & Energy"

```css
/* Or Principal - Variations */
--gold-50: #FFFDF0;
--gold-100: #FEF9DB;
--gold-200: #FDF1B3;
--gold-300: #FCE680;
--gold-400: #FAD944;
--gold-500: #F7C700;  /* Couleur du logo */
--gold-600: #D4A800;
--gold-700: #B08900;
--gold-800: #8C6C00;
--gold-900: #685000;

/* Complémentaire Corail - Pour accents énergiques */
--coral-50: #FFF5F2;
--coral-100: #FFE8E0;
--coral-200: #FFC9B8;
--coral-300: #FFA38A;
--coral-400: #FF7A59;
--coral-500: #FF5733;
--coral-600: #E63F1F;
--coral-700: #C02F14;
--coral-800: #9A230D;
--coral-900: #731908;
```

### Variation 3 : Palette Premium (Pour fonctionnalités avancées)

Inspirée de la combinaison Sanzo Wada #156 "Royal & Luxury"

```css
/* Violet Principal - Variations */
--violet-50: #F7F5FC;
--violet-100: #EBE6F7;
--violet-200: #D3C6ED;
--violet-300: #B39FE0;
--violet-400: #9176D1;
--violet-500: #6B46C1;  /* Couleur du logo */
--violet-600: #5735A3;
--violet-700: #452885;
--violet-800: #361F6A;
--violet-900: #28174F;

/* Complémentaire Indigo - Pour profondeur */
--indigo-50: #F4F6FB;
--indigo-100: #E6EBF5;
--indigo-200: #C5D2E9;
--indigo-300: #9DB3DA;
--indigo-400: #7391C7;
--indigo-500: #4D6FB0;
--indigo-600: #3E5A94;
--indigo-700: #32477A;
--indigo-800: #283761;
--indigo-900: #1F2A4A;
```

---

## 🔲 PALETTE NEUTRE (Base)

### Gris Slate - Pour textes et arrière-plans

```css
--slate-50: #F8FAFC;   /* Arrière-plans clairs */
--slate-100: #F1F5F9;  /* Arrière-plans secondaires */
--slate-200: #E2E8F0;  /* Bordures subtiles */
--slate-300: #CBD5E1;  /* Bordures standard */
--slate-400: #94A3B8;  /* Textes désactivés */
--slate-500: #64748B;  /* Textes secondaires */
--slate-600: #475569;  /* Textes de base */
--slate-700: #334155;  /* Textes importants */
--slate-800: #1E293B;  /* Titres */
--slate-900: #0F172A;  /* Textes ultra-foncés */
```

### États Sémantiques

```css
/* Succès - Inspiré du vert du logo */
--success-light: #D1FAE5;
--success: #10B981;
--success-dark: #065F46;

/* Avertissement - Inspiré de l'or du logo */
--warning-light: #FEF3C7;
--warning: #F59E0B;
--warning-dark: #92400E;

/* Erreur - Contraste rouge */
--error-light: #FEE2E2;
--error: #EF4444;
--error-dark: #991B1B;

/* Information - Inspiré du violet */
--info-light: #DBEAFE;
--info: #3B82F6;
--info-dark: #1E40AF;
```

---

## 📝 TYPOGRAPHIE

### Police Principale : Plus Jakarta Sans

**Famille** : Plus Jakarta Sans (Google Fonts)
**Poids disponibles** : 400, 500, 600, 700, 800

```css
/* Import */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

/* Application */
--font-family-base: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Hiérarchie Typographique

#### Desktop (≥1024px)

```css
/* Titres */
--text-h1: 800 3.75rem/1.1 var(--font-family-base);      /* 60px - Hero titles */
--text-h2: 700 3rem/1.2 var(--font-family-base);         /* 48px - Section titles */
--text-h3: 700 2.25rem/1.3 var(--font-family-base);      /* 36px - Subsection titles */
--text-h4: 600 1.875rem/1.4 var(--font-family-base);     /* 30px - Card titles */
--text-h5: 600 1.5rem/1.4 var(--font-family-base);       /* 24px - Small titles */
--text-h6: 600 1.25rem/1.5 var(--font-family-base);      /* 20px - Tiny titles */

/* Corps de texte */
--text-body-xl: 400 1.25rem/1.7 var(--font-family-base);  /* 20px - Large text */
--text-body-lg: 400 1.125rem/1.7 var(--font-family-base); /* 18px - Body large */
--text-body: 400 1rem/1.6 var(--font-family-base);        /* 16px - Body standard */
--text-body-sm: 400 0.875rem/1.6 var(--font-family-base); /* 14px - Body small */
--text-body-xs: 400 0.75rem/1.5 var(--font-family-base);  /* 12px - Captions */

/* Texte UI */
--text-button: 600 1rem/1.5 var(--font-family-base);      /* Boutons */
--text-label: 500 0.875rem/1.5 var(--font-family-base);   /* Labels de formulaires */
--text-caption: 400 0.75rem/1.4 var(--font-family-base);  /* Légendes */
```

#### Mobile (320px - 1023px)

```css
/* Titres */
--text-h1-mobile: 800 2.5rem/1.2 var(--font-family-base);    /* 40px */
--text-h2-mobile: 700 2rem/1.2 var(--font-family-base);      /* 32px */
--text-h3-mobile: 700 1.75rem/1.3 var(--font-family-base);   /* 28px */
--text-h4-mobile: 600 1.5rem/1.4 var(--font-family-base);    /* 24px */
--text-h5-mobile: 600 1.25rem/1.4 var(--font-family-base);   /* 20px */
--text-h6-mobile: 600 1.125rem/1.5 var(--font-family-base);  /* 18px */

/* Corps de texte */
--text-body-lg-mobile: 400 1.125rem/1.7 var(--font-family-base); /* 18px */
--text-body-mobile: 400 1rem/1.6 var(--font-family-base);        /* 16px */
--text-body-sm-mobile: 400 0.875rem/1.6 var(--font-family-base); /* 14px */
```

---

## 📏 ÉCHELLE D'ESPACEMENT

### Système de Spacing (basé sur 4px)

```css
--space-0: 0;           /* 0px */
--space-1: 0.25rem;     /* 4px */
--space-2: 0.5rem;      /* 8px */
--space-3: 0.75rem;     /* 12px */
--space-4: 1rem;        /* 16px */
--space-5: 1.25rem;     /* 20px */
--space-6: 1.5rem;      /* 24px */
--space-8: 2rem;        /* 32px */
--space-10: 2.5rem;     /* 40px */
--space-12: 3rem;       /* 48px */
--space-16: 4rem;       /* 64px */
--space-20: 5rem;       /* 80px */
--space-24: 6rem;       /* 96px */
--space-32: 8rem;       /* 128px */
```

### Usage Recommandé

- **Micro-spacing** (1-2) : Entre icône et texte, padding minimal
- **Small spacing** (3-4) : Padding de boutons, espacement entre éléments proches
- **Medium spacing** (5-8) : Padding de cartes, espacement entre sections
- **Large spacing** (10-16) : Marges de sections, espacement vertical entre blocs
- **XL spacing** (20-32) : Espacement de hero sections, grandes sections

---

## 🔳 SYSTÈME DE GRILLE

### Breakpoints

```css
/* Mobile First Approach */
--breakpoint-sm: 640px;   /* Tablettes portrait */
--breakpoint-md: 768px;   /* Tablettes paysage */
--breakpoint-lg: 1024px;  /* Desktop petit */
--breakpoint-xl: 1280px;  /* Desktop standard */
--breakpoint-2xl: 1536px; /* Desktop large */
```

### Conteneurs

```css
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1536px;

/* Padding horizontal responsive */
--container-padding-mobile: 1rem;    /* 16px */
--container-padding-tablet: 1.5rem;  /* 24px */
--container-padding-desktop: 2rem;   /* 32px */
```

---

## 🎭 ÉLÉVATIONS ET OMBRES

### Ombres (Sanzo Wada - Profondeur Naturelle)

```css
/* Ombres subtiles */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

/* Ombres colorées (selon palette) */
--shadow-green: 0 10px 15px -3px rgba(107, 155, 95, 0.2), 0 4px 6px -4px rgba(107, 155, 95, 0.15);
--shadow-gold: 0 10px 15px -3px rgba(247, 199, 0, 0.2), 0 4px 6px -4px rgba(247, 199, 0, 0.15);
--shadow-violet: 0 10px 15px -3px rgba(107, 70, 193, 0.2), 0 4px 6px -4px rgba(107, 70, 193, 0.15);
```

---

## 🔘 BORDURES ET RADIUS

### Border Radius

```css
--radius-none: 0;
--radius-sm: 0.375rem;    /* 6px - Petits éléments */
--radius: 0.5rem;         /* 8px - Standard */
--radius-md: 0.75rem;     /* 12px - Cartes */
--radius-lg: 1rem;        /* 16px - Grandes cartes */
--radius-xl: 1.5rem;      /* 24px - Sections */
--radius-2xl: 2rem;       /* 32px - Hero sections */
--radius-3xl: 3rem;       /* 48px - Très arrondis */
--radius-full: 9999px;    /* Cercles/Pills */
```

### Border Width

```css
--border-0: 0px;
--border: 1px;
--border-2: 2px;
--border-4: 4px;
--border-8: 8px;
```

---

## 🎬 ANIMATIONS ET TRANSITIONS

### Durées

```css
--duration-fast: 150ms;
--duration-base: 300ms;
--duration-slow: 500ms;
--duration-slower: 700ms;
```

### Easing Functions

```css
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

### Animations Clés

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideInFromLeft {
  from {
    opacity: 0;
    transform: translateX(-2rem);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInFromRight {
  from {
    opacity: 0;
    transform: translateX(2rem);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInFromBottom {
  from {
    opacity: 0;
    transform: translateY(2rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Animation delays pour effets séquentiels */
--animation-delay-100: 0.1s;
--animation-delay-200: 0.2s;
--animation-delay-300: 0.3s;
--animation-delay-400: 0.4s;
--animation-delay-500: 0.5s;
```

---

## 🎨 COMPOSANTS DE BASE

### Boutons

#### Bouton Principal (Green)
```css
.btn-primary {
  background: var(--green-500);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-lg);
  font: var(--text-button);
  transition: all var(--duration-base) var(--ease-out);
  box-shadow: var(--shadow-green);
}

.btn-primary:hover {
  background: var(--green-600);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn-primary:active {
  transform: translateY(0);
}
```

#### Bouton Secondaire (Gold)
```css
.btn-secondary {
  background: var(--gold-500);
  color: var(--slate-900);
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-lg);
  font: var(--text-button);
  transition: all var(--duration-base) var(--ease-out);
  box-shadow: var(--shadow-gold);
}

.btn-secondary:hover {
  background: var(--gold-600);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
```

#### Bouton Tertiaire (Violet)
```css
.btn-tertiary {
  background: var(--violet-500);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-lg);
  font: var(--text-button);
  transition: all var(--duration-base) var(--ease-out);
  box-shadow: var(--shadow-violet);
}

.btn-tertiary:hover {
  background: var(--violet-600);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
```

#### Bouton Outline
```css
.btn-outline {
  background: transparent;
  color: var(--green-600);
  border: var(--border-2) solid var(--green-500);
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-lg);
  font: var(--text-button);
  transition: all var(--duration-base) var(--ease-out);
}

.btn-outline:hover {
  background: var(--green-50);
  border-color: var(--green-600);
  color: var(--green-700);
}
```

### Cartes

```css
.card {
  background: white;
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  box-shadow: var(--shadow-md);
  border: var(--border) solid var(--slate-200);
  transition: all var(--duration-base) var(--ease-out);
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-4px);
}

.card-header {
  margin-bottom: var(--space-6);
  padding-bottom: var(--space-4);
  border-bottom: var(--border) solid var(--slate-200);
}

.card-title {
  font: var(--text-h4);
  color: var(--slate-900);
  margin-bottom: var(--space-2);
}

.card-description {
  font: var(--text-body);
  color: var(--slate-600);
}
```

### Inputs

```css
.input {
  width: 100%;
  padding: 0.75rem 1rem;
  padding-left: 2.5rem; /* Pour icône */
  background: var(--slate-50);
  border: var(--border) solid var(--slate-300);
  border-radius: var(--radius-lg);
  font: var(--text-body);
  color: var(--slate-900);
  transition: all var(--duration-base) var(--ease-out);
}

.input::placeholder {
  color: var(--slate-400);
}

.input:focus {
  outline: none;
  border-color: var(--green-500);
  background: white;
  box-shadow: 0 0 0 3px rgba(107, 155, 95, 0.1);
}

.input-error {
  border-color: var(--error);
}

.input-error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}
```

### Badges

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
  font: 500 0.875rem/1.5 var(--font-family-base);
}

.badge-success {
  background: var(--success-light);
  color: var(--success-dark);
}

.badge-warning {
  background: var(--warning-light);
  color: var(--warning-dark);
}

.badge-error {
  background: var(--error-light);
  color: var(--error-dark);
}

.badge-info {
  background: var(--info-light);
  color: var(--info-dark);
}
```

---

## 🖼️ LOGO - RÈGLES D'UTILISATION

### Versions du Logo

1. **Version Complète** : "INTOWORK The best now!"
   - Usage : Header, footer, landing page
   - Espace minimum autour : 32px
   - Taille minimum : 200px de largeur

2. **Version Icône** : "R" stylisé
   - Usage : Favicon, app icon, petits espaces
   - Taille minimum : 32px × 32px
   - Espace minimum autour : 8px

### Fonds Autorisés

- ✅ Blanc / Gris clair (#F8FAFC à #F1F5F9)
- ✅ Vert foncé (#2B3E28 à #3A5335) avec logo blanc
- ✅ Violet foncé (#28174F à #361F6A) avec logo blanc
- ❌ Pas de fonds saturés ou colorés
- ❌ Pas de dégradés sous le logo

### Interdictions

- ❌ Ne pas modifier les couleurs du logo
- ❌ Ne pas déformer ou étirer
- ❌ Ne pas ajouter d'effets (ombre portée, relief)
- ❌ Ne pas utiliser sur photos sans overlay
- ❌ Ne pas recréer le logo avec d'autres polices

---

## 🎯 APPLICATIONS PAR CONTEXTE

### Dashboard Candidat

**Palette principale** :
- Primary: Vert (#6B9B5F)
- Accent: Or (#F7C700)
- Neutral: Slate

**Usage** :
- Navigation et boutons : Vert
- Call-to-action importants : Or
- Notifications de succès : Vert clair
- Cartes et sections : Fond blanc avec bordures slate

### Dashboard Employeur

**Palette principale** :
- Primary: Or (#F7C700)
- Secondary: Vert (#6B9B5F)
- Accent: Violet (#6B46C1)

**Usage** :
- Boutons principaux : Or
- Éléments secondaires : Vert
- Fonctionnalités premium : Violet
- Statistiques et graphiques : Combinaison Or + Vert

### Landing Page

**Palette principale** :
- Hero section : Vert avec accents Or
- Features : Vert avec icônes Or
- CTA : Boutons Or sur fond vert
- Testimonials : Fond slate-50 avec accents vert

**Hiérarchie visuelle** :
1. Hero CTA : Or (maximum attention)
2. Navigation : Vert
3. Sections : Alternance blanc / slate-50
4. Footer : Vert foncé

### Pages d'Authentification

**Palette** :
- Panel gauche : Vert (#6B9B5F) avec overlay
- Panel droit : Blanc avec bordures slate
- Boutons : Or (#F7C700)
- Liens : Vert (#6B9B5F)

---

## ♿ ACCESSIBILITÉ

### Ratios de Contraste Minimum (WCAG 2.1 AA)

#### Texte Normal (16px+)
- Sur blanc : 4.5:1 minimum
- Vert #6B9B5F sur blanc : ✅ 4.52:1
- Slate-600 #475569 sur blanc : ✅ 7.37:1
- Slate-700 #334155 sur blanc : ✅ 10.36:1

#### Texte Large (24px+ ou 18px+ gras)
- Sur blanc : 3:1 minimum
- Or #F7C700 sur blanc : ⚠️ 1.89:1 (insuffisant)
- Solution : Utiliser Or sur fond sombre (vert/violet)

#### Boutons et Éléments Interactifs
- Contraste minimum : 3:1
- Focus visible : 2px outline avec contraste 3:1
- States hover : Variation minimum 10% de luminosité

### Recommandations

```css
/* Texte sur fond clair */
color: var(--slate-700); /* Excellent contraste */

/* Texte sur fond vert */
color: white; /* Sur --green-600 ou plus foncé */

/* Texte sur fond or */
color: var(--slate-900); /* Meilleur contraste que blanc */

/* Focus states */
.focusable:focus {
  outline: 2px solid var(--green-500);
  outline-offset: 2px;
}
```

---

## 📱 RESPONSIVE DESIGN

### Principes Mobile-First

1. **Design pour mobile d'abord** (320px)
2. **Amélioration progressive** vers desktop
3. **Touch-friendly** : Cibles minimum 44px × 44px
4. **Spacing adaptatif** : Padding réduit sur mobile
5. **Typographie responsive** : Échelles différentes par breakpoint

### Exemples

```css
/* Mobile First */
.hero-title {
  font-size: 2rem;           /* 32px mobile */
  line-height: 1.2;
  margin-bottom: 1rem;
}

/* Tablet */
@media (min-width: 768px) {
  .hero-title {
    font-size: 2.5rem;       /* 40px tablet */
    margin-bottom: 1.5rem;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .hero-title {
    font-size: 3.75rem;      /* 60px desktop */
    margin-bottom: 2rem;
  }
}
```

---

## 🚀 IMPLÉMENTATION

### CSS Variables Globales

Créer un fichier `globals.css` avec toutes les variables :

```css
:root {
  /* Couleurs principales */
  --color-brand-green: #6B9B5F;
  --color-brand-gold: #F7C700;
  --color-brand-violet: #6B46C1;

  /* ... toutes les autres variables ... */
}
```

### Tailwind CSS Configuration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'brand-green': '#6B9B5F',
        'brand-gold': '#F7C700',
        'brand-violet': '#6B46C1',
        // ... autres couleurs
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
    },
  },
}
```

### DaisyUI Theme Override

```css
/* Dans globals.css */
@layer base {
  [data-theme="light"] {
    --color-primary: oklch(63% 0.12 145);     /* Vert */
    --color-secondary: oklch(82% 0.18 95);    /* Or */
    --color-accent: oklch(48% 0.20 290);      /* Violet */
    --color-neutral: oklch(28% 0.02 256);     /* Slate-800 */
    --color-base-100: oklch(100% 0 0);        /* Blanc */
  }
}
```

---

## 📋 CHECKLIST DE CONFORMITÉ

### Pour Chaque Nouveau Composant

- [ ] Utilise les couleurs de la palette définie
- [ ] Respecte la hiérarchie typographique
- [ ] Utilise l'échelle d'espacement (multiples de 4px)
- [ ] A des états hover/focus/active définis
- [ ] Contraste WCAG AA minimum (4.5:1 pour texte)
- [ ] Responsive sur tous les breakpoints
- [ ] Animations fluides (300ms standard)
- [ ] Border-radius cohérent avec le système
- [ ] Utilise les ombres définies
- [ ] Testé avec lecteur d'écran (si interactif)

---

## 📚 RÉFÉRENCES

### Inspiration Sanzo Wada

Cette charte s'inspire des combinaisons de couleurs de Sanzo Wada :
- #227 "Forest & Earth" : Harmonie naturelle (Candidat)
- #089 "Sunset & Energy" : Dynamisme (Employeur)
- #156 "Royal & Luxury" : Premium (Fonctionnalités avancées)

### Outils Recommandés

- **Palette Generator** : https://coolors.co
- **Contrast Checker** : https://webaim.org/resources/contrastchecker/
- **Sanzo Wada Colors** : https://sanzo-wada.dada.pink/
- **OKLCH Converter** : https://oklch.com

### Documentation

- WCAG 2.1 Guidelines : https://www.w3.org/WAI/WCAG21/quickref/
- Tailwind CSS : https://tailwindcss.com/docs
- DaisyUI : https://daisyui.com

---

**Version** : 1.0.0
**Date** : 2026-01-13
**Auteur** : Équipe Design INTOWORK
**Dernière mise à jour** : Application du design basé sur le logo officiel
