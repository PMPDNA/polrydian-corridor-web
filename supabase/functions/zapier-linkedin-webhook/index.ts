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

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const body = await req.json()
    
    // Handle different types of LinkedIn data from Zapier
    const { type, data } = body

    if (type === 'linkedin_post') {
      // Store LinkedIn post data from Zapier
      const { error } = await supabase
        .from('linkedin_posts')
        .insert({
          title: data.title || '',
          content: data.content || data.text || '',
          linkedin_id: data.id || data.linkedin_id,
          published_at: data.published_at || data.created_time || new Date().toISOString(),
          visibility: data.visibility || 'public',
          author: data.author || 'Patrick Misiewicz',
          profile_url: data.profile_url || '',
          post_url: data.post_url || data.permalink_url || ''
        })

      if (error) {
        console.error('Error storing LinkedIn post:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to store post' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    if (type === 'linkedin_article') {
      // Store LinkedIn article data from Zapier
      const { error } = await supabase
        .from('linkedin_articles')
        .insert({
          title: data.title,
          content: data.content || data.summary,
          linkedin_id: data.id || data.urn,
          published_at: data.published_at || data.created_time || new Date().toISOString(),
          visibility: data.visibility || 'public',
          author: data.author || 'Patrick Misiewicz',
          thumbnail_url: data.thumbnail || '',
          article_url: data.article_url || data.permalink_url || ''
        })

      if (error) {
        console.error('Error storing LinkedIn article:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to store article' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Data stored successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})