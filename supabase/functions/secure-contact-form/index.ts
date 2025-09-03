import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Strict CORS headers for contact form
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://polrydian.com, https://d85f6385-6c6d-437f-978b-9196bd33e526.lovableproject.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-forwarded-for',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Extract client IP from headers
function extractClientIP(headers: Headers): string | null {
  const forwarded = headers.get('x-forwarded-for')
  const realIp = headers.get('x-real-ip')
  return forwarded?.split(',')[0]?.trim() || realIp || null
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Health check endpoint
  const url = new URL(req.url)
  if (url.searchParams.get('health') === '1' || url.pathname.includes('/health')) {
    console.log('🏥 Health check requested for secure-contact-form')
    return new Response(
      JSON.stringify({ 
        status: 'ok', 
        function: 'secure-contact-form',
        timestamp: new Date().toISOString(),
        service: 'Secure Contact Form API',
        rate_limiting: 'enabled',
        origin_validation: 'enabled'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Extract client information
    const clientIP = extractClientIP(req.headers)
    const userAgent = req.headers.get('user-agent') || 'Unknown'
    const origin = req.headers.get('origin')
    
    // Verify origin is allowed
    const allowedOrigins = ['https://polrydian.com', 'https://d85f6385-6c6d-437f-978b-9196bd33e526.lovableproject.com']
    if (origin && !allowedOrigins.includes(origin)) {
      console.log('Blocked request from unauthorized origin:', origin)
      return new Response('Unauthorized origin', { status: 403, headers: corsHeaders })
    }

    // Rate limiting check
    if (clientIP) {
      const { data: rateLimitOk } = await supabase
        .rpc('check_contact_form_rate_limit', { client_ip: clientIP })
      
      if (!rateLimitOk) {
        console.log('Rate limit exceeded for IP:', clientIP)
        
        // Log security event
        await supabase.rpc('log_security_audit_event', {
          p_action: 'contact_form_rate_limit_exceeded',
          p_details: { ip_address: clientIP, user_agent: userAgent },
          p_severity: 'medium',
          p_ip_address: clientIP
        })
        
        return new Response('Rate limit exceeded. Please try again later.', { 
          status: 429, 
          headers: corsHeaders 
        })
      }
    }

    // Parse and validate form data
    const formData = await req.json()
    const { first_name, last_name, email, company, phone, service_area, message, urgency_level } = formData
    
    // Basic validation
    if (!first_name || !last_name || !email || !message) {
      return new Response('Missing required fields', { status: 400, headers: corsHeaders })
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response('Invalid email format', { status: 400, headers: corsHeaders })
    }

    // Insert consultation booking
    const { data, error } = await supabase
      .from('consultation_bookings')
      .insert({
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        email: email.trim().toLowerCase(),
        company: company?.trim() || null,
        phone: phone?.trim() || null,
        service_area: service_area || null,
        message: message.trim(),
        urgency_level: urgency_level || 'standard',
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      throw new Error('Failed to save consultation request')
    }

    // Log successful submission
    await supabase.rpc('log_integration_event', {
      p_integration_type: 'contact_form',
      p_operation: 'secure_submission',
      p_status: 'success',
      p_request_data: { 
        booking_id: data.id,
        service_area: service_area,
        urgency_level: urgency_level 
      },
      p_user_id: null
    })

    console.log('Secure contact form submission successful:', data.id)

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Consultation request submitted successfully',
      id: data.id 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in secure-contact-form:', error)
    
    // Log error but don't expose details to client
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Unable to submit request. Please try again later.' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})