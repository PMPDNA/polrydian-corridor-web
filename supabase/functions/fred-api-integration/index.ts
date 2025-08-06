import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// FRED API endpoints and series
const FRED_BASE_URL = 'https://api.stlouisfed.org/fred';

// Correct FRED series IDs for economic indicators
const ECONOMIC_INDICATORS = {
  gdp: 'A191RL1Q225SBEA', // Real GDP Percent Change from Preceding Period (Quarterly, Seasonally Adjusted Annual Rate)
  unemployment: 'UNRATE', // Unemployment Rate (Monthly, Seasonally Adjusted)
  inflation: 'CPIAUCSL', // Consumer Price Index for All Urban Consumers (we'll calculate YoY change)
  interest_rate: 'FEDFUNDS', // Federal Funds Effective Rate
  consumer_confidence: 'UMCSENT', // University of Michigan Consumer Sentiment
  housing_starts: 'HOUST', // Housing Starts
  retail_sales: 'RSXFS', // Retail Sales
  industrial_production: 'INDPRO' // Industrial Production Index
};

async function fetchFredData(seriesId: string, apiKey: string, limit = 100) {
  const url = `${FRED_BASE_URL}/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json&limit=${limit}&sort_order=desc`;
  
  console.log(`📊 Fetching FRED data for series: ${seriesId}`);
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`FRED API error: ${response.status} - ${await response.text()}`);
  }
  
  const data = await response.json();
  return data.observations || [];
}

// Calculate inflation rate from CPI data (Year-over-Year percentage change)
function calculateInflationRate(cpiData: any[]): any[] {
  if (!cpiData || cpiData.length < 12) return cpiData;
  
  return cpiData.map((current, index) => {
    // Find the observation from 12 months ago
    const yearAgoIndex = cpiData.findIndex(obs => {
      const currentDate = new Date(current.date);
      const obsDate = new Date(obs.date);
      const monthsDiff = (currentDate.getFullYear() - obsDate.getFullYear()) * 12 + 
                        (currentDate.getMonth() - obsDate.getMonth());
      return Math.abs(monthsDiff - 12) < 2; // Allow 1-2 months tolerance
    });
    
    if (yearAgoIndex !== -1 && current.value !== '.' && cpiData[yearAgoIndex].value !== '.') {
      const currentValue = parseFloat(current.value);
      const yearAgoValue = parseFloat(cpiData[yearAgoIndex].value);
      const inflationRate = ((currentValue - yearAgoValue) / yearAgoValue) * 100;
      
      return {
        ...current,
        value: inflationRate.toFixed(1)
      };
    }
    
    return current;
  });
}

async function logIntegrationEvent(supabase: any, operation: string, status: string, details: any, userId?: string) {
  await supabase.rpc('log_integration_event', {
    p_integration_type: 'fred',
    p_operation: operation,
    p_status: status,
    p_user_id: userId,
    p_request_data: details.request || {},
    p_response_data: details.response || {},
    p_execution_time_ms: details.execution_time || null,
    p_error_message: details.error || null
  });
}

serve(async (req) => {
  console.log('🚀 FRED API Integration function started');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  let operation = 'unknown';
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const fredApiKey = Deno.env.get('FRED_API_KEY');

    if (!fredApiKey) {
      throw new Error('FRED API key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // For FRED data, we don't need user authentication - this is service-level data
    console.log('🔑 FRED API key configured, proceeding with data fetch');

    const body = await req.json();
    operation = body.operation || 'fetch_data';
    
    console.log('📝 Request:', { operation, indicators: body.indicators });

    let result = {};
    const executionTime = Date.now() - startTime;

    switch (operation) {
      case 'fetch_indicators':
        const indicators = body.indicators || Object.keys(ECONOMIC_INDICATORS);
        const fredData = {};
        
        for (const indicator of indicators) {
          const seriesId = ECONOMIC_INDICATORS[indicator];
          if (seriesId) {
            try {
              let rawData = await fetchFredData(seriesId, fredApiKey, body.limit);
              
              // Special processing for inflation - calculate YoY change from CPI level data
              if (indicator === 'inflation') {
                rawData = calculateInflationRate(rawData);
              }
              
              fredData[indicator] = rawData;
            } catch (error) {
              console.error(`❌ Failed to fetch ${indicator}:`, error);
              fredData[indicator] = { error: error.message };
            }
          }
        }
        
        result = { success: true, data: fredData };
        
        await logIntegrationEvent(supabase, operation, 'success', {
          request: { indicators, limit: body.limit },
          response: { indicators_count: Object.keys(fredData).length },
          execution_time: executionTime
        });
        
        break;

      case 'fetch_series':
        const seriesId = body.series_id;
        if (!seriesId) {
          throw new Error('Series ID required for fetch_series operation');
        }
        
        const seriesData = await fetchFredData(seriesId, fredApiKey, body.limit);
        result = { success: true, data: seriesData };
        
        await logIntegrationEvent(supabase, operation, 'success', {
          request: { series_id: seriesId, limit: body.limit },
          response: { observations_data: seriesData.length },
          execution_time: executionTime
        });
        
        break;

      case 'get_available_series':
        result = { 
          success: true, 
          data: Object.entries(ECONOMIC_INDICATORS).map(([key, seriesId]) => ({
            key,
            series_id: seriesId,
            name: key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
          }))
        };
        break;

      default:
        throw new Error(`Unknown operation: ${operation}`);
    }

    console.log('✅ FRED API request completed successfully');
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    const executionTime = Date.now() - startTime;
    console.error('💥 FRED API error:', error);
    
    // Log error to integration logs
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      await logIntegrationEvent(supabase, operation, 'error', {
        error: error.message,
        execution_time: executionTime
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
    
    return new Response(JSON.stringify({ 
      error: error.message,
      operation: operation
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});