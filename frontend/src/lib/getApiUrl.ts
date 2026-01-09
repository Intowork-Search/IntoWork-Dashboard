/**
 * Get API URL with HTTPS enforced in production
 * This function ensures all API calls use HTTPS in production
 * to prevent Mixed Content errors.
 */
export const getApiUrl = (): string => {
  // ALWAYS return HTTPS URL - no conditions, no variables
  // This is hardcoded to prevent any cache or env variable issues
  return 'https://intowork-dashboard-production-1ede.up.railway.app/api';
};
