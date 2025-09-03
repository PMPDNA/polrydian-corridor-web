import { useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { CSRFProtection } from '@/lib/csrf-protection'

interface SecurityMiddlewareProps {
  children: React.ReactNode
}

export function SecurityMiddleware({ children }: SecurityMiddlewareProps) {
  const { toast } = useToast()

  useEffect(() => {
    // Initialize security measures
    const initializeSecurity = async () => {
      try {
        // Initialize CSRF protection
        CSRFProtection.initialize()

        // Set up security headers validation
        if (typeof window !== 'undefined') {
          // Check for secure context
          if (!window.isSecureContext) {
            console.warn('🔒 Application not running in secure context (HTTPS)')
          }

          // Monitor for CSP violations
          document.addEventListener('securitypolicyviolation', (event) => {
            console.error('🚨 CSP Violation:', {
              directive: event.violatedDirective,
              blocked: event.blockedURI,
              original: event.originalPolicy
            })

            // Log security event
            supabase.from('security_audit_log').insert({
              action: 'csp_violation',
              details: {
                directive: event.violatedDirective,
                blocked_uri: event.blockedURI,
                severity: 'medium'
              }
            }).then()
          })

          // Monitor authentication state changes for security logging
          supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
              supabase.from('security_audit_log').insert({
                action: 'user_login_success',
                details: {
                  timestamp: new Date().toISOString(),
                  user_id: session.user.id,
                  severity: 'low'
                }
              }).then()
            } else if (event === 'SIGNED_OUT') {
              supabase.from('security_audit_log').insert({
                action: 'user_logout',
                details: {
                  timestamp: new Date().toISOString(),
                  severity: 'low'
                }
              }).then()
            }
          })
        }
      } catch (error) {
        console.error('Security initialization error:', error)
        toast({
          variant: "destructive",
          title: "Security Warning",
          description: "Some security features may not be fully active."
        })
      }
    }

    initializeSecurity()
  }, [toast])

  return <>{children}</>
}