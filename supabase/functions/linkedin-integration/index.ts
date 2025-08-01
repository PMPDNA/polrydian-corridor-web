import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { 
  validateInput, 
  checkRateLimit, 
  extractClientIP, 
  getCombinedHeaders, 
  logSecurityEvent,
  decryptTokenSecure 
} from '../_shared/security.ts'

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const corsHeaders = getCombinedHeaders()

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

    // Decrypt access token
    const decryptedToken = await decryptTokenSecure(credentials.access_token_encrypted)
    
    if (!decryptedToken) {
      throw new Error('Failed to decrypt LinkedIn access token')
    }

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
        try {
          // Fetch fresh profile data from LinkedIn API
          const profileResponse = await fetch('https://api.linkedin.com/v2/people/~', {
            headers: {
              'Authorization': `Bearer ${decryptedToken}`,
              'Content-Type': 'application/json'
            }
          })

          if (!profileResponse.ok) {
            throw new Error(`LinkedIn API error: ${profileResponse.status}`)
          }

          const profileData = await profileResponse.json()
          
          response = {
            ...response,
            profile: {
              id: profileData.id,
              name: `${profileData.localizedFirstName} ${profileData.localizedLastName}`,
              firstName: profileData.localizedFirstName,
              lastName: profileData.localizedLastName,
              profilePicture: profileData.profilePicture?.displayImage
            }
          }
        } catch (error) {
          console.error('❌ Profile fetch error:', error)
          // Fallback to stored profile data
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
        }
        break

      case 'get_articles':
        try {
          // Fetch posts from LinkedIn API v2 shares endpoint
          const postsResponse = await fetch(`https://api.linkedin.com/v2/shares?q=owners&owners=urn:li:person:${credentials.platform_user_id}&count=10&sortBy=CREATED`, {
            headers: {
              'Authorization': `Bearer ${decryptedToken}`,
              'Content-Type': 'application/json'
            }
          })

          if (!postsResponse.ok) {
            const errorText = await postsResponse.text()
            console.error('LinkedIn API error:', postsResponse.status, errorText)
            throw new Error(`LinkedIn API error: ${postsResponse.status}`)
          }

          const postsData = await postsResponse.json()
          
          // Handle LinkedIn API v2 response format
          const articles = postsData.elements?.map((post: any) => ({
            id: post.id,
            title: post.text?.text?.substring(0, 100) + '...' || 'LinkedIn Post',
            content: post.text?.text || 'No content available',
            created: new Date(post.created?.time || Date.now()).toISOString(),
            visibility: post.visibility?.visibility || 'PUBLIC'
          })) || []

          response = {
            ...response,
            articles
          }
        } catch (error) {
          console.error('❌ Articles fetch error:', error)
          // Return empty array on error
          response = {
            ...response,
            articles: [],
            error: 'Failed to fetch LinkedIn posts'
          }
        }
        break

      case 'test_connection':
        try {
          // Test connection with a simple API call
          const testResponse = await fetch('https://api.linkedin.com/v2/people/~', {
            headers: {
              'Authorization': `Bearer ${decryptedToken}`,
              'Content-Type': 'application/json'
            }
          })

          if (testResponse.ok) {
            response = {
              ...response,
              message: 'LinkedIn connection test successful',
              connected: true
            }
          } else {
            throw new Error(`Test failed: ${testResponse.status}`)
          }
        } catch (error) {
          console.error('❌ Connection test failed:', error)
          response = {
            ...response,
            message: 'LinkedIn connection test failed',
            connected: false,
            error: error.message
          }
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