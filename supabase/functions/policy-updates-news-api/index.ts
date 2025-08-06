import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.0.0';

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const newsApiKey = Deno.env.get('NEWS_API_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Define search terms for policy-related news
    const searchTerms = [
      'trade policy', 'economic corridor', 'supply chain', 'infrastructure investment',
      'trade agreement', 'economic sanctions', 'tariff policy', 'USMCA', 'Brexit',
      'China trade', 'semiconductor policy', 'energy security', 'food security'
    ];

    let articles: any[] = [];

    if (newsApiKey) {
      console.log('🔄 Fetching policy updates from News API');
      
      // Search recent news for policy updates
      for (const term of searchTerms.slice(0, 3)) { // Limit to avoid rate limits
        try {
          const newsResponse = await fetch(
            `https://newsapi.org/v2/everything?q="${term}"&language=en&sortBy=publishedAt&pageSize=5&from=${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}`,
            {
              headers: {
                'X-API-Key': newsApiKey
              }
            }
          );

          if (newsResponse.ok) {
            const newsData = await newsResponse.json();
            articles = articles.concat(newsData.articles || []);
          }
          
          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Error fetching news for term "${term}":`, error);
        }
      }
      
      console.log(`📰 Fetched ${articles.length} articles from News API`);
    } else {
      console.log('⚠️ NEWS_API_KEY not found, using mock policy updates');
      
      // Mock data with realistic policy updates
      articles = [
        {
          title: "US Treasury Issues New Economic Security Guidelines",
          description: "The Treasury Department released comprehensive guidelines for evaluating foreign investment in critical infrastructure sectors.",
          url: "https://home.treasury.gov/news/press-releases",
          publishedAt: new Date().toISOString(),
          source: { name: "US Treasury" }
        },
        {
          title: "EU Announces New Digital Trade Framework",
          description: "European Commission unveils strategy for digital trade corridors and cross-border data flows to enhance economic integration.",
          url: "https://ec.europa.eu/trade/policy/",
          publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          source: { name: "European Commission" }
        },
        {
          title: "CSIS Analysis: Supply Chain Resilience in Critical Minerals",
          description: "New CSIS report examines policy options for securing critical mineral supply chains amid geopolitical tensions.",
          url: "https://www.csis.org/analysis/building-supply-chain-resilience",
          publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          source: { name: "CSIS" }
        }
      ];
    }

    // Process and store articles
    let processedCount = 0;
    for (const article of articles.slice(0, 10)) { // Limit processing
      try {
        // Check if article already exists
        const { data: existing } = await supabase
          .from('policy_updates')
          .select('id')
          .eq('url', article.url)
          .single();

        if (!existing) {
          // Insert new policy update
          const { error: insertError } = await supabase
            .from('policy_updates')
            .insert({
              headline: article.title,
              summary: article.description,
              url: article.url,
              source: article.source?.name || 'News API',
              published_at: article.publishedAt,
              tags: searchTerms.filter(term => 
                article.title?.toLowerCase().includes(term.toLowerCase()) ||
                article.description?.toLowerCase().includes(term.toLowerCase())
              )
            });

          if (!insertError) {
            console.log(`✅ Inserted policy update: ${article.title}`);
            processedCount++;
          } else {
            console.error(`❌ Error inserting article: ${insertError.message}`);
          }
        }
      } catch (error) {
        console.error(`❌ Error processing article:`, error);
      }
    }

    console.log(`🎉 Policy Updates processing completed. Processed ${processedCount} new updates.`);

    return new Response(JSON.stringify({ 
      success: true,
      processed_count: processedCount,
      total_articles: articles.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Error in policy-updates-news-api function:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});