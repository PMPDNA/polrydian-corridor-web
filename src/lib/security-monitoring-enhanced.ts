import { supabase } from '@/integrations/supabase/client'
import { logSecurityEvent } from './security-monitoring'

// Enhanced security monitoring with alerting and metrics
export interface SecurityAlert {
  level: 'low' | 'medium' | 'high' | 'critical'
  type: string
  message: string
  details: Record<string, any>
  timestamp: string
}

export interface SecurityMetrics {
  failedLogins: number
  suspiciousActivities: number
  rateLimitViolations: number
  tokenEvents: number
  period: 'hour' | 'day' | 'week'
}

// Security alert thresholds
const ALERT_THRESHOLDS = {
  FAILED_LOGINS_PER_HOUR: 10,
  FAILED_LOGINS_PER_IP_HOUR: 5,
  RATE_LIMIT_VIOLATIONS_HOUR: 20,
  SUSPICIOUS_ACTIVITIES_HOUR: 5,
  TOKEN_ERRORS_HOUR: 3
}

// Track security events for alerting
const securityEventTracker = new Map<string, number>()

// Generate security alert
export const generateSecurityAlert = async (alert: SecurityAlert) => {
  try {
    // Log the alert
    await logSecurityEvent({
      action: 'security_alert',
      details: {
        alert_level: alert.level,
        alert_type: alert.type,
        alert_message: alert.message,
        alert_details: alert.details,
        timestamp: alert.timestamp
      }
    })

    // In production, this would integrate with alerting systems
    if (alert.level === 'critical' || alert.level === 'high') {
      console.error('🚨 Security Alert:', alert)
      
      // Could integrate with services like:
      // - Email notifications
      // - Slack webhooks
      // - PagerDuty
      // - SMS alerts
    } else {
      console.warn('⚠️ Security Warning:', alert)
    }

    return true
  } catch (error) {
    console.error('Failed to generate security alert:', error)
    return false
  }
}

// Track failed authentication attempts
export const trackFailedAuth = async (identifier: string, reason: string) => {
  const hour = new Date().getHours()
  const hourKey = `failed_auth_${hour}`
  const ipHourKey = `failed_auth_ip_${identifier}_${hour}`
  
  // Increment counters
  securityEventTracker.set(hourKey, (securityEventTracker.get(hourKey) || 0) + 1)
  securityEventTracker.set(ipHourKey, (securityEventTracker.get(ipHourKey) || 0) + 1)
  
  // Check thresholds
  const totalFailures = securityEventTracker.get(hourKey) || 0
  const ipFailures = securityEventTracker.get(ipHourKey) || 0
  
  if (totalFailures >= ALERT_THRESHOLDS.FAILED_LOGINS_PER_HOUR) {
    await generateSecurityAlert({
      level: 'high',
      type: 'excessive_failed_logins',
      message: `${totalFailures} failed login attempts in the last hour`,
      details: { threshold: ALERT_THRESHOLDS.FAILED_LOGINS_PER_HOUR, actual: totalFailures },
      timestamp: new Date().toISOString()
    })
  }
  
  if (ipFailures >= ALERT_THRESHOLDS.FAILED_LOGINS_PER_IP_HOUR) {
    await generateSecurityAlert({
      level: 'medium',
      type: 'suspicious_ip_activity',
      message: `${ipFailures} failed login attempts from IP ${identifier} in the last hour`,
      details: { identifier, threshold: ALERT_THRESHOLDS.FAILED_LOGINS_PER_IP_HOUR, actual: ipFailures },
      timestamp: new Date().toISOString()
    })
  }
}

// Track rate limit violations
export const trackRateLimitViolation = async (identifier: string, action: string) => {
  const hour = new Date().getHours()
  const hourKey = `rate_limit_${hour}`
  
  securityEventTracker.set(hourKey, (securityEventTracker.get(hourKey) || 0) + 1)
  
  const violations = securityEventTracker.get(hourKey) || 0
  
  if (violations >= ALERT_THRESHOLDS.RATE_LIMIT_VIOLATIONS_HOUR) {
    await generateSecurityAlert({
      level: 'medium',
      type: 'excessive_rate_limiting',
      message: `${violations} rate limit violations in the last hour`,
      details: { threshold: ALERT_THRESHOLDS.RATE_LIMIT_VIOLATIONS_HOUR, actual: violations },
      timestamp: new Date().toISOString()
    })
  }
}

