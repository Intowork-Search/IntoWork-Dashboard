# INTOWORK Sign-In Page - Design Specifications

## Component Specifications

### Layout Grid

**Desktop (≥1024px)**
- Total width: 100vw
- Left panel: 50% width
- Right panel: 50% width
- No spacing between panels

**Tablet (768px - 1023px)**
- Single column
- Width: 100%
- Padding: 28px

**Mobile (<768px)**
- Single column
- Width: 100%
- Padding: 24px

---

## Color Specifications

### Primary Colors (Green Palette)

| Element | Color Value | Usage |
|---------|-------------|-------|
| Primary | `oklch(64% 0.2 131.684)` | Buttons, links, accents |
| Primary Content | `oklch(98% 0.031 120.757)` | Text on primary background |
| Primary/80 | `oklch(64% 0.2 131.684) at 80%` | Hover states |
| Primary/50 | `oklch(64% 0.2 131.684) at 50%` | Focus rings |

### Supporting Colors

| Element | Color Value | Usage |
|---------|-------------|-------|
| Secondary | `oklch(59% 0.249 0.584)` | Background gradient accent |
| Accent | `oklch(62% 0.194 149.214)` | Decorative blob animations |
| Base 100 | `oklch(98% 0.001 106.423)` | Form inputs, cards |
| Base 200 | `oklch(97% 0.001 106.424)` | Background, hover states |
| Base 300 | `oklch(92% 0.003 48.717)` | Borders, dividers |
| Base Content | `oklch(21% 0.006 56.043)` | Main text color |
| Base Content/60 | `oklch(21% 0.006 56.043) at 60%` | Secondary text |
| Base Content/40 | `oklch(21% 0.006 56.043) at 40%` | Placeholder text |

### Color Contrast Ratios

| Text | Background | Ratio | WCAG Level |
|------|------------|-------|-----------|
| Primary (text) | Base 100 | 4.5:1 | AAA |
| Primary (button text) | Primary | 4.5:1 | AAA |
| Base Content | Base 100 | 10:1 | AAA |
| Base Content/60 | Base 100 | 5.2:1 | AAA |
| Base Content/40 | Base 100 | 4.5:1 | AA |
| White | Primary | 3.2:1 | AA |

---

## Typography Specifications

### Font Family

```css
font-family: var(--font-geist-sans), -apple-system, BlinkMacSystemFont,
             'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell',
             'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
```

### Font Scales

| Element | Size | Weight | Line Height | Letter Spacing |
|---------|------|--------|-------------|-----------------|
| Logo Text | 28px | 700 | 1.2 | -0.5px |
| Heading 1 | 36px | 700 | 1.2 | -0.5px |
| Heading 2 | 24px | 600 | 1.3 | -0.3px |
| Heading 3 | 20px | 600 | 1.4 | 0 |
| Body Large | 18px | 400 | 1.5 | 0 |
| Body | 16px | 400 | 1.5 | 0 |
| Label | 14px | 600 | 1.4 | 0 |
| Small Text | 13px | 400 | 1.5 | 0 |
| Tiny Text | 12px | 400 | 1.5 | 0 |

### Font Weight Classes

- **300** Light - Not used in this design
- **400** Regular - Body text, small text
- **500** Medium - Not used in this design
- **600** Semibold - Labels, some headings
- **700** Bold - Main headings, logo, buttons

---

## Spacing System

### Base Unit: 4px

All spacing follows a 4px grid for consistency.

| Scale | Value | Use Cases |
|-------|-------|-----------|
| 2xs | 4px | Icon spacing, tight elements |
| xs | 8px | Small gaps, icon margins |
| sm | 12px | Button padding, form gaps |
| md | 16px | Standard spacing, padding |
| lg | 24px | Section spacing |
| xl | 32px | Large gaps, container padding |
| 2xl | 48px | Major sections |
| 3xl | 64px | Page sections |

### Component Spacing

| Component | Value |
|-----------|-------|
| Input padding (vertical) | 12px |
| Input padding (horizontal) | 16px |
| Input icon left spacing | 16px |
| Button height | 48px |
| Button padding (horizontal) | 24px |
| Card padding | 32px |
| Form element gap | 24px |
| Section gap | 32px |

---

## Border & Shadow Specifications

### Border Radius

