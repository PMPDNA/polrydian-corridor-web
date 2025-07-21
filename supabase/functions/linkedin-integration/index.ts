import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LinkedInProfile {
  id: string
  localizedFirstName: string
  localizedLastName: string
  profilePicture?: {
    displayImage: string
  }
}

interface LinkedInArticle {
  id: string
  specificContent: {
    'com.linkedin.ugc.ShareContent': {
      shareCommentary: {
        text: string
      }
      shareMediaCategory: string
      media?: Array<{
        status: string
        description: {
          text: string
        }
        media: string
        title: {
          text: string
        }
      }>
    }
  }
  created: {
    time: number
  }
  lifecycleState: string
  visibility: {
    'com.linkedin.ugc.MemberNetworkVisibility': string
  }
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

    console.log('Supabase client initialized')

    // Verify user authentication
    const authHeader = req.headers.get('Authorization')
    console.log('Auth header exists:', !!authHeader)
    
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    console.log('User authentication result:', { user: !!user, error: !!authError })

    if (authError || !user) {
      console.error('Auth error:', authError)
      throw new Error('Invalid user token')
    }

    console.log('User ID:', user.id)

    // Check if user is admin
    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle()

    console.log('Role check result:', { userRoles: !!userRoles, roleError: !!roleError })

    if (!userRoles) {
      console.error('Role error:', roleError)
      throw new Error('Admin access required')
    }

    console.log('Admin access confirmed')

    // Get user's LinkedIn credentials
    console.log('Looking for LinkedIn credentials...')
    const { data: credentials, error: credError } = await supabase
      .from('social_media_credentials')
      .select('access_token_encrypted, expires_at, is_active')
      .eq('platform', 'linkedin')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)

    console.log('Credentials lookup result:', { 
      found: !!credentials && credentials.length > 0, 
      count: credentials?.length || 0,
      error: !!credError 
    })

    if (credError) {
      console.error('Credential error:', credError)
    }

    if (credError || !credentials || credentials.length === 0) {
      throw new Error('No LinkedIn connection found. Please connect your LinkedIn account first.')
    }

    const credential = credentials[0]
    const isExpired = new Date(credential.expires_at) < new Date()
    
    console.log('Token status:', { 
      expiresAt: credential.expires_at, 
      isExpired,
      hasToken: !!credential.access_token_encrypted 
    })
    
    if (isExpired) {
      throw new Error('LinkedIn token has expired. Please reconnect your LinkedIn account.')
    }

    const linkedinToken = credential.access_token_encrypted

    console.log('Parsing request body...')
    const requestBody = await req.json()
    console.log('Request body:', requestBody)
    const { action, ...params } = requestBody

    switch (action) {
      case 'check_connection':
        return await checkConnection(user.id, supabase)
      
      case 'refresh_token':
        return await refreshToken(user.id, supabase)
      
      case 'test_connection':
        return await testConnection(user.id, supabase)
      
      case 'get_profile':
        return await getLinkedInProfile(linkedinToken)
      
      case 'get_articles':
        return await getLinkedInArticles(linkedinToken, supabase)
      
      case 'sync_articles':
        return await syncLinkedInArticles(linkedinToken, supabase, user.id)
      
      case 'publish_to_linkedin':
        const { content, title } = params
        return await publishToLinkedIn(linkedinToken, content, title)
      
      default:
        throw new Error('Invalid action')
    }

  } catch (error) {
    console.error('LinkedIn integration error:', error)
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
  const response = await fetch('https://api.linkedin.com/v2/people/~', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'LinkedIn-Version': '202308'
    },
  })

  if (!response.ok) {
    const errorData = await response.text()
    throw new Error(`LinkedIn API error: ${response.status} - ${errorData}`)
  }

  const profileData: LinkedInProfile = await response.json()
  
  return new Response(
    JSON.stringify({
      success: true,
      profile: {
        id: profileData.id,
        name: `${profileData.localizedFirstName} ${profileData.localizedLastName}`,
        firstName: profileData.localizedFirstName,
        lastName: profileData.localizedLastName,
        profilePicture: profileData.profilePicture?.displayImage
      }
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  )
}

async function getLinkedInArticles(accessToken: string, supabase: any) {
  // Get user's LinkedIn posts/articles
  const response = await fetch('https://api.linkedin.com/v2/shares?q=owners&owners=urn:li:person:' + 'self' + '&count=50', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'LinkedIn-Version': '202308'
    },
  })

  if (!response.ok) {
    const errorData = await response.text()
    throw new Error(`LinkedIn API error: ${response.status} - ${errorData}`)
  }

  const articlesData = await response.json()
  
  const articles = articlesData.elements?.map((article: LinkedInArticle) => ({
    id: article.id,
    content: article.specificContent?.['com.linkedin.ugc.ShareContent']?.shareCommentary?.text || '',
    title: article.specificContent?.['com.linkedin.ugc.ShareContent']?.media?.[0]?.title?.text || 'LinkedIn Post',
    created: new Date(article.created.time),
    visibility: article.visibility?.['com.linkedin.ugc.MemberNetworkVisibility'] || 'PUBLIC'
  })) || []

  return new Response(
    JSON.stringify({
      success: true,
      articles: articles
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  )
}

async function syncLinkedInArticles(accessToken: string, supabase: any, userId: string) {
  // Get LinkedIn articles
  const articlesResponse = await getLinkedInArticles(accessToken, supabase)
  const articlesData = await articlesResponse.json()
  
  if (!articlesData.success) {
    throw new Error('Failed to fetch LinkedIn articles')
  }

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
    throw new Error(`Database error: ${insertError.message}`)
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: `Synced ${articlesData.articles.length} articles from LinkedIn`,
      syncedCount: articlesData.articles.length
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  )
}

