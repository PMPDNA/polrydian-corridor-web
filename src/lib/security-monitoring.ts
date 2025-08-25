import { supabase } from '@/integrations/supabase/client'

// Enhanced security monitoring utilities
export interface SecurityEvent {
  action: string
  user_id?: string
  ip_address?: string
  user_agent?: string
  details?: Record<string, any>
}

// Get client IP address (best effort)
export const getClientIP = (): string | null => {
  // In production, this would be set by a reverse proxy
  if (typeof window === 'undefined') return null
  
  // Try to get from headers set by reverse proxy
  const headers = ['x-forwarded-for', 'x-real-ip', 'cf-connecting-ip']
  for (const header of headers) {
    const value = (document as any)[header]
    if (value) return value.split(',')[0].trim()
  }
  
  // Return null instead of invalid IP string
  return null
}

// Log security events with enhanced tracking
export const logSecurityEvent = async (event: SecurityEvent) => {
  try {
    // Use the secure security-audit edge function instead of direct table access
    const { data, error } = await supabase.functions.invoke('security-audit', {
      body: {
        action: event.action,
        details: {
          ...event.details,
          ip_address: event.ip_address || getClientIP(),
          user_agent: navigator.userAgent
        },
        severity: event.details?.severity || 'medium'
      }
    });

    if (error) {
      console.error('Failed to log security event:', error)
    }

    return { data, error }
  } catch (err) {
    console.error('Security logging error:', err)
    return { data: null, error: err }
  }
}

// Log failed authentication attempts
export const logFailedAuth = async (identifier: string, reason: string) => {
  await logSecurityEvent({
    action: 'failed_authentication',
    details: {
      identifier,
      reason,
      timestamp: new Date().toISOString()
    }
  })
}

// Log successful authentication
export const logSuccessfulAuth = async (user_id: string, method: string = 'email') => {
  await logSecurityEvent({
    action: 'successful_authentication',
    user_id,
    details: {
      method,
      timestamp: new Date().toISOString()
    }
  })
}

// Log suspicious activities
export const logSuspiciousActivity = async (activity: string, details?: Record<string, any>) => {
  await logSecurityEvent({
    action: 'suspicious_activity',
    details: {
      activity,
      ...details,
      timestamp: new Date().toISOString()
    }
  })
}

// Rate limiting with enhanced tracking
export const checkAndLogRateLimit = async (identifier: string, action: string) => {
  try {
    const { data, error } = await supabase.rpc('check_rate_limit', {
      identifier_value: identifier
    })

    if (error) {
      console.error('Rate limit check failed:', error)
      return true // Allow on error to prevent blocking legitimate users
    }

    if (!data) {
      // Rate limit exceeded - log the attempt
      await logSecurityEvent({
        action: 'rate_limit_exceeded',
        details: {
          identifier,
          blocked_action: action,
          timestamp: new Date().toISOString()
        }
      })
    }

    return data
  } catch (err) {
    console.error('Rate limit error:', err)
    return true // Allow on error
  }
}