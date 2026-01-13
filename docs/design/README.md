# 🎨 DESIGN SYSTEM INTOWORK

Documentation complète du système de design basé sur le logo officiel INTOWORK.

---

## 📚 DOCUMENTATION

### 1. [CHARTE GRAPHIQUE](./CHARTE_GRAPHIQUE.md)
**Document principal - 150+ pages**

Charte graphique complète inspirée du logo INTOWORK et des harmonies de couleurs Sanzo Wada.

**Contenu** :
- 🎨 Palette de couleurs (Vert, Or, Violet + variations)
- 📝 Typographie (Plus Jakarta Sans)
- 📏 Échelle d'espacement
- 🎭 Élévations et ombres
- 🔘 Bordures et radius
- 🎬 Animations et transitions
- 🎯 Composants de base (boutons, cartes, inputs, badges)
- 🖼️ Règles d'utilisation du logo
- 🎨 Applications par contexte (Dashboard, Landing, Auth)
- ♿ Accessibilité WCAG 2.1 AA
- 📱 Responsive design

**Quand l'utiliser** : Référence complète pour tous les aspects du design

---

### 2. [GUIDE D'IMPLÉMENTATION](./GUIDE_IMPLEMENTATION.md)
**Guide pratique - 50+ pages**

Guide pas-à-pas pour appliquer la charte graphique sur le projet existant.

**Contenu** :
- 🚀 Démarrage rapide (3 étapes)
- 📋 Migration par composant (avant/après)
- 🎯 Migrations prioritaires (Phase 1-4)
- 🧪 Tests de validation
- 🔧 Configuration Tailwind/DaisyUI
- 🐛 Problèmes courants et solutions
- 📊 Suivi de migration (checklist)

**Quand l'utiliser** : Pour implémenter la charte sur des pages/composants existants

---

## 💻 CODE

### 3. [Variables CSS](../../frontend/src/styles/brand-colors.css)
**Fichier CSS prêt à l'emploi**

Toutes les variables CSS définies et prêtes à importer.

**Contenu** :
- Variables de couleurs (tous les variants)
- Variables typographiques
- Variables d'espacement
- Variables d'ombres
- Variables de bordures
- Animations keyframes
- Classes utilitaires
- Override DaisyUI

**Utilisation** :
```css
/* Dans globals.css */
@import '../styles/brand-colors.css';
```

---

### 4. [Composants React](../../frontend/src/components/brand/BrandComponents.tsx)
**Composants TypeScript réutilisables**

Bibliothèque de composants React conformes à la charte graphique.

**Composants disponibles** :
- `<BrandButton>` - Boutons avec variants (primary, secondary, tertiary, outline)
- `<BrandCard>` - Cartes avec variants (default, elevated, bordered)
- `<BrandCardHeader>` - Header de carte avec titre et action
- `<BrandBadge>` - Badges colorés (success, warning, error, info)
- `<BrandInput>` - Inputs stylisés avec icônes et états
- `<BrandLogo>` - Logo INTOWORK (full, icon)
- `<BrandSection>` - Sections avec backgrounds
- `<BrandContainer>` - Conteneurs responsives
- `<BrandStatCard>` - Cartes de statistiques

**Utilisation** :
```tsx
import { BrandButton, BrandCard } from '@/components/brand/BrandComponents';

<BrandButton variant="primary" size="lg">
  Action Principale
</BrandButton>
```

---

### 5. [Exemples React](../../frontend/src/components/brand/BrandExamples.tsx)
**Exemples d'implémentation**

Exemples complets montrant comment utiliser les composants dans différents contextes.

**Exemples disponibles** :
- `<ButtonExamples>` - Tous les types de boutons
- `<CardExamples>` - Variations de cartes
- `<FormExamples>` - Formulaires complets
- `<StatsExamples>` - Tableaux de bord statistiques
- `<HeroExample>` - Hero section landing page
- `<DashboardCandidateExample>` - Dashboard candidat complet
- `<AuthPageExample>` - Page d'authentification complète

**Utilisation** :
```tsx
import { HeroExample } from '@/components/brand/BrandExamples';

// Voir l'exemple en action
<HeroExample />
```

---

## 🎨 PALETTE DE COULEURS

### Couleurs Principales (du Logo)

| Couleur | HEX | RGB | OKLCH | Usage |
|---------|-----|-----|-------|-------|
| **Vert** | `#6B9B5F` | `107, 155, 95` | `oklch(63% 0.12 145)` | Primary, Logo, Navigation |
| **Or** | `#F7C700` | `247, 199, 0` | `oklch(82% 0.18 95)` | Accent, CTA, Highlights |
| **Violet** | `#6B46C1` | `107, 70, 193` | `oklch(48% 0.20 290)` | Premium, Hover, Details |

### Palettes Étendues

- **Vert** : 9 nuances (50-900) pour hiérarchie naturelle
- **Or** : 9 nuances (50-900) pour énergie dynamique
- **Violet** : 9 nuances (50-900) pour fonctionnalités premium
- **Slate** : 9 nuances (50-900) pour neutralité
- **Terre** : 9 nuances (50-900) pour complémentarité naturelle
- **Corail** : 9 nuances (50-900) pour accents énergiques
- **Indigo** : 9 nuances (50-900) pour profondeur

---

## 📝 TYPOGRAPHIE

### Police : Plus Jakarta Sans

**Poids disponibles** : 400, 500, 600, 700, 800

**Import** :
```tsx
import { Plus_Jakarta_Sans } from 'next/font/google';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
});
```

### Hiérarchie

