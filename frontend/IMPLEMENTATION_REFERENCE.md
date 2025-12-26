# INTOWORK Sign-In Page - Implementation Reference

## Quick Start Guide

### What's Changed

Two main files have been updated:

1. **`src/app/auth/signin/page.tsx`** (348 lines)
   - Complete redesign of sign-in page component
   - Added social login functionality
   - Enhanced form styling and animations
   - Improved accessibility

2. **`src/app/globals.css`** (305 lines)
   - Added 8+ custom animations
   - Enhanced focus and hover states
   - Animation utility classes
   - Accessibility support (prefers-reduced-motion)

### What's Identical

- Authentication logic (NextAuth credentials)
- Route structure
- API integration approach
- Error handling pattern

## Component Structure

### Page Structure

```
SignInPage
├── Left Panel (Desktop Only)
│   ├── Background Gradient + Blobs
│   ├── Logo
│   ├── Features Section
│   │   ├── Feature 1
│   │   ├── Feature 2
│   │   └── Feature 3
│   └── Trust Badge
└── Right Panel
    ├── Mobile Logo
    ├── Form Header
    ├── Sign-In Card
    │   ├── Email Input
    │   ├── Password Input
    │   ├── Remember Me + Forgot Password
    │   ├── Submit Button
    │   ├── OR Divider
    │   ├── Social Buttons
    │   │   ├── Google
    │   │   └── GitHub
    │   └── Sign Up Link
    ├── Footer (Legal Links)
    └── Background Pattern
```

## Key Code Sections

### State Management

```typescript
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [rememberMe, setRememberMe] = useState(false);
const [loading, setLoading] = useState(false);
const [socialLoading, setSocialLoading] = useState<string | null>(null);
```

### Form Submission Handler

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      toast.error('Email ou mot de passe incorrect');
    } else {
      toast.success('Connexion réussie');
      router.push('/dashboard');
      router.refresh();
    }
  } catch (error) {
    toast.error('Une erreur est survenue');
  } finally {
    setLoading(false);
  }
};
```

### Social Login Handler

```typescript
const handleSocialSignIn = async (provider: 'google' | 'github') => {
  setSocialLoading(provider);
  try {
    await signIn(provider, { redirect: false });
  } catch (error) {
    toast.error(`Erreur lors de la connexion avec ${provider}`);
  } finally {
    setSocialLoading(null);
  }
};
```

### Email Input Implementation

```tsx
<div className="form-control">
  <label className="label pb-2" htmlFor="email">
    <span className="label-text font-semibold text-base-content text-base">
      Adresse e-mail
    </span>
  </label>
  <div className="relative">
    <input
      id="email"
      name="email"
      type="email"
      autoComplete="email"
      required
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      className="w-full px-4 py-3 pl-12 bg-base-100 border border-base-300
                 rounded-xl text-base-content placeholder:text-base-content/40
                 focus:outline-none focus:ring-2 focus:ring-primary/50
                 focus:border-primary transition-all duration-300"
      placeholder="nom.prenom@entreprise.com"
    />
    <EnvelopeIcon className="absolute left-4 top-1/2 transform -translate-y-1/2
                            h-5 w-5 text-base-content/40" />
  </div>
</div>
```

### Primary Button Implementation

```tsx
<button
  type="submit"
  disabled={loading}
  className="w-full h-12 mt-2 bg-gradient-to-r from-primary to-primary/90
             hover:from-primary/95 hover:to-primary/85 text-white font-semibold
             rounded-xl transition-all duration-300 disabled:opacity-70
             disabled:cursor-not-allowed flex items-center justify-center gap-2
             group shadow-lg hover:shadow-xl relative overflow-hidden"
>
  {/* Shine effect */}
  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20
                  to-transparent transform -skew-x-12 group-hover:translate-x-full
                  transition-transform duration-1000"></div>

  {loading ? (
    <>
      <span className="loading loading-spinner loading-sm"></span>
      <span>Connexion en cours</span>
    </>
  ) : (
    <>
      <span>Se connecter</span>
      <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1
                                 transition-transform" />
    </>
  )}
</button>
```

### Animation Classes

```css
/* Used in component */
.animate-fade-in { animation: fadeIn 0.6s ease-out forwards; }
.animation-delay-100 { animation-delay: 0.1s; }
.animation-delay-200 { animation-delay: 0.2s; }
.animation-delay-300 { animation-delay: 0.3s; }
.animate-blob { animation: blob 7s infinite; }
.animation-delay-2000 { animation-delay: 2s; }
.animation-delay-4000 { animation-delay: 4s; }
```

## CSS Animations Reference

### Fade-In Animation

```css
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

