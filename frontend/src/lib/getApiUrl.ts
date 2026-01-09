/**
 * Get API URL with HTTPS enforced in production
 * This function ensures all API calls use HTTPS in production
 * to prevent Mixed Content errors.
 */
export const getApiUrl = (): string => {
  // En production, toujours forcer l'URL HTTPS complète
  if (process.env.NODE_ENV === 'production') {
    return 'https://intowork-dashboard-production-1ede.up.railway.app/api';
  }
  
  // En développement, utiliser la variable d'environnement
  const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api';
  
  // Nettoyer et forcer HTTPS si nécessaire
  return url.replace(/^http:\/\//i, 'https://');
};