| Component | Value | Tailwind Class |
|-----------|-------|-----------------|
| Inputs | 12px | `rounded-xl` |
| Buttons | 12px | `rounded-xl` |
| Cards | 16px | `rounded-2xl` |
| Icons | 8px | `rounded-lg` |
| Small elements | 6px | `rounded-md` |

### Box Shadows

| Level | Shadow | CSS |
|-------|--------|-----|
| None | - | `shadow-none` |
| Subtle | Soft 8px | `0 2px 8px rgba(0, 0, 0, 0.08)` |
| Small | Soft 16px | `0 4px 16px rgba(0, 0, 0, 0.1)` |
| Medium | `shadow-md` | `0 4px 6px rgba(0, 0, 0, 0.1)` |
| Card | `shadow-lg` | `0 10px 15px -3px rgba(0, 0, 0, 0.1)` |
| Hover | `shadow-xl` | `0 20px 25px -5px rgba(0, 0, 0, 0.1)` |

### Borders

| Type | Width | Color | Style |
|------|-------|-------|-------|
| Input | 1px | Base 300 | Solid |
| Input Focused | 1px | Primary | Solid |
| Card | 1px | Base 200 | Solid |
| Divider | 1px | Base 300 | Solid |

---

## Animation Specifications

### Entrance Animations

#### Fade-In (animate-fade-in)

```css
Duration: 600ms
Easing: cubic-bezier(0.23, 1, 0.320, 1) /* ease-out */
From: opacity 0, translateY(10px)
To: opacity 1, translateY(0)

Delay Classes:
- animation-delay-100: 100ms
- animation-delay-200: 200ms
- animation-delay-300: 300ms
- animation-delay-400: 400ms
- animation-delay-500: 500ms
```

#### Blob Animation (animate-blob)

```css
Duration: 7000ms
Easing: linear
Iteration: infinite

Keyframes:
0%, 100%: translate(0, 0) scale(1)
33%: translate(30px, -50px) scale(1.1)
66%: translate(-20px, 20px) scale(0.9)

Delay Classes:
- animation-delay-2000: 2000ms
- animation-delay-4000: 4000ms
```

### Interactive Animations

#### Button Hover

```css
Property: transform
Value: translateY(-2px)
Duration: 300ms
Easing: cubic-bezier(0.4, 0, 0.2, 1)

On Leave: returns to translateY(0)
```

#### Input Focus

```css
Duration: 300ms
Easing: ease-out

Border Color: base-300 → primary
Box Shadow: none → 0 0 0 3px rgba(primary, 0.1)
```

#### Shine Effect (Button Hover)

```css
Element: Absolute positioned gradient overlay
Duration: 1000ms
Direction: Left to right (-skew-x-12 to translate-x-full)

Colors:
- From: transparent
- Mid: rgba(255, 255, 255, 0.2)
- To: transparent
```

### Micro-Interactions

#### Checkbox State

```css
Default → Hover:
- Border color remains base-300
- Text color: base-content/70 → base-content
- Transition: 300ms

On Check:
- Background: primary
- Border: primary
- Scale: 0.9 → 1.0
```

#### Link Hover

```css
Color: primary → primary/80
Duration: 300ms
```

---

## Input Field Specifications

### Email Input

```html
<input type="email" placeholder="nom.prenom@entreprise.com" />
```

**States:**

| State | Border | Ring | Icon Opacity | Text |
|-------|--------|------|--------------|------|
| Default | base-300 | none | 40% | base-content |
| Hover | base-300 | none | 50% | base-content |
| Focus | primary | primary/50 | 70% | base-content |
| Error | red-500 | red-500/20 | 100% | red-600 |
| Filled | primary | primary/30 | 70% | base-content |

**Dimensions:**
- Height: 48px (py-3)
- Padding: 12px vertical, 12px left (for icon), 16px right
- Icon size: 20px
- Icon position: 16px from left

### Password Input

Same specifications as email input.

### Checkbox

**Dimensions:**
- Size: 20x20px
- Border: 2px
- Border radius: 8px

**States:**

| State | Background | Border | Check Mark |
|-------|------------|--------|-----------|
| Unchecked | base-100 | base-300 | hidden |
| Unchecked Hover | base-100 | base-300 | hidden |
| Checked | primary | primary | white |
| Checked Hover | primary/90 | primary/90 | white |
| Focus | base-100 | primary | hidden |

