# Next.js 14+ Frontend Configuration Analysis
## IntoWork Dashboard - Comprehensive Technical Review

**Analysis Date:** January 6, 2026
**Next.js Version:** 16.0.10
**React Version:** 19.2.1
**TypeScript Version:** 5.9.3

---

## Executive Summary

The IntoWork Dashboard frontend demonstrates a **solid foundation** with modern Next.js 14+ patterns, but there are **critical optimization opportunities** and several **configuration gaps** that need attention to reach production-grade performance and maintainability.

**Overall Grade:** B+ (80/100)

### Strengths
- Excellent React Query v5 implementation with proper caching
- Well-structured NextAuth v5 authentication
- Good TypeScript strict mode adherence
- Solid API client architecture
- Proper App Router adoption

### Critical Issues
- Missing Tailwind CSS configuration file
- No ESLint configuration
- Missing loading/error boundaries
- Legacy Clerk dependencies still installed
- No performance monitoring setup
- Incomplete image optimization
- Missing security headers

---

## 1. Next.js Configuration Analysis

### File: `/frontend/next.config.js`

#### Current Configuration
```javascript
output: 'standalone',
redirects: [/* Railway-specific HTTPS redirect */],
images: { remotePatterns: [{ hostname: 'images.clerk.dev' }] }
```

#### Findings

**GOOD:**
- Standalone output for Docker deployment
- HTTPS enforcement for production

**CRITICAL ISSUES:**

1. **Legacy Clerk Image Domain** - Still references Clerk CDN despite migration to NextAuth
2. **Missing Image Optimization** - No configuration for remote image patterns
3. **Missing Compression** - No gzip/brotli compression enabled
4. **Missing Headers** - No security headers configured
5. **Missing Bundle Analysis** - No webpack bundle analyzer
6. **French Comments** - Code has mixed language comments

**RECOMMENDATIONS:**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker builds
  output: 'standalone',

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },

  // Experimental features for performance
  experimental: {
    optimizePackageImports: ['@heroicons/react', 'date-fns'],
    optimizeCss: true,
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_API_URL?.replace(/https?:\/\//, '').split('/')[0] || 'localhost',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'intowork-dashboard-production.up.railway.app',
        pathname: '/uploads/**',
      }
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ],
      },
    ];
  },

  // Redirects for HTTPS enforcement
  async redirects() {
    if (process.env.NODE_ENV === 'production') {
      return [
        {
          source: '/api/:path*',
          has: [
            {
              type: 'host',
              value: 'intowork-dashboard-production.up.railway.app'
            }
          ],
          destination: 'https://intowork-dashboard-production.up.railway.app/api/:path*',
          permanent: true,
        }
      ];
    }
    return [];
  },

  // Performance optimizations
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
};

module.exports = nextConfig;
```

---

## 2. TypeScript Configuration Analysis

### File: `/frontend/tsconfig.json`

#### Current Configuration

**EXCELLENT:**
- `"strict": true` - Full type safety enabled
- `"moduleResolution": "bundler"` - Modern ESM resolution
- Path aliases configured (`@/*`)
- Incremental compilation enabled

**PERFECT SCORE:** 10/10

**RECOMMENDATIONS:**
- Consider adding `strictNullChecks: true` explicitly for documentation
- Add `noUncheckedIndexedAccess: true` for array safety
- Add `noPropertyAccessFromIndexSignature: true` for object safety

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "strictNullCheces": true,
    "noUncheckedIndexedAccess": true,
    "noPropertyAccessFromIndexSignature": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    "**/*.mts",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```

---

## 3. Tailwind CSS Configuration

### CRITICAL ISSUE: Missing Configuration File

**STATUS:** No `tailwind.config.ts` or `tailwind.config.js` file exists

**IMPACT:**
- Relying on default Tailwind v4 configuration
- No custom theme configuration
- No purging optimization
- No plugin configuration visible
- DaisyUI configuration only in CSS

