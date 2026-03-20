# INTOWORK — Design System

## Brand Identity
INTOWORK Search — plateforme de recrutement B2B2C pour l'Afrique de l'Ouest (Côte d'Ivoire, Sénégal, Cameroun, Mali…).
Public: candidats en recherche d'emploi ET employeurs recruteurs.

---

## Colors

### Primary
- **Brand Green**: `#6B9B5F` — couleur principale, CTA, accents
- **Green hover**: `#5A8A4E`
- **Green light bg**: `#F0F7EE`, `green-50/40`
- **Shimmer gradient**: `from #6B9B5F to #93C587`

### Accent
- **Purple**: `#7C3AED` — matching IA badge, secondaire
- **Amber**: `#F59E0B` — stats candidatures
- **Blue**: `#003DA5` — partner logos

### Neutral
- Background: `#FFFFFF` pure white
- Surface: `gray-50`, `gray-100`
- Border: `gray-100`, `gray-200`
- Text primary: `gray-900`
- Text secondary: `gray-600`
- Text muted: `gray-400`

### Gradients (fond hero/sections)
- Hero bg: `from-white via-green-50/40 to-white`
- Blobs: `bg-[#6B9B5F]/5 rounded-full blur-3xl` and `bg-[#7C3AED]/5 rounded-full blur-3xl`

---

## Typography

### Font
- **Primary**: Plus Jakarta Sans — weights 400, 500, 600, 700, 800
- **CSS variable**: `--font-plus-jakarta`
- Apply: `font-sans antialiased`

### Scale
- Hero h1: `text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight`
- Section h2: `text-3xl sm:text-4xl font-bold`
- Card title: `text-xl font-bold`
- Body large: `text-lg text-gray-600`
- Body: `text-sm text-gray-600`
- Badge/label: `text-xs font-semibold uppercase tracking-wide`

### Shimmer text effect
```css
background: linear-gradient(90deg, #6B9B5F 0%, #93C587 40%, #6B9B5F 80%);
background-size: 200% auto;
animation: shimmer 3s ease-in-out infinite;
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

---

## Spacing & Layout

- Max width container: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- Section padding: `py-16 lg:py-24`
- Card gap: `gap-6` to `gap-8`
- Grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

---

## Components

### Navbar
```
fixed top-0 z-50
bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-100 (scrolled)
bg-transparent (top)
height: h-16 lg:h-18
```

### Buttons
- **Primary CTA**: `px-5 py-2.5 text-sm font-semibold text-white bg-[#6B9B5F] hover:bg-[#5A8A4E] rounded-xl transition-all duration-200 shadow-sm hover:shadow-md`
- **Secondary**: `px-4 py-2 text-sm font-semibold text-gray-700 hover:text-[#6B9B5F] transition-colors`
- **Large hero CTA**: `px-8 py-4 text-base font-bold text-white bg-[#6B9B5F] hover:bg-[#5A8A4E] rounded-2xl`

### Badge / Tag pill
```
inline-flex items-center gap-2 px-4 py-2 rounded-full
bg-gradient-to-r from-green-50 to-emerald-50
border border-green-200/60 shadow-sm
text-sm font-semibold text-[#6B9B5F]
```

### Cards
- Border: `border border-gray-100`
- Radius: `rounded-2xl`
- Shadow: `shadow-sm hover:shadow-lg`
- BG: `bg-white`
- Padding: `p-6`
- Transition: `transition-all duration-300`

### Stats numbers
- Color: `text-[#6B9B5F]` or `text-[#7C3AED]`
- Size: `text-4xl font-extrabold`

### Testimonial card
- Rounded: `rounded-2xl`
- Border: `border border-gray-100`
- Quote mark: large `"` in green
- Star rating: 5 stars in amber/yellow

### Pricing card
- Normal: white background, gray border
- Highlighted: `bg-[#6B9B5F]` with white text, `ring-2 ring-[#6B9B5F]/30`
- Scale transform on highlight

---

## Animations

```css
@keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
@keyframes scroll-left { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
@keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
```

- `.animate-fade-in-up` with staggered `.delay-100` to `.delay-500`
- `.animate-float` on dashboard mockup (4s ease-in-out infinite)
- `.scroll-left-track` on logo ticker (30s linear infinite)

---

## UI Patterns

### Hero Section
- Badge pill → h1 (with shimmer on key word) → subtitle → dual CTA buttons → social proof stats
- Right: floating dashboard mockup card with mini stats and job listings
- Background: subtle radial green and purple blob gradients

### Logos ticker (partenaires)
- Infinite horizontal scroll, auto-scroll left
- Company initials in colored circles

### Feature sections
- Alternating left/right layout: text + highlights list ↔ dashboard mockup
- Green badge above title
- Bullet highlights with green dot

### Social proof / Stats bar
- 4 metrics in a row: candidates, companies, matching rate, countries
- Large number + label

### Testimonials
- 3-column grid with quote, avatar circle, name/role/company, metric highlight

### Pricing
- 3-tier horizontal: Starter (free) / Pro (highlighted green) / Enterprise (custom)
- Feature checklist per tier

### Countries coverage
- Flag grid showing 15 African countries

### Security section
- 4 cards: RGPD, SSL, SOC2, SLA 99.9%

### Footer
- 4-column links grid + copyright

---

## Tech Stack
Next.js 16 App Router, TypeScript, Tailwind CSS 4, DaisyUI 5.5+, 'use client'
No external component libraries beyond DaisyUI.
Use inline SVG icons (no Heroicons import needed).
Images: use Unsplash placeholder URLs for human faces and office scenes:
  - Professional African faces: `https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&q=80` (woman)
  - `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80` (man)
  - Team photo: `https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80`
  - Office: `https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80`
  - African professional woman: `https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=400&q=80`
  - African professional man: `https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80`
  - Candidate smiling: `https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80`