---

## Button Specifications

### Primary Button (Sign In)

```html
<button type="submit" className="btn btn-primary">
  Se connecter
</button>
```

**Dimensions:**
- Width: 100%
- Height: 48px
- Padding: 0 24px (handled by height)
- Border radius: 12px

**Visual:**
- Background: gradient(primary, primary/90)
- Text: white, 16px, semibold
- Icon: 20x20px, 8px gap from text

**States:**

| State | Background | Shadow | Icon Position |
|-------|------------|--------|---------------|
| Default | gradient | shadow-lg | static |
| Hover | primary/95 to primary/85 | shadow-xl | translateX(4px) |
| Active | gradient | shadow-lg | static |
| Focus | + 2px solid outline | shadow-lg | static |
| Disabled | 70% opacity | shadow-lg | static |
| Loading | gradient | shadow-lg | hidden (spinner shows) |

**Focus Outline:**
- Width: 2px
- Color: primary
- Offset: 2px

### Social Button (Google/GitHub)

```html
<button className="social-btn">
  <Icon /> Provider Name
</button>
```

**Dimensions:**
- Width: 100%
- Height: 44px
- Padding: 0 16px
- Border radius: 12px

**Visual:**
- Background: base-100
- Border: 1px base-300
- Text: base-content, 14px, medium
- Icon: 20x20px

**States:**

| State | Background | Border | Shadow | Cursor |
|-------|------------|--------|--------|--------|
| Default | base-100 | base-300 | none | pointer |
| Hover | base-200/80 | base-300 | shadow-md | pointer |
| Active | base-200 | primary | shadow-md | pointer |
| Disabled | base-100 | base-300 | none | not-allowed |
| Loading | base-100 | base-300 | none | not-allowed |

---

## Form Layout Specifications

### Form Container

```
<Card>
  <Form>
    [Email Input]      ← Form Control
    [Password Input]   ← Form Control
    [Checkbox + Link]  ← 2-column layout
    [Submit Button]    ← Full width
    ---
    [Google + GitHub]  ← 2x Button grid
    ---
    [Sign Up Link]     ← Centered text
  </Form>
</Card>
```

### Responsive Grid

**Email & Password:**
- Mobile: 100% width, 1 per row
- Desktop: 100% width, 1 per row

**Remember Me + Forgot Password:**
- Layout: Flex, space-between
- Mobile: Stack if needed
- Desktop: Side by side

**Social Buttons:**
- Mobile: 100% width, 1 per row, stacked (space-y-3)
- Desktop: 100% width, 1 per row, stacked (space-y-3)

---

## Left Panel (Branding) Specifications

### Background

**Gradient:**
```css
background: linear-gradient(
  135deg,
  oklch(64% 0.2 131.684 / 80%),
  oklch(64% 0.2 131.684),
  oklch(59% 0.249 0.584 / 60%)
);
```

**Decorative Shapes:**

| Shape | Color | Size | Position | Animation |
|-------|-------|------|----------|-----------|
| Blob 1 | Accent/30 | 320px | top -160px, left -160px | blob, 0ms delay |
| Blob 2 | Primary/30 | 320px | top 160px, right -160px | blob, 2000ms delay |
| Blob 3 | Secondary/20 | 320px | bottom -80px, left 80px | blob, 4000ms delay |

**Effects:**
- Blur: 3xl (48px)
- Mix blend mode: multiply
- Opacity: 60%

### Content

**Logo:**
- Size: 56x56px (w-14 h-14)
- Background: white/15 with backdrop-blur-md
- Border: 1px white/20
- Icon: SparklesIcon, 28px, white

**Heading:**
- Font size: 36px (text-4xl)
- Font weight: 700
- Color: white
- Line height: tight
- Max width: 90%

**Features:**
- Spacing: 32px between features (space-y-8)
- Each feature: flex, gap-16px

**Feature Icon:**
- Size: 48x48px
- Background: white/10 with backdrop-blur-sm
- Border: 1px white/20
- Icon: 24px, white

**Feature Text:**
- Title: 18px, semibold, white
- Description: 14px, white/80

**Trust Badge:**
- Border top: 1px white/20
- Icon: 20px, white
- Text: 14px, white/80

---

## Right Panel (Form) Specifications

### Background

