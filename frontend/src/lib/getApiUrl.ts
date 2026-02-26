/**
 * Get API URL with environment-aware configuration
 * - Development: Uses NEXT_PUBLIC_API_URL from .env.local (http://localhost:8001/api)
 * - Production: Uses NEXT_PUBLIC_API_URL from Vercel env vars (https://...)
 *
 * This prevents Mixed Content errors while allowing local development.
 */
export const getApiUrl = (): string => {
  let apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error(
      'NEXT_PUBLIC_API_URL is not defined. ' +
      'Please set it in .env.local (development) or Vercel dashboard (production)'
    );
  }

  // CRITICAL FIX: Force HTTPS in production (both client AND server-side)
  // Check NODE_ENV instead of window to work with SSR
  const isProduction = process.env.NODE_ENV === 'production';
  const isLocalhost = apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1');
  
  if (isProduction && !isLocalhost && apiUrl.startsWith('http://')) {
    // Always use HTTPS in production to prevent Mixed Content errors
    console.warn('⚠️ Auto-correcting API URL from HTTP to HTTPS for production');
    apiUrl = apiUrl.replace('http://', 'https://');
  }

  return apiUrl;
};
// Force rebuild timestamp: 2026-02-26-18:45 - Fix Mixed Content définitif
