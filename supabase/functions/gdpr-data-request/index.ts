import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DataRequest {
  email?: string
  visitor_id?: string
  request_type: 'deletion' | 'export' | 'rectification'
  reason?: string
  requested_data?: string[]
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get client IP address
    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    'unknown'

    if (req.method === 'POST') {
      const requestData: DataRequest = await req.json()

      // Validate request
      if (!requestData.email && !requestData.visitor_id) {
        return new Response(JSON.stringify({ error: 'Email or visitor ID required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Create GDPR data request
      const { data: gdprRequest, error: requestError } = await supabase
        .from('gdpr_deletion_requests')
        .insert({
          email: requestData.email,
          visitor_id: requestData.visitor_id,
          ip_address: clientIP,
          request_type: requestData.request_type,
          reason: requestData.reason,
          requested_data: requestData.requested_data ? { data_types: requestData.requested_data } : null,
          status: 'pending'
        })
        .select()
        .single()

      if (requestError) {
        console.error('GDPR request creation error:', requestError)
        throw requestError
      }

      // Log the data request
      await supabase
        .from('data_processing_log')
        .insert({
          visitor_id: requestData.visitor_id,
          action: 'requested',
          data_type: 'personal',
          purpose: `GDPR ${requestData.request_type} request`,
          legal_basis: 'legal_obligation'
        })

      // Handle data export immediately if requested
      if (requestData.request_type === 'export') {
        const exportData = await generateDataExport(supabase, requestData.email, requestData.visitor_id)
        
        return new Response(JSON.stringify({ 
          success: true, 
          request_id: gdprRequest?.id,
          data: exportData 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // For deletion and rectification, return request confirmation
      return new Response(JSON.stringify({ 
        success: true, 
        message: `${requestData.request_type} request submitted successfully`,
        request_id: gdprRequest?.id,
        status: 'pending'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (req.method === 'GET') {
      // Get GDPR request status
      const url = new URL(req.url)
      const requestId = url.searchParams.get('request_id')

      if (!requestId) {
        return new Response(JSON.stringify({ error: 'Request ID required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const { data: request, error } = await supabase
        .from('gdpr_deletion_requests')
        .select('id, request_type, status, created_at, processed_at')
        .eq('id', requestId)
        .single()

      if (error) {
        console.error('GDPR request status error:', error)
        throw error
      }

      return new Response(JSON.stringify({ request }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('GDPR data request error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function generateDataExport(supabase: any, email?: string, visitorId?: string) {
  const exportData: any = {}

  try {
    // Export visitor analytics data
    if (visitorId) {
      const { data: analyticsData } = await supabase
        .from('visitor_analytics')
        .select('*')
        .eq('visitor_id', visitorId)

      exportData.visitor_analytics = analyticsData || []

      // Export consent records
      const { data: consentData } = await supabase
        .from('user_consent')
        .select('*')
        .eq('visitor_id', visitorId)

      exportData.consent_records = consentData || []
    }

    // Export user profile data if email matches
    if (email) {
      // Get user by email from auth.users (admin access needed)
      const { data: userData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', email)

      exportData.profile_data = userData || []
    }

    // Export data processing logs
    const { data: processingLogs } = await supabase
      .from('data_processing_log')
      .select('*')
      .or(
        visitorId ? `visitor_id.eq.${visitorId}` : '',
        email ? `user_id.eq.${email}` : ''
      )

    exportData.processing_logs = processingLogs || []

    // Add metadata
    exportData.export_metadata = {
      generated_at: new Date().toISOString(),
      export_type: 'gdpr_data_export',
      data_retention_policy: '2 years from last activity',
      contact_email: 'privacy@polrydian.com'
    }

    return exportData

  } catch (error) {
    console.error('Data export generation error:', error)
    throw error
  }
}