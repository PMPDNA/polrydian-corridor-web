import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { maybeHealth, json, logError } from '../_shared/http.ts'

// Economic indicators with their FRED series IDs
const ECONOMIC_INDICATORS = {
  'GDP': 'GDP',
  'CPI': 'CPIAUCSL',
  'GSCPI': 'GSCPI', // Global Supply Chain Pressure Index
  'yield_curve': 'T10Y2Y', // 10-Year Treasury Constant Maturity Minus 2-Year Treasury
  'unemployment': 'UNRATE',
  'industrial_production': 'INDPRO',
  'consumer_sentiment': 'UMCSENT'
}

const fetchFredData = async (seriesId: string, apiKey: string, limit = 100) => {
  const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json&limit=${limit}&sort_order=desc`
  
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`FRED API error: ${response.status}`)
  }
  
  const data = await response.json()
  return data.observations || []
}

const logIntegrationEvent = async (supabase: any, operation: string, status: string, details: any, userId?: string) => {
  try {
    await supabase.rpc('log_integration_event', {
      p_integration_type: 'FRED',
      p_operation: operation,
      p_status: status,
      p_user_id: userId,
      p_request_data: details.request || {},
      p_response_data: details.response || {},
      p_execution_time_ms: details.executionTime || null,
      p_error_message: details.error || null
    })
  } catch (error) {
    console.error('Failed to log integration event:', error)
  }
}

serve(async (req) => {
  // Check for health endpoint first
  const healthResponse = maybeHealth(req, 'fetch-fred-data')
  if (healthResponse) return healthResponse

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const fredApiKey = Deno.env.get('FRED_API_KEY')
    if (!fredApiKey) {
      throw new Error('FRED_API_KEY not configured')
    }

    // Get the authorization header to check for user context
    const authHeader = req.headers.get('Authorization')
    let userId = null
    
    if (authHeader) {
      const { data: { user } } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''))
      userId = user?.id
    }

    const { operation, indicators, region = 'US' } = await req.json()
    const startTime = Date.now()

    switch (operation) {
      case 'fetch_indicators': {
        const indicatorsToFetch = indicators || Object.keys(ECONOMIC_INDICATORS)
        const results = []

        for (const indicatorType of indicatorsToFetch) {
          const seriesId = ECONOMIC_INDICATORS[indicatorType as keyof typeof ECONOMIC_INDICATORS]
          if (!seriesId) continue

          try {
            const observations = await fetchFredData(seriesId, fredApiKey)
            
            // Process and clean the data
            const dataPoints = observations
              .filter((obs: any) => obs.value && obs.value !== '.')
              .map((obs: any) => ({
                date: obs.date,
                value: parseFloat(obs.value)
              }))
              .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())

            if (dataPoints.length > 0) {
              // Store in insights table
              const { data: existingInsight } = await supabaseClient
                .from('insights')
                .select('id')
                .eq('series_id', seriesId)
                .eq('region', region)
                .single()

              const insightData = {
                title: `${indicatorType} - ${region}`,
                content: `Economic indicator data for ${indicatorType} in ${region} region. Latest value: ${dataPoints[dataPoints.length - 1]?.value}`,
                data_source: 'FRED',
                series_id: seriesId,
                data_points: dataPoints,
                indicator_type: indicatorType,
                region: region,
                is_published: true,
                chart_config: {
                  type: 'line',
                  title: `${indicatorType} Trend`,
                  yAxisLabel: getYAxisLabel(indicatorType)
                }
              }

              if (existingInsight) {
                await supabaseClient
                  .from('insights')
                  .update(insightData)
                  .eq('id', existingInsight.id)
              } else {
                await supabaseClient
                  .from('insights')
                  .insert(insightData)
              }

              results.push({
                indicator: indicatorType,
                seriesId,
                dataPoints: dataPoints.length,
                latestValue: dataPoints[dataPoints.length - 1]?.value,
                latestDate: dataPoints[dataPoints.length - 1]?.date
              })
            }
          } catch (error) {
            console.error(`Error fetching ${indicatorType}:`, error)
            await logIntegrationEvent(supabaseClient, 'fetch_indicator', 'failed', {
              request: { indicatorType, seriesId },
              error: error.message,
              executionTime: Date.now() - startTime
            }, userId)
          }
        }

        await logIntegrationEvent(supabaseClient, 'fetch_indicators', 'success', {
          request: { indicators: indicatorsToFetch, region },
          response: { results },
          executionTime: Date.now() - startTime
        }, userId)

        return json({ 
          success: true, 
          results,
          message: `Fetched ${results.length} indicators successfully`
        })
      }

      case 'get_available_indicators': {
        const availableIndicators = Object.entries(ECONOMIC_INDICATORS).map(([type, seriesId]) => ({
          type,
          seriesId,
          description: getIndicatorDescription(type)
        }))

        return json({
          success: true,
          indicators: availableIndicators
        })
      }

      default:
        throw new Error(`Unknown operation: ${operation}`)
    }

  } catch (error) {
    logError('fetch-fred-data', error)
    
    return json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
})

function getYAxisLabel(indicatorType: string): string {
  switch (indicatorType) {
    case 'GDP': return 'Billions of Dollars'
    case 'CPI': return 'Index 1982-84=100'
    case 'GSCPI': return 'Standard Deviations'
    case 'yield_curve': return 'Percent'
    case 'unemployment': return 'Percent'
    case 'industrial_production': return 'Index 2017=100'
    case 'consumer_sentiment': return 'Index 1966:Q1=100'
    default: return 'Value'
  }
}

function getIndicatorDescription(indicatorType: string): string {
  switch (indicatorType) {
    case 'GDP': return 'Gross Domestic Product'
    case 'CPI': return 'Consumer Price Index for All Urban Consumers'
    case 'GSCPI': return 'Global Supply Chain Pressure Index'
    case 'yield_curve': return '10-Year Treasury Minus 2-Year Treasury Yield'
    case 'unemployment': return 'Unemployment Rate'
    case 'industrial_production': return 'Industrial Production Index'
    case 'consumer_sentiment': return 'University of Michigan Consumer Sentiment'
    default: return indicatorType
  }
}