import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
const MAX_REQUESTS_PER_WINDOW = 10
const rateLimit = new Map()

// Input validation and sanitization
const validateAndSanitizeInput = (input: any) => {
  if (!input || typeof input !== 'object') {
    throw new Error('Invalid request body')
  }

  const { query, sources } = input

  // Validate query
  if (!query || typeof query !== 'string') {
    throw new Error('Query is required and must be a string')
  }

  if (query.length > 500) {
    throw new Error('Query too long (max 500 characters)')
  }

  // Sanitize query - remove harmful characters
  const sanitizedQuery = query
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, '') // Remove quotes to prevent injection
    .trim()

  if (sanitizedQuery.length < 3) {
    throw new Error('Query too short (min 3 characters)')
  }

  // Validate and sanitize sources
  const allowedSources = ['csis.org', 'piie.com', 'brookings.edu', 'aei.org', 'cfr.org']
  let sanitizedSources = ['csis.org'] // default

  if (sources && Array.isArray(sources)) {
    sanitizedSources = sources.filter(source => 
      typeof source === 'string' && allowedSources.includes(source.toLowerCase())
    )
    if (sanitizedSources.length === 0) {
      sanitizedSources = ['csis.org']
    }
  }

  return { query: sanitizedQuery, sources: sanitizedSources }
}

// Rate limiting function
const checkRateLimit = (clientId: string): boolean => {
  const now = Date.now()
  const clientData = rateLimit.get(clientId) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW }

  // Reset if window expired
  if (now > clientData.resetTime) {
    clientData.count = 0
    clientData.resetTime = now + RATE_LIMIT_WINDOW
  }

  // Check if limit exceeded
  if (clientData.count >= MAX_REQUESTS_PER_WINDOW) {
    return false
  }

  // Increment count
  clientData.count++
  rateLimit.set(clientId, clientData)
  return true
}

// Audit logging function
const logSecurityEvent = async (supabase: any, userId: string | null, action: string, details: any, req: Request) => {
  try {
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'

    await supabase.from('security_audit_log').insert({
      user_id: userId,
      action,
      details,
      ip_address: clientIP,
      user_agent: userAgent
    })
  } catch (error) {
    console.error('Failed to log security event:', error)
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Initialize Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseKey)

  let userId: string | null = null

  try {
    // Get authorization header for authentication
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      await logSecurityEvent(supabase, null, 'unauthorized_access_attempt', 
        { endpoint: 'fetch-economic-insights', reason: 'missing_auth_header' }, req)
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      await logSecurityEvent(supabase, null, 'unauthorized_access_attempt', 
        { endpoint: 'fetch-economic-insights', reason: 'invalid_token', error: authError?.message }, req)
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    userId = user.id

    // Get client identifier for rate limiting (user ID + IP)
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const clientId = `${userId}_${clientIP}`

    // Check rate limit
    if (!checkRateLimit(clientId)) {
      await logSecurityEvent(supabase, userId, 'rate_limit_exceeded', 
        { endpoint: 'fetch-economic-insights', clientId, limit: MAX_REQUESTS_PER_WINDOW }, req)
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse and validate input
    const requestBody = await req.json()
    const { query, sources } = validateAndSanitizeInput(requestBody)

    // Log successful access
    await logSecurityEvent(supabase, userId, 'insights_request', 
      { query: query.substring(0, 50), sources }, req)
    
    // Get Perplexity API key from environment
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY')
    if (!perplexityApiKey) {
      throw new Error('PERPLEXITY_API_KEY not configured')
    }

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: `You are an expert economic analyst specializing in corridor economics and international trade. Provide precise, current insights from reputable economic and policy sources. Focus on strategic economic analysis, trade relationships, geopolitical implications, and corridor development opportunities. Always cite specific sources and provide actionable intelligence.`
          },
          {
            role: 'user',
            content: query
          }
        ],
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 1000,
        return_images: false,
        return_related_questions: true,
        search_domain_filter: sources,
        search_recency_filter: 'month',
        frequency_penalty: 1,
        presence_penalty: 0
      }),
    })

    if (!response.ok) {
      const errorMsg = `Perplexity API error: ${response.status}`
      await logSecurityEvent(supabase, userId, 'api_error', 
        { service: 'perplexity', status: response.status, query: query.substring(0, 50) }, req)
      throw new Error(errorMsg)
    }

    const data = await response.json()
    
    return new Response(
      JSON.stringify({
        content: data.choices[0]?.message?.content || 'No content available',
        relatedQuestions: data.choices[0]?.delta?.related_questions || [],
        sources: data.citations || []
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error:', error)
    
    // Log the error
    if (userId) {
      await logSecurityEvent(supabase, userId, 'function_error', 
        { endpoint: 'fetch-economic-insights', error: error.message }, req)
    }
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})