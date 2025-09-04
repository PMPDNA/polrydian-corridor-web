import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-forwarded-for',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 CSIS Feed Fetcher function started');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // CSIS RSS feeds for economics and trade analysis
    const csisFeeds = [
      {
        url: 'https://www.csis.org/programs/economics-program/rss.xml',
        category: 'economics'
      },
      {
        url: 'https://www.csis.org/analysis/rss.xml',
        category: 'analysis'
      }
    ];

    const articles: any[] = [];

    for (const feed of csisFeeds) {
      try {
        console.log(`📡 Fetching CSIS feed: ${feed.url}`);
        
        const response = await fetch(feed.url);
        if (!response.ok) {
          console.error(`❌ Failed to fetch ${feed.url}: ${response.status}`);
          continue;
        }

        const xmlText = await response.text();
        
        // Parse RSS XML (simplified parser)
        const items = extractRSSItems(xmlText);
        
        for (const item of items.slice(0, 10)) { // Take latest 10 items
          // Check if we already have this article
          const { data: existing } = await supabase
            .from('csis_articles')
            .select('id')
            .eq('link', item.link)
            .single();

          if (!existing) {
            const { error: insertError } = await supabase
              .from('csis_articles')
              .insert({
                title: item.title,
                summary: item.description || item.title,
                link: item.link,
                published_at: item.pubDate,
                category: feed.category
              });

            if (insertError) {
              console.error('❌ Error inserting CSIS article:', insertError);
            } else {
              console.log(`✅ Inserted CSIS article: ${item.title}`);
              articles.push(item);
            }
          }
        }
        
      } catch (error) {
        console.error(`❌ Error processing feed ${feed.url}:`, error);
      }
    }

    console.log(`🎉 CSIS Feed processing completed. Processed ${articles.length} new articles.`);
    
    return new Response(
      JSON.stringify({
        success: true,
        articles_processed: articles.length,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
    
  } catch (error) {
    console.error('❌ CSIS Feed Fetcher error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

// Simple RSS parser function
function extractRSSItems(xmlText: string): any[] {
  const items: any[] = [];
  
  // Extract items using regex (simplified approach)
  const itemRegex = /<item[^>]*>(.*?)<\/item>/gs;
  const matches = xmlText.matchAll(itemRegex);
  
  for (const match of matches) {
    const itemContent = match[1];
    
    // Extract fields
    const title = extractTag(itemContent, 'title');
    const link = extractTag(itemContent, 'link');
    const description = extractTag(itemContent, 'description');
    const pubDate = extractTag(itemContent, 'pubDate');
    
    if (title && link) {
      items.push({
        title: cleanText(title),
        link: cleanText(link),
        description: cleanText(description || ''),
        pubDate: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString()
      });
    }
  }
  
  return items;
}

function extractTag(content: string, tagName: string): string | null {
  const regex = new RegExp(`<${tagName}[^>]*>([^<]*)<\/${tagName}>`, 'i');
  const match = content.match(regex);
  return match ? match[1] : null;
}

function cleanText(text: string): string {
  return text
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}