async function publishToLinkedIn(accessToken: string, content: string, title?: string) {
  const postData = {
    author: 'urn:li:person:self',
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: {
          text: content
        },
        shareMediaCategory: 'NONE'
      }
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
    }
  }

  const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'LinkedIn-Version': '202308'
    },
    body: JSON.stringify(postData)
  })

  if (!response.ok) {
    const errorData = await response.text()
    throw new Error(`LinkedIn publish error: ${response.status} - ${errorData}`)
  }

  const publishData = await response.json()
  
  return new Response(
    JSON.stringify({
      success: true,
      message: 'Successfully published to LinkedIn',
      postId: publishData.id
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  )
}

async function checkConnection(userId: string, supabase: any) {
  try {
    // Check for LinkedIn credentials in the database
    const { data: credentials, error } = await supabase
      .from('social_media_credentials')
      .select('*')
      .eq('platform', 'linkedin')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error("Database error:", error);
      throw new Error("Database error");
    }

    if (!credentials || credentials.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          connected: false, 
          message: "No LinkedIn connection found" 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const credential = credentials[0];
    const isExpired = new Date(credential.expires_at) < new Date();

    return new Response(
      JSON.stringify({ 
        success: true, 
        connected: true,
        expired: isExpired,
        profile: credential.profile_data,
        expiresAt: credential.expires_at
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Check connection error:", error);
    throw error;
  }
}

async function refreshToken(userId: string, supabase: any) {
  try {
    // Get current credentials
    const { data: credentials, error } = await supabase
      .from('social_media_credentials')
      .select('*')
      .eq('platform', 'linkedin')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error || !credentials || credentials.length === 0) {
      throw new Error("No credentials found");
    }

    const credential = credentials[0];
    
    if (!credential.refresh_token_encrypted) {
      throw new Error("No refresh token available");
    }

    // LinkedIn refresh token request
    const tokenUrl = "https://www.linkedin.com/oauth/v2/accessToken";
    const params = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: credential.refresh_token_encrypted,
      client_id: Deno.env.get("LINKEDIN_CLIENT_ID")!,
      client_secret: Deno.env.get("LINKEDIN_CLIENT_SECRET")!,
    });

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Token refresh failed:", errorText);
      throw new Error("Token refresh failed");
    }

    const tokenData = await response.json();
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();

    // Update credentials with new token
    const { error: updateError } = await supabase
      .from('social_media_credentials')
      .update({
        access_token_encrypted: tokenData.access_token,
        refresh_token_encrypted: tokenData.refresh_token || credential.refresh_token_encrypted,
        expires_at: expiresAt
      })
      .eq('id', credential.id);

    if (updateError) {
      console.error("Update error:", updateError);
      throw new Error("Failed to update credentials");
    }

    return new Response(
      JSON.stringify({ success: true, message: "Token refreshed successfully" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Refresh token error:", error);
    throw error;
  }
}

async function testConnection(userId: string, supabase: any) {
  try {
    // Get current credentials from database
    const { data: credentials, error } = await supabase
      .from('social_media_credentials')
      .select('*')
      .eq('platform', 'linkedin')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error || !credentials || credentials.length === 0) {
      throw new Error("No credentials found");
    }

    const credential = credentials[0];

    // Test the access token by making a LinkedIn API call
    const profileResponse = await fetch("https://api.linkedin.com/v2/me", {
      headers: {
        "Authorization": `Bearer ${credential.access_token_encrypted}`,
      },
    });

    if (profileResponse.status === 401) {
      // Token expired, try to refresh
      console.log("Token expired, attempting refresh...");
      await refreshToken(userId, supabase);
      return new Response(
        JSON.stringify({ success: true, message: "Connection tested and token refreshed" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      throw new Error(`LinkedIn API error: ${errorText}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Connection is working" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Test connection error:", error);
    throw error;
  }
}