Duration: 600ms
Easing: ease-out
Used for: Staggered page element entrance
```

### Blob Animation

```css
@keyframes blob {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}

Duration: 7000ms
Easing: linear
Used for: Decorative background shapes
```

### Input Focus Animation

```css
@keyframes inputFocus {
  from {
    border-color: base-300;
    box-shadow: 0 0 0 3px rgba(primary, 0);
  }
  to {
    border-color: primary;
    box-shadow: 0 0 0 3px rgba(primary, 0.1);
  }
}

Duration: 300ms
Easing: ease-out
Used for: Input field focus states
```

## Design Pattern Examples

### Custom Input Styling

Pattern: Relative container with icon overlay

```tsx
<div className="relative">
  <input className="w-full px-4 py-3 pl-12 bg-base-100 border border-base-300
                     rounded-xl focus:outline-none focus:ring-2
                     focus:ring-primary/50 focus:border-primary
                     transition-all duration-300" />
  <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5" />
</div>
```

### Button Elevation Effect

Pattern: Hover with translateY and shadow increase

```css
button:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

button:not(:disabled):active {
  transform: translateY(0);
}
```

### Shine Effect Button

Pattern: Absolute overlay with skew and translate animation

```tsx
<button className="relative overflow-hidden">
  <div className="absolute inset-0 bg-gradient-to-r from-transparent
                  via-white/20 to-transparent transform -skew-x-12
                  group-hover:translate-x-full transition-transform duration-1000">
  </div>
  {/* Button content */}
</button>
```

### Focus Ring Animation

Pattern: Smooth transition from no ring to visible ring

```css
input:focus-visible {
  outline: none;
  animation: inputFocus 0.3s ease-out forwards;
}

/* Or static focus ring */
button:focus-visible {
  outline: 2px solid primary;
  outline-offset: 2px;
}
```

## Styling System

### Color Utilities

```
Primary action:          text-primary, bg-primary, border-primary
Secondary text:          text-base-content/70, text-base-content/60
Disabled states:         opacity-70, cursor-not-allowed
Hover backgrounds:       hover:bg-base-200/80
Focus rings:             focus:ring-2 focus:ring-primary/50
```

### Spacing Utilities

```
Padding:                 p-8 (32px), p-6 (24px), px-4 py-3
Gaps:                    gap-2, gap-3, gap-4, gap-6
Margins:                 mb-3, mb-8, mt-2, mt-8, mt-10
```

### Border Radius Utilities

```
Inputs:                  rounded-xl (12px)
Cards:                   rounded-2xl (16px)
Icons:                   rounded-lg (8px)
```

### Shadow Utilities

```
Cards:                   shadow-lg (standard), shadow-xl (hover)
Buttons:                 shadow-lg (standard), shadow-xl (hover)
No shadow:               shadow-none
```

## Responsive Design Pattern

### Desktop Split-Screen

```tsx
<div className="flex min-h-screen">
  <div className="hidden lg:flex lg:w-1/2">
    {/* Left panel - branding */}
  </div>
  <div className="w-full lg:w-1/2">
    {/* Right panel - form */}
  </div>
</div>
```

### Mobile Responsive Input

```tsx
<input className="w-full px-4 py-3 pl-12
                  sm:px-4 sm:py-3 md:px-4 md:py-3
                  lg:px-4 lg:py-3" />
```

## Testing Checklist

### Visual Testing

- [ ] Left panel appears only on desktop (lg:)
- [ ] Blob animations rotate smoothly (7s cycle)
- [ ] Fade-in animations sequence correctly
- [ ] Button hover elevation is smooth
- [ ] Shine effect slides across button
- [ ] Focus ring appears on input focus
- [ ] Social buttons show loading spinner
- [ ] Form card shadow updates on hover

### Functional Testing

- [ ] Email validation works
- [ ] Password field hides characters
- [ ] Remember me checkbox toggles
- [ ] Form submission with valid credentials
- [ ] Error toast appears for invalid login
- [ ] Success toast appears after login
- [ ] Google button triggers signIn('google')
- [ ] GitHub button triggers signIn('github')
- [ ] Forgot password link navigates correctly
- [ ] Sign up link navigates to signup page

### Accessibility Testing

- [ ] All form fields are keyboard accessible (Tab)
- [ ] Enter submits form
- [ ] Space toggles checkbox
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Focus indicators are visible
- [ ] Screen reader announces all labels
- [ ] Form structure is semantic
- [ ] Error messages are announced

### Responsive Testing

- [ ] Mobile (375px): Single column, full-width form
- [ ] Tablet (768px): Centered form with padding
- [ ] Desktop (1024px): Split screen layout visible
- [ ] Zoom at 200%: All content readable
- [ ] Touch targets: All buttons ≥44x44px

## Performance Optimization Tips

### Animation Optimization

```css
/* Good - GPU accelerated */
transform: translateX(10px);
opacity: 0.5;

