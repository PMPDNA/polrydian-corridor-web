import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ConsentData {
  ip: string;
  consent: {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
  };
  timestamp: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    if (req.method === 'POST') {
      // Track cookie consent
      const { consent } = await req.json()
      
      // Get client IP from various headers
      const clientIP = req.headers.get('cf-connecting-ip') || 
                       req.headers.get('x-forwarded-for')?.split(',')[0] ||
                       req.headers.get('x-real-ip') ||
                       'unknown'

      const consentData: ConsentData = {
        ip: clientIP,
        consent,
        timestamp: new Date().toISOString()
      }

      // Store in a simple table or use database functions
      const { error } = await supabaseClient
        .from('cookie_consent_tracking')
        .upsert({
          ip_address: clientIP,
          consent_data: consent,
          last_updated: new Date().toISOString()
        }, { 
          onConflict: 'ip_address' 
        })

      if (error) throw error

      return new Response(
        JSON.stringify({ success: true, message: 'Consent tracked' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    if (req.method === 'GET') {
      // Check if IP has already given consent
      const clientIP = req.headers.get('cf-connecting-ip') || 
                       req.headers.get('x-forwarded-for')?.split(',')[0] ||
                       req.headers.get('x-real-ip') ||
                       'unknown'

      const { data, error } = await supabaseClient
        .from('cookie_consent_tracking')
        .select('consent_data, last_updated')
        .eq('ip_address', clientIP)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      return new Response(
        JSON.stringify({ 
          hasConsent: !!data,
          consent: data?.consent_data || null,
          lastUpdated: data?.last_updated || null
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})