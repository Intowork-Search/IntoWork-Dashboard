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

  // Validation: In production (HTTPS site), enforce HTTPS API
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    if (apiUrl.startsWith('http://')) {
      // Auto-correct HTTP to HTTPS in production to prevent Mixed Content errors
      console.warn('⚠️ Auto-correcting API URL from HTTP to HTTPS for production');
      apiUrl = apiUrl.replace('http://', 'https://');
    }
  }

  return apiUrl;
};
// Force rebuild 1768483871
