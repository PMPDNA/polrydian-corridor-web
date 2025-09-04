import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { extractClientIP, getCombinedHeaders } from '../_shared/security.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-forwarded-for',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Get client IP for rate limiting and logging
    const clientIP = extractClientIP(req)
    
    // Check rate limit (5 requests per minute per IP for security auditing)
    const { data: rateLimitData, error: rateLimitError } = await supabase
      .rpc('check_edge_function_rate_limit', {
        function_name: 'security-audit',
        max_requests: 5,
        window_minutes: 1
      })
    
    if (rateLimitError || !rateLimitData) {
      console.error('Rate limit check failed:', rateLimitError)
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again later.',
          code: 'RATE_LIMIT_EXCEEDED'
        }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    // Parse request body for security event
    const { action, details, severity, user_id } = await req.json()
    
    // Validate required fields
    if (!action) {
      return new Response(
        JSON.stringify({ error: 'Action is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    // Use the secure RPC function for logging
    const { data, error } = await supabase
      .rpc('log_security_audit_event', {
        p_action: action,
        p_details: details || {},
        p_severity: severity || 'medium',
        p_ip_address: clientIP
      })
    
    if (error) {
      console.error('Failed to log security event:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to log security event' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        event_id: data,
        message: 'Security event logged successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
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