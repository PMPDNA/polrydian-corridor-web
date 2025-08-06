import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VisitorData {
  visitor_id: string
  page_url: string
  referrer?: string
  session_id: string
  user_agent?: string
  screen_resolution?: string
  language?: string
  timezone?: string
  device_type?: string
  browser?: string
  os?: string
}

interface ConsentData {
  visitor_id: string
  consent_type: 'analytics' | 'marketing' | 'necessary'
  consent_given: boolean
  purpose: string
  legal_basis?: string
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

    // Get client IP address with proper parsing
    let clientIP = req.headers.get('x-forwarded-for') || 
                   req.headers.get('x-real-ip') || 
                   'unknown'
    
    // Handle comma-separated IPs by taking the first one
    if (clientIP && clientIP.includes(',')) {
      clientIP = clientIP.split(',')[0].trim()
    }

    if (req.method === 'POST') {
      const { action, data } = await req.json()

      switch (action) {
        case 'track_visitor': {
          const visitorData: VisitorData = data
          
          // Parse user agent for device info
          const userAgent = visitorData.user_agent || ''
          const deviceInfo = parseUserAgent(userAgent)
          
          // Insert visitor analytics data with proper IP handling using upsert to handle duplicates
          const { error: trackError } = await supabase
            .from('visitor_analytics')
            .upsert({
              visitor_id: visitorData.visitor_id,
              ip_address: clientIP === 'unknown' ? null : clientIP,
              user_agent: userAgent,
              page_url: visitorData.page_url,
              referrer: visitorData.referrer || null,
              session_id: visitorData.session_id,
              device_type: deviceInfo.device_type,
              browser: deviceInfo.browser,
              os: deviceInfo.os,
              screen_resolution: visitorData.screen_resolution,
              language: visitorData.language,
              timezone: visitorData.timezone,
              page_views: 1,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'visitor_id,session_id,page_url',
              ignoreDuplicates: false
            })

          if (trackError) {
            console.error('Visitor tracking error:', trackError)
            // Don't throw error for constraint violations, just log them
            if (trackError.code !== '23505') {
              throw trackError
            }
          }

          // Log data processing activity
          await supabase
            .from('data_processing_log')
            .insert({
              visitor_id: visitorData.visitor_id,
              action: 'collected',
              data_type: 'analytics',
              purpose: 'Website analytics and performance monitoring',
              legal_basis: 'legitimate_interest',
              retention_period: '2_years'
            })

          return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        case 'update_consent': {
          const consentData: ConsentData = data
          
          // Insert or update consent record
          const { error: consentError } = await supabase
            .from('user_consent')
            .upsert({
              visitor_id: consentData.visitor_id,
              ip_address: clientIP,
              consent_type: consentData.consent_type,
              consent_given: consentData.consent_given,
              purpose: consentData.purpose,
              legal_basis: consentData.legal_basis || 'consent',
              consent_date: new Date().toISOString(),
              withdrawal_date: consentData.consent_given ? null : new Date().toISOString()
            }, {
              onConflict: 'visitor_id,consent_type'
            })

          if (consentError) {
            console.error('Consent update error:', consentError)
            throw consentError
          }

          // Log consent activity
          await supabase
            .from('data_processing_log')
            .insert({
              visitor_id: consentData.visitor_id,
              action: consentData.consent_given ? 'collected' : 'deleted',
              data_type: consentData.consent_type,
              purpose: consentData.purpose,
              legal_basis: 'consent',
              retention_period: consentData.consent_given ? '2_years' : null
            })

          return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        case 'get_consent': {
          const { visitor_id } = data
          
          const { data: consentData, error } = await supabase
            .from('user_consent')
            .select('consent_type, consent_given, consent_date')
            .eq('visitor_id', visitor_id)

          if (error) {
            console.error('Get consent error:', error)
            throw error
          }

          return new Response(JSON.stringify({ consent: consentData }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        default:
          return new Response(JSON.stringify({ error: 'Invalid action' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
      }
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Track visitor error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

function parseUserAgent(userAgent: string) {
  const deviceInfo = {
    device_type: 'unknown',
    browser: 'unknown',
    os: 'unknown'
  }

  // Detect device type
  if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
    deviceInfo.device_type = /iPad/.test(userAgent) ? 'tablet' : 'mobile'
  } else {
    deviceInfo.device_type = 'desktop'
  }

  // Detect browser
  if (/Chrome/.test(userAgent) && !/Edge/.test(userAgent)) {
    deviceInfo.browser = 'Chrome'
  } else if (/Firefox/.test(userAgent)) {
    deviceInfo.browser = 'Firefox'
  } else if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) {
    deviceInfo.browser = 'Safari'
  } else if (/Edge/.test(userAgent)) {
    deviceInfo.browser = 'Edge'
  }

  // Detect OS
  if (/Windows/.test(userAgent)) {
    deviceInfo.os = 'Windows'
  } else if (/Mac OS/.test(userAgent)) {
    deviceInfo.os = 'macOS'
  } else if (/Linux/.test(userAgent)) {
    deviceInfo.os = 'Linux'
  } else if (/Android/.test(userAgent)) {
    deviceInfo.os = 'Android'
  } else if (/iPhone|iPad/.test(userAgent)) {
    deviceInfo.os = 'iOS'
  }

  return deviceInfo
}