**REQUIRED FILE:** `/frontend/tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-in-left': 'slideInFromLeft 0.5s ease-out',
        'slide-in-right': 'slideInFromRight 0.5s ease-out',
        'blob': 'blob 7s infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'shake': 'shake 0.5s',
        'focus-ring': 'focusRing 1.5s ease-in-out infinite',
        'input-focus': 'inputFocus 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: '0', transform: 'translateY(10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInFromLeft: {
          'from': { opacity: '0', transform: 'translateX(-20px)' },
          'to': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInFromRight: {
          'from': { opacity: '0', transform: 'translateX(20px)' },
          'to': { opacity: '1', transform: 'translateX(0)' },
        },
        blob: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(64, 200, 131, 0.5)' },
          '50%': { boxShadow: '0 0 30px rgba(64, 200, 131, 0.8)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
        },
        focusRing: {
          '0%': { boxShadow: '0 0 0 3px rgba(64, 200, 131, 0)' },
          '50%': { boxShadow: '0 0 0 6px rgba(64, 200, 131, 0.3)' },
          '100%': { boxShadow: '0 0 0 3px rgba(64, 200, 131, 0)' },
        },
        inputFocus: {
          'from': {
            borderColor: 'oklch(92% 0.003 48.717)',
            boxShadow: '0 0 0 3px rgba(64, 200, 131, 0)',
          },
          'to': {
            borderColor: 'oklch(64% 0.2 131.684)',
            boxShadow: '0 0 0 3px rgba(64, 200, 131, 0.1)',
          },
        },
      },
    },
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: [
      {
        light: {
          'primary': '#40C883',
          'primary-content': '#F9FDFB',
          'secondary': '#FF6B6B',
          'secondary-content': '#FEF8F8',
          'accent': '#4ECDC4',
          'accent-content': '#FDFEFE',
          'neutral': '#2D3748',
          'neutral-content': '#F9FDFB',
          'base-100': '#FFFFFF',
          'base-200': '#F8F9FA',
          'base-300': '#E9ECEF',
          'base-content': '#2D3748',
          'info': '#3B82F6',
          'info-content': '#EFF6FF',
          'success': '#10B981',
          'success-content': '#ECFDF5',
          'warning': '#F59E0B',
          'warning-content': '#FFFBEB',
          'error': '#EF4444',
          'error-content': '#FEF2F2',
        },
      },
    ],
    darkTheme: false,
    base: true,
    styled: true,
    utils: true,
    logs: false,
  },
}

export default config
```

---

## 4. NextAuth v5 Configuration Analysis

### File: `/frontend/src/auth.ts`

#### Current Implementation

**EXCELLENT:**
- Proper NextAuth v5 setup with CredentialsProvider
- JWT strategy (lightweight, no DB sessions)
- Correct token passing in callbacks
- 24-hour session expiration
- Custom pages configured

**SECURITY SCORE:** 8/10

**ISSUES:**

1. **Missing CSRF Protection** - No CSRF token validation
2. **No Rate Limiting** - Backend should have rate limiting on signin endpoint
3. **Session Expiration** - 24 hours is acceptable but could be shorter (8-12h)
4. **No Refresh Token** - JWT refresh not implemented
5. **Error Handling** - Generic error messages (security-aware but could be better)

**RECOMMENDATIONS:**

