// Shared HTTP utilities for Edge Functions
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-forwarded-for',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

// Helper to create consistent JSON responses
export const json = (data: any, options: { status?: number; headers?: Record<string, string> } = {}) => {
  return new Response(JSON.stringify(data), {
    status: options.status || 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      ...options.headers
    }
  })
}

// Health check helper - call this at the start of every Edge Function
export const maybeHealth = (req: Request, functionName: string): Response | null => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Check for health endpoint
  const url = new URL(req.url)
  const isHealthCheck = url.searchParams.get('health') === '1' || 
                       url.pathname.includes('/health') ||
                       url.pathname.endsWith('/health')

  if (isHealthCheck) {
    console.log(`🏥 Health check requested for ${functionName}`)
    return json({
      status: 'ok',
      function: functionName,
      timestamp: new Date().toISOString(),
      service: `${functionName} API`,
      version: '1.0.0'
    })
  }

  return null // Continue with normal function execution
}

// Helper to extract client IP
export const extractClientIP = (headers: Headers): string | null => {
  const forwarded = headers.get('x-forwarded-for')
  const realIp = headers.get('x-real-ip')
  return forwarded?.split(',')[0]?.trim() || realIp || null
}

// Helper to log structured errors
export const logError = (functionName: string, error: any, context?: any) => {
  console.error(`❌ [${functionName}] Error:`, {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString()
  })
}