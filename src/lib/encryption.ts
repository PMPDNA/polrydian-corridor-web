// Secure token encryption utilities
import { supabase } from '@/integrations/supabase/client'

// Client-side encryption (for reference - actual encryption happens server-side)
export const generateEncryptionKey = (): string => {
  // In production, this would be generated server-side and stored securely
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

// Placeholder for client-side token validation
export const validateTokenFormat = (token: string): boolean => {
  if (!token || typeof token !== 'string') return false
  
  // Basic token format validation
  if (token.length < 10) return false
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /^test_/i,
    /^demo_/i,
    /^placeholder/i,
    /^example/i
  ]
  
  return !suspiciousPatterns.some(pattern => pattern.test(token))
}

// Token masking for logs (show only first 6 and last 4 characters)
export const maskToken = (token: string): string => {
  if (!token || token.length < 12) return '***masked***'
  return `${token.substring(0, 6)}...${token.substring(token.length - 4)}`
}

// Secure token storage validation
export const validateTokenSecurity = (token: string): {
  isValid: boolean
  issues: string[]
} => {
  const issues: string[] = []
  
  if (!validateTokenFormat(token)) {
    issues.push('Invalid token format')
  }
  
  if (token.length < 20) {
    issues.push('Token appears too short for security')
  }
  
  // Check for common test/demo tokens
  if (/test|demo|example|placeholder/i.test(token)) {
    issues.push('Token appears to be a test/demo token')
  }
  
  return {
    isValid: issues.length === 0,
    issues
  }
}

// Log security events for token operations using secure edge function
export const logTokenEvent = async (event: string, details: Record<string, any> = {}) => {
  try {
    await supabase.functions.invoke('security-audit', {
      body: {
        action: `token_${event}`,
        details: {
          ...details,
          timestamp: new Date().toISOString(),
          client_info: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language
          }
        },
        severity: 'medium'
      }
    })
  } catch (error) {
    console.error('Failed to log token event:', error)
  }
}