```typescript
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("MISSING_CREDENTIALS")
        }

        try {
          const response = await axios.post(`${API_URL}/auth/signin`, {
            email: credentials.email,
            password: credentials.password
          }, {
            timeout: 10000, // 10 second timeout
            headers: {
              'Content-Type': 'application/json',
            }
          })

          const { access_token, user } = response.data

          if (access_token && user) {
            return {
              id: user.id.toString(),
              email: user.email,
              name: `${user.first_name} ${user.last_name}`,
              image: user.image || null,
              role: user.role,
              accessToken: access_token
            }
          }

          return null
        } catch (error: any) {
          // Security: Log on server, return generic message to client
          console.error("Authentication error:", error.message)

          if (error.response?.status === 401) {
            throw new Error("INVALID_CREDENTIALS")
          } else if (error.code === 'ECONNABORTED') {
            throw new Error("CONNECTION_TIMEOUT")
          }

          throw new Error("AUTHENTICATION_FAILED")
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id || ""
        token.role = user.role || ""
        token.accessToken = user.accessToken || ""
        token.iat = Math.floor(Date.now() / 1000)
      }

      // Handle session update trigger
      if (trigger === "update" && session) {
        token = { ...token, ...session }
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.accessToken = token.accessToken as string
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 12 * 60 * 60, // 12 hours (more secure than 24h)
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  trustHost: true,
  debug: process.env.NODE_ENV === 'development',
})
```

---

## 5. React Query v5 Configuration Analysis

### Files: `/frontend/src/lib/queryClient.ts`, `/frontend/src/lib/queryKeys.ts`

#### Current Implementation

**EXCELLENT:** 9/10

**STRENGTHS:**
- Proper QueryClient configuration with sensible defaults
- Centralized query keys (best practice)
- Good staleTime (5 minutes) and gcTime (30 minutes)
- Performance fix: `refetchOnWindowFocus: false` (prevents excessive polling)
- Comprehensive query key structure

**MINOR IMPROVEMENTS:**

```typescript
// queryClient.ts - Add error boundary integration
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false, // Performance optimization
      refetchOnReconnect: true,
      refetchOnMount: true,

      // Add meta for error tracking
      meta: {
        errorBoundary: true,
      },
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // Never retry mutations on client errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 1;
      },

      // Add meta for error tracking
      meta: {
        errorBoundary: true,
      },
    },
  },
});

// Add global error handler
queryClient.setDefaultOptions({
  queries: {
    ...queryClient.getDefaultOptions().queries,
    throwOnError: (error: any) => {
      // Don't throw on expected errors (4xx)
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return true; // Throw on server errors (5xx) for error boundary
    },
  },
});
```

---

## 6. API Client Architecture Analysis

### File: `/frontend/src/lib/api.ts`

#### Current Implementation

**EXCELLENT:** 9/10

**STRENGTHS:**
- Centralized axios instances
- Proper token management with `createAuthenticatedClient()`
- Comprehensive TypeScript interfaces
- Good error handling with interceptors
- Well-organized API modules (authAPI, jobsAPI, etc.)

**ISSUES:**

1. **Legacy Clerk References** - `clerk_id` still in User interface
2. **Inconsistent API Structure** - Mix of `candidateAPI` and `candidatesAPI`
3. **No Request Retry Logic** - Should retry on network failures
4. **No Request Deduplication** - Same requests can fire multiple times
5. **Hardcoded Redirect** - `window.location.href = '/sign-in'` should use router

**RECOMMENDATIONS:**

```typescript
import axios, { AxiosInstance, AxiosError } from 'axios';
import { QueryClient } from '@tanstack/react-query';

// Create base client with interceptors
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Add request ID for debugging
apiClient.interceptors.request.use((config) => {
  config.headers['X-Request-ID'] = `${Date.now()}-${Math.random().toString(36)}`;
  return config;
});

// Enhanced error interceptor with retry logic
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config;

    // Don't retry on client errors (4xx)
    if (error.response?.status && error.response.status >= 400 && error.response.status < 500) {
      if (error.response.status === 401) {
        // Token expired - redirect to signin
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
          window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
        }
      }
      return Promise.reject(error);
    }

    // Retry on network errors or 5xx errors
    if (!config || (config as any)._retry) {
      return Promise.reject(error);
    }

    (config as any)._retry = true;

    // Exponential backoff
    await new Promise(resolve => setTimeout(resolve, 1000));

    return apiClient(config);
  }
);

// Factory function for authenticated clients
export const createAuthenticatedClient = (token: string): AxiosInstance => {
  const client = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    timeout: 30000,
  });

  // Same interceptors as base client
  client.interceptors.request.use((config) => {
    config.headers['X-Request-ID'] = `${Date.now()}-${Math.random().toString(36)}`;
    return config;
  });

  return client;
};

// Clean up User interface - remove legacy Clerk field
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'candidate' | 'employer' | 'admin';
  is_active: boolean;
  has_completed_profile: boolean;
  // clerk_id removed - legacy field no longer needed
}
```

