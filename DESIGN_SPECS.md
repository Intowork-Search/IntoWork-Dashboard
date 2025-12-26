# Design Specifications - Forgot Password Page

## Visual Hierarchy & Component Breakdown

### Desktop Layout (lg screens and above)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   ┌─────────────────────────┬─────────────────────────────────┐ │
│   │                         │                                 │ │
│   │   LEFT PANEL (50%)      │   RIGHT PANEL (50%)            │ │
│   │   [gradient branding]   │   [form/confirmation]          │ │
│   │                         │                                 │
│   │   • Logo               │   • Mobile Logo (hidden)        │ │
│   │   • Features x3        │   • Header + Icon              │ │
│   │   • Blobs animations   │   • Card Form/Success          │ │
│   │   • RGPD Badge         │   • Footer Links               │ │
│   │                         │                                 │
│   └─────────────────────────┴─────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Mobile Layout (< lg screens)

```
┌──────────────────────────────────┐
│   Logo (Visible)                 │
├──────────────────────────────────┤
│                                  │
│   • Header + Icon               │
│   • Card Form/Success           │
│   • Footer Links                │
│                                  │
└──────────────────────────────────┘
```

## Component Specifications

### 1. LEFT PANEL - Branding Section

**Container**
- Size: lg:w-1/2 (desktop only, hidden on mobile)
- Background: Gradient from-primary/80 via-primary to-secondary/60
- Layout: Flexbox column, justify-between, p-12
- Overflow: hidden (for blob animations)

**Decorative Blobs**
- Count: 3 floating elements
- Animation: animate-blob (7s infinite)
- Timings: base, delay-2000, delay-4000
- Style: rounded-full, mix-blend-multiply, blur-3xl, opacity-60
- Colors: bg-accent/30, bg-primary/30, bg-secondary/20

**Logo Container**
- Flex, items-center, gap-3, mb-20
- Icon wrapper: w-14 h-14, bg-white/15, rounded-xl, backdrop-blur-md, border-white/20
- Icon: SparklesIcon, w-7 h-7, text-white
- Text: "INTOWORK" (text-2xl font-bold text-white)
- Tagline: "Plateforme de Recrutement B2B2C" (text-sm text-white/80)
- Animation: animate-fade-in

**Features Section**
- Space-y-10 container
- Main heading: text-4xl font-bold mb-12 (animate-fade-in delay-100)
- Heading text: "Récupérez l'accès à votre compte en toute sécurité"

**Feature Items (x3)**
- Layout: flex gap-4
- Each with animate-fade-in and incrementing delays (200, 300, 400)

Feature Item Structure:
```
┌────────────────────────────────┐
│ [Icon] Title                   │
│        Description             │
└────────────────────────────────┘
```

- Icon wrapper: w-12 h-12, bg-white/10, rounded-lg, backdrop-blur-sm, border-white/20
- Icons: KeyIcon, BoltIcon, ChatBubbleLeftRightIcon (all white, w-6 h-6)
- Title: font-semibold text-lg mb-1 text-white
- Description: text-white/80 leading-relaxed

**Trust Badge**
- Border-top border-white/20, pt-8
- Icon: ShieldCheckIcon (w-5 h-5 text-white)
- Text: "Plateforme sécurisée et conforme RGPD" (text-sm text-white/80)
- Animation: animate-fade-in delay-500

### 2. RIGHT PANEL - Form/Confirmation Section

**Container**
- w-full lg:w-1/2
- Background: gradient-to-br from-base-100 via-base-100 to-base-200
- Flex items-center justify-center, p-6 sm:p-8
- Relative overflow-hidden

**Background Pattern**
- Subtle grid pattern overlay
- Opacity-40, repeating linear gradient
- Background-size 4rem 4rem

**Content Wrapper**
- max-w-md, relative z-10

### 3. MOBILE LOGO

**Mobile Logo Container** (lg:hidden)
- Flex items-center gap-3, mb-10
- Animation: animate-fade-in

**Icon**
- w-12 h-12
- Gradient background from-primary/80 to-primary
- Rounded-xl, shadow-lg
- Contains SparklesIcon (w-6 h-6 text-white)

**Text**
- "INTOWORK" (text-2xl font-bold text-base-content)
- "Plateforme de Recrutement" (text-sm text-base-content/60)

## STATE 1: PASSWORD RESET FORM

### Header Section

**Container**
- mb-10, animate-fade-in delay-100

**Icon + Title Row**
- Flex items-center gap-3, mb-4
- Icon container: w-10 h-10, bg-gradient-to-br from-primary/20 to-primary/10, rounded-lg
- Icon: KeyIcon (w-6 h-6 text-primary)
- Title: "Mot de passe oublié ?" (text-4xl font-bold text-base-content)

**Subtitle**
- text-base-content/60 text-lg
- "Nous vous aiderons à récupérer l'accès à votre compte"

### Form Card

**Container**
- animate-fade-in delay-200
- bg-white rounded-2xl shadow-lg border-base-200 p-8 backdrop-blur-sm

