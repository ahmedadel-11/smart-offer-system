/**
 * Application Configuration Constants
 * Centralized configuration for API, cache, UI, and storage
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  TIMEOUT_MS: 30000,
  RETRY_ATTEMPTS: 1,
} as const;

// React Query Cache Configuration
export const CACHE_CONFIG = {
  STALE_TIME_MS: 5 * 60 * 1000, // 5 minutes
  GC_TIME_MS: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
  RETRY_COUNT: 1,
} as const;

// Toast/Notification Configuration
export const TOAST_CONFIG = {
  POSITION: 'top-right' as const,
  DURATION_MS: 4000,
  STYLE: {
    borderRadius: '8px',
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: 500,
  },
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'smartoffer_token',
  REFRESH_TOKEN: 'smartoffer_refresh_token',
  USER: 'smartoffer_user',
} as const;

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

// Feature Flags
export const FEATURES = {
  ENABLE_AUDIT_LOGGING: true,
  ENABLE_ANALYTICS: false,
  ENABLE_EXPERIMENTAL_FEATURES: false,
} as const;