---

## 7. Custom React Query Hooks Analysis

### Files: `/frontend/src/hooks/useJobs.ts`, `/frontend/src/hooks/useApplications.ts`

#### Current Implementation

**EXCEPTIONAL:** 10/10

**STRENGTHS:**
- Excellent separation of queries and mutations
- Proper optimistic updates with rollback
- Comprehensive cache invalidation strategy
- Good error handling with user feedback (toast)
- Type-safe with TypeScript
- Context-aware (onMutate, onSuccess, onError)

**BEST PRACTICES DEMONSTRATED:**
- Optimistic UI updates
- Automatic cache invalidation
- Error rollback on mutation failure
- Toast notifications for user feedback
- Query key management

**NO CHANGES NEEDED** - This is production-ready code!

---

## 8. App Router Structure Analysis

### Current Structure

```
/frontend/src/app/
├── auth/
│   ├── signin/page.tsx
│   ├── signup/page.tsx
│   ├── forgot-password/page.tsx
│   └── reset-password/page.tsx
├── dashboard/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── candidates/page.tsx
│   ├── company/page.tsx
│   ├── job-posts/page.tsx
│   ├── jobs/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── applications/page.tsx
│   ├── settings/page.tsx
│   └── admin/page.tsx
├── onboarding/
│   ├── page.tsx
│   └── employer/page.tsx
├── layout.tsx
└── page.tsx
```

**SCORE:** 7/10

**MISSING CRITICAL FILES:**

1. **No `loading.tsx` files** - No loading states for routes
2. **No `error.tsx` files** - No error boundaries for routes
3. **No `not-found.tsx` files** - No custom 404 pages
4. **No parallel routes** - Could use `@modal` for job modals
5. **No route groups** - Could organize by user role

**RECOMMENDED STRUCTURE:**

```
/frontend/src/app/
├── (auth)/
│   ├── layout.tsx
│   └── auth/
│       ├── signin/
│       │   ├── page.tsx
│       │   ├── loading.tsx
│       │   └── error.tsx
│       ├── signup/
│       │   ├── page.tsx
│       │   ├── loading.tsx
│       │   └── error.tsx
│       ├── forgot-password/
│       │   ├── page.tsx
│       │   └── loading.tsx
│       └── reset-password/
│           ├── page.tsx
│           └── loading.tsx
├── (dashboard)/
│   ├── layout.tsx
│   ├── loading.tsx
│   ├── error.tsx
│   └── dashboard/
│       ├── page.tsx
│       ├── loading.tsx
│       ├── error.tsx
│       ├── (candidate)/
│       │   ├── candidates/
│       │   │   ├── page.tsx
│       │   │   ├── loading.tsx
│       │   │   └── error.tsx
│       │   └── applications/
│       │       ├── page.tsx
│       │       ├── loading.tsx
│       │       └── error.tsx
│       ├── (employer)/
│       │   ├── job-posts/
│       │   │   ├── page.tsx
│       │   │   ├── loading.tsx
│       │   │   ├── error.tsx
│       │   │   └── [id]/
│       │   │       ├── page.tsx
│       │   │       ├── loading.tsx
│       │   │       └── error.tsx
│       │   └── company/
│       │       ├── page.tsx
│       │       ├── loading.tsx
│       │       └── error.tsx
│       ├── (shared)/
│       │   ├── jobs/
│       │   │   ├── page.tsx
│       │   │   ├── loading.tsx
│       │   │   ├── error.tsx
│       │   │   └── @modal/
│       │   │       └── [id]/
│       │   │           └── page.tsx
│       │   └── settings/
│       │       ├── page.tsx
│       │       ├── loading.tsx
│       │       └── error.tsx
│       └── (admin)/
│           └── admin/
│               ├── page.tsx
│               ├── loading.tsx
│               └── error.tsx
├── layout.tsx
├── loading.tsx
├── error.tsx
├── not-found.tsx
└── page.tsx
```

