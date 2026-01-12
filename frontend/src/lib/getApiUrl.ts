/**
 * Get API URL with environment-aware configuration
 * - Development: Uses NEXT_PUBLIC_API_URL from .env.local (http://localhost:8001/api)
 * - Production: Uses NEXT_PUBLIC_API_URL from Vercel env vars (https://...)
 *
 * This prevents Mixed Content errors while allowing local development.
 */
export const getApiUrl = (): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error(
      'NEXT_PUBLIC_API_URL is not defined. ' +
      'Please set it in .env.local (development) or Vercel dashboard (production)'
    );
  }

  // Validation: In production (HTTPS site), enforce HTTPS API
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    if (!apiUrl.startsWith('https://')) {
      console.error('Mixed Content Warning: API URL must use HTTPS in production');
      console.error('Current API URL:', apiUrl);
      throw new Error(
        'Security Error: Cannot use HTTP API URL on HTTPS site (Mixed Content blocked by browser)'
      );
    }
  }

  return apiUrl;
};
