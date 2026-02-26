/**
 * Get API URL with environment-aware configuration
 * - Development: Uses NEXT_PUBLIC_API_URL from .env.local (http://localhost:8001/api)
 * - Production: Uses NEXT_PUBLIC_API_URL from Vercel env vars (https://...)
 *
 * This prevents Mixed Content errors while allowing local development.
 */
export const getApiUrl = (): string => {
  // CRITICAL FIX: Hardcode HTTPS in production to bypass Vercel cache issues
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    // ALWAYS return HTTPS Railway URL in production
    return 'https://intowork-dashboard-production-1ede.up.railway.app/api';
  }
  
  // Development: use environment variable
  let apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (!apiUrl) {
    // Fallback to localhost in development
    return 'http://localhost:8001/api';
  }

  return apiUrl;
};
// Force rebuild timestamp: 2026-02-26-19:00 - HARDCODE HTTPS FIX
