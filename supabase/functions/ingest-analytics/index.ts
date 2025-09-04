import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { 
      path, 
      referrer, 
      utm_source, 
      utm_medium, 
      utm_campaign,
      device_type, 
      browser, 
      country, 
      region, 
      session_id, 
      user_id, 
      page_load_time,
      engagement_time,
      consent_given = false
    } = await req.json().catch(() => ({}));

    // Get client IP and hash it for privacy
    const ip = req.headers.get("x-forwarded-for") ?? 
               req.headers.get("cf-connecting-ip") ?? 
               "0.0.0.0";
    
    // Check for consent before collecting any analytics data
    if (!consent_given) {
      // Check if user has previously given consent
      const { data: consentRecord } = await supabase
        .from('cookie_consent_tracking')
        .select('consent_data')
        .eq('ip_address', ip)
        .single();
      
      const hasAnalyticsConsent = consentRecord?.consent_data?.analytics === true;
      
      if (!hasAnalyticsConsent) {
        return new Response(JSON.stringify({ 
          error: 'Analytics consent required',
          consentRequired: true
        }), { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }
    
    const ip_hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip))
      .then((buf) => Array.from(new Uint8Array(buf))
        .map(b => b.toString(16).padStart(2, "0")).join(""));

    console.log('Ingesting analytics event with consent:', { path, referrer, utm_source, device_type });

    // Only collect minimal, anonymized data
    const { error } = await supabase
      .from("visitor_analytics")
      .insert({
        path,
        referrer: referrer ? new URL(referrer).hostname : null, // Only store referrer domain
        utm_source,
        utm_medium,
        utm_campaign,
        device_type,
        browser,
        country: country ? country.substring(0, 2) : null, // Only country code, not city
        region: null, // Don't store region for privacy
        session_id,
        user_id,
        page_load_time,
        engagement_time,
        ip_hash
      });

    if (error) {
      console.error('Analytics insert error:', error);
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true }), { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Analytics ingestion error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});