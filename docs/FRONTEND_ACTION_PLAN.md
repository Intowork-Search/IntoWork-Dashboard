# Frontend Improvement Action Plan
## IntoWork Dashboard - Priority Tasks

**Date:** January 6, 2026
**Status:** Ready for Implementation

---

## Executive Summary

This document provides a prioritized, actionable plan to improve the Next.js frontend from **B+ (80/100)** to **A+ (95+/100)** production-ready status.

**Estimated Total Time:** 16-24 hours
**Recommended Timeline:** 1-2 weeks

---

## Phase 1: Critical Configuration (Day 1) - 4 hours

### Task 1.1: Create Tailwind Configuration
**Priority:** CRITICAL
**Time:** 30 minutes
**File:** `/frontend/tailwind.config.ts`

```bash
# See NEXTJS_FRONTEND_ANALYSIS.md Section 3 for complete configuration
```

**Impact:** Enables proper Tailwind customization and purging

---

### Task 1.2: Create ESLint Configuration
**Priority:** CRITICAL
**Time:** 15 minutes
**File:** `/frontend/.eslintrc.json`

```bash
# See NEXTJS_FRONTEND_ANALYSIS.md Section 12 for complete configuration
```

**Impact:** Enables code quality checks and Next.js rules

---

### Task 1.3: Remove Clerk Dependencies
**Priority:** CRITICAL
**Time:** 5 minutes

```bash
cd frontend
npm uninstall @clerk/nextjs @clerk/themes
npm install
```

**Impact:**
- Reduces bundle size by ~500KB
- Removes security vulnerability surface
- Cleans up codebase

---

### Task 1.4: Update Next.js Configuration
**Priority:** HIGH
**Time:** 1 hour
**File:** `/frontend/next.config.js`

**Changes:**
1. Add security headers
2. Configure image optimization
3. Remove Clerk image domains
4. Add compression
5. Add compiler optimizations

```bash
# See NEXTJS_FRONTEND_ANALYSIS.md Section 1 for complete configuration
```

**Impact:** Major security and performance improvements

---

### Task 1.5: Clean Up API Types
**Priority:** HIGH
**Time:** 30 minutes
**File:** `/frontend/src/lib/api.ts`

**Changes:**
1. Remove `clerk_id` from User interface
2. Add request timeout configuration
3. Add retry logic to interceptors
4. Consolidate `candidateAPI` and `candidatesAPI`

**Impact:** Better type safety and consistency

---

### Task 1.6: Update Environment Variables
**Priority:** MEDIUM
**Time:** 15 minutes
**File:** `/frontend/.env.local.example`

**Add:**
```env
# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_DEBUG=true

# Performance Monitoring
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_API_TIMEOUT=30000

# Version Info
NEXT_PUBLIC_APP_VERSION=1.0.0
```

---

## Phase 2: Error Handling & UX (Day 2) - 4 hours

### Task 2.1: Create Global Loading State
**Priority:** HIGH
**Time:** 30 minutes
**Files:** Create `loading.tsx` in key directories

```bash
touch frontend/src/app/loading.tsx
touch frontend/src/app/dashboard/loading.tsx
touch frontend/src/app/auth/signin/loading.tsx
```

**Impact:** Better loading UX, prevents blank pages

---

### Task 2.2: Create Global Error Boundaries
**Priority:** HIGH
**Time:** 1 hour
**Files:** Create `error.tsx` in key directories

```bash
touch frontend/src/app/error.tsx
touch frontend/src/app/dashboard/error.tsx
touch frontend/src/app/auth/error.tsx
```

**Impact:** Graceful error handling, prevents crashes

---

### Task 2.3: Create 404 Page
**Priority:** MEDIUM
**Time:** 30 minutes
**File:** `/frontend/src/app/not-found.tsx`

```bash
# See NEXTJS_FRONTEND_ANALYSIS.md Section 13.3 for implementation
```

**Impact:** Better UX for missing pages

---

### Task 2.4: Update Middleware with RBAC
**Priority:** HIGH
**Time:** 1 hour
**File:** `/frontend/src/middleware.ts`

**Changes:**
1. Add role-based access control
2. Prevent candidates from accessing employer routes
3. Prevent employers from accessing candidate routes
4. Restrict admin routes to admin users

**Impact:** Better security and UX

---

### Task 2.5: Add Loading Skeletons
**Priority:** MEDIUM
**Time:** 1 hour
**Files:** Create skeleton components for lists

```bash
touch frontend/src/components/skeletons/JobListSkeleton.tsx
touch frontend/src/components/skeletons/ApplicationListSkeleton.tsx
touch frontend/src/components/skeletons/DashboardSkeleton.tsx
```

**Impact:** Better perceived performance

---

## Phase 3: Performance Optimization (Day 3-4) - 6 hours

