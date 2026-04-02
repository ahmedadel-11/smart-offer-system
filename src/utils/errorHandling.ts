/**
 * Error Handling Utilities
 * Centralized error handling logic for mutations and API calls
 * Provides consistent error messages, logging, and user notifications
 */

import toast from 'react-hot-toast';

// Error response structure from API
export interface ErrorResponse {
  response?: {
    status?: number;
    data?: {
      message?: string;
      error?: string;
      errors?: Record<string, string[]>;
    };
  };
  message?: string;
}

/**
 * Extract meaningful error message from various error sources
 * @param error Error object (Axios, network, or custom)
 * @param defaultMessage Fallback message if error parsing fails
 * @returns Human-readable error message
 */
export const getErrorMessage = (
  error: any,
  defaultMessage: string = 'An error occurred'
): string => {
  // API error with response
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  // Multiple validation errors
  if (error?.response?.data?.errors && typeof error.response.data.errors === 'object') {
    return Object.values(error.response.data.errors)
      .flat()
      .join(', ');
  }

  // Generic API error
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }

  // Standard error message
  if (error?.message) {
    return error.message;
  }

  return defaultMessage;
};

/**
 * Check if error is a permission/authorization error
 * @param error Error object
 * @returns true if 403 Forbidden or 401 Unauthorized
 */
export const isPermissionError = (error: any): boolean => {
  return error?.response?.status === 403 || error?.response?.status === 401;
};

/**
 * Check if error is a server error (5xx)
 * @param error Error object
 * @returns true if server error
 */
export const isServerError = (error: any): boolean => {
  return error?.response?.status >= 500;
};

/**
 * Check if error is a client error (4xx)
 * @param error Error object
 * @returns true if client error
 */
export const isClientError = (error: any): boolean => {
  const status = error?.response?.status;
  return status >= 400 && status < 500;
};

/**
 * Handle mutation error with automatic toast notification
 * Custom permission message can be provided
 * 
 * @param error Error object
 * @param options Configuration options
 * @example
 * onError: (error) => handleMutationError(error, {
 *   action: 'update this project',
 *   permissionMessage: 'Only project owners can update'
 * })
 */
export interface HandleMutationErrorOptions {
  action?: string;
  permissionMessage?: string;
  skipToast?: boolean;
  onError?: (message: string) => void;
}

export const handleMutationError = (
  error: any,
  options: HandleMutationErrorOptions = {}
): void => {
  const {
    action = 'perform this action',
    permissionMessage,
    skipToast = false,
    onError,
  } = options;

  let message: string;

  if (isPermissionError(error)) {
    message = permissionMessage || `You do not have permission to ${action}`;
  } else if (isServerError(error)) {
    message = 'Server error. Please try again later.';
  } else {
    message = getErrorMessage(error, `Failed to ${action}`);
  }

  if (!skipToast) {
    toast.error(message);
  }

  onError?.(message);

  // Optional: Log error for debugging
  if (import.meta.env.DEV) {
    console.error(`[Error: ${action}]`, error, message);
  }
};

/**
 * Handle query error (read-only operations)
 * Usually quieter than mutations
 */
export interface HandleQueryErrorOptions {
  skipToast?: boolean;
  queryName?: string;
  onError?: (message: string) => void;
}

export const handleQueryError = (
  error: any,
  options: HandleQueryErrorOptions = {}
): void => {
  const {
    skipToast = false,
    queryName = 'data',
    onError,
  } = options;

  if (isServerError(error)) {
    const message = 'Failed to load ' + queryName;
    if (!skipToast) {
      toast.error(message);
    }
    onError?.(message);
  }

  // Don't toast for 4xx errors on queries (handled by UI)
};

/**
 * Create a standardized error handler for mutations
 * Reduces boilerplate in hooks
 * 
 * @param action Description of the action for error messages
 * @param options Additional options
 * @returns Error handler function
 * 
 * @example
 * const onError = createMutationErrorHandler('delete user');
 * const mutation = useMutation({
 *   mutationFn: deleteUser,
 *   onError
 * })
 */
export const createMutationErrorHandler = (
  action: string,
  options: Omit<HandleMutationErrorOptions, 'action'> = {}
) => {
  return (error: any) => {
    handleMutationError(error, { ...options, action });
  };
};

/**
 * Validate error response structure
 * Useful for debugging API integration issues
 */
export const validateErrorResponse = (error: any): boolean => {
  if (!error) return false;
  if (error?.response?.status && error?.response?.data) return true;
  if (error?.message) return true;
  return false;
};
