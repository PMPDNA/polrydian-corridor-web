import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

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
      requestData = body ? JSON.parse(body) : { action: 'check_connection' }
      console.log('📝 Parsed request data:', requestData)
    } catch (e) {
      console.error('❌ JSON parse error:', e.message)
      requestData = { action: 'check_connection' }
    }

    const { action } = requestData
    console.log('🎯 Action requested:', action)

    // Get user credentials from database
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    console.log('👤 User ID:', user.id)

    // Get LinkedIn credentials
    const { data: credentials, error: credError } = await supabase
      .from('social_media_credentials')
      .select('*')
      .eq('user_id', user.id)
      .eq('platform', 'linkedin')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (credError || !credentials) {
      throw new Error('No active LinkedIn credentials found')
    }

    console.log('🔑 Found credentials for platform user:', credentials.platform_user_id)

    // Handle different actions
    let response = {
      success: true,
      message: `Action '${action}' completed successfully`,
      timestamp: new Date().toISOString(),
      action: action
    }

    switch (action) {
      case 'check_connection':
        response = {
          ...response,
          connected: true,
          profile: credentials.profile_data,
          expiresAt: credentials.expires_at
        }
        break

      case 'get_profile':
        // For now, return the stored profile data
        response = {
          ...response,
          profile: {
            id: credentials.platform_user_id,
            name: credentials.profile_data?.localizedFirstName + ' ' + credentials.profile_data?.localizedLastName,
            firstName: credentials.profile_data?.localizedFirstName,
            lastName: credentials.profile_data?.localizedLastName,
            profilePicture: credentials.profile_data?.profilePicture?.displayImage
          }
        }
        break

      case 'get_articles':
        // Mock articles for now
        response = {
          ...response,
          articles: [
            {
              id: 'mock-1',
              title: 'Sample LinkedIn Article',
              content: 'This is a sample article from LinkedIn integration.',
              created: new Date().toISOString(),
              visibility: 'PUBLIC'
            }
          ]
        }
        break

      case 'test_connection':
        response = {
          ...response,
          message: 'LinkedIn connection test successful',
          connected: true
        }
        break

      default:
        response = {
          ...response,
          message: `Action '${action}' received but not implemented yet`
        }
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