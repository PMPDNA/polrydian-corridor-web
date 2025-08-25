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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Fetch published articles for RSS
    const { data: articles, error: articlesError } = await supabaseClient
      .from('articles')
      .select('id, title, slug, content, meta_description, published_at, updated_at, category, featured_image')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(20) // Latest 20 articles

    if (articlesError) {
      throw articlesError
    }

    const baseUrl = 'https://polrydian.com'
    const currentDate = new Date().toUTCString()
    const lastBuildDate = articles && articles.length > 0 
      ? new Date(articles[0].published_at || articles[0].updated_at).toUTCString()
      : currentDate

    // Helper function to clean HTML content for RSS
    const cleanContent = (html: string): string => {
      return html
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .substring(0, 500) // Limit to 500 characters
    }

    // Build RSS XML
    let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Polrydian Corridor Web - Strategic Insights</title>
    <link>${baseUrl}/articles</link>
    <description>Strategic insights on corridor economics, geopolitics, and supply-chain flows. Transform complexity into clarity through disciplined analysis.</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <pubDate>${currentDate}</pubDate>
    <ttl>360</ttl>
    <managingEditor>patrick@polrydian.com (Patrick Misiewicz)</managingEditor>
    <webMaster>patrick@polrydian.com (Patrick Misiewicz)</webMaster>
    <image>
      <url>${baseUrl}/images/polrydian-logo.png</url>
      <title>Polrydian Corridor Web</title>
      <link>${baseUrl}</link>
      <description>Strategic Economic Intelligence</description>
    </image>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
`

    // Add article items
    articles?.forEach(article => {
      const articleUrl = `${baseUrl}/articles/${article.slug || article.id}`
      const pubDate = new Date(article.published_at || article.updated_at).toUTCString()
      const description = article.meta_description || cleanContent(article.content)
      const category = article.category || 'Strategy'
      
      rss += `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${articleUrl}</link>
      <guid isPermaLink="true">${articleUrl}</guid>
      <description><![CDATA[${description}]]></description>
      <content:encoded><![CDATA[${article.content}]]></content:encoded>
      <pubDate>${pubDate}</pubDate>
      <category><![CDATA[${category}]]></category>
      <author>patrick@polrydian.com (Patrick Misiewicz)</author>
      ${article.featured_image ? `<enclosure url="${article.featured_image}" type="image/jpeg" />` : ''}
    </item>`
    })

    rss += `
  </channel>
</rss>`

    return new Response(rss, {
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/rss+xml',
        'Cache-Control': 'public, max-age=1800' // Cache for 30 minutes
      },
    })

  } catch (error) {
    console.error('Error generating RSS:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})