**Base:**
- Gradient: base-100 via base-100 to base-200

**Pattern Overlay:**
```css
background-image: linear-gradient(
  90deg,
  transparent 1px,
  rgba(0, 0, 0, 0.02) 1px
);
background-size: 64px 64px;
opacity: 40%;
```

### Card Container

**Dimensions:**
- Max width: 448px (max-w-md)
- Width: 100%
- Padding: 32px (p-8)

**Visual:**
- Background: white
- Border: 1px base-200
- Border radius: 16px
- Box shadow: shadow-lg
- Backdrop filter: blur-sm

### Section Dividers

**"OU" Divider:**
```
[Gradient Line] OU [Gradient Line]
```

**Gradients:**
- Left line: base-300 → base-300/50 → transparent (gradient-to-r)
- Right line: base-300 → base-300/50 → transparent (gradient-to-l)
- Height: 1px
- Spacing: 12px gap (gap-3)

**Text:**
- Size: 12px
- Weight: 500
- Color: base-content/50

---

## Accessibility Specifications

### Touch Targets

Minimum size: 44x44px (based on WCAG 2.1)

| Element | Size | Notes |
|---------|------|-------|
| Button | 48x48px | Meets AAA |
| Checkbox | 20x20px | Small but acceptable in forms |
| Input | 48px height | Sufficient |
| Links | 44px min height | Minimum spacing |
| Icons | 20-24px | Touch-friendly |

### Keyboard Navigation

**Tab Order:**
1. Email input
2. Password input
3. Remember me checkbox
4. Forgot password link
5. Sign in button
6. Google button
7. GitHub button
8. Sign up link
9. Terms link
10. Privacy link

**Enter Key:** Submits form (on button)
**Space:** Toggles checkbox

### Focus Indicators

```css
outline: 2px solid primary;
outline-offset: 2px;
```

**Applied to:**
- All buttons
- All inputs
- All links

### Color Contrast (Minimum)

- Normal text: 4.5:1 contrast ratio
- Large text (18px+): 3:1 contrast ratio
- UI components: 3:1 contrast ratio

---

## Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 768px | Single column, full-width |
| Tablet | 768px - 1023px | Single column, padded |
| Desktop | ≥ 1024px | Split-screen (50/50) |
| Large | ≥ 1280px | Same as desktop |
| X-Large | ≥ 1536px | Same as desktop |

---

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Grid | ✓ | ✓ | ✓ | ✓ |
| Flexbox | ✓ | ✓ | ✓ | ✓ |
| CSS Grid | ✓ | ✓ | ✓ | ✓ |
| Animations | ✓ | ✓ | ✓ | ✓ |
| Gradients | ✓ | ✓ | ✓ | ✓ |
| Backdrop Filter | ✓ | ✓ | ✓ (11.1+) | ✓ |
| OkLCH Colors | ✓ | ✓ | ✓ (16.1+) | ✓ |

---

## Design Tokens Reference

### Color Tokens

```css
--color-primary: oklch(64% 0.2 131.684);
--color-primary-content: oklch(98% 0.031 120.757);
--color-secondary: oklch(59% 0.249 0.584);
--color-secondary-content: oklch(97% 0.014 343.198);
--color-accent: oklch(62% 0.194 149.214);
--color-accent-content: oklch(98% 0.018 155.826);
--color-base-100: oklch(98% 0.001 106.423);
--color-base-200: oklch(97% 0.001 106.424);
--color-base-300: oklch(92% 0.003 48.717);
--color-base-content: oklch(21% 0.006 56.043);
```

### Spacing Tokens

```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 12px;
--spacing-lg: 16px;
--spacing-xl: 24px;
--spacing-2xl: 32px;
--spacing-3xl: 48px;
```

### Typography Tokens

```css
--font-sans: var(--font-geist-sans);
--font-mono: var(--font-geist-mono);
--text-xs: 12px;
--text-sm: 14px;
--text-base: 16px;
--text-lg: 18px;
--text-xl: 20px;
--text-2xl: 24px;
--text-3xl: 30px;
--text-4xl: 36px;
```

### Radius Tokens

```css
--radius-md: 6px;
--radius-lg: 8px;
--radius-xl: 12px;
--radius-2xl: 16px;
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-26 | Initial premium design spec |

---

*Last Updated: December 26, 2025*
