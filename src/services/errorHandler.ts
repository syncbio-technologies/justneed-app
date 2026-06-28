/**
 * Centralized error handling for API calls
 */

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof TypeError) {
    // Network error
    const message = error.message || 'Network error';
    console.error('[handleApiError] TypeError:', message);
    return new ApiError(
      0,
      `Network error: ${message}. Check your API URL and backend connection.`,
      error
    );
  }

  if (error instanceof Error) {
    console.error('[handleApiError] Error:', error.message);
    return new ApiError(500, error.message, error);
  }

  console.error('[handleApiError] Unknown error:', error);
  return new ApiError(500, 'An unknown error occurred', undefined);
};

export const getErrorMessage = (error: unknown): string => {
  const apiError = handleApiError(error);
  
  switch (apiError.statusCode) {
    case 0:
      return apiError.message; // Already has detailed message
    case 401:
      return 'Session expired. Please log in again.';
    case 403:
      return 'You do not have permission to access this resource.';
    case 404:
      return 'Resource not found.';
    case 500:
      return 'Server error. Please try again later.';
    case 503:
      return 'Service unavailable. Please try again later.';
    default:
      return apiError.message || 'An error occurred. Please try again.';
  }
};
