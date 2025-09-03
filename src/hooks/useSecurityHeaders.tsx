import { useEffect } from 'react'

// Security headers implementation (CSRF only - CSP handled by security-csp.ts)
export const useSecurityHeaders = () => {
  useEffect(() => {
    // Only handle basic security meta tags, not CSP
    const setMetaTag = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`)
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute('name', name)
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', content)
    }

    // Basic security headers (non-CSP)
    setMetaTag('referrer', 'strict-origin-when-cross-origin')
    
    // Cleanup function
    return () => {
      // Could remove meta tags if needed
    }
  }, [])
}

// Hook for CSRF protection
export const useCSRFProtection = () => {
  const generateCSRFToken = (): string => {
    const token = crypto.getRandomValues(new Uint8Array(32))
      .reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '')
    
    // Store in sessionStorage
    sessionStorage.setItem('csrf_token', token)
    return token
  }

  const validateCSRFToken = (token: string): boolean => {
    const storedToken = sessionStorage.getItem('csrf_token')
    return storedToken === token
  }

  const getCSRFHeaders = (): Record<string, string> => {
    const token = sessionStorage.getItem('csrf_token')
    if (!token) {
      throw new Error('CSRF token not found. Please refresh the page.')
    }
    
    return {
      'X-CSRF-Token': token,
    }
  }

  return {
    generateCSRFToken,
    validateCSRFToken,
    getCSRFHeaders
  }
}

// Global security initialization
export const initializeSecurity = () => {
  // Initialize CSRF protection
  if (typeof window !== 'undefined' && !sessionStorage.getItem('csrf_token')) {
    const token = crypto.getRandomValues(new Uint8Array(32))
      .reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '')
    sessionStorage.setItem('csrf_token', token)
  }
}

// Rate limiting hook
export const useRateLimit = (key: string, maxAttempts: number = 5, windowMs: number = 60000) => {
  const checkRateLimit = (): boolean => {
    const now = Date.now()
    const attempts = JSON.parse(localStorage.getItem(`rate_limit_${key}`) || '[]')
    
    // Filter out old attempts
    const recentAttempts = attempts.filter((timestamp: number) => now - timestamp < windowMs)
    
    if (recentAttempts.length >= maxAttempts) {
      return false // Rate limit exceeded
    }
    
    // Add current attempt
    recentAttempts.push(now)
    localStorage.setItem(`rate_limit_${key}`, JSON.stringify(recentAttempts))
    
    return true // Allow request
  }

  const getRemainingTime = (): number => {
    const now = Date.now()
    const attempts = JSON.parse(localStorage.getItem(`rate_limit_${key}`) || '[]')
    
    if (attempts.length === 0) return 0
    
    const oldestValidAttempt = Math.min(...attempts.filter((timestamp: number) => now - timestamp < windowMs))
    return Math.max(0, windowMs - (now - oldestValidAttempt))
  }

  return {
    checkRateLimit,
    getRemainingTime
  }
}