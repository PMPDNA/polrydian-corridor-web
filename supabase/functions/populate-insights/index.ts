import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ECONOMIC_INSIGHTS = [
  {
    title: 'US GDP Growth Trends',
    content: 'Quarterly analysis of US Gross Domestic Product growth patterns and their implications for corridor economics.',
    data_source: 'FRED',
    series_id: 'GDP',
    indicator_type: 'growth',
    region: 'US',
    is_published: true
  },
  {
    title: 'Unemployment Rate Analysis',
    content: 'Monthly unemployment rate trends and their impact on labor market dynamics.',
    data_source: 'FRED',
    series_id: 'UNRATE',
    indicator_type: 'labor',
    region: 'US',
    is_published: true
  },
  {
    title: 'Consumer Price Index Trends',
    content: 'Inflation measurement through Consumer Price Index changes and purchasing power analysis.',
    data_source: 'FRED',
    series_id: 'CPIAUCSL',
    indicator_type: 'inflation',
    region: 'US',
    is_published: true
  },
  {
    title: 'Federal Funds Rate',
    content: 'Federal Reserve interest rate decisions and their impact on economic corridors.',
    data_source: 'FRED',
    series_id: 'FEDFUNDS',
    indicator_type: 'monetary',
    region: 'US',
    is_published: true
  },
  {
    title: 'Consumer Confidence Index',
    content: 'Consumer sentiment trends and their relationship to economic activity.',
    data_source: 'FRED',
    series_id: 'UMCSENT',
    indicator_type: 'sentiment',
    region: 'US',
    is_published: true
  }
];

async function fetchAndPopulateInsights(supabase: any) {
  console.log('🔄 Starting insights population...');
  
  // First, check if insights already exist
  const { data: existingInsights } = await supabase
    .from('insights')
    .select('series_id')
    .limit(1);
  
  if (existingInsights && existingInsights.length > 0) {
    console.log('📊 Insights already exist, updating data...');
  } else {
    console.log('📝 Creating new insights...');
  }
  
  // Fetch latest data for each insight
  for (const insight of ECONOMIC_INSIGHTS) {
    try {
      console.log(`📊 Processing insight: ${insight.title}`);
      
      // Fetch real data from FRED API
      const fredApiKey = Deno.env.get('FRED_API_KEY');
      if (!fredApiKey) {
        console.warn('⚠️ FRED API key not available, using placeholder data');
        // Insert with placeholder data
        await supabase
          .from('insights')
          .upsert({
            ...insight,
            data_points: [{ date: new Date().toISOString().split('T')[0], value: 0, note: 'Placeholder data' }]
          }, { onConflict: 'series_id' });
        continue;
      }
      
      // Fetch real FRED data
      const fredUrl = `https://api.stlouisfed.org/fred/series/observations?series_id=${insight.series_id}&api_key=${fredApiKey}&file_type=json&limit=12&sort_order=desc`;
      
      const response = await fetch(fredUrl);
      if (!response.ok) {
        throw new Error(`FRED API error: ${response.status}`);
      }
      
      const fredData = await response.json();
      const observations = fredData.observations || [];
      
      // Format data points
      const dataPoints = observations
        .filter((obs: any) => obs.value !== '.')
        .map((obs: any) => ({
          date: obs.date,
          value: parseFloat(obs.value),
          realtime_start: obs.realtime_start,
          realtime_end: obs.realtime_end
        }));
      
      // Upsert insight with real data
      const { error } = await supabase
        .from('insights')
        .upsert({
          ...insight,
          data_points: dataPoints,
          chart_config: {
            type: 'line',
            xAxis: 'date',
            yAxis: 'value',
            title: insight.title
          }
        }, { onConflict: 'series_id' });
      
      if (error) {
        console.error(`❌ Error upserting insight ${insight.title}:`, error);
      } else {
        console.log(`✅ Successfully processed: ${insight.title}`);
      }
      
    } catch (error) {
      console.error(`❌ Error processing insight ${insight.title}:`, error);
    }
  }
  
  console.log('✅ Insights population completed');
}

serve(async (req) => {
  console.log('🚀 Populate Insights function started');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    await fetchAndPopulateInsights(supabase);
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Insights populated successfully' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('💥 Error in populate insights:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});