**Email Input Group**
- form-control class
- Label: label-text font-semibold text-base-content text-base
- Input wrapper: relative

**Input Element**
```
┌─────────────────────────────┐
│ [envelope] email@example.com│
└─────────────────────────────┘
```

- w-full px-4 py-3 pl-12
- bg-base-100, border-base-300, rounded-xl
- text-base-content, placeholder-text-base-content/40
- focus: outline-none, ring-2 ring-primary/50, border-primary
- transition-all duration-300
- Placeholder: "nom.prenom@entreprise.com"

**Icon Positioning**
- absolute left-4 top-1/2 transform -translate-y-1/2
- h-5 w-5 text-base-content/40
- EnvelopeIcon

**Info Message**
- text-sm text-base-content/60
- bg-base-100 rounded-lg p-4 border-base-300/50
- Message: "Nous vous enverrons un lien de réinitialisation sécurisé à cette adresse e-mail."

### Submit Button

**Button Specifications**
```
┌──────────────────────────────────┐
│  Envoyer le lien  [arrow right]  │
└──────────────────────────────────┘
```

- w-full h-12 mt-2
- bg-gradient-to-r from-primary to-primary/90
- hover: from-primary/95 to-primary/85
- text-white font-semibold rounded-xl
- transition-all duration-300
- disabled: opacity-70 cursor-not-allowed
- Flex items-center justify-center gap-2
- group relative overflow-hidden

**Shine Effect**
- absolute inset-0
- bg-gradient-to-r from-transparent via-white/20 to-transparent
- transform -skew-x-12
- group-hover: translate-x-full
- transition-transform duration-1000

**Loading State**
- Spinner: loading loading-spinner loading-sm
- Text: "Envoi en cours"

**Normal State**
- Text: "Envoyer le lien"
- Icon: ArrowRightIcon (w-5 h-5)
- Icon animation: group-hover:translate-x-1 transition-transform

### Back Link

**Container**
- mt-8 pt-6 border-t border-base-300 text-center

**Link**
- inline-flex items-center gap-2
- text-sm font-medium text-primary hover:text-primary/80
- transition-colors duration-300
- Icon: ArrowLeftIcon (w-4 h-4)
- Text: "Retour à la connexion"

### Footer

**Container**
- mt-10 text-center animate-fade-in delay-300

**Text**
- text-xs text-base-content/50
- "Besoin d'aide ?" with link to "/support"
- Link hover: text-base-content/70

## STATE 2: CONFIRMATION SCREEN

### Header Section

**Container**
- mb-10, animate-fade-in delay-100

**Title**
- text-4xl font-bold text-base-content
- "Vérifiez votre e-mail"

**Subtitle**
- text-base-content/60 text-lg mt-3
- "Nous avons envoyé les instructions de réinitialisation"

### Success Icon Component

**Outer Container**
- flex justify-center mb-8
- animate-fade-in delay-300

**Icon Stack (3 layers)**

Layer 1 (Glow):
```
absolute inset-0
bg-gradient-to-br from-success/30 to-success/10
rounded-full blur-xl opacity-80
```

Layer 2 (Border ring):
```
absolute inset-0 flex items-center justify-center
bg-gradient-to-br from-success/20 to-success/5
rounded-full border border-success/30
```

Layer 3 (Icon):
```
w-16 h-16
bg-gradient-to-br from-success to-success/80
rounded-full flex items-center justify-center
shadow-lg
```

Icon: CheckCircleIcon (w-10 h-10 text-white)

### Success Card

**Container**
- animate-fade-in delay-200
- bg-white rounded-2xl shadow-lg border-base-200 p-8 backdrop-blur-sm

**Message Content**
- text-center space-y-6

**Success Message**
- text-lg font-semibold text-base-content mb-2
- "Lien envoyé avec succès !"

**Email Display**
- text-base-content/70
- "Nous avons envoyé les instructions de réinitialisation à :"
- Email (bold): text-lg font-semibold text-primary mt-3 break-all

**Instructions Box**
```
┌─────────────────────────────────────────┐
│ Vérifiez votre boîte e-mail :          │
│                                         │
│ • Vérifiez votre dossier Inbox         │
│ • Regardez dans Spam ou Promotions     │
│ • Le lien expire dans 24 heures        │
└─────────────────────────────────────────┘
```

- bg-base-100 rounded-lg p-4 border-base-300/50
- text-left
- Title: text-sm text-base-content/70 mb-3, font-semibold
- List: ul text-sm text-base-content/60 space-y-2 list-disc list-inside

**Try Another Email**
- text-sm text-base-content/60
- "Vous ne recevez pas l'e-mail ?"
- Button: text-primary font-semibold hover:text-primary/80
- Action: reset state (setEmailSent(false), setEmail(''))

### Back Link & Footer

Same as Form State (see above)

## Responsive Breakpoints

### Mobile (< 768px)
- Logo visible (lg:hidden)
- Full width form
- p-6 padding
- max-w-md container

### Tablet (768px - 1024px)
- Logo visible
- Full width form
- p-8 padding
- max-w-md container

