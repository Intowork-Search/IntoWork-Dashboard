/**
 * Shared API error interface for consistent error handling across the application
 *
 * This interface standardizes the structure of API errors from the backend,
 * making error handling more predictable and type-safe.
 *
 * @example
 * ```typescript
 * try {
 *   const response = await api.post('/endpoint', data);
 * } catch (error) {
 *   const apiError = error as APIError;
 *   const errorMessage = apiError.response?.data?.detail || apiError.message || 'An error occurred';
 *   toast.error(errorMessage);
 * }
 * ```
 */
export interface APIError {
  /**
   * The HTTP response object from the failed request
   */
  response?: {
    /**
     * Response data containing error details
     */
    data?: {
      /**
       * Detailed error message from the backend
       */
      detail?: string;
      /**
       * Additional error details (optional)
       */
      message?: string;
      /**
       * Error code (optional)
       */
      code?: string;
      /**
       * Validation errors for form fields (optional)
       */
      errors?: Record<string, string[]>;
    };
    /**
     * HTTP status code (e.g., 400, 401, 403, 404, 500)
     */
    status: number;
    /**
     * HTTP status text (e.g., "Bad Request", "Unauthorized")
     */
    statusText?: string;
  };
  /**
   * Generic error message (fallback when response is not available)
   */
  message: string;
  /**
   * Error name/type (e.g., "AxiosError", "NetworkError")
   */
  name?: string;
  /**
   * Original axios config (optional)
   */
  config?: any;
}

/**
 * Type guard to check if an error is an APIError
 *
 * @example
 * ```typescript
 * if (isAPIError(error)) {
 *   console.log('API Error:', error.response?.data?.detail);
 * }
 * ```
 */
export function isAPIError(error: any): error is APIError {
  return (
    error &&
    typeof error === 'object' &&
    ('response' in error || 'message' in error)
  );
}

/**
 * Extract error message from an APIError with fallback
 *
 * @param error - The error object
 * @param fallback - Fallback message if no error message is found
 * @returns The extracted error message
 *
 * @example
 * ```typescript
 * const errorMessage = getErrorMessage(error, 'Something went wrong');
 * toast.error(errorMessage);
 * ```
 */
export function getErrorMessage(error: any, fallback: string = 'An error occurred'): string {
  if (isAPIError(error)) {
    return error.response?.data?.detail || error.response?.data?.message || error.message || fallback;
  }
  return fallback;
}

/**
 * Check if error is a specific HTTP status code
 *
 * @example
 * ```typescript
 * if (isErrorStatus(error, 401)) {
 *   router.push('/auth/signin');
 * }
 * ```
 */
export function isErrorStatus(error: any, status: number): boolean {
  return isAPIError(error) && error.response?.status === status;
}

/**
 * Check if error is an authentication error (401 or 403)
 */
export function isAuthError(error: any): boolean {
  return isErrorStatus(error, 401) || isErrorStatus(error, 403);
}

/**
 * Check if error is a validation error (400 with validation details)
 */
export function isValidationError(error: any): boolean {
  return isErrorStatus(error, 400) && !!error.response?.data?.errors;
}