---

## 9. Environment Variables Analysis

### File: `/frontend/.env.local.example`

**GOOD:**
- Clear variable names
- Required variables documented
- API URL includes `/api` suffix note

**MISSING:**

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-min-32-characters-same-as-backend
AUTH_SECRET=your-nextauth-secret-key-min-32-characters-same-as-backend

# Backend API URL (MUST include /api suffix)
NEXT_PUBLIC_API_URL=http://localhost:8001/api

# Environment
NODE_ENV=development

# Feature Flags (NEW)
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_DEBUG=true
NEXT_PUBLIC_ENABLE_DEVTOOLS=true

# Performance Monitoring (NEW)
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_VERCEL_ANALYTICS=false

# API Timeouts (NEW)
NEXT_PUBLIC_API_TIMEOUT=30000

# Version Info (NEW)
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_BUILD_TIME=
```

---

## 10. Middleware Analysis

### File: `/frontend/src/middleware.ts`

**GOOD:** 8/10

**STRENGTHS:**
- Proper authentication checks
- Public paths defined
- Callback URL preservation
- Auth page redirect prevention

**RECOMMENDATIONS:**

```typescript
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isAuthenticated = !!req.auth
  const userRole = req.auth?.user?.role

  // Public paths (accessible without authentication)
  const publicPaths = [
    '/',
    '/auth/signin',
    '/auth/signup',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/error',
    '/terms',
    '/privacy',
    '/api/auth', // NextAuth API routes
  ]

  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))

  // Allow public paths
  if (isPublicPath) {
    return NextResponse.next()
  }

  // Redirect unauthenticated users to signin
  if (!isAuthenticated && pathname.startsWith('/dashboard')) {
    const signInUrl = new URL('/auth/signin', req.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && pathname.startsWith('/auth/') && pathname !== '/auth/signout') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Role-based access control
  if (isAuthenticated && pathname.startsWith('/dashboard')) {
    // Admin routes
    if (pathname.startsWith('/dashboard/admin') && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Employer routes
    const employerRoutes = ['/dashboard/job-posts', '/dashboard/company']
    const isEmployerRoute = employerRoutes.some(route => pathname.startsWith(route))
    if (isEmployerRoute && userRole === 'candidate') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Candidate routes
    const candidateRoutes = ['/dashboard/candidates', '/dashboard/applications', '/dashboard/cv']
    const isCandidateRoute = candidateRoutes.some(route => pathname.startsWith(route))
    if (isCandidateRoute && userRole === 'employer') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|uploads).*)',
  ],
}
```

---

## 11. Performance Analysis

### Current Performance

**Bundle Sizes:**
- `node_modules`: 724 MB (NORMAL for modern frameworks)
- `.next` build: 88 MB (ACCEPTABLE)

**OPTIMIZATIONS IMPLEMENTED:**
- React Query caching (excellent)
- `refetchOnWindowFocus: false` (prevents excessive requests)
- Standalone output for Docker
- Font optimization with `next/font`

**MISSING OPTIMIZATIONS:**

1. **No Lazy Loading** - Components not code-split
2. **No Dynamic Imports** - Heavy components loaded upfront
3. **No Bundle Analysis** - Can't track bundle size growth
4. **No Compression** - No gzip/brotli in next.config
5. **No Service Worker** - No offline capability
6. **No Image Optimization** - Not using `next/image` properly
7. **No Prefetching** - Link prefetch not configured

**RECOMMENDATIONS:**

```typescript
// Example: Dynamic imports for heavy components
// In dashboard/layout.tsx
import dynamic from 'next/dynamic';

