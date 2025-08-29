// Safe utilities for environment and browser API access

/**
 * Safely get the current origin, handling SSR and undefined cases
 */
export const getOrigin = (): string => {
  if (typeof window === 'undefined') {
    return '';
  }
  return window.location?.origin || '';
};

/**
 * Safely access environment variables with defaults
 */
export const safeEnv = {
  get: (key: string, fallback: string = ''): string => {
    try {
      return import.meta.env?.[key] || fallback;
    } catch {
      return fallback;
    }
  },
  isDev: (): boolean => {
    try {
      return import.meta.env?.DEV === true;
    } catch {
      return false;
    }
  },
  isProd: (): boolean => {
    try {
      return import.meta.env?.PROD === true;
    } catch {
      return true; // Assume production if uncertain
    }
  }
};

/**
 * Safely access localStorage with error handling
 */
export const safeStorage = {
  get: (key: string, fallback: any = null): any => {
    try {
      if (typeof window === 'undefined') return fallback;
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  },
  set: (key: string, value: any): boolean => {
    try {
      if (typeof window === 'undefined') return false;
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  remove: (key: string): boolean => {
    try {
      if (typeof window === 'undefined') return false;
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }
};