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
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get LinkedIn access token from Supabase secrets
    const linkedinToken = Deno.env.get('LINKEDIN_ACCESS_TOKEN')
    if (!linkedinToken) {
      throw new Error('LinkedIn access token not configured')
    }

    // Verify user authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      throw new Error('Invalid user token')
    }

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

    const { action } = await req.json()

    switch (action) {
      case 'get_profile':
        return await getLinkedInProfile(linkedinToken)
      
      case 'get_articles':
        return await getLinkedInArticles(linkedinToken, supabase)
      
      case 'sync_articles':
        return await syncLinkedInArticles(linkedinToken, supabase, user.id)
      
      case 'publish_to_linkedin':
        const { content, title } = await req.json()
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