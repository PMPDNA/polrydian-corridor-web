import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FRED_API_KEY = Deno.env.get('FRED_API_KEY');
const FRED_BASE_URL = 'https://api.stlouisfed.org/fred';

// Key economic indicators to cache
const ECONOMIC_SERIES = [
  { id: 'GDP', title: 'Gross Domestic Product', units: 'Billions of Dollars' },
  { id: 'UNRATE', title: 'Unemployment Rate', units: 'Percent' },
  { id: 'CPIAUCSL', title: 'Consumer Price Index', units: 'Index 1982-1984=100' },
  { id: 'FEDFUNDS', title: 'Federal Funds Rate', units: 'Percent' },
  { id: 'DGS10', title: '10-Year Treasury Rate', units: 'Percent' },
  { id: 'DEXUSEU', title: 'USD/EUR Exchange Rate', units: 'US Dollars per Euro' },
  { id: 'DCOILWTICO', title: 'WTI Crude Oil Price', units: 'Dollars per Barrel' },
  { id: 'GOLDAMGBD228NLBM', title: 'Gold Price', units: 'US Dollars per Troy Ounce' }
];

async function fetchFredSeries(seriesId: string) {
  const url = `${FRED_BASE_URL}/series/observations?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json&limit=100&sort_order=desc`;
  
  console.log(`Fetching FRED data for ${seriesId}`);
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`FRED API error for ${seriesId}: ${response.status}`);
  }
  
  const data = await response.json();
  return data.observations || [];
}

async function fetchFredSeriesInfo(seriesId: string) {
  const url = `${FRED_BASE_URL}/series?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`FRED series info error for ${seriesId}: ${response.status}`);
  }
  
  const data = await response.json();
  return data.seriess?.[0] || {};
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (!FRED_API_KEY) {
    return new Response(JSON.stringify({ error: 'FRED_API_KEY not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    let totalUpdated = 0;
    const errors: string[] = [];

    for (const series of ECONOMIC_SERIES) {
      try {
        console.log(`Processing series: ${series.id}`);

        // Fetch series metadata
        const seriesInfo = await fetchFredSeriesInfo(series.id);
        
        // Upsert series info
        const { error: seriesError } = await supabase
          .from('fred_series')
          .upsert({
            series_id: series.id,
            title: seriesInfo.title || series.title,
            units: seriesInfo.units || series.units,
            frequency: seriesInfo.frequency,
            seasonal_adjustment: seriesInfo.seasonal_adjustment,
            notes: seriesInfo.notes,
            last_updated: new Date().toISOString()
          });

        if (seriesError) {
          console.error(`Error upserting series ${series.id}:`, seriesError);
          errors.push(`Series ${series.id}: ${seriesError.message}`);
          continue;
        }

        // Fetch observations
        const observations = await fetchFredSeries(series.id);
        
        if (observations.length === 0) {
          console.log(`No observations found for ${series.id}`);
          continue;
        }

        // Prepare observations for batch insert
        const observationData = observations
          .filter((obs: any) => obs.value !== '.' && obs.value !== null)
          .map((obs: any) => ({
            series_id: series.id,
            date: obs.date,
            value: parseFloat(obs.value)
          }));

        if (observationData.length > 0) {
          // Use upsert to handle duplicates
          const { error: obsError } = await supabase
            .from('fred_observations')
            .upsert(observationData, {
              onConflict: 'series_id,date'
            });

          if (obsError) {
            console.error(`Error upserting observations for ${series.id}:`, obsError);
            errors.push(`Observations ${series.id}: ${obsError.message}`);
          } else {
            totalUpdated += observationData.length;
            console.log(`Updated ${observationData.length} observations for ${series.id}`);
          }
        }

        // Add small delay to be respectful to FRED API
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`Error processing series ${series.id}:`, error);
        errors.push(`${series.id}: ${error.message}`);
      }
    }

    const result = {
      success: true,
      totalUpdated,
      seriesProcessed: ECONOMIC_SERIES.length,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString()
    };

    console.log('FRED refresh completed:', result);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('FRED refresh error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});