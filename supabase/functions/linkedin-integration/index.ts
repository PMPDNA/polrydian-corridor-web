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
    console.log('=== LinkedIn Integration Function Called ===')
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get and validate auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.log('❌ No authorization header')
      throw new Error('No authorization header')
    }

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      console.log('❌ Auth failed:', authError?.message)
      throw new Error('Invalid user token')
    }

    console.log('✅ User authenticated:', user.id)

    // Check if user is admin
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')

    if (!userRoles || userRoles.length === 0) {
      console.log('❌ Admin access required')
      throw new Error('Admin access required')
    }

    console.log('✅ Admin access confirmed')

    // Parse request body
    const requestBody = await req.json()
    const { action } = requestBody

    console.log('📝 Action requested:', action)

    // Get LinkedIn credentials
    const { data: credentials } = await supabase
      .from('social_media_credentials')
      .select('access_token_encrypted, expires_at, is_active')
      .eq('platform', 'linkedin')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)

    if (!credentials || credentials.length === 0) {
      console.log('❌ No LinkedIn credentials found')
      throw new Error('No LinkedIn connection found. Please connect your LinkedIn account first.')
    }

    const credential = credentials[0]
    const isExpired = new Date(credential.expires_at) < new Date()
    
    if (isExpired) {
      console.log('❌ Token expired')
      throw new Error('LinkedIn token has expired. Please reconnect your LinkedIn account.')
    }

    console.log('✅ LinkedIn credentials found and valid')

    const linkedinToken = credential.access_token_encrypted

    // Handle different actions
    switch (action) {
      case 'check_connection':
        console.log('🔍 Checking connection...')
        return new Response(
          JSON.stringify({
            success: true,
            connected: true,
            expiresAt: credential.expires_at
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      
      case 'get_profile':
        console.log('👤 Getting profile...')
        return await getLinkedInProfile(linkedinToken)
      
      case 'get_articles':
        console.log('📄 Getting articles...')
        return await getLinkedInArticles(linkedinToken)
      
      case 'sync_articles':
        console.log('🔄 Syncing articles...')
        return await syncLinkedInArticles(linkedinToken, supabase, user.id)
      
      case 'test_connection':
        console.log('🧪 Testing connection...')
        return await testConnection(linkedinToken)
      
      default:
        console.log('❌ Invalid action:', action)
        throw new Error(`Invalid action: ${action}`)
    }

  } catch (error) {
    console.error('💥 LinkedIn integration error:', error.message)
    return new Response(
      JSON.stringify({
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

async function getLinkedInProfile(accessToken: string) {
  try {
    console.log('📡 Calling LinkedIn profile API...')
    const response = await fetch('https://api.linkedin.com/v2/people/(id~)', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.log('❌ LinkedIn profile API error:', response.status, errorText)
      throw new Error(`LinkedIn API error: ${response.status} - ${errorText}`)
    }

    const profileData = await response.json()
    console.log('✅ Profile data received')
    
    return new Response(
      JSON.stringify({
        success: true,
        profile: {
          id: profileData.id,
          name: `${profileData.localizedFirstName || ''} ${profileData.localizedLastName || ''}`.trim(),
          firstName: profileData.localizedFirstName,
          lastName: profileData.localizedLastName
        }
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('💥 Profile fetch error:', error.message)
    throw error
  }
}

async function getLinkedInArticles(accessToken: string) {
  try {
    console.log('📡 Calling LinkedIn posts API...')
    const response = await fetch('https://api.linkedin.com/v2/shares?q=owners&owners=urn:li:person:self&count=50', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.log('❌ LinkedIn articles API error:', response.status, errorText)
      throw new Error(`LinkedIn API error: ${response.status} - ${errorText}`)
    }

    const articlesData = await response.json()
    console.log('✅ Articles data received:', articlesData.elements?.length || 0, 'posts')
    
    const articles = articlesData.elements?.map((article: any) => ({
      id: article.id,
      content: article.specificContent?.['com.linkedin.ugc.ShareContent']?.shareCommentary?.text || '',
      title: 'LinkedIn Post',
      created: new Date(article.created.time),
      visibility: article.visibility?.['com.linkedin.ugc.MemberNetworkVisibility'] || 'PUBLIC'
    })) || []

    return new Response(
      JSON.stringify({
        success: true,
        articles: articles
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('💥 Articles fetch error:', error.message)
    throw error
  }
}

async function syncLinkedInArticles(accessToken: string, supabase: any, userId: string) {
  try {
    console.log('🔄 Starting sync process...')
    
    // Get articles from LinkedIn
    const articlesResponse = await getLinkedInArticles(accessToken)
    const articlesData = await articlesResponse.json()
    
    if (!articlesData.success) {
      throw new Error('Failed to fetch LinkedIn articles')
    }

    console.log('💾 Storing articles in database...')
    
    // Store articles in database
    const { data: insertedArticles, error: insertError } = await supabase
      .from('linkedin_articles')
      .upsert(
        articlesData.articles.map((article: any) => ({
          linkedin_id: article.id,
          user_id: userId,
          title: article.title,
          content: article.content,
          published_at: article.created,
          visibility: article.visibility,
          synced_at: new Date().toISOString()
        })),
        { 
          onConflict: 'linkedin_id',
          ignoreDuplicates: false 
        }
      )

    if (insertError) {
      console.error('💥 Database error:', insertError.message)
      throw new Error(`Database error: ${insertError.message}`)
    }

    console.log('✅ Sync completed successfully')

    return new Response(
      JSON.stringify({
        success: true,
        message: `Synced ${articlesData.articles.length} articles from LinkedIn`,
        syncedCount: articlesData.articles.length
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('💥 Sync error:', error.message)
    throw error
  }
}

async function testConnection(accessToken: string) {
  try {
    console.log('🧪 Testing LinkedIn connection...')
    const response = await fetch("https://api.linkedin.com/v2/people/(id~)", {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
    })

    if (response.ok) {
      console.log('✅ Connection test successful')
      return new Response(
        JSON.stringify({ success: true, message: "Connection is working" }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    } else {
      console.log('❌ Connection test failed:', response.status)
      throw new Error(`Connection test failed: ${response.status}`)
    }
  } catch (error) {
    console.error('💥 Connection test error:', error.message)
    throw error
  }
}