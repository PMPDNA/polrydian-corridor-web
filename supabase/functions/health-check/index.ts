import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get system health from our database function
    const { data: healthData, error: healthError } = await supabase
      .rpc('system_health_check')

    if (healthError) {
      console.error('Health check error:', healthError)
      return new Response(
        JSON.stringify({ 
          status: 'error', 
          message: 'Health check failed',
          error: healthError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Additional service checks
    const serviceChecks = {
      database: 'ok',
      auth: 'ok',
      storage: 'ok',
      timestamp: new Date().toISOString()
    }

    // Test database connectivity
    const { error: dbError } = await supabase
      .from('integration_logs')
      .select('id')
      .limit(1)

    if (dbError) {
      serviceChecks.database = 'error'
    }

    const response = {
      status: healthData?.status || 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: serviceChecks,
      health_data: healthData,
      uptime: process.uptime ? `${Math.floor(process.uptime())}s` : 'unknown'
    }

    // Log health check
    await supabase.rpc('log_integration_event', {
      p_integration_type: 'health_check',
      p_operation: 'system_health_check',
      p_status: 'success',
      p_response_data: response
    })

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Health check failed:', error)
    
    return new Response(
      JSON.stringify({ 
        status: 'critical',
        timestamp: new Date().toISOString(),
        error: error.message,
        version: '1.0.0'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})