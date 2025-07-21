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

async function refreshLinkedInToken(credential: any) {
  console.log('🔄 Refreshing LinkedIn token...')
  
  const refreshBody = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: credential.refresh_token_encrypted,
    client_id: Deno.env.get('LINKEDIN_CLIENT_ID')!,
    client_secret: Deno.env.get('LINKEDIN_CLIENT_SECRET')!,
  })

  const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: refreshBody,
  })

  if (!response.ok) {
    throw new Error(`Token refresh failed: ${response.statusText}`)
  }

  const tokenData = await response.json()
  
  // Update credentials in database
  const expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000))
  
  await supabase
    .from('social_media_credentials')
    .update({
      access_token_encrypted: tokenData.access_token,
      expires_at: expiresAt.toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', credential.id)

  console.log('✅ Token refreshed successfully')
  return tokenData.access_token
}

async function fetchLinkedInPosts(accessToken: string, platformUserId: string) {
  console.log('📥 Fetching LinkedIn posts...')
  
  // LinkedIn API endpoint for user's posts
  const url = `https://api.linkedin.com/v2/shares?q=owners&owners=${platformUserId}&sortBy=LAST_MODIFIED&sharesPerOwner=50`
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('LinkedIn API error:', errorText)
    throw new Error(`LinkedIn API failed: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  console.log(`📊 Found ${data.elements?.length || 0} LinkedIn posts`)
  
  return data.elements || []
}

function transformLinkedInPost(post: any) {
  // Extract post URL from URN
  const shareId = post.id?.replace('urn:li:share:', '') || ''
  const postUrl = shareId ? `https://www.linkedin.com/feed/update/${shareId}` : null

  return {
    id: post.id,
    author: post.owner || post.author,
    message: post.text?.text || '',
    media_url: post.content?.contentEntities?.[0]?.thumbnails?.[0]?.resolvedUrl || null,
    post_url: postUrl,
    created_at: post.created?.time ? new Date(post.created.time).toISOString() : new Date().toISOString(),
    raw_data: post,
    is_visible: true,
    synced_at: new Date().toISOString()
  }
}

async function syncLinkedInFeed() {
  try {
    console.log('🔍 Looking for LinkedIn credentials...')
    
    // Get the LinkedIn credential
    const { data: credential, error: credError } = await supabase
      .from('social_media_credentials')
      .select('*')
      .eq('platform', 'linkedin')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (credError || !credential) {
      throw new Error('No active LinkedIn credentials found')
    }

    console.log(`👤 Found credentials for user: ${credential.user_id}`)

    let accessToken = credential.access_token_encrypted

    // Check if token needs refresh (if expires within 10 minutes)
    const expiresAt = new Date(credential.expires_at)
    const tenMinutesFromNow = new Date(Date.now() + 10 * 60 * 1000)
    
    if (expiresAt < tenMinutesFromNow) {
      console.log('⏰ Token expires soon, refreshing...')
      accessToken = await refreshLinkedInToken(credential)
    }

    // Fetch LinkedIn posts
    const posts = await fetchLinkedInPosts(accessToken, credential.platform_user_id)
    
    if (posts.length === 0) {
      console.log('📭 No posts found')
      return { inserted: 0, message: 'No new posts to sync' }
    }

    // Transform posts for database
    const transformedPosts = posts.map(transformLinkedInPost)
    
    // Upsert posts into database
    const { data: insertedPosts, error: insertError } = await supabase
      .from('linkedin_posts')
      .upsert(transformedPosts, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      })
      .select()

    if (insertError) {
      console.error('Database insert error:', insertError)
      throw insertError
    }

    console.log(`✅ Successfully synced ${transformedPosts.length} posts`)
    
    return {
      inserted: transformedPosts.length,
      message: `Successfully synced ${transformedPosts.length} LinkedIn posts`,
      posts: insertedPosts
    }

  } catch (error: any) {
    console.error('💥 Sync failed:', error.message)
    throw error
  }
}

serve(async (req) => {
  console.log('🚀 LinkedIn Feed Sync function called:', req.method)
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const result = await syncLinkedInFeed()
    
    return new Response(
      JSON.stringify({
        success: true,
        ...result,
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error: any) {
    console.error('💥 Function error:', error.message)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})