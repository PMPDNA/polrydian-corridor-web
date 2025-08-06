import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const fredApiKey = Deno.env.get('FRED_API_KEY')!

    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('🔄 Starting economic data collection...')

    // Define key economic indicators to fetch
    const indicators = [
      { series_id: 'GDP', title: 'US GDP', description: 'Gross Domestic Product', units: 'Billions of Dollars' },
      { series_id: 'CPIAUCSL', title: 'US CPI', description: 'Consumer Price Index for All Urban Consumers', units: 'Index 1982-1984=100' },
      { series_id: 'FEDFUNDS', title: 'Federal Funds Rate', description: 'Effective Federal Funds Rate', units: 'Percent' },
      { series_id: 'UMCSENT', title: 'Consumer Sentiment', description: 'University of Michigan Consumer Sentiment', units: 'Index 1966:Q1=100' },
      { series_id: 'HOUST', title: 'Housing Starts', description: 'New Privately-Owned Housing Units Started', units: 'Thousands of Units' },
      { series_id: 'RSXFS', title: 'Retail Sales', description: 'Advance Real Retail and Food Services Sales', units: 'Millions of Dollars' },
      { series_id: 'INDPRO', title: 'Industrial Production', description: 'Industrial Production Index', units: 'Index 2017=100' }
    ]

    for (const indicator of indicators) {
      try {
        console.log(`📊 Fetching data for ${indicator.series_id}...`)
        
        const fredUrl = `https://api.stlouisfed.org/fred/series/observations?series_id=${indicator.series_id}&api_key=${fredApiKey}&file_type=json&limit=12&sort_order=desc`
        
        const fredResponse = await fetch(fredUrl)
        if (!fredResponse.ok) {
          throw new Error(`FRED API error: ${fredResponse.status}`)
        }
        
        const fredData = await fredResponse.json()
        const observations = fredData.observations || []
        
        if (observations.length > 0) {
          const latestObs = observations[0]
          const prevObs = observations[1]
          
          // Calculate change percent if we have previous data
          let changePercent = null
          if (prevObs && latestObs.value !== '.' && prevObs.value !== '.') {
            const current = parseFloat(latestObs.value)
            const previous = parseFloat(prevObs.value)
            changePercent = ((current - previous) / previous) * 100
          }
          
          // Store insight in database
          const { error } = await supabase
            .from('insights')
            .upsert({
              title: indicator.title,
              content: `Latest ${indicator.title}: ${latestObs.value} ${indicator.units}. ${indicator.description}`,
              data_source: 'FRED',
              series_id: indicator.series_id,
              indicator_type: 'economic',
              data_points: observations.map(obs => ({
                date: obs.date,
                value: obs.value,
                series_id: indicator.series_id
              })),
              chart_config: {
                type: 'line',
                title: indicator.title,
                yAxisLabel: indicator.units,
                latest_value: latestObs.value,
                latest_date: latestObs.date,
                change_percent: changePercent
              },
              is_published: true
            }, {
              onConflict: 'series_id',
              ignoreDuplicates: false
            })

          if (error) {
            console.error(`❌ Error storing ${indicator.series_id}:`, error)
          } else {
            console.log(`✅ Successfully stored ${indicator.series_id}`)
          }
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 200))
        
      } catch (error) {
        console.error(`❌ Error processing ${indicator.series_id}:`, error)
      }
    }

    console.log('✅ Economic data collection completed')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Economic data updated successfully',
        indicators_processed: indicators.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ Economic data scheduler error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})