const NotificationPanel = dynamic(() => import('@/components/NotificationPanel'), {
  loading: () => <div className="w-8 h-8 animate-pulse bg-gray-200 rounded" />,
  ssr: false, // Don't SSR notifications
});

// Example: Code splitting for admin panel
const AdminDashboard = dynamic(() => import('@/app/dashboard/admin/page'), {
  loading: () => <div>Loading admin panel...</div>,
});

// Example: Lazy load React Query Devtools
const ReactQueryDevtools = dynamic(
  () => import('@tanstack/react-query-devtools').then(mod => mod.ReactQueryDevtools),
  { ssr: false }
);
```

---

## 12. ESLint Configuration

### CRITICAL ISSUE: Missing ESLint Configuration

**STATUS:** No `.eslintrc.json` file exists

**IMPACT:**
- No consistent code style enforcement
- No automatic error detection
- No Next.js specific rules
- No accessibility checks

**REQUIRED FILE:** `/frontend/.eslintrc.json`

```json
{
  "extends": [
    "next/core-web-vitals",
    "next/typescript"
  ],
  "rules": {
    "@next/next/no-html-link-for-pages": "error",
    "@next/next/no-img-element": "warn",
    "react/no-unescaped-entities": "warn",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "@typescript-eslint/no-unused-vars": ["warn", {
      "argsIgnorePattern": "^_",
      "varsIgnorePattern": "^_"
    }],
    "@typescript-eslint/no-explicit-any": "warn",
    "no-console": ["warn", {
      "allow": ["warn", "error"]
    }]
  },
  "overrides": [
    {
      "files": ["*.tsx", "*.ts"],
      "rules": {
        "@typescript-eslint/explicit-module-boundary-types": "off"
      }
    }
  ]
}
```

---

## 13. Missing Features Analysis

### Critical Missing Features

#### 1. Loading States (`loading.tsx`)

**Create:** `/frontend/src/app/dashboard/loading.tsx`

```typescript
export default function DashboardLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    </div>
  );
}
```

#### 2. Error Boundaries (`error.tsx`)

**Create:** `/frontend/src/app/dashboard/error.tsx`

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Something went wrong
        </h2>
        <p className="text-gray-600 mb-6">
          {error.message || 'An unexpected error occurred'}
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try again
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Go to dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
```

#### 3. 404 Page (`not-found.tsx`)

**Create:** `/frontend/src/app/not-found.tsx`

```typescript
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <h1 className="text-9xl font-bold text-blue-600">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 mt-4">
          Page not found
        </h2>
        <p className="text-gray-600 mt-4 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
}
```

---

## 14. Security Analysis

### Current Security

**GOOD:**
- JWT authentication with NextAuth v5
- HTTPS enforcement in production
- Password hashing on backend
- Token expiration (24h)
- CORS configured on backend

**CRITICAL ISSUES:**

1. **No CSRF Protection** - NextAuth has built-in CSRF but needs configuration
2. **No Rate Limiting** - Frontend should handle 429 responses
3. **No Security Headers** - Missing in next.config.js
4. **No Content Security Policy** - XSS vulnerability
5. **Clerk Dependencies Still Installed** - Security risk from unused packages
6. **No Input Sanitization** - Forms don't sanitize HTML

**RECOMMENDATIONS:**

```bash
# Remove unused Clerk packages (security risk + bundle bloat)
npm uninstall @clerk/nextjs @clerk/themes
```

Add CSP headers in `next.config.js`:

```javascript
{
  key: 'Content-Security-Policy',
  value: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://intowork-dashboard-production.up.railway.app",
    "frame-ancestors 'none'",
  ].join('; ')
}
```

---

## 15. Dependency Analysis

### Current Dependencies

**CRITICAL ISSUE:** Legacy Clerk packages still installed

