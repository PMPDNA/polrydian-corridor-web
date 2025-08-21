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

    // Fetch published articles
    const { data: articles, error: articlesError } = await supabaseClient
      .from('articles')
      .select('slug, id, updated_at, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    if (articlesError) {
      throw articlesError
    }

    // Static pages with their priorities and change frequencies
    const staticPages = [
      { loc: '/', changefreq: 'weekly', priority: '1.0' },
      { loc: '/about', changefreq: 'monthly', priority: '0.8' },
      { loc: '/services', changefreq: 'monthly', priority: '0.9' },
      { loc: '/insights', changefreq: 'daily', priority: '0.8' },
      { loc: '/articles', changefreq: 'daily', priority: '0.9' },
      { loc: '/schedule', changefreq: 'weekly', priority: '0.7' },
      { loc: '/privacy', changefreq: 'yearly', priority: '0.3' },
    ]

    // Build sitemap XML
    const baseUrl = 'https://polrydian.com'
    const currentDate = new Date().toISOString().split('T')[0]
    
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`

    // Add static pages
    staticPages.forEach(page => {
      sitemap += `  <url>
    <loc>${baseUrl}${page.loc}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <lastmod>${currentDate}</lastmod>
  </url>
`
    })

    // Add article pages
    articles?.forEach(article => {
      const lastmod = article.updated_at ? new Date(article.updated_at).toISOString().split('T')[0] : currentDate
      sitemap += `  <url>
    <loc>${baseUrl}/articles/${article.slug || article.id}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <lastmod>${lastmod}</lastmod>
  </url>
`
    })

    sitemap += `</urlset>`

    return new Response(sitemap, {
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      },
    })

  } catch (error) {
    console.error('Error generating sitemap:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})