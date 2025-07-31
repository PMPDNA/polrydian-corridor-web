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

    // Get the article data from the request
    const { article_id, zapier_webhook_url } = await req.json()

    if (!article_id || !zapier_webhook_url) {
      return new Response(
        JSON.stringify({ error: 'Missing article_id or zapier_webhook_url' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch the article
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .select('*')
      .eq('id', article_id)
      .single()

    if (articleError || !article) {
      return new Response(
        JSON.stringify({ error: 'Article not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Prepare data for Zapier
    const zapierData = {
      title: article.title,
      content: article.content,
      article_url: `https://polrydian.com/articles/${article.id}`,
      published_at: article.published_at,
      excerpt: article.content ? article.content.substring(0, 200) + '...' : '',
      author: 'Patrick Misiewicz'
    }

    // Send to Zapier webhook
    const zapierResponse = await fetch(zapier_webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(zapierData)
    })

    if (!zapierResponse.ok) {
      throw new Error(`Zapier webhook failed: ${zapierResponse.status}`)
    }

    // Log the share
    await supabase
      .from('outbound_shares')
      .insert({
        article_id: article.id,
        platform: 'linkedin',
        shared_via: 'zapier',
        status: 'success',
        shared_at: new Date().toISOString()
      })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Article sent to LinkedIn via Zapier',
        article_title: article.title
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Zapier publish error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})