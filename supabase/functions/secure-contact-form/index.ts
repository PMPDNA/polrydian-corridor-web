import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { maybeHealth, json, extractClientIP, logError } from '../_shared/http.ts'

serve(async (req) => {
  // Check for health endpoint first
  const healthResponse = maybeHealth(req, 'secure-contact-form')
  if (healthResponse) return healthResponse

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 })
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
    const allowedOrigins = [
      'https://polrydian.com', 
      'https://d85f6385-6c6d-437f-978b-9196bd33e526.lovableproject.com',
      'https://d85f6385-6c6d-437f-978b-9196bd33e526.sandbox.lovable.dev'
    ]
    if (origin && !allowedOrigins.includes(origin)) {
      console.log('Blocked request from unauthorized origin:', origin)
      return json({ error: 'Unauthorized origin' }, { status: 403 })
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
        
        return json({ error: 'Rate limit exceeded. Please try again later.' }, { status: 429 })
      }
    }

    // Parse and validate form data
    const formData = await req.json()
    const { first_name, last_name, email, company, phone, service_area, message, urgency_level } = formData
    
    // Basic validation
    if (!first_name || !last_name || !email || !message) {
      return json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return json({ error: 'Invalid email format' }, { status: 400 })
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

    return json({ 
      success: true, 
      message: 'Consultation request submitted successfully',
      id: data.id 
    })

  } catch (error) {
    logError('secure-contact-form', error)
    
    // Log error but don't expose details to client
    return json({ 
      success: false, 
      message: 'Unable to submit request. Please try again later.' 
    }, { status: 500 })
  }
})