### Desktop (>= 1024px)
- Split screen layout
- lg:w-1/2 for both panels
- Left panel visible with all features
- p-12 padding on left panel

## Typography

**Font Sizes**
- text-4xl : 36px (main titles)
- text-lg : 18px (secondary titles)
- text-base : 16px (default body, labels)
- text-sm : 14px (secondary text, descriptions)
- text-xs : 12px (footer, small text)

**Font Weights**
- font-bold : 700 (titles, main text)
- font-semibold : 600 (labels, feature titles)
- font-medium : 500 (links, secondary labels)
- (default) : 400 (body text, descriptions)

**Line Heights**
- leading-tight : 1.25 (headings)
- leading-relaxed : 1.625 (feature descriptions)
- (default) : 1.5 (body text)

## Spacing Guide

**Vertical Spacing**
- mb-20 : 5rem (logo to features)
- mb-12 : 3rem (section headings)
- mb-10 : 2.5rem (headers, main sections)
- mb-8 : 2rem (icons, icon containers)
- mb-6 : 1.5rem (cards, top sections)
- mb-4 : 1rem (inline elements)
- mb-2 : 0.5rem (labels to inputs)
- mb-3 : 0.75rem (instructions title)

**Horizontal Spacing**
- gap-3 : 0.75rem (logo icon + text, inline items)
- gap-4 : 1rem (feature items)
- gap-2 : 0.5rem (links icons + text)
- p-12 : 3rem (left panel padding)
- p-8 : 2rem (cards padding)
- p-4 : 1rem (info boxes, instructions)
- pl-12 : 3rem (input left padding for icon)
- px-4 : 1rem (input horizontal padding)
- py-3 : 0.75rem (input vertical padding)

## Color Palette

### Primary Colors (from DaisyUI)
- Primary: oklch(64% 0.2 131.684) - Green
- Secondary: oklch(59% 0.249 0.584) - Rose
- Accent: oklch(62% 0.194 149.214) - Teal
- Success: oklch(84% 0.238 128.85) - Green (lighter)

### Neutral Colors
- Base-100: oklch(98% 0.001 106.423) - Light background
- Base-200: oklch(97% 0.001 106.424) - Secondary background
- Base-300: oklch(92% 0.003 48.717) - Border/disabled
- Base-content: oklch(21% 0.006 56.043) - Text/foreground
- White: #ffffff - Card backgrounds

### Opacity Variants
- /80 : 80% opacity
- /60 : 60% opacity
- /50 : 50% opacity
- /40 : 40% opacity
- /30 : 30% opacity
- /20 : 20% opacity
- /15 : 15% opacity
- /10 : 10% opacity
- /5 : 5% opacity

## Animation Specifications

### Fade-in Animation
```
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

Duration: 0.6s
Easing: ease-out
Applied to: All main page sections
```

### Cascade Animation
- Base element: animate-fade-in
- +100ms delay: animation-delay-100
- +200ms delay: animation-delay-200
- +300ms delay: animation-delay-300
- +400ms delay: animation-delay-400
- +500ms delay: animation-delay-500

Creates waterfall effect on page load.

### Blob Animation
```
@keyframes blob {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}

Duration: 7s
Easing: linear
Iteration: infinite
```

### Button Animations
- Hover lift: translateY(-2px), transition all 0.3s
- Shine effect: gradient translateX (1000ms duration)
- Icon movement: translate-x-1 on hover
- Focus ring: 2px solid primary

### Input Focus
- Ring: 2px solid primary/50
- Border: primary color
- Transition: all 0.3s

## Accessibility (WCAG 2.1 AA)

### Color Contrast
- Primary on White: 4.5:1 (text)
- White on Primary: 4.5:1 (text)
- Primary/50 on Base-100: 3:1 minimum
- Text on backgrounds: 4.5:1 minimum

### Keyboard Navigation
- Tab order: logo → fields → buttons → links
- Focus indicators: visible 2px ring
- Buttons: mouse and keyboard accessible
- Links: underline on focus

### Semantic HTML
- form: semantic form element
- label htmlFor: proper associations
- input type="email": built-in validation
- button type="submit": clear purpose

### Screen Readers
- Labels for all inputs
- Icons have aria-implied labels
- Button text is descriptive
- No icon-only buttons without labels

### Motion
- No auto-playing videos
- Animations respect prefers-reduced-motion
- Micro-interactions are clear
- No rapid flashing (> 3 times/second)

## Performance Metrics

### CSS Animations
- GPU-accelerated: transform, opacity
- CPU-efficient: no layout thrashing
- 60 FPS target on modern browsers
- No large shadows (use subtle instead)

### Image Optimization
- Icons: SVG (Heroicons)
- No image files needed
- Gradients: CSS only

### Bundle Impact
- No new dependencies
- Uses existing libraries
- CSS: pure Tailwind
- JS: minimal state management

---

**Date**: 2025-12-26
**Status**: Production Ready
**Browser Support**: Modern browsers (ES2020+)
