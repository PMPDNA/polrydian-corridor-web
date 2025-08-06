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
    console.log('🚀 FRED API Integration function started');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const fredApiKey = Deno.env.get('FRED_API_KEY');
    
    if (!fredApiKey) {
      throw new Error('FRED API key not configured');
    }
    
    console.log('🔑 FRED API key configured, proceeding with data fetch');
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Parse request body
    let requestBody: any = {};
    try {
      if (req.body) {
        requestBody = await req.json();
      }
    } catch (e) {
      // Body might be empty or malformed, use defaults
    }
    
    console.log('📝 Request:', requestBody);
    
    // Define core economic indicators with proper series IDs
    const coreIndicators = [
      {
        id: 'A191RL1A225NBEA',
        series_id: 'A191RL1A225NBEA',
        title: 'U.S. Real GDP Growth Rate',
        description: 'Real Gross Domestic Product Growth Rate (Percent Change from Preceding Period, Seasonally Adjusted Annual Rate)',
        units: 'Percent',
        frequency: 'Quarterly',
        indicator_type: 'gdp_growth'
      },
      {
        id: 'UNRATE',
        series_id: 'UNRATE',
        title: 'U.S. Unemployment Rate',
        description: 'Civilian Unemployment Rate',
        units: 'Percent',
        frequency: 'Monthly',
        indicator_type: 'unemployment'
      },
      {
        id: 'CPIAUCSL',
        series_id: 'CPIAUCSL',
        title: 'U.S. Inflation Rate (CPI)',
        description: 'Consumer Price Index for All Urban Consumers: All Items',
        units: 'Index 1982-84=100',
        frequency: 'Monthly',
        indicator_type: 'inflation_rate'
      },
      {
        id: 'FEDFUNDS',
        series_id: 'FEDFUNDS',
        title: 'U.S. Federal Funds Rate',
        description: 'Effective Federal Funds Rate',
        units: 'Percent',
        frequency: 'Monthly',
        indicator_type: 'interest_rate'
      },
      {
        id: 'UMCSENT',
        series_id: 'UMCSENT',
        title: 'U.S. Consumer Sentiment',
        description: 'University of Michigan Consumer Sentiment Index',
        units: 'Index 1966:Q1=100',
        frequency: 'Monthly',
        indicator_type: 'consumer_confidence'
      },
      {
        id: 'HOUST',
        series_id: 'HOUST',
        title: 'U.S. Housing Starts',
        description: 'New Privately-Owned Housing Units Started',
        units: 'Thousands of Units, Annual Rate',
        frequency: 'Monthly',
        indicator_type: 'housing'
      },
      {
        id: 'RSXFS',
        series_id: 'RSXFS',
        title: 'U.S. Retail Sales',
        description: 'Advance Real Retail and Food Services Sales',
        units: 'Millions of Dollars',
        frequency: 'Monthly',
        indicator_type: 'retail'
      },
      {
        id: 'INDPRO',
        series_id: 'INDPRO',
        title: 'U.S. Industrial Production',
        description: 'Industrial Production Total Index',
        units: 'Index 2017=100',
        frequency: 'Monthly',
        indicator_type: 'industrial'
      }
    ];
    
    // Filter indicators based on request
    let indicatorsToFetch = coreIndicators;
    if (requestBody.indicators && Array.isArray(requestBody.indicators)) {
      const requestedTypes = requestBody.indicators;
      indicatorsToFetch = coreIndicators.filter(indicator => 
        requestedTypes.some(type => 
          indicator.indicator_type.includes(type.toLowerCase()) ||
          indicator.id.toLowerCase().includes(type.toLowerCase())
        )
      );
    }
    
    const results: any[] = [];
    
    for (const indicator of indicatorsToFetch) {
      try {
        console.log(`📊 Fetching FRED data for series: ${indicator.series_id}`);
        
        const fredUrl = `https://api.stlouisfed.org/fred/series/observations?series_id=${indicator.series_id}&api_key=${fredApiKey}&file_type=json&limit=24&sort_order=desc`;
        
        const fredResponse = await fetch(fredUrl);
        
        if (!fredResponse.ok) {
          console.error(`❌ FRED API error for ${indicator.series_id}: ${fredResponse.status} ${fredResponse.statusText}`);
          continue;
        }
        
        const fredData = await fredResponse.json();
        console.log(`✅ FRED API request completed successfully for ${indicator.series_id}`);
        
        if (!fredData.observations || fredData.observations.length === 0) {
          console.warn(`⚠️ No observations found for ${indicator.series_id}`);
          continue;
        }
        
        const observations = fredData.observations.filter(obs => obs.value !== '.' && obs.value !== null);
        
        if (observations.length === 0) {
          console.warn(`⚠️ No valid observations for ${indicator.series_id}`);
          continue;
        }
        
        const latestObs = observations[0];
        const prevObs = observations[1];
        
        // Calculate percentage change
        let changePercent = null;
        if (prevObs && latestObs.value !== '.' && prevObs.value !== '.') {
          const current = parseFloat(latestObs.value);
          const previous = parseFloat(prevObs.value);
          if (!isNaN(current) && !isNaN(previous) && previous !== 0) {
            changePercent = ((current - previous) / previous) * 100;
          }
        }
        
        const latestValue = parseFloat(latestObs.value);
        if (isNaN(latestValue)) {
          console.warn(`⚠️ Invalid latest value for ${indicator.series_id}: ${latestObs.value}`);
          continue;
        }
        
        const result = {
          id: indicator.id,
          title: indicator.title,
          series_id: indicator.series_id,
          latest_value: latestValue,
          latest_date: latestObs.date,
          change_percent: changePercent,
          description: indicator.description,
          units: indicator.units,
          frequency: indicator.frequency,
          indicator_type: indicator.indicator_type,
          data_points: observations.slice(0, 12).map(obs => ({
            date: obs.date,
            value: parseFloat(obs.value) || 0
          }))
        };
        
        results.push(result);
        
        // Store in insights table
        const { error: insertError } = await supabase
          .from('insights')
          .upsert({
            title: indicator.title,
            content: `Latest ${indicator.title}: ${latestValue.toLocaleString()} ${indicator.units}. ${indicator.description}`,
            data_source: 'Federal Reserve Economic Data',
            series_id: indicator.series_id,
            indicator_type: indicator.indicator_type,
            region: 'US',
            data_points: observations.slice(0, 12).map(obs => ({
              date: obs.date,
              value: parseFloat(obs.value) || 0,
              series_id: indicator.series_id
            })),
            chart_config: {
              type: 'line',
              title: indicator.title,
              yAxisLabel: indicator.units,
              latest_value: latestValue,
              latest_date: latestObs.date,
              change_percent: changePercent
            },
            is_published: true
          }, {
            onConflict: 'series_id'
          });
        
        if (insertError) {
          console.error(`❌ Error storing insight for ${indicator.series_id}:`, insertError);
        } else {
          console.log(`✅ Successfully stored insight for ${indicator.series_id}`);
        }
        
        // Rate limiting to avoid hitting API limits
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Error processing ${indicator.series_id}:`, error);
      }
    }
    
    console.log(`🎉 FRED API Integration completed. Processed ${results.length} indicators.`);
    
    return new Response(
      JSON.stringify({
        success: true,
        data: results,
        message: `Successfully fetched ${results.length} indicators`,
        indicators_processed: results.length,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
    
  } catch (error) {
    console.error('❌ FRED API Integration error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        data: [],
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});