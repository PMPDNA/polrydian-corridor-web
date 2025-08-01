import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Initialize Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    console.log('🔄 Starting token refresh cron job...')
    
    // Get all active credentials that expire within 24 hours
    const twentyFourHoursFromNow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    
    const { data: credentials, error: fetchError } = await supabase
      .from('social_media_credentials')
      .select('*')
      .eq('is_active', true)
      .lt('expires_at', twentyFourHoursFromNow)
    
    if (fetchError) {
      console.error('Error fetching credentials:', fetchError)
      throw fetchError
    }
    
    console.log(`Found ${credentials?.length || 0} credentials expiring soon`)
    
    const refreshResults = []
    
    for (const credential of credentials || []) {
      try {
        // Log refresh attempt
        const logId = await supabase.rpc('log_integration_event', {
          p_integration_type: credential.platform,
          p_operation: 'token_refresh',
          p_status: 'pending',
          p_user_id: credential.user_id,
          p_request_data: {
            credential_id: credential.id,
            expires_at: credential.expires_at
          }
        })
        
        console.log(`🔄 Refreshing ${credential.platform} token for user ${credential.user_id}`)
        
        let refreshResult
        
        if (credential.platform === 'linkedin') {
          refreshResult = await refreshLinkedInToken(credential, supabase)
        } else if (credential.platform === 'instagram') {
          refreshResult = await refreshInstagramToken(credential, supabase)
        } else {
          throw new Error(`Unsupported platform: ${credential.platform}`)
        }
        
        // Update log with success
        await supabase.rpc('log_integration_event', {
          p_integration_type: credential.platform,
          p_operation: 'token_refresh',
          p_status: 'success',
          p_user_id: credential.user_id,
          p_response_data: { 
            new_expires_at: refreshResult.expires_at,
            refreshed_at: new Date().toISOString()
          },
          p_execution_time_ms: Date.now() - new Date(logId.created_at).getTime()
        })
        
        refreshResults.push({
          platform: credential.platform,
          user_id: credential.user_id,
          status: 'success',
          new_expires_at: refreshResult.expires_at
        })
        
        console.log(`✅ Successfully refreshed ${credential.platform} token`)
        
      } catch (error) {
        console.error(`❌ Failed to refresh ${credential.platform} token:`, error)
        
        // Log error
        await supabase.rpc('log_integration_event', {
          p_integration_type: credential.platform,
          p_operation: 'token_refresh',
          p_status: 'error',
          p_user_id: credential.user_id,
          p_error_message: error.message,
          p_error_code: error.code || 'REFRESH_FAILED'
        })
        
        refreshResults.push({
          platform: credential.platform,
          user_id: credential.user_id,
          status: 'error',
          error: error.message
        })
      }
    }
    
    console.log('🏁 Token refresh cron job completed')
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Token refresh completed',
        results: refreshResults,
        total_processed: credentials?.length || 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
    
  } catch (error) {
    console.error('🚨 Token refresh cron job failed:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Token refresh cron job failed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

async function refreshLinkedInToken(credential: any, supabase: any) {
  const clientId = Deno.env.get('LINKEDIN_CLIENT_ID')
  const clientSecret = Deno.env.get('LINKEDIN_CLIENT_SECRET')
  
  if (!clientId || !clientSecret) {
    throw new Error('LinkedIn client credentials not configured')
  }
  
  // Decrypt refresh token
  const { data: decryptedToken } = await supabase.rpc('decrypt_token_secure', {
    encrypted_token: credential.refresh_token_encrypted
  })
  
  if (!decryptedToken) {
    throw new Error('Failed to decrypt refresh token')
  }
  
  // Make refresh request to LinkedIn
  const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: decryptedToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })
  
  if (!response.ok) {
    const errorData = await response.text()
    throw new Error(`LinkedIn token refresh failed: ${response.status} - ${errorData}`)
  }
  
  const tokenData = await response.json()
  
  // Encrypt new tokens
  const { data: encryptedAccessToken } = await supabase.rpc('encrypt_token_secure', {
    token_text: tokenData.access_token
  })
  
  const { data: encryptedRefreshToken } = await supabase.rpc('encrypt_token_secure', {
    token_text: tokenData.refresh_token
  })
  
  // Calculate new expiry
  const expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString()
  
  // Update credentials
  const { error: updateError } = await supabase
    .from('social_media_credentials')
    .update({
      access_token_encrypted: encryptedAccessToken,
      refresh_token_encrypted: encryptedRefreshToken,
      expires_at: expiresAt,
      updated_at: new Date().toISOString()
    })
    .eq('id', credential.id)
  
  if (updateError) {
    throw updateError
  }
  
  return { expires_at: expiresAt }
}

async function refreshInstagramToken(credential: any, supabase: any) {
  // Decrypt access token
  const { data: decryptedToken } = await supabase.rpc('decrypt_token_secure', {
    encrypted_token: credential.access_token_encrypted
  })
  
  if (!decryptedToken) {
    throw new Error('Failed to decrypt access token')
  }
  
  // Instagram Graph API token refresh
  const response = await fetch(
    `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${decryptedToken}`,
    { method: 'GET' }
  )
  
  if (!response.ok) {
    const errorData = await response.text()
    throw new Error(`Instagram token refresh failed: ${response.status} - ${errorData}`)
  }
  
  const tokenData = await response.json()
  
  // Encrypt new token
  const { data: encryptedAccessToken } = await supabase.rpc('encrypt_token_secure', {
    token_text: tokenData.access_token
  })
  
  // Calculate new expiry (Instagram tokens are valid for 60 days)
  const expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString()
  
  // Update credentials
  const { error: updateError } = await supabase
    .from('social_media_credentials')
    .update({
      access_token_encrypted: encryptedAccessToken,
      expires_at: expiresAt,
      updated_at: new Date().toISOString()
    })
    .eq('id', credential.id)
  
  if (updateError) {
    throw updateError
  }
  
  return { expires_at: expiresAt }
}