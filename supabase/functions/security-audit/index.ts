import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCombinedHeaders, logSecurityEvent, extractClientIP } from '../_shared/security.ts'

interface SecurityEvent {
  action: string
  details?: Record<string, any>
  severity?: 'low' | 'medium' | 'high' | 'critical'
}

Deno.serve(async (req) => {
  const corsHeaders = getCombinedHeaders()

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Get client IP
    const clientIP = extractClientIP(req)
    
    // Parse request body
    const body: SecurityEvent = await req.json()
    
    // Validate required fields
    if (!body.action) {
      throw new Error('Security event action is required')
    }

    // Enhanced security event details
    const enhancedDetails = {
      ...body.details,
      client_ip: clientIP,
      user_agent: req.headers.get('user-agent') || '',
      timestamp: new Date().toISOString(),
      referer: req.headers.get('referer') || '',
      origin: req.headers.get('origin') || ''
    }

    // Log the security event
    await logSecurityEvent(
      supabase,
      body.action,
      enhancedDetails,
      body.severity || 'medium'
    )

    // Check for critical events and trigger additional security measures
    if (body.severity === 'critical') {
      console.log(`🚨 CRITICAL SECURITY EVENT: ${body.action}`, enhancedDetails)
      
      // Log additional critical event tracking
      await supabase.from('security_audit_log').insert({
        action: 'critical_security_alert',
        details: {
          original_event: body.action,
          alert_triggered: true,
          requires_investigation: true,
          ...enhancedDetails
        },
        ip_address: clientIP
      })
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Security event logged successfully',
        event_id: crypto.randomUUID()
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Security audit logging failed:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to log security event'
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})