```json
{
  "@clerk/nextjs": "^6.36.3",  // ❌ REMOVE - Not used anymore
  "@clerk/themes": "^2.4.44",   // ❌ REMOVE - Not used anymore
}
```

**IMPACT:**
- Bundle bloat (~500KB+)
- Security vulnerability (unused code surface)
- Confusion for developers
- Potential conflicts

**RECOMMENDATIONS:**

```bash
# Remove Clerk
npm uninstall @clerk/nextjs @clerk/themes

# Add recommended packages
npm install --save-dev @next/bundle-analyzer
npm install --save-dev eslint-config-next
npm install zod react-hook-form @hookform/resolvers
npm install sharp # For image optimization
```

---

## 16. Monitoring and Analytics

### MISSING: No monitoring configured

**RECOMMENDATIONS:**

1. **Vercel Analytics** (if using Vercel)

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

2. **Sentry Error Tracking**

```bash
npm install @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: false,
  environment: process.env.NODE_ENV,
});
```

3. **Web Vitals Reporting**

```typescript
// app/layout.tsx
'use client';

import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    console.log(metric);
    // Send to analytics service
  });

  return null;
}
```

---

## 17. Testing Strategy

### MISSING: No testing configuration

**RECOMMENDATIONS:**

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom
npm install --save-dev @playwright/test
```

Create `jest.config.js`:

```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

module.exports = createJestConfig(customJestConfig);
```

---

## Summary of Critical Actions

### Immediate Priority (Today)

1. ✅ Create `tailwind.config.ts` file
2. ✅ Create `.eslintrc.json` file
3. ✅ Remove Clerk dependencies (`npm uninstall @clerk/nextjs @clerk/themes`)
4. ✅ Add security headers to `next.config.js`
5. ✅ Create global `loading.tsx`, `error.tsx`, `not-found.tsx`

### High Priority (This Week)

6. ✅ Add bundle analyzer and analyze bundle size
7. ✅ Implement dynamic imports for heavy components
8. ✅ Add Sentry or error tracking
9. ✅ Add Web Vitals monitoring
10. ✅ Clean up `User` interface (remove `clerk_id`)

### Medium Priority (This Month)

11. ✅ Reorganize App Router with route groups
12. ✅ Add loading/error states to all routes
13. ✅ Implement parallel routes for modals
14. ✅ Add unit tests with Jest
15. ✅ Add E2E tests with Playwright

### Low Priority (Future)

16. ✅ Add PWA support (service worker, manifest)
17. ✅ Implement refresh tokens for JWT
18. ✅ Add i18n support (internationalization)
19. ✅ Implement dark mode toggle
20. ✅ Add accessibility audit with axe-core

---

## Final Recommendations

### Architecture Grade: B+ (80/100)

**Breakdown:**
- Next.js 14+ Configuration: 7/10 (missing critical config files)
- TypeScript Setup: 10/10 (excellent)
- Authentication (NextAuth): 8/10 (good, needs CSRF)
- React Query: 10/10 (exceptional)
- API Client: 9/10 (very good)
- App Router: 7/10 (needs loading/error states)
- Performance: 6/10 (needs optimization)
- Security: 6/10 (needs headers and cleanup)
- Testing: 0/10 (not implemented)
- Monitoring: 0/10 (not implemented)

**Overall Assessment:**

The IntoWork Dashboard frontend has a **solid foundation** with excellent React Query implementation and proper NextAuth v5 setup. However, it's missing **critical production-ready features** like error boundaries, security headers, testing, and monitoring.

**To reach production-grade (90+):**
1. Implement all immediate priority items
2. Add comprehensive testing
3. Set up monitoring and error tracking
4. Optimize bundle size and performance
5. Complete security hardening

The codebase shows **good architectural decisions** but needs **operational maturity** to be production-ready.

---

**Document Version:** 1.0
**Last Updated:** January 6, 2026
**Reviewed By:** Next.js Specialist Agent
