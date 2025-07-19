import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🧪 Test function called');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('📋 CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📊 Request details:', {
      method: req.method,
      url: req.url,
      headers: Object.fromEntries(req.headers.entries())
    });

    const body = req.method !== 'GET' ? await req.json() : null;
    console.log('📝 Request body:', body);

    const response = {
      success: true,
      message: 'Test function working correctly',
      timestamp: new Date().toISOString(),
      method: req.method,
      body: body
    };

    console.log('✅ Test function completed successfully');
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('💥 Test function error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Test function failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});