### Task 3.1: Implement Dynamic Imports
**Priority:** HIGH
**Time:** 2 hours

**Target Components:**
- `NotificationPanel` (heavy, not critical)
- `AdminDashboard` (admin-only, large)
- `ReactQueryDevtools` (dev-only)
- `Sidebar` (mobile-only, can defer)

**Example:**
```typescript
const NotificationPanel = dynamic(() => import('@/components/NotificationPanel'), {
  loading: () => <div className="animate-pulse bg-gray-200 w-8 h-8 rounded" />,
  ssr: false,
});
```

**Impact:** Reduces initial bundle size by 30-40%

---

### Task 3.2: Add Bundle Analyzer
**Priority:** HIGH
**Time:** 30 minutes

```bash
npm install --save-dev @next/bundle-analyzer
```

Update `next.config.js`:
```javascript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);
```

Run analysis:
```bash
ANALYZE=true npm run build
```

**Impact:** Visibility into bundle composition

---

### Task 3.3: Optimize Images
**Priority:** MEDIUM
**Time:** 1 hour

**Tasks:**
1. Audit all `<img>` tags
2. Replace with `next/image`
3. Add proper width/height
4. Configure remote patterns
5. Test AVIF/WebP support

**Impact:** 50-70% reduction in image size

---

### Task 3.4: Add Link Prefetching
**Priority:** LOW
**Time:** 30 minutes

```typescript
// Update Sidebar.tsx and navigation components
<Link href="/dashboard/jobs" prefetch={true}>
  Jobs
</Link>
```

**Impact:** Instant navigation for authenticated routes

---

### Task 3.5: Optimize Font Loading
**Priority:** LOW
**Time:** 30 minutes

**Current:** Using Inter from `next/font/google`
**Good!** No changes needed, but verify:
- Font preloading is working
- Variable font is used
- Display: swap is set

---

### Task 3.6: Add Service Worker (PWA)
**Priority:** LOW
**Time:** 2 hours

```bash
npm install next-pwa
```

**Benefits:**
- Offline capability
- Faster repeat visits
- App-like experience

---

## Phase 4: Security Hardening (Day 5) - 3 hours

### Task 4.1: Add CSRF Protection
**Priority:** HIGH
**Time:** 30 minutes

**Update:** `/frontend/src/auth.ts`

```typescript
export const { handlers, signIn, signOut, auth } = NextAuth({
  // ... existing config
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
});
```

**Impact:** Prevents CSRF attacks

---

### Task 4.2: Add Input Sanitization
**Priority:** HIGH
**Time:** 1 hour

```bash
npm install dompurify
npm install --save-dev @types/dompurify
```

Create sanitization utility:
```typescript
// src/lib/sanitize.ts
import DOMPurify from 'dompurify';

export const sanitizeHtml = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target'],
  });
};
```

**Impact:** Prevents XSS attacks

---

### Task 4.3: Add Rate Limit Handling
**Priority:** MEDIUM
**Time:** 30 minutes

**Update:** `/frontend/src/lib/api.ts`

```typescript
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      toast.error(`Too many requests. Please try again in ${retryAfter} seconds.`);
    }
    return Promise.reject(error);
  }
);
```

**Impact:** Better UX for rate-limited requests

---

### Task 4.4: Add Content Security Policy
**Priority:** HIGH
**Time:** 1 hour

Already included in Task 1.4 (next.config.js update)

**Impact:** Prevents XSS and injection attacks

---

## Phase 5: Testing Infrastructure (Day 6-7) - 8 hours

### Task 5.1: Setup Jest for Unit Tests
**Priority:** HIGH
**Time:** 2 hours

```bash
npm install --save-dev jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Create configuration:
- `jest.config.js`
- `jest.setup.js`
- Example test files

**Impact:** Enables unit testing

---

### Task 5.2: Write Critical Component Tests
**Priority:** HIGH
**Time:** 4 hours

**Test Coverage:**
- [ ] `useJobs` hook
- [ ] `useApplications` hook
- [ ] `useAuth` hook
- [ ] `Sidebar` component
- [ ] `DashboardLayout` component
- [ ] Form validation

**Target:** 60%+ coverage on critical paths

---

### Task 5.3: Setup Playwright for E2E Tests
**Priority:** MEDIUM
**Time:** 2 hours

```bash
npm install --save-dev @playwright/test
npx playwright install
```

Create test scenarios:
- [ ] User sign in flow
- [ ] Job application flow
- [ ] Profile update flow
- [ ] Job posting flow (employer)

**Impact:** Prevents regressions

---

## Phase 6: Monitoring & Observability (Day 8) - 4 hours

### Task 6.1: Setup Sentry Error Tracking
**Priority:** HIGH
**Time:** 1 hour

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

Configure:
- Error reporting
- Performance monitoring
- User context
- Release tracking

**Impact:** Production error visibility

---

### Task 6.2: Add Web Vitals Tracking
**Priority:** MEDIUM
**Time:** 1 hour

```typescript
// app/layout.tsx
'use client';

