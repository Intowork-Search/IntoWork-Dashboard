/**
 * Get API URL with environment-aware configuration
   * PRODUCTION FIX: Always returns HTTPS to prevent Mixed Content errors
 */
export const getApiUrl = (): string => {
  // ULTRA-SIMPLE FIX: Just return HTTPS URL
  // No conditions, no env vars, just the hardcoded HTTPS URL
  const url = 'https://intowork-dashboard-production-1ede.up.railway.app/api';
  
  console.log('🔧 getApiUrl called - returning:', url);
  console.log('🔧 NODE_ENV:', process.env.NODE_ENV);
  console.log('🔧 NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
  
  return url;
};