- **H1** : 60px / 800 (Hero titles)
- **H2** : 48px / 700 (Section titles)
- **H3** : 36px / 700 (Subsection titles)
- **H4** : 30px / 600 (Card titles)
- **H5** : 24px / 600 (Small titles)
- **H6** : 20px / 600 (Tiny titles)
- **Body** : 16px / 400 (Standard text)
- **Caption** : 12px / 400 (Small text)

---

## 🎯 CONTEXTES D'UTILISATION

### Dashboard Candidat
**Palette** : Vert (primary) + Or (accent) + Slate (neutral)

**Usage** :
- Navigation : Vert
- CTA principaux : Or
- Statistiques : Vert clair
- États de succès : Vert

### Dashboard Employeur
**Palette** : Or (primary) + Vert (secondary) + Violet (premium)

**Usage** :
- Actions principales : Or
- Éléments secondaires : Vert
- Fonctionnalités premium : Violet
- Statistiques : Combinaison Or + Vert

### Landing Page
**Palette** : Vert (hero) + Or (CTA) + Slate (neutral)

**Usage** :
- Hero section : Fond vert avec CTA or
- Features : Icônes vertes sur fond blanc
- CTA sections : Fond or avec bouton vert
- Footer : Vert foncé

### Pages d'Authentification
**Palette** : Vert (panel gauche) + Or (CTA) + Slate (formulaire)

**Usage** :
- Panel branding : Fond vert
- Boutons CTA : Or
- Formulaires : Fond blanc avec bordures slate
- Liens : Vert

---

## 🔧 CONFIGURATION TECHNIQUE

### Import CSS dans Next.js

```css
/* frontend/src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Importer après Tailwind */
@import '../styles/brand-colors.css';
```

### Configuration Tailwind (Optionnel)

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'brand-green': '#6B9B5F',
        'brand-gold': '#F7C700',
        'brand-violet': '#6B46C1',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
    },
  },
}
```

### DaisyUI Override

Les variables DaisyUI sont automatiquement overridées dans `brand-colors.css` :

```css
[data-theme="light"] {
  --color-primary: oklch(63% 0.12 145);      /* Vert */
  --color-secondary: oklch(82% 0.18 95);     /* Or */
  --color-accent: oklch(48% 0.20 290);       /* Violet */
}
```

---

## 📋 CHECKLIST RAPIDE

### Avant de Commencer
- [ ] Lire la charte graphique complète
- [ ] Comprendre les couleurs du logo
- [ ] Vérifier les contrastes d'accessibilité

### Import & Configuration
- [ ] Importer `brand-colors.css` dans `globals.css`
- [ ] Vérifier que Plus Jakarta Sans est chargée
- [ ] Tester les variables CSS dans DevTools

### Migration des Composants
- [ ] Remplacer `bg-primary` par `bg-[var(--color-brand-green)]`
- [ ] Remplacer `bg-secondary` par `bg-[var(--color-brand-gold)]`
- [ ] Remplacer `bg-accent` par `bg-[var(--color-brand-violet)]`
- [ ] Utiliser les composants `<Brand*>` où possible

### Tests
- [ ] Vérifier sur tous les breakpoints (mobile, tablet, desktop)
- [ ] Tester les contrastes avec WebAIM
- [ ] Valider l'accessibilité au clavier
- [ ] Tester les animations

---

## 🎓 RESSOURCES EXTERNES

### Outils
- [Contrast Checker](https://webaim.org/resources/contrastchecker/) - Vérifier les contrastes WCAG
- [OKLCH Converter](https://oklch.com) - Convertir les couleurs en OKLCH
- [Sanzo Wada Colors](https://sanzo-wada.dada.pink/) - Harmonies de couleurs

### Références
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) - Accessibilité
- [Tailwind CSS Docs](https://tailwindcss.com/docs) - Framework CSS
- [DaisyUI Docs](https://daisyui.com) - Bibliothèque de composants

---

## 📦 STRUCTURE DES FICHIERS

```
IntoWork-Dashboard/
├── docs/
│   └── design/
│       ├── README.md                    # Ce fichier
│       ├── CHARTE_GRAPHIQUE.md          # Charte complète
│       └── GUIDE_IMPLEMENTATION.md      # Guide pratique
├── frontend/
│   └── src/
│       ├── styles/
│       │   └── brand-colors.css         # Variables CSS
│       └── components/
│           └── brand/
│               ├── BrandComponents.tsx  # Composants React
│               └── BrandExamples.tsx    # Exemples
└── Téléchargements/
    ├── PNG VERT.png                     # Logo complet
    └── PNG SANS.png                     # Logo icône
```

---

## 🤝 CONTRIBUTION

Pour proposer des modifications au design system :

1. Lire la charte graphique complète
2. Vérifier que le changement respecte l'identité INTOWORK
3. Tester les contrastes d'accessibilité
4. Documenter le changement
5. Créer un exemple d'utilisation

---

## 📞 SUPPORT

Pour questions sur le design system :

1. **Consulter** la charte graphique complète
2. **Vérifier** les exemples d'implémentation
3. **Tester** avec les composants React fournis
4. **Référencer** les logos officiels

---

## 📄 LICENCE

Ce design system est propriété de INTOWORK.
Utilisation interne uniquement.

---

**Version** : 1.0.0
**Date** : 2026-01-13
**Basé sur** : Logo officiel INTOWORK (PNG VERT.png, PNG SANS.png)
**Inspiration** : Sanzo Wada Dictionary of Color Combinations
**Auteur** : Équipe Design INTOWORK
