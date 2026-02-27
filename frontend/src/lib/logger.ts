/**
 * Logger sécurisé - Ne log qu'en environnement de développement
 * Évite l'exposition d'informations sensibles en production
 */

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Logger sécurisé qui ne fonctionne qu'en développement
 */
export const logger = {
  /**
   * Log d'information (désactivé en production)
   */
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  /**
   * Log d'erreur (actif uniquement en développement)
   * En production, les erreurs doivent être capturées par un service externe (Sentry, etc.)
   */
  error: (...args: any[]) => {
    if (isDevelopment) {
      console.error(...args);
    }
    // En production, vous pouvez envoyer les erreurs à un service de monitoring
    // comme Sentry, LogRocket, etc.
  },

  /**
   * Log d'avertissement (désactivé en production)
   */
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },

  /**
   * Log d'information de debug (désactivé en production)
   */
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },

  /**
   * Log de debug détaillé (désactivé en production)
   */
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  }
};

/**
 * Helper pour logger les erreurs avec contexte
 */
export const logError = (context: string, error: any) => {
  if (isDevelopment) {
    console.error(`[${context}]`, error);
  }
  // En production, envoyer à un service de monitoring
};

/**
 * Helper pour logger des informations de debug
 */
export const logDebug = (context: string, ...data: any[]) => {
  if (isDevelopment) {
    console.log(`[DEBUG ${context}]`, ...data);
  }
};
