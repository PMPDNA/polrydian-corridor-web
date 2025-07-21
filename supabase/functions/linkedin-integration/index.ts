import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('🚀 Function called:', req.method, req.url)
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling CORS preflight')
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📝 Reading request body...')
    const body = await req.text()
    console.log('📝 Raw request body:', body)
    
    let requestData
    try {
      requestData = JSON.parse(body)
      console.log('📝 Parsed request data:', requestData)
    } catch (e) {
      console.error('❌ JSON parse error:', e.message)
      throw new Error('Invalid JSON in request body')
    }

    const { action } = requestData
    console.log('🎯 Action requested:', action)

    // Simple response for any action
    const response = {
      success: true,
      message: `Action '${action}' received successfully`,
      timestamp: new Date().toISOString(),
      action: action
    }

    console.log('✅ Sending response:', response)

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('💥 Error:', error.message)
    console.error('💥 Stack:', error.stack)
    
    return new Response(
      JSON.stringify({
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})