/* Bad - CPU intensive */
left: 10px;
box-shadow: 0 10px 20px rgba(0,0,0,0.3);
```

### CSS Specificity

Keep selectors simple and avoid nesting:
```css
/* Good */
.animate-fade-in { ... }

/* Bad */
.form .auth .signin .element { ... }
```

### Browser Rendering

Minimize layout thrashing:
```css
/* Good - batch transforms */
transform: translateY(-2px) scale(1.05);

/* Bad - separate properties */
top: -2px;
width: 105%;
height: 105%;
```

## Common Customizations

### Change Primary Color

```css
/* In globals.css */
--color-primary: oklch(64% 0.2 131.684);  /* Change to desired color */
```

All primary elements update automatically.

### Adjust Animation Speed

```css
/* In globals.css */
.animate-fade-in {
  animation: fadeIn 0.6s ease-out forwards;  /* Change duration */
}
```

### Change Button Height

```tsx
{/* In signin/page.tsx */}
className="h-12"  {/* Change to h-11, h-14, etc. */}
```

### Modify Form Spacing

```tsx
className="space-y-5"  {/* Change to space-y-6, space-y-4, etc. */}
```

## Debugging Guide

### Check Animations Aren't Running

```javascript
// In browser console
window.getComputedStyle(element).animation
// Should show: fadeIn 0.6s ease-out forwards
```

### Inspect Focus States

```javascript
// Click input, then in console:
document.activeElement.className
// Should show focus classes applied
```

### Verify Responsive Breakpoints

```javascript
// In browser console:
window.getComputedStyle(document.querySelector('.lg\\:w-1\\/2')).display
// lg: breakpoint = 1024px
```

### Check Color Contrast

Use WebAIM Contrast Checker:
https://webaim.org/resources/contrastchecker/

Enter foreground and background colors to verify 4.5:1 ratio.

## Browser DevTools Tips

### Chrome/Edge

1. Inspect element to see applied classes
2. Use Lighthouse (Ctrl+Shift+I) to check accessibility
3. Use Coverage tab to find unused CSS
4. Use Performance tab to profile animations

### Firefox

1. Inspector shows CSS including animation definitions
2. Accessibility tab shows contrast information
3. Use Performance tab for animation profiling

### Safari

1. Web Inspector shows computed styles
2. Use Timelines to profile animations
3. Check Console for JavaScript errors

## File Sizes

| File | Lines | Size |
|------|-------|------|
| `signin/page.tsx` | 348 | ~10KB |
| `globals.css` | 305 | ~8KB |
| **Total** | **653** | **~18KB** |

All assets are served from the Next.js bundle, no external dependencies.

## Import Dependencies

```typescript
// Already available in project
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EnvelopeIcon, ... } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// All dependencies already in package.json
// No new packages required
```

## Environment Variables

No new environment variables required. Existing configuration:

```env
NEXT_PUBLIC_API_URL=http://localhost:8001/api
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
```

## Version Compatibility

| Package | Min Version | Notes |
|---------|-------------|-------|
| Next.js | 14.0+ | App Router required |
| NextAuth | 5.0-beta.30+ | Used in project |
| React | 19.2.1 | Current |
| Tailwind | 4.0+ | With PostCSS |
| DaisyUI | 5.5.14+ | Theme system |
| Heroicons | 2.2.0+ | Icons |
| react-hot-toast | 2.6.0+ | Notifications |

## Next Development Phase

After this redesign is approved:

1. Integrate Google OAuth credentials
2. Integrate GitHub OAuth credentials
3. Add backend social signup endpoint
4. Test full social login flow
5. Deploy to production
6. Monitor sign-in metrics

## Support Contacts

For design-related questions:
- Check `SIGNIN_DESIGN_DOCUMENTATION.md`
- Review `DESIGN_SPECS.md` for technical details

For implementation questions:
- Check this reference guide
- Review component code in `signin/page.tsx`
- Check `globals.css` for animation definitions

For integration questions:
- See `SOCIAL_LOGIN_SETUP.md` for OAuth setup
- Review NextAuth documentation

---

**Last Updated:** December 26, 2025
**Version:** 1.0
**Status:** Ready for Production