// Track suspicious activities
export const trackSuspiciousActivity = async (activity: string, details: Record<string, any>) => {
  const hour = new Date().getHours()
  const hourKey = `suspicious_${hour}`
  
  securityEventTracker.set(hourKey, (securityEventTracker.get(hourKey) || 0) + 1)
  
  const activities = securityEventTracker.get(hourKey) || 0
  
  // Always log suspicious activities
  await logSecurityEvent({
    action: 'suspicious_activity',
    details: {
      activity,
      ...details,
      timestamp: new Date().toISOString()
    }
  })
  
  if (activities >= ALERT_THRESHOLDS.SUSPICIOUS_ACTIVITIES_HOUR) {
    await generateSecurityAlert({
      level: 'high',
      type: 'multiple_suspicious_activities',
      message: `${activities} suspicious activities detected in the last hour`,
      details: { threshold: ALERT_THRESHOLDS.SUSPICIOUS_ACTIVITIES_HOUR, actual: activities },
      timestamp: new Date().toISOString()
    })
  }
}

// Track token-related security events
export const trackTokenEvent = async (event: string, details: Record<string, any>) => {
  const hour = new Date().getHours()
  const hourKey = `token_error_${hour}`
  
  if (event.includes('error') || event.includes('invalid')) {
    securityEventTracker.set(hourKey, (securityEventTracker.get(hourKey) || 0) + 1)
    
    const errors = securityEventTracker.get(hourKey) || 0
    
    if (errors >= ALERT_THRESHOLDS.TOKEN_ERRORS_HOUR) {
      await generateSecurityAlert({
        level: 'medium',
        type: 'token_security_issues',
        message: `${errors} token-related security issues in the last hour`,
        details: { threshold: ALERT_THRESHOLDS.TOKEN_ERRORS_HOUR, actual: errors },
        timestamp: new Date().toISOString()
      })
    }
  }
  
  // Log all token events
  await logSecurityEvent({
    action: `token_${event}`,
    details: {
      ...details,
      timestamp: new Date().toISOString()
    }
  })
}

// Get security metrics for dashboard
export const getSecurityMetrics = async (period: 'hour' | 'day' | 'week' = 'day'): Promise<SecurityMetrics> => {
  try {
    const now = new Date()
    let startTime: Date
    
    switch (period) {
      case 'hour':
        startTime = new Date(now.getTime() - 60 * 60 * 1000)
        break
      case 'day':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case 'week':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
    }
    
    const { data: securityEvents, error } = await supabase
      .from('security_audit_log')
      .select('action, created_at')
      .gte('created_at', startTime.toISOString())
    
    if (error) throw error
    
    const metrics: SecurityMetrics = {
      failedLogins: 0,
      suspiciousActivities: 0,
      rateLimitViolations: 0,
      tokenEvents: 0,
      period
    }
    
    securityEvents?.forEach(event => {
      switch (event.action) {
        case 'failed_authentication':
          metrics.failedLogins++
          break
        case 'suspicious_activity':
          metrics.suspiciousActivities++
          break
        case 'rate_limit_exceeded':
          metrics.rateLimitViolations++
          break
        default:
          if (event.action.startsWith('token_')) {
            metrics.tokenEvents++
          }
      }
    })
    
    return metrics
  } catch (error) {
    console.error('Failed to get security metrics:', error)
    return {
      failedLogins: 0,
      suspiciousActivities: 0,
      rateLimitViolations: 0,
      tokenEvents: 0,
      period
    }
  }
}

// Clean up old tracking data (call periodically)
export const cleanupSecurityTracking = () => {
  const currentHour = new Date().getHours()
  
  // Remove tracking data older than 24 hours
  for (const [key] of securityEventTracker) {
    if (key.includes('_')) {
      const keyHour = parseInt(key.split('_').pop() || '0')
      const hourDiff = (currentHour - keyHour + 24) % 24
      
      if (hourDiff > 1) { // Keep only current and previous hour
        securityEventTracker.delete(key)
      }
    }
  }
}

// Initialize periodic cleanup
if (typeof window !== 'undefined') {
  // Clean up every hour
  setInterval(cleanupSecurityTracking, 60 * 60 * 1000)
}