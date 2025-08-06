import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Policy Updates Fetcher function started');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Search terms for trade policy updates
    const searchTerms = [
      'tariffs',
      'trade war',
      'semiconductors',
      'BRICS',
      'trade policy',
      'export controls',
      'supply chain',
      'economic sanctions'
    ];

    const updates: any[] = [];

    // Use NewsAPI (free tier) for policy updates
    // Note: In production, you would get a free API key from https://newsapi.org/
    const newsApiKey = Deno.env.get('NEWS_API_KEY');
    
    if (!newsApiKey) {
      console.log('⚠️ NEWS_API_KEY not found, using mock data');
      
      // Insert mock policy updates for demonstration
      const mockUpdates = [
        {
          headline: 'New EU Tariffs on Chinese Electric Vehicles Take Effect',
          summary: 'The European Union has implemented new tariffs on Chinese electric vehicle imports, marking a significant shift in trade policy.',
          url: 'https://example.com/eu-tariffs-china-ev',
          source: 'Reuters',
          tags: ['tariffs', 'EU', 'China', 'electric vehicles']
        },
        {
          headline: 'BRICS Nations Discuss Alternative Payment Systems',
          summary: 'BRICS countries are advancing discussions on creating alternative payment mechanisms to reduce dependence on dollar-based systems.',
          url: 'https://example.com/brics-payment-systems',
          source: 'Financial Times',
          tags: ['BRICS', 'payment systems', 'trade']
        },
        {
          headline: 'US Expands Semiconductor Export Controls',
          summary: 'The United States has announced expanded export controls on semiconductor technology to certain countries.',
          url: 'https://example.com/us-semiconductor-controls',
          source: 'Wall Street Journal',
          tags: ['semiconductors', 'export controls', 'US', 'technology']
        }
      ];

      for (const update of mockUpdates) {
        // Check if we already have this update
        const { data: existing } = await supabase
          .from('policy_updates')
          .select('id')
          .eq('url', update.url)
          .single();

        if (!existing) {
          const { error: insertError } = await supabase
            .from('policy_updates')
            .insert({
              headline: update.headline,
              summary: update.summary,
              url: update.url,
              source: update.source,
              tags: update.tags,
              published_at: new Date().toISOString()
            });

          if (insertError) {
            console.error('❌ Error inserting policy update:', insertError);
          } else {
            console.log(`✅ Inserted policy update: ${update.headline}`);
            updates.push(update);
          }
        }
      }
    } else {
      // Real NewsAPI implementation
      for (const term of searchTerms.slice(0, 3)) { // Limit to avoid rate limits
        try {
          const newsUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(term)}&language=en&sortBy=publishedAt&pageSize=5&apiKey=${newsApiKey}`;
          
          console.log(`📡 Fetching news for term: ${term}`);
          
          const response = await fetch(newsUrl);
          if (!response.ok) {
            console.error(`❌ Failed to fetch news for ${term}: ${response.status}`);
            continue;
          }

          const data = await response.json();
          
          for (const article of data.articles || []) {
            if (!article.title || !article.url) continue;

            // Check if we already have this update
            const { data: existing } = await supabase
              .from('policy_updates')
              .select('id')
              .eq('url', article.url)
              .single();

            if (!existing) {
              const { error: insertError } = await supabase
                .from('policy_updates')
                .insert({
                  headline: article.title,
                  summary: article.description || article.title,
                  url: article.url,
                  source: article.source?.name || 'Unknown',
                  tags: [term],
                  published_at: article.publishedAt || new Date().toISOString()
                });

              if (insertError) {
                console.error('❌ Error inserting policy update:', insertError);
              } else {
                console.log(`✅ Inserted policy update: ${article.title}`);
                updates.push(article);
              }
            }
          }
          
          // Rate limiting - wait between requests
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          console.error(`❌ Error fetching news for ${term}:`, error);
        }
      }
    }

    console.log(`🎉 Policy Updates processing completed. Processed ${updates.length} new updates.`);
    
    return new Response(
      JSON.stringify({
        success: true,
        updates_processed: updates.length,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
    
  } catch (error) {
    console.error('❌ Policy Updates Fetcher error:', error);
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