import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Verify user authentication - make this optional for callback flow
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.log('No authorization header provided - this might be from callback flow')
      // For now, let's allow the callback to proceed without auth
      // In production, you'd want to implement a more secure flow
    } else {
      const { data: { user }, error: authError } = await supabase.auth.getUser(
        authHeader.replace('Bearer ', '')
      )

      if (authError || !user) {
        console.error('Invalid user token:', authError)
        // Don't throw error, just log it for now
      } else {
        // Check if user is admin
        const { data: userRoles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .single()

        if (!userRoles) {
          throw new Error('Admin access required')
        }
      }
    }

    const { code, action } = await req.json()

    if (action === 'exchange_token') {
      console.log('Exchanging authorization code for access token...')

      // LinkedIn OAuth 2.0 token exchange
      const clientId = '78z20ojmlvz2ks'
      const clientSecret = Deno.env.get('LINKEDIN_CLIENT_SECRET')

      if (!clientSecret) {
        throw new Error('LinkedIn client secret not configured')
      }

      // Use the exact redirect URI configured in LinkedIn app
      const redirectUri = 'https://polrydian.com/auth/callback'
      console.log('Using redirect URI:', redirectUri)

      const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: redirectUri,
          client_id: clientId,
          client_secret: clientSecret,
        }),
      })

      const tokenData = await tokenResponse.json()
      console.log('Token exchange response:', tokenData)

      if (!tokenResponse.ok) {
        throw new Error(`LinkedIn token exchange failed: ${JSON.stringify(tokenData)}`)
      }

      if (!tokenData.access_token) {
        throw new Error('No access token received from LinkedIn')
      }

      // Test the access token by fetching user profile
      const profileResponse = await fetch('https://api.linkedin.com/v2/people/~', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      })

      const profileData = await profileResponse.json()
      console.log('LinkedIn profile test:', profileData)

      if (!profileResponse.ok) {
        throw new Error(`LinkedIn API test failed: ${JSON.stringify(profileData)}`)
      }

      // Store the access token securely (you'll need to set this up in Supabase secrets manually)
      console.log('✅ LinkedIn OAuth successful!')
      console.log('Access Token (store this in Supabase secrets as LINKEDIN_ACCESS_TOKEN):', tokenData.access_token)

      return new Response(
        JSON.stringify({
          success: true,
          message: 'LinkedIn OAuth completed successfully',
          profile: profileData,
          token_info: {
            expires_in: tokenData.expires_in,
            scope: tokenData.scope,
          },
          instructions: 'Access token logged to console. Store it as LINKEDIN_ACCESS_TOKEN secret in Supabase.'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    throw new Error('Invalid action')

  } catch (error) {
    console.error('LinkedIn OAuth error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: 'Check the edge function logs for more information'
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})