import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Send to analytics
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/analytics', {
        method: 'POST',
        body: JSON.stringify(metric),
      });
    }
  });

  return null;
}
```

**Impact:** Performance monitoring

---

### Task 6.3: Add Vercel Analytics
**Priority:** LOW
**Time:** 15 minutes

```bash
npm install @vercel/analytics
```

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

**Impact:** User analytics and insights

---

### Task 6.4: Setup Logging Infrastructure
**Priority:** MEDIUM
**Time:** 2 hours

Create structured logging:
```typescript
// lib/logger.ts
export const logger = {
  error: (message: string, context?: any) => {
    console.error(message, context);
    // Send to Sentry
  },
  warn: (message: string, context?: any) => {
    console.warn(message, context);
  },
  info: (message: string, context?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.info(message, context);
    }
  },
};
```

**Impact:** Better debugging

---

## Phase 7: Documentation & Polish (Day 9-10) - 4 hours

### Task 7.1: Update README
**Priority:** MEDIUM
**Time:** 1 hour

Add sections:
- [ ] Architecture overview
- [ ] Development setup
- [ ] Testing instructions
- [ ] Deployment process
- [ ] Performance benchmarks

---

### Task 7.2: Add Storybook (Optional)
**Priority:** LOW
**Time:** 3 hours

```bash
npx storybook@latest init
```

**Benefits:**
- Component documentation
- Visual testing
- Design system

---

## Validation Checklist

After completing all tasks, validate:

### Performance
- [ ] Lighthouse score > 90 (all metrics)
- [ ] Bundle size < 300KB (first load JS)
- [ ] Time to Interactive < 3s
- [ ] Largest Contentful Paint < 2.5s

### Security
- [ ] Security headers present (check browser DevTools)
- [ ] CSRF protection enabled
- [ ] XSS prevention implemented
- [ ] Rate limiting handled gracefully

### Functionality
- [ ] All routes have loading states
- [ ] All routes have error boundaries
- [ ] Authentication working correctly
- [ ] Role-based access control working
- [ ] Forms validate properly

### Testing
- [ ] Unit test coverage > 60%
- [ ] E2E tests passing
- [ ] No console errors in production

### Monitoring
- [ ] Sentry capturing errors
- [ ] Web Vitals being tracked
- [ ] Analytics working

---

## Quick Win Commands

### Day 1 Quick Setup
```bash
cd frontend

# Remove Clerk
npm uninstall @clerk/nextjs @clerk/themes

# Install recommended packages
npm install --save-dev @next/bundle-analyzer eslint-config-next
npm install zod react-hook-form @hookform/resolvers sharp

# Create config files
touch tailwind.config.ts
touch .eslintrc.json

# Create special files
mkdir -p src/app/dashboard/loading.tsx
mkdir -p src/app/dashboard/error.tsx
touch src/app/loading.tsx
touch src/app/error.tsx
touch src/app/not-found.tsx

# Run lint
npm run lint
```

---

## Expected Outcomes

### Before → After

**Performance:**
- Lighthouse Score: 75 → 95+
- Bundle Size: Unknown → < 300KB
- Time to Interactive: Unknown → < 3s

**Security:**
- Security Headers: 0/7 → 7/7
- CSRF Protection: No → Yes
- XSS Protection: No → Yes

**Developer Experience:**
- ESLint: No → Yes
- Testing: 0% → 60%+
- Error Tracking: No → Yes

**User Experience:**
- Loading States: No → Yes
- Error Boundaries: No → Yes
- Offline Support: No → Optional PWA

---

## Maintenance Plan

### Weekly
- [ ] Review Sentry errors
- [ ] Check Web Vitals trends
- [ ] Run bundle analyzer
- [ ] Update dependencies

### Monthly
- [ ] Security audit
- [ ] Performance audit
- [ ] Accessibility audit
- [ ] Test coverage review

### Quarterly
- [ ] Major dependency updates
- [ ] Architecture review
- [ ] UX review

---

**Total Estimated Time:** 16-24 hours
**Recommended Pace:** 2-3 hours per day
**Target Completion:** 2 weeks

**Priority Order:**
1. Phase 1 (Critical Config) - Do immediately
2. Phase 2 (Error Handling) - Do this week
3. Phase 4 (Security) - Do this week
4. Phase 3 (Performance) - Do next week
5. Phase 6 (Monitoring) - Do next week
6. Phase 5 (Testing) - Ongoing
7. Phase 7 (Documentation) - Ongoing

---

**Document Version:** 1.0
**Last Updated:** January 6, 2026
**Status:** Ready for Implementation
