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

    // Search terms for policy updates
    const searchTerms = [
      'trade policy',
      'tariffs',
      'corridor economics',
      'semiconductor',
      'BRICS',
      'supply chain',
      'economic corridor'
    ];

    const updates: any[] = [];

    // For demo purposes, we'll create some mock policy updates
    // In production, you would integrate with news APIs like GDELT, NewsAPI, etc.
    const mockUpdates = [
      {
        headline: "New Trade Corridor Initiative Announced Between US and Indo-Pacific Partners",
        summary: "Biden administration announces new economic corridor development program aimed at strengthening supply chain resilience and trade relationships in the Indo-Pacific region.",
        source: "Reuters",
        url: "https://www.reuters.com/business/trade-corridor-initiative-2024",
        tags: ["trade policy", "corridor", "Indo-Pacific"],
        published_at: new Date().toISOString()
      },
      {
        headline: "BRICS Nations Explore New Payment Corridors for Trade",
        summary: "BRICS economic forum discusses development of alternative payment systems and trade corridors to reduce dependency on traditional financial networks.",
        source: "Financial Times",
        url: "https://www.ft.com/content/brics-payment-corridors",
        tags: ["BRICS", "trade policy", "corridor"],
        published_at: new Date(Date.now() - 86400000).toISOString() // 1 day ago
      },
      {
        headline: "Semiconductor Supply Chain Resilience Act Progress Update",
        summary: "Latest developments in semiconductor supply chain legislation and its implications for technology corridors and manufacturing partnerships.",
        source: "Wall Street Journal",
        url: "https://www.wsj.com/semiconductor-supply-chain-update",
        tags: ["semiconductor", "supply chain", "trade policy"],
        published_at: new Date(Date.now() - 172800000).toISOString() // 2 days ago
      },
      {
        headline: "EU-Asia Trade Corridor Development Fund Established",
        summary: "European Union announces new funding mechanism for infrastructure projects that strengthen trade corridors between Europe and Asia.",
        source: "Politico Europe",
        url: "https://www.politico.eu/eu-asia-trade-corridor-fund",
        tags: ["corridor economics", "trade policy"],
        published_at: new Date(Date.now() - 259200000).toISOString() // 3 days ago
      },
      {
        headline: "Tariff Adjustments Impact Global Trade Routes",
        summary: "Recent tariff changes prompt reassessment of optimal trade corridors and supply chain configurations for multinational corporations.",
        source: "Bloomberg",
        url: "https://www.bloomberg.com/tariff-trade-routes-impact",
        tags: ["tariffs", "trade policy", "supply chain"],
        published_at: new Date(Date.now() - 345600000).toISOString() // 4 days ago
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
          .insert(update);

        if (insertError) {
          console.error('❌ Error inserting policy update:', insertError);
        } else {
          console.log(`✅ Inserted policy update: ${update.headline}`